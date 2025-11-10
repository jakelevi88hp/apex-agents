# Real-Time Application Debugger & Monitor

## Overview

A comprehensive debugging and monitoring system that automatically detects, classifies, and fixes errors in the Apex Agents application. It integrates with the AI Admin system for intelligent auto-remediation.

---

## Features

### 🔍 **Error Detection & Tracking**
- Real-time error capture from all API endpoints
- Automatic error classification by category
- Stack trace analysis and context preservation
- User-specific error tracking
- Endpoint-specific error monitoring

### 📊 **Performance Monitoring**
- Response time tracking (avg, p95, p99)
- Slow request detection (>5s)
- Database query performance
- API call success rates
- Resource utilization metrics

### 🏥 **Health Checks**
- Database connectivity monitoring
- AGI system health verification
- AI Admin availability checks
- Subscription service status
- Rate limiting functionality

### 🤖 **Auto-Fix System**
- AI-powered error analysis
- Automatic fix generation via AI Admin
- Code patch creation and validation
- Manual approval workflow for production
- Rollback capability for all fixes

### 🚨 **Alerting**
- Critical error detection
- Error spike identification
- Slack/email integration (configurable)
- Customizable alert thresholds
- Alert acknowledgment tracking

---

## Quick Start

### 1. Run Database Migration

```bash
psql $DATABASE_URL < migrations/003_add_debugger_tables.sql
```

This creates:
- `debugger_error_logs` - Error tracking
- `debugger_alerts` - Critical alerts
- `debugger_health_checks` - System health history
- `debugger_performance_metrics` - Performance data
- `debugger_auto_fixes` - Generated fixes

### 2. Initialize Monitor

The monitor automatically starts when the application starts. No manual initialization needed.

### 3. Access Dashboard

Navigate to: `/admin/debugger`

**Features:**
- Real-time health status of all components
- Error log with filtering and search
- Error statistics and trends
- Auto-refresh every 10 seconds
- Filter by resolved/unresolved errors

---

## API Endpoints

### Public Endpoint

#### `GET /api/debugger?action=health`

Returns overall system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T18:00:00.000Z",
  "components": [
    {
      "component": "database",
      "status": "healthy",
      "responseTime": 45,
      "lastChecked": "2025-11-09T18:00:00.000Z"
    },
    {
      "component": "agi_system",
      "status": "healthy",
      "responseTime": 120,
      "lastChecked": "2025-11-09T18:00:00.000Z",
      "metrics": { "tablesFound": 5 }
    }
  ]
}
```

### Protected Endpoints (Require Authentication)

#### `GET /api/debugger?action=errors`

Get recent errors with statistics.

**Response:**
```json
{
  "errors": [...],
  "stats": {
    "total": 42,
    "resolved": 38,
    "unresolved": 4,
    "byCategory": {
      "database": 5,
      "authentication": 2,
      "external_api": 3
    },
    "byLevel": {
      "error": 10,
      "warning": 30,
      "info": 2
    }
  }
}
```

#### `GET /api/debugger?action=unresolved`

Get only unresolved errors.

#### `GET /api/debugger?action=stats`

Get error statistics only.

#### `GET /api/debugger?action=health-detailed`

Get detailed health check results.

#### `POST /api/debugger`

Manually log an error (for testing).

**Request:**
```json
{
  "level": "error",
  "category": "test",
  "message": "Test error message",
  "stack": "...",
  "context": { "custom": "data" }
}
```

---

## Usage Examples

### Wrap API Routes with Error Monitoring

```typescript
import { withErrorMonitoring } from '@/lib/debugger/middleware';

export const POST = withErrorMonitoring(
  async (request: NextRequest) => {
    // Your route logic here
    return NextResponse.json({ success: true });
  },
  '/api/your-route'
);
```

### Manual Error Logging

```typescript
import { appMonitor } from '@/lib/debugger/monitor';

try {
  // Your code
} catch (error) {
  await appMonitor.logError({
    level: 'error',
    category: 'custom',
    message: error.message,
    stack: error.stack,
    userId: userId,
    endpoint: '/api/custom',
    context: { customData: 'value' },
  });
}
```

### Check System Health

```typescript
import { appMonitor } from '@/lib/debugger/monitor';

const health = await appMonitor.runHealthChecks();

for (const [component, status] of health.entries()) {
  console.log(`${component}: ${status.status}`);
}
```

### Generate Auto-Fix

```typescript
import { AutoFixService } from '@/lib/debugger/auto-fix';

// Generate a fix for an error
const fix = await AutoFixService.generateFix(error);

if (fix) {
  console.log('Fix generated:', fix.description);
  
  // Apply the fix (requires manual approval in production)
  const applied = await AutoFixService.applyFix(fix.id, true);
  
  if (applied) {
    console.log('Fix applied successfully');
  }
}
```

---

## Error Categories

The system automatically classifies errors into these categories:

- **database** - Database connection, query, or transaction errors
- **authentication** - JWT token, session, or auth failures
- **external_api** - OpenAI, Stripe, or other external API errors
- **payment** - Stripe payment processing errors
- **validation** - Input validation, UUID type mismatches
- **rate_limiting** - Rate limit exceeded errors
- **timeout** - Request timeout errors
- **performance** - Slow requests (>5s)
- **unhandled_rejection** - Unhandled promise rejections
- **uncaught_exception** - Uncaught exceptions
- **application** - General application errors

---

## Auto-Fix Patterns

The system can automatically generate fixes for:

### 1. UUID Type Errors

**Detection:** `invalid input syntax for type uuid`

**Fix:**
```typescript
// Before:
const sessionId = `session_${Date.now()}`;

// After:
const sessionId = crypto.randomUUID();
```

### 2. Database Connection Errors

**Detection:** `database connection failed`

**Fix:** Verify `DATABASE_URL`, check connection pool settings, implement retry logic

### 3. OpenAI API Errors

**Detection:** `openai api error`

**Fix:** Implement exponential backoff, check API key, monitor rate limits

### 4. Authentication Errors

**Detection:** `auth failed`

**Fix:** Verify JWT_SECRET, check token expiration logic

### 5. Rate Limiting

**Detection:** `rate limit exceeded`

**Fix:** Implement caching, consider Redis-based distributed rate limiting

---

## Monitoring Best Practices

### 1. Regular Health Checks

The system runs health checks every 60 seconds automatically. Monitor the dashboard for:
- **Healthy** (green) - Component operating normally
- **Degraded** (yellow) - Component functional but with issues
- **Down** (red) - Component not responding

### 2. Error Spike Detection

The system detects error spikes (5+ similar errors in 30s) and:
- Generates a comprehensive fix
- Applies fix to all related errors
- Sends alert if unable to auto-fix

### 3. Critical Error Alerts

Critical errors trigger immediate alerts. These include:
- Database connection failures
- Authentication system failures
- Payment processing errors
- OpenAI API failures
- Stripe webhook failures

### 4. Performance Monitoring

Monitor for:
- Slow requests (>5s response time)
- High error rates (>5%)
- Database query timeouts
- API call failures

---

## Configuration

### Environment Variables

```bash
# Optional: Slack webhook for alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Optional: Email alerts
ALERT_EMAIL=admin@example.com

# Optional: PagerDuty integration
PAGERDUTY_API_KEY=...
```

### Customization

Edit `/src/lib/debugger/monitor.ts` to customize:
- Health check intervals (default: 60s)
- Error analysis frequency (default: 30s)
- Log cleanup schedule (default: 5min)
- Critical error patterns
- Auto-fix strategies

---

## Dashboard Features

### Real-Time Updates

- Auto-refresh every 10 seconds (configurable)
- Manual refresh button
- Toggle auto-refresh on/off

### Error Filtering

- **All** - Show all errors
- **Unresolved** - Show only unresolved errors
- Filter by category, level, or endpoint

### Component Cards

Each component shows:
- Current status (healthy/degraded/down)
- Response time
- Error messages (if any)
- Component-specific metrics

### Error Details

Each error shows:
- Severity level (error/warning/info)
- Category badge
- Endpoint badge
- Timestamp
- Full error message
- Applied fix (if any)
- Resolution status

---

## Integration with AI Admin

The debugger integrates seamlessly with AI Admin for intelligent auto-fixing:

1. **Error Detection** - Monitor detects an error
2. **Classification** - Error is automatically classified
3. **Fix Generation** - AI Admin generates a code patch
4. **Validation** - Patch is validated for correctness
5. **Manual Approval** - Admin reviews and approves (production)
6. **Application** - Fix is applied to codebase
7. **Verification** - System verifies fix resolved the error
8. **Rollback** - Available if fix causes issues

---

## Testing

### Test Health Check

```bash
curl https://apex-agents.vercel.app/api/debugger?action=health
```

### Test Error Logging

```bash
curl -X POST https://apex-agents.vercel.app/api/debugger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "level": "error",
    "category": "test",
    "message": "Test error from API"
  }'
```

### View Dashboard

Navigate to: https://apex-agents.vercel.app/admin/debugger

---

## Troubleshooting

### Dashboard Not Loading

**Solution:** Check authentication token, verify admin access

### Errors Not Appearing

**Solution:** Check database connection, verify migration ran successfully

### Auto-Fix Not Working

**Solution:** Verify OpenAI API key, check AI Admin configuration

### Health Checks Failing

**Solution:** Check database credentials, verify tables exist

---

## Performance Impact

The debugger is designed for minimal performance impact:

- **Memory:** ~10MB for error buffer and caches
- **CPU:** <1% additional load
- **Database:** Async writes, no blocking operations
- **Network:** No external calls except AI Admin (on-demand)

---

## Future Enhancements

- [ ] Machine learning for error prediction
- [ ] Automatic performance optimization suggestions
- [ ] Integration with CI/CD for automatic deployments
- [ ] Advanced analytics and trend analysis
- [ ] Mobile app for alerts
- [ ] Integration with monitoring tools (Datadog, New Relic)
- [ ] A/B testing for auto-fixes
- [ ] Community-driven fix database

---

## Support

For issues or questions:
- Check the error log in `/admin/debugger`
- Review database logs in Neon console
- Check Sentry for additional error details
- Contact: support@apexagents.com

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2025-11-09
