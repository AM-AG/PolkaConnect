import { useState, useEffect } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { ethers, BrowserProvider } from "ethers";

export type WalletType = "polkadot" | "ethereum" | null;

interface PolkadotAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

export interface WalletState {
  type: WalletType;
  address: string | null;
  polkadotAccounts: PolkadotAccount[];
  ethereumAddress: string | null;
}

export function useMultiWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    type: null,
    address: null,
    polkadotAccounts: [],
    ethereumAddress: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectPolkadot = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log("Connecting to Polkadot.js extension...");

      const extensions = await Promise.race([
        web3Enable("PolkaConnect"),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Extension connection timeout")), 10000)
        ),
      ]);

      console.log(`Found ${extensions.length} Polkadot extension(s)`);

      if (extensions.length === 0) {
        throw new Error(
          "Polkadot.js extension not found. Please:\n" +
            "1. Install the extension from polkadot.js.org/extension\n" +
            "2. Enable it in your browser\n" +
            "3. Refresh this page\n" +
            "4. Grant permission when prompted"
        );
      }

      const accounts = await web3Accounts();
      console.log(`Found ${accounts.length} Polkadot account(s)`);

      if (accounts.length === 0) {
        throw new Error(
          "No accounts found. Please create an account in your Polkadot.js extension."
        );
      }

      setWalletState({
        type: "polkadot",
        address: accounts[0].address,
        polkadotAccounts: accounts,
        ethereumAddress: null,
      });

      localStorage.setItem("polkaconnect_wallet_type", "polkadot");
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

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No Ethereum accounts found. Please create an account in MetaMask.");
      }

      const address = accounts[0];

      setWalletState({
        type: "ethereum",
        address,
        polkadotAccounts: [],
        ethereumAddress: address,
      });

      localStorage.setItem("polkaconnect_wallet_type", "ethereum");
      localStorage.setItem("polkaconnect_ethereum_address", address);

      console.log("✅ Connected to MetaMask:", address);
      return address;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect MetaMask";
      setError(errorMessage);
      console.error("MetaMask connection error:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      type: null,
      address: null,
      polkadotAccounts: [],
      ethereumAddress: null,
    });
    setError(null);
    localStorage.removeItem("polkaconnect_wallet_type");
    localStorage.removeItem("polkaconnect_polkadot_address");
    localStorage.removeItem("polkaconnect_ethereum_address");
    console.log("Wallet disconnected");
  };

  // Auto-reconnect on mount
  useEffect(() => {
    const walletType = localStorage.getItem("polkaconnect_wallet_type");
    if (walletType === "polkadot") {
      connectPolkadot().catch(console.error);
    } else if (walletType === "ethereum") {
      connectEthereum().catch(console.error);
    }
  }, []);

  return {
    walletState,
    isConnecting,
    error,
    connectPolkadot,
    connectEthereum,
    disconnectWallet,
    isConnected: walletState.address !== null,
  };
}
