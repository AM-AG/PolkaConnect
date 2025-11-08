import { BalanceCard } from "@/components/BalanceCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Assets() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  //todo: remove mock functionality
  const chains = [
    {
      chainName: "Polkadot",
      chainIcon: "●",
      balance: "142.50",
      usdValue: "1,425.00",
      lastUpdated: "2 mins ago",
      status: "online" as const,
    },
    {
      chainName: "Kusama",
      chainIcon: "◆",
      balance: "1,234.67",
      usdValue: "987.65",
      lastUpdated: "3 mins ago",
      status: "online" as const,
    },
    {
      chainName: "Astar",
      chainIcon: "★",
      balance: "8,432.10",
      usdValue: "842.32",
      lastUpdated: "5 mins ago",
      status: "online" as const,
    },
    {
      chainName: "Moonbeam",
      chainIcon: "◐",
      balance: "256.75",
      usdValue: "512.45",
      lastUpdated: "1 min ago",
      status: "syncing" as const,
    },
    {
      chainName: "Acala",
      chainIcon: "◎",
      balance: "5,678.90",
      usdValue: "456.78",
      lastUpdated: "4 mins ago",
      status: "online" as const,
    },
    {
      chainName: "Parallel",
      chainIcon: "‖",
      balance: "987.65",
      usdValue: "234.56",
      lastUpdated: "6 mins ago",
      status: "online" as const,
    },
  ];

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    console.log("Refreshing all balances");
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "All Balances Updated",
        description: "Successfully refreshed balances across all chains",
      });
    }, 1500);
  };

  const handleRefreshChain = (chainName: string) => {
    console.log(`Refreshing ${chainName}`);
    toast({
      title: "Balance Updated",
      description: `${chainName} balance has been refreshed`,
    });
  };

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
          disabled={isRefreshing}
          data-testid="button-refresh-all"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh All
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chains.map((chain) => (
          <BalanceCard
            key={chain.chainName}
            {...chain}
            onRefresh={() => handleRefreshChain(chain.chainName)}
          />
        ))}
      </div>

      <div className="mt-8 p-6 bg-card border rounded-lg">
        <h3 className="font-semibold mb-2">Total Portfolio Value</h3>
        <div className="text-3xl font-bold font-mono">$4,459.76 USD</div>
        <p className="text-sm text-muted-foreground mt-1">
          Across 6 parachains
        </p>
      </div>
    </div>
  );
}
