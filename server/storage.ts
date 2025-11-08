import { type User, type InsertUser, type ChainBalance, type Proposal, type NetworkNode } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCachedBalances(): ChainBalance[] | null;
  setCachedBalances(balances: ChainBalance[]): void;
  
  getCachedProposals(): Proposal[] | null;
  setCachedProposals(proposals: Proposal[]): void;
  
  getCachedNetworkNodes(): NetworkNode[] | null;
  setCachedNetworkNodes(nodes: NetworkNode[]): void;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cachedBalances: ChainBalance[] | null = null;
  private cachedProposals: Proposal[] | null = null;
  private cachedNetworkNodes: NetworkNode[] | null = null;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  getCachedBalances(): ChainBalance[] | null {
    return this.cachedBalances;
  }

  setCachedBalances(balances: ChainBalance[]): void {
    this.cachedBalances = balances;
  }

  getCachedProposals(): Proposal[] | null {
    return this.cachedProposals;
  }

  setCachedProposals(proposals: Proposal[]): void {
    this.cachedProposals = proposals;
  }

  getCachedNetworkNodes(): NetworkNode[] | null {
    return this.cachedNetworkNodes;
  }

  setCachedNetworkNodes(nodes: NetworkNode[]): void {
    this.cachedNetworkNodes = nodes;
  }
}

export const storage = new MemStorage();
