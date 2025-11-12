import { useState, useEffect } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Activity, Filter, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Transaction {
  hash: string;
  blockNumber: number;
  method: string;
  section: string;
  signer: string;
  timestamp: Date;
}

export default function Transactions() {
  const { activePolkadotAccount } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [api, setApi] = useState<ApiPromise | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let apiInstance: ApiPromise | null = null;

    const connectAndSubscribe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const provider = new WsProvider("wss://rpc.polkadot.io");
        apiInstance = await ApiPromise.create({ provider });
        await apiInstance.isReady;
        
        setApi(apiInstance);
        setIsConnected(true);
        setIsLoading(false);

        // Subscribe to new block headers
        unsubscribe = await apiInstance.rpc.chain.subscribeNewHeads(async (header) => {
          try {
            const blockNumber = header.number.toNumber();
            const blockHash = await apiInstance!.rpc.chain.getBlockHash(blockNumber);
            const signedBlock = await apiInstance!.rpc.chain.getBlock(blockHash);

            const newTransactions: Transaction[] = [];

            signedBlock.block.extrinsics.forEach((ex, index) => {
              const signer = ex.signer?.toString() || "System";
              
              newTransactions.push({
                hash: ex.hash.toString(),
                blockNumber,
                method: ex.method.method,
                section: ex.method.section,
                signer,
                timestamp: new Date(),
              });
            });

            setTransactions((prev) => {
              const combined = [...newTransactions, ...prev];
              // Keep last 100 transactions
              return combined.slice(0, 100);
            });
          } catch (err) {
            console.error("Error processing block:", err);
          }
        });
      } catch (err) {
        console.error("Connection error:", err);
        setError("Failed to connect to Polkadot network. Please try again.");
        setIsLoading(false);
      }
    };

    connectAndSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (apiInstance) {
        apiInstance.disconnect();
      }
    };
  }, []);

  const handleRefresh = () => {
    // Clear transactions - new ones will continue streaming in from the active WebSocket
    setTransactions([]);
  };

  const filteredTransactions = showUserOnly && activePolkadotAccount
    ? transactions.filter((tx) => tx.signer === activePolkadotAccount.address)
    : transactions;

  const displayedTransactions = filteredTransactions.slice(0, 50);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Live Transactions
          </h1>
          <p className="text-muted-foreground">
            Real-time Polkadot blockchain transaction feed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isConnected ? "default" : "secondary"}
            data-testid="badge-connection-status"
          >
            <Activity className="h-3 w-3 mr-1" />
            {isConnected ? "Live" : "Offline"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6" data-testid="card-filters">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Customize your transaction view</CardDescription>
            </div>
            {showUserOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserOnly(false)}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Switch
              id="user-only"
              checked={showUserOnly}
              onCheckedChange={setShowUserOnly}
              disabled={!activePolkadotAccount}
              data-testid="switch-user-only"
            />
            <Label htmlFor="user-only" className="cursor-pointer">
              Show only my transactions
              {!activePolkadotAccount && (
                <span className="text-muted-foreground ml-2">(connect wallet first)</span>
              )}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-transactions">
        <CardHeader>
          <CardTitle>
            Recent Transactions
            <span className="text-muted-foreground font-normal ml-2">
              ({displayedTransactions.length} {showUserOnly ? "matching" : "shown"})
            </span>
          </CardTitle>
          <CardDescription>
            Live feed of the latest 50 transactions on Polkadot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2" data-testid="list-transactions">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : displayedTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground" data-testid="text-no-transactions">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {showUserOnly
                    ? "No transactions found for your address"
                    : "Waiting for new transactions..."}
                </p>
              </div>
            ) : (
              displayedTransactions.map((tx) => (
                <Card
                  key={tx.hash}
                  className="hover-elevate"
                  data-testid={`transaction-${tx.hash.slice(0, 8)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" data-testid="badge-method">
                            {tx.section}.{tx.method}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Block #{tx.blockNumber}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Hash:</span>
                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Signer:</span>
                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {tx.signer === "System" ? "System" : `${tx.signer.slice(0, 8)}...${tx.signer.slice(-6)}`}
                            </code>
                            {activePolkadotAccount && tx.signer === activePolkadotAccount.address && (
                              <Badge variant="default" className="text-xs">You</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {tx.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
