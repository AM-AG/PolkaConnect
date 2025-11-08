import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Circle } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  chainName: string;
  chainIcon?: string;
  balance: string;
  usdValue: string;
  lastUpdated: string;
  status: "online" | "syncing" | "offline";
  onRefresh?: () => void;
}

export function BalanceCard({
  chainName,
  chainIcon,
  balance,
  usdValue,
  lastUpdated,
  status,
  onRefresh,
}: BalanceCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const statusColor = {
    online: "text-green-500",
    syncing: "text-yellow-500",
    offline: "text-red-500",
  };

  const statusText = {
    online: "Online",
    syncing: "Syncing",
    offline: "Offline",
  };

  return (
    <Card data-testid={`card-balance-${chainName.toLowerCase()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {chainIcon && (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">{chainIcon}</span>
            </div>
          )}
          <h3 className="font-semibold text-lg">{chainName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs ${statusColor[status]}`}>
            <Circle className="h-2 w-2 fill-current" />
            <span>{statusText[status]}</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid={`button-refresh-${chainName.toLowerCase()}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-3xl font-bold font-mono" data-testid={`text-balance-${chainName.toLowerCase()}`}>
            {balance}
          </div>
          <div className="text-sm text-muted-foreground" data-testid={`text-usd-${chainName.toLowerCase()}`}>
            ${usdValue} USD
          </div>
          <div className="text-xs text-muted-foreground pt-2">
            Updated {lastUpdated}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
