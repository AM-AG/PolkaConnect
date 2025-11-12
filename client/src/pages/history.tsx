import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  txHash: string;
  type: "transfer" | "swap" | "stake" | "vote";
  fromChain: string | null;
  toChain: string | null;
  amount: string | null;
  asset: string | null;
  status: "pending" | "completed" | "failed";
  timestamp: string;
}

export default function HistoryPage() {
  const walletState = useWallet();
  const walletAddress = walletState.polkadot.address || walletState.ethereum.address;

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/history", walletAddress],
    enabled: !!walletAddress,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "transfer": return <ArrowRight className="h-4 w-4" />;
      case "swap": return <ArrowRight className="h-4 w-4" />;
      default: return null;
    }
  };

  if (!walletAddress) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <Alert data-testid="alert-wallet-required">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connect your wallet to view transaction history
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground mt-2">
          View your past transfers, swaps, and on-chain activities
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading transactions...</div>
          </CardContent>
        </Card>
      ) : !transactions || transactions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">No transactions found</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <Card key={tx.id} data-testid={`card-transaction-${tx.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(tx.type)}
                  <CardTitle className="text-lg capitalize">{tx.type}</CardTitle>
                </div>
                <Badge variant={getStatusColor(tx.status)} data-testid={`badge-status-${tx.status}`}>
                  {tx.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {tx.fromChain && tx.toChain && (
                    <div>
                      <div className="text-muted-foreground">Route</div>
                      <div className="font-medium">{tx.fromChain} → {tx.toChain}</div>
                    </div>
                  )}
                  {tx.amount && tx.asset && (
                    <div>
                      <div className="text-muted-foreground">Amount</div>
                      <div className="font-medium">{tx.amount} {tx.asset}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Transaction Hash</div>
                    <div className="font-mono text-xs flex items-center gap-1">
                      {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Date</div>
                    <div className="font-medium">
                      {format(new Date(tx.timestamp), "MMM d, yyyy HH:mm")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
