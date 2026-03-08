/**
 * Tests for Lambda cache utility
 */

import { LambdaCache, CacheTTL } from './cache';

describe('LambdaCache', () => {
  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      const cache = new LambdaCache<string>(CacheTTL.ONE_HOUR);
      
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      const cache = new LambdaCache<string>(CacheTTL.ONE_HOUR);
      
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing values', () => {
      const cache = new LambdaCache<string>(CacheTTL.ONE_HOUR);
      
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      
      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('should return undefined for expired entries', () => {
      const cache = new LambdaCache<string>(100); // 100ms TTL
      
      cache.set('key1', 'value1');
      
      // Wait for expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cache.get('key1')).toBeUndefined();
          resolve();
        }, 150);
      });
    });

    it('should return value before expiration', () => {
      const cache = new LambdaCache<string>(1000); // 1 second TTL
      
      cache.set('key1', 'value1');
      
      // Check immediately
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('has method', () => {
    it('should return true for existing non-expired keys', () => {
      const cache = new LambdaCache<string>(CacheTTL.ONE_HOUR);
      
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const cache = new LambdaCache<string>(CacheTTL.ONE_HOUR);
      
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', () => {
      const cache = new LambdaCache<string>(100); // 100ms TTL
      
      cache.set('key1', 'value1');
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cache.has('key1')).toBe(false);
          resolve();
        }, 150);
      });
    });
  });

  describe('clear method', () => {
    it('should remove all entries', () => {
      const cache = new LambdaCache<string>(CacheTTL.ONE_HOUR);
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.size()).toBe(0);
    });
  });

  describe('size method', () => {
    it('should return the number of entries', () => {
      const cache = new LambdaCache<string>(CacheTTL.ONE_HOUR);
      
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('prune method', () => {
    it('should remove expired entries', () => {
      const cache = new LambdaCache<string>(100); // 100ms TTL
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          cache.set('key3', 'value3'); // Add fresh entry
          cache.prune();
          
          expect(cache.get('key1')).toBeUndefined();
          expect(cache.get('key2')).toBeUndefined();
          expect(cache.get('key3')).toBe('value3');
          expect(cache.size()).toBe(1);
          resolve();
        }, 150);
      });
    });
  });

  describe('complex data types', () => {
    it('should handle objects', () => {
      const cache = new LambdaCache<{ name: string; age: number }>(CacheTTL.ONE_HOUR);
      
      const data = { name: 'John', age: 30 };
      cache.set('user', data);
      
      expect(cache.get('user')).toEqual(data);
    });

    it('should handle arrays', () => {
      const cache = new LambdaCache<number[]>(CacheTTL.ONE_HOUR);
      
      const data = [1, 2, 3, 4, 5];
      cache.set('numbers', data);
      
      expect(cache.get('numbers')).toEqual(data);
    });
  });
});
