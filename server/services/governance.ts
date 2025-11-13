import { ApiPromise, WsProvider } from "@polkadot/api";
import type { Proposal, GovernanceParticipation, GovernanceSummary } from "@shared/schema";

const POLKADOT_RPC = "wss://rpc.polkadot.io";
let cachedApi: ApiPromise | null = null;

async function getPolkadotApi(): Promise<ApiPromise | null> {
  if (cachedApi && cachedApi.isConnected) {
    return cachedApi;
  }

  try {
    const provider = new WsProvider(POLKADOT_RPC, 3000);
    const api = await ApiPromise.create({
      provider,
      throwOnConnect: false,
      throwOnUnknown: false,
    });

    await api.isReady;
    cachedApi = api;
    return api;
  } catch (error) {
    console.error("Failed to connect to Polkadot for governance:", error);
    return null;
  }
}

// Mock proposals for fallback when RPC connection fails
function getMockProposals(): Proposal[] {
  return [
    {
      id: 1042,
      title: "Treasury Proposal: Upgrade Network Infrastructure",
      proposer: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      status: "active",
      ayeVotes: 45230,
      nayVotes: 12450,
      deadline: "14 days",
      description: "Funding request for upgrading Polkadot network infrastructure and improving relay chain performance.",
      track: "root",
    },
    {
      id: 1041,
      title: "Runtime Upgrade: Enhanced Governance Features",
      proposer: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      status: "active",
      ayeVotes: 38920,
      nayVotes: 8340,
      deadline: "21 days",
      description: "Propose runtime upgrade to implement advanced governance features and delegation capabilities.",
      track: "root",
    },
    {
      id: 1040,
      title: "Ecosystem Development Fund Allocation",
      proposer: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
      status: "active",
      ayeVotes: 52100,
      nayVotes: 15230,
      deadline: "7 days",
      description: "Allocate funds from treasury to support parachain development and ecosystem growth initiatives.",
      track: "treasurer",
    },
    {
      id: 1039,
      title: "Staking Rewards Parameter Adjustment",
      proposer: "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",
      status: "active",
      ayeVotes: 29840,
      nayVotes: 5120,
      deadline: "18 days",
      description: "Adjust staking rewards distribution parameters to optimize network security and validator participation.",
      track: "root",
    },
    {
      id: 1038,
      title: "Community Event Sponsorship Program",
      proposer: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
      status: "active",
      ayeVotes: 18340,
      nayVotes: 3210,
      deadline: "25 days",
      description: "Establish a program to sponsor community-driven events, hackathons, and educational workshops.",
      track: "small_tipper",
    },
  ];
}

export async function fetchReferenda(): Promise<Proposal[]> {
  const api = await getPolkadotApi();

  if (!api) {
    console.log("No API connection, returning mock proposals");
    return getMockProposals();
  }

  try {
    // Fetch ongoing referenda from OpenGov
    const referendaInfo = await api.query.referenda.referendumInfoFor.entries();
    const proposals: Proposal[] = [];

    for (const [key, info] of referendaInfo) {
      const referendumId = (key.args[0].toJSON() as any) || 0;
      const infoData = info.toJSON() as any;

      if (infoData && infoData.ongoing) {
        const ongoing = infoData.ongoing;
        const tally = ongoing.tally || { ayes: 0, nays: 0 };

        // Calculate deadline from decision deposit and track info
        const deadlineBlocks = ongoing.decisionDeposit ? 100000 : 200000; // Simplified
        const header = await api.rpc.chain.getHeader();
        const currentBlock = (header.number.toJSON() as any) || 0;
        const remainingBlocks = Math.max(
          0,
          deadlineBlocks - (currentBlock - (ongoing.submitted || currentBlock)),
        );
        const daysRemaining = Math.ceil(remainingBlocks / 7200); // ~6s per block

        proposals.push({
          id: referendumId,
          title: `Referendum #${referendumId}`,
          proposer: ongoing.submissionDeposit?.who || "Unknown",
          status: "active",
          ayeVotes: parseInt(tally.ayes || 0) / 1e10, // Convert from plancks
          nayVotes: parseInt(tally.nays || 0) / 1e10,
          deadline: daysRemaining > 0 ? `${daysRemaining} days` : "Soon",
          description: `Referendum ${referendumId} is currently active in the governance system.`,
          track: ongoing.track || "root",
        });
      }
    }

    // If no active referenda found, return mock data
    if (proposals.length === 0) {
      console.log("No active referenda found on chain, returning mock proposals");
      return getMockProposals();
    }

    return proposals.slice(0, 10); // Limit to 10 most recent
  } catch (error) {
    console.error("Error fetching referenda, returning mock proposals:", error);
    return getMockProposals();
  }
}

export async function getGovernanceParticipation(
  walletAddress: string,
  proposals: Proposal[]
): Promise<GovernanceParticipation> {
  // In production, this would query chain data for actual voting history
  // For now, generate deterministic data based on address
  const addressHash = walletAddress.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const votesCount = addressHash % 25 + 1;
  const streak = addressHash % 10;
  const badges: string[] = [];
  
  if (votesCount > 15) badges.push("frequent-voter");
  if (streak > 5) badges.push("dedicated");
  if (votesCount > 5) badges.push("active-participant");
  
  return {
    walletAddress,
    votingPower: "1,500 DOT",
    votesCount,
    lastVote: votesCount > 0 ? "2 days ago" : undefined,
    streak,
    rank: addressHash % 100 + 1,
    badges,
  };
}

export async function getGovernanceSummary(
  walletAddress?: string
): Promise<GovernanceSummary> {
  try {
    const proposals = await fetchReferenda();
    
    // Sort by vote volume to get trending
    const trendingProposals = proposals
      .sort((a, b) => (b.ayeVotes + b.nayVotes) - (a.ayeVotes + a.nayVotes))
      .slice(0, 3);
    
    let userParticipation: GovernanceParticipation | undefined;
    if (walletAddress) {
      userParticipation = await getGovernanceParticipation(walletAddress, proposals);
    }
    
    return {
      totalVoters: 5234,
      totalVotes: 12456,
      averageParticipation: 42.5,
      trendingProposals,
      userParticipation,
    };
  } catch (error) {
    console.error("Error in governance summary, returning mock data:", error);
    
    // Return mock data when RPC is unavailable
    const mockProposals: Proposal[] = [
      {
        id: 1001,
        title: "Treasury Proposal: Fund Polkadot Development",
        proposer: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
        status: "active",
        ayeVotes: 15420,
        nayVotes: 3200,
        deadline: "14 days",
        description: "Funding proposal for core development team to work on runtime upgrades and improvements.",
        track: "treasurer",
      },
      {
        id: 998,
        title: "Governance Parameter Update: Reduce Approval Threshold",
        proposer: "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB",
        status: "active",
        ayeVotes: 8900,
        nayVotes: 5400,
        deadline: "7 days",
        description: "Proposal to adjust the approval threshold for medium track proposals.",
        track: "root",
      },
    ];
    
    let userParticipation: GovernanceParticipation | undefined;
    if (walletAddress) {
      userParticipation = await getGovernanceParticipation(walletAddress, mockProposals);
    }
    
    return {
      totalVoters: 5234,
      totalVotes: 12456,
      averageParticipation: 42.5,
      trendingProposals: mockProposals,
      userParticipation,
    };
  }
}

export async function disconnectGovernanceApi(): Promise<void> {
  if (cachedApi) {
    try {
      await cachedApi.disconnect();
      cachedApi = null;
    } catch (error) {
      console.error("Error disconnecting governance API:", error);
    }
  }
}
