import { web3Enable, web3Accounts, type InjectedAccountWithMeta } from '@polkadot/extension-dapp';

export interface WalletConnection {
  chain: 'polkadot' | 'ethereum';
  accounts: string[] | InjectedAccountWithMeta[];
}

export async function connectWallet(chain: 'polkadot' | 'ethereum'): Promise<WalletConnection> {
  if (chain === 'polkadot') {
    const extensions = await web3Enable('PolkaConnect SDK');
    if (extensions.length === 0) {
      throw new Error('No Polkadot.js extension found. Please install it from polkadot.js.org/extension');
    }
    const accounts = await web3Accounts();
    if (accounts.length === 0) {
      throw new Error('No Polkadot accounts found. Please create one in your extension.');
    }
    return { chain, accounts };
  }

  if (chain === 'ethereum') {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found. Please install it from metamask.io');
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }) as string[];
    
    return { chain, accounts };
  }

  throw new Error(`Unsupported chain: ${chain}`);
}

export interface BalanceResponse {
  balance: string;
  formatted: string;
  chain: string;
  status: string;
}

export async function getWalletBalance(
  chain: string, 
  address: string,
  baseUrl: string = 'https://polkaconnect.replit.app'
): Promise<BalanceResponse> {
  const endpoint = `${baseUrl}/api/balance?chain=${chain}&address=${address}`;
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch balance: ${response.statusText}`);
  }
  
  return response.json();
}
