import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchAllBalances, getNetworkStatus } from "./services/polkadot";
import { fetchReferenda, getGovernanceSummary, getGovernanceParticipation } from "./services/governance";
import { getStakingInfo, getStakingRewards, getStakingAnalytics } from "./services/staking";
import { getXcmActivity } from "./services/network";
import { insertGovernanceVoteSchema, insertCommentSchema, insertTransactionHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Assets/Balances endpoint
  app.get("/api/assets/:address", async (req, res) => {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    try {
      console.log(`Fetching balances for address: ${address}`);
      const balances = await fetchAllBalances(address);
      
      // Cache the results
      storage.setCachedBalances(balances);
      
      res.json({ 
        success: true, 
        data: balances,
        cached: false 
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      
      // Try to return cached data on error
      const cached = storage.getCachedBalances();
      if (cached) {
        return res.json({ 
          success: true, 
          data: cached,
          cached: true,
          error: "Using cached data due to connection error"
        });
      }
      
      res.status(500).json({ 
        error: "Failed to fetch balances and no cache available" 
      });
    }
  });

  // Governance endpoint
  app.get("/api/governance", async (req, res) => {
    try {
      console.log("Fetching governance proposals");
      const proposals = await fetchReferenda();
      
      // Cache the results
      storage.setCachedProposals(proposals);
      
      res.json({ 
        success: true, 
        data: proposals,
        cached: false 
      });
    } catch (error) {
      console.error("Error fetching proposals:", error);
      
      // Try to return cached data on error
      const cached = storage.getCachedProposals();
      if (cached) {
        return res.json({ 
          success: true, 
          data: cached,
          cached: true,
          error: "Using cached data due to connection error"
        });
      }
      
      res.status(500).json({ 
        error: "Failed to fetch proposals and no cache available" 
      });
    }
  });

  // Network status endpoint
  app.get("/api/network", async (req, res) => {
    try {
      console.log("Fetching network status");
      const nodes = await getNetworkStatus();
      
      // Cache the results
      storage.setCachedNetworkNodes(nodes);
      
      res.json({ 
        success: true, 
        data: nodes,
        cached: false 
      });
    } catch (error) {
      console.error("Error fetching network status:", error);
      
      // Try to return cached data on error
      const cached = storage.getCachedNetworkNodes();
      if (cached) {
        return res.json({ 
          success: true, 
          data: cached,
          cached: true,
          error: "Using cached data due to connection error"
        });
      }
      
      res.status(500).json({ 
        error: "Failed to fetch network status and no cache available" 
      });
    }
  });

  // XCM Activity endpoint
  app.get("/api/network/xcm", async (req, res) => {
    try {
      console.log("Fetching XCM activity");
      const activity = await getXcmActivity();
      
      // Cache the results
      storage.setCachedXcmActivity(activity);
      
      res.json({ 
        success: true, 
        data: activity,
        cached: false 
      });
    } catch (error) {
      console.error("Error fetching XCM activity:", error);
      
      // Try to return cached data on error
      const cached = storage.getCachedXcmActivity();
      if (cached) {
        return res.json({ 
          success: true, 
          data: cached,
          cached: true,
          error: "Using cached data due to connection error"
        });
      }
      
      res.status(500).json({ 
        error: "Failed to fetch XCM activity and no cache available" 
      });
    }
  });

  // Staking endpoints
  // IMPORTANT: Analytics route MUST come before :address route to avoid matching "analytics" as an address
  app.get("/api/staking/analytics", async (req, res) => {
    try {
      const { bondedAmount } = req.query;
      console.log("Fetching staking analytics");
      const analytics = await getStakingAnalytics(bondedAmount as string);
      
      // Cache the results
      storage.setCachedStakingAnalytics(analytics);
      
      res.json({ 
        success: true, 
        data: analytics 
      });
    } catch (error) {
      console.error("Error fetching staking analytics:", error);
      
      // Try to return cached data on error
      const cached = storage.getCachedStakingAnalytics();
      if (cached) {
        return res.json({ 
          success: true, 
          data: cached,
          cached: true
        });
      }
      
      res.status(500).json({ 
        error: "Failed to fetch staking analytics" 
      });
    }
  });

  app.get("/api/staking/:address", async (req, res) => {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    try {
      console.log(`Fetching staking info for address: ${address}`);
      const stakingInfo = await getStakingInfo(address);
      
      res.json({ 
        success: true, 
        data: stakingInfo 
      });
    } catch (error) {
      console.error("Error fetching staking info:", error);
      res.status(500).json({ 
        error: "Failed to fetch staking information" 
      });
    }
  });

  app.get("/api/staking/:address/rewards", async (req, res) => {
    const { address } = req.params;
    const { eraCount = 10 } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    try {
      console.log(`Fetching staking rewards for address: ${address}`);
      const rewards = await getStakingRewards(address, Number(eraCount));
      
      res.json({ 
        success: true, 
        data: rewards 
      });
    } catch (error) {
      console.error("Error fetching staking rewards:", error);
      res.status(500).json({ 
        error: "Failed to fetch staking rewards" 
      });
    }
  });

  // Governance voting endpoints
  app.post("/api/governance/vote", async (req, res) => {
    try {
      const voteData = insertGovernanceVoteSchema.parse(req.body);
      const vote = await storage.createVote(voteData);
      
      // Award XP for voting
      await storage.incrementVoteCount(voteData.walletAddress, 10);
      
      // Fetch complete governance summary with updated stats
      const summary = await getGovernanceSummary(voteData.walletAddress);
      
      res.json({ 
        success: true, 
        data: {
          vote,
          summary
        }
      });
    } catch (error) {
      console.error("Error creating vote:", error);
      res.status(400).json({ 
        error: "Failed to create vote",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/governance/:referendumId/votes", async (req, res) => {
    try {
      const referendumId = parseInt(req.params.referendumId);
      const votes = await storage.getVotesByReferendum(referendumId);
      
      res.json({ 
        success: true, 
        data: votes 
      });
    } catch (error) {
      console.error("Error fetching votes:", error);
      res.status(500).json({ 
        error: "Failed to fetch votes" 
      });
    }
  });

  app.get("/api/governance/:referendumId/votes/:walletAddress", async (req, res) => {
    try {
      const referendumId = parseInt(req.params.referendumId);
      const { walletAddress } = req.params;
      const vote = await storage.getUserVoteForReferendum(referendumId, walletAddress);
      
      res.json({ 
        success: true, 
        data: vote || null 
      });
    } catch (error) {
      console.error("Error fetching user vote:", error);
      res.status(500).json({ 
        error: "Failed to fetch user vote" 
      });
    }
  });

  // Governance summary and participation
  app.get("/api/governance/summary", async (req, res) => {
    try {
      const { walletAddress } = req.query;
      console.log("Fetching governance summary");
      const summary = await getGovernanceSummary(walletAddress as string);
      
      res.json({ 
        success: true, 
        data: summary 
      });
    } catch (error) {
      console.error("Error fetching governance summary:", error);
      res.status(500).json({ 
        error: "Failed to fetch governance summary" 
      });
    }
  });

  app.get("/api/governance/participation/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      console.log(`Fetching participation for ${walletAddress}`);
      const proposals = await fetchReferenda();
      const participation = await getGovernanceParticipation(walletAddress, proposals);
      
      // Cache the result
      storage.setCachedGovernanceParticipation(participation);
      
      res.json({ 
        success: true, 
        data: participation 
      });
    } catch (error) {
      console.error("Error fetching participation:", error);
      
      // Try cached data
      const cached = storage.getCachedGovernanceParticipation(req.params.walletAddress);
      if (cached) {
        return res.json({ 
          success: true, 
          data: cached,
          cached: true
        });
      }
      
      res.status(500).json({ 
        error: "Failed to fetch participation data" 
      });
    }
  });

  // Comments endpoints
  app.post("/api/governance/comment", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      
      // Award XP for commenting
      await storage.incrementCommentCount(commentData.walletAddress, 5);
      
      res.json({ 
        success: true, 
        data: comment 
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ 
        error: "Failed to create comment",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/governance/:referendumId/comments", async (req, res) => {
    try {
      const referendumId = parseInt(req.params.referendumId);
      const comments = await storage.getCommentsByReferendum(referendumId);
      
      res.json({ 
        success: true, 
        data: comments 
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ 
        error: "Failed to fetch comments" 
      });
    }
  });

  // User XP endpoint
  app.get("/api/user/:walletAddress/xp", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const xp = await storage.getUserXp(walletAddress);
      
      res.json({ 
        success: true, 
        data: xp || {
          walletAddress,
          xp: 0,
          level: 1,
          votesCount: 0,
          commentsCount: 0
        }
      });
    } catch (error) {
      console.error("Error fetching user XP:", error);
      res.status(500).json({ 
        error: "Failed to fetch user XP" 
      });
    }
  });

  // Transaction History endpoints
  app.post("/api/history", async (req, res) => {
    try {
      const txData = insertTransactionHistorySchema.parse(req.body);
      const tx = await storage.createTransaction(txData);
      
      res.json({ 
        success: true, 
        data: tx 
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ 
        error: "Failed to create transaction",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/history/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getTransactionsByWallet(walletAddress, limit);
      
      res.json({ 
        success: true, 
        data: transactions 
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ 
        error: "Failed to fetch transactions" 
      });
    }
  });

  // XCM Transfer endpoint (stub - actual implementation requires signing)
  app.post("/api/transfer/xcm", async (req, res) => {
    try {
      const { fromAddress, toChain, amount, destinationAddress } = req.body;
      
      if (!fromAddress || !toChain || !amount || !destinationAddress) {
        return res.status(400).json({ 
          error: "Missing required fields" 
        });
      }

      // Generate a mock transaction hash for now
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66).padEnd(64, '0')}`;
      
      // Store transaction in history
      const tx = await storage.createTransaction({
        walletAddress: fromAddress,
        txHash: mockTxHash,
        type: "transfer",
        fromChain: "polkadot",
        toChain,
        amount,
        asset: "DOT",
        status: "pending",
      });
      
      // In a real implementation, this would:
      // 1. Connect to Polkadot.js API
      // 2. Build XCM message
      // 3. Sign with extension
      // 4. Submit transaction
      // 5. Update status based on finalization
      
      res.json({ 
        success: true, 
        data: {
          txHash: mockTxHash,
          message: "XCM transfer initiated (mock implementation - signature required for production)"
        }
      });
    } catch (error) {
      console.error("Error initiating XCM transfer:", error);
      res.status(500).json({ 
        error: "Failed to initiate transfer",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Community Stats endpoint
  app.get("/api/stats/community", async (req, res) => {
    try {
      // Get real data from storage
      const proposals = storage.getCachedProposals() || [];
      const xcmChannels = storage.getCachedXcmActivity() || [];
      const totalTransactions = await storage.getTotalTransactionCount();
      const totalWallets = await storage.getUniqueWalletCount();
      
      res.json({ 
        success: true, 
        data: {
          totalWallets,
          totalTransactions,
          activeProposals: proposals.length,
          parachainCount: xcmChannels.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ 
        error: "Failed to fetch community stats" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
