import { useQuery } from '@tanstack/react-query';
import { setCache, getCacheWithAge } from '@/lib/cache';

interface ChainBalance {
  chainId: string;
  chainName: string;
  balance: string;
  usdValue: string;
  lastUpdated: string;
  status: 'online' | 'syncing' | 'offline';
  blockHeight?: number;
}

export function useBalances(address: string | null) {
  return useQuery<ChainBalance[]>({
    queryKey: ['/api/assets', address],
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
    queryFn: async () => {
      if (!address) throw new Error('No address provided');

      try {
        const response = await fetch(`/api/assets/${address}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.success && json.data) {
          // Cache the successful response
          setCache(`balances_${address}`, json.data);
          return json.data;
        }
        
        throw new Error(json.error || 'Failed to fetch balances');
      } catch (error) {
        console.error('Error fetching balances, trying cache:', error);
        
        // Try to get from cache on error
        const cached = getCacheWithAge<ChainBalance[]>(`balances_${address}`);
        if (cached) {
          console.log('Using cached balance data');
          return cached.data;
        }
        
        throw error;
      }
    },
  });
}
