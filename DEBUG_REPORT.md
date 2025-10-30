# 🔍 System Debug Report
**Generated:** $(date)  
**Project:** Apex Agents

## 📊 System Health Summary

### ✅ Healthy Components (2/5)
1. **Environment Variables** - All required variables are present
2. **Memory Usage** - 67.27% heap usage (healthy)

### ⚠️ Degraded Components (2/5)
3. **API Health Check** - Responding but returning HTTP 500
4. **Auth API** - Responding but returning HTTP 401 (expected without authentication)

### ❌ Unhealthy Components (1/5)
5. **Database Connection** - FAILED (HTTP 500, 2000ms response time)

---

## 🔧 Issues Found

### 1. Database Connection Failure (CRITICAL)

**Problem:** The database connection is failing because the DATABASE_URL is using placeholder credentials.

**Current Configuration:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/apex_agents?sslmode=require"
```

**Root Cause:** This is a template URL with fake credentials (`user:password`) that don't connect to an actual database.

**Solutions:**

#### Option A: Use Neon Database (Recommended for Production)
1. Create a free account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `.env` file:
```env
DATABASE_URL="postgresql://username:password@your-project.neon.tech/main?sslmode=require"
```

#### Option B: Use Local PostgreSQL (For Development)
1. Install PostgreSQL locally
2. Create a database: `createdb apex_agents`
3. Update `.env` with your local credentials:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/apex_agents"
```

#### Option C: Use Docker PostgreSQL (Quick Start)
```bash
# Start PostgreSQL in Docker
docker run --name apex-postgres -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=apex_agents -p 5432:5432 -d postgres:15

# Update .env
DATABASE_URL="postgresql://postgres:devpassword@localhost:5432/apex_agents"
```

### 2. API Endpoints Returning Errors

**Problem:** API endpoints are returning 500 errors because they depend on the database connection.

**Status:** This will be automatically fixed once the database connection is established.

---

## 📋 Next Steps

### Immediate Actions Required

1. **Set up a database** (choose one option above)
2. **Update DATABASE_URL** in your `.env` file with real credentials
3. **Run database migrations:**
```bash
npm run db:push
```
4. **Seed the database** with test data:
```bash
npm run db:seed
```
5. **Restart the development server:**
```bash
npm run dev
```
6. **Re-run health check:**
```bash
npm run health:check
```

### Verification Steps

After setting up the database, verify each component:

```bash
# 1. Check database connection
npm run db:studio

# 2. Verify API health
# Visit: http://localhost:3000/api/health

# 3. Run full health check
npm run health:check

# 4. Test authentication
# Visit: http://localhost:3000/login
```

---

## 🔐 Environment Variables Status

| Variable | Status | Purpose |
|----------|--------|---------|
| DATABASE_URL | ⚠️ NEEDS UPDATE | PostgreSQL connection string |
| DATABASE_URL_UNPOOLED | ⚠️ NEEDS UPDATE | Direct database connection |
| JWT_SECRET | ✅ SET | JWT token signing |
| OPENAI_API_KEY | ⚠️ NEEDS REAL KEY | AI functionality |
| ANTHROPIC_API_KEY | ⚠️ PLACEHOLDER | Optional AI provider |
| PINECONE_API_KEY | ⚠️ PLACEHOLDER | Vector search (optional) |
| GITHUB_TOKEN | ⚠️ NOT SET | AI admin agent (optional) |
| SENTRY_DSN | ⚠️ NOT SET | Error tracking (optional) |

---

## 📚 Useful Commands

### Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
```

### Database Management
```bash
npm run db:generate     # Generate migrations
npm run db:push         # Push schema to database
npm run db:studio       # Open database browser
npm run db:seed         # Seed test data
npm run db:reset        # Reset and seed database
```

### Testing & Debugging
```bash
npm run health:check    # Run system health check
npm run test            # Run Playwright tests
npm run test:ui         # Run tests with UI
npm run stress:test     # Run stress tests
```

### Code Quality
```bash
npm run lint            # Run linter
```

---

## 🎯 Test User Credentials (After Seeding)

Once you run `npm run db:seed`, you can log in with these test accounts:

| Email | Password | Role | Tier |
|-------|----------|------|------|
| admin@apexagents.test | Admin123! | admin | enterprise |
| test@apexagents.test | Test123! | user | pro |
| demo@apexagents.test | Demo123! | user | trial |

---

## 🆘 Common Errors & Fixes

### Error: "DATABASE_URL environment variable is not set"
**Fix:** Create `.env` file with DATABASE_URL (see above)

### Error: "relation does not exist"
**Fix:** Run migrations: `npm run db:push`

### Error: "OPENAI_API_KEY is not valid"
**Fix:** Get a real API key from https://platform.openai.com/api-keys

### Error: "Port 3000 is already in use"
**Fix:** Kill existing process: `npx kill-port 3000` or use a different port

### Error: "Module not found"
**Fix:** Reinstall dependencies: `npm install`

---

## 📊 Current System Metrics

### Memory Usage
- **Heap Used:** 8.44 MB / 12.55 MB
- **Heap Usage:** 67.27% (healthy)
- **RSS:** 102.28 MB
- **External:** 2.52 MB

### API Response Times
- **Health Check:** 223ms (degraded - due to DB error)
- **Database Check:** 2000ms (unhealthy - connection timeout)
- **Auth API:** 1926ms (degraded - due to DB error)

---

## ✨ Recommendations

### For Development
1. Use Docker PostgreSQL for quick local setup
2. Enable Drizzle Studio for database visualization: `npm run db:studio`
3. Use the test user accounts after seeding
4. Monitor logs during development

### For Production
1. Use Neon database with automatic backups
2. Set up Sentry for error tracking
3. Configure proper JWT_SECRET (not the dev placeholder)
4. Enable monitoring and alerting
5. Set up database branching for staging environment

---

## 🔗 Additional Resources

- [DATABASE.md](./DATABASE.md) - Complete database guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [TESTING.md](./TESTING.md) - Testing guide
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

---

## 📝 Notes

- The development server is currently running on http://localhost:3000
- Environment variables are now being loaded correctly from `.env` file
- All TypeScript dependencies are installed
- The health check tool has been updated to load environment variables

**Next Action:** Set up a database connection to make the system fully functional.

