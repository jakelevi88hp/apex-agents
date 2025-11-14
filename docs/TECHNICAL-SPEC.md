# Apex Agents Technical Specification

_Last updated: 2025-11-14_

## 1. Product Overview

Apex Agents is an AI operations platform that combines agent orchestration, workflow automation, document intelligence, and subscription management. The product must feel like a control tower: operators define agents and workflows, feed them knowledge, and monitor executions in real time.

### Primary Capabilities
- **Enhanced AGI interface** – contextual reasoning with persistent memory via `EnhancedAGICore`.
- **AI Admin** – self-service code maintainer that analyzes the repo, proposes patches, and can apply them through GitHub or local FS.
- **Workflow engine** – user-defined triggers and agent chains executed through `getWorkflowExecutor`.
- **Knowledge ingestion** – document uploads processed by `DocumentProcessor` and embedded with Pinecone for semantic search.
- **Voice + Multimodal surface** – `/api/voice` turns audio commands into agent executions; AI Admin handles image context.
- **Subscription + usage controls** – Stripe billing plus `SubscriptionService` usage tracking protects quotas.

## 2. Goals & Non-Goals

| Goal | Details |
| --- | --- |
| Unified operator Console | Single Next.js App Router UI for agents, AGI chat, workflows, knowledge, analytics, settings. |
| Secure, multi-tenant backend | All tRPC procedures and REST endpoints enforce JWT auth + admin gates where required. |
| Extensible AI infrastructure | AGI + AI Admin modules expose service classes so new entrypoints (voice, webhooks) can reuse them. |
| Production-ready observability | Sentry, custom `appMonitor`, health endpoints, and Stripe/Pinecone logging create actionable telemetry. |
| Predictable costs | Rate limiting (`lib/rate-limit`), `SubscriptionService.trackUsage`, and plan limits guard LLM + storage spend. |

| Non-Goal | Rationale |
| --- | --- |
| Real-time job queue | Document ingestion runs inline in API routes with async `processDocumentAsync`; no separate worker today. |
| Bring-your-own DB migrations UI | Drizzle migrations live in repo; external dashboards are out of scope. |
| Public GraphQL API | All first-party API surface is REST (App Router handlers) or tRPC. |

## 3. Technology Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| UI | Next.js 14 App Router, React Server Components, Tailwind | Client interactivity limited to `use client` islands for dashboards and builders. |
| State/Data | tRPC 11, React Query, Zustand (localized) | tRPC handler (`src/app/api/trpc/[trpc]/route.ts`) bridges client hooks with server routers. |
| Backend Runtime | Node 18 on Vercel (Edge where safe) | Most heavy routes (`/api/voice`, `/api/ai-admin/stream`) force `runtime='nodejs'`. |
| Persistence | Postgres (Neon) via Drizzle ORM | Schemas under `src/lib/db/schema*.ts`; server context exposes `ctx.db`. |
| Vector Store | Pinecone | Accessed through `PineconeService`; embeddings via OpenAI `text-embedding-3-large`. |
| File Storage | Local `uploads/` during dev, AWS S3 (via `knowledge-base/storage`) in prod | Document metadata stored in `documents` table. |
| AI Providers | OpenAI (chat + embeddings + Whisper), Anthropic optional | AI Admin + AGI rely on GPT-4o/4-turbo; voice uses Whisper + GPT-4o-mini. |
| Payments | Stripe Checkout + webhooks | `/api/webhooks/stripe` keeps `subscriptions` table in sync. |
| Email | Resend | Password reset + onboarding emails. |
| Monitoring | Sentry, custom debugger (`lib/debugger`), health endpoints | `/api/debugger` and `/api/health/*` expose status JSON. |

## 4. Component Breakdown

| Component | Location | Responsibility |
| --- | --- | --- |
| **App Router UI** | `src/app` | Auth pages, dashboard suite, workflow canvas, knowledge browser. |
| **AGI Service** | `src/lib/agi/*` | Conversation + memory services, emotional & creative reasoning, REST endpoints `/api/agi/*`. |
| **AI Admin Service** | `src/lib/ai-admin/*` | Codebase analysis, context building, patch generation/validation, GitHub + FS apply. |
| **Workflow Engine** | `src/lib/workflow-engine` | Compiles workflow JSON into executable steps, logs to `executions`. |
| **Document Pipeline** | `src/app/api/documents/*`, `DocumentProcessor`, `PineconeService` | Upload validation, text extraction, chunking, embedding, metadata persistence. |
| **Subscriptions & Usage** | `src/lib/subscription/*`, `src/app/api/monitoring/metrics` | Plan metadata, usage tracking, admin metrics, Stripe integration. |
| **Voice Command Service** | `src/app/api/voice/route.ts` | Whisper transcription → GPT command parsing → agent execution or analytics fetch. |
| **tRPC Routers** | `src/server/routers/*.ts` | Authoritative domain APIs (auth, agents, workflows, analytics, aiAdmin, settings, subscription, suggestions, execution). |

## 5. Data Contracts

Key relational entities (see `src/lib/db/schema.ts`):

- `users`, `organizations`, `team_members` – multi-tenant identity + roles.
- `agents`, `workflows`, `executions`, `execution_steps` – operational graph of automations.
- `documents`, `document_chunks`, `knowledge_base` – knowledge ingestion metadata.
- `subscriptions`, `usageTracking` (imported from `schema/subscriptions`) – billing state + quota counters.
- `aiPatches`, `aiConversations`, `agiMemories` – AI Admin + AGI persistence.
- `userSuggestions`, `alerts`, `usageLogs` – insights and telemetry.

Data models favor JSONB columns for configs and dynamic metadata while critical keys stay normalized (UUID PKs, timestamp auditing).

## 6. External Integrations

| Service | Usage | Notes |
| --- | --- | --- |
| OpenAI Chat/Embeddings/Whisper | AGI, AI Admin, Voice, Pinecone embeddings | API keys loaded lazily to avoid build errors. |
| Pinecone | Semantic search for document chunks | Namespaces filtered per `userId`. |
| Stripe | Checkout, billing portal, subscription events | Webhook monitors via `WebhookMonitor`. |
| Resend | Transactional email (welcome, password reset) | Fire-and-forget to avoid blocking auth routes. |
| GitHub | AI Admin GitOps | Optional; direct commits or PR creation via `GitHubService`. |
| Sentry | Error monitoring | Configured in `sentry.*.config.ts`, DSN optional but recommended. |

## 7. Runtime Behavior

1. **Auth** – `authRouter` handles signup/login with bcrypt + JWT. `extractTokenFromRequest` secures App Router handlers and SSE streaming endpoints.
2. **AGI loop** – `/api/agi/process` verifies subscription usage, applies rate limits, then calls `EnhancedAGICore.processInput`. Memory + conversation records are persisted automatically.
3. **AI Admin patching** – Admin tRPC mutation invokes `AIAdminAgent.generatePatch` (context builder + optional GitHub context). Patches stored via `patchStorage` and later applied via FS or GitHub commit.
4. **Document ingestion** – `/api/documents/upload` streams to disk/S3, queues `processDocumentAsync` to extract text, chunk, embed, and update DB status.
5. **Voice commands** – `/api/voice` transcribes, interprets into structured command (`respond`, `get_dashboard_metrics`, `run_agent`), executes, and returns telemetry.
6. **Monitoring** – `/api/monitoring/metrics` surfaces subscription health; `/api/debugger` exposes appMonitor health/errors; `/api/health/*` used for liveness.

Think of these flows like conveyor belts in a factory: each station (route handler) consumes an item, enriches it via domain services, and hands it to the next station or data store.

## 8. Non-Functional Requirements

- **Performance** – Keep AGI + AI Admin responses <3s median by caching context, chunking streaming responses, and using background doc processing.
- **Security** – Enforce JWT on every protected API, admin-only procedures check DB role, secrets stay server-side. Sensitive routes (uploads, voice) validate file types/sizes.
- **Reliability** – Stripe webhook logs via `WebhookMonitor`, health endpoints test DB + subsystems, AGI/AI Admin include fallback responses.
- **Scalability** – Stateless App Router + tRPC; vertical services (Pinecone, Neon, S3) scale independently. Usage throttling prevents noisy neighbors.
- **Compliance** – PII limited to `users` table; logs avoid storing raw secrets. Document storage path sanitized (`sanitizedName`).

## 9. Deployment & Operations

- **Environments** – Local dev (`npm run dev`), Preview (Vercel), Production (Vercel). `.env.local` mirrors `docs/ENVIRONMENT-VARIABLES.md`.
- **Build/Test Commands**
  - `npm run lint` – ESLint 9 flat config.
  - `npm run build` – Next static + server build.
  - `npm run test` – Playwright e2e smoke.
  - `npm run health:check` – TSX script hitting core services.
- **Database** – Drizzle migrations (`drizzle-kit`) managed via `npm run db:generate` + `npm run db:push`.
- **Monitoring SOP** – Sentry for runtime errors, `/api/monitoring/metrics` for subscription anomalies, `appMonitor` for debugger UI.
- **Incident Response** – AI Admin can generate remediation patches; manual override via `upgrade-admin` route (secret-protected) if roles need escalation quickly.

## 10. Open Questions / Future Work

- Queue-backed document processing for large files.
- Multi-tenant Pinecone namespaces per organization instead of per user.
- Automated AI Admin smoke tests post-patch (currently manual).
- Dedicated worker for subscription usage resets instead of per-request checks.

