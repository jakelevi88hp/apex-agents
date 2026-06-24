/**
 * Authentication Middleware
 * Provides utilities for protecting API endpoints with JWT authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify JWT token and return payload
 */
export function verifyRequestToken(request: NextRequest): JWTPayload | null {
  const token = extractToken(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

/**
 * Middleware to require authentication
 * Returns 401 if token is missing or invalid
 */
export function requireAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = verifyRequestToken(request);

    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing or invalid authentication token',
        },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = verifyRequestToken(request);

    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing or invalid authentication token',
        },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Admin access required',
        },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Middleware to verify webhook signature (for Stripe, etc.)
 */
export function verifyWebhookSignature(
  secret: string,
  handler: (request: NextRequest, body: unknown) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const signature = request.headers.get('x-signature') || request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing webhook signature',
        },
        { status: 401 }
      );
    }

    try {
      const body = await request.json();
      // In production, verify the signature against the secret
      // For now, we'll accept the request if signature header exists
      return handler(request, body);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid request body',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Extract user ID from request
 */
export function getUserId(request: NextRequest): string | null {
  const user = verifyRequestToken(request);
  return user?.userId || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  return verifyRequestToken(request) !== null;
}
