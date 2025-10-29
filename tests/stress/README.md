# Stress Testing & Performance Monitoring

Comprehensive stress testing suite for the Apex Agents platform.

## Quick Start

### Run Stress Tests
```bash
npm run stress:test
```

### Run Health Check
```bash
npm run health:check
```

## Stress Test Configuration

Configure via environment variables:

```bash
# Base URL to test
export TEST_BASE_URL=http://localhost:3000

# Number of concurrent users
export CONCURRENT_USERS=10

# Requests per user
export REQUESTS_PER_USER=10

# Request timeout (ms)
export REQUEST_TIMEOUT=30000

# Run stress test
npm run stress:test
```

## What Gets Tested

### 1. Homepage Load Test
- Tests static page serving
- Baseline performance measurement
- CDN and caching effectiveness

### 2. API Health Check
- API availability
- Response time monitoring
- Error rate tracking

### 3. Database Connection Pooling
- Connection pool efficiency
- Query performance under load
- Connection leak detection

### 4. Authentication Endpoint
- Login request handling
- Token generation performance
- Rate limiting effectiveness

### 5. AI Admin Endpoint (if authenticated)
- Command processing under load
- LLM API rate limiting
- Concurrent request handling

### 6. AGI Endpoint
- Query processing performance
- Reasoning engine scalability
- Memory usage patterns

## Interpreting Results

### Success Rates
- **✅ PASS**: ≥95% success rate
- **⚠️ WARN**: 80-94% success rate
- **❌ FAIL**: <80% success rate

### Response Times
- **Excellent**: <100ms average
- **Good**: 100-500ms average
- **Acceptable**: 500-1000ms average
- **Poor**: >1000ms average

### Requests Per Second
- **High**: >100 req/s
- **Medium**: 50-100 req/s
- **Low**: <50 req/s

## Health Check Components

### Database
- Connection status
- Query response time
- Active connections count

### API Endpoints
- Availability status
- Response time
- HTTP status codes

### Environment Variables
- Required variables present
- Configuration completeness

### Memory Usage
- Heap usage percentage
- RSS (Resident Set Size)
- External memory

## Common Issues & Solutions

### High Failure Rate
**Symptoms**: >20% failed requests

**Possible Causes**:
- Database connection pool exhausted
- API rate limiting
- Insufficient server resources
- Network timeouts

**Solutions**:
1. Increase database connection pool size
2. Implement request queuing
3. Scale server resources
4. Optimize slow queries

### Slow Response Times
**Symptoms**: >1000ms average response time

**Possible Causes**:
- Unoptimized database queries
- Missing indexes
- Large payload sizes
- External API latency

**Solutions**:
1. Add database indexes
2. Implement caching
3. Optimize queries
4. Use pagination

### Memory Leaks
**Symptoms**: Increasing memory usage over time

**Possible Causes**:
- Unclosed database connections
- Event listener leaks
- Large object retention
- Circular references

**Solutions**:
1. Use connection pooling properly
2. Remove event listeners
3. Implement garbage collection
4. Profile memory usage

## Continuous Monitoring

### Local Development
```bash
# Run health check before committing
npm run health:check

# Run stress test for major changes
npm run stress:test
```

### CI/CD Pipeline
Add to your CI/CD workflow:

```yaml
- name: Health Check
  run: npm run health:check

- name: Stress Test
  run: npm run stress:test
  env:
    CONCURRENT_USERS: 5
    REQUESTS_PER_USER: 5
```

### Production Monitoring
Set up automated health checks:

```bash
# Cron job (every 5 minutes)
*/5 * * * * curl https://apex-agents.vercel.app/api/health
```

## Performance Benchmarks

### Target Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| API Response Time | <200ms | <500ms | >1000ms |
| Success Rate | >99% | >95% | <95% |
| Database Query Time | <50ms | <100ms | >200ms |
| Memory Usage | <60% | <80% | >90% |
| Requests/Second | >100 | >50 | <50 |

## Advanced Testing

### Custom Stress Test
```typescript
import { StressTestRunner } from './stress-test';

const runner = new StressTestRunner({
  baseUrl: 'http://localhost:3000',
  concurrentUsers: 20,
  requestsPerUser: 50,
  timeout: 10000,
});

await runner.testEndpoint(
  'Custom Endpoint Test',
  '/api/custom',
  'POST',
  { data: 'test' }
);
```

### Memory Profiling
```bash
# Run with memory profiling
node --inspect tests/stress/stress-test.ts

# Open Chrome DevTools
chrome://inspect
```

## Troubleshooting

### Tests Timing Out
- Increase `REQUEST_TIMEOUT`
- Reduce `CONCURRENT_USERS`
- Check network connectivity

### Database Connection Errors
- Verify `DATABASE_URL`
- Check connection pool settings
- Ensure database is running

### Out of Memory
- Reduce test load
- Increase Node.js heap size: `NODE_OPTIONS=--max-old-space-size=4096`
- Profile memory usage

## Best Practices

1. **Run tests regularly** - Catch performance regressions early
2. **Test in production-like environment** - Use similar data volumes
3. **Monitor trends** - Track metrics over time
4. **Set realistic targets** - Based on actual usage patterns
5. **Test edge cases** - High load, slow networks, failures
6. **Document baselines** - Know your normal performance
7. **Automate testing** - Include in CI/CD pipeline

## Report Analysis

Stress test reports are saved with timestamps:
```
stress-test-report-2025-10-29T02-30-00-000Z.txt
```

Review reports for:
- Performance trends
- Error patterns
- Capacity planning
- Bottleneck identification

