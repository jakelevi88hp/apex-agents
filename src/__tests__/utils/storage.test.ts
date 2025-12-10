/**
 * Unit Tests for Storage Utilities
 * 
 * Tests type-safe localStorage access, error handling, and JSON operations.
 */

import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getStorageJSON,
  setStorageJSON,
} from '@/lib/utils/storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getStorageItem', () => {
    it('should return null for non-existent key', () => {
      expect(getStorageItem('token')).toBeNull();
    });

    it('should return stored value', () => {
      localStorage.setItem('token', 'test-token');
      expect(getStorageItem('token')).toBe('test-token');
    });

    it('should return null in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR
      delete global.window;
      
      expect(getStorageItem('token')).toBeNull();
      
      global.window = originalWindow;
    });

    it('should handle localStorage errors gracefully', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(getStorageItem('token')).toBeNull();

      localStorage.getItem = originalGetItem;
    });
  });

  describe('setStorageItem', () => {
    it('should store value in localStorage', () => {
      setStorageItem('token', 'test-token');
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should not throw in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR
      delete global.window;
      
      expect(() => setStorageItem('token', 'test-token')).not.toThrow();
      
      global.window = originalWindow;
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => setStorageItem('token', 'test-token')).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('removeStorageItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      removeStorageItem('token');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should not throw if item does not exist', () => {
      expect(() => removeStorageItem('token')).not.toThrow();
    });
  });

  describe('clearStorage', () => {
    it('should clear all localStorage items', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('theme', 'dark');
      clearStorage();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('theme')).toBeNull();
    });
  });

  describe('getStorageJSON', () => {
    it('should return null for non-existent key', () => {
      expect(getStorageJSON('user_preferences')).toBeNull();
    });

    it('should parse valid JSON', () => {
      const data = { theme: 'dark', notifications: true };
      localStorage.setItem('user_preferences', JSON.stringify(data));
      expect(getStorageJSON('user_preferences')).toEqual(data);
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('user_preferences', 'invalid-json');
      expect(getStorageJSON('user_preferences')).toBeNull();
    });
  });

  describe('setStorageJSON', () => {
    it('should store JSON stringified value', () => {
      const data = { theme: 'dark', notifications: true };
      setStorageJSON('user_preferences', data);
      const stored = localStorage.getItem('user_preferences');
      expect(stored).toBe(JSON.stringify(data));
    });

    it('should handle circular references gracefully', () => {
      const circular: { self?: unknown } = {};
      circular.self = circular;
      
      expect(() => setStorageJSON('user_preferences', circular)).not.toThrow();
    });
  });
});
