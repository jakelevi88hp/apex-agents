# Staging Environment

This document describes the staging environment setup for the Apex Agents platform.

## Overview

The staging environment is a pre-production environment that mirrors the production setup. It allows for testing new features and changes before deploying to production.

## Environment Details

### Git Branch
- **Branch Name:** `staging`
- **Auto-Deploy:** Enabled for commits to staging branch
- **Parent Branch:** `main`

### Database
- **Provider:** Neon Postgres
- **Branch ID:** `br-proud-sunset-afpkqunx`
- **Branch Name:** staging
- **Parent Branch:** Production (`br-red-voice-af3zijvu`)
- **Connection:** HTTP (serverless-friendly)

The staging database is a Neon branch that starts as an exact copy of production but can diverge independently. This allows for safe testing of database migrations and schema changes.

### Deployment

**Platform:** Vercel

**URL:** TBD (will be assigned after first deployment)

**Environment Variables:**
All production environment variables are inherited, with these overrides:
- `DATABASE_URL` - Points to staging database branch
- `NODE_ENV` - Set to `staging`
- `NEXT_PUBLIC_ENV` - Set to `staging`

### Configuration

To configure staging-specific environment variables in Vercel:

1. Go to Project Settings → Environment Variables
2. For each variable, select "Preview" environment
3. Add staging-specific values

## Deployment Process

### Automatic Deployment

Commits pushed to the `staging` branch automatically trigger a Vercel deployment.

```bash
git checkout staging
git add .
git commit -m "Your changes"
git push origin staging
```

### Manual Deployment

You can also trigger a manual deployment from the Vercel dashboard:

1. Go to Deployments
2. Click "Deploy" button
3. Select `staging` branch
4. Click "Deploy"

## Testing Workflow

### 1. Feature Development

Develop features on feature branches:

```bash
git checkout -b feature/my-feature
# Make changes
git commit -m "Add my feature"
git push origin feature/my-feature
```

### 2. Merge to Staging

Create a pull request to merge into `staging`:

```bash
# Via GitHub PR or direct merge
git checkout staging
git merge feature/my-feature
git push origin staging
```

### 3. Test in Staging

- Verify the deployment succeeded
- Test all features thoroughly
- Check database migrations
- Verify integrations
- Run synthetic tests

### 4. Promote to Production

Once staging tests pass, merge to `main`:

```bash
git checkout main
git merge staging
git push origin main
```

## Database Management

### Viewing Staging Data

Connect to the staging database using the connection string:

```bash
psql "postgresql://neondb_owner:npg_fFwRVlh5y0EM@ep-winter-wave-afk2b75j-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

### Running Migrations

Migrations run automatically on deployment via Drizzle:

```bash
# Migrations are applied during build
npm run db:push
```

### Resetting Staging Database

To reset staging to match production:

```bash
# Using Neon CLI or MCP
manus-mcp-cli tool call reset_from_parent --server neon --input '{
  "params": {
    "projectId": "blue-hat-88201078",
    "branchId": "br-proud-sunset-afpkqunx"
  }
}'
```

## Monitoring

### Observability Stack

The staging environment uses the same observability stack as production:

- **Sentry:** Separate project for staging errors
- **Checkly:** Synthetic monitoring (if configured)
- **Grafana:** Staging-specific dashboards
- **UptimeRobot:** Uptime monitoring

### Logs

View logs in Vercel dashboard:
- Runtime Logs: Real-time application logs
- Build Logs: Deployment and build logs

## Environment Variables

### Required Variables

These must be configured in Vercel for the Preview environment:

```bash
# Database
DATABASE_URL=<staging_database_url>

# Authentication
JWT_SECRET=<same_as_production_or_different>
OAUTH_SERVER_URL=<oauth_url>
OWNER_EMAIL=<admin_email>

# Application
NEXT_PUBLIC_APP_URL=<staging_url>
NEXT_PUBLIC_ENV=staging

# Sentry (optional - use separate project)
NEXT_PUBLIC_SENTRY_DSN=<staging_sentry_dsn>
SENTRY_PROJECT=apex-agents-staging

# OAuth Providers (use test apps if available)
# ... other OAuth secrets
```

### Getting Variables

1. **From Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Filter by "Preview" environment

2. **From Neon:**
   ```bash
   manus-mcp-cli tool call get_connection_string --server neon --input '{
     "params": {
       "projectId": "blue-hat-88201078",
       "branchId": "br-proud-sunset-afpkqunx"
     }
   }'
   ```

## Best Practices

### 1. Keep Staging Up-to-Date

Regularly sync staging with main:

```bash
git checkout staging
git merge main
git push origin staging
```

### 2. Test Before Production

Always test in staging before merging to main:
- New features
- Database migrations
- Configuration changes
- Dependency updates
- Security patches

### 3. Use Staging Data Carefully

- Don't use real user data in staging
- Generate test data for testing
- Regularly reset staging database if needed

### 4. Monitor Staging

- Check Sentry for errors
- Review logs regularly
- Monitor performance metrics
- Test critical user flows

### 5. Document Changes

- Update CHANGELOG.md
- Document breaking changes
- Update API documentation
- Note configuration changes

## Troubleshooting

### Deployment Failed

1. Check build logs in Vercel
2. Verify environment variables are set
3. Check for TypeScript/ESLint errors
4. Review recent commits

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check Neon branch is active
3. Test connection locally
4. Review database logs

### Application Errors

1. Check Sentry for error details
2. Review runtime logs in Vercel
3. Test locally with staging database
4. Check for missing environment variables

## Rollback

### Rollback Deployment

In Vercel dashboard:
1. Go to Deployments
2. Find the last working deployment
3. Click "Promote to Production" (for staging branch)

### Rollback Database

Reset staging branch to a previous state:

```bash
# This will reset staging to match production
manus-mcp-cli tool call reset_from_parent --server neon --input '{
  "params": {
    "projectId": "blue-hat-88201078",
    "branchId": "br-proud-sunset-afpkqunx",
    "preserveUnderName": "staging-backup-2025-10-28"
  }
}'
```

## Cleanup

### Delete Staging Environment

If you need to remove the staging environment:

1. **Delete Vercel Preview Deployments:**
   - Vercel dashboard → Deployments
   - Delete staging deployments

2. **Delete Neon Branch:**
   ```bash
   manus-mcp-cli tool call delete_branch --server neon --input '{
     "params": {
       "projectId": "blue-hat-88201078",
       "branchId": "br-proud-sunset-afpkqunx"
     }
   }'
   ```

3. **Delete Git Branch:**
   ```bash
   git branch -d staging
   git push origin --delete staging
   ```

## Support

For issues with:
- **Vercel:** Check Vercel documentation or support
- **Neon:** Check Neon documentation or support
- **Application:** Check application logs and Sentry

## Maintenance

### Regular Tasks

- **Weekly:** Review staging errors and logs
- **Monthly:** Reset staging database to production state
- **Quarterly:** Review and update staging configuration

### Updates

When updating dependencies or framework versions:
1. Test in staging first
2. Monitor for issues
3. Verify all features work
4. Then update production

## Additional Resources

- [Vercel Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)
- [Neon Branching](https://neon.tech/docs/guides/branching)
- [Next.js Environments](https://nextjs.org/docs/basic-features/environment-variables)

