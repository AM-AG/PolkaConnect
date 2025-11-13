import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Coins, GitBranch, TrendingUp } from "lucide-react";
import mockData from "@/data/mockCommunity.json";

export function CommunityMetrics() {
  const totalMembers = mockData.leaderboard.length;
  const totalStaked = mockData.stakingPools.reduce(
    (sum, pool) => sum + parseInt(pool.totalStaked),
    0
  );
  const totalPoolMembers = mockData.stakingPools.reduce(
    (sum, pool) => sum + pool.members,
    0
  );

  const stats = [
    {
      title: "Active Members",
      value: totalMembers.toLocaleString(),
      description: "Top contributors",
      icon: Users,
      testId: "metric-active-members",
    },
    {
      title: "Total Staked DOT",
      value: `${(totalStaked / 1000).toFixed(1)}K`,
      description: "Across all pools",
      icon: Coins,
      testId: "metric-total-staked",
    },
    {
      title: "Pool Participants",
      value: totalPoolMembers.toLocaleString(),
      description: "Community stakers",
      icon: TrendingUp,
      testId: "metric-pool-members",
    },
    {
      title: "Staking Pools",
      value: mockData.stakingPools.length.toString(),
      description: "Active pools",
      icon: GitBranch,
      testId: "metric-staking-pools",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} data-testid={stat.testId}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold font-mono"
              data-testid={`${stat.testId}-value`}
            >
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
