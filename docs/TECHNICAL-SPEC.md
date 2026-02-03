# Apex Agents Technical Specification

**Status:** Approved for implementation  
**Last updated:** 2025-11-14

## 1. System Overview
Apex Agents is a multi-tenant AI agent management platform built on Next.js 14 (App Router) with a typed full-stack (TypeScript, tRPC, Drizzle ORM). The platform provides:
- Agent creation, execution, and lifecycle tracking
- Workflow orchestration across multiple agents
- AGI-grade conversational interface with long-term memory
- Knowledge ingestion pipeline backed by Pinecone vector search
- AI Admin co-pilot for code changes and operational debugging
- Subscription management (Stripe) and voice command interface

## 2. Product Capabilities
| Area | Description | Primary Modules |
| --- | --- | --- |
| Agent Ops | CRUD, capability config, execution history, swarm coordination | `src/server/routers/agents`, `src/lib/ai/agents`, `src/components/agent-wizard` |
| Workflow Automation | Drag-and-drop workflow builder, execution monitoring, error handling | `src/app/dashboard/workflows`, `src/lib/workflow-engine`, `src/server/routers/workflows` |
| AGI Console | Conversational UI, enhanced reasoning, episodic memory | `src/lib/agi/enhanced-core`, `app/api/agi/process` |
| Knowledge Base | Secure upload, chunking, semantic search | `app/api/documents/*`, `src/lib/document-processor`, `src/lib/pinecone-service` |
| AI Admin & Debugger | SSE streaming assistant, patch generator, runtime health monitor | `app/api/ai-admin/stream`, `app/api/debugger`, `src/lib/ai-admin/*`, `src/lib/debugger/*` |
| Voice Commands | Whisper transcription + command execution bridge + OpenAI TTS replies | `app/api/voice`, `src/components/VoiceCommandPanel` |
| Subscriptions & Monitoring | Stripe checkout, webhook ingest, usage meters, upgrade workflows | `app/api/webhooks/stripe`, `src/lib/subscription/*`, `app/api/monitoring/metrics` |

## 3. Functional Requirements
1. **Authentication & Authorization**
   - JWT-based auth with bearer tokens extracted inside API routes and tRPC context.
   - Role gating (`user`, `admin`, `owner`) enforced in subscription/monitoring routes.
2. **Agent Lifecycle**
   - Agents persist in `agents` table with JSON config, capabilities, and constraints.
   - Executions log inputs/outputs in `executions` and `execution_steps`.
   - Bulk actions (status updates, deletions) succeed atomically per record with error tracking.
3. **Workflow Builder**
   - Workflows capture triggers, step graph, error policies, and version metadata.
   - Workflow executions stream status to frontend (socket/poll-based) and store metrics.
4. **Knowledge Operations**
   - Upload endpoint accepts PDF/DOCX/TXT/MD up to 50 MB with rate limiting.
   - Processor extracts text, chunks, embeds via Pinecone, and updates document metadata.
   - Search endpoint groups results per document and enforces user-level isolation.
5. **AGI/AI Admin**
   - `/api/agi/process` enforces subscription quota + rate limit before invoking `EnhancedAGICore`.
   - AI Admin SSE endpoint streams either conversational chunks or patch metadata and writes history.
6. **Voice Interface**
   - Accepts audio form-data, transcribes with Whisper, turns NL into structured commands, and executes metrics queries or agent runs.
   - Generates conversational summaries and synthesizes speech so the app can respond verbally.
7. **Monitoring & Billing**
   - `/api/monitoring/metrics` exposes subscription health (GET JSON/POST text report).
   - Stripe webhook keeps `subscriptions` table in sync with checkout, payment, and lifecycle events.

## 4. Non-Functional Requirements
- **Performance:** API endpoints should respond <500 ms p95 excluding external API latency; uploads and AI calls may exceed but must stream status.
- **Scalability:** Stateless API routes run on Vercel Edge/Node; database is Neon Postgres; Pinecone scales vector workloads; S3/local storage horizon for uploads.
- **Reliability:** Health endpoints (`/api/health`, `/api/health/db`) monitored; debugger exposes component-level health for incident response.
- **Security:** All sensitive routes require bearer token; admin-specific routes validate secret (`ADMIN_UPGRADE_SECRET`) or role; Stripe webhook validates signature.
- **Compliance:** PII (emails, tokens) stored encrypted at rest via managed Postgres; uploads sanitized before persistence.
- **Observability:** Sentry hooks via `@sentry/nextjs`; custom monitors in `src/lib/monitoring` record webhook metrics and subscription anomalies.

## 5. Architecture Summary
- **Presentation Layer:** Next.js App Router pages under `src/app`, Tailwind UI components, Zustand/Context for client state, TanStack Query for data fetching.
- **API Layer:** 
  - RESTful handlers in `app/api/*` for file uploads, AI calls, monitoring, health, webhooks.
  - tRPC router (`src/server/routers/_app.ts`) for strongly-typed dashboard interactions.
- **Domain Layer:** Reusable services inside `src/lib` (AGI core, AI Admin, document pipeline, subscription enforcement, monitoring, integrations).
- **Data Layer:** Drizzle ORM models in `src/lib/db/schema.ts` and `src/server/db/schema/documents.ts`; Neon Postgres + Pinecone vector store; optional S3/local uploads.
- **Background Work:** Async document processing (chunk + embed) triggered within API route; usage tracking via `SubscriptionService`.

## 6. Data Design Highlights
| Table | Purpose | Key Columns |
| --- | --- | --- |
| `users` | Identity and role metadata | `role`, `subscriptionTier`, `preferences`, `apiKey` |
| `agents` | Agent definitions/config | `type`, `config`, `capabilities`, `status` |
| `workflows` | Orchestration graphs | `trigger`, `steps`, `conditions`, `status` |
| `executions` | Agent/workflow runs | `status`, `inputData`, `outputData`, `errorMessage`, `durationMs` |
| `knowledge_base` + `documents` | Knowledge ingestion | `sourceType`, `summary`, `embeddingStatus`, `metadata` |
| `document_chunks` | Pinecone references | `chunkIndex`, `embedding`, `metadata` |
| `user_settings`, `api_keys` | Tenant preferences & keys | `timezone`, `defaultModel`, `environment` |
| `subscriptions` | Stripe bridge | `stripeSubscriptionId`, `plan`, `cancelAtPeriodEnd` |
| `alerts`, `usage_logs` | Monitoring/analytics | `severity`, `tokensUsed`, `costUsd` |

## 7. External Integrations
| Service | Usage | Code Surface |
| --- | --- | --- |
| OpenAI (Chat, Whisper) | AGI reasoning, AI Admin, voice transcription | `src/lib/agi`, `app/api/ai-admin/stream`, `app/api/voice` |
| Pinecone | Vector storage/search for documents | `src/lib/pinecone-service`, `app/api/documents/search` |
| Stripe | Billing, subscriptions, checkout webhooks | `src/lib/stripe`, `app/api/webhooks/stripe`, `src/lib/subscription` |
| Resend | Transactional email (invites, alerts) | `src/lib/email/resend` |
| AWS S3 / local uploads | Persistent document storage | `app/api/documents/upload`, `src/lib/document-processor` |
| Sentry | Error tracing | `sentry.*.config.ts`, `src/lib/debugger` |

## 8. Deployment & Operations
- **Environments:** Local (`.env.local`), Preview (Vercel preview), Production (Vercel prod + managed Neon/Pinecone).
- **Build pipeline:** `pnpm lint && pnpm build` enforced via CI; Playwright regression optional on demand.
- **Runtime configs:** 
  - `OPENAI_API_KEY`, `PINECONE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `ADMIN_UPGRADE_SECRET`, `DATABASE_URL`.
  - Feature flags / rate limits configured in `src/lib/rate-limit.ts`.
- **Monitoring hooks:** `/api/monitoring/metrics` for subscription health, `/api/debugger` for app status, `WebhookMonitor` for Stripe reliability.

## 9. Acceptance Criteria
1. All documented endpoints respond per spec with auth + rate limit enforcement.
2. Document uploads result in Pinecone embeddings discoverable via `/api/documents/search`.
3. AI Admin SSE stream handles both `chat` and `patch` modes with persistent transcript.
4. Voice commands can run at least `respond` and `get_dashboard_metrics` flows end-to-end.
5. README and docs stay synchronized with implementation whenever routers, schema, or dependencies change.

