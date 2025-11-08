import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Proposal } from '@shared/schema';

const POLKADOT_RPC = 'wss://rpc.polkadot.io';
let cachedApi: ApiPromise | null = null;

async function getPolkadotApi(): Promise<ApiPromise | null> {
  if (cachedApi && cachedApi.isConnected) {
    return cachedApi;
  }

  try {
    const provider = new WsProvider(POLKADOT_RPC, 3000);
    const api = await ApiPromise.create({ 
      provider,
      throwOnConnect: false,
      throwOnUnknown: false
    });
    
    await api.isReady;
    cachedApi = api;
    return api;
  } catch (error) {
    console.error('Failed to connect to Polkadot for governance:', error);
    return null;
  }
}

export async function fetchReferenda(): Promise<Proposal[]> {
  const api = await getPolkadotApi();
  
  if (!api) {
    console.log('No API connection, returning empty proposals');
    return [];
  }

  try {
    // Fetch ongoing referenda from OpenGov
    const referendaInfo = await api.query.referenda.referendumInfoFor.entries();
    const proposals: Proposal[] = [];

    for (const [key, info] of referendaInfo) {
      const referendumId = (key.args[0].toJSON() as any) || 0;
      const infoData = info.toJSON() as any;

      if (infoData && infoData.ongoing) {
        const ongoing = infoData.ongoing;
        const tally = ongoing.tally || { ayes: 0, nays: 0 };
        
        // Calculate deadline from decision deposit and track info
        const deadlineBlocks = ongoing.decisionDeposit ? 100000 : 200000; // Simplified
        const header = await api.rpc.chain.getHeader();
        const currentBlock = (header.number.toJSON() as any) || 0;
        const remainingBlocks = Math.max(0, deadlineBlocks - (currentBlock - (ongoing.submitted || currentBlock)));
        const daysRemaining = Math.ceil(remainingBlocks / 7200); // ~6s per block

        proposals.push({
          id: referendumId,
          title: `Referendum #${referendumId}`,
          proposer: ongoing.submissionDeposit?.who || 'Unknown',
          status: 'active',
          ayeVotes: parseInt(tally.ayes || 0) / 1e10, // Convert from plancks
          nayVotes: parseInt(tally.nays || 0) / 1e10,
          deadline: daysRemaining > 0 ? `${daysRemaining} days` : 'Soon',
          description: `Referendum ${referendumId} is currently active in the governance system.`,
          track: ongoing.track || 'root'
        });
      }
    }

    // If no active referenda found, return empty array
    return proposals.slice(0, 10); // Limit to 10 most recent
  } catch (error) {
    console.error('Error fetching referenda:', error);
    return [];
  }
}

export async function disconnectGovernanceApi(): Promise<void> {
  if (cachedApi) {
    try {
      await cachedApi.disconnect();
      cachedApi = null;
    } catch (error) {
      console.error('Error disconnecting governance API:', error);
    }
  }
}
