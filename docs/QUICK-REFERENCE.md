# Apex Agents - Quick Reference Guide

**For:** Cursor AI and Developers  
**Purpose:** Quick lookup for common tasks and patterns

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/jakelevi88hp/apex-agents.git
cd apex-agents
pnpm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your credentials

# Database setup
pnpm db:push

# Start development
pnpm dev
```

---

## 📁 File Locations (Quick Lookup)

| What | Where |
|------|-------|
| **Frontend Pages** | `src/app/dashboard/[feature]/page.tsx` |
| **Components** | `src/components/[feature]/` |
| **UI Components** | `src/components/ui/` (Shadcn/ui) |
| **tRPC Routers** | `src/server/routers/[feature].ts` |
| **Database Schema** | `drizzle/schema/[feature].ts` |
| **AGI System** | `src/lib/agi/` |
| **AI Admin** | `src/lib/ai-admin/` |
| **Types** | `src/types/` |
| **Hooks** | `src/hooks/` |
| **Documentation** | `docs/` |

---

## 🔧 Common Tasks

### Add a New Feature

**1. Database Schema**
```typescript
// drizzle/schema/my-feature.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const myFeature = pgTable('my_feature', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**2. Push to Database**
```bash
pnpm db:push
```

**3. Create tRPC Router**
```typescript
// src/server/routers/my-feature.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { myFeature } from '@/drizzle/schema/my-feature';
import { eq } from 'drizzle-orm';

export const myFeatureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(myFeature)
      .where(eq(myFeature.userId, ctx.user.id));
  }),
  
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(myFeature).values({
        userId: ctx.user.id,
        name: input.name,
      });
    }),
});
```

**4. Add to Main Router**
```typescript
// src/server/routers/_app.ts
import { myFeatureRouter } from './my-feature';

export const appRouter = router({
  // ... existing routers
  myFeature: myFeatureRouter,
});
```

**5. Create Frontend Page**
```typescript
// src/app/dashboard/my-feature/page.tsx
'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';

export default function MyFeaturePage() {
  const { data, isLoading } = trpc.myFeature.list.useQuery();
  const createMutation = trpc.myFeature.create.useMutation();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>My Feature</h1>
      <Button onClick={() => createMutation.mutate({ name: 'Test' })}>
        Create
      </Button>
      {data?.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

---

### Add a New API Endpoint (Non-tRPC)

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Your logic here
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

### Add a New Component

```typescript
// src/components/my-feature/MyComponent.tsx
import { Card } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <Card>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Card>
  );
}
```

---

### Add a New Hook

```typescript
// src/hooks/useMyFeature.ts
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export function useMyFeature() {
  const [data, setData] = useState(null);
  const query = trpc.myFeature.list.useQuery();
  
  useEffect(() => {
    if (query.data) {
      setData(query.data);
    }
  }, [query.data]);
  
  return { data, isLoading: query.isLoading };
}
```

---

## 🎨 UI Patterns

### Loading State
```typescript
const { data, isLoading, error } = trpc.agents.list.useQuery();

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data || data.length === 0) return <EmptyState />;

return <AgentList agents={data} />;
```

### Form with Mutation
```typescript
const createMutation = trpc.agents.create.useMutation({
  onSuccess: () => {
    toast.success('Created successfully');
    router.push('/dashboard/agents');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const handleSubmit = async (data: AgentInput) => {
  await createMutation.mutateAsync(data);
};
```

### Modal Dialog
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Agent</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  </DialogContent>
</Dialog>
```

---

## 🗄️ Database Patterns

### Query with Filter
```typescript
const agents = await db
  .select()
  .from(agents)
  .where(and(
    eq(agents.userId, userId),
    eq(agents.status, 'active')
  ))
  .orderBy(desc(agents.createdAt));
```

### Insert
```typescript
const [agent] = await db
  .insert(agents)
  .values({
    userId,
    name,
    description,
  })
  .returning();
```

### Update
```typescript
await db
  .update(agents)
  .set({ name: 'New Name', updatedAt: new Date() })
  .where(and(
    eq(agents.id, agentId),
    eq(agents.userId, userId)
  ));
```

### Delete
```typescript
await db
  .delete(agents)
  .where(and(
    eq(agents.id, agentId),
    eq(agents.userId, userId)
  ));
```

### Join
```typescript
const results = await db
  .select({
    agent: agents,
    user: users,
  })
  .from(agents)
  .leftJoin(users, eq(agents.userId, users.id))
  .where(eq(agents.id, agentId));
```

---

## 🔐 Authentication Patterns

### Protected Route (Server Component)
```typescript
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>Protected content</div>;
}
```

### Protected tRPC Procedure
```typescript
export const agentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user is available and guaranteed to exist
    return await ctx.db.select().from(agents)
      .where(eq(agents.userId, ctx.user.id));
  }),
});
```

### Admin-Only Procedure
```typescript
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

export const adminRouter = router({
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can reach here
    }),
});
```

---

## 🧪 Testing Patterns

### Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { memoryService } from '@/lib/agi/memory';

describe('AGI Memory Service', () => {
  it('should store episodic memory', async () => {
    const memory = await memoryService.storeEpisodicMemory({
      userId: 'test-user',
      event: 'test event',
      description: 'test description',
    });
    
    expect(memory).toBeDefined();
    expect(memory.userId).toBe('test-user');
  });
});
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('should create agent', async ({ page }) => {
  await page.goto('/dashboard/agents');
  await page.click('text=New Agent');
  await page.fill('[name="name"]', 'Test Agent');
  await page.click('text=Create');
  await expect(page.locator('text=Test Agent')).toBeVisible();
});
```

---

## 🚀 Deployment Checklist

- [ ] Test locally (`pnpm dev`)
- [ ] Run linter (`pnpm lint`)
- [ ] Run tests (`pnpm test`)
- [ ] Build successfully (`pnpm build`)
- [ ] Update todo.md
- [ ] Commit and push to GitHub
- [ ] Verify Vercel deployment
- [ ] Test in production
- [ ] Monitor Vercel logs

---

## 🐛 Debugging

### Check Database Connection
```bash
curl https://apex-agents.vercel.app/api/health/db
```

### Check Vercel Logs
1. Go to Vercel Dashboard
2. Select apex-agents project
3. Click "Logs" tab
4. Filter by function, status, or search term

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors or warnings

### Check tRPC Errors
```typescript
const { data, error } = trpc.agents.list.useQuery();

if (error) {
  console.error('tRPC Error:', error);
  console.error('Error Code:', error.data?.code);
  console.error('Error Message:', error.message);
}
```

---

## 📦 Package Management

### Add Dependency
```bash
pnpm add package-name
```

### Add Dev Dependency
```bash
pnpm add -D package-name
```

### Update Dependencies
```bash
pnpm update
```

### Remove Dependency
```bash
pnpm remove package-name
```

---

## 🔑 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Pinecone
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="..."
PINECONE_INDEX_NAME="..."

# JWT
JWT_SECRET="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Access in Code

**Server-side:**
```typescript
const apiKey = process.env.OPENAI_API_KEY;
```

**Client-side (must be prefixed with NEXT_PUBLIC_):**
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
```

---

## 📊 Performance Tips

### Use Server Components
```typescript
// ✅ Good - Server Component (default)
export default async function AgentsPage() {
  const agents = await db.select().from(agents);
  return <AgentList agents={agents} />;
}

// ❌ Bad - Client Component when not needed
'use client';
export default function AgentsPage() {
  const { data } = trpc.agents.list.useQuery();
  return <AgentList agents={data} />;
}
```

### Optimize Database Queries
```typescript
// ✅ Good - Select only needed columns
const agents = await db
  .select({
    id: agents.id,
    name: agents.name,
  })
  .from(agents);

// ❌ Bad - Select all columns
const agents = await db.select().from(agents);
```

### Use React.memo for Expensive Components
```typescript
import { memo } from 'react';

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});
```

---

## 🎯 Common Gotchas

### 1. Server vs Client Components
- Server Components: Default, can't use hooks or browser APIs
- Client Components: Need `'use client'` directive, can use hooks

### 2. tRPC Query Caching
- Queries are cached by default
- Use `refetch()` or `invalidate()` to update cache

### 3. Database Migrations
- Always run `pnpm db:push` after schema changes
- Test migrations locally before deploying

### 4. Environment Variables
- Client-side variables must be prefixed with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`

### 5. Type Imports
```typescript
// ✅ Good - Type import
import type { Agent } from '@/types/agent';

// ❌ Bad - Regular import for types
import { Agent } from '@/types/agent';
```

---

## 📞 Quick Links

- **Production:** https://apex-agents.vercel.app/
- **GitHub:** https://github.com/jakelevi88hp/apex-agents
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech/
- **Documentation:** `docs/CURSOR-GUIDE.md`
- **Todo List:** `todo.md`

---

## 🆘 Need Help?

1. Check `docs/CURSOR-GUIDE.md` for detailed documentation
2. Check `todo.md` for current tasks
3. Check Vercel logs for deployment issues
4. Check browser console for client errors
5. Use `/api/health/db` to test database

---

**Last Updated:** November 9, 2024  
**Version:** 1.0
