import { useQuery } from "@tanstack/react-query";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ethers, BrowserProvider } from "ethers";
import { getCachedData, setCachedData } from "@/lib/cache";

export interface ChainBalance {
  chainId: string;
  chainName: string;
  balance: string;
  usdValue: string;
  symbol: string;
  lastUpdated: string;
  status: "online" | "syncing" | "offline" | "cached";
}

async function getPolkadotBalance(address: string): Promise<ChainBalance> {
  try {
    const api = await ApiPromise.create({
      provider: new WsProvider("wss://rpc.polkadot.io"),
    });

    const accountInfo = await api.query.system.account(address);
    const accountData = accountInfo.toJSON() as any;
    const free = accountData?.data?.free || '0';
    const divisor = BigInt(10) ** BigInt(10); // DOT has 10 decimals
    const balance = (BigInt(free) / divisor).toString();
    const usdValue = (parseFloat(balance) * 7.5).toFixed(2); // Mock price

    await api.disconnect();

    return {
      chainId: "polkadot",
      chainName: "Polkadot",
      balance,
      usdValue,
      symbol: "DOT",
      lastUpdated: new Date().toISOString(),
      status: "online",
    };
  } catch (error) {
    console.error("Polkadot balance fetch error:", error);
    return {
      chainId: "polkadot",
      chainName: "Polkadot",
      balance: "0",
      usdValue: "0",
      symbol: "DOT",
      lastUpdated: new Date().toISOString(),
      status: "offline",
    };
  }
}

async function getEthereumBalance(address: string): Promise<ChainBalance> {
  try {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider");
    }

    const provider = new BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    const usdValue = (parseFloat(balanceInEth) * 2400).toFixed(2); // Mock price

    return {
      chainId: "ethereum",
      chainName: "Ethereum",
      balance: balanceInEth,
      usdValue,
      symbol: "ETH",
      lastUpdated: new Date().toISOString(),
      status: "online",
    };
  } catch (error) {
    console.error("Ethereum balance fetch error:", error);
    return {
      chainId: "ethereum",
      chainName: "Ethereum",
      balance: "0",
      usdValue: "0",
      symbol: "ETH",
      lastUpdated: new Date().toISOString(),
      status: "offline",
    };
  }
}

export function useMultiChainBalances(address: string | null, walletType: "polkadot" | "ethereum" | null) {
  return useQuery({
    queryKey: ["/api/multichain/balances", address, walletType],
    queryFn: async () => {
      if (!address || !walletType) {
        return [];
      }

      const cacheKey = `multichain_balances_${walletType}_${address}`;
      const cached = getCachedData<ChainBalance[]>(cacheKey);

      try {
        const balances: ChainBalance[] = [];

        if (walletType === "polkadot") {
          // Fetch Polkadot and its parachains
          const dotBalance = await getPolkadotBalance(address);
          balances.push(dotBalance);

          // You can add Astar, Moonbeam etc here
        } else if (walletType === "ethereum") {
          // Fetch Ethereum balance
          const ethBalance = await getEthereumBalance(address);
          balances.push(ethBalance);

          // You can add other EVM chains here
        }

        setCachedData(cacheKey, balances);
        return balances;
      } catch (error) {
        console.error("Multi-chain balance fetch error:", error);
        if (cached) {
          return cached.data.map((b: ChainBalance) => ({ ...b, status: "cached" as const }));
        }
        return [];
      }
    },
    enabled: !!address && !!walletType,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}
