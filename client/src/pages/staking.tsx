import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Unlock, TrendingUp, Award, Wallet } from "lucide-react";
import type { StakingInfo } from "@shared/schema";

export default function Staking() {
  const { activePolkadotAccount } = useWallet();
  const address = activePolkadotAccount?.address;

  const { data: stakingInfo, isLoading, error } = useQuery<StakingInfo>({
    queryKey: ["/api/staking", address],
    enabled: !!address,
  });

  if (!address) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Staking</h1>
          <p className="text-muted-foreground">Manage your DOT staking and nominations</p>
        </div>
        <Alert data-testid="alert-connect-wallet">
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Please connect your Polkadot.js wallet to view staking information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Staking</h1>
        <p className="text-muted-foreground">Manage your DOT staking and nominations</p>
      </div>

      {error && (
        <Alert variant="destructive" data-testid="alert-error" className="mb-6">
          <AlertDescription>
            Failed to load staking information. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
      </div>

      <div className="mt-6">
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
      </div>
    </div>
  );
}
