import { NetworkMap } from "@/components/NetworkMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function Network() {
  //todo: remove mock functionality
  const nodes = [
    { id: 'polkadot', name: 'Polkadot', blockHeight: 18234567, uptime: 99.9, status: 'online' as const, x: 400, y: 80 },
    { id: 'astar', name: 'Astar', blockHeight: 5123456, uptime: 99.5, status: 'online' as const, x: 250, y: 200 },
    { id: 'moonbeam', name: 'Moonbeam', blockHeight: 4567890, uptime: 98.2, status: 'syncing' as const, x: 550, y: 200 },
    { id: 'acala', name: 'Acala', blockHeight: 3987654, uptime: 99.7, status: 'online' as const, x: 150, y: 320 },
    { id: 'parallel', name: 'Parallel', blockHeight: 2876543, uptime: 99.3, status: 'online' as const, x: 650, y: 320 },
  ];

  const xcmActivity = [
    { from: "Polkadot", to: "Astar", count: 1234, assets: "DOT, ASTR" },
    { from: "Moonbeam", to: "Acala", count: 567, assets: "GLMR, ACA" },
    { from: "Astar", to: "Parallel", count: 890, assets: "ASTR, PARA" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Network Topology</h1>
        <p className="text-muted-foreground">
          Visualize parachain connections and cross-chain message (XCM) activity
        </p>
      </div>

      <NetworkMap nodes={nodes} />

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
