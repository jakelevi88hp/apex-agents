/**
 * Initialize Global Error Handling
 * Setup all error handlers for the application
 */

import { setupGlobalErrorHandlers } from '@/lib/errorHandler';

/**
 * Initialize all error handling
 */
export function initializeErrorHandling(): void {
  // Setup global error handlers
  setupGlobalErrorHandlers();

  // Log initialization
  if (process.env.NODE_ENV === 'development') {
    console.log('[Error Handling] Global error handlers initialized');
  }
}

/**
 * Initialize error handling on app load
 */
if (typeof window !== 'undefined') {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeErrorHandling);
  } else {
    initializeErrorHandling();
  }
}
