/**
 * In-memory cache utility for Lambda functions
 * 
 * This cache persists across warm Lambda invocations, reducing
 * Bedrock API calls and improving response times for frequently
 * requested content.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class LambdaCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private ttlMs: number;

  constructor(ttlMs: number) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   */
  set(key: string, value: T): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns true if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries from the cache
   */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Cache TTL constants
 */
export const CacheTTL = {
  ONE_HOUR: 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  TWELVE_HOURS: 12 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000
} as const;
