/**
 * Unit Tests for Logger Utility
 * 
 * Tests logging behavior, log levels, and production/development modes.
 */

import { logger, log, logError, logWarn, logDebug } from '@/lib/utils/logger';

// Mock console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

describe('Logger Utility', () => {
  beforeEach(() => {
    // Reset logger state
    logger.clear();
    // Mock console methods
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('Development Mode', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should log info messages to console', () => {
      logger.info('Test message', { data: 'test' });
      
      expect(console.log).toHaveBeenCalledWith(
        '[INFO]',
        'Test message',
        { data: 'test' }
      );
    });

    it('should log warn messages to console', () => {
      logger.warn('Warning message', { warning: 'test' });
      
      expect(console.warn).toHaveBeenCalledWith(
        '[WARN]',
        'Warning message',
        { warning: 'test' }
      );
    });

    it('should log error messages to console', () => {
      logger.error('Error message', { error: 'test' });
      
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR]',
        'Error message',
        { error: 'test' }
      );
    });

    it('should log debug messages to console', () => {
      logger.debug('Debug message', { debug: 'test' });
      
      expect(console.log).toHaveBeenCalledWith(
        '[DEBUG]',
        'Debug message',
        { debug: 'test' }
      );
    });
  });

  describe('Production Mode', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    afterAll(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should not log info messages to console', () => {
      logger.info('Test message');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not log debug messages to console', () => {
      logger.debug('Debug message');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should still log errors (for error tracking)', () => {
      // In production, errors should be sent to error tracking service
      // For now, we just verify it doesn't crash
      expect(() => logger.error('Error message')).not.toThrow();
    });
  });

  describe('Log Storage', () => {
    it('should store log entries', () => {
      logger.info('Test message');
      const logs = logger.getLogs();
      
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Test message');
    });

    it('should limit log entries to maxLogs', () => {
      // Log more than maxLogs (100)
      for (let i = 0; i < 150; i++) {
        logger.info(`Message ${i}`);
      }
      
      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(100);
    });

    it('should filter logs by level', () => {
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      const errorLogs = logger.getLogs('error');
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe('error');
    });
  });

  describe('Convenience Functions', () => {
    it('should log using log() function', () => {
      log('Test message', { data: 'test' });
      expect(console.log).toHaveBeenCalled();
    });

    it('should log errors using logError() function', () => {
      logError('Error message', { error: 'test' });
      expect(console.error).toHaveBeenCalled();
    });

    it('should log warnings using logWarn() function', () => {
      logWarn('Warning message', { warning: 'test' });
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log debug using logDebug() function', () => {
      logDebug('Debug message', { debug: 'test' });
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('should clear all logs', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      
      logger.clear();
      
      expect(logger.getLogs()).toHaveLength(0);
    });
  });
});
