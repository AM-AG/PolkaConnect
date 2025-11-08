import { useQuery } from '@tanstack/react-query';
import { setCache, getCacheWithAge } from '@/lib/cache';

interface Proposal {
  id: number;
  title: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected';
  ayeVotes: number;
  nayVotes: number;
  deadline: string;
  description?: string;
  track?: string;
}

export function useGovernance() {
  return useQuery<Proposal[]>({
    queryKey: ['/api/governance'],
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
    queryFn: async () => {
      try {
        const response = await fetch('/api/governance');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.success && json.data) {
          // Cache the successful response
          setCache('governance', json.data);
          return json.data;
        }
        
        throw new Error(json.error || 'Failed to fetch proposals');
      } catch (error) {
        console.error('Error fetching governance, trying cache:', error);
        
        // Try to get from cache on error
        const cached = getCacheWithAge<Proposal[]>('governance');
        if (cached) {
          console.log('Using cached governance data');
          return cached.data;
        }
        
        throw error;
      }
    },
  });
}
