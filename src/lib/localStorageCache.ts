// src/lib/localStorageCache.ts
type CacheItem<T> = {
  data: T;
  expiry: number;
};

export const localStorageCache = {
  set: <T>(key: string, data: T, ttlMinutes = 60): void => {
    try {
      const item: CacheItem<T> = {
        data,
        expiry: Date.now() + ttlMinutes * 60 * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Check if the item has expired
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};