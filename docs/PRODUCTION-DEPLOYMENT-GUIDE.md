# Production Deployment Guide - Apex Agents

Complete guide for deploying and testing Apex Agents in production.

## 🚀 Quick Start

### Production URL
**https://apex-agents.vercel.app/**

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (Vercel Dashboard)

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://apex-agents.vercel.app

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Stripe (if enabled)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=apex-agents-production
SENTRY_AUTH_TOKEN=your_auth_token

# App Configuration
NEXT_PUBLIC_APP_URL=https://apex-agents.vercel.app
NODE_ENV=production
OWNER_OPEN_ID=your_admin_user_id
```

### 2. Security Configuration

✅ **HTTPS Enforcement** - Automatic via Vercel
✅ **Rate Limiting** - Implemented in `/src/lib/rate-limit.ts`
✅ **Authentication** - JWT token verification on protected routes
✅ **Input Validation** - Zod schemas for API validation
✅ **CORS** - Configured for production origin

### 3. Database Setup

```bash
# Run migrations
npm run db:push

# Verify database connection
npm run health:check
```

---

## 🧪 Testing Production Deployment

### Run Automated Test Suite

```bash
# Set environment variables
export PRODUCTION_URL="https://apex-agents.vercel.app"
export TEST_TOKEN="your_jwt_token"

# Run comprehensive tests
npm run test:production
```

This will test:
- ✅ AGI System (5 core features)
- ✅ AI Admin (plain-language requests)
- ✅ Rate Limiting
- ✅ Authentication
- ✅ Performance
- ✅ Sentry Integration

### Manual Testing Checklist

#### 1. Test AGI System

**Memory Persistence:**
```bash
curl -X POST https://apex-agents.vercel.app/api/agi/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "Remember: My favorite color is blue"}'
```

**Reasoning Engine:**
```bash
curl -X POST https://apex-agents.vercel.app/api/agi/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "How can I optimize database queries?"}'
```

**Emotional Intelligence:**
```bash
curl -X POST https://apex-agents.vercel.app/api/agi/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "I'\''m so excited about this project!"}'
```

**Creativity Engine:**
```bash
curl -X POST https://apex-agents.vercel.app/api/agi/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "Give me creative ideas for a social platform"}'
```

**Conversation History:**
```bash
curl -X POST https://apex-agents.vercel.app/api/agi/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "What was my favorite color?"}'
```

#### 2. Test AI Admin

1. Navigate to `/admin/ai`
2. Type: "Show me the project structure"
3. Verify response includes file tree
4. Type: "Generate a patch to add a console.log"
5. Verify patch generation

#### 3. Test Rate Limiting

```bash
# Make 25 rapid requests (limit is 20/min)
for i in {1..25}; do
  curl -X POST https://apex-agents.vercel.app/api/agi/process \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"input": "test"}' &
done
wait

# Should see 429 rate limit responses
```

#### 4. Test Authentication

```bash
# Without token (should fail with 401)
curl -X POST https://apex-agents.vercel.app/api/agi/process \
  -H "Content-Type: application/json" \
  -d '{"input": "test"}'
```

#### 5. Test Sentry

Open browser console on production site:
```javascript
// Trigger test error
throw new Error("Sentry test error");
```

Check Sentry dashboard for the error.

---

## 🔒 Security Hardening

### Run Security Audit

```bash
npm run security:audit
```

This checks:
- Environment variables
- Sensitive file exposure
- API endpoint security
- Input validation
- Dependencies
- Security headers

### Security Best Practices

1. **Environment Variables**
   - ✅ Never commit .env files
   - ✅ Use Vercel environment variables
   - ✅ Rotate secrets regularly

2. **API Security**
   - ✅ Authentication on all protected routes
   - ✅ Rate limiting enabled
   - ✅ Input validation with Zod
   - ✅ CORS configured

3. **Database Security**
   - ✅ SSL connection required
   - ✅ Prepared statements (Drizzle ORM)
   - ✅ Connection pooling

4. **Client Security**
   - ✅ HTTPS enforced
   - ✅ XSS protection
   - ✅ CSRF tokens (for forms)

### Configure Security Headers

Add to `next.config.mjs`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
},
```

---

## 📊 Monitoring & Observability

### Sentry Error Tracking

1. **Access Dashboard:** https://sentry.io
2. **View Errors:** Filter by environment=production
3. **Set Up Alerts:** Configure Slack/email notifications

### Key Metrics to Monitor

- **Error Rate:** < 1%
- **Response Time (p95):** < 2s
- **Uptime:** > 99.9%
- **Rate Limit Hits:** Track abuse patterns

### Vercel Analytics

1. Go to Vercel Dashboard → Analytics
2. Monitor:
   - Request count
   - Error rate
   - Response times
   - Bandwidth usage

---

## 🚨 Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error

**Check:**
- Vercel logs: `vercel logs`
- Sentry errors
- Database connection
- Environment variables

#### 2. 429 Rate Limit Exceeded

**Solution:**
- Wait for rate limit window to reset
- Upgrade subscription tier
- Request rate limit increase

#### 3. 401 Unauthorized

**Check:**
- JWT token is valid
- Token not expired
- Authorization header format: `Bearer TOKEN`

#### 4. Sentry Not Capturing Errors

**Verify:**
- `NEXT_PUBLIC_SENTRY_DSN` is set
- Sentry initialized in config files
- Error thrown in client/server code

#### 5. AGI Not Responding

**Check:**
- OpenAI API key valid
- OpenAI account has credits
- Database connection working
- Check API logs for errors

---

## 📝 Post-Deployment Tasks

### Week 1

- [ ] Monitor error rates in Sentry
- [ ] Check performance metrics
- [ ] Review rate limiting effectiveness
- [ ] Verify all integrations working
- [ ] Collect user feedback

### Month 1

- [ ] Review and optimize slow queries
- [ ] Analyze usage patterns
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization

### Ongoing

- [ ] Weekly security reviews
- [ ] Monthly dependency updates
- [ ] Quarterly penetration testing
- [ ] Regular backups verification

---

## 🎯 Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_user_id ON agi_episodic_memory(user_id);
CREATE INDEX idx_conversation_id ON agi_messages(conversation_id);
CREATE INDEX idx_timestamp ON agi_episodic_memory(timestamp);
```

### Caching Strategy

Consider implementing:
- Redis for session storage
- CDN for static assets
- Database query caching
- API response caching

### Code Splitting

Already implemented via Next.js:
- Dynamic imports for heavy components
- Route-based code splitting
- Image optimization

---

## 📚 Additional Resources

- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/javascript/nextjs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🆘 Support

For production issues:
1. Check Sentry for errors
2. Review Vercel logs
3. Run security audit
4. Contact support: support@apexagents.com

---

## ✅ Production Readiness Status

- ✅ **AGI System:** Fully functional with 5 core features
- ✅ **AI Admin:** Plain-language patch system working
- ✅ **Rate Limiting:** Implemented and tested
- ✅ **Authentication:** JWT-based auth on all protected routes
- ✅ **Error Monitoring:** Sentry configured
- ✅ **Database:** Migrations complete, optimized
- ✅ **Security:** Multiple layers implemented
- ✅ **Performance:** Optimized for production load

**Status: 🟢 READY FOR PRODUCTION**

---

Last Updated: 2025-11-09
Version: 1.0.0
