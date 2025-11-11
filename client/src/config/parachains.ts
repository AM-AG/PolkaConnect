export interface ParachainConfig {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  type: 'substrate' | 'evm';
  mockUsdPrice?: number;
}

export const PARACHAINS: ParachainConfig[] = [
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    decimals: 10,
    rpcUrl: 'wss://rpc.polkadot.io',
    type: 'substrate',
    mockUsdPrice: 7.5,
  },
  {
    id: 'astar',
    name: 'Astar',
    symbol: 'ASTR',
    decimals: 18,
    rpcUrl: 'wss://rpc.astar.network',
    type: 'substrate',
    mockUsdPrice: 0.08,
  },
  {
    id: 'moonbeam',
    name: 'Moonbeam',
    symbol: 'GLMR',
    decimals: 18,
    rpcUrl: 'https://rpc.api.moonbeam.network',
    type: 'evm',
    mockUsdPrice: 0.25,
  },
];

export const ETHEREUM_CONFIG = {
  id: 'ethereum',
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  rpcUrl: 'https://eth.llamarpc.com',
  type: 'evm' as const,
  mockUsdPrice: 3500,
};
