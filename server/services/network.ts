import type { XcmActivity } from "@shared/schema";

// Simulate dynamic XCM activity data
// In production, this would query chain events or an indexer
export async function getXcmActivity(): Promise<XcmActivity[]> {
  const now = Date.now();
  const hour = Math.floor(now / (1000 * 60 * 60));
  
  // Deterministic but changing values based on current hour
  const baseActivity = [
    { from: "Polkadot", to: "Astar", base: 1200 },
    { from: "Polkadot", to: "Moonbeam", base: 850 },
    { from: "Astar", to: "Moonbeam", base: 620 },
    { from: "Moonbeam", to: "Polkadot", base: 540 },
    { from: "Polkadot", to: "Acala", base: 380 },
  ];

  return baseActivity.map((activity, idx) => {
    // Vary count based on hour to show "live" updates
    const variance = Math.sin(hour + idx) * 200;
    const count = Math.floor(activity.base + variance);
    
    return {
      from: activity.from,
      to: activity.to,
      count: Math.max(count, 100),
      assets: getAssetsForRoute(activity.from, activity.to),
      volume24h: `${(count * 15.5).toFixed(2)} DOT`,
      lastTransfer: getRecentTime(idx),
    };
  });
}

function getAssetsForRoute(from: string, to: string): string {
  const routes: Record<string, string> = {
    "Polkadot-Astar": "DOT, ASTR",
    "Polkadot-Moonbeam": "DOT, GLMR",
    "Astar-Moonbeam": "ASTR, GLMR",
    "Moonbeam-Polkadot": "GLMR, DOT",
    "Polkadot-Acala": "DOT, ACA",
  };
  return routes[`${from}-${to}`] || "DOT";
}

function getRecentTime(index: number): string {
  const minutes = [2, 5, 8, 12, 15][index] || 10;
  return `${minutes}m ago`;
}
