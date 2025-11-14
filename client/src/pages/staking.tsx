import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, TrendingUp, Award, Wallet, Calculator, Info, Star } from "lucide-react";
import { useStakingAnalytics } from "@/hooks/useStakingAnalytics";
import { StakeDialog } from "@/components/StakeDialog";
import type { StakingInfo } from "@shared/schema";

export default function Staking() {
  const { activePolkadotAccount } = useWallet();
  const address = activePolkadotAccount?.address;
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);

  const { data: stakingInfo, isLoading, error } = useQuery<StakingInfo>({
    queryKey: ["/api/staking", address],
    enabled: !!address,
  });

  const bondedAmount = stakingInfo?.bondedBalance || "100";
  const { data: analytics, isLoading: analyticsLoading } = useStakingAnalytics(bondedAmount);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Staking</h1>
          <p className="text-muted-foreground">Manage your DOT staking and nominations</p>
        </div>
        {address && (
          <Button 
            onClick={() => setIsStakeDialogOpen(true)}
            data-testid="button-stake-dot"
          >
            <Lock className="mr-2 h-4 w-4" />
            Stake DOT
          </Button>
        )}
      </div>

      <StakeDialog 
        open={isStakeDialogOpen} 
        onOpenChange={setIsStakeDialogOpen} 
      />

      {/* Staking Analytics & Encouragement - Always visible */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card data-testid="card-staking-calculator">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Staking Rewards Calculator
            </CardTitle>
            <CardDescription>
              Estimate your potential earnings from staking DOT
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : analytics && analytics.projections && analytics.averageApy && analytics.minStake ? (
              <div className="space-y-4" data-testid="container-analytics-data">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">Average APY</div>
                  <div className="text-3xl font-bold text-primary" data-testid="text-average-apy">{analytics.averageApy}%</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Daily Earnings</span>
                    <span className="font-mono font-semibold" data-testid="text-daily-earnings">{analytics.projections.daily} DOT</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Earnings</span>
                    <span className="font-mono font-semibold" data-testid="text-monthly-earnings">{analytics.projections.monthly} DOT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Yearly Earnings</span>
                    <span className="font-mono font-bold text-lg text-primary" data-testid="text-yearly-earnings">{analytics.projections.yearly} DOT</span>
                  </div>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription data-testid="text-staking-info">
                    Minimum stake: {analytics.minStake} • Unbonding: {analytics.unbondingPeriod} days
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4" data-testid="text-analytics-loading">
                Loading analytics...
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-top-validators">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Validators
            </CardTitle>
            <CardDescription>
              Recommended validators with high APY and reliability
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : analytics && analytics.topValidators && analytics.topValidators.length > 0 ? (
              <div className="space-y-2" data-testid="list-top-validators">
                {analytics.topValidators.slice(0, 5).map((validator, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md bg-muted/30 hover-elevate"
                    data-testid={`validator-${index}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{validator.name || `Validator ${index + 1}`}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {validator.address.slice(0, 10)}...{validator.address.slice(-8)}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {validator.apy}% APY
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{validator.commission}% fee</span>
                      <span>•</span>
                      <span>{validator.nominators} nominators</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        {validator.reputation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Loading validator data...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallet Connect Alert */}
      {!address && (
        <Alert data-testid="alert-connect-wallet" className="mb-6">
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Connect your Polkadot.js wallet to view your personal staking information and manage nominations.
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Staking Info - Only when wallet connected */}
      {address && error && (
        <Alert variant="destructive" data-testid="alert-error" className="mb-6">
          <AlertDescription>
            Failed to load staking information. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {address && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card data-testid="card-bonded-balance">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonded Balance</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-bonded-amount">
                  {stakingInfo?.bondedBalance || "0"} DOT
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stakingInfo?.status === "online" ? "Live data" : "Cached"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-active-nominations">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nominations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-nominations-count">
                  {stakingInfo?.nominations?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Validators nominated
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-pending-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-pending-rewards">
                  {stakingInfo?.rewardsPending || "0"} DOT
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stakingInfo?.status === "online" ? "Live data" : "Cached"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>}

      {address && <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-nominations-list">
          <CardHeader>
            <CardTitle>Your Nominations</CardTitle>
            <CardDescription>
              Validators you are currently nominating
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stakingInfo?.nominations && stakingInfo.nominations.length > 0 ? (
              <div className="space-y-2" data-testid="list-nominations">
                {stakingInfo.nominations.map((validator, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md bg-muted/50 font-mono text-sm"
                    data-testid={`nomination-${index}`}
                  >
                    {validator}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-nominations">
                No active nominations. Start staking to nominate validators.
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-unlocking">
          <CardHeader>
            <CardTitle>Unlocking Schedule</CardTitle>
            <CardDescription>
              DOT being unbonded (28-day waiting period)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stakingInfo?.unlocking && stakingInfo.unlocking.length > 0 ? (
              <div className="space-y-3" data-testid="list-unlocking">
                {stakingInfo.unlocking.map((unlock, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`unlocking-${index}`}
                  >
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{unlock.value} DOT</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Era {unlock.era}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-no-unlocking">
                No DOT currently unbonding.
              </p>
            )}
          </CardContent>
        </Card>
      </div>}

      {address && <div className="mt-6">
        <Card data-testid="card-staking-actions">
          <CardHeader>
            <CardTitle>Staking Actions</CardTitle>
            <CardDescription>
              Manage your staking positions (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button disabled data-testid="button-nominate">
                Nominate Validators
              </Button>
              <Button disabled variant="outline" data-testid="button-bond-more">
                Bond More DOT
              </Button>
              <Button disabled variant="outline" data-testid="button-unbond">
                Unbond DOT
              </Button>
              <Button disabled variant="outline" data-testid="button-withdraw">
                Withdraw Unbonded
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Transaction submission features are under development. Currently showing read-only data.
            </p>
          </CardContent>
        </Card>
      </div>}
    </div>
  );
}
