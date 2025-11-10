/**
 * Error Catching Middleware
 * 
 * Automatically captures errors and sends them to the monitor
 */

import { NextRequest, NextResponse } from 'next/server';
import { appMonitor } from './monitor';

export interface ErrorContext {
  endpoint?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Wrap an API route handler with error monitoring
 */
export function withErrorMonitoring<T>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse | Response>,
  routeName: string
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse | Response> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // Execute the handler
      const response = await handler(request, context);
      
      // Log successful request (for performance monitoring)
      const duration = Date.now() - startTime;
      
      if (duration > 5000) {
        // Slow request warning
        await appMonitor.logError({
          level: 'warning',
          category: 'performance',
          message: `Slow request detected: ${routeName} took ${duration}ms`,
          endpoint: routeName,
          context: {
            requestId,
            duration,
            method: request.method,
          },
        });
      }

      return response;
    } catch (error) {
      // Capture error details
      const errorContext: ErrorContext = {
        endpoint: routeName,
        method: request.method,
        requestId,
        headers: Object.fromEntries(request.headers.entries()),
      };

      // Try to get user ID from auth header
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '');
          // In production, decode JWT to get userId
          errorContext.userId = 'extracted-from-jwt';
        } catch (e) {
          // Ignore JWT decoding errors
        }
      }

      // Try to get request body
      try {
        const bodyText = await request.text();
        if (bodyText) {
          errorContext.body = JSON.parse(bodyText);
        }
      } catch (e) {
        // Ignore body parsing errors
      }

      // Log the error
      await appMonitor.logError({
        level: 'error',
        category: this.categorizeError(error),
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        endpoint: routeName,
        context: errorContext,
      });

      // Return error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
          requestId,
        },
        { status: 500 }
      );
    }
  };

  categorizeError(error: unknown): string {
    if (!error) return 'unknown';
    
    const message = error instanceof Error ? error.message : String(error);
    
    if (/database/i.test(message)) return 'database';
    if (/auth/i.test(message)) return 'authentication';
    if (/openai/i.test(message)) return 'external_api';
    if (/stripe/i.test(message)) return 'payment';
    if (/uuid/i.test(message)) return 'validation';
    if (/rate.*limit/i.test(message)) return 'rate_limiting';
    if (/timeout/i.test(message)) return 'timeout';
    
    return 'application';
  }
}

/**
 * Global error handler for uncaught errors
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') {
    // Server-side error handling
    process.on('unhandledRejection', async (reason: any) => {
      await appMonitor.logError({
        level: 'error',
        category: 'unhandled_rejection',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        context: { type: 'unhandledRejection' },
      });
    });

    process.on('uncaughtException', async (error: Error) => {
      await appMonitor.logError({
        level: 'error',
        category: 'uncaught_exception',
        message: error.message,
        stack: error.stack,
        context: { type: 'uncaughtException' },
      });
    });
  }
}
