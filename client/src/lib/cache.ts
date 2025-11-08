interface CachedData<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'polkaconnect_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function setCache<T>(key: string, data: T): void {
  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
  } catch (error) {
    console.error('Failed to set cache:', error);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const cached: CachedData<T> = JSON.parse(item);
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    
    if (isExpired) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error('Failed to get cache:', error);
    return null;
  }
}

export function getCacheWithAge<T>(key: string): { data: T; age: string } | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const cached: CachedData<T> = JSON.parse(item);
    const ageMs = Date.now() - cached.timestamp;
    const ageMinutes = Math.floor(ageMs / 60000);
    const age = ageMinutes < 1 ? 'just now' : `${ageMinutes} min${ageMinutes > 1 ? 's' : ''} ago`;

    return { data: cached.data, age };
  } catch (error) {
    console.error('Failed to get cache with age:', error);
    return null;
  }
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  } else {
    // Clear all polkaconnect caches
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  }
}
