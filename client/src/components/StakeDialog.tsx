import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePolkadotApi, TransactionStatus } from "@/contexts/PolkadotApiContext";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { dotToPlanck } from "@/lib/polkadot";

interface StakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StakeDialog({ open, onOpenChange }: StakeDialogProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const { api, signAndSend } = usePolkadotApi();
  const { activePolkadotAccount } = useWallet();
  const { toast } = useToast();

  const handleStake = async () => {
    if (!api || !activePolkadotAccount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wallet not connected or API not ready",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus("Preparing transaction...");

    try {
      const amountInPlanck = dotToPlanck(amount);

      const extrinsic = api.tx.staking.bond(
        amountInPlanck,
        "Staked"
      );

      const handleStatus = (txStatus: TransactionStatus) => {
        if (txStatus.type === "ready") {
          setStatus("Ready to sign...");
        } else if (txStatus.type === "broadcast") {
          setStatus("Broadcasting transaction...");
        } else if (txStatus.type === "inBlock") {
          setStatus("Transaction included in block...");
        } else if (txStatus.type === "finalized") {
          setStatus("Transaction finalized!");
        } else if (txStatus.type === "error") {
          setStatus(`Error: ${txStatus.message}`);
        }
      };

      const txHash = await signAndSend(extrinsic, handleStatus);

      toast({
        title: "Staking Successful!",
        description: `Successfully staked ${amount} DOT. Transaction: ${txHash.slice(0, 10)}...`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/staking"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });

      setAmount("");
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        variant: "destructive",
        title: "Staking Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      setStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-stake">
        <DialogHeader>
          <DialogTitle>Stake DOT</DialogTitle>
          <DialogDescription>
            Bond your DOT tokens to start earning staking rewards
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (DOT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              data-testid="input-stake-amount"
            />
            <p className="text-xs text-muted-foreground">
              Minimum stake: 10 DOT • Unbonding period: 28 days
            </p>
          </div>

          {status && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md" data-testid="text-tx-status">
              {status}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
              data-testid="button-cancel-stake"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStake}
              disabled={isSubmitting || !amount}
              className="flex-1"
              data-testid="button-confirm-stake"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Stake DOT"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
