import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface ChainBalance {
  chainId: string;
  chainName: string;
  balance: string;
  usdValue: string;
  lastUpdated: string;
  status: "online" | "syncing" | "offline";
  blockHeight?: number;
}

export interface Proposal {
  id: number;
  title: string;
  proposer: string;
  status: "active" | "passed" | "rejected";
  ayeVotes: number;
  nayVotes: number;
  deadline: string;
  description?: string;
  track?: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  blockHeight: number;
  uptime: number;
  status: "online" | "syncing" | "offline";
  rpcEndpoint: string;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Community & Governance Tables
export const governanceVotes = pgTable("governance_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referendumId: integer("referendum_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  vote: text("vote").notNull(), // "aye" | "nay" | "abstain"
  conviction: integer("conviction").default(0), // 0-6 for vote locking multiplier
  balance: text("balance"), // voting power in Planck
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referendumId: integer("referendum_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const userXp = pgTable("user_xp", {
  walletAddress: text("wallet_address").primaryKey(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  votesCount: integer("votes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Insert schemas with validation
export const insertGovernanceVoteSchema = createInsertSchema(governanceVotes).omit({
  id: true,
  timestamp: true,
}).extend({
  vote: z.enum(["aye", "nay", "abstain"]),
  conviction: z.number().min(0).max(6).optional(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  timestamp: true,
}).extend({
  content: z.string().min(1).max(2000),
});

export const insertUserXpSchema = createInsertSchema(userXp).omit({
  lastUpdated: true,
});

// Types for TypeScript
export type InsertGovernanceVote = z.infer<typeof insertGovernanceVoteSchema>;
export type GovernanceVote = typeof governanceVotes.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertUserXp = z.infer<typeof insertUserXpSchema>;
export type UserXp = typeof userXp.$inferSelect;

// Staking data interfaces (not persisted, fetched from chain)
export interface StakingInfo {
  walletAddress: string;
  bondedBalance: string;
  freeBalance: string;
  activeStake: string;
  nominations: string[]; // validator addresses
  rewardsPending: string;
  rewardsTotal: string;
  unlocking: {
    value: string;
    era: number;
  }[];
  status: "online" | "loading" | "error";
  lastUpdated: string;
}
