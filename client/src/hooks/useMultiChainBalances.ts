import { useQuery } from "@tanstack/react-query";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ethers, BrowserProvider } from "ethers";
import { getCachedData, setCachedData } from "@/lib/cache";
import type { WalletState } from "./useMultiWallet";

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
  let api: ApiPromise | null = null;
  
  try {
    api = await ApiPromise.create({
      provider: new WsProvider("wss://rpc.polkadot.io"),
    });

    const accountInfo = await api.query.system.account(address);
    const accountData = accountInfo.toJSON() as any;
    const free = accountData?.data?.free || '0';
    // DOT has 10 decimals - calculate 10^10 using BigInt multiplication
    const divisor = BigInt(10000000000); // 10^10
    const balance = (BigInt(free) / divisor).toString();
    const usdValue = (parseFloat(balance) * 7.5).toFixed(2); // Mock price

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
  } finally {
    // Always disconnect to prevent websocket leaks
    if (api) {
      try {
        await api.disconnect();
      } catch (disconnectError) {
        console.error("Error disconnecting from Polkadot API:", disconnectError);
      }
    }
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

export function useMultiChainBalances(walletState: WalletState) {
  return useQuery({
    queryKey: ["/api/multichain/balances", walletState.polkadot.address, walletState.ethereum.address],
    queryFn: async () => {
      const balances: ChainBalance[] = [];

      // Fetch Polkadot balance if connected
      if (walletState.polkadot.connected && walletState.polkadot.address) {
        const cacheKey = `polkadot_balance_${walletState.polkadot.address}`;
        const cached = getCachedData<ChainBalance>(cacheKey);

        try {
          const dotBalance = await getPolkadotBalance(walletState.polkadot.address);
          setCachedData(cacheKey, dotBalance);
          balances.push(dotBalance);
        } catch (error) {
          console.error("Polkadot balance fetch error:", error);
          if (cached) {
            balances.push({ ...cached.data, status: "cached" as const });
          }
        }
      }

      // Fetch Ethereum balance if connected
      if (walletState.ethereum.connected && walletState.ethereum.address) {
        const cacheKey = `ethereum_balance_${walletState.ethereum.address}`;
        const cached = getCachedData<ChainBalance>(cacheKey);

        try {
          const ethBalance = await getEthereumBalance(walletState.ethereum.address);
          setCachedData(cacheKey, ethBalance);
          balances.push(ethBalance);
        } catch (error) {
          console.error("Ethereum balance fetch error:", error);
          if (cached) {
            balances.push({ ...cached.data, status: "cached" as const });
          }
        }
      }

      return balances;
    },
    enabled: walletState.polkadot.connected || walletState.ethereum.connected,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}
