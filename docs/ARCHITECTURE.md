# Apex Agents Platform - Architecture Documentation

## Executive Summary

**Project**: Apex Agents Platform  
**Tech Stack**: Next.js 14 (App Router), TypeScript, tRPC, Drizzle ORM, PostgreSQL (Neon), Pinecone  
**Architecture Pattern**: Layered Architecture with Domain-Driven Design principles  
**Status**: Production-ready with identified improvement areas

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Architectural Principles](#architectural-principles)
3. [Layer Definitions](#layer-definitions)
4. [Service Boundaries](#service-boundaries)
5. [API Design Standards](#api-design-standards)
6. [Naming Conventions](#naming-conventions)
7. [Identified Issues](#identified-issues)
8. [Improvement Roadmap](#improvement-roadmap)
9. [Design Decisions](#design-decisions)

---

## Current Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  (Next.js App Router: app/, components/)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      API Layer                                │
│  (tRPC Routers: server/routers/, API Routes: app/api/)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Service Layer                            │
│  (Business Logic: lib/, server/services/)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Data Layer                               │
│  (Drizzle ORM: lib/db/, Schema: lib/db/schema/)             │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API endpoints (webhooks, health)
│   ├── dashboard/         # Dashboard pages
│   └── [auth-pages]/      # Login, signup, etc.
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── agent-wizard/      # Feature-specific components
│   └── workflow-builder/  # Feature-specific components
├── lib/                    # Shared libraries & services
│   ├── db/                # Database configuration & schema
│   ├── agi/               # AGI system
│   ├── ai-admin/          # AI Admin system
│   ├── subscription/      # Subscription service
│   └── [other-services]/  # Domain services
├── server/                 # Server-side code
│   ├── routers/           # tRPC routers
│   ├── middleware/        # Server middleware
│   └── services/          # Server services
└── hooks/                  # React hooks
```

---

## Architectural Principles

### 1. **Separation of Concerns**
- **Presentation**: React components, pages (app/, components/)
- **Application**: tRPC routers, API routes (server/routers/, app/api/)
- **Domain**: Business logic, services (lib/)
- **Infrastructure**: Database, external APIs (lib/db/, lib/stripe/)

### 2. **Domain-Driven Design (DDD)**
- Organize code by business domains (agents, workflows, subscriptions, AGI)
- Each domain has its own service, router, and schema
- Clear boundaries between domains

### 3. **Type Safety First**
- TypeScript strict mode enabled
- tRPC for end-to-end type safety
- Drizzle ORM for type-safe database queries
- No `any` types (ongoing cleanup)

### 4. **API Design**
- **tRPC**: Primary API for internal client-server communication
- **REST**: Only for webhooks, health checks, external integrations
- All tRPC procedures must be typed with Zod schemas

### 5. **Database Strategy**
- Single PostgreSQL database (Neon)
- Drizzle ORM for type-safe queries
- Schema organized by domain in `lib/db/schema/`
- Migrations managed by Drizzle Kit

---

## Layer Definitions

### Presentation Layer (`app/`, `components/`)

**Responsibilities:**
- UI rendering
- User interactions
- Client-side state management
- Route handling

**Rules:**
- ✅ Use Server Components by default
- ✅ Use `'use client'` only when needed (hooks, browser APIs)
- ✅ Components should be small, focused, reusable
- ✅ Feature-specific components in feature folders
- ❌ No business logic in components
- ❌ No direct database access

**Structure:**
```
components/
├── ui/              # Generic, reusable components (buttons, inputs)
├── [feature]/       # Feature-specific components
└── [shared]/        # Shared across features
```

### API Layer (`server/routers/`, `app/api/`)

**Responsibilities:**
- Request/response handling
- Input validation
- Authentication/authorization
- Error handling

**Rules:**
- ✅ tRPC for all internal APIs
- ✅ REST only for webhooks/external integrations
- ✅ All inputs validated with Zod
- ✅ Use `protectedProcedure` for authenticated routes
- ✅ Consistent error responses
- ❌ No business logic in routers

**Structure:**
```
server/routers/
├── _app.ts          # Root router
├── [domain].ts      # Domain-specific routers
└── [feature].ts     # Feature-specific routers
```

### Service Layer (`lib/`, `server/services/`)

**Responsibilities:**
- Business logic
- Domain rules
- External service integration
- Data transformation

**Rules:**
- ✅ One service per domain/feature
- ✅ Services are stateless (or explicitly stateful)
- ✅ Services can call other services
- ✅ Services return typed results
- ❌ Services should not depend on Next.js-specific APIs
- ❌ No direct database queries (use repository pattern if needed)

**Structure:**
```
lib/
├── [domain]/        # Domain services (e.g., subscription/)
│   ├── service.ts   # Main service class
│   └── types.ts     # Domain types
└── [shared]/        # Shared utilities
```

### Data Layer (`lib/db/`)

**Responsibilities:**
- Database schema definition
- Query builders
- Migration management

**Rules:**
- ✅ Schema files organized by domain
- ✅ Use Drizzle ORM query builder API (`db.select()`)
- ✅ Type inference from schema (`$inferSelect`, `$inferInsert`)
- ✅ All queries must be typed
- ❌ No raw SQL unless necessary (use `sql` template tag)

**Structure:**
```
lib/db/
├── index.ts         # Database connection
├── schema.ts        # Root schema (exports all)
└── schema/
    ├── [domain].ts  # Domain schemas
    └── [feature].ts # Feature schemas
```

---

## Service Boundaries

### Domain Services

1. **Agent Service** (`lib/agent-execution/`, `lib/agent-templates.ts`)
   - Agent creation, execution, management
   - Agent templates and configurations

2. **Workflow Service** (`lib/workflow-execution/`, `lib/workflow-engine/`)
   - Workflow definition and execution
   - Workflow orchestration

3. **Subscription Service** (`lib/subscription/`)
   - Subscription management
   - Usage tracking
   - Plan limits enforcement

4. **AGI Service** (`lib/agi/`)
   - AGI conversation handling
   - Memory management
   - Reasoning and creativity

5. **AI Admin Service** (`lib/ai-admin/`)
   - Code analysis
   - Patch generation
   - GitHub integration

6. **Knowledge Base Service** (`lib/knowledge-base/`)
   - Document processing
   - Vector search (Pinecone)
   - Semantic search

### Cross-Cutting Services

1. **Authentication** (`lib/auth/`)
2. **Monitoring** (`lib/monitoring/`)
3. **Notifications** (`lib/notifications/`)
4. **Email** (`lib/email/`)
5. **Stripe Integration** (`lib/stripe/`)

---

## API Design Standards

### tRPC Router Pattern

```typescript
// server/routers/[domain].ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { DomainService } from '@/lib/[domain]/service';

export const domainRouter = router({
  // Query: Read operations
  list: protectedProcedure
    .input(z.object({ /* ... */ }))
    .query(async ({ ctx, input }) => {
      return await DomainService.list(ctx.userId!, input);
    }),

  // Mutation: Write operations
  create: protectedProcedure
    .input(z.object({ /* ... */ }))
    .mutation(async ({ ctx, input }) => {
      return await DomainService.create(ctx.userId!, input);
    }),
});
```

### REST API Pattern (for webhooks/external)

```typescript
// app/api/[route]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const body = await request.json();
    
    // Process
    const result = await Service.process(body);
    
    // Return response
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Message' },
      { status: 500 }
    );
  }
}
```

---

## Naming Conventions

### Files and Directories

- **Files**: `kebab-case.ts` or `PascalCase.tsx` (components)
- **Directories**: `kebab-case/`
- **Components**: `PascalCase.tsx`
- **Services**: `service.ts` or `[domain]-service.ts`
- **Types**: `types.ts` or co-located with service

### Code

- **Variables/Functions**: `camelCase`
- **Classes/Interfaces/Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private members**: `_privateMethod` or `private method`

### Database

- **Tables**: `snake_case` (plural)
- **Columns**: `snake_case`
- **Indexes**: `[table]_[column]_idx`

---

## Identified Issues

### Critical Issues

1. **Service Layer Inconsistency**
   - Some services in `lib/`, others in `server/services/`
   - **Fix**: Consolidate all services in `lib/` with clear domain boundaries

2. **Type Safety Gaps**
   - 204 remaining `any` types
   - **Fix**: Systematic replacement with proper types

3. **Schema Organization**
   - Mixed schema definitions (some in root, some in subdirectories)
   - **Fix**: All schemas in `lib/db/schema/` subdirectories

4. **Component Organization**
   - Some feature components at root level
   - **Fix**: Move to feature-specific folders

### Medium Priority

5. **Error Handling Inconsistency**
   - Mixed error handling patterns
   - **Fix**: Standardize error handling with custom error classes

6. **Configuration Management**
   - Environment variables scattered
   - **Fix**: Centralize in `lib/config/`

7. **Testing Coverage**
   - Limited test coverage
   - **Fix**: Add unit tests for services, integration tests for routers

### Low Priority

8. **Documentation**
   - Some services lack JSDoc
   - **Fix**: Add comprehensive JSDoc to all public APIs

9. **Code Duplication**
   - Some repeated patterns
   - **Fix**: Extract to shared utilities

---

## Improvement Roadmap

### Phase 1: Foundation (Week 1-2)

**Task 1.1: Service Layer Consolidation**
- **Agent**: Service Consolidation Agent
- **Tasks**:
  - Move all services from `server/services/` to `lib/[domain]/`
  - Ensure consistent service patterns
  - Update imports across codebase
- **Deliverable**: All services in `lib/` with clear domain boundaries

**Task 1.2: Schema Reorganization**
- **Agent**: Database Architecture Agent
- **Tasks**:
  - Move all schema definitions to `lib/db/schema/[domain].ts`
  - Update root `schema.ts` to only export
  - Ensure all relations are properly defined
- **Deliverable**: Clean, organized schema structure

**Task 1.3: Type Safety Cleanup**
- **Agent**: Type Safety Agent
- **Tasks**:
  - Replace remaining 204 `any` types
  - Add proper type definitions
  - Ensure all functions are fully typed
- **Deliverable**: Zero `any` types, 100% type coverage

### Phase 2: Standardization (Week 3-4)

**Task 2.1: Error Handling Standardization**
- **Agent**: Error Handling Agent
- **Tasks**:
  - Create custom error classes (`lib/errors/`)
  - Standardize error responses
  - Update all error handling
- **Deliverable**: Consistent error handling across codebase

**Task 2.2: Configuration Management**
- **Agent**: Configuration Agent
- **Tasks**:
  - Create `lib/config/` with environment validation
  - Use `@t3-oss/env-nextjs` for type-safe env vars
  - Centralize all configuration
- **Deliverable**: Type-safe, centralized configuration

**Task 2.3: Component Organization**
- **Agent**: Component Organization Agent
- **Tasks**:
  - Reorganize components by feature
  - Create shared component library
  - Document component usage
- **Deliverable**: Well-organized component structure

### Phase 3: Quality & Testing (Week 5-6)

**Task 3.1: Testing Infrastructure**
- **Agent**: Testing Agent
- **Tasks**:
  - Set up unit test framework
  - Create test utilities
  - Add tests for critical services
- **Deliverable**: Testing infrastructure and initial test suite

**Task 3.2: Documentation**
- **Agent**: Documentation Agent
- **Tasks**:
  - Add JSDoc to all public APIs
  - Create API documentation
  - Update README with architecture info
- **Deliverable**: Comprehensive documentation

### Phase 4: Optimization (Week 7-8)

**Task 4.1: Performance Optimization**
- **Agent**: Performance Agent
- **Tasks**:
  - Analyze bundle size
  - Optimize imports
  - Add code splitting where needed
- **Deliverable**: Optimized bundle, improved performance

**Task 4.2: Code Quality**
- **Agent**: Code Quality Agent
- **Tasks**:
  - Remove code duplication
  - Refactor complex functions
  - Improve code readability
- **Deliverable**: Clean, maintainable codebase

---

## Design Decisions

### Decision 1: tRPC over REST for Internal APIs

**Rationale:**
- End-to-end type safety
- Better developer experience
- Automatic API documentation
- Reduced boilerplate

**Trade-offs:**
- Learning curve for team
- Less standard than REST
- **Decision**: Keep tRPC, use REST only for external integrations

### Decision 2: Drizzle ORM over Prisma

**Rationale:**
- Better TypeScript inference
- More control over queries
- Lighter weight
- SQL-like query builder

**Trade-offs:**
- Less mature ecosystem
- More manual work
- **Decision**: Continue with Drizzle, document query patterns

### Decision 3: Service Layer in `lib/` not `server/`

**Rationale:**
- Services are reusable (can be used in API routes, tRPC, background jobs)
- Clear separation: `lib/` = business logic, `server/` = server-specific code
- Better testability

**Trade-offs:**
- Some confusion about where services live
- **Decision**: Consolidate all services in `lib/` with clear domain folders

### Decision 4: Domain-Driven Design Structure

**Rationale:**
- Scales well as features grow
- Clear ownership boundaries
- Easier to understand codebase
- Better for team collaboration

**Trade-offs:**
- More files/folders
- Need discipline to maintain boundaries
- **Decision**: Continue DDD approach, enforce boundaries via linting

### Decision 5: Next.js App Router

**Rationale:**
- Latest Next.js features
- Better performance
- Server Components by default
- Better developer experience

**Trade-offs:**
- Migration effort from Pages Router
- Some patterns still evolving
- **Decision**: Continue with App Router, follow Next.js best practices

---

## Next Steps

1. **Review this document** with the team
2. **Assign agents** to Phase 1 tasks
3. **Create detailed task breakdowns** for each agent
4. **Set up tracking** for architectural improvements
5. **Schedule reviews** after each phase

---

## Maintenance

This document should be updated:
- After major architectural changes
- When new patterns emerge
- When issues are identified
- Quarterly reviews

**Last Updated**: 2025-11-14  
**Version**: 1.0  
**Maintainer**: Apex Lead Architect Agent
