import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Badge } from "@/components/ui/badge";
import { Activity, Dot } from "lucide-react";

interface ChainEvent {
  section: string;
  method: string;
  timestamp: Date;
}

export function ActivityFeed() {
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => Promise<void>) | undefined;
    let api: ApiPromise | undefined;

    async function subscribeEvents() {
      try {
        const provider = new WsProvider("wss://rpc.polkadot.io");
        api = await ApiPromise.create({ provider });

        setIsConnected(true);
        setError(null);

        const unsub: any = await api.query.system.events((records: any) => {
          const latest = records
            .slice(-10)
            .reverse()
            .map((record: any) => ({
              section: record.event.section,
              method: record.event.method,
              timestamp: new Date(),
            }));
          setEvents(latest);
        });
        
        unsubscribe = unsub;
      } catch (err) {
        console.error("Failed to subscribe to events:", err);
        setError("Failed to connect to Polkadot network");
        setIsConnected(false);
      }
    }

    subscribeEvents();

    return () => {
      (async () => {
        try {
          if (unsubscribe) {
            await unsubscribe();
          }
          if (api) {
            await api.disconnect();
          }
        } catch (err) {
          console.error("Error cleaning up Polkadot API connection:", err);
        }
      })();
    };
  }, []);

  const getEventColor = (section: string) => {
    const colors: Record<string, string> = {
      balances: "text-green-600 dark:text-green-400",
      staking: "text-blue-600 dark:text-blue-400",
      democracy: "text-purple-600 dark:text-purple-400",
      xcmPallet: "text-orange-600 dark:text-orange-400",
      system: "text-gray-600 dark:text-gray-400",
    };
    return colors[section] || "text-foreground";
  };

  return (
    <Card data-testid="card-activity-feed">
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
        <CardTitle>Live Community Activity</CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Badge variant="outline" className="text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              Live
            </Badge>
          )}
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Connecting to Polkadot network...
          </div>
        ) : (
          <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
            {events.map((event, i) => (
              <div
                key={`${event.section}-${event.method}-${i}`}
                className="flex items-start gap-2 hover-elevate rounded p-2"
                data-testid={`activity-event-${i}`}
              >
                <Dot className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <span className={getEventColor(event.section)}>
                    {event.section}.{event.method}
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
