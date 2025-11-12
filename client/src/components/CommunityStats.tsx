import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Vote, GitBranch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useGovernance } from "@/hooks/useGovernance";
import { useXcmData } from "@/hooks/useXcmData";

interface CommunityData {
  totalWallets: number;
  totalTransactions: number;
  activeProposals: number;
  parachainCount: number;
}

export function CommunityStats() {
  const { data: proposals } = useGovernance();
  const { data: xcmChannels } = useXcmData();

  const { data: rawStats } = useQuery({
    queryKey: ["/api/stats/community"],
    queryFn: async () => {
      const response = await fetch("/api/stats/community");
      if (!response.ok) throw new Error("Failed to fetch community stats");
      const result = await response.json();
      return result.success ? result.data : null;
    },
    staleTime: 30000,
  });

  const communityData: CommunityData = {
    totalWallets: rawStats?.totalWallets || 0,
    totalTransactions: rawStats?.totalTransactions || 0,
    activeProposals: rawStats?.activeProposals || proposals?.length || 0,
    parachainCount: rawStats?.parachainCount || xcmChannels?.length || 0,
  };

  const stats = [
    {
      title: "Active Wallets",
      value: communityData.totalWallets.toLocaleString(),
      description: "Connected to network",
      icon: Users,
      testId: "stat-active-wallets",
    },
    {
      title: "Total Transactions",
      value: communityData.totalTransactions.toLocaleString(),
      description: "Cross-chain transfers",
      icon: Activity,
      testId: "stat-total-transactions",
    },
    {
      title: "Active Proposals",
      value: communityData.activeProposals.toString(),
      description: "OpenGov referenda",
      icon: Vote,
      testId: "stat-active-proposals",
    },
    {
      title: "Connected Parachains",
      value: communityData.parachainCount.toString(),
      description: "Via XCM channels",
      icon: GitBranch,
      testId: "stat-parachains",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} data-testid={stat.testId}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid={`${stat.testId}-value`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
