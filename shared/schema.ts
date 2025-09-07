import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("investor"), // investor, creator, admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  walletAddress: text("wallet_address"),
  balance: decimal("balance").default("0.00"),
  lavaCoins: integer("lava_coins").default(0),
  isApproved: boolean("is_approved").default(false), // for creators
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description"),
  category: text("category").notNull(),
  goalAmount: decimal("goal_amount").notNull(),
  currentAmount: decimal("current_amount").default("0.00"),
  imageUrl: text("image_url"),
  isApproved: boolean("is_approved").default(false),
  isActive: boolean("is_active").default(true),
  endDate: timestamp("end_date").notNull(),
  milestones: jsonb("milestones"), // Array of milestone objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").notNull().references(() => users.id),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  amount: decimal("amount").notNull(),
  transactionHash: text("transaction_hash"), // Simulated blockchain hash
  status: text("status").notNull().default("pending"), // pending, completed, failed
  type: text("type").notNull().default("investment"), // investment, withdrawal, reward
  blockNumber: integer("block_number"), // Simulated block number
  gasUsed: decimal("gas_used"), // Simulated gas fee
  createdAt: timestamp("created_at").defaultNow(),
});

// Creator approval requests
export const creatorRequests = pgTable("creator_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name"),
  businessDescription: text("business_description"),
  website: text("website"),
  experience: text("experience"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminNote: text("admin_note"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet connections (simulated)
export const walletConnections = pgTable("wallet_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletType: text("wallet_type").notNull(), // metamask, rainbow, etc.
  address: text("address").notNull(),
  isActive: boolean("is_active").default(true),
  connectedAt: timestamp("connected_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  transactions: many(transactions),
  creatorRequests: many(creatorRequests),
  sessions: many(sessions),
  walletConnections: many(walletConnections),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.creatorId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  investor: one(users, {
    fields: [transactions.investorId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [transactions.projectId],
    references: [projects.id],
  }),
}));

export const creatorRequestsRelations = relations(creatorRequests, ({ one }) => ({
  user: one(users, {
    fields: [creatorRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [creatorRequests.reviewedBy],
    references: [users.id],
  }),
}));

// Schemas for validation
// Separate schemas for security
export const signupSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
  isApproved: true,
});

export const insertProjectSchema = createInsertSchema(projects, {
  endDate: z.coerce.date().refine(
    (date) => date.getTime() > Date.now(),
    "End date must be in the future"
  ), // Coerce string to Date and ensure future date
  goalAmount: z.string().regex(/^\d+(?:\.\d{1,2})?$/, "Invalid currency format").refine(
    (val) => parseFloat(val) > 0, 
    "Amount must be greater than 0"
  ),
}).pick({
  title: true,
  description: true,
  fullDescription: true,
  category: true,
  goalAmount: true,
  imageUrl: true,
  endDate: true,
  milestones: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  projectId: true,
  amount: true,
  type: true,
});

export const insertCreatorRequestSchema = createInsertSchema(creatorRequests).pick({
  businessName: true,
  businessDescription: true,
  website: true,
  experience: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertCreatorRequest = z.infer<typeof insertCreatorRequestSchema>;
export type CreatorRequest = typeof creatorRequests.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type WalletConnection = typeof walletConnections.$inferSelect;
