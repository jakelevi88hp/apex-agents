# Production vs Preview vs Development Environments

Complete guide to understanding the three environments in your Apex Agents platform.

## Overview

Your application runs in three distinct environments, each with different purposes, configurations, and behaviors.

| Environment | Purpose | When Used | URL Pattern |
|------------|---------|-----------|-------------|
| **Development** | Local coding & testing | Running `npm run dev` locally | `http://localhost:3000` |
| **Preview** | Test changes before production | Every git push to non-main branches | `apex-agents-git-[branch]-[user].vercel.app` |
| **Production** | Live application for users | Push to `main` branch | `apex-agents.vercel.app` or custom domain |

---

## 🖥️ Development Environment

### What It Is
Your **local machine** running the Next.js development server.

### When You Use It
```bash
npm run dev
# or
pnpm dev
```

### Characteristics

#### ✅ Advantages
- **Fast Refresh** - Instant updates when you save files
- **Detailed Errors** - Full error messages and stack traces
- **Debug Tools** - React DevTools, console logs, breakpoints
- **No Build Time** - Changes appear immediately
- **Local Database** - Can use local Postgres or connect to remote
- **Full File Access** - Can read/write files freely

#### ⚠️ Limitations
- **Not Optimized** - Slower performance than production
- **Development Mode** - React runs in development mode (larger bundle)
- **Only You Can Access** - Not publicly accessible
- **Different Behavior** - Some things work differently than production

### Environment Variables
```bash
# .env.local (local development only)
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/apex-agents-dev

# Development-specific settings
AI_ADMIN_MODEL=gpt-3.5-turbo  # Cheaper model for testing
```

### Use Cases
- ✅ Writing new features
- ✅ Fixing bugs
- ✅ Testing changes quickly
- ✅ Debugging issues
- ✅ Experimenting with code
- ❌ Showing to clients (use Preview instead)
- ❌ Performance testing (use Production)

---

## 🔍 Preview Environment

### What It Is
A **temporary deployment on Vercel** for every git branch you push (except `main`).

### When It's Created
```bash
# Create a new branch
git checkout -b feature/new-dashboard

# Make changes and push
git add .
git commit -m "Add new dashboard"
git push origin feature/new-dashboard

# Vercel automatically creates a preview deployment
```

### Characteristics

#### ✅ Advantages
- **Production-Like** - Built and optimized like production
- **Publicly Accessible** - Share URL with team/clients
- **Automatic** - Created on every push
- **Isolated** - Doesn't affect production
- **Full Features** - All production features available
- **Multiple Previews** - One per branch

#### ⚠️ Limitations
- **Temporary** - Deleted after branch is merged/deleted
- **Slower Updates** - Need to push to update (no hot reload)
- **Build Time** - 1-2 minutes per deployment
- **Same Database** - Usually shares production database (be careful!)

### URL Pattern
```
https://apex-agents-git-[branch-name]-[username].vercel.app

Examples:
https://apex-agents-git-feature-dashboard-jakelevi88hp.vercel.app
https://apex-agents-git-fix-bug-123-jakelevi88hp.vercel.app
```

### Environment Variables
Preview deployments use the same environment variables as production (from Vercel dashboard).

You can override specific variables for preview:
1. Go to Vercel → Project Settings → Environment Variables
2. Set scope to "Preview" only
3. Add preview-specific values

### Use Cases
- ✅ Testing features before merging to main
- ✅ Sharing work-in-progress with team
- ✅ Client demos and feedback
- ✅ QA testing
- ✅ Integration testing
- ✅ Verifying builds work
- ❌ Long-term hosting (use Production)
- ❌ Performance benchmarks (may be slower)

### Preview Workflow
```
1. Create branch → 2. Push changes → 3. Vercel builds preview
                                              ↓
4. Test preview URL ← 5. Get feedback ← 6. Share with team
                                              ↓
7. Make more changes → 8. Push again → 9. Preview updates
                                              ↓
10. Merge to main → 11. Preview deleted → 12. Production updated
```

---

## 🚀 Production Environment

### What It Is
The **live application** that your users access, deployed from the `main` branch.

### When It's Updated
```bash
# Merge to main or push directly
git checkout main
git merge feature/new-dashboard
git push origin main

# Vercel automatically deploys to production
```

### Characteristics

#### ✅ Advantages
- **Fully Optimized** - Minified, compressed, cached
- **Best Performance** - Fastest load times
- **Stable** - Only updated when you push to main
- **Custom Domain** - Can use your own domain
- **Production Database** - Real user data
- **Analytics** - Full monitoring and metrics
- **CDN** - Global edge network for speed

#### ⚠️ Limitations
- **No Debugging** - Limited error information
- **Real Users** - Bugs affect actual users
- **Slower Updates** - Need to build and deploy
- **No Rollback** - Need to deploy previous version manually

### URL
```
Primary: https://apex-agents.vercel.app
Custom: https://yourdomain.com (if configured)
```

### Environment Variables
```bash
# Set in Vercel Dashboard → Environment Variables → Production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://apex-agents.vercel.app
DATABASE_URL=postgresql://production-db-url

# Production-specific settings
AI_ADMIN_MODEL=gpt-4o  # Best model for production
SENTRY_DSN=your-sentry-dsn  # Error tracking
```

### Use Cases
- ✅ Serving real users
- ✅ Live application
- ✅ Production data
- ✅ Performance monitoring
- ✅ Analytics and metrics
- ❌ Testing new features (use Preview)
- ❌ Debugging (use Development)
- ❌ Experiments (use Preview)

---

## 🔄 Deployment Flow

### Complete Workflow

```
┌─────────────────┐
│  Development    │  ← Write code locally
│  (localhost)    │
└────────┬────────┘
         │ git push origin feature-branch
         ↓
┌─────────────────┐
│  Preview        │  ← Test on Vercel
│  (temp URL)     │
└────────┬────────┘
         │ git merge to main
         ↓
┌─────────────────┐
│  Production     │  ← Live for users
│  (main URL)     │
└─────────────────┘
```

### Typical Development Cycle

1. **Local Development**
   ```bash
   git checkout -b feature/new-feature
   npm run dev
   # Make changes, test locally
   ```

2. **Create Preview**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   # Vercel creates preview deployment
   ```

3. **Test Preview**
   - Visit preview URL
   - Test all functionality
   - Share with team for feedback
   - Make adjustments if needed

4. **Deploy to Production**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   # Vercel deploys to production
   ```

---

## 🔧 Environment Detection

### In Your Code

```typescript
// Check current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';

// Vercel-specific detection
const isVercel = process.env.VERCEL === '1';
const vercelEnv = process.env.VERCEL_ENV; // 'production', 'preview', or 'development'

// Example usage
if (isDevelopment) {
  console.log('Running locally');
}

if (isPreview) {
  console.log('Running on preview deployment');
}

if (isProduction) {
  console.log('Running on production');
}
```

### Environment-Specific Configuration

```typescript
// lib/config.ts
export const config = {
  apiUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_API_URL,
    
  aiModel: process.env.NODE_ENV === 'development'
    ? 'gpt-3.5-turbo'  // Cheaper for testing
    : 'gpt-4o',        // Best for production
    
  logLevel: process.env.NODE_ENV === 'development'
    ? 'debug'
    : 'error',
    
  enableAnalytics: process.env.NODE_ENV === 'production',
};
```

---

## 📊 Comparison Table

| Feature | Development | Preview | Production |
|---------|------------|---------|------------|
| **Speed** | Instant updates | 1-2 min build | 1-2 min build |
| **Performance** | Slow (unoptimized) | Fast (optimized) | Fastest (optimized + CDN) |
| **Debugging** | Full debug info | Limited | Minimal |
| **Access** | Local only | Public URL | Public URL |
| **Database** | Local or remote | Usually production | Production |
| **Cost** | Free (local) | Free (Vercel) | Free (Vercel hobby) |
| **Stability** | Unstable (dev mode) | Stable | Very stable |
| **URL** | localhost:3000 | temp-url.vercel.app | yourdomain.com |
| **Lifespan** | While running | Until branch deleted | Permanent |
| **Updates** | Automatic (hot reload) | Manual (git push) | Manual (git push) |

---

## 🎯 Best Practices

### Development
```bash
# Use cheaper AI models
AI_ADMIN_MODEL=gpt-3.5-turbo

# Enable detailed logging
LOG_LEVEL=debug

# Use local database if possible
DATABASE_URL=postgresql://localhost:5432/apex-agents-dev
```

### Preview
```bash
# Use production-like settings
AI_ADMIN_MODEL=gpt-4o

# But maybe limit features
ENABLE_ANALYTICS=false
ENABLE_BILLING=false

# Use production database (carefully!)
DATABASE_URL=postgresql://production-db-url
```

### Production
```bash
# Best models and settings
AI_ADMIN_MODEL=gpt-4o

# Enable all features
ENABLE_ANALYTICS=true
ENABLE_BILLING=true
ENABLE_MONITORING=true

# Production database
DATABASE_URL=postgresql://production-db-url
```

---

## 🚨 Common Pitfalls

### 1. **Testing in Development Only**
❌ **Problem:** Feature works locally but breaks in production  
✅ **Solution:** Always test in Preview before merging to main

### 2. **Using Production Database in Development**
❌ **Problem:** Accidentally modifying real user data  
✅ **Solution:** Use separate development database

### 3. **Not Testing Preview Deployments**
❌ **Problem:** Bugs make it to production  
✅ **Solution:** Always review preview URL before merging

### 4. **Forgetting Environment Variables**
❌ **Problem:** Missing API keys in production  
✅ **Solution:** Check Vercel environment variables before deploying

### 5. **Assuming Same Behavior**
❌ **Problem:** Code works differently in production  
✅ **Solution:** Test in Preview (production-like environment)

---

## 🔐 Security Considerations

### Development
- ⚠️ Secrets in `.env.local` (not committed to git)
- ⚠️ Debug endpoints enabled
- ⚠️ Detailed error messages

### Preview
- ✅ Secrets from Vercel environment variables
- ⚠️ Publicly accessible (anyone with URL)
- ✅ Production-like security

### Production
- ✅ Secrets from Vercel environment variables
- ✅ All security features enabled
- ✅ Minimal error information
- ✅ Rate limiting and protection

---

## 📈 Monitoring

### Development
- Console logs
- React DevTools
- Network tab

### Preview
- Vercel deployment logs
- Basic metrics
- Build logs

### Production
- Vercel Analytics
- Sentry error tracking
- Custom monitoring
- Performance metrics
- User analytics

---

## 🎓 Summary

### When to Use Each Environment

**Development (Local)**
- Daily coding
- Quick testing
- Debugging
- Experimenting

**Preview (Vercel)**
- Feature testing
- Team reviews
- Client demos
- Pre-production checks

**Production (Live)**
- Real users
- Stable features
- Monitored performance
- Production data

### Key Takeaway

```
Development → Preview → Production
   (Test)   →  (Verify) →  (Deploy)
```

Always follow this flow to ensure quality and stability! 🚀

---

**Last Updated:** October 29, 2025  
**Your Setup:**
- Development: `http://localhost:3000`
- Preview: `https://apex-agents-git-*.vercel.app`
- Production: `https://apex-agents.vercel.app`

