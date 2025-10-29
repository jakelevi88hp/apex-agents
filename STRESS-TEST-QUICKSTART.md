# Stress Test Quick Start Guide

Quick guide to run stress tests on the Apex Agents Platform.

## 🚀 Quick Start (5 minutes)

### 1. Get Your Auth Token

```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | jq -r '.token'
```

Save the token output for the next step.

### 2. Run Light Load Test

```bash
cd /home/ubuntu/apex-agents

# Set environment variables
export BASE_URL=http://localhost:3000
export TEST_AUTH_TOKEN=your_token_from_step_1
export CONCURRENT_USERS=5
export REQUESTS_PER_USER=20

# Run the test
npx tsx tests/stress-test.ts
```

### 3. View Results

The test will output:
- ✅ Success rates for each component
- ⏱️  Response times (min, max, average)
- 🚀 Requests per second
- ⚠️  Any errors or warnings
- 💡 Optimization recommendations

## 📊 Test Scenarios

### Development Testing (100 requests)
```bash
CONCURRENT_USERS=5 REQUESTS_PER_USER=20 npx tsx tests/stress-test.ts
```

### Staging Testing (1,250 requests)
```bash
CONCURRENT_USERS=25 REQUESTS_PER_USER=50 npx tsx tests/stress-test.ts
```

### Production Testing (10,000 requests)
```bash
CONCURRENT_USERS=100 REQUESTS_PER_USER=100 npx tsx tests/stress-test.ts
```

## 🎯 What Gets Tested

1. **Authentication** - Login and token validation
2. **Dashboard** - Metrics and analytics
3. **Agents** - CRUD operations
4. **Workflows** - Listing and execution
5. **Analytics** - Complex queries
6. **Knowledge** - Document operations
7. **Concurrent Users** - Multiple simultaneous users

## 📈 Success Criteria

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Success Rate | > 99% | 95-99% | < 95% |
| Response Time | < 200ms | 200-500ms | > 500ms |
| Requests/sec | > 100 | 50-100 | < 50 |

## 🔧 Troubleshooting

### "Connection Refused"
- Make sure the app is running: `npm run dev`
- Check the BASE_URL is correct

### "Unauthorized"
- Get a fresh auth token (step 1)
- Make sure the token hasn't expired

### "Too Many Requests"
- Reduce CONCURRENT_USERS
- Reduce REQUESTS_PER_USER
- Add delays between requests

## 📚 Full Documentation

See `tests/STRESS-TEST-README.md` for complete documentation including:
- Advanced configuration
- Performance benchmarks
- Optimization recommendations
- CI/CD integration
- Best practices

## 🆘 Need Help?

1. Check application logs
2. Review Vercel deployment logs
3. Monitor database performance
4. Contact the development team

## Example Output

```
🔥 Starting Stress Test Suite

Configuration:
- Base URL: http://localhost:3000
- Concurrent Users: 5
- Requests per User: 20
- Ramp-up Time: 10s

📝 Test 1: Authentication Endpoints
✅ Authentication Results:
   Total Requests: 20
   Successful: 20 (100.00%)
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
  Total Requests: 420
  Successful: 420 (100.00%)
  Failed: 0 (0.00%)
  Average Response Time: 78.45ms
  Average Requests/sec: 156.32

✅ All tests passed with acceptable performance!
================================================================================
```

## 🎉 Success!

If all tests pass with > 99% success rate and < 200ms average response time, your system is performing well under load!

