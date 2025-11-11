import { useState, useEffect } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";

export interface PolkadotAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

export interface WalletState {
  polkadot: {
    connected: boolean;
    address: string | null;
    accounts: PolkadotAccount[];
  };
  ethereum: {
    connected: boolean;
    address: string | null;
  };
}

export function useMultiWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    polkadot: {
      connected: false,
      address: null,
      accounts: [],
    },
    ethereum: {
      connected: false,
      address: null,
    },
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectPolkadot = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log("Connecting to Polkadot.js extension...");

      // Detect Edge browser and provide specific guidance
      const isEdge = typeof navigator !== 'undefined' && /Edg/.test(navigator.userAgent);
      
      if (isEdge) {
        console.log("Edge browser detected - providing Edge-specific guidance");
      }

      const extensions = await Promise.race([
        web3Enable("PolkaConnect"),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Extension connection timeout")), 10000)
        ),
      ]);

      console.log(`Found ${extensions.length} Polkadot extension(s)`);

      if (extensions.length === 0) {
        let errorMsg = "Polkadot.js extension not found. Please:\n" +
          "1. Install the extension from polkadot.js.org/extension\n" +
          "2. Enable it in your browser\n" +
          "3. Refresh this page\n" +
          "4. Grant permission when prompted";
        
        if (isEdge) {
          errorMsg = "Polkadot.js extension not detected on Microsoft Edge.\n\n" +
            "Edge-specific steps:\n" +
            "1. Install the extension from Microsoft Edge Add-ons or polkadot.js.org/extension\n" +
            "2. Click the puzzle icon (Extensions) in the toolbar\n" +
            "3. Ensure Polkadot.js extension is enabled\n" +
            "4. Grant permission to this site when prompted\n" +
            "5. Refresh this page and try connecting again\n\n" +
            "Note: You may need to pin the extension to see it in your toolbar.";
        }
        
        throw new Error(errorMsg);
      }

      const accounts = await web3Accounts();
      console.log(`Found ${accounts.length} Polkadot account(s)`);

      if (accounts.length === 0) {
        throw new Error(
          "No accounts found. Please create an account in your Polkadot.js extension."
        );
      }

      setWalletState(prev => ({
        ...prev,
        polkadot: {
          connected: true,
          address: accounts[0].address,
          accounts: accounts,
        },
      }));

      localStorage.setItem("polkaconnect_polkadot_connected", "true");
      localStorage.setItem("polkaconnect_polkadot_address", accounts[0].address);

      console.log("✅ Connected to Polkadot wallet:", accounts[0].address);
      
      return accounts[0];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect Polkadot wallet";
      setError(errorMessage);
      console.error("Polkadot connection error:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const connectEthereum = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log("Connecting to MetaMask...");

      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error(
          "MetaMask not found. Please:\n" +
            "1. Install MetaMask from metamask.io\n" +
            "2. Refresh this page\n" +
            "3. Click Connect MetaMask again"
        );
      }

      // Request account access using the standard MetaMask API
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      console.log(`Found ${accounts.length} MetaMask account(s)`);

      if (!accounts || accounts.length === 0) {
        throw new Error("No Ethereum accounts found. Please create an account in MetaMask.");
      }

      const address = accounts[0];

      setWalletState(prev => ({
        ...prev,
        ethereum: {
          connected: true,
          address,
        },
      }));

      localStorage.setItem("polkaconnect_ethereum_connected", "true");
      localStorage.setItem("polkaconnect_ethereum_address", address);

      console.log("✅ Connected to MetaMask:", address);
      
      return address;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to MetaMask";
      setError(errorMessage);
      console.error("MetaMask connection error:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectPolkadot = () => {
    setWalletState(prev => ({
      ...prev,
      polkadot: {
        connected: false,
        address: null,
        accounts: [],
      },
    }));
    localStorage.removeItem("polkaconnect_polkadot_connected");
    localStorage.removeItem("polkaconnect_polkadot_address");
    console.log("Polkadot wallet disconnected");
  };

  const disconnectEthereum = () => {
    setWalletState(prev => ({
      ...prev,
      ethereum: {
        connected: false,
        address: null,
      },
    }));
    localStorage.removeItem("polkaconnect_ethereum_connected");
    localStorage.removeItem("polkaconnect_ethereum_address");
    console.log("Ethereum wallet disconnected");
  };

  const disconnectAll = () => {
    disconnectPolkadot();
    disconnectEthereum();
    setError(null);
  };

  // Auto-reconnect on mount with localStorage migration
  useEffect(() => {
    // Migrate from old single-wallet format
    const oldWalletType = localStorage.getItem("polkaconnect_wallet_type");
    if (oldWalletType) {
      if (oldWalletType === "polkadot") {
        localStorage.setItem("polkaconnect_polkadot_connected", "true");
      } else if (oldWalletType === "ethereum") {
        localStorage.setItem("polkaconnect_ethereum_connected", "true");
      }
      localStorage.removeItem("polkaconnect_wallet_type");
    }

    const polkadotConnected = localStorage.getItem("polkaconnect_polkadot_connected");
    const ethereumConnected = localStorage.getItem("polkaconnect_ethereum_connected");
    
    if (polkadotConnected === "true") {
      connectPolkadot().catch(console.error);
    }
    if (ethereumConnected === "true") {
      connectEthereum().catch(console.error);
    }
  }, []);

  return {
    walletState,
    isConnecting,
    error,
    connectPolkadot,
    connectEthereum,
    disconnectPolkadot,
    disconnectEthereum,
    disconnectAll,
    isPolkadotConnected: walletState.polkadot.connected,
    isEthereumConnected: walletState.ethereum.connected,
    isAnyConnected: walletState.polkadot.connected || walletState.ethereum.connected,
  };
}
