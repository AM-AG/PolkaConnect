import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface ProposalCardProps {
  id: number;
  title: string;
  proposer: string;
  status: "active" | "passed" | "rejected";
  ayeVotes: number;
  nayVotes: number;
  deadline: string;
  description?: string;
  onVote?: (vote: "aye" | "nay") => void;
}

export function ProposalCard({
  id,
  title,
  proposer,
  status,
  ayeVotes,
  nayVotes,
  deadline,
  description,
  onVote,
}: ProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalVotes = ayeVotes + nayVotes;
  const ayePercentage = totalVotes > 0 ? (ayeVotes / totalVotes) * 100 : 0;

  const statusVariant = {
    active: "default" as const,
    passed: "default" as const,
    rejected: "destructive" as const,
  };

  const statusColor = {
    active: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    passed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };

  return (
    <Card data-testid={`card-proposal-${id}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">#{id}</span>
              <Badge className={statusColor[status]} variant="outline">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg" data-testid={`text-proposal-title-${id}`}>
              {title}
            </h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`button-expand-${id}`}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Proposer:</span>
          <code className="font-mono bg-muted px-2 py-1 rounded">{proposer}</code>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Votes</span>
            <span className="font-medium">
              {ayeVotes} Aye / {nayVotes} Nay
            </span>
          </div>
          <Progress value={ayePercentage} className="h-2" />
        </div>

        {isExpanded && description && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button variant="ghost" size="sm" className="gap-2">
              <ExternalLink className="h-3 w-3" />
              View on Explorer
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">Ends: {deadline}</span>
          {status === "active" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVote?.("aye")}
                data-testid={`button-vote-aye-${id}`}
                className="gap-1"
              >
                <ThumbsUp className="h-3 w-3" />
                Aye
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVote?.("nay")}
                data-testid={`button-vote-nay-${id}`}
                className="gap-1"
              >
                <ThumbsDown className="h-3 w-3" />
                Nay
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
