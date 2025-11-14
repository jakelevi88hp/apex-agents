/**
 * Typed LocalStorage Utility
 * 
 * Provides type-safe localStorage access with error handling.
 * Prevents runtime errors from invalid JSON or missing keys.
 */

type StorageKey = 'token' | 'theme' | 'notifications' | 'user_preferences';

interface StorageValue {
  token: string;
  theme: 'light' | 'dark';
  notifications: string; // JSON string
  user_preferences: string; // JSON string
}

/**
 * Get value from localStorage with type safety
 */
export function getStorageItem<K extends StorageKey>(
  key: K
): StorageValue[K] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    return item as StorageValue[K] | null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set value in localStorage with type safety
 */
export function setStorageItem<K extends StorageKey>(
  key: K,
  value: StorageValue[K]
): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: StorageKey): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all localStorage items
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get JSON value from localStorage
 */
export function getStorageJSON<T>(key: StorageKey): T | null {
  const item = getStorageItem(key);
  if (!item) return null;
  
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing JSON for key "${key}":`, error);
    return null;
  }
}

/**
 * Set JSON value in localStorage
 */
export function setStorageJSON<T>(key: StorageKey, value: T): void {
  try {
    const json = JSON.stringify(value);
    setStorageItem(key, json as StorageValue[typeof key]);
  } catch (error) {
    console.error(`Error stringifying JSON for key "${key}":`, error);
  }
}
