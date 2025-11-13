import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Vote, Coins, GitBranch } from "lucide-react";
import mockData from "@/data/mockCommunity.json";

interface LeaderboardMember {
  name: string;
  address: string;
  score: number;
  badges: string[];
  contributions: {
    votes: number;
    stakes: number;
    xcmTransfers: number;
  };
}

const badgeIcons: Record<string, React.ReactNode> = {
  governance: <Vote className="h-3 w-3" />,
  staking: <Coins className="h-3 w-3" />,
  validator: <Trophy className="h-3 w-3" />,
  xcm: <GitBranch className="h-3 w-3" />,
};

export function Leaderboard() {
  const members = mockData.leaderboard as LeaderboardMember[];

  return (
    <Card data-testid="card-leaderboard">
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
        <CardTitle>Top Community Members</CardTitle>
        <Trophy className="h-5 w-5 text-yellow-500" />
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member, i) => (
          <div
            key={member.address}
            className="flex items-center justify-between hover-elevate rounded-md p-3"
            data-testid={`leaderboard-member-${i}`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground w-6">
                  #{i + 1}
                </span>
                <Avatar>
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{member.name}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {member.address}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {member.badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="secondary"
                      className="text-xs px-1.5 py-0 h-5"
                      data-testid={`badge-${badge}`}
                    >
                      <span className="mr-1">{badgeIcons[badge]}</span>
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right ml-2">
              <div className="font-mono text-sm font-bold text-green-600 dark:text-green-400">
                +{member.score} XP
              </div>
              <div className="text-xs text-muted-foreground">
                {member.contributions.votes}v • {member.contributions.stakes}s •{" "}
                {member.contributions.xcmTransfers}x
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
