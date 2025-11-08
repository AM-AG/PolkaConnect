import { AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatusBannerProps {
  mode: "syncing" | "offline" | "cached" | "online";
  message?: string;
}

export function StatusBanner({ mode, message }: StatusBannerProps) {
  const config = {
    syncing: {
      icon: Wifi,
      variant: "default" as const,
      defaultMessage: "Syncing with network...",
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    offline: {
      icon: WifiOff,
      variant: "destructive" as const,
      defaultMessage: "Connection lost. Showing cached data.",
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
    cached: {
      icon: AlertCircle,
      variant: "default" as const,
      defaultMessage: "Using cached data from previous session.",
      className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    online: {
      icon: CheckCircle,
      variant: "default" as const,
      defaultMessage: "Connected to network.",
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
  };

  const { icon: Icon, variant, defaultMessage, className } = config[mode];

  return (
    <Alert variant={variant} className={className} data-testid={`banner-${mode}`}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{message || defaultMessage}</AlertDescription>
    </Alert>
  );
}
