import { ProposalCard } from "@/components/ProposalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Governance() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  //todo: remove mock functionality
  const proposals = [
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
    {
      id: 121,
      title: "Runtime Upgrade v1.2.0",
      proposer: "5FHneW46...xbQMk",
      status: "active" as const,
      ayeVotes: 980,
      nayVotes: 125,
      deadline: "5 days",
      description: "Proposed runtime upgrade including performance improvements and bug fixes.",
    },
    {
      id: 120,
      title: "Adjust Referendum Parameters",
      proposer: "5Dt6dpkW...nU7uL",
      status: "rejected" as const,
      ayeVotes: 450,
      nayVotes: 1500,
      deadline: "Ended",
      description: "Proposal to modify governance parameters was rejected by the community.",
    },
    {
      id: 119,
      title: "Fund Ecosystem Marketing Initiative",
      proposer: "5EyCAet8...M2jJM",
      status: "active" as const,
      ayeVotes: 1550,
      nayVotes: 280,
      deadline: "3 days",
      description: "Request for treasury funding to support marketing efforts for ecosystem growth.",
    },
  ];

  const handleVote = (proposalId: number, vote: "aye" | "nay") => {
    console.log(`Voted ${vote} on proposal ${proposalId}`);
    toast({
      title: "Vote Submitted",
      description: `Your ${vote.toUpperCase()} vote has been recorded for proposal #${proposalId}`,
    });
  };

  const filteredProposals = proposals.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery)
  );

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

      <div className="space-y-4">
        {filteredProposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            {...proposal}
            onVote={(vote) => handleVote(proposal.id, vote)}
          />
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No proposals found matching your search
        </div>
      )}
    </div>
  );
}
