# Security Implementation Guide

## Overview

This document describes the comprehensive security implementation for the Apex Agents application, including authentication, rate limiting, security headers, monitoring, and best practices.

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Security Headers](#security-headers)
4. [Monitoring and Alerts](#monitoring-and-alerts)
5. [API Endpoints](#api-endpoints)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Authentication

### JWT Token-Based Authentication

All protected endpoints require a valid JWT token in the `Authorization` header.

**Format:**
```
Authorization: Bearer <jwt_token>
```

**Token Structure:**
```typescript
{
  userId: string;
  email: string;
  role?: 'user' | 'admin' | 'owner';
  iat: number;  // Issued at
  exp: number;  // Expires at (7 days)
}
```

### Creating Tokens

```typescript
import { signToken } from '@/lib/auth';

const token = signToken({
  userId: 'user-123',
  email: 'user@example.com',
  role: 'user',
});
```

### Verifying Tokens

```typescript
import { verifyRequestToken } from '@/lib/middleware/auth-middleware';

export async function POST(request: NextRequest) {
  const user = verifyRequestToken(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // User is authenticated
  console.log(user.userId);
}
```

### Admin-Only Endpoints

```typescript
export async function GET(request: NextRequest) {
  const user = verifyRequestToken(request);
  
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Admin-only logic
}
```

---

## Rate Limiting

### Overview

Rate limiting prevents abuse by limiting the number of requests from a single IP address within a time window.

### Configuration

**Predefined Limits:**
- **Auth**: 5 requests per 15 minutes
- **API**: 100 requests per minute
- **Public**: 1000 requests per minute
- **Webhook**: 50 requests per minute

### Implementation

```typescript
import { checkRateLimit, RATE_LIMITS } from '@/lib/middleware/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkRateLimit(ip, RATE_LIMITS.api)) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  // Process request
}
```

### Response Headers

When a request is rate limited, the response includes:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds to wait before retrying

---

## Security Headers

### Headers Applied

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking attacks |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS protection for older browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | Restricted | Restrict browser features |
| `Content-Security-Policy` | Strict | Prevent XSS and injection attacks |
| `Strict-Transport-Security` | `max-age=31536000` | Enforce HTTPS |

### Applying Headers

```typescript
import { applySecurityHeaders } from '@/lib/middleware/security-headers';

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'test' });
  applySecurityHeaders(response);
  return response;
}
```

### Content Security Policy

The CSP header includes:
- `default-src 'self'` - Only allow same-origin resources
- `script-src 'self' 'unsafe-inline'` - Allow scripts from same origin
- `style-src 'self' 'unsafe-inline'` - Allow styles from same origin
- `img-src 'self' data: https:` - Allow images from same origin and HTTPS
- `object-src 'none'` - Disallow plugins
- `frame-ancestors 'none'` - Prevent framing

---

## Monitoring and Alerts

### Monitoring Endpoints

#### GET /api/monitoring/metrics
**Authentication**: Admin required

Returns detailed performance and security metrics.

**Response:**
```json
{
  "status": "success",
  "health": {
    "status": "healthy",
    "metrics": {
      "error_rate": 0.02,
      "error_count": 2,
      "total_requests": 100
    }
  },
  "metrics": {
    "performance": { ... },
    "security": { ... },
    "alerts": { ... }
  }
}
```

#### GET /api/monitoring/security
**Authentication**: Admin required

Returns security-specific metrics and recent events.

**Query Parameters:**
- `minutes` (optional): Time range in minutes (default: 60)

**Response:**
```json
{
  "status": "success",
  "health": { ... },
  "summary": {
    "totalSecurityEvents": 5,
    "totalAlerts": 2,
    "securityAlerts": 1,
    "eventRate": "0.08"
  },
  "eventsByType": {
    "auth_failure": 3,
    "rate_limit_exceeded": 2
  },
  "topIPs": [
    { "ip": "192.168.1.1", "count": 5 }
  ],
  "recommendations": [
    "✅ System appears healthy. Continue monitoring."
  ]
}
```

### Alert Thresholds

| Event | Threshold | Severity |
|-------|-----------|----------|
| Auth Failures | > 10 per minute | High |
| Rate Limit Violations | > 50 per minute | Medium |
| Unauthorized Access | > 5 per minute | High |
| Slow Responses | > 5 seconds | Medium |
| Error Rate | > 5% | High |
| High Memory Usage | > 85% | High |

### Recording Events

```typescript
import { recordSecurityEvent, recordPerformanceMetric } from '@/lib/monitoring/alerts';

// Record security event
recordSecurityEvent({
  type: 'auth_failure',
  ip: '192.168.1.1',
  endpoint: '/api/login',
  userId: 'user-123',
});

// Record performance metric
recordPerformanceMetric({
  endpoint: '/api/data',
  method: 'GET',
  responseTime: 250,
  statusCode: 200,
});
```

### Sentry Integration

All security events and performance issues are automatically sent to Sentry in production:

```typescript
import * as Sentry from '@sentry/nextjs';

// Errors are automatically captured
// Security events are sent as warnings
// Performance issues are tracked
```

---

## API Endpoints

### Public Endpoints (No Auth Required)

#### GET /api/health
Returns system health status.

**Rate Limit**: 1000 req/min

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T12:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "api": {
      "status": "up",
      "responseTime": 5
    }
  }
}
```

#### GET /api/health/db
Returns database connectivity status.

**Rate Limit**: 1000 req/min

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T12:00:00Z",
  "database": {
    "connected": true,
    "responseTime": 25,
    "activeConnections": 5
  }
}
```

### Protected Endpoints (Auth Required)

#### POST /api/ai-admin/stream
Streaming AI chat endpoint.

**Authentication**: Required (Bearer token)
**Rate Limit**: 100 req/min
**Authorization**: User must match token

**Request:**
```json
{
  "conversationId": "conv-123",
  "message": "What is the codebase structure?",
  "userId": "user-123",
  "mode": "chat"
}
```

**Response**: Server-Sent Events (SSE) stream

### Admin-Only Endpoints

#### GET /api/monitoring/metrics
Returns detailed metrics.

**Authentication**: Admin required
**Rate Limit**: 100 req/min

#### GET /api/monitoring/security
Returns security metrics.

**Authentication**: Admin required
**Rate Limit**: 100 req/min

---

## Best Practices

### 1. Token Management

✅ **DO:**
- Store tokens securely (HTTP-only cookies or secure storage)
- Refresh tokens before expiration
- Invalidate tokens on logout
- Use HTTPS for all token transmission

❌ **DON'T:**
- Store tokens in localStorage
- Expose tokens in URLs
- Log tokens to console
- Share tokens between users

### 2. Rate Limiting

✅ **DO:**
- Use appropriate limits for different endpoint types
- Implement exponential backoff for retries
- Monitor rate limit violations
- Adjust limits based on usage patterns

❌ **DON'T:**
- Use IP address alone for rate limiting (behind proxies)
- Set limits too low (causes false positives)
- Ignore rate limit headers
- Cache responses indefinitely

### 3. Security Headers

✅ **DO:**
- Apply security headers to all responses
- Use CSP to prevent XSS attacks
- Enable HSTS for HTTPS enforcement
- Regularly audit security headers

❌ **DON'T:**
- Disable security headers for convenience
- Use overly permissive CSP policies
- Expose server information in headers
- Ignore security warnings

### 4. Error Handling

✅ **DO:**
- Return generic error messages to users
- Log detailed errors server-side
- Include error IDs for tracking
- Avoid exposing sensitive information

❌ **DON'T:**
- Expose stack traces to users
- Log sensitive data (passwords, tokens)
- Return database errors directly
- Ignore error patterns

### 5. Monitoring

✅ **DO:**
- Monitor all security events
- Set up alerts for anomalies
- Review logs regularly
- Track performance metrics

❌ **DON'T:**
- Ignore security alerts
- Store monitoring data indefinitely
- Expose monitoring endpoints publicly
- Skip security audits

---

## Troubleshooting

### 401 Unauthorized

**Problem**: Request returns 401 Unauthorized

**Solutions**:
1. Verify Authorization header is present: `Authorization: Bearer <token>`
2. Check token is valid and not expired
3. Verify JWT_SECRET environment variable is set
4. Check token payload matches expected format

**Debug**:
```typescript
const user = verifyRequestToken(request);
console.log('User:', user); // Should not be null
```

### 403 Forbidden

**Problem**: Request returns 403 Forbidden

**Solutions**:
1. Verify user role is 'admin' or 'owner' for admin endpoints
2. Check user ID matches request (for user-specific endpoints)
3. Verify token has required permissions

**Debug**:
```typescript
const user = verifyRequestToken(request);
console.log('Role:', user?.role); // Should be 'admin' or 'owner'
```

### 429 Too Many Requests

**Problem**: Request returns 429 Too Many Requests

**Solutions**:
1. Wait for rate limit window to reset (check `Retry-After` header)
2. Implement exponential backoff in client
3. Check if IP is being rate limited (behind proxy?)
4. Review rate limit thresholds

**Debug**:
```typescript
const remaining = getRemainingRequests(ip, config);
console.log('Remaining requests:', remaining);
console.log('Reset time:', getResetTime(ip));
```

### Slow Responses

**Problem**: Requests taking > 5 seconds

**Solutions**:
1. Check database performance
2. Optimize queries
3. Add caching
4. Scale infrastructure

**Monitor**:
```
GET /api/monitoring/metrics
- Check averageResponseTime
- Review slowest endpoints
```

### High Error Rate

**Problem**: Error rate > 5%

**Solutions**:
1. Check error logs in Sentry
2. Review recent deployments
3. Check database connectivity
4. Monitor resource usage

**Monitor**:
```
GET /api/monitoring/security
- Check error_rate in metrics
- Review recent alerts
```

---

## Additional Resources

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Rate Limiting Strategies](https://en.wikipedia.org/wiki/Rate_limiting)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Sentry Documentation](https://docs.sentry.io/)

---

## Support

For security issues or questions:
1. Review this documentation
2. Check monitoring endpoints for current status
3. Review error logs in Sentry
4. Contact the security team

---

**Last Updated**: February 6, 2026  
**Version**: 1.0  
**Status**: Production Ready
