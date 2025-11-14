# Apex Agents Technical Specification
_Last updated: 2025-11-14_

## Mission-Critical Outcomes
- Provide a hosted control plane for creating, executing, and monitoring autonomous AI agents plus multi-step workflows.
- Guarantee explainability by persisting execution traces, AGI thoughts, and subscription usage in PostgreSQL via Drizzle ORM (`src/lib/db/schema.ts`).
- Enforce tenant safety through JWT auth (`src/lib/auth/jwt.ts`), rate limiting (`src/lib/rate-limit.ts`), and subscription guardrails (`src/lib/subscription/service.ts`).
- Maintain knowledge fidelity by funneling documents through `DocumentProcessor` → `PineconeService` vector storage before search endpoints expose them.

## Architecture Snapshot
| Layer | Location | Responsibilities | Key Dependencies |
| --- | --- | --- | --- |
| **Experience** | `src/app`, `src/components` | Next.js App Router UI, RSC-first pages plus client islands for dashboards, onboarding, pricing, and PWA prompts. | Tailwind CSS, React 18, Zustand/query hooks. |
| **API Gateway** | `src/app/api/**`, `src/app/api/trpc/[trpc]/route.ts` | REST endpoints for AGI, AI Admin streaming, documents, health, voice, monitoring, Stripe webhooks, plus tRPC router exposure. | Next.js Route Handlers, `@trpc/server`, `fetchRequestHandler`. |
| **Domain Services** | `src/lib/**`, `src/server/**` | AI/AGI orchestration (`lib/agi`, `lib/ai-admin`), agent execution (`lib/agent-execution/executor.ts`), workflow engine (`lib/workflow-engine/executor.ts`), subscription enforcement, monitoring, notifications. | OpenAI SDK, Pinecone client, Stripe SDK, Drizzle ORM. |
| **Data Layer** | `src/lib/db/**`, `drizzle/**` | Strongly typed Postgres schema, migrations, meta. | Neon/PostgreSQL, Drizzle ORM. |
| **Integrations** | `src/lib/stripe`, `src/lib/pinecone-service.ts`, `src/lib/ai-admin/github-service.ts` | Payments, vector search, GitHub patching, S3-style uploads (`/uploads`). | Stripe, Pinecone, AWS SDK. |

## Domain Capabilities
### Autonomous Agent Lifecycle
- `AgentFactory` + concrete agent classes in `src/lib/ai/agents.ts` encapsulate execution logic (research, analysis, writing, code, decision, etc.).
- CRUD + execution APIs live in `src/server/routers/agents.ts`; they record executions in `executions` + `executionSteps`.
- `executeAgent` (`src/lib/agent-execution/executor.ts`) standardizes OpenAI calls, persistence, and streaming output.

### Workflow Orchestration
- `WorkflowExecutor` (`src/lib/workflow-engine/executor.ts`) hydrates workflow steps, evaluates decisions, and chains agent outputs.
- `workflowsRouter` exposes authoring + versioning while analytics queries feed dashboard sparklines.

### AGI + AI Admin
- `EnhancedAGICore` (`src/lib/agi/enhanced-core.ts`) stitches memory, reasoning, creativity, and emotional analysis for `/api/agi/process`.
- `AIAdminAgent` (`src/lib/ai-admin/agent.ts`) powers `/api/ai-admin/stream` for patch-mode and chat-mode conversations; integrates GitHub + patch validation.

### Knowledge & Search
- `/api/documents/*` routes manage uploads, search, and downloads with JWT guardrails and rate limiting.
- `DocumentProcessor` normalizes PDF/DOCX/TXT/MD content before chunking; `PineconeService` indexes and retrieves per-user embeddings.

### Billing, Monitoring, & Voice
- `/api/webhooks/stripe` synchronizes subscriptions, while `SubscriptionService` enforces plan limits and usage tracking.
- `/api/monitoring/metrics` + `SubscriptionMonitor` power operator dashboards; `/api/debugger` surfaces runtime health.
- `/api/voice` pipelines Whisper transcription + GPT reasoning + agent execution to support hands-free control.

## Data Contracts (PostgreSQL via Drizzle)
| Table | Purpose | Notable Columns |
| --- | --- | --- |
| `users` | Auth principals, subscription metadata, preferences. | `role`, `subscriptionTier`, `stripeCustomerId`, `preferences`. |
| `agents`, `agent_tools` | Agent definitions + tool configs. | `type`, `config`, `capabilities`, `constraints`. |
| `workflows`, `executions`, `execution_steps` | Workflow definitions and run telemetry. | `steps` JSON, `status`, `durationMs`, `tokensUsed`. |
| `documents`, `document_chunks`, `knowledge_base` | Uploaded assets + vector metadata. | `embeddingStatus`, `chunkIndex`, `vectorNamespace`. |
| `subscriptions`, `usage_tracking` | Plan enforcement + quota telemetry. | `plan`, `trialEndsAt`, `feature`, `limit`, `count`. |
| `verifications`, `alerts`, `user_suggestions` | Trust, monitoring, user feedback. | `confidenceScore`, `severity`, `impactScore`. |

## External Systems & Contracts
- **OpenAI**: Chat Completions (`gpt-4o`, `gpt-4-turbo`, `gpt-4o-mini`), Whisper transcription, and Embeddings (`text-embedding-3-large`). All calls are server-side through lazily instantiated SDK clients.
- **Pinecone**: Namespaced vector index per environment for semantic search. Each chunk stores `userId` to enforce tenancy filters.
- **Stripe**: Checkout + billing management with webhook reconciliation. `WebhookMonitor` captures latency/outcome for observability.
- **Storage/Git**: Local `/uploads` directory for file staging; optional GitHub integration for AI Admin patch application.

## Quality Attributes
- **Performance**: Target <300 ms median tRPC latency and <2 s AGI response for short prompts. Rate limiting presets (`RateLimitPresets`) shield expensive paths (`/api/agi/process`, `/api/documents/upload`).
- **Reliability**: Health endpoints (`/api/health`, `/api/health/db`) and debugger monitors expose readiness. Execution records capture failure modes for replay.
- **Security**: JWT extracted via `extractTokenFromRequest`, HTTP-only cookies or Authorization headers. Sensitive routes additionally verify admin role in database (`monitoring/metrics`). Secrets pulled from `process.env`.
- **Observability**: `appMonitor`, `SubscriptionMonitor`, and usage logs feed dashboards. All long-running tasks log start/end plus duration.
- **Scalability**: Stateless Next.js API handlers behind Vercel/Node cluster; background heavy work (document processing, AI admin patches) runs via async tasks to avoid blocking request threads.

## Deployment & Environments
- **Local Dev**: `npm install`, copy `.env.example`, run `npm run db:push` (Drizzle) and `npm run dev`.
- **Preview/Prod**: `npm run build` → `next start`. Database migrations managed through `drizzle-kit` migrations committed under `/drizzle/migrations`.
- **Background Storage**: `/uploads` must be writable (or replaced with S3). Ensure Pinecone + OpenAI keys exist per environment.
- **Feature Flags**: Environment variables control AI models (`AI_ADMIN_MODEL`, `OPENAI_API_KEY`), GitHub integration, Stripe pricing.

## Testing & Quality Gates
- **Static Analysis**: `npm run lint` (ESLint 9). Tailwind classes validated via CI style rules.
- **Unit/Component Tests**: `npm run test` (Playwright) plus targeted tRPC tests under `tests/`.
- **Operational Tests**: `npm run health:check`, `npm run stress:test`, `npm run security:audit`, and `npm run test:production` for smoke validation post-deploy.
- **Release Checklist**: Ensure docs updated (`docs/ARCHITECTURE.md`, `docs/API-REFERENCE.md`), migrations applied, Stripe webhook secret configured, and monitoring endpoints returning healthy state.

## Backlog & Open Questions
- Automate Pinecone cleanup on document deletion (track chunk IDs per document).
- Harden `/api/voice` against long-running uploads (streaming multipart).
- Add tracing/metrics export (OpenTelemetry) to align with observability roadmap.
- Expand automated test coverage for `AIAdminAgent` patch generation and `WorkflowExecutor` edge cases.

