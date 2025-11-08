import { NetworkMap } from "@/components/NetworkMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useNetwork } from "@/hooks/useNetwork";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Network() {
  const { data: nodes, isLoading } = useNetwork();

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

  const xcmActivity = [
    { from: "Polkadot", to: "Astar", count: 1234, assets: "DOT, ASTR" },
    { from: "Moonbeam", to: "Polkadot", count: 567, assets: "GLMR, DOT" },
    { from: "Astar", to: "Moonbeam", count: 890, assets: "ASTR, GLMR" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Network Topology</h1>
        <p className="text-muted-foreground">
          Visualize parachain connections and cross-chain message (XCM) activity
        </p>
      </div>

      {isLoading ? (
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
            Recent XCM Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {xcmActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                data-testid={`xcm-activity-${idx}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{activity.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{activity.to}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{activity.count} transfers</div>
                  <div className="text-xs text-muted-foreground">{activity.assets}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
