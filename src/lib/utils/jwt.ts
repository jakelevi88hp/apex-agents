/**
 * JWT Utility Functions
 * 
 * Centralized JWT token parsing and validation.
 * Prevents code duplication across components.
 */

import type { JWTPayload } from '@/lib/auth/jwt';

/**
 * Parse JWT token payload without verification
 * Use for client-side display only. Always verify on server.
 */
export function parseJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Error parsing JWT payload:', error);
    return null;
  }
}

/**
 * Get JWT payload from localStorage token
 */
export function getTokenPayload(): JWTPayload | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  return parseJWTPayload(token);
}

/**
 * Check if user has admin role
 */
export function isAdmin(): boolean {
  const payload = getTokenPayload();
  return payload?.role === 'admin' || payload?.role === 'owner' || false;
}

/**
 * Get user ID from token
 */
export function getUserId(): string | null {
  const payload = getTokenPayload();
  return payload?.userId || null;
}
