import { useQuery } from '@tanstack/react-query';
import type { StakingAnalytics } from '@shared/schema';

export function useStakingAnalytics(bondedAmount?: string) {
  return useQuery<StakingAnalytics>({
    queryKey: ['/api/staking/analytics', bondedAmount],
    queryFn: async () => {
      const params = bondedAmount ? `?bondedAmount=${encodeURIComponent(bondedAmount)}` : '';
      const response = await fetch(`/api/staking/analytics${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      if (json.success && json.data) {
        return json.data;
      }
      
      throw new Error(json.error || 'Failed to fetch staking analytics');
    },
  });
}
