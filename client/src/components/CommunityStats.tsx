import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Vote, GitBranch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CommunityData {
  totalWallets: number;
  totalTransactions: number;
  activeProposals: number;
  parachainCount: number;
}

export function CommunityStats() {
  const { data: rawStats, isLoading, error } = useQuery({
    queryKey: ["/api/stats/community"],
    queryFn: async () => {
      const response = await fetch("/api/stats/community");
      if (!response.ok) throw new Error("Failed to fetch community stats");
      const result = await response.json();
      return result.success ? result.data : null;
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Unable to load community stats. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const communityData: CommunityData = {
    totalWallets: rawStats?.totalWallets ?? 0,
    totalTransactions: rawStats?.totalTransactions ?? 0,
    activeProposals: rawStats?.activeProposals ?? 0,
    parachainCount: rawStats?.parachainCount ?? 0,
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
