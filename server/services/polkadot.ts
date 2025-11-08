import { ApiPromise, WsProvider } from '@polkadot/api';
import type { ChainBalance, NetworkNode } from '@shared/schema';

interface ChainConfig {
  id: string;
  name: string;
  icon: string;
  rpcEndpoint: string;
  decimals: number;
  symbol: string;
}

const CHAINS: ChainConfig[] = [
  {
    id: 'polkadot',
    name: 'Polkadot',
    icon: '●',
    rpcEndpoint: 'wss://rpc.polkadot.io',
    decimals: 10,
    symbol: 'DOT'
  },
  {
    id: 'astar',
    name: 'Astar',
    icon: '★',
    rpcEndpoint: 'wss://rpc.astar.network',
    decimals: 18,
    symbol: 'ASTR'
  },
  {
    id: 'moonbeam',
    name: 'Moonbeam',
    icon: '◐',
    rpcEndpoint: 'wss://wss.api.moonbeam.network',
    decimals: 18,
    symbol: 'GLMR'
  }
];

const apiCache = new Map<string, { api: ApiPromise; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getApi(chainId: string): Promise<ApiPromise | null> {
  const chain = CHAINS.find(c => c.id === chainId);
  if (!chain) return null;

  const cached = apiCache.get(chainId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.api;
  }

  try {
    const provider = new WsProvider(chain.rpcEndpoint, 3000);
    const api = await ApiPromise.create({ 
      provider,
      throwOnConnect: false,
      throwOnUnknown: false
    });
    
    await api.isReady;
    apiCache.set(chainId, { api, timestamp: Date.now() });
    return api;
  } catch (error) {
    console.error(`Failed to connect to ${chain.name}:`, error);
    return null;
  }
}

export async function fetchBalance(chainId: string, address: string): Promise<ChainBalance | null> {
  const chain = CHAINS.find(c => c.id === chainId);
  if (!chain) return null;

  const api = await getApi(chainId);
  if (!api) {
    return {
      chainId,
      chainName: chain.name,
      balance: '0',
      usdValue: '0',
      lastUpdated: new Date().toISOString(),
      status: 'offline'
    };
  }

  try {
    const accountInfo = await api.query.system.account(address);
    const accountData = accountInfo.toJSON() as any;
    const free = accountData?.data?.free || '0';
    const divisor = BigInt(10) ** BigInt(chain.decimals);
    const balanceInTokens = (BigInt(free) / divisor).toString();
    
    const header = await api.rpc.chain.getHeader();
    const blockHeight = (header.number.toJSON() as any) || 0;

    return {
      chainId,
      chainName: chain.name,
      balance: parseFloat(balanceInTokens).toFixed(4),
      usdValue: (parseFloat(balanceInTokens) * 10).toFixed(2), // Mock USD conversion
      lastUpdated: new Date().toISOString(),
      status: 'online',
      blockHeight
    };
  } catch (error) {
    console.error(`Error fetching balance for ${chain.name}:`, error);
    return {
      chainId,
      chainName: chain.name,
      balance: '0',
      usdValue: '0',
      lastUpdated: new Date().toISOString(),
      status: 'offline'
    };
  }
}

export async function fetchAllBalances(address: string): Promise<ChainBalance[]> {
  const balancePromises = CHAINS.map(chain => fetchBalance(chain.id, address));
  const balances = await Promise.all(balancePromises);
  return balances.filter((b): b is ChainBalance => b !== null);
}

export async function getNetworkStatus(): Promise<NetworkNode[]> {
  const nodePromises = CHAINS.map(async (chain): Promise<NetworkNode> => {
    const api = await getApi(chain.id);
    
    if (!api) {
      return {
        id: chain.id,
        name: chain.name,
        blockHeight: 0,
        uptime: 0,
        status: 'offline',
        rpcEndpoint: chain.rpcEndpoint
      };
    }

    try {
      const header = await api.rpc.chain.getHeader();
      const blockHeight = (header.number.toJSON() as any) || 0;
      
      return {
        id: chain.id,
        name: chain.name,
        blockHeight,
        uptime: 99.5, // Mock uptime percentage
        status: 'online',
        rpcEndpoint: chain.rpcEndpoint
      };
    } catch (error) {
      console.error(`Error getting status for ${chain.name}:`, error);
      return {
        id: chain.id,
        name: chain.name,
        blockHeight: 0,
        uptime: 0,
        status: 'offline',
        rpcEndpoint: chain.rpcEndpoint
      };
    }
  });

  return await Promise.all(nodePromises);
}

export async function disconnectAll(): Promise<void> {
  const entries = Array.from(apiCache.entries());
  for (const [chainId, { api }] of entries) {
    try {
      await api.disconnect();
    } catch (error) {
      console.error(`Error disconnecting ${chainId}:`, error);
    }
  }
  apiCache.clear();
}
