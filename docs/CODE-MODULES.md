# Apex Agents Code Modules

**Last updated:** 2025-11-14

## 1. Frontend Surfaces
| Path | Description | Key Files / Notes |
| --- | --- | --- |
| `src/app` | Next.js App Router entry points (server components by default) | `app/page.tsx` (marketing), `app/dashboard/*` (authenticated layout), auth flows under `login/`, `signup/`, etc. |
| `src/app/dashboard` | Role-based dashboard pages for agents, workflows, analytics, knowledge, settings | Each sub-route renders data via tRPC hooks (`@/lib/trpc`). Layout composes `Sidebar`, `SubscriptionBanner`, `PWAInstallPrompt`. |
| `src/components` | Reusable UI composed with Tailwind | Agent wizard flow, workflow canvas, document uploaders, voice command panel, notifications, modals. Client components mark `"use client"`. |
| `src/components/ui` | Primitive controls (buttons, cards, inputs) built on shadcn patterns | Shared across dashboard and marketing surfaces. |
| `src/hooks` | Client-side hooks | `useKeyboardShortcuts` binds global actions (command palette, quick create). |
| `src/contexts` | React Context providers | `ThemeContext` toggles dark/light and persists preference. |

## 2. API & Server Layer
| Path | Responsibility | Highlights |
| --- | --- | --- |
| `src/server/routers` | tRPC routers orchestrating CRUD + business logic | `agents`, `workflows`, `analytics`, `settings`, `ai-admin`, `subscription`, `suggestions`; combined in `_app.ts`. |
| `src/server/trpc.ts` | Router factory & auth middleware | Injects `db`, attaches `userId`, guards protected procedures. |
| `src/app/api/*` | REST endpoints for integrations, uploads, monitoring, webhooks | `agi/process`, `agi/status`, `ai-admin/stream` (SSE), `documents/*`, `voice`, `monitoring/metrics`, `debugger`, `health`, `health/db`, `upgrade-admin`, `webhooks/stripe`. |
| `src/server` | TRPC context DB + procedures for server-only utilities | Also contains `subscription-procedure.ts` and service-level routers. |

## 3. Domain Libraries (`src/lib`)
| Module | Purpose | Representative Files |
| --- | --- | --- |
| `ai`, `ai-admin`, `agi` | Core reasoning engines, memory systems, admin assistant orchestration | `ai-admin/agent.ts`, `ai-admin/conversation-manager.ts`, `agi/enhanced-core.ts`, `agi/core.ts` |
| `agent-execution`, `workflow-engine`, `workflow-execution` | Agent/workflow runtime pipelines | Executor orchestrates prompts, tool calls, and persistence. |
| `auth.ts`, `auth/jwt.ts` | JWT extraction, verification, and helpers for API routes | Used by REST endpoints and middleware. |
| `document-processor.ts`, `pinecone-service.ts` | File parsing, chunking, vector storage operations | Called by upload/search routes. |
| `db`, `db/schema.ts` | Drizzle setup + schema definitions shared across routers | Mirrors Neon Postgres tables. |
| `monitoring/*` | Subscription and webhook health checks | Exposes `SubscriptionMonitor` + `WebhookMonitor`. |
| `subscription/*` | Feature gating, quota tracking, plan metadata | `SubscriptionService` consumed by AGI endpoints and dashboards. |
| `stripe/*`, `email/*`, `notifications/*` | External integrations (Stripe, Resend, notifications) | Provide typed helpers for API routes. |
| `ai-admin`, `debugger` | Runtime insights, streaming responses, developer tooling. |

## 4. Data & Persistence
| Path | Description |
| --- | --- |
| `drizzle/*.sql`, `drizzle/migrations` | Generated SQL migrations for Neon infrastructure. |
| `src/lib/db/schema.ts` | Primary schema (users, agents, workflows, executions, knowledge base, subscriptions, analytics tables). |
| `src/server/db/schema/documents.ts` | Specialized schema for document uploads (compat with legacy columns). |
| `logs/agi_memory.db` | SQLite artifact for AGI memory (used in local testing). |

## 5. Tooling & Tests
| Path | Purpose |
| --- | --- |
| `scripts/*.ts` | Automation scripts (seed, security audit, debugger setup, production smoke tests). |
| `tests/` | Stress and regression suites (Playwright + custom TS stress tests). |
| `playwright.config.ts` | Browser test harness configuration. |
| `package.json` scripts | For dev (`dev`, `build`, `lint`), database (`db:*`), QA (`test`, `test:ui`, `health:check`, `stress:test`). |

## 6. Cross-Cutting Concerns
- **Styling:** Tailwind + utility components; no CSS modules or styled-components.
- **State Management:** Prefer React hooks/context; Zustand used where global but lightweight state is required.
- **Error Handling:** Try/catch with structured responses (JSON) in API routes; `TRPCError` for tRPC procedures.
- **Serialization:** `superjson` in tRPC context; `zod` schemas guard inputs server-side.
- **Rate Limiting:** `src/lib/rate-limit.ts` supports presets (AGI, uploads) invoked inside API endpoints.

