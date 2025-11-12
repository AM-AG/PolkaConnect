import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/contexts/WalletContext";
import { useMultiChainBalances } from "@/hooks/useMultiChainBalances";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeftRight, ArrowDownUp, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Chain = "DOT" | "ETH";

interface CoinGeckoPrices {
  polkadot: { usd: number };
  ethereum: { usd: number };
}

async function fetchCryptoPrices(): Promise<CoinGeckoPrices> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=polkadot,ethereum&vs_currencies=usd"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch prices");
  }
  return response.json();
}

export default function Swap() {
  const { activePolkadotAccount, walletState } = useWallet();
  const { toast } = useToast();
  const metamaskAddress = walletState.ethereum.address;
  
  const [fromChain, setFromChain] = useState<Chain>("DOT");
  const [toChain, setToChain] = useState<Chain>("ETH");
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  // Fetch real-time prices from CoinGecko
  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ["/api/crypto-prices"],
    queryFn: fetchCryptoPrices,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });

  // Fetch user balances
  const { data: balances } = useMultiChainBalances(walletState);

  // Get current balances for DOT and ETH (using numeric values from hook)
  const dotBalance = balances?.find(b => b.chainId === "polkadot")?.balanceNumeric || 0;
  const ethBalance = balances?.find(b => b.chainId === "ethereum")?.balanceNumeric || 0;

  // Calculate exchange rate
  const exchangeRate = prices 
    ? fromChain === "DOT"
      ? prices.polkadot.usd / prices.ethereum.usd
      : prices.ethereum.usd / prices.polkadot.usd
    : 1;

  // Calculate estimated output
  const requestedAmount = parseFloat(amount) || 0;
  const estimatedOutput = requestedAmount > 0 && !isNaN(requestedAmount)
    ? (requestedAmount * exchangeRate * 0.999).toFixed(6) // 0.1% bridge fee
    : "0.0";

  // Check if user has sufficient balance
  const currentBalance = fromChain === "DOT" ? dotBalance : ethBalance;
  const hasSufficientBalance = requestedAmount > 0 && currentBalance >= requestedAmount;

  const handleSwitch = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid swap amount.",
        variant: "destructive",
      });
      return;
    }

    if (!hasSufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${currentBalance.toFixed(6)} ${fromChain}. Please reduce the amount.`,
        variant: "destructive",
      });
      return;
    }

    // TODO: integrate swap logic with Moonbeam + Snowbridge SDK
    console.log(`Swapping ${amount} ${fromChain} -> ${toChain}`);
    
    setIsSwapping(true);
    
    // Simulate transaction
    setTimeout(() => {
      setIsSwapping(false);
      toast({
        title: "Swap Initiated",
        description: `Swapping ${amount} ${fromChain} to ${toChain}. Integration coming soon!`,
      });
      setAmount("");
    }, 1500);
  };

  // Check if wallet is connected for the "from" chain
  const isWalletConnected = (fromChain === "DOT" && activePolkadotAccount) || 
                            (fromChain === "ETH" && metamaskAddress);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Cross-Chain Swap
        </h1>
        <p className="text-muted-foreground">
          Swap tokens between Polkadot and Ethereum ecosystems
        </p>
      </div>

      <Alert className="mb-6" data-testid="alert-info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Cross-chain swaps will be powered by Moonbeam and Snowbridge for seamless DOT ↔ ETH transfers.
          Connect both wallets for the best experience.
        </AlertDescription>
      </Alert>

      <Card data-testid="card-swap">
        <CardHeader>
          <CardTitle>Swap Tokens</CardTitle>
          <CardDescription>
            Exchange tokens across chains using bridge protocols
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="from-amount">From</Label>
              {currentBalance > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setAmount(currentBalance.toString())}
                  data-testid="button-max"
                >
                  MAX
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="from-amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                data-testid="input-swap-amount"
              />
              <div className="min-w-[100px]">
                <Button
                  variant="outline"
                  className="w-full font-mono"
                  disabled
                  data-testid="button-from-token"
                >
                  {fromChain}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {fromChain === "DOT" 
                  ? activePolkadotAccount 
                    ? `Connected: ${activePolkadotAccount.meta.name}` 
                    : "Connect Polkadot.js wallet"
                  : metamaskAddress
                    ? `Connected: ${metamaskAddress.slice(0, 6)}...${metamaskAddress.slice(-4)}`
                    : "Connect MetaMask wallet"
                }
              </p>
              {(fromChain === "DOT" && activePolkadotAccount) || (fromChain === "ETH" && metamaskAddress) ? (
                <p className="text-xs font-mono" data-testid="text-balance-from">
                  Balance: {currentBalance.toFixed(6)} {fromChain}
                </p>
              ) : null}
            </div>
            {requestedAmount > 0 && !hasSufficientBalance && (
              <Alert variant="destructive" className="mt-2" data-testid="alert-insufficient-balance">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient balance. You need {requestedAmount.toFixed(6)} {fromChain} but only have {currentBalance.toFixed(6)} {fromChain}.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Switch Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwitch}
              className="rounded-full"
              data-testid="button-switch-direction"
            >
              <ArrowDownUp className="h-5 w-5" />
            </Button>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <Label htmlFor="to-amount">To (estimated)</Label>
            <div className="flex gap-2">
              <Input
                id="to-amount"
                type="text"
                value={estimatedOutput !== "0.0" ? `≈ ${estimatedOutput}` : "0.0"}
                disabled
                className="flex-1"
                data-testid="input-estimated-amount"
              />
              <div className="min-w-[100px]">
                <Button
                  variant="outline"
                  className="w-full font-mono"
                  disabled
                  data-testid="button-to-token"
                >
                  {toChain}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {toChain === "DOT"
                ? activePolkadotAccount
                  ? `Recipient: ${activePolkadotAccount.meta.name}`
                  : "Connect Polkadot.js wallet"
                : metamaskAddress
                  ? `Recipient: ${metamaskAddress.slice(0, 6)}...${metamaskAddress.slice(-4)}`
                  : "Connect MetaMask wallet"
              }
            </p>
          </div>

          {/* Swap Details */}
          <div className="space-y-2 p-4 rounded-md bg-muted/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate</span>
              {pricesLoading ? (
                <span className="text-xs">Loading...</span>
              ) : prices ? (
                <span className="font-mono" data-testid="text-exchange-rate">
                  1 {fromChain} = {exchangeRate.toFixed(6)} {toChain}
                </span>
              ) : (
                <span className="font-mono">--</span>
              )}
            </div>
            {prices && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Prices</span>
                <span className="text-xs" data-testid="text-usd-prices">
                  DOT: ${prices.polkadot.usd.toFixed(2)} | ETH: ${prices.ethereum.usd.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bridge Fee</span>
              <span className="font-mono">~0.1%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Time</span>
              <span>~5-10 minutes</span>
            </div>
          </div>

          {/* Swap Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSwap}
            disabled={!isWalletConnected || requestedAmount === 0 || !hasSufficientBalance || isSwapping}
            data-testid="button-swap"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            {isSwapping 
              ? "Swapping..." 
              : !isWalletConnected
                ? `Connect ${fromChain} Wallet`
                : requestedAmount === 0
                  ? "Enter Amount"
                  : !hasSufficientBalance
                    ? "Insufficient Balance"
                    : "Swap"
            }
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Powered by Moonbeam + Snowbridge (integration in progress)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
