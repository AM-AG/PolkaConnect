import { useQuery } from '@tanstack/react-query';
import type { GovernanceSummary } from '@shared/schema';

export function useGovernanceSummary(walletAddress?: string) {
  return useQuery<GovernanceSummary>({
    queryKey: ['/api/governance/summary', walletAddress],
    refetchInterval: 60000, // Refetch every minute
    queryFn: async () => {
      const params = walletAddress ? `?walletAddress=${encodeURIComponent(walletAddress)}` : '';
      const response = await fetch(`/api/governance/summary${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      if (json.success && json.data) {
        return json.data;
      }
      
      throw new Error(json.error || 'Failed to fetch governance summary');
    },
  });
}
