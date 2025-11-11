import { ApiPromise, WsProvider } from "@polkadot/api";
import type { StakingInfo } from "@shared/schema";

// Singleton API instance per RPC endpoint
const API_INSTANCES = new Map<string, ApiPromise>();

async function getPolkadotApi(rpcUrl: string): Promise<ApiPromise> {
  let api = API_INSTANCES.get(rpcUrl);

  if (api) {
    if (api.isConnected) {
      return api;
    } else {
      // Disconnect old instance
      await api.disconnect();
      API_INSTANCES.delete(rpcUrl);
    }
  }

  // Create new instance
  const provider = new WsProvider(rpcUrl);
  api = await ApiPromise.create({ provider });
  API_INSTANCES.set(rpcUrl, api);

  return api;
}

// Cleanup function for graceful shutdown
export async function disconnectAll() {
  const entries = Array.from(API_INSTANCES.entries());
  for (const [url, api] of entries) {
    try {
      await api.disconnect();
      console.log(`Disconnected from ${url}`);
    } catch (error) {
      console.error(`Error disconnecting from ${url}:`, error);
    }
  }
  API_INSTANCES.clear();
}

export async function getStakingInfo(
  address: string,
  rpcUrl: string = "wss://rpc.polkadot.io"
): Promise<StakingInfo> {
  try {
    const api = await getPolkadotApi(rpcUrl);

    // Fetch account info for free balance
    const accountInfo = await api.query.system.account(address);
    const accountData = accountInfo.toJSON() as any;
    const free = accountData?.data?.free || "0";

    // Query staking ledger for bonded balance
    const stakingLedger = await api.query.staking.ledger(address);
    const ledgerData = stakingLedger.toJSON() as any;

    // Query nominations
    const nominators = await api.query.staking.nominators(address);
    const nominatorData = nominators.toJSON() as any;

    // Query bonded controller account
    const bonded = await api.query.staking.bonded(address);
    const bondedController = bonded.toJSON() as string | null;

    // Calculate balances
    const bondedBalance = ledgerData?.active || "0";
    const unlocking = ledgerData?.unlocking || [];
    const nominations = nominatorData?.targets || [];

    // Calculate total active stake
    const activeStake = bondedBalance;

    // Format unlocking schedule
    const unlockingFormatted = unlocking.map((unlock: any) => ({
      value: unlock.value || "0",
      era: unlock.era || 0,
    }));

    // Query current era for reward calculations
    const currentEra = await api.query.staking.currentEra();
    const currentEraNum = currentEra.toJSON() as number;

    // Query rewards (simplified - just returns pending as 0 for now)
    // Full implementation would query staking.erasRewardPoints and calculate payouts
    const rewardsPending = "0";
    const rewardsTotal = "0";

    const stakingInfo: StakingInfo = {
      walletAddress: address,
      bondedBalance: bondedBalance.toString(),
      freeBalance: free.toString(),
      activeStake: activeStake.toString(),
      nominations: nominations,
      rewardsPending,
      rewardsTotal,
      unlocking: unlockingFormatted,
      status: "online",
      lastUpdated: new Date().toISOString(),
    };

    return stakingInfo;
  } catch (error) {
    console.error("Staking info fetch error:", error);
    return {
      walletAddress: address,
      bondedBalance: "0",
      freeBalance: "0",
      activeStake: "0",
      nominations: [],
      rewardsPending: "0",
      rewardsTotal: "0",
      unlocking: [],
      status: "error",
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getStakingRewards(
  address: string,
  eraCount: number = 10,
  rpcUrl: string = "wss://rpc.polkadot.io"
): Promise<{ era: number; reward: string }[]> {
  try {
    const api = await getPolkadotApi(rpcUrl);
    const currentEra = await api.query.staking.currentEra();
    const currentEraNum = currentEra.toJSON() as number;

    const rewards: { era: number; reward: string }[] = [];

    // Query the last N eras for reward points
    for (let i = 0; i < eraCount; i++) {
      const era = currentEraNum - i;
      if (era < 0) break;

      // Query era reward points (this is simplified)
      // Full implementation would check if validator/nominator earned rewards
      const rewardPoints = await api.query.staking.erasRewardPoints(era);
      const rewardData = rewardPoints.toJSON() as any;

      // For now, return 0 - full implementation would calculate actual rewards
      rewards.push({
        era,
        reward: "0",
      });
    }

    return rewards;
  } catch (error) {
    console.error("Staking rewards fetch error:", error);
    return [];
  }
}
