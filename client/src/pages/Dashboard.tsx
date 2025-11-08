import { DashboardStats } from "@/components/DashboardStats";
import { BalanceCard } from "@/components/BalanceCard";
import { ProposalCard } from "@/components/ProposalCard";
import { StatusBanner } from "@/components/StatusBanner";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useBalances } from "@/hooks/useBalances";
import { useGovernance } from "@/hooks/useGovernance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { selectedAccount, isConnected } = useWallet();
  const { data: balances, isLoading: balancesLoading, refetch: refetchBalances } = useBalances(
    selectedAccount?.address || null
  );
  const { data: proposals, isLoading: proposalsLoading } = useGovernance();

  const handleVote = (proposalId: number, vote: "aye" | "nay") => {
    console.log(`Voted ${vote} on proposal ${proposalId}`);
    toast({
      title: "Vote Submitted",
      description: `Your ${vote.toUpperCase()} vote has been recorded for proposal #${proposalId}`,
    });
  };

  const handleRefresh = (chainName: string) => {
    console.log(`Refreshing ${chainName} balance`);
    refetchBalances();
    toast({
      title: "Balance Updated",
      description: `${chainName} balance has been refreshed`,
    });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert className="max-w-md">
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Please connect your Polkadot wallet to view your dashboard and balances.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your multi-chain portfolio and participate in governance
        </p>
      </div>

      <DashboardStats />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Chain Balances</h2>
        {balancesLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : balances && balances.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {balances.map((balance) => (
              <BalanceCard
                key={balance.chainId}
                chainName={balance.chainName}
                chainIcon={balance.chainId === 'polkadot' ? '●' : balance.chainId === 'astar' ? '★' : '◐'}
                balance={balance.balance}
                usdValue={balance.usdValue}
                lastUpdated={formatLastUpdated(balance.lastUpdated)}
                status={balance.status}
                onRefresh={() => handleRefresh(balance.chainName)}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No balances found. Make sure your wallet has assets on supported chains.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Proposals</h2>
        {proposalsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-4">
            {proposals.slice(0, 5).map((proposal) => (
              <ProposalCard
                key={proposal.id}
                {...proposal}
                onVote={(vote) => handleVote(proposal.id, vote)}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No active proposals at the moment. Check back later for governance updates.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
