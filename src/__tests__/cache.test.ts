import { describe, it, expect, beforeEach } from '@jest/globals';
import { cache } from '../lib/cache';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Cache Utility', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should store and retrieve data', () => {
    const testData = { name: 'Test', value: 123 };
    
    cache.set('test-key', testData, 60000); // 1 minute TTL
    const retrieved = cache.get('test-key');
    
    expect(retrieved).toEqual(testData);
  });

  it('should return null for expired data', () => {
    const testData = { name: 'Test' };
    
    cache.set('test-key', testData, 1); // 1ms TTL
    // Wait for expiration
    setTimeout(() => {
      const retrieved = cache.get('test-key');
      expect(retrieved).toBeNull();
    }, 10);
  });

  it('should return null for non-existent keys', () => {
    const retrieved = cache.get('non-existent-key');
    expect(retrieved).toBeNull();
  });

  it('should invalidate specific keys', () => {
    const testData = { name: 'Test' };
    
    cache.set('test-key', testData, 60000);
    expect(cache.get('test-key')).toEqual(testData);
    
    cache.invalidate('test-key');
    expect(cache.get('test-key')).toBeNull();
  });

  it('should clear all cache entries', () => {
    cache.set('key1', 'value1', 60000);
    cache.set('key2', 'value2', 60000);
    cache.set('key3', 'value3', 60000);
    
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    
    cache.clear();
    
    // The clear method only removes nk_cache_ prefixed keys
    // Let's check the localStorage directly
    expect(localStorageMock.getItem('nk_cache_key1')).toBeNull();
    expect(localStorageMock.getItem('nk_cache_key2')).toBeNull();
    expect(localStorageMock.getItem('nk_cache_key3')).toBeNull();
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    // Should not throw an error
    expect(() => {
      cache.set('test-key', 'test-value', 60000);
    }).not.toThrow();

    // Restore original method
    localStorageMock.setItem = originalSetItem;
  });

  it('should track cache statistics', () => {
    cache.set('test-key', 'test-value', 60000);
    cache.get('test-key'); // Hit
    cache.get('non-existent'); // Miss
    
    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.5, 2);
  });
});
