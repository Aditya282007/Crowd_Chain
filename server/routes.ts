import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { signupSchema, insertUserSchema, insertProjectSchema, insertTransactionSchema, insertCreatorRequestSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Enhanced request type with user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    username: string;
    email: string;
  };
}

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "crowdchain-secret-key";

// WebSocket clients for real-time updates
const wsClients = new Set<WebSocket>();

// Broadcast real-time updates
function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Authentication middleware
async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    
    if (!user || user.isBanned) {
      return res.status(401).json({ error: "Invalid token or user banned" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Role-based authorization middleware
function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable JSON parsing
  app.use(express.json());

  // Initialize passport
  app.use(passport.initialize());

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/google/callback`
        : "http://localhost:3000/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Google ID or email
        let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (!user) {
          // Create new user from Google profile
          const userData = {
            username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'user',
            email: profile.emails?.[0]?.value || '',
            password: await bcrypt.hash(randomUUID(), 10), // Random password since they'll use OAuth
            role: "investor", // Default role for Google signups
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            isApproved: true, // Auto-approve Google OAuth users as investors
          };
          
          user = await storage.createUser(userData);
        }
        
        return done(null, user as any);
      } catch (error) {
        return done(error as any, null);
      }
    }));
  }

  // Create default admin user on startup
  async function createDefaultAdmin() {
    try {
      const existingAdmin = await storage.getUserByEmail("admin@gmail.com");
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin@123", 10);
        await storage.createUser({
          username: "admin",
          email: "admin@gmail.com",
          password: hashedPassword,
          role: "admin",
          firstName: "System",
          lastName: "Administrator",
          isApproved: true,
        });
        console.log("Default admin user created: admin@gmail.com / admin@123");
      }
    } catch (error) {
      console.error("Failed to create default admin:", error);
    }
  }
  
  // Create admin on startup
  await createDefaultAdmin();

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Validate and sanitize role (security: prevent role tampering)
      const allowedRoles = ["investor", "creator"];
      const userRole = allowedRoles.includes(userData.role) ? userData.role : "investor";
      
      // Create user (creators require admin approval, investors auto-approved)
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: userRole,
        isApproved: userRole === "investor" ? true : false,
      });

      // If creator, automatically create a creator request for admin approval
      if (userRole === "creator") {
        await storage.createCreatorRequest({
          userId: user.id,
          businessName: userData.firstName + " " + userData.lastName + " Business",
          businessDescription: "New creator account - pending review",
          website: "",
          experience: "To be filled by creator",
        });
        
        // Broadcast new creator request
        broadcastUpdate("CREATOR_REQUEST_SUBMITTED", { userId: user.id });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await storage.createSession(user.id, token, expiresAt);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isApproved: user.isApproved,
        },
        token,
      });

      // Broadcast user registration
      broadcastUpdate("USER_REGISTERED", { userId: user.id, role: user.role });
    } catch (error) {
      res.status(400).json({ error: "Invalid input data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.isBanned) {
        return res.status(401).json({ error: "Invalid credentials or account banned" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await storage.createSession(user.id, token, expiresAt);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isApproved: user.isApproved,
          walletAddress: user.walletAddress,
          balance: user.balance,
          lavaCoins: user.lavaCoins,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        await storage.deleteSession(token);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isApproved: user.isApproved,
        walletAddress: user.walletAddress,
        balance: user.balance,
        lavaCoins: user.lavaCoins,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Google OAuth routes
  app.get("/api/auth/google", (req, res, next) => {
    // Store the intended redirect URL in session or state parameter
    const redirectUrl = req.query.redirect || '/dashboard';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: encodeURIComponent(redirectUrl.toString())
    })(req, res, next);
  });

  app.get("/api/auth/google/callback", 
    passport.authenticate('google', { session: false }),
    async (req: any, res) => {
      try {
        const user = req.user;
        if (!user) {
          return res.redirect('/login?error=oauth_failed');
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
        
        // Create session
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await storage.createSession(user.id, token, expiresAt);

        // Redirect to frontend with token
        const redirectUrl = req.query.state ? decodeURIComponent(req.query.state) : '/dashboard';
        res.redirect(`/${redirectUrl}?token=${token}`);

        // Broadcast user login
        broadcastUpdate("USER_LOGGED_IN", { userId: user.id, method: "google_oauth" });
      } catch (error) {
        res.redirect('/login?error=oauth_error');
      }
    }
  );

  // Creator request routes
  app.post("/api/creator-requests", authenticate, requireRole("investor"), async (req: AuthenticatedRequest, res) => {
    try {
      const requestData = insertCreatorRequestSchema.parse(req.body);
      const creatorRequest = await storage.createCreatorRequest({
        ...requestData,
        userId: req.user!.id,
      });

      res.json(creatorRequest);

      // Broadcast new creator request
      broadcastUpdate("CREATOR_REQUEST_SUBMITTED", { requestId: creatorRequest.id, userId: req.user!.id });
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Admin routes for managing creator requests
  app.get("/api/admin/creator-requests", authenticate, requireRole("admin"), async (req, res) => {
    try {
      const requests = await storage.getCreatorRequestsByStatus("pending");
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          const user = await storage.getUser(request.userId);
          return { ...request, user };
        })
      );
      res.json(requestsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get creator requests" });
    }
  });

  app.post("/api/admin/creator-requests/:id/approve", authenticate, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { adminNote } = req.body;

      const request = await storage.updateCreatorRequest(id, {
        status: "approved",
        adminNote,
        reviewedBy: req.user!.id,
      });

      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      // Update user role to creator
      await storage.updateUser(request.userId, {
        role: "creator",
        isApproved: true,
      });

      res.json(request);

      // Broadcast approval
      broadcastUpdate("CREATOR_REQUEST_APPROVED", { requestId: id, userId: request.userId });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve request" });
    }
  });

  app.post("/api/admin/creator-requests/:id/reject", authenticate, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { adminNote } = req.body;

      const request = await storage.updateCreatorRequest(id, {
        status: "rejected",
        adminNote,
        reviewedBy: req.user!.id,
      });

      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      res.json(request);

      // Broadcast rejection
      broadcastUpdate("CREATOR_REQUEST_REJECTED", { requestId: id, userId: request.userId });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject request" });
    }
  });

  // Project routes
  app.post("/api/projects", authenticate, requireRole("creator"), async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user?.isApproved) {
        return res.status(403).json({ error: "Creator not approved" });
      }

      console.log("Project creation request body:", JSON.stringify(req.body, null, 2));
      const projectData = insertProjectSchema.parse(req.body);
      console.log("Parsed project data:", JSON.stringify(projectData, null, 2));
      
      const project = await storage.createProject({
        ...projectData,
        creatorId: req.user!.id,
      });

      res.json(project);

      // Broadcast new project
      broadcastUpdate("PROJECT_CREATED", { projectId: project.id, creatorId: req.user!.id });
    } catch (error) {
      console.error("Project creation error:", error);
      
      // Handle Zod validation errors specifically
      if (error && typeof error === 'object' && 'issues' in error) {
        return res.status(400).json({ 
          error: "Validation failed", 
          issues: (error as any).issues 
        });
      }
      
      // Handle other errors
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        return res.status(500).json({ error: "Server error during project creation" });
      }
      
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getApprovedProjects();
      const projectsWithCreators = await Promise.all(
        projects.map(async (project) => {
          const creator = await storage.getUser(project.creatorId);
          return { 
            ...project, 
            creator: {
              username: creator?.username,
              firstName: creator?.firstName,
              lastName: creator?.lastName,
            },
            progress: project.goalAmount ? Math.round((parseFloat(project.currentAmount || "0") / parseFloat(project.goalAmount)) * 100) : 0
          };
        })
      );
      res.json(projectsWithCreators);
    } catch (error) {
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const creator = await storage.getUser(project.creatorId);
      const transactions = await storage.getTransactionsByProject(project.id);
      
      const progress = project.goalAmount ? Math.round((parseFloat(project.currentAmount || "0") / parseFloat(project.goalAmount)) * 100) : 0;
      const backers = transactions.filter(t => t.status === "completed").length;
      const daysLeft = Math.max(0, Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      res.json({
        ...project,
        creator: {
          username: creator?.username,
          firstName: creator?.firstName,
          lastName: creator?.lastName,
        },
        progress,
        backers,
        daysLeft,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  // Investment/Transaction routes
  app.post("/api/projects/:id/invest", authenticate, requireRole("investor"), async (req: AuthenticatedRequest, res) => {
    try {
      const { amount } = req.body;
      const projectId = req.params.id;

      const project = await storage.getProject(projectId);
      if (!project || !project.isApproved) {
        return res.status(404).json({ error: "Project not found or not approved" });
      }

      // Check if investment would exceed the goal
      const currentAmount = parseFloat(project.currentAmount || "0");
      const goalAmount = parseFloat(project.goalAmount || "0");
      const investmentAmount = parseFloat(amount);
      const remainingAmount = goalAmount - currentAmount;

      if (investmentAmount > remainingAmount) {
        return res.status(400).json({ error: `Investment amount exceeds remaining goal. Maximum investment: ${remainingAmount.toFixed(2)} LavaCoins` });
      }

      if (remainingAmount <= 0) {
        return res.status(400).json({ error: "Project funding goal has already been reached" });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user || parseFloat(user.balance || "0") < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient LavaCoin balance" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        projectId,
        amount,
        type: "investment",
        investorId: req.user!.id,
      });

      // Simulate blockchain processing (in real app, this would be async)
      setTimeout(async () => {
        // Update transaction status
        await storage.updateTransaction(transaction.id, { status: "completed" });
        
        // Update user balance
        const newBalance = (parseFloat(user.balance || "0") - parseFloat(amount)).toFixed(2);
        await storage.updateUser(req.user!.id, { balance: newBalance });
        
        // Update project current amount
        const newCurrentAmount = (parseFloat(project.currentAmount || "0") + parseFloat(amount)).toFixed(2);
        await storage.updateProject(projectId, { currentAmount: newCurrentAmount });

        // Broadcast transaction completion
        broadcastUpdate("INVESTMENT_COMPLETED", {
          transactionId: transaction.id,
          projectId,
          investorId: req.user!.id,
          amount,
        });
      }, 2000);

      // Return transaction receipt immediately
      res.json({
        transaction: {
          ...transaction,
          receipt: {
            transactionHash: transaction.transactionHash,
            blockNumber: transaction.blockNumber,
            gasUsed: transaction.gasUsed,
            timestamp: transaction.createdAt,
          }
        }
      });

      // Broadcast pending investment
      broadcastUpdate("INVESTMENT_PENDING", {
        transactionId: transaction.id,
        projectId,
        investorId: req.user!.id,
        amount,
      });
    } catch (error) {
      res.status(500).json({ error: "Investment failed" });
    }
  });

  // Wallet simulation routes
  app.post("/api/wallet/connect", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { walletType } = req.body;
      const address = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      const connection = await storage.createWalletConnection(req.user!.id, walletType, address);
      
      // Update user wallet address
      await storage.updateUser(req.user!.id, { walletAddress: address });

      res.json({ connection, address });

      // Broadcast wallet connection
      broadcastUpdate("WALLET_CONNECTED", { userId: req.user!.id, walletType, address });
    } catch (error) {
      res.status(500).json({ error: "Wallet connection failed" });
    }
  });

  // Admin project management
  app.get("/api/admin/projects", authenticate, requireRole("admin"), async (req, res) => {
    try {
      const allProjects = await storage.getProjects();
      const pendingProjects = allProjects.filter(p => !p.isApproved);
      const projectsWithCreators = await Promise.all(
        pendingProjects.map(async (project) => {
          const creator = await storage.getUser(project.creatorId);
          return { 
            ...project, 
            creator: {
              username: creator?.username,
              firstName: creator?.firstName,
              lastName: creator?.lastName,
            }
          };
        })
      );
      res.json(projectsWithCreators);
    } catch (error) {
      res.status(500).json({ error: "Failed to get pending projects" });
    }
  });

  app.post("/api/admin/projects/:id/approve", authenticate, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { adminNote } = req.body;

      const project = await storage.updateProject(id, {
        isApproved: true,
        updatedAt: new Date(),
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);

      // Broadcast project approval
      broadcastUpdate("PROJECT_APPROVED", { projectId: id, approvedBy: req.user!.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve project" });
    }
  });

  app.post("/api/admin/projects/:id/reject", authenticate, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { adminNote } = req.body;

      // For now, we'll mark as inactive rather than delete
      const project = await storage.updateProject(id, {
        isActive: false,
        updatedAt: new Date(),
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);

      // Broadcast project rejection
      broadcastUpdate("PROJECT_REJECTED", { projectId: id, rejectedBy: req.user!.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject project" });
    }
  });

  // Admin user management
  app.get("/api/admin/users", authenticate, requireRole("admin"), async (req, res) => {
    try {
      const users = await storage.getUsersByRole("investor");
      const creators = await storage.getUsersByRole("creator");
      res.json({ investors: users, creators });
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.post("/api/admin/users/:id/ban", authenticate, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      await storage.banUser(req.params.id);
      res.json({ message: "User banned successfully" });

      // Broadcast user ban
      broadcastUpdate("USER_BANNED", { userId: req.params.id, bannedBy: req.user!.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to ban user" });
    }
  });

  // User dashboard data
  app.get("/api/user/dashboard", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      const transactions = await storage.getTransactionsByUser(req.user!.id);
      
      let projects: any[] = [];
      if (user?.role === "creator") {
        projects = await storage.getProjectsByCreator(req.user!.id);
      }

      const completedTransactions = transactions.filter(t => t.status === "completed");
      const totalInvested = completedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      res.json({
        user,
        transactions: completedTransactions,
        projects,
        stats: {
          totalInvested: totalInvested.toFixed(2),
          activeInvestments: completedTransactions.length,
          portfolioValue: (totalInvested * 1.15).toFixed(2), // Simulate 15% growth
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    wsClients.add(ws);
    
    ws.on('close', () => {
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));
  });

  return httpServer;
}
