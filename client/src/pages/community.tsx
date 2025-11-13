import { Leaderboard } from "@/components/Leaderboard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { CommunityMetrics } from "@/components/CommunityMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users2, Award } from "lucide-react";
import mockData from "@/data/mockCommunity.json";

export default function CommunityPage() {
  const pools = mockData.stakingPools;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2" data-testid="heading-community">
          Community
        </h1>
        <p className="text-muted-foreground">
          Explore top contributors, staking pools, and on-chain community activity.
        </p>
      </div>

      <CommunityMetrics />

      <div className="grid gap-6 lg:grid-cols-2">
        <Leaderboard />
        <ActivityFeed />
      </div>

      <Card data-testid="card-staking-pools">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Community Staking Pools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {pools.map((pool) => (
              <Card
                key={pool.id}
                className="hover-elevate"
                data-testid={`pool-${pool.id}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between gap-1">
                    <span>{pool.name}</span>
                    <Award className="h-4 w-4 text-yellow-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Staked
                    </span>
                    <span className="font-mono font-bold">
                      {parseInt(pool.totalStaked).toLocaleString()} DOT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Members</span>
                    <span className="font-mono">{pool.members}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">APY</span>
                    <Badge variant="outline" className="text-green-600 dark:text-green-400">
                      {pool.apy}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
