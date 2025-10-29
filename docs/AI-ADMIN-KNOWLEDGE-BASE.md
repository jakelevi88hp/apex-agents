# AI Admin Knowledge Base

**Last Updated:** October 29, 2025  
**Purpose:** Comprehensive context and instructions for the AI Admin autonomous code modification system

---

## 🎯 Project Overview

**Project Name:** Apex Agents Platform  
**Type:** AI Agent Management System  
**Stack:** Next.js 14 (App Router), TypeScript, tRPC, PostgreSQL (Neon), Pinecone  
**Repository:** https://github.com/jakelevi88hp/apex-agents  
**Database:** Neon PostgreSQL (apex-agents-production, project ID: blue-hat-88201078)

### Core Purpose
The Apex Agents platform is a comprehensive AI agent management system that enables users to create, manage, and orchestrate AI agents with advanced capabilities including AGI chat, autonomous code modification, knowledge management, analytics, workflows, and settings management.

---

## 📁 Project Structure (CRITICAL - App Router)

### ⚠️ CRITICAL: This is Next.js 14 App Router (NOT Pages Router)

**✅ CORRECT PATHS:**
```
src/
├── app/                          # App Router pages (NOT pages/)
│   ├── layout.tsx               # Root layout (NOT _app.tsx)
│   ├── page.tsx                 # Home page
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard home
│   │   ├── agents/page.tsx      # Agents management
│   │   ├── agi/page.tsx         # AGI chat interface
│   │   ├── analytics/page.tsx   # Analytics dashboard
│   │   ├── workflows/page.tsx   # Workflow builder
│   │   ├── settings/page.tsx    # Settings management
│   │   └── knowledge/page.tsx   # Knowledge management
│   └── api/
│       ├── trpc/[trpc]/route.ts # tRPC API handler
│       └── agi/
│           ├── status/route.ts  # AGI status endpoint
│           └── process/route.ts # AGI processing endpoint
├── components/                   # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   └── DashboardLayout.tsx      # Dashboard layout component
├── contexts/                     # React contexts (PLURAL, .tsx extension)
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts             # Database connection
│   │   └── schema.ts            # Drizzle ORM schema
│   ├── ai-admin/
│   │   ├── agent.ts             # AI Admin agent implementation
│   │   ├── github.ts            # GitHub integration
│   │   └── github-service.ts    # GitHub service for patches
│   ├── agi/
│   │   └── engine.ts            # AGI engine implementation
│   ├── trpc.ts                  # tRPC client setup
│   └── auth/
│       └── jwt.ts               # JWT authentication
└── server/
    ├── trpc.ts                  # tRPC server setup
    └── routers/
        ├── _app.ts              # Main router aggregator
        ├── agents.ts            # Agents router
        ├── workflows.ts         # Workflows router
        ├── analytics.ts         # Analytics router
        ├── settings.ts          # Settings router
        ├── auth.ts              # Authentication router
        ├── ai-admin.ts          # AI Admin router
        └── execution.ts         # Execution router
```

**❌ NEVER USE THESE PATHS (Pages Router):**
```
pages/                    # WRONG - This is Pages Router
src/pages/_app.tsx       # WRONG - Use src/app/layout.tsx
src/pages/_document.tsx  # WRONG - Use src/app/layout.tsx
src/context/             # WRONG - Use src/contexts/ (plural)
```

---

## 🗄️ Database Schema

### Core Tables

#### users
```typescript
{
  id: UUID (primary key)
  email: VARCHAR(320) (unique)
  passwordHash: VARCHAR(255)
  name: TEXT
  role: VARCHAR(20) // 'user', 'admin', 'owner'
  organizationId: UUID
  subscriptionTier: VARCHAR(20)
  apiKey: VARCHAR(255)
  preferences: JSONB
  createdAt: TIMESTAMP
  lastLogin: TIMESTAMP
}
```

#### agents
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key -> users.id)
  name: TEXT
  description: TEXT
  type: VARCHAR(50) // research, analysis, writing, code, etc.
  config: JSONB
  status: VARCHAR(20) // active, inactive, archived
  version: INTEGER
  performanceMetrics: JSONB
  learningData: JSONB
  capabilities: JSONB
  constraints: JSONB
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### workflows
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key -> users.id)
  name: TEXT
  description: TEXT
  trigger: JSONB // schedule, event, manual, webhook
  steps: JSONB
  agents: JSONB
  conditions: JSONB
  errorHandling: JSONB
  status: VARCHAR(20) // draft, active, archived
  executionCount: INTEGER
  lastExecution: TIMESTAMP
  averageDuration: INTEGER
  successRate: DECIMAL
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### executions
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key -> users.id)
  workflowId: UUID (foreign key -> workflows.id)
  agentId: UUID (foreign key -> agents.id)
  status: VARCHAR(20) // pending, running, completed, failed
  inputData: JSONB
  outputData: JSONB
  errorMessage: TEXT
  startedAt: TIMESTAMP
  completedAt: TIMESTAMP
  durationMs: INTEGER
  tokensUsed: INTEGER
  costUsd: DECIMAL
}
```

#### user_settings
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key -> users.id, unique)
  organizationName: TEXT
  email: VARCHAR(320)
  timezone: VARCHAR(50)
  emailNotifications: BOOLEAN
  realtimeMonitoring: BOOLEAN
  autoRetry: BOOLEAN
  openaiApiKey: TEXT
  anthropicApiKey: TEXT
  defaultModel: VARCHAR(100)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### api_keys
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key -> users.id)
  name: TEXT
  keyValue: TEXT
  keyPrefix: VARCHAR(20)
  environment: VARCHAR(20) // production, development, test
  revoked: BOOLEAN
  revokedAt: TIMESTAMP
  lastUsedAt: TIMESTAMP
  expiresAt: TIMESTAMP
  createdAt: TIMESTAMP
}
```

#### team_members
```typescript
{
  id: UUID (primary key)
  ownerId: UUID (foreign key -> users.id)
  memberId: UUID (foreign key -> users.id)
  role: VARCHAR(20) // admin, member
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### documents (Knowledge System)
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key -> users.id)
  filename: TEXT
  fileType: VARCHAR(50)
  fileSize: INTEGER
  filePath: TEXT
  status: VARCHAR(20) // processing, ready, failed
  metadata: JSONB
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### chunks (Knowledge System)
```typescript
{
  id: UUID (primary key)
  documentId: UUID (foreign key -> documents.id)
  content: TEXT
  chunkIndex: INTEGER
  embedding: VECTOR // Pinecone vector
  metadata: JSONB
  createdAt: TIMESTAMP
}
```

---

## 🔌 API Endpoints (tRPC)

### Authentication Router (`auth`)
- `me` - Get current user
- `login` - User login
- `signup` - User registration
- `logout` - User logout

### Agents Router (`agents`)
- `list` - List all user agents
- `get` - Get single agent by ID
- `create` - Create new agent
- `update` - Update existing agent
- `delete` - Delete agent
- `execute` - Execute agent with input

### Workflows Router (`workflows`)
- `list` - List all user workflows
- `get` - Get single workflow by ID
- `create` - Create new workflow
- `update` - Update existing workflow
- `delete` - Delete workflow
- `execute` - Execute workflow
- `getExecutionStatus` - Get execution status
- `getExecutionHistory` - Get workflow execution history

### Analytics Router (`analytics`)
- `getDashboardMetrics` - Get active agents, workflows, executions count
- `getSparklineData` - Get 7-day trend data for metrics
- `getRecentActivity` - Get recent execution activity
- `getExecutionStats` - Get execution statistics with filters
- `getAgentPerformance` - Get agent performance metrics
- `getWorkflowPerformance` - Get workflow performance metrics
- `getExecutionTrend` - Get daily execution trend data

### Settings Router (`settings`)
- `getSettings` - Get user settings
- `updateSettings` - Update user settings
- `listApiKeys` - List all API keys
- `createApiKey` - Create new API key
- `revokeApiKey` - Revoke API key
- `getModelConfig` - Get AI model configuration
- `updateModelConfig` - Update AI model configuration
- `getBillingInfo` - Get billing information
- `listTeamMembers` - List team members
- `inviteTeamMember` - Invite new team member
- `updateTeamMemberRole` - Update team member role
- `removeTeamMember` - Remove team member

### AI Admin Router (`aiAdmin`) - ADMIN ONLY
- `analyzeCodebase` - Analyze project structure and patterns
- `generatePatch` - Generate code patch from natural language
- `applyPatch` - Apply generated patch
- `rollbackPatch` - Rollback applied patch
- `getPatchHistory` - Get patch history
- `getPatch` - Get specific patch details
- `executeCommand` - Execute command (generate + apply)

### Execution Router (`execution`)
- `start` - Start new execution
- `getStatus` - Get execution status
- `cancel` - Cancel running execution
- `getResults` - Get execution results

---

## 🎨 Design System

### Color Palette
- **Primary:** Purple (#8b5cf6, #7c3aed, #6d28d9)
- **Background:** Dark gray (#111827, #1f2937, #374151)
- **Text:** White (#ffffff), Gray (#9ca3af, #6b7280)
- **Success:** Green (#10b981, #059669)
- **Error:** Red (#ef4444, #dc2626)
- **Warning:** Yellow (#f59e0b, #d97706)

### UI Components (shadcn/ui)
- Button, Card, Dialog, Input, Select, Textarea
- Dropdown Menu, Tooltip, Tabs, Badge
- All components in `src/components/ui/`

### Layout Patterns
- **Dashboard:** Sidebar navigation with main content area
- **Cards:** Rounded corners, border, shadow, hover effects
- **Modals:** Centered overlay with backdrop blur
- **Forms:** Labeled inputs with validation

---

## 🔐 Authentication & Authorization

### JWT-based Authentication
- Token stored in HTTP-only cookies
- Token includes: userId, email, role
- Token expires after 7 days
- Refresh token not implemented yet

### Role-Based Access Control
- **Owner:** Full access to all features
- **Admin:** Access to AI Admin, can manage users
- **User:** Standard access, no admin features

### Admin Users
- jakelevi88hp@gmail.com (owner)
- bairdtire317@gmail.com (admin)

### Protected Routes
- All `/dashboard/*` routes require authentication
- `/admin/*` routes require admin role
- AI Admin endpoints require admin role

---

## 🤖 AI Admin System

### Current Implementation
The AI Admin agent is located at `src/lib/ai-admin/agent.ts` and provides:

1. **Codebase Analysis**
   - Reads project structure
   - Detects frameworks and patterns
   - Analyzes dependencies

2. **Patch Generation**
   - Uses OpenAI GPT-4 to generate code changes
   - Understands App Router structure
   - Reads relevant files for context
   - Generates precise file modifications

3. **Patch Application**
   - Applies changes to local filesystem
   - Commits changes to GitHub
   - Tracks patch history
   - Supports rollback

### System Prompt (Current)
The AI Admin uses a system prompt that includes:
- Framework detection (Next.js 14 App Router)
- Project structure rules (App Router vs Pages Router)
- File modification rules (modify vs create)
- Existing file paths
- Code generation guidelines

### Limitations
- **No project memory:** Each request starts fresh
- **Limited context:** Only reads files mentioned in request
- **No documentation access:** Doesn't have access to project docs
- **No best practices:** Doesn't know project-specific patterns

---

## 📚 Knowledge to Inject into AI Admin

### 1. Complete Feature List
The AI Admin should know about all implemented features:
- ✅ AGI System with GPT-4 integration
- ✅ AI Admin autonomous code modification
- ✅ Knowledge Management with Pinecone vector search
- ✅ Analytics with real-time metrics
- ✅ Workflows with CRUD operations
- ✅ Settings management (API keys, team, billing)
- ✅ Authentication with JWT
- ✅ Database integration with Neon PostgreSQL

### 2. Database Schema
The AI Admin should have access to the complete database schema (see above) to:
- Generate correct tRPC endpoints
- Create proper database queries
- Understand relationships between tables
- Add new tables with proper foreign keys

### 3. API Patterns
The AI Admin should know the tRPC patterns:
```typescript
// Protected procedure pattern
export const myRouter = router({
  myEndpoint: protectedProcedure
    .input(z.object({ ... }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      // Query database
      return result;
    }),
});
```

### 4. File Modification Rules
The AI Admin should follow these rules:
1. **Always check if file exists before creating**
2. **Modify existing files instead of creating duplicates**
3. **Preserve existing functionality when modifying**
4. **Use correct paths (App Router, not Pages Router)**
5. **Import from correct locations**
6. **Follow TypeScript best practices**

### 5. Common Patterns
The AI Admin should know these patterns:
- **tRPC Router:** `src/server/routers/*.ts`
- **Database Schema:** `src/lib/db/schema.ts`
- **Frontend Page:** `src/app/*/page.tsx`
- **Component:** `src/components/*.tsx`
- **Context:** `src/contexts/*.tsx`
- **Utility:** `src/lib/*.ts`

### 6. Environment Variables
The AI Admin should know available env vars:
- `DATABASE_URL` - Neon PostgreSQL connection
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name
- `JWT_SECRET` - JWT signing secret
- `GITHUB_TOKEN` - GitHub API token
- `GITHUB_OWNER` - GitHub repository owner
- `GITHUB_REPO` - GitHub repository name

### 7. Dependencies
The AI Admin should know installed packages:
- **Framework:** next@14, react@18, typescript
- **API:** @trpc/server@11, @trpc/client@11
- **Database:** drizzle-orm, @neondatabase/serverless
- **AI:** openai, @pinecone-database/pinecone
- **UI:** tailwindcss, lucide-react, recharts
- **Auth:** jsonwebtoken, bcryptjs
- **PDF:** react-pdf, pdfjs-dist

### 8. Testing Patterns
The AI Admin should know testing is done with:
- **E2E:** Playwright (tests in `tests/`)
- **Unit:** Not implemented yet
- **Manual:** Required for all changes

### 9. Deployment
The AI Admin should know:
- **Platform:** Vercel
- **Auto-deploy:** Enabled on main branch push
- **Database:** Neon PostgreSQL (always available)
- **Environment:** Production uses read-only filesystem

### 10. Common Tasks
The AI Admin should be able to:
- Add new tRPC endpoints
- Create new database tables
- Add new pages to dashboard
- Modify existing components
- Update database schema
- Add new features to existing pages
- Fix bugs in existing code
- Optimize performance
- Improve UI/UX

---

## 🎯 Instructions for AI Admin

### When Generating Patches

1. **Always analyze the request first**
   - What feature is being requested?
   - Does it already exist?
   - What files need to be modified?
   - What new files need to be created?

2. **Check existing files**
   - Read relevant files before generating patches
   - Understand current implementation
   - Preserve existing functionality
   - Don't create duplicates

3. **Follow project patterns**
   - Use tRPC for API endpoints
   - Use Drizzle ORM for database queries
   - Use TypeScript for type safety
   - Use Tailwind CSS for styling
   - Use shadcn/ui for components

4. **Generate complete code**
   - Don't use placeholders or comments like "// rest of code"
   - Include all imports
   - Include all types
   - Include error handling
   - Include loading states

5. **Test before applying**
   - Verify syntax is correct
   - Check imports are valid
   - Ensure types match
   - Confirm database queries are correct

6. **Document changes**
   - Explain what was changed
   - Explain why it was changed
   - List affected files
   - Note any breaking changes

### When Applying Patches

1. **Verify patch is safe**
   - No syntax errors
   - No breaking changes
   - No security issues
   - No data loss

2. **Apply atomically**
   - All files or none
   - Rollback on failure
   - Log all changes
   - Track in history

3. **Commit to GitHub**
   - Use descriptive commit message
   - Include all changed files
   - Push to main branch
   - Trigger auto-deployment

### When Rolling Back

1. **Identify the patch**
   - Find patch ID in history
   - Verify it was applied
   - Check current state

2. **Revert changes**
   - Restore original files
   - Update database if needed
   - Clear any caches

3. **Verify rollback**
   - Check files are restored
   - Test functionality
   - Update patch status

---

## 🚀 Common Modification Scenarios

### Adding a New Dashboard Page

1. Create page file: `src/app/dashboard/new-feature/page.tsx`
2. Add to dashboard layout navigation (if needed)
3. Create tRPC router: `src/server/routers/new-feature.ts`
4. Register router in `src/server/routers/_app.ts`
5. Add database table to `src/lib/db/schema.ts` (if needed)
6. Run database migration (if needed)

### Adding a New API Endpoint

1. Open relevant router: `src/server/routers/*.ts`
2. Add new procedure:
```typescript
myNewEndpoint: protectedProcedure
  .input(z.object({ ... }))
  .query(async ({ ctx, input }) => {
    // Implementation
  }),
```
3. Update frontend to use new endpoint

### Modifying Existing Feature

1. Identify affected files
2. Read current implementation
3. Make minimal changes
4. Preserve existing functionality
5. Test thoroughly

### Adding Database Table

1. Add table to `src/lib/db/schema.ts`:
```typescript
export const myTable = pgTable('my_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  // ... other columns
  createdAt: timestamp('created_at').defaultNow(),
});
```
2. Run migration using Neon MCP server
3. Add tRPC endpoints for CRUD operations
4. Update frontend to use new endpoints

---

## 📝 Best Practices

### Code Quality
- Use TypeScript for all files
- Add JSDoc comments for complex functions
- Use meaningful variable names
- Keep functions small and focused
- Handle errors properly
- Add loading states
- Validate inputs

### Security
- Always validate user input
- Use parameterized queries
- Check user permissions
- Sanitize data before display
- Use HTTPS only
- Store secrets in environment variables

### Performance
- Use database indexes
- Implement pagination
- Cache frequently accessed data
- Optimize images
- Minimize bundle size
- Use code splitting

### UX
- Show loading states
- Display error messages
- Confirm destructive actions
- Provide feedback on success
- Make UI responsive
- Ensure accessibility

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Check import path is correct for App Router

### Issue: "Cannot read property of undefined"
**Solution:** Add optional chaining and null checks

### Issue: "Database connection failed"
**Solution:** Check DATABASE_URL environment variable

### Issue: "tRPC endpoint not found"
**Solution:** Verify router is registered in _app.ts

### Issue: "Page not rendering"
**Solution:** Check if it's a client component (needs 'use client')

### Issue: "Styles not applying"
**Solution:** Check Tailwind classes are correct

---

## 🎉 Success Metrics

The AI Admin should aim for:
- ✅ **100% syntax correctness** - No syntax errors
- ✅ **Zero breaking changes** - Existing features still work
- ✅ **Complete implementations** - No placeholders or TODOs
- ✅ **Proper error handling** - All edge cases covered
- ✅ **Type safety** - Full TypeScript coverage
- ✅ **Documentation** - Clear explanations of changes
- ✅ **Testing** - Manual testing completed
- ✅ **Deployment** - Successfully deployed to production

---

**End of Knowledge Base**

This document should be used as the primary reference for the AI Admin system when generating code patches. It contains all the necessary context about the project structure, patterns, and best practices to ensure high-quality, consistent code modifications.

