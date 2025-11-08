import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NetworkNode {
  id: string;
  name: string;
  blockHeight: number;
  uptime: number;
  status: "online" | "syncing" | "offline";
  x: number;
  y: number;
}

interface NetworkMapProps {
  nodes: NetworkNode[];
}

export function NetworkMap({ nodes }: NetworkMapProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "stroke-green-500 fill-green-500/20";
      case "syncing":
        return "stroke-yellow-500 fill-yellow-500/20";
      case "offline":
        return "stroke-red-500 fill-red-500/20";
      default:
        return "stroke-gray-500 fill-gray-500/20";
    }
  };

  return (
    <Card data-testid="card-network-map">
      <CardHeader>
        <CardTitle>Parachain Network Topology</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 bg-muted/30 rounded-lg overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 800 400">
            {nodes.map((node, idx) => {
              const nextNode = nodes[(idx + 1) % nodes.length];
              return (
                <line
                  key={`link-${node.id}-${nextNode.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border opacity-50"
                  strokeDasharray="4 4"
                />
              );
            })}

            {nodes.map((node) => (
              <g key={node.id} data-testid={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="40"
                  className={getStatusColor(node.status)}
                  strokeWidth="2"
                />
                <text
                  x={node.x}
                  y={node.y - 5}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-foreground"
                >
                  {node.name}
                </text>
                <text
                  x={node.x}
                  y={node.y + 10}
                  textAnchor="middle"
                  className="text-[10px] fill-muted-foreground font-mono"
                >
                  #{node.blockHeight.toLocaleString()}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center gap-2 text-sm"
              data-testid={`node-info-${node.id}`}
            >
              <Badge variant="outline" className="gap-1">
                <div className={`h-2 w-2 rounded-full ${
                  node.status === 'online' ? 'bg-green-500' :
                  node.status === 'syncing' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                {node.name}
              </Badge>
              <span className="text-muted-foreground">
                {node.uptime}% uptime
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
