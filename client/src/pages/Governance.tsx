import { ProposalCard } from "@/components/ProposalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, Users, Vote, Award, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGovernance } from "@/hooks/useGovernance";
import { useGovernanceSummary } from "@/hooks/useGovernanceSummary";
import { useWallet } from "@/contexts/WalletContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Governance() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { activePolkadotAccount } = useWallet();
  const { data: proposals, isLoading } = useGovernance();
  const { data: summary, isLoading: summaryLoading } = useGovernanceSummary(activePolkadotAccount?.address);

  const handleVote = (proposalId: number, vote: "aye" | "nay") => {
    console.log(`Voted ${vote} on proposal ${proposalId}`);
    toast({
      title: "Vote Submitted",
      description: `Your ${vote.toUpperCase()} vote has been recorded for proposal #${proposalId}`,
    });
  };

  const filteredProposals =
    proposals?.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery),
    ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Governance</h1>
        <p className="text-muted-foreground">
          Participate in on-chain governance and vote on proposals
        </p>
      </div>

      {/* Governance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : summary ? (
              <div className="text-2xl font-bold">
                {(summary.totalVoters ?? 0).toLocaleString()}
              </div>
            ) : (
              <div className="text-2xl font-bold">0</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : summary ? (
              <div className="text-2xl font-bold">
                {(summary.totalVotes ?? 0).toLocaleString()}
              </div>
            ) : (
              <div className="text-2xl font-bold">0</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : summary ? (
              <div className="text-2xl font-bold">
                {(summary.averageParticipation ?? 0).toFixed(1)}%
              </div>
            ) : (
              <div className="text-2xl font-bold">0.0%</div>
            )}
          </CardContent>
        </Card>

        {summary?.userParticipation && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">#{summary.userParticipation.rank ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.userParticipation.votesCount ?? 0} votes • {summary.userParticipation.streak ?? 0} streak
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Participation Card */}
      {activePolkadotAccount && summary?.userParticipation && (
        <Card data-testid="card-user-participation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Governance Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="text-sm text-muted-foreground mb-1">Voting Power</div>
                <div className="font-mono font-bold text-lg">{summary.userParticipation.votingPower ?? "0 DOT"}</div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-sm text-muted-foreground mb-1">Votes Cast</div>
                <div className="font-bold text-lg">{summary.userParticipation.votesCount ?? 0}</div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-sm text-muted-foreground mb-1">Last Vote</div>
                <div className="font-medium text-sm">{summary.userParticipation.lastVote || "Never"}</div>
              </div>
              {(summary.userParticipation.badges ?? []).length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm text-muted-foreground mb-1">Badges</div>
                  <div className="flex flex-wrap gap-1">
                    {(summary.userParticipation.badges ?? []).map((badge, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {badge.replace(/-/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Proposals */}
      {summary?.trendingProposals && summary.trendingProposals.length > 0 && (
        <Card data-testid="card-trending-proposals">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Proposals
            </CardTitle>
            <CardDescription>
              Most active proposals by voting volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.trendingProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  {...proposal}
                  onVote={(vote) => handleVote(proposal.id, vote)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-proposals"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              {...proposal}
              onVote={(vote) => handleVote(proposal.id, vote)}
            />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            {searchQuery
              ? "No proposals found matching your search"
              : "No active proposals at the moment. Check back later for governance updates."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
