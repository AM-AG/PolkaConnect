import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMultiWallet } from "@/hooks/useMultiWallet";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PARACHAINS = [
  { id: "moonbeam", name: "Moonbeam", paraId: 2004 },
  { id: "astar", name: "Astar", paraId: 2006 },
  { id: "acala", name: "Acala", paraId: 2000 },
  { id: "parallel", name: "Parallel", paraId: 2012 },
];

export default function TransferPage() {
  const { toast } = useToast();
  const { walletState } = useMultiWallet();
  const [toChain, setToChain] = useState("moonbeam");
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const transferMutation = useMutation({
    mutationFn: async (data: { toChain: string; amount: string; destinationAddress: string }) => {
      const response = await fetch("/api/transfer/xcm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAddress: walletState.polkadot.address,
          toChain: data.toChain,
          amount: data.amount,
          destinationAddress: data.destinationAddress,
        }),
      });
      if (!response.ok) throw new Error("Transfer failed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer Initiated",
        description: `Transferring ${amount} DOT to ${toChain}`,
      });
      setAmount("");
      setDestinationAddress("");
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTransfer = () => {
    if (!walletState.polkadot.connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Polkadot wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!destinationAddress) {
      toast({
        title: "Missing Destination",
        description: "Please enter a destination address",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({ toChain, amount, destinationAddress });
  };

  const selectedChain = PARACHAINS.find(c => c.id === toChain);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cross-Chain Transfer</h1>
        <p className="text-muted-foreground mt-2">
          Transfer DOT to other parachains using XCM
        </p>
      </div>

      {!walletState.polkadot.connected && (
        <Alert data-testid="alert-wallet-required">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect your Polkadot wallet to send cross-chain transfers
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send DOT via XCM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="flex items-center justify-center p-4 bg-muted rounded-md">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">From</div>
                <div className="font-semibold">Polkadot</div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-center p-4 bg-primary/10 rounded-md">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">To</div>
                <div className="font-semibold">{selectedChain?.name}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination-chain">Destination Chain</Label>
            <Select value={toChain} onValueChange={setToChain}>
              <SelectTrigger id="destination-chain" data-testid="select-destination-chain">
                <SelectValue placeholder="Select destination chain" />
              </SelectTrigger>
              <SelectContent>
                {PARACHAINS.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id} data-testid={`option-chain-${chain.id}`}>
                    {chain.name} (Para ID: {chain.paraId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (DOT)</Label>
            <Input
              id="amount"
              data-testid="input-amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination Address</Label>
            <Input
              id="destination"
              data-testid="input-destination"
              placeholder="Substrate address on destination chain"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              XCM transfers may take a few minutes to complete. Ensure the destination address is compatible with {selectedChain?.name}.
            </AlertDescription>
          </Alert>

          <Button
            className="w-full"
            onClick={handleTransfer}
            disabled={!walletState.polkadot.connected || transferMutation.isPending}
            data-testid="button-transfer"
          >
            {transferMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Transfer...
              </>
            ) : (
              `Send ${amount || "0"} DOT to ${selectedChain?.name}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
