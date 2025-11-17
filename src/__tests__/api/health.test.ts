/**
 * Integration Tests for Health Check API
 * 
 * Tests health check endpoints and system status.
 */

import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
  },
}));

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when system is healthy', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('should include timestamp in response', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
  });
});
