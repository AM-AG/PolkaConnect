import { NetworkMap } from "@/components/NetworkMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Clock } from "lucide-react";
import { useNetwork } from "@/hooks/useNetwork";
import { useXcmActivity } from "@/hooks/useXcmActivity";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function Network() {
  const { data: nodes, isLoading: nodesLoading } = useNetwork();
  const { data: xcmActivity, isLoading: xcmLoading } = useXcmActivity();

  const positionNodes = (nodeList: any[]) => {
    const positions = [
      { x: 400, y: 80 },
      { x: 250, y: 200 },
      { x: 550, y: 200 },
      { x: 150, y: 320 },
      { x: 650, y: 320 },
    ];

    return nodeList.map((node, idx) => ({
      ...node,
      x: positions[idx]?.x || 400,
      y: positions[idx]?.y || 200,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Network Topology</h1>
        <p className="text-muted-foreground">
          Visualize parachain connections and cross-chain message (XCM) activity
        </p>
      </div>

      {nodesLoading ? (
        <div className="h-96 bg-card rounded-lg animate-pulse" />
      ) : nodes && nodes.length > 0 ? (
        <NetworkMap nodes={positionNodes(nodes)} />
      ) : (
        <Alert>
          <AlertDescription>
            Unable to load network data. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live XCM Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {xcmLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : xcmActivity && xcmActivity.length > 0 ? (
            <div className="space-y-3">
              {xcmActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover-elevate"
                  data-testid={`xcm-activity-${idx}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{activity.from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-sm">{activity.to}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {activity.volume24h}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.lastTransfer}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold">{activity.count}</div>
                    <div className="text-xs text-muted-foreground">transfers</div>
                    <div className="text-xs text-muted-foreground mt-1">{activity.assets}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No XCM activity data available. Check back soon.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
