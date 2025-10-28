# Database Management Guide

This document describes how to manage the Apex Agents database, including schema migrations, seeding, and maintenance.

## Overview

**Database:** PostgreSQL (Neon Serverless)  
**ORM:** Drizzle ORM  
**Schema:** `src/lib/db/schema.ts`  
**Connection:** HTTP (neon-http)

## Environment Setup

### Required Environment Variables

```env
# Production Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@host/database?sslmode=require

# Staging Database (Neon branch)
DATABASE_URL=postgresql://user:password@staging-host/database?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@staging-host/database?sslmode=require
```

## Database Commands

### Schema Management

```bash
# Generate migration files from schema changes
npm run db:generate

# Push schema changes to database (no migration files)
npm run db:push

# Open Drizzle Studio (visual database browser)
npm run db:studio
```

### Data Seeding

```bash
# Seed database with test data
npm run db:seed

# Reset database (push schema + seed data)
npm run db:reset
```

## Database Schema

### Core Tables

#### Users & Authentication
- `users` - User accounts with authentication
- `organizations` - Organization/team management

#### Agents & Workflows
- `agents` - AI agent configurations
- `agent_tools` - Tools available to agents
- `workflows` - Automated workflow definitions
- `executions` - Workflow/agent execution history
- `execution_steps` - Individual step results

#### Knowledge & Data
- `knowledge_base` - Stored knowledge and documents
- `data_connectors` - External data source integrations

#### Verification & Trust
- `verifications` - Fact-checking and verification results
- `provenance_trail` - Source provenance tracking

#### Collaboration
- `swarms` - Agent swarm configurations
- `swarm_messages` - Inter-agent communication

#### Analytics
- `analytics_events` - User and system events
- `usage_metrics` - Resource usage tracking

## Seeding Data

The seed script (`scripts/seed.ts`) creates realistic test data:

### Test Users

| Email | Password | Role | Tier |
|-------|----------|------|------|
| admin@apexagents.test | Admin123! | admin | enterprise |
| test@apexagents.test | Test123! | user | pro |
| demo@apexagents.test | Demo123! | user | trial |

### Sample Data Included

- ✅ 2 Organizations
- ✅ 3 Users (admin, test, demo)
- ✅ 3 Agent Templates (Research, Analysis, Writing)
- ✅ 1 Workflow Template (Research & Report)
- ✅ 2 Knowledge Base Entries
- ✅ 1 Sample Execution

### Running the Seed Script

```bash
# Seed the database
npm run db:seed

# Reset and seed (WARNING: Clears all data)
npm run db:reset
```

### Safety Features

- ✅ Checks if database already has data
- ✅ Skips seeding if data exists
- ✅ Provides clear error messages
- ✅ Validates environment variables

## Database Branching (Neon)

Neon provides Git-like branching for databases:

### Create a Branch

```bash
# Using Neon CLI
neon branches create --name staging --parent main

# Using MCP
manus-mcp-cli tool call create_branch --server neon --input '{
  "project_id": "your-project-id",
  "branch": {
    "name": "staging",
    "parent_id": "main-branch-id"
  }
}'
```

### Benefits

- ✅ Instant branch creation (copy-on-write)
- ✅ Isolated testing environment
- ✅ Safe schema migration testing
- ✅ Easy rollback

### Use Cases

1. **Staging Environment** - Test changes before production
2. **Feature Development** - Isolate feature work
3. **Migration Testing** - Verify schema changes
4. **Data Experiments** - Test queries safely

## Schema Migrations

### Making Schema Changes

1. **Edit Schema** - Modify `src/lib/db/schema.ts`
2. **Generate Migration** - Run `npm run db:generate`
3. **Review Migration** - Check generated SQL in `drizzle/` folder
4. **Test on Staging** - Push to staging branch first
5. **Deploy to Production** - Push to production after verification

### Migration Workflow

```bash
# Development
1. Edit src/lib/db/schema.ts
2. npm run db:generate
3. Review generated migration
4. npm run db:push  # Push to local/staging

# Staging
1. git push origin staging
2. Vercel deploys to staging
3. Test schema changes
4. Verify data integrity

# Production
1. git merge staging into main
2. git push origin main
3. Vercel deploys to production
4. Monitor for errors
```

## Database Maintenance

### Backup Strategy

Neon provides automatic backups:
- ✅ Point-in-time recovery (PITR)
- ✅ 7-day retention (free tier)
- ✅ 30-day retention (paid tiers)

### Restore from Backup

```bash
# Using Neon Console
1. Go to Neon Console
2. Select project
3. Click "Restore"
4. Choose point in time
5. Create new branch from backup
```

### Monitoring

Use Drizzle Studio to monitor:
```bash
npm run db:studio
```

Opens visual database browser at `https://local.drizzle.studio`

### Performance Optimization

#### Indexes

Schema includes optimized indexes on:
- User email (unique)
- Organization ID (foreign keys)
- Agent type and status
- Workflow status
- Execution timestamps
- Knowledge base embeddings

#### Connection Pooling

Use `DATABASE_URL` (pooled) for:
- ✅ API requests
- ✅ Serverless functions
- ✅ High concurrency

Use `DATABASE_URL_UNPOOLED` (direct) for:
- ✅ Migrations
- ✅ Long-running queries
- ✅ Database administration

## Troubleshooting

### Connection Issues

```typescript
// Check connection
import { sql } from './src/lib/db';
const result = await sql`SELECT NOW()`;
console.log(result);
```

### Schema Sync Issues

```bash
# Force push schema (WARNING: May lose data)
npm run db:push -- --force

# Generate new migration
npm run db:generate
```

### Seed Script Fails

```bash
# Check environment variables
echo $DATABASE_URL

# Verify database is accessible
psql $DATABASE_URL -c "SELECT 1"

# Clear database and re-seed
npm run db:reset
```

### Migration Conflicts

```bash
# Resolve conflicts manually
1. Review migration files in drizzle/
2. Edit conflicting migrations
3. Re-run db:push
```

## Best Practices

### Development

1. ✅ Always test schema changes on staging first
2. ✅ Use database branches for feature development
3. ✅ Seed staging with realistic test data
4. ✅ Review generated migrations before applying
5. ✅ Keep schema.ts as single source of truth

### Production

1. ✅ Never run migrations directly on production
2. ✅ Always backup before major schema changes
3. ✅ Monitor query performance after migrations
4. ✅ Use connection pooling for API requests
5. ✅ Set up alerts for connection errors

### Security

1. ✅ Never commit DATABASE_URL to git
2. ✅ Use environment variables for credentials
3. ✅ Rotate database passwords regularly
4. ✅ Use SSL/TLS for all connections
5. ✅ Encrypt sensitive data in database

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Branching Guide](https://neon.tech/docs/guides/branching)

## Support

For database issues:
1. Check this documentation
2. Review Drizzle ORM docs
3. Check Neon status page
4. Contact development team

