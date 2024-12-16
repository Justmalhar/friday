interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function getLastUpdated(key: string): string {
  const item = localStorage.getItem(key);
  if (!item) return 'Never';

  const cached = JSON.parse(item) as CacheItem<unknown>;
  const date = new Date(cached.timestamp);
  return date.toLocaleTimeString();
} 