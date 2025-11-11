import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Copy, LogOut, Circle, ChevronDown, User } from "lucide-react";
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
    disconnectPolkadot,
    disconnectEthereum,
    selectPolkadotAccount,
    isPolkadotConnected,
    isEthereumConnected,
    activePolkadotAccount,
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

  const handleDisconnectPolkadot = () => {
    disconnectPolkadot();
    toast({
      title: "Polkadot Disconnected",
      description: "Your Polkadot wallet has been disconnected",
    });
  };

  const handleDisconnectEthereum = () => {
    disconnectEthereum();
    toast({
      title: "MetaMask Disconnected",
      description: "Your Ethereum wallet has been disconnected",
    });
  };

  const copyAddress = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: `${name} address copied to clipboard`,
    });
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  return (
    <div className="flex gap-2">
      {/* Polkadot Wallet */}
      {!isPolkadotConnected ? (
        <Button
          onClick={handleConnectPolkadot}
          data-testid="button-connect-polkadot"
          disabled={isConnecting}
          className="gap-2"
        >
          <SiPolkadot className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Polkadot"}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="button-polkadot-menu" className="gap-2">
              <SiPolkadot className="h-4 w-4" />
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="font-mono text-sm">
                {truncateAddress(walletState.polkadot.address || "")}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center gap-2">
              <SiPolkadot className="h-4 w-4" />
              Polkadot Accounts
              <span className="ml-auto text-xs text-muted-foreground">
                {walletState.polkadot.accounts.length} account{walletState.polkadot.accounts.length !== 1 ? 's' : ''}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Account Selection */}
            {walletState.polkadot.accounts.map((account) => {
              const isActive = account.address === walletState.polkadot.address;
              return (
                <DropdownMenuItem
                  key={account.address}
                  onClick={() => {
                    if (!isActive) {
                      selectPolkadotAccount(account.address);
                      toast({
                        title: "Account Switched",
                        description: `Now viewing ${account.meta.name || "unnamed account"}`,
                      });
                    }
                  }}
                  data-testid={`button-select-account-${account.address}`}
                  className="flex items-start gap-2 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span className="font-medium text-sm">
                        {account.meta.name || "Unnamed Account"}
                      </span>
                      {isActive && (
                        <Circle className="h-2 w-2 fill-green-500 text-green-500 ml-auto" />
                      )}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground mt-1">
                      {truncateAddress(account.address)}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => copyAddress(walletState.polkadot.address || "", "Polkadot")} 
              data-testid="button-copy-polkadot-address"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Active Address
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleDisconnectPolkadot} data-testid="button-disconnect-polkadot">
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect All Accounts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Ethereum Wallet */}
      {!isEthereumConnected ? (
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
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="button-ethereum-menu" className="gap-2">
              <SiEthereum className="h-4 w-4" />
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              <span className="font-mono text-sm">
                {truncateAddress(walletState.ethereum.address || "")}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Connected to Ethereum
            </div>
            <DropdownMenuItem 
              onClick={() => copyAddress(walletState.ethereum.address || "", "Ethereum")} 
              data-testid="button-copy-ethereum-address"
            >
              <Copy className="h-4 w-4 mr-2" />
              <span className="font-mono text-xs truncate">{walletState.ethereum.address}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDisconnectEthereum} data-testid="button-disconnect-ethereum">
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
