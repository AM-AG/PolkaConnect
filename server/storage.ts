import { 
  type User, 
  type InsertUser, 
  type ChainBalance, 
  type Proposal, 
  type NetworkNode,
  type GovernanceVote,
  type InsertGovernanceVote,
  type Comment,
  type InsertComment,
  type UserXp,
  type InsertUserXp,
  type TransactionHistory,
  type InsertTransactionHistory
} from "@shared/schema";
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
  
  // Governance votes
  createVote(vote: InsertGovernanceVote): Promise<GovernanceVote>;
  getVotesByReferendum(referendumId: number): Promise<GovernanceVote[]>;
  getVotesByWallet(walletAddress: string): Promise<GovernanceVote[]>;
  getUserVoteForReferendum(referendumId: number, walletAddress: string): Promise<GovernanceVote | undefined>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByReferendum(referendumId: number): Promise<Comment[]>;
  getCommentsByWallet(walletAddress: string): Promise<Comment[]>;
  
  // User XP
  getUserXp(walletAddress: string): Promise<UserXp | undefined>;
  createOrUpdateUserXp(xpData: InsertUserXp): Promise<UserXp>;
  incrementVoteCount(walletAddress: string, xpGain: number): Promise<UserXp>;
  incrementCommentCount(walletAddress: string, xpGain: number): Promise<UserXp>;
  
  // Transaction History
  createTransaction(tx: InsertTransactionHistory): Promise<TransactionHistory>;
  getTransactionsByWallet(walletAddress: string, limit?: number): Promise<TransactionHistory[]>;
  getTransactionByHash(txHash: string): Promise<TransactionHistory | undefined>;
  updateTransactionStatus(id: string, status: "pending" | "completed" | "failed"): Promise<TransactionHistory | undefined>;
  
  // Community Stats
  getTotalTransactionCount(): Promise<number>;
  getUniqueWalletCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cachedBalances: ChainBalance[] | null = null;
  private cachedProposals: Proposal[] | null = null;
  private cachedNetworkNodes: NetworkNode[] | null = null;
  private governanceVotes: Map<string, GovernanceVote>;
  private comments: Map<string, Comment>;
  private userXpMap: Map<string, UserXp>;
  private transactionHistoryMap: Map<string, TransactionHistory>;

  constructor() {
    this.users = new Map();
    this.governanceVotes = new Map();
    this.comments = new Map();
    this.userXpMap = new Map();
    this.transactionHistoryMap = new Map();
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

  // Governance votes
  async createVote(insertVote: InsertGovernanceVote): Promise<GovernanceVote> {
    const id = randomUUID();
    const vote: GovernanceVote = {
      ...insertVote,
      id,
      timestamp: new Date(),
      conviction: insertVote.conviction ?? 0,
      balance: insertVote.balance ?? null,
    };
    this.governanceVotes.set(id, vote);
    return vote;
  }

  async getVotesByReferendum(referendumId: number): Promise<GovernanceVote[]> {
    return Array.from(this.governanceVotes.values()).filter(
      (vote) => vote.referendumId === referendumId
    );
  }

  async getVotesByWallet(walletAddress: string): Promise<GovernanceVote[]> {
    return Array.from(this.governanceVotes.values()).filter(
      (vote) => vote.walletAddress === walletAddress
    );
  }

  async getUserVoteForReferendum(
    referendumId: number,
    walletAddress: string
  ): Promise<GovernanceVote | undefined> {
    return Array.from(this.governanceVotes.values()).find(
      (vote) =>
        vote.referendumId === referendumId &&
        vote.walletAddress === walletAddress
    );
  }

  // Comments
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      timestamp: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByReferendum(referendumId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.referendumId === referendumId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getCommentsByWallet(walletAddress: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.walletAddress === walletAddress
    );
  }

  // User XP
  async getUserXp(walletAddress: string): Promise<UserXp | undefined> {
    return this.userXpMap.get(walletAddress);
  }

  async createOrUpdateUserXp(xpData: InsertUserXp): Promise<UserXp> {
    const existing = this.userXpMap.get(xpData.walletAddress);
    const userXp: UserXp = {
      ...xpData,
      xp: xpData.xp ?? existing?.xp ?? 0,
      lastUpdated: new Date(),
      level: existing?.level ?? xpData.level ?? 1,
      votesCount: existing?.votesCount ?? xpData.votesCount ?? 0,
      commentsCount: existing?.commentsCount ?? xpData.commentsCount ?? 0,
    };
    this.userXpMap.set(xpData.walletAddress, userXp);
    return userXp;
  }

  async incrementVoteCount(walletAddress: string, xpGain: number): Promise<UserXp> {
    const existing = this.userXpMap.get(walletAddress) || {
      walletAddress,
      xp: 0,
      level: 1,
      votesCount: 0,
      commentsCount: 0,
      lastUpdated: new Date(),
    };

    const newXp = existing.xp + xpGain;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updated: UserXp = {
      ...existing,
      xp: newXp,
      level: newLevel,
      votesCount: existing.votesCount + 1,
      lastUpdated: new Date(),
    };

    this.userXpMap.set(walletAddress, updated);
    return updated;
  }

  async incrementCommentCount(walletAddress: string, xpGain: number): Promise<UserXp> {
    const existing = this.userXpMap.get(walletAddress) || {
      walletAddress,
      xp: 0,
      level: 1,
      votesCount: 0,
      commentsCount: 0,
      lastUpdated: new Date(),
    };

    const newXp = existing.xp + xpGain;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updated: UserXp = {
      ...existing,
      xp: newXp,
      level: newLevel,
      commentsCount: existing.commentsCount + 1,
      lastUpdated: new Date(),
    };

    this.userXpMap.set(walletAddress, updated);
    return updated;
  }

  // Transaction History
  async createTransaction(insertTx: InsertTransactionHistory): Promise<TransactionHistory> {
    const id = randomUUID();
    const tx: TransactionHistory = {
      ...insertTx,
      id,
      timestamp: new Date(),
      fromChain: insertTx.fromChain ?? null,
      toChain: insertTx.toChain ?? null,
      amount: insertTx.amount ?? null,
      asset: insertTx.asset ?? null,
      metadata: insertTx.metadata ?? null,
    };
    this.transactionHistoryMap.set(id, tx);
    return tx;
  }

  async getTransactionsByWallet(walletAddress: string, limit = 50): Promise<TransactionHistory[]> {
    return Array.from(this.transactionHistoryMap.values())
      .filter((tx) => tx.walletAddress === walletAddress)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getTransactionByHash(txHash: string): Promise<TransactionHistory | undefined> {
    return Array.from(this.transactionHistoryMap.values()).find(
      (tx) => tx.txHash === txHash
    );
  }

  async updateTransactionStatus(
    id: string,
    status: "pending" | "completed" | "failed"
  ): Promise<TransactionHistory | undefined> {
    const tx = this.transactionHistoryMap.get(id);
    if (tx) {
      tx.status = status;
      this.transactionHistoryMap.set(id, tx);
    }
    return tx;
  }

  async getTotalTransactionCount(): Promise<number> {
    return this.transactionHistoryMap.size;
  }

  async getUniqueWalletCount(): Promise<number> {
    const uniqueWallets = new Set<string>();
    for (const tx of this.transactionHistoryMap.values()) {
      uniqueWallets.add(tx.walletAddress);
    }
    return uniqueWallets.size;
  }
}

export const storage = new MemStorage();
