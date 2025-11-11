import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Copy, LogOut, Circle } from "lucide-react";
import { SiPolkadot, SiEthereum } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMultiWallet } from "@/hooks/useMultiWallet";

export function MultiWalletConnect() {
  const { toast } = useToast();
  const {
    walletState,
    isConnecting,
    connectPolkadot,
    connectEthereum,
    disconnectWallet,
    isConnected,
  } = useMultiWallet();

  const handleConnectPolkadot = async () => {
    try {
      await connectPolkadot();
      toast({
        title: "Polkadot Wallet Connected",
        description: "Successfully connected to Polkadot.js extension",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Polkadot wallet",
        variant: "destructive",
      });
    }
  };

  const handleConnectEthereum = async () => {
    try {
      await connectEthereum();
      toast({
        title: "MetaMask Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect MetaMask",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  if (!isConnected) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={handleConnectPolkadot}
          data-testid="button-connect-polkadot"
          disabled={isConnecting}
          className="gap-2"
        >
          <SiPolkadot className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Polkadot"}
        </Button>
        <Button
          onClick={handleConnectEthereum}
          data-testid="button-connect-ethereum"
          disabled={isConnecting}
          variant="outline"
          className="gap-2"
        >
          <SiEthereum className="h-4 w-4" />
          MetaMask
        </Button>
      </div>
    );
  }

  const walletIcon = walletState.type === "polkadot" ? <SiPolkadot className="h-4 w-4" /> : <SiEthereum className="h-4 w-4" />;
  const walletName = walletState.type === "polkadot" ? "Polkadot" : "Ethereum";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-menu" className="gap-2">
          {walletIcon}
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          <span className="font-mono text-sm">
            {truncateAddress(walletState.address || "")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Connected to {walletName}
        </div>
        <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
          <Copy className="h-4 w-4 mr-2" />
          <span className="font-mono text-xs truncate">{walletState.address}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} data-testid="button-disconnect">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
