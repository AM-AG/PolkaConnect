import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchAllBalances, getNetworkStatus } from "./services/polkadot";
import { fetchReferenda } from "./services/governance";
import { getStakingInfo, getStakingRewards } from "./services/staking";
import { insertGovernanceVoteSchema, insertCommentSchema } from "@shared/schema";

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

  // Staking endpoints
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
      
      res.json({ 
        success: true, 
        data: vote 
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

  const httpServer = createServer(app);

  return httpServer;
}
