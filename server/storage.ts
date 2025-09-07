import { type User, type InsertUser, type Project, type InsertProject, type Transaction, type InsertTransaction, type CreatorRequest, type InsertCreatorRequest, type Session, type WalletConnection } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  banUser(id: string): Promise<void>;
  
  // Session operations
  createSession(userId: string, token: string, expiresAt: Date): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  
  // Project operations
  createProject(project: InsertProject & { creatorId: string }): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsByCreator(creatorId: string): Promise<Project[]>;
  getApprovedProjects(): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  approveProject(id: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction & { investorId: string }): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransactionsByProject(projectId: string): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  
  // Creator request operations
  createCreatorRequest(request: InsertCreatorRequest & { userId: string }): Promise<CreatorRequest>;
  getCreatorRequest(id: string): Promise<CreatorRequest | undefined>;
  getCreatorRequestsByStatus(status: string): Promise<CreatorRequest[]>;
  updateCreatorRequest(id: string, updates: Partial<CreatorRequest>): Promise<CreatorRequest | undefined>;
  
  // Wallet operations
  createWalletConnection(userId: string, walletType: string, address: string): Promise<WalletConnection>;
  getWalletsByUser(userId: string): Promise<WalletConnection[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private transactions: Map<string, Transaction>;
  private creatorRequests: Map<string, CreatorRequest>;
  private sessions: Map<string, Session>;
  private walletConnections: Map<string, WalletConnection>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.transactions = new Map();
    this.creatorRequests = new Map();
    this.sessions = new Map();
    this.walletConnections = new Map();
    
    // Create default admin user
    this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      username: "admin",
      email: "admin@crowdchain.com",
      password: "$2b$10$hashedPasswordExample", // In real app, hash this
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      profileImage: null,
      walletAddress: "0x742d35Cc6C8f000000000000000000000000000",
      balance: "10000.00",
      lavaCoins: 50000,
      isApproved: true,
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminId, admin);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "investor",
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImage: null,
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: "1000.00", // Starting balance
      lavaCoins: 100, // Starting lava coins
      isApproved: insertUser.isApproved ?? (insertUser.role === "investor"), // Use provided value or auto-approve investors
      isBanned: false,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async banUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isBanned = true;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  // Session operations
  async createSession(userId: string, token: string, expiresAt: Date): Promise<Session> {
    const session: Session = {
      id: randomUUID(),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(token, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const session = this.sessions.get(token);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(token);
    }
    return undefined;
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  // Project operations
  async createProject(project: InsertProject & { creatorId: string }): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const newProject: Project = {
      ...project,
      id,
      fullDescription: project.fullDescription || null,
      imageUrl: project.imageUrl || null,
      milestones: project.milestones || null,
      currentAmount: "0.00",
      isApproved: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByCreator(creatorId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.creatorId === creatorId);
  }

  async getApprovedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.isApproved && p.isActive);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async approveProject(id: string): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.isApproved = true;
      project.updatedAt = new Date();
      this.projects.set(id, project);
    }
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction & { investorId: string }): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      type: transaction.type || "investment",
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: "pending",
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      gasUsed: (Math.random() * 0.01 + 0.001).toFixed(6),
      createdAt: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.investorId === userId);
  }

  async getTransactionsByProject(projectId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.projectId === projectId);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Creator request operations
  async createCreatorRequest(request: InsertCreatorRequest & { userId: string }): Promise<CreatorRequest> {
    const id = randomUUID();
    const newRequest: CreatorRequest = {
      ...request,
      id,
      businessName: request.businessName || null,
      businessDescription: request.businessDescription || null,
      website: request.website || null,
      experience: request.experience || null,
      status: "pending",
      adminNote: null,
      reviewedBy: null,
      createdAt: new Date(),
      reviewedAt: null,
    };
    this.creatorRequests.set(id, newRequest);
    return newRequest;
  }

  async getCreatorRequest(id: string): Promise<CreatorRequest | undefined> {
    return this.creatorRequests.get(id);
  }

  async getCreatorRequestsByStatus(status: string): Promise<CreatorRequest[]> {
    return Array.from(this.creatorRequests.values()).filter(r => r.status === status);
  }

  async updateCreatorRequest(id: string, updates: Partial<CreatorRequest>): Promise<CreatorRequest | undefined> {
    const request = this.creatorRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    if (updates.status) {
      updatedRequest.reviewedAt = new Date();
    }
    this.creatorRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Wallet operations
  async createWalletConnection(userId: string, walletType: string, address: string): Promise<WalletConnection> {
    const id = randomUUID();
    const connection: WalletConnection = {
      id,
      userId,
      walletType,
      address,
      isActive: true,
      connectedAt: new Date(),
    };
    this.walletConnections.set(id, connection);
    return connection;
  }

  async getWalletsByUser(userId: string): Promise<WalletConnection[]> {
    return Array.from(this.walletConnections.values()).filter(w => w.userId === userId);
  }
}

export const storage = new MemStorage();
