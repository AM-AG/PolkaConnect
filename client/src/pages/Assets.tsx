import { BalanceCard } from "@/components/BalanceCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet as WalletIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useBalances } from "@/hooks/useBalances";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Assets() {
  const { toast } = useToast();
  const { selectedAccount, isConnected } = useWallet();
  const { data: balances, isLoading, refetch, isFetching } = useBalances(
    selectedAccount?.address || null
  );

  const handleRefreshAll = async () => {
    console.log("Refreshing all balances");
    await refetch();
    toast({
      title: "All Balances Updated",
      description: "Successfully refreshed balances across all chains",
    });
  };

  const handleRefreshChain = async (chainName: string) => {
    console.log(`Refreshing ${chainName}`);
    await refetch();
    toast({
      title: "Balance Updated",
      description: `${chainName} balance has been refreshed`,
    });
  };

  const formatLastUpdated = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert className="max-w-md">
          <WalletIcon className="h-4 w-4" />
          <AlertDescription>
            Please connect your Polkadot wallet to view your multi-chain assets.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalUsdValue = balances?.reduce((sum, b) => sum + parseFloat(b.usdValue), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Multi-Chain Assets</h1>
          <p className="text-muted-foreground">
            View and manage your balances across all connected parachains
          </p>
        </div>
        <Button
          onClick={handleRefreshAll}
          disabled={isFetching}
          data-testid="button-refresh-all"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh All
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : balances && balances.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {balances.map((chain) => (
              <BalanceCard
                key={chain.chainId}
                chainName={chain.chainName}
                chainIcon={chain.chainId === 'polkadot' ? '●' : chain.chainId === 'astar' ? '★' : '◐'}
                balance={chain.balance}
                usdValue={chain.usdValue}
                lastUpdated={formatLastUpdated(chain.lastUpdated)}
                status={chain.status}
                onRefresh={() => handleRefreshChain(chain.chainName)}
              />
            ))}
          </div>

          <div className="mt-8 p-6 bg-card border rounded-lg">
            <h3 className="font-semibold mb-2">Total Portfolio Value</h3>
            <div className="text-3xl font-bold font-mono">
              ${totalUsdValue.toFixed(2)} USD
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Across {balances.length} parachain{balances.length > 1 ? 's' : ''}
            </p>
          </div>
        </>
      ) : (
        <Alert>
          <AlertDescription>
            No balances found. Make sure your wallet has assets on supported chains.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
