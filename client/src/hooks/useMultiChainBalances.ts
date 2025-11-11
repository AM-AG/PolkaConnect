import { useQuery } from "@tanstack/react-query";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ethers, JsonRpcProvider, BrowserProvider } from "ethers";
import { getCachedData, setCachedData } from "@/lib/cache";
import type { WalletState } from "./useMultiWallet";
import { PARACHAINS, ETHEREUM_CONFIG, type ParachainConfig } from "@/config/parachains";

export interface ChainBalance {
  chainId: string;
  chainName: string;
  balance: string;
  usdValue: string;
  symbol: string;
  lastUpdated: string;
  status: "online" | "syncing" | "offline" | "cached";
}

async function getSubstrateBalance(
  config: ParachainConfig,
  address: string
): Promise<ChainBalance> {
  let api: ApiPromise | null = null;

  try {
    api = await ApiPromise.create({
      provider: new WsProvider(config.rpcUrl),
    });

    const accountInfo = await api.query.system.account(address);
    const accountData = accountInfo.toJSON() as any;
    const free = accountData?.data?.free || "0";

    // Use proper decimal formatting to preserve fractional precision
    const divisor = BigInt("1" + "0".repeat(config.decimals));
    const freeBalance = BigInt(free);
    const wholePart = freeBalance / divisor;
    const fractionalPart = freeBalance % divisor;
    
    // Format with proper decimals (e.g., "123.456789")
    const fractionalStr = fractionalPart.toString().padStart(config.decimals, "0");
    const balance = `${wholePart}.${fractionalStr}`.replace(/\.?0+$/, "") || "0";
    const usdValue = (parseFloat(balance) * (config.mockUsdPrice || 0)).toFixed(2);

    return {
      chainId: config.id,
      chainName: config.name,
      balance,
      usdValue,
      symbol: config.symbol,
      lastUpdated: new Date().toISOString(),
      status: "online",
    };
  } catch (error) {
    console.error(`${config.name} balance fetch error:`, error);
    return {
      chainId: config.id,
      chainName: config.name,
      balance: "0",
      usdValue: "0",
      symbol: config.symbol,
      lastUpdated: new Date().toISOString(),
      status: "offline",
    };
  } finally {
    if (api) {
      try {
        await api.disconnect();
      } catch (disconnectError) {
        console.error(`Error disconnecting from ${config.name}:`, disconnectError);
      }
    }
  }
}

async function getEvmBalance(
  config: typeof ETHEREUM_CONFIG | ParachainConfig,
  address: string,
  useBrowserProvider = false
): Promise<ChainBalance> {
  try {
    const provider = useBrowserProvider && window.ethereum
      ? new BrowserProvider(window.ethereum)
      : new JsonRpcProvider(config.rpcUrl);

    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatUnits(balance, config.decimals);
    const usdValue = (parseFloat(balanceInEth) * (config.mockUsdPrice || 0)).toFixed(2);

    return {
      chainId: config.id,
      chainName: config.name,
      balance: balanceInEth,
      usdValue,
      symbol: config.symbol,
      lastUpdated: new Date().toISOString(),
      status: "online",
    };
  } catch (error) {
    console.error(`${config.name} balance fetch error:`, error);
    return {
      chainId: config.id,
      chainName: config.name,
      balance: "0",
      usdValue: "0",
      symbol: config.symbol,
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

      // Fetch all parachain balances if Polkadot connected
      if (walletState.polkadot.connected && walletState.polkadot.address) {
        const address = walletState.polkadot.address;

        // Map parachains to balance fetch promises (only Substrate chains for Polkadot wallet)
        const parachainFetches = PARACHAINS.filter(config => config.type === "substrate")
          .map(async (config) => {
            const cacheKey = `balance:${config.id}:${address}`;
            const cached = getCachedData<ChainBalance>(cacheKey);

            try {
              const balance = await getSubstrateBalance(config, address);
              setCachedData(cacheKey, balance);
              return balance;
            } catch (error) {
              console.debug(`${config.name} balance fetch failed, using cache:`, error);
              if (cached) {
                return { ...cached.data, status: "cached" as const };
              }
              // Return offline placeholder
              return {
                chainId: config.id,
                chainName: config.name,
                balance: "0",
                usdValue: "0",
                symbol: config.symbol,
                lastUpdated: new Date().toISOString(),
                status: "offline" as const,
              };
            }
          });

        // Use Promise.allSettled to handle failures gracefully
        const results = await Promise.allSettled(parachainFetches);
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            balances.push(result.value);
          }
        });
      }

      // Fetch Ethereum and EVM parachain balances if MetaMask connected
      if (walletState.ethereum.connected && walletState.ethereum.address) {
        const address = walletState.ethereum.address;

        // Fetch Ethereum mainnet balance
        const ethCacheKey = `balance:${ETHEREUM_CONFIG.id}:${address}`;
        const ethCached = getCachedData<ChainBalance>(ethCacheKey);

        try {
          const ethBalance = await getEvmBalance(ETHEREUM_CONFIG, address, true);
          setCachedData(ethCacheKey, ethBalance);
          balances.push(ethBalance);
        } catch (error) {
          console.debug("Ethereum balance fetch failed, using cache:", error);
          if (ethCached) {
            balances.push({ ...ethCached.data, status: "cached" as const });
          } else {
            balances.push({
              chainId: ETHEREUM_CONFIG.id,
              chainName: ETHEREUM_CONFIG.name,
              balance: "0",
              usdValue: "0",
              symbol: ETHEREUM_CONFIG.symbol,
              lastUpdated: new Date().toISOString(),
              status: "offline",
            });
          }
        }

        // Fetch EVM-compatible parachain balances (e.g., Moonbeam)
        const evmParachainFetches = PARACHAINS.filter(config => config.type === "evm")
          .map(async (config) => {
            const cacheKey = `balance:${config.id}:${address}`;
            const cached = getCachedData<ChainBalance>(cacheKey);

            try {
              const balance = await getEvmBalance(config, address, false);
              setCachedData(cacheKey, balance);
              return balance;
            } catch (error) {
              console.debug(`${config.name} balance fetch failed, using cache:`, error);
              if (cached) {
                return { ...cached.data, status: "cached" as const };
              }
              return {
                chainId: config.id,
                chainName: config.name,
                balance: "0",
                usdValue: "0",
                symbol: config.symbol,
                lastUpdated: new Date().toISOString(),
                status: "offline" as const,
              };
            }
          });

        const evmResults = await Promise.allSettled(evmParachainFetches);
        evmResults.forEach((result) => {
          if (result.status === "fulfilled") {
            balances.push(result.value);
          }
        });
      }

      return balances;
    },
    enabled: walletState.polkadot.connected || walletState.ethereum.connected,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}
