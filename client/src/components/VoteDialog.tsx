import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { usePolkadotApi, TransactionStatus } from "@/contexts/PolkadotApiContext";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { dotToPlanck } from "@/lib/polkadot";

interface VoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: number;
  proposalTitle: string;
}

type VoteDirection = "aye" | "nay";
type Conviction = "None" | "Locked1x" | "Locked2x" | "Locked3x" | "Locked4x" | "Locked5x" | "Locked6x";

export function VoteDialog({ open, onOpenChange, proposalId, proposalTitle }: VoteDialogProps) {
  const [voteDirection, setVoteDirection] = useState<VoteDirection | null>(null);
  const [conviction, setConviction] = useState<Conviction>("None");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const { api, signAndSend } = usePolkadotApi();
  const { activePolkadotAccount } = useWallet();
  const { toast } = useToast();

  const handleVote = async () => {
    if (!api || !activePolkadotAccount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wallet not connected or API not ready",
      });
      return;
    }

    if (!voteDirection) {
      toast({
        variant: "destructive",
        title: "No Vote Selected",
        description: "Please select Aye or Nay",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter your voting power amount",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus("Preparing vote...");

    try {
      const voteBalance = dotToPlanck(amount);

      const vote = {
        Standard: {
          vote: {
            aye: voteDirection === "aye",
            conviction
          },
          balance: voteBalance
        }
      };

      const extrinsic = api.tx.convictionVoting.vote(proposalId, vote);

      let isFinalized = false;

      const handleStatus = (txStatus: TransactionStatus) => {
        if (txStatus.type === "ready") {
          setStatus("Ready to sign...");
        } else if (txStatus.type === "broadcast") {
          setStatus("Broadcasting vote...");
        } else if (txStatus.type === "inBlock") {
          setStatus("Vote included in block...");
        } else if (txStatus.type === "finalized") {
          setStatus("Vote finalized!");
          isFinalized = true;
        } else if (txStatus.type === "error") {
          setStatus(`Error: ${txStatus.message}`);
        }
      };

      const txHash = await signAndSend(extrinsic, handleStatus);

      // Record the vote in the database after successful finalization
      if (isFinalized) {
        try {
          const convictionMap: Record<Conviction, number> = {
            "None": 0,
            "Locked1x": 1,
            "Locked2x": 2,
            "Locked3x": 3,
            "Locked4x": 4,
            "Locked5x": 5,
            "Locked6x": 6,
          };

          const response = await apiRequest("POST", "/api/governance/vote", {
            referendumId: proposalId,
            walletAddress: activePolkadotAccount.address,
            vote: voteDirection,
            conviction: convictionMap[conviction],
            balance: voteBalance.toString(),
          });

          const result = await response.json();

          if (result.success && result.data?.summary) {
            console.log("Vote recorded in database");

            // Update cache with complete governance summary from server
            // This includes totals, trending proposals, and user participation
            queryClient.setQueryData(
              ["/api/governance/summary", activePolkadotAccount.address],
              result.data.summary
            );

            // Invalidate proposals query to refresh proposal list
            queryClient.invalidateQueries({ queryKey: ["/api/governance"] });
          }
        } catch (dbError) {
          console.error("Failed to record vote in database:", dbError);
          // Don't show error to user since blockchain vote succeeded
        }
      }

      toast({
        title: "Vote Submitted!",
        description: `Successfully voted ${voteDirection.toUpperCase()} on proposal #${proposalId}`,
      });

      setVoteDirection(null);
      setConviction("None");
      setAmount("");
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        variant: "destructive",
        title: "Vote Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      setStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-vote">
        <DialogHeader>
          <DialogTitle>Vote on Proposal #{proposalId}</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {proposalTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Vote</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={voteDirection === "aye" ? "default" : "outline"}
                onClick={() => setVoteDirection("aye")}
                disabled={isSubmitting}
                className="w-full"
                data-testid="button-vote-aye"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Aye
              </Button>
              <Button
                variant={voteDirection === "nay" ? "destructive" : "outline"}
                onClick={() => setVoteDirection("nay")}
                disabled={isSubmitting}
                className="w-full"
                data-testid="button-vote-nay"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Nay
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conviction">Conviction</Label>
            <Select value={conviction} onValueChange={(value) => setConviction(value as Conviction)} disabled={isSubmitting}>
              <SelectTrigger data-testid="select-conviction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None (1x)</SelectItem>
                <SelectItem value="Locked1x">Locked 1x (7 days)</SelectItem>
                <SelectItem value="Locked2x">Locked 2x (14 days)</SelectItem>
                <SelectItem value="Locked3x">Locked 4x (28 days)</SelectItem>
                <SelectItem value="Locked4x">Locked 8x (56 days)</SelectItem>
                <SelectItem value="Locked5x">Locked 16x (112 days)</SelectItem>
                <SelectItem value="Locked6x">Locked 32x (224 days)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher conviction multiplies your voting power but locks tokens longer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vote-amount">Voting Power (DOT)</Label>
            <Input
              id="vote-amount"
              type="number"
              placeholder="100.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              data-testid="input-vote-amount"
            />
          </div>

          {status && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md" data-testid="text-vote-status">
              {status}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
              data-testid="button-cancel-vote"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVote}
              disabled={isSubmitting || !voteDirection || !amount}
              className="flex-1"
              data-testid="button-submit-vote"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Vote"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
