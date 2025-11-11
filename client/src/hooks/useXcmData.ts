import { useQuery } from "@tanstack/react-query";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { getCachedData, setCachedData } from "@/lib/cache";

export interface XcmChannel {
  parachainId: number;
  name: string;
  active: boolean;
}

async function getXcmChannels(): Promise<XcmChannel[]> {
  try {
    const api = await ApiPromise.create({
      provider: new WsProvider("wss://rpc.polkadot.io"),
    });

    const parachains = await api.query.paras.parachains();
    const parachainsArray = parachains.toJSON() as any[];
    const parachainIds = parachainsArray.map((para: any) => parseInt(para.toString()));

    await api.disconnect();

    // Map known parachain IDs to names
    const parachainNames: Record<number, string> = {
      1000: "Statemint",
      2000: "Acala",
      2004: "Moonbeam",
      2006: "Astar",
      2012: "Parallel",
      2030: "Bifrost",
      2032: "Interlay",
      2034: "HydraDX",
    };

    return parachainIds.map((id: number) => ({
      parachainId: id,
      name: parachainNames[id] || `Parachain ${id}`,
      active: true,
    }));
  } catch (error) {
    console.error("XCM channels fetch error:", error);
    return [];
  }
}

export function useXcmData() {
  return useQuery({
    queryKey: ["/api/xcm/channels"],
    queryFn: async () => {
      const cacheKey = "xcm_channels";
      const cached = getCachedData<XcmChannel[]>(cacheKey);

      try {
        const channels = await getXcmChannels();
        setCachedData(cacheKey, channels);
        return channels;
      } catch (error) {
        console.error("XCM data fetch error:", error);
        if (cached) {
          return cached.data;
        }
        return [];
      }
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 120000,
  });
}
