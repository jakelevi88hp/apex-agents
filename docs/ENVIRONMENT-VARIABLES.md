# Environment Variables Checklist - Apex Agents Production

## Required for Vercel Deployment

Copy these to your Vercel project settings → Environment Variables

### 🗄️ Database

```bash
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

### 🔐 Authentication

```bash
# JWT secret for token signing (generate with: openssl rand -base64 32)
JWT_SECRET="your_super_secret_jwt_key_here"

# NextAuth configuration (if using NextAuth)
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="https://apex-agents.vercel.app"

# Admin user ID for AI Admin access
OWNER_OPEN_ID="your_admin_user_id"
```

### 🤖 AI Services

```bash
# OpenAI API key (required for AGI and AI Admin)
OPENAI_API_KEY="sk-..."

# Anthropic API key (optional, for Claude models)
ANTHROPIC_API_KEY="sk-ant-..."

# Pinecone (optional, for vector search)
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="..."
PINECONE_INDEX="apex-agents"
```

### 💳 Stripe (Optional - for subscriptions)

```bash
# Stripe secret key (live mode)
STRIPE_SECRET_KEY="sk_live_..."

# Stripe publishable key (live mode)
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Stripe webhook secret
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 📧 Email (Optional - Resend)

```bash
# Resend API key
RESEND_API_KEY="re_..."

# From email address
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### 📊 Monitoring - Sentry

```bash
# Sentry DSN (public, safe to expose)
NEXT_PUBLIC_SENTRY_DSN="https://...@o....ingest.sentry.io/..."

# Sentry organization slug
SENTRY_ORG="your-org-slug"

# Sentry project name
SENTRY_PROJECT="apex-agents-production"

# Sentry auth token (for uploading source maps)
SENTRY_AUTH_TOKEN="sntrys_..."
```

### 🌐 App Configuration

```bash
# Production URL
NEXT_PUBLIC_APP_URL="https://apex-agents.vercel.app"

# Node environment
NODE_ENV="production"
```

### 🐙 GitHub (Optional - for AI Admin GitHub integration)

```bash
# GitHub personal access token
GITHUB_TOKEN="ghp_..."
GITHUB_OWNER="your-username"
GITHUB_REPO="apex-agents"
```

---

## 🔧 How to Set in Vercel

### Option 1: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Variable value
   - **Environment:** Select "Production" (and optionally Preview/Development)
5. Click **Save**

### Option 2: Vercel CLI

```bash
# Add environment variable
vercel env add VARIABLE_NAME production

# List all variables
vercel env ls

# Pull variables to local .env
vercel env pull .env.local
```

---

## ✅ Verification Checklist

After setting environment variables:

### 1. Database Connection

```bash
# Test database connection
npm run health:check
```

Expected output: ✅ Database connected

### 2. OpenAI API

```bash
# Test OpenAI connection
curl https://apex-agents.vercel.app/api/agi/status
```

Expected: `{"available": true, "mode": "full_agi"}`

### 3. Sentry Configuration

1. Trigger a test error in production
2. Check Sentry dashboard: https://sentry.io
3. Verify error appears

### 4. Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Verify webhook endpoint: `https://apex-agents.vercel.app/api/webhooks/stripe`
3. Send test event
4. Check for 200 OK response

---

## 🔒 Security Best Practices

### DO ✅

- ✅ Use strong, random secrets (min 32 characters)
- ✅ Use live keys for production (not test keys)
- ✅ Set variables only in Vercel dashboard
- ✅ Rotate secrets regularly (quarterly)
- ✅ Use different secrets for dev/prod

### DON'T ❌

- ❌ Commit .env files to git
- ❌ Share secrets in Slack/email
- ❌ Use test keys in production
- ❌ Reuse secrets across projects
- ❌ Store secrets in code

---

## 🔑 Generating Secure Secrets

### JWT_SECRET

```bash
openssl rand -base64 32
```

### NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Custom Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📝 Environment Variable Template

Create this file locally as `.env.example` (safe to commit):

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="your_secret_here"
NEXTAUTH_SECRET="your_secret_here"
NEXTAUTH_URL="https://apex-agents.vercel.app"
OWNER_OPEN_ID="your_admin_id"

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="apex-agents-production"
SENTRY_AUTH_TOKEN="sntrys_..."

# App
NEXT_PUBLIC_APP_URL="https://apex-agents.vercel.app"
NODE_ENV="production"
```

---

## 🆘 Troubleshooting

### "Environment variable not defined"

**Solution:** Add the variable in Vercel dashboard and redeploy

### "Database connection failed"

**Check:**
- `DATABASE_URL` is set correctly
- Neon database is active
- Connection string includes `?sslmode=require`

### "OpenAI API error"

**Check:**
- `OPENAI_API_KEY` is valid
- API key has not expired
- OpenAI account has credits

### "Sentry not capturing errors"

**Check:**
- `NEXT_PUBLIC_SENTRY_DSN` is set
- DSN is correct (check Sentry dashboard)
- Sentry project exists

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Neon Connection Strings](https://neon.tech/docs/connect/connection-string)
- [Sentry Configuration](https://docs.sentry.io/platforms/javascript/nextjs/)

---

Last Updated: 2025-11-09
