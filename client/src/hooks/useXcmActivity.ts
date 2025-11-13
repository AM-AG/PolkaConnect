import { useQuery } from '@tanstack/react-query';
import { setCache, getCacheWithAge } from '@/lib/cache';
import type { XcmActivity } from '@shared/schema';

export function useXcmActivity() {
  return useQuery<XcmActivity[]>({
    queryKey: ['/api/network/xcm'],
    refetchInterval: 30000, // Refetch every 30 seconds for dynamic updates
    staleTime: 20000,
    queryFn: async () => {
      try {
        const response = await fetch('/api/network/xcm');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.success && json.data) {
          setCache('xcm-activity', json.data);
          return json.data;
        }
        
        throw new Error(json.error || 'Failed to fetch XCM activity');
      } catch (error) {
        console.error('Error fetching XCM activity, trying cache:', error);
        
        const cached = getCacheWithAge<XcmActivity[]>('xcm-activity');
        if (cached) {
          console.log('Using cached XCM activity data');
          return cached.data;
        }
        
        throw error;
      }
    },
  });
}
