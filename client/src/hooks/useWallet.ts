import { useState, useEffect } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";

interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

export function useWallet() {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(
    null,
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log("Attempting to connect to Polkadot.js extension...");
      
      // Check if running in a browser that supports extensions
      if (typeof window === 'undefined') {
        throw new Error("Not running in a browser environment");
      }

      // Enable the extension with a timeout
      const extensions = await Promise.race([
        web3Enable("PolkaConnect"),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Extension connection timeout")), 10000)
        )
      ]);

      console.log(`Found ${extensions.length} extension(s)`);

      if (extensions.length === 0) {
        throw new Error(
          "No Polkadot.js extension detected. Please make sure:\n" +
          "1. The extension is installed\n" +
          "2. The extension is enabled in your browser\n" +
          "3. You've granted permission to this website\n" +
          "4. Try refreshing the page after installing"
        );
      }

      // Get all accounts
      const allAccounts = await web3Accounts();
      console.log(`Found ${allAccounts.length} account(s)`);

      if (allAccounts.length === 0) {
        throw new Error(
          "No accounts found. Please create an account in your Polkadot.js extension."
        );
      }

      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);

      // Store in localStorage for persistence
      localStorage.setItem("polkaconnect_wallet_connected", "true");
      localStorage.setItem(
        "polkaconnect_selected_address",
        allAccounts[0].address,
      );

      console.log("Successfully connected to wallet:", allAccounts[0].address);
      return allAccounts[0];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setError(null);
    localStorage.removeItem("polkaconnect_wallet_connected");
    localStorage.removeItem("polkaconnect_selected_address");
  };

  const selectAccount = (address: string) => {
    const account = accounts.find((acc) => acc.address === address);
    if (account) {
      setSelectedAccount(account);
      localStorage.setItem("polkaconnect_selected_address", address);
    }
  };

  // Auto-reconnect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("polkaconnect_wallet_connected");
    if (wasConnected === "true") {
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
