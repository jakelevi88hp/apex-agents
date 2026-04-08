/**
 * Next.js Middleware
 * 
 * Applies security headers and other middleware to all requests
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders, applyCORSHeaders } from '@/lib/middleware/security-headers';

export function middleware(request: NextRequest) {
  // Create response
  let response = NextResponse.next();

  // Apply security headers
  response = applySecurityHeaders(response);

  // Apply CORS headers if needed
  const origin = request.headers.get('origin');
  if (origin) {
    response = applyCORSHeaders(response, origin);
  }

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware]', {
      method: request.method,
      pathname: request.nextUrl.pathname,
      requestId,
    });
  }

  return response;
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Apply to all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
