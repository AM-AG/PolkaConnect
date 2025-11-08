import { ProposalCard } from "@/components/ProposalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGovernance } from "@/hooks/useGovernance";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Governance() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { data: proposals, isLoading } = useGovernance();

  const handleVote = (proposalId: number, vote: "aye" | "nay") => {
    console.log(`Voted ${vote} on proposal ${proposalId}`);
    toast({
      title: "Vote Submitted",
      description: `Your ${vote.toUpperCase()} vote has been recorded for proposal #${proposalId}`,
    });
  };

  const filteredProposals = proposals?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery)
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Governance</h1>
        <p className="text-muted-foreground">
          Participate in on-chain governance and vote on proposals
        </p>
      </div>

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
