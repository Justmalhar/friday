interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface CacheConfig {
  news: number;    // 1 hour in ms
  weather: number; // 3 hours in ms
}

export const TTL: CacheConfig = {
  news: 60 * 60 * 1000,      // 1 hour
  weather: 3 * 60 * 60 * 1000 // 3 hours
};

export function setCache<T>(key: string, data: T, ttl?: number) {
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getCache<T>(key: string, ttl?: number): T | null {
  const item = localStorage.getItem(key);
  if (!item) return null;

  const cached: CacheItem<T> = JSON.parse(item);
  if (ttl && Date.now() - cached.timestamp > ttl) {
    localStorage.removeItem(key);
    return null;
  }

  return cached.data;
}

export function getLastUpdated(key: string): string {
  const item = localStorage.getItem(key);
  if (!item) return 'Never';

  const cached: CacheItem<any> = JSON.parse(item);
  const date = new Date(cached.timestamp);
  return date.toLocaleTimeString();
} 