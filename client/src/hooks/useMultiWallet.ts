// Re-export the useWallet hook and types from the context
// This maintains backward compatibility with existing imports
export { useWallet as useMultiWallet, type WalletState, type PolkadotAccount } from "@/contexts/WalletContext";
