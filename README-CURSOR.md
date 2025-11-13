# Apex Agents - Cursor AI Integration Guide

**Quick Start Guide for Cursor AI**

---

## 🎯 What is Apex Agents?

Apex Agents is a production AI agent orchestration platform with advanced AGI capabilities, currently deployed at https://apex-agents.vercel.app/.

**Key Features:**
- Multi-agent orchestration
- Visual workflow builder (React Flow)
- AGI system with consciousness, memory, reasoning, creativity, and emotional intelligence
- AI Admin for natural language code generation
- Knowledge base with semantic search (Pinecone)
- Real-time analytics

---

## 📚 Essential Documentation

**Start Here:**
1. **[CURSOR-GUIDE.md](docs/CURSOR-GUIDE.md)** - Complete architecture and development guide (MOST IMPORTANT)
2. **[.cursorrules](.cursorrules)** - Project-specific rules and patterns
3. **[QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md)** - Quick lookup for common tasks
4. **[API-REFERENCE.md](docs/API-REFERENCE.md)** - Complete API documentation
5. **[PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md)** - Production status checklist
6. **[todo.md](todo.md)** - Current tasks and priorities

**Feature-Specific:**
- **[agi-complete-system.md](docs/agi-complete-system.md)** - AGI system documentation
- **[plain-language-patch-system.md](docs/plain-language-patch-system.md)** - AI Admin documentation
- **[DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md)** - Deployment procedures

---

## 🏗️ Architecture Overview

```
Frontend (Next.js 15 + React 19)
    ↓ tRPC (Type-safe API)
Backend (tRPC Routers)
    ↓
PostgreSQL (Neon) + Pinecone (Vectors) + OpenAI (GPT-4o)
```

**Tech Stack:**
- Next.js 15 (App Router)
- React 19, TypeScript, Tailwind CSS 4
- tRPC 11 for APIs
- Drizzle ORM + PostgreSQL (Neon)
- Pinecone for vector search
- OpenAI GPT-4o for AI

---

## 📁 Key File Locations

| What | Where |
|------|-------|
| **Pages** | `src/app/dashboard/[feature]/page.tsx` |
| **Components** | `src/components/[feature]/` |
| **tRPC Routers** | `src/server/routers/[feature].ts` |
| **Database Schema** | `drizzle/schema/[feature].ts` |
| **AGI System** | `src/lib/agi/` |
| **AI Admin** | `src/lib/ai-admin/` |

---

## 🚀 Quick Start

### 1. Setup
```bash
git clone https://github.com/jakelevi88hp/apex-agents.git
cd apex-agents
pnpm install
```

### 2. Environment Variables
Create `.env.local`:
```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
PINECONE_API_KEY="..."
JWT_SECRET="..."
```

### 3. Database
```bash
pnpm db:push
```

### 4. Run
```bash
pnpm dev
```

---

## 💻 Common Tasks

### Add a New Feature

1. **Database Schema** (`drizzle/schema/my-feature.ts`)
```typescript
export const myFeature = pgTable('my_feature', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
});
```

2. **tRPC Router** (`src/server/routers/my-feature.ts`)
```typescript
export const myFeatureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(myFeature)
      .where(eq(myFeature.userId, ctx.user.id));
  }),
});
```

3. **Frontend Page** (`src/app/dashboard/my-feature/page.tsx`)
```typescript
'use client';
export default function MyFeaturePage() {
  const { data } = trpc.myFeature.list.useQuery();
  return <div>{/* ... */}</div>;
}
```

---

## 🎯 Current Status

**Production:** https://apex-agents.vercel.app/

**Completed:**
- ✅ Core infrastructure deployed
- ✅ AGI system with 8 memory tables
- ✅ AI Admin with Vision API
- ✅ Workflow builder (React Flow)
- ✅ Knowledge base with Pinecone
- ✅ Mobile responsive navigation
- ✅ Analytics dashboard

**In Progress:**
- ⚠️ Production testing (AGI, AI Admin)
- ⚠️ Security hardening (rate limiting)
- ⚠️ Error monitoring (Sentry)

**Todo:**
- ❌ Subscription system (3-day trial)
- ❌ Stripe integration
- ❌ Feature gating
- ❌ Comprehensive testing

**Production Readiness:** 60% (See [PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md))

---

## 🔑 Key Principles

1. **Type Safety First** - All code fully typed, no `any`
2. **tRPC for APIs** - All API endpoints use tRPC
3. **Drizzle for Database** - Use Drizzle ORM, avoid raw SQL
4. **Functional Components** - React hooks, no class components
5. **Server Components** - Use by default unless client interactivity needed
6. **Shadcn/ui** - Use existing components, don't create custom UI

---

## 📊 Production Checklist

| Category | Status | Score |
|----------|--------|-------|
| Infrastructure | ✅ Operational | 95% |
| Core Features | ✅ Working | 90% |
| Security | ⚠️ Needs Work | 60% |
| Testing | ⚠️ Incomplete | 30% |
| Monitoring | ⚠️ Basic | 40% |
| Business Features | ❌ Not Started | 0% |
| **Overall** | **⚠️ Partially Ready** | **60%** |

---

## 🐛 Debugging

### Health Checks
```bash
curl https://apex-agents.vercel.app/api/health
curl https://apex-agents.vercel.app/api/health/db
```

### Logs
- **Vercel:** Dashboard → apex-agents → Logs
- **Browser:** DevTools (F12) → Console
- **Database:** Neon Dashboard

---

## 📞 Getting Help

1. **Read Documentation** - Start with [CURSOR-GUIDE.md](docs/CURSOR-GUIDE.md)
2. **Check Todo** - See [todo.md](todo.md) for current tasks
3. **Check Logs** - Vercel Dashboard → Logs
4. **Health Checks** - `/api/health` and `/api/health/db`
5. **Contact** - jakelevi88hp@gmail.com

---

## 🎯 Next Steps

**This Week:**
1. Test AGI system in production
2. Test AI Admin plain-language requests
3. Configure error monitoring (Sentry)
4. Implement rate limiting
5. Security hardening

**Next 2 Weeks:**
6. Subscription system (3-day trial)
7. Stripe integration
8. Feature gating
9. Comprehensive testing
10. User documentation

---

## 📚 Additional Resources

- **GitHub:** https://github.com/jakelevi88hp/apex-agents
- **Production:** https://apex-agents.vercel.app/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech/

---

## 🚨 Important Notes

1. **Production App** - This is live at https://apex-agents.vercel.app/
2. **Test Before Deploy** - Always test locally before pushing
3. **Update todo.md** - Mark tasks complete when done
4. **Follow .cursorrules** - Project-specific patterns
5. **Check CURSOR-GUIDE.md** - Most comprehensive documentation

---

**Last Updated:** November 9, 2024  
**Version:** 1.0  
**Maintainer:** Jake Levi (jakelevi88hp@gmail.com)

---

*For comprehensive documentation, see [CURSOR-GUIDE.md](docs/CURSOR-GUIDE.md)*
