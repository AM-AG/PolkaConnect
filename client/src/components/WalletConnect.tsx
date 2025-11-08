import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Copy, LogOut, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const { toast } = useToast();

  const handleConnect = async () => {
    //todo: remove mock functionality
    const mockAddress = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    setAddress(mockAddress);
    setIsConnected(true);
    onConnect?.(mockAddress);
    
    toast({
      title: "Wallet Connected",
      description: "Successfully connected to Polkadot.js",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress("");
    onDisconnect?.();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  if (!isConnected) {
    return (
      <Button onClick={handleConnect} data-testid="button-connect-wallet">
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-menu" className="gap-2">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          <span className="font-mono text-sm">{truncateAddress(address)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
          <Copy className="h-4 w-4 mr-2" />
          <span className="font-mono text-xs">{address}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} data-testid="button-disconnect">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
