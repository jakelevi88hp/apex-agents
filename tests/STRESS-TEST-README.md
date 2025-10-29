# Stress Testing Suite

Comprehensive stress testing for the Apex Agents Platform to evaluate system performance under load.

## Overview

The stress testing suite simulates real-world usage scenarios with multiple concurrent users to identify performance bottlenecks, scalability issues, and system limits.

## Features

### Test Coverage

1. **Authentication Endpoints** - Tests login and token validation under load
2. **Dashboard API Endpoints** - Tests dashboard metrics and analytics queries
3. **Agent CRUD Operations** - Tests agent listing, creation, and management
4. **Workflow Execution** - Tests workflow listing and execution
5. **Analytics Queries** - Tests complex analytics and trend queries
6. **Knowledge Base Operations** - Tests document listing and search
7. **Concurrent User Simulation** - Simulates multiple users accessing the system simultaneously

### Metrics Collected

- **Total Requests** - Number of requests made
- **Success Rate** - Percentage of successful requests
- **Failure Rate** - Percentage of failed requests
- **Response Times** - Min, max, and average response times
- **Throughput** - Requests per second
- **Error Details** - Specific error messages and status codes

## Installation

```bash
cd /home/ubuntu/apex-agents
npm install
```

## Configuration

Create a `.env.test` file or set environment variables:

```bash
# Base URL of the application
BASE_URL=http://localhost:3000

# Authentication token for API requests
TEST_AUTH_TOKEN=your_jwt_token_here

# Number of concurrent users to simulate
CONCURRENT_USERS=10

# Number of requests each user makes
REQUESTS_PER_USER=50

# Time to ramp up all users (seconds)
RAMP_UP_TIME=10
```

## Usage

### Run All Tests

```bash
npx tsx tests/stress-test.ts
```

### Run with Custom Configuration

```bash
BASE_URL=https://your-app.vercel.app \
TEST_AUTH_TOKEN=your_token \
CONCURRENT_USERS=50 \
REQUESTS_PER_USER=100 \
RAMP_UP_TIME=30 \
npx tsx tests/stress-test.ts
```

### Run Against Production

```bash
# Get auth token first
TOKEN=$(curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Run stress test
BASE_URL=https://your-app.vercel.app \
TEST_AUTH_TOKEN=$TOKEN \
CONCURRENT_USERS=20 \
REQUESTS_PER_USER=100 \
npx tsx tests/stress-test.ts
```

## Test Scenarios

### Light Load (Development)
```bash
CONCURRENT_USERS=5 REQUESTS_PER_USER=20 npx tsx tests/stress-test.ts
```
- 5 concurrent users
- 20 requests per user
- Total: 100 requests

### Medium Load (Staging)
```bash
CONCURRENT_USERS=25 REQUESTS_PER_USER=50 npx tsx tests/stress-test.ts
```
- 25 concurrent users
- 50 requests per user
- Total: 1,250 requests

### Heavy Load (Production)
```bash
CONCURRENT_USERS=100 REQUESTS_PER_USER=100 npx tsx tests/stress-test.ts
```
- 100 concurrent users
- 100 requests per user
- Total: 10,000 requests

### Extreme Load (Stress Test)
```bash
CONCURRENT_USERS=500 REQUESTS_PER_USER=200 npx tsx tests/stress-test.ts
```
- 500 concurrent users
- 200 requests per user
- Total: 100,000 requests

## Output Example

```
🔥 Starting Stress Test Suite

Configuration:
- Base URL: http://localhost:3000
- Concurrent Users: 10
- Requests per User: 50
- Ramp-up Time: 10s

📝 Test 1: Authentication Endpoints

✅ Authentication Results:
   Total Requests: 50
   Successful: 50 (100.00%)
   Failed: 0 (0.00%)
   Avg Response Time: 45.23ms
   Min Response Time: 32.10ms
   Max Response Time: 89.45ms
   Requests/sec: 125.50

[... more tests ...]

================================================================================
📊 STRESS TEST SUMMARY
================================================================================

Overall Statistics:
  Total Requests: 2100
  Successful: 2095 (99.76%)
  Failed: 5 (0.24%)
  Average Response Time: 78.45ms
  Average Requests/sec: 156.32

Test Results by Component:
  ✅ Authentication: 100.00% success, 45.23ms avg
  ✅ Dashboard APIs: 99.80% success, 67.89ms avg
  ✅ Agent Operations: 100.00% success, 52.34ms avg
  ✅ Workflow Execution: 99.50% success, 123.45ms avg
  ⚠️  Analytics Queries: 98.00% success, 234.56ms avg
  ✅ Knowledge Operations: 100.00% success, 89.12ms avg
  ✅ Concurrent Users: 99.80% success, 56.78ms avg

================================================================================
🎯 Recommendations:

⚠️  Slow Response Times Detected:
   - Analytics Queries: 234.56ms (consider optimization)

================================================================================
```

## Performance Benchmarks

### Expected Performance

| Component | Target Response Time | Target Success Rate |
|-----------|---------------------|---------------------|
| Authentication | < 100ms | > 99% |
| Dashboard APIs | < 150ms | > 99% |
| Agent Operations | < 100ms | > 99% |
| Workflow Execution | < 200ms | > 98% |
| Analytics Queries | < 300ms | > 98% |
| Knowledge Operations | < 150ms | > 99% |

### Scalability Targets

| Metric | Target |
|--------|--------|
| Concurrent Users | 100+ |
| Requests/sec | 200+ |
| Average Response Time | < 200ms |
| Success Rate | > 99% |
| Error Rate | < 1% |

## Interpreting Results

### Success Indicators ✅
- Success rate > 99%
- Average response time < 200ms
- No timeout errors
- Consistent performance across tests

### Warning Signs ⚠️
- Success rate 95-99%
- Average response time 200-500ms
- Occasional timeout errors
- Performance degradation over time

### Critical Issues ❌
- Success rate < 95%
- Average response time > 500ms
- Frequent timeout or connection errors
- System crashes or becomes unresponsive

## Optimization Recommendations

### If Response Times Are High

1. **Database Optimization**
   - Add indexes to frequently queried columns
   - Optimize complex queries
   - Implement query result caching
   - Use database connection pooling

2. **API Optimization**
   - Implement response caching
   - Use CDN for static assets
   - Optimize payload sizes
   - Implement pagination

3. **Infrastructure**
   - Scale up server resources
   - Implement load balancing
   - Use edge functions
   - Optimize network configuration

### If Failure Rates Are High

1. **Error Handling**
   - Implement retry logic
   - Add circuit breakers
   - Improve error messages
   - Log errors for analysis

2. **Rate Limiting**
   - Implement rate limiting
   - Add request throttling
   - Queue long-running operations
   - Implement backpressure

3. **Monitoring**
   - Set up real-time monitoring
   - Configure alerts
   - Track error patterns
   - Monitor resource usage

## Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
name: Stress Test

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  stress-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Run Stress Tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TEST_AUTH_TOKEN: ${{ secrets.TEST_AUTH_TOKEN }}
          CONCURRENT_USERS: 50
          REQUESTS_PER_USER: 100
        run: npx tsx tests/stress-test.ts
```

## Best Practices

1. **Always test in staging first** - Never run stress tests directly on production without testing in staging
2. **Monitor system resources** - Watch CPU, memory, and database connections during tests
3. **Start small and scale up** - Begin with light load and gradually increase
4. **Test during off-peak hours** - Run production tests when user traffic is low
5. **Have a rollback plan** - Be prepared to scale down or rollback if issues occur
6. **Document results** - Keep records of test results for comparison over time
7. **Test regularly** - Run stress tests after major changes and on a regular schedule

## Troubleshooting

### Connection Refused Errors
- Ensure the application is running
- Check BASE_URL is correct
- Verify network connectivity

### Authentication Errors
- Verify TEST_AUTH_TOKEN is valid
- Check token hasn't expired
- Ensure user has proper permissions

### Timeout Errors
- Increase timeout values
- Reduce concurrent users
- Check server resources

### Memory Issues
- Reduce CONCURRENT_USERS
- Reduce REQUESTS_PER_USER
- Run tests in batches

## Additional Tools

For more advanced stress testing, consider:

- **Apache JMeter** - GUI-based load testing
- **Locust** - Python-based load testing
- **k6** - Modern load testing tool
- **Artillery** - Node.js load testing toolkit
- **Gatling** - Scala-based performance testing

## Support

For issues or questions about stress testing:
- Check application logs
- Review Vercel deployment logs
- Monitor database performance metrics
- Contact the development team

## License

MIT License - See LICENSE file for details

