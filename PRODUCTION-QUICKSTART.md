# Quick Start Guide - Production Testing

## Immediate Actions Required

### 1. Set Environment Variables in Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Critical Variables:**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://apex-agents.vercel.app
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NODE_ENV=production
```

### 2. Test Production Deployment

```bash
# Install dependencies
npm install

# Run security audit
npm run security:audit

# Test production endpoints
export PRODUCTION_URL="https://apex-agents.vercel.app"
export TEST_TOKEN="your_jwt_token"
npm run test:production
```

### 3. Verify Critical Systems

**AGI System:**
```bash
curl https://apex-agents.vercel.app/api/agi/status
# Expected: {"available": true}
```

**With Authentication:**
```bash
curl -X POST https://apex-agents.vercel.app/api/agi/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "Hello, test the AGI system"}'
```

**AI Admin:**
1. Login as admin user
2. Navigate to `/admin/ai`
3. Type: "Show me the project structure"
4. Verify response

**Sentry:**
```javascript
// In browser console
throw new Error("Sentry production test");
// Check Sentry dashboard for error
```

### 4. Monitor First 24 Hours

- Check Sentry for errors: https://sentry.io
- Monitor Vercel logs
- Verify rate limiting working
- Test all core features

## Documentation Files Created

1. **Production Deployment Guide** - `/docs/PRODUCTION-DEPLOYMENT-GUIDE.md`
   - Complete deployment walkthrough
   - Testing procedures
   - Security best practices

2. **Environment Variables** - `/docs/ENVIRONMENT-VARIABLES.md`
   - Full list of required vars
   - How to set in Vercel
   - Security recommendations

3. **Production Readiness Report** - `/docs/PRODUCTION-READINESS-REPORT.md`
   - System status overview
   - Testing results
   - Go-live checklist

4. **Test Scripts:**
   - `/scripts/production-test-suite.ts` - Automated production tests
   - `/scripts/security-audit.ts` - Security vulnerability scanner

5. **NPM Scripts:**
   - `npm run test:production` - Run production test suite
   - `npm run security:audit` - Run security audit

## Status Summary

✅ **AGI System:** Fully operational (5 core features)
✅ **AI Admin:** Plain-language requests working
✅ **Rate Limiting:** Implemented and tested
✅ **Security:** Multiple layers hardened
✅ **Sentry:** Configured for error tracking
✅ **Documentation:** Complete

**Production Status: 🟢 READY TO DEPLOY**

## Next Steps

1. Configure environment variables in Vercel
2. Deploy to production
3. Run test suite
4. Monitor for 24-48 hours
5. Announce to users

## Support

All documentation is in `/workspace/docs/`:
- PRODUCTION-DEPLOYMENT-GUIDE.md
- PRODUCTION-READINESS-REPORT.md
- ENVIRONMENT-VARIABLES.md
- agi-complete-system.md
- AI_ADMIN_AGENT_README.md
