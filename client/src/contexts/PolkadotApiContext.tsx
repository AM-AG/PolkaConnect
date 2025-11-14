import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromAddress } from "@polkadot/extension-dapp";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { useWallet } from "./WalletContext";
import { useToast } from "@/hooks/use-toast";

interface PolkadotApiContextType {
  api: ApiPromise | null;
  isReady: boolean;
  signAndSend: (
    extrinsic: SubmittableExtrinsic<"promise">,
    onStatus?: (status: TransactionStatus) => void
  ) => Promise<string>;
}

export type TransactionStatus =
  | { type: "ready" }
  | { type: "broadcast" }
  | { type: "inBlock"; blockHash: string }
  | { type: "finalized"; blockHash: string }
  | { type: "error"; message: string };

const PolkadotApiContext = createContext<PolkadotApiContextType | null>(null);

export function PolkadotApiProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { walletState } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let apiInstance: ApiPromise | null = null;

    async function connect() {
      try {
        const provider = new WsProvider("wss://rpc.polkadot.io");
        apiInstance = await ApiPromise.create({ provider });

        if (mounted) {
          setApi(apiInstance);
          setIsReady(true);
          console.log("Polkadot API connected");
        }
      } catch (error) {
        console.error("Failed to connect to Polkadot API:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Failed to connect to Polkadot network",
          });
        }
      }
    }

    connect();

    return () => {
      mounted = false;
      if (apiInstance) {
        apiInstance.disconnect();
      }
    };
  }, []);

  const signAndSend = async (
    extrinsic: SubmittableExtrinsic<"promise">,
    onStatus?: (status: TransactionStatus) => void
  ): Promise<string> => {
    if (!api || !isReady) {
      throw new Error("Polkadot API not ready");
    }

    if (!walletState.polkadot.connected || !walletState.polkadot.address) {
      throw new Error("Wallet not connected");
    }

    const address = walletState.polkadot.address;

    try {
      onStatus?.({ type: "ready" });

      const injector = await web3FromAddress(address);

      return new Promise((resolve, reject) => {
        let unsubscribe: (() => void) | null = null;

        extrinsic
          .signAndSend(address, { signer: injector.signer }, (result: ISubmittableResult) => {
            const { status, events, dispatchError } = result;

            if (status.isReady) {
              onStatus?.({ type: "ready" });
            } else if (status.isBroadcast) {
              onStatus?.({ type: "broadcast" });
            } else if (status.isInBlock) {
              onStatus?.({ type: "inBlock", blockHash: status.asInBlock.toHex() });
            } else if (status.isFinalized) {
              const blockHash = status.asFinalized.toHex();
              onStatus?.({ type: "finalized", blockHash });

              if (dispatchError) {
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(dispatchError.asModule);
                  const { docs, name, section } = decoded;
                  const errorMsg = `${section}.${name}: ${docs.join(" ")}`;
                  onStatus?.({ type: "error", message: errorMsg });
                  unsubscribe?.();
                  reject(new Error(errorMsg));
                } else {
                  const errorMsg = dispatchError.toString();
                  onStatus?.({ type: "error", message: errorMsg });
                  unsubscribe?.();
                  reject(new Error(errorMsg));
                }
              } else {
                const txHash = result.txHash.toHex();
                unsubscribe?.();
                resolve(txHash);
              }
            } else if (status.isInvalid || status.isDropped || status.isUsurped) {
              const errorMsg = `Transaction ${status.isInvalid ? 'invalid' : status.isDropped ? 'dropped' : 'usurped'}`;
              onStatus?.({ type: "error", message: errorMsg });
              unsubscribe?.();
              reject(new Error(errorMsg));
            } else if (status.isFinalityTimeout) {
              const errorMsg = 'Transaction finality timeout - block not finalized in time';
              onStatus?.({ type: "error", message: errorMsg });
              unsubscribe?.();
              reject(new Error(errorMsg));
            } else if (status.isRetracted) {
              const errorMsg = 'Transaction retracted - block was retracted';
              onStatus?.({ type: "error", message: errorMsg });
              unsubscribe?.();
              reject(new Error(errorMsg));
            }
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch((error: Error) => {
            onStatus?.({ type: "error", message: error.message });
            reject(error);
          });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      onStatus?.({ type: "error", message: errorMessage });
      throw error;
    }
  };

  return (
    <PolkadotApiContext.Provider value={{ api, isReady, signAndSend }}>
      {children}
    </PolkadotApiContext.Provider>
  );
}

export function usePolkadotApi() {
  const context = useContext(PolkadotApiContext);
  if (!context) {
    throw new Error("usePolkadotApi must be used within PolkadotApiProvider");
  }
  return context;
}
