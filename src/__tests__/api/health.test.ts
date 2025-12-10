/**
 * Integration Tests for Health Check API
 * 
 * Tests health check endpoints and system status.
 */

import { GET } from '@/app/api/health/route';

// Mock database
jest.mock('@/lib/db', () => {
  const executeMock = jest.fn().mockResolvedValue([{ result: 1 }]);
  return {
    __esModule: true,
    db: {
      execute: executeMock,
    },
    executeMock,
  };
});

const { executeMock } = require('@/lib/db');

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    executeMock.mockResolvedValue([{ result: 1 }]);
  });

  it('should return 200 when system is healthy', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
  });

  it('should include timestamp in response', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
  });
});
