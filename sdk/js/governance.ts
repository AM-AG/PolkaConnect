export interface GovernanceProposal {
  id: number;
  title: string;
  proposer: string;
  status: string;
  ayeVotes: number;
  nayVotes: number;
  deadline: string;
  description?: string;
  track?: string;
}

export async function getGovernanceProposals(
  baseUrl: string = 'https://polkaconnect.replit.app'
): Promise<GovernanceProposal[]> {
  const res = await fetch(`${baseUrl}/api/governance`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch proposals: ${res.statusText}`);
  }

  const data = await res.json();
  return data.data || [];
}

export async function getGovernanceSummary(
  address?: string,
  baseUrl: string = 'https://polkaconnect.replit.app'
): Promise<any> {
  const endpoint = address 
    ? `${baseUrl}/api/governance/summary?address=${address}`
    : `${baseUrl}/api/governance/summary`;
  
  const res = await fetch(endpoint);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch governance summary: ${res.statusText}`);
  }

  return res.json();
}
