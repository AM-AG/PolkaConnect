import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Copy, LogOut, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";

export function WalletConnect() {
  const { toast } = useToast();
  const { 
    selectedAccount, 
    isConnecting, 
    isConnected, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Polkadot.js",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
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
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
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
      <Button 
        onClick={handleConnect} 
        data-testid="button-connect-wallet"
        disabled={isConnecting}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-menu" className="gap-2">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          <span className="font-mono text-sm">
            {truncateAddress(selectedAccount?.address || "")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
          <Copy className="h-4 w-4 mr-2" />
          <span className="font-mono text-xs">{selectedAccount?.address}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} data-testid="button-disconnect">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
