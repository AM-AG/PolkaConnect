import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchAllBalances, getNetworkStatus } from "./services/polkadot";
import { fetchReferenda } from "./services/governance";

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

  const httpServer = createServer(app);

  return httpServer;
}
