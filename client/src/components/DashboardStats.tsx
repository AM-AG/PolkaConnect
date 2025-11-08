import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Wallet } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
          {value}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${
            trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Balance"
        value="$2,779.77"
        change="+12.5%"
        trend="up"
        icon={<Wallet className="h-4 w-4" />}
      />
      <StatCard
        title="Active Proposals"
        value="8"
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Connected Chains"
        value="3"
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Network Uptime"
        value="99.2%"
        change="+0.3%"
        trend="up"
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}
