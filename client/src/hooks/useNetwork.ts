import { useQuery } from '@tanstack/react-query';
import { setCache, getCacheWithAge } from '@/lib/cache';

interface NetworkNode {
  id: string;
  name: string;
  blockHeight: number;
  uptime: number;
  status: 'online' | 'syncing' | 'offline';
  rpcEndpoint: string;
}

export function useNetwork() {
  return useQuery<NetworkNode[]>({
    queryKey: ['/api/network'],
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
    queryFn: async () => {
      try {
        const response = await fetch('/api/network');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.success && json.data) {
          // Cache the successful response
          setCache('network', json.data);
          return json.data;
        }
        
        throw new Error(json.error || 'Failed to fetch network status');
      } catch (error) {
        console.error('Error fetching network, trying cache:', error);
        
        // Try to get from cache on error
        const cached = getCacheWithAge<NetworkNode[]>('network');
        if (cached) {
          console.log('Using cached network data');
          return cached.data;
        }
        
        throw error;
      }
    },
  });
}
