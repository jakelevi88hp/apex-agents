/**
 * Logging and Observability System
 * 
 * Provides structured logging with context, tracing, and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
}

/**
 * Structured Logger
 */
class Logger {
  private context: LogContext = {};
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Set context for all subsequent logs
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Get current context
   */
  getContext(): LogContext {
    return { ...this.context };
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log('error', message, context, err);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log('fatal', message, context, err);
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.context, ...context },
      error,
      stack: error?.stack,
    };

    // Log to console in development
    if (this.isDevelopment) {
      this.logToConsole(entry);
    }

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      this.logToSentry(entry);
    }

    // Store in memory for debugging
    this.storeInMemory(entry);
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase()}]`;
    const contextStr = Object.keys(entry.context || {}).length > 0
      ? JSON.stringify(entry.context)
      : '';

    const message = `${prefix} ${entry.message} ${contextStr}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'fatal':
        console.error(message, entry.error);
        break;
    }
  }

  /**
   * Log to Sentry
   */
  private logToSentry(entry: LogEntry): void {
    const sentryLevel = entry.level === 'fatal' ? 'fatal' : entry.level === 'error' ? 'error' : 'warning';

    if (entry.error) {
      Sentry.captureException(entry.error, {
        level: sentryLevel,
        tags: {
          log_level: entry.level,
        },
        extra: entry.context,
      });
    } else {
      Sentry.captureMessage(entry.message, sentryLevel, {
        tags: {
          log_level: entry.level,
        },
        extra: entry.context,
      });
    }
  }

  /**
   * Store in memory for debugging
   */
  private storeInMemory(entry: LogEntry): void {
    // Store last 1000 entries
    if (!globalThis.logHistory) {
      globalThis.logHistory = [];
    }

    (globalThis.logHistory as LogEntry[]).push(entry);

    if ((globalThis.logHistory as LogEntry[]).length > 1000) {
      (globalThis.logHistory as LogEntry[]).shift();
    }
  }

  /**
   * Get log history
   */
  getHistory(limit: number = 100): LogEntry[] {
    if (!globalThis.logHistory) {
      return [];
    }

    return (globalThis.logHistory as LogEntry[]).slice(-limit);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel, limit: number = 100): LogEntry[] {
    return this.getHistory(limit).filter((entry) => entry.level === level);
  }

  /**
   * Get logs by context
   */
  getLogsByContext(key: string, value: unknown, limit: number = 100): LogEntry[] {
    return this.getHistory(limit).filter(
      (entry) => entry.context && entry.context[key] === value
    );
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    if (globalThis.logHistory) {
      (globalThis.logHistory as LogEntry[]).length = 0;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Request logger middleware
 */
export function createRequestLogger(requestId: string) {
  return {
    setRequestContext: (context: Partial<LogContext>) => {
      logger.setContext({ requestId, ...context });
    },
    clearRequestContext: () => {
      logger.clearContext();
    },
    logRequest: (method: string, endpoint: string) => {
      logger.info(`${method} ${endpoint}`, { requestId, method, endpoint });
    },
    logResponse: (statusCode: number, duration: number) => {
      logger.info(`Response: ${statusCode}`, { statusCode, duration });
    },
    logError: (error: Error, context?: LogContext) => {
      logger.error('Request error', error, { requestId, ...context });
    },
  };
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private startTime: number;
  private marks: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    this.marks.set(name, Date.now());
  }

  /**
   * Get duration from start
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get duration between two marks
   */
  getDurationBetween(mark1: string, mark2: string): number | null {
    const time1 = this.marks.get(mark1);
    const time2 = this.marks.get(mark2);

    if (time1 === undefined || time2 === undefined) {
      return null;
    }

    return Math.abs(time2 - time1);
  }

  /**
   * Log performance metrics
   */
  logMetrics(endpoint: string, method: string): void {
    const duration = this.getDuration();

    logger.info(`Performance: ${method} ${endpoint}`, {
      endpoint,
      method,
      duration,
      marks: Object.fromEntries(this.marks),
    });

    // Alert if slow
    if (duration > 5000) {
      logger.warn(`Slow request: ${method} ${endpoint}`, {
        endpoint,
        method,
        duration,
      });
    }
  }

  /**
   * Get all marks
   */
  getMarks(): Record<string, number> {
    return Object.fromEntries(this.marks);
  }
}

/**
 * Trace ID generator
 */
export function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create trace ID from request
 */
export function getTraceId(request: Request): string {
  const existing = request.headers.get('X-Trace-ID');
  return existing || generateTraceId();
}
