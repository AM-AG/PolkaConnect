import { useState, useEffect } from 'react';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

export function useWallet() {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Enable the extension
      const extensions = await web3Enable('PolkaConnect');
      
      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install Polkadot.js extension.');
      }

      // Get all accounts
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found in your wallet extension.');
      }

      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);
      
      // Store in localStorage for persistence
      localStorage.setItem('polkaconnect_wallet_connected', 'true');
      localStorage.setItem('polkaconnect_selected_address', allAccounts[0].address);
      
      return allAccounts[0];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setError(null);
    localStorage.removeItem('polkaconnect_wallet_connected');
    localStorage.removeItem('polkaconnect_selected_address');
  };

  const selectAccount = (address: string) => {
    const account = accounts.find(acc => acc.address === address);
    if (account) {
      setSelectedAccount(account);
      localStorage.setItem('polkaconnect_selected_address', address);
    }
  };

  // Auto-reconnect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('polkaconnect_wallet_connected');
    if (wasConnected === 'true') {
      connectWallet().catch(console.error);
    }
  }, []);

  return {
    accounts,
    selectedAccount,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    selectAccount,
    isConnected: selectedAccount !== null,
  };
}
