import { DashboardStats } from "@/components/DashboardStats";
import { BalanceCard } from "@/components/BalanceCard";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusBanner } from "@/components/StatusBanner";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [connectionStatus] = useState<"online" | "syncing" | "offline" | "cached">("online");
  const { toast } = useToast();

  //todo: remove mock functionality
  const mockBalances = [
    {
      chainName: "Polkadot",
      chainIcon: "●",
      balance: "142.50",
      usdValue: "1,425.00",
      lastUpdated: "2 mins ago",
      status: "online" as const,
    },
    {
      chainName: "Astar",
      chainIcon: "★",
      balance: "8,432.10",
      usdValue: "842.32",
      lastUpdated: "5 mins ago",
      status: "online" as const,
    },
    {
      chainName: "Moonbeam",
      chainIcon: "◐",
      balance: "256.75",
      usdValue: "512.45",
      lastUpdated: "1 min ago",
      status: "syncing" as const,
    },
  ];

  const mockProposals = [
    {
      id: 123,
      title: "Increase Validator Count to 350",
      proposer: "5GrwvaEF...kutQY",
      status: "active" as const,
      ayeVotes: 1250,
      nayVotes: 320,
      deadline: "2 days",
      description: "This proposal suggests increasing the active validator set from 297 to 350 validators to improve network decentralization and security.",
    },
    {
      id: 122,
      title: "Treasury Spend for Development Grant",
      proposer: "5HpG9w8E...vFwbx",
      status: "passed" as const,
      ayeVotes: 2100,
      nayVotes: 450,
      deadline: "Ended",
      description: "Approved funding for core infrastructure development.",
    },
  ];

  const handleVote = (proposalId: number, vote: "aye" | "nay") => {
    console.log(`Voted ${vote} on proposal ${proposalId}`);
    toast({
      title: "Vote Submitted",
      description: `Your ${vote.toUpperCase()} vote has been recorded for proposal #${proposalId}`,
    });
  };

  const handleRefresh = (chainName: string) => {
    console.log(`Refreshing ${chainName} balance`);
    toast({
      title: "Balance Updated",
      description: `${chainName} balance has been refreshed`,
    });
  };

  return (
    <div className="space-y-6">
      {connectionStatus !== "online" && (
        <StatusBanner mode={connectionStatus} />
      )}

      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your multi-chain portfolio and participate in governance
        </p>
      </div>

      <DashboardStats />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Chain Balances</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockBalances.map((balance) => (
            <BalanceCard
              key={balance.chainName}
              {...balance}
              onRefresh={() => handleRefresh(balance.chainName)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Proposals</h2>
        <div className="space-y-4">
          {mockProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              {...proposal}
              onVote={(vote) => handleVote(proposal.id, vote)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
