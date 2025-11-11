import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, GitBranch, Activity } from "lucide-react";
import { useMultiWallet } from "@/hooks/useMultiWallet";
import { useMultiChainBalances } from "@/hooks/useMultiChainBalances";
import { useGovernance } from "@/hooks/useGovernance";
import { useXcmData } from "@/hooks/useXcmData";

export function MultiChainStats() {
  const { walletState, isAnyConnected } = useMultiWallet();
  const { data: balances } = useMultiChainBalances(walletState);
  const { data: proposals } = useGovernance();
  const { data: xcmChannels } = useXcmData();

  const totalValue = balances?.reduce((sum, b) => sum + parseFloat(b.usdValue || "0"), 0) || 0;
  const activeProposals = proposals?.length || 0;
  const activeChannels = xcmChannels?.filter(c => c.active).length || 0;

  const getNetworkStatus = () => {
    if (walletState.polkadot.connected && walletState.ethereum.connected) {
      return "Dual Chain";
    }
    if (walletState.polkadot.connected) {
      return "Polkadot";
    }
    if (walletState.ethereum.connected) {
      return "Ethereum";
    }
    return "Disconnected";
  };

  const getNetworkDescription = () => {
    const connected = [];
    if (walletState.polkadot.connected) connected.push("DOT");
    if (walletState.ethereum.connected) connected.push("ETH");
    
    if (connected.length === 0) return "Connect wallet";
    return connected.join(" + ");
  };

  const stats = [
    {
      title: "Portfolio Value",
      value: `$${totalValue.toFixed(2)}`,
      description: `${balances?.length || 0} chain${balances && balances.length > 1 ? 's' : ''}`,
      icon: Wallet,
      testId: "stat-portfolio-value",
    },
    {
      title: "Active Proposals",
      value: activeProposals.toString(),
      description: "OpenGov referenda",
      icon: TrendingUp,
      testId: "stat-active-proposals",
    },
    {
      title: "XCM Channels",
      value: activeChannels.toString(),
      description: "Connected parachains",
      icon: GitBranch,
      testId: "stat-xcm-channels",
    },
    {
      title: "Network Status",
      value: getNetworkStatus(),
      description: getNetworkDescription(),
      icon: Activity,
      testId: "stat-network-status",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} data-testid={stat.testId}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid={`${stat.testId}-value`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
