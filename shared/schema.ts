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
