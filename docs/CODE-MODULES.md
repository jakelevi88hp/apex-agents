# Apex Agents Code Modules
_Last updated: 2025-11-14_

| Module | Location | Responsibilities | Key Exports |
| --- | --- | --- | --- |
| **App Router UI** | `src/app`, `src/components` | Server-component-first UI, dashboard charts, onboarding forms, pricing pages, auth flows. | Pages under `app/**/page.tsx`, shared components (e.g., `VoiceCommandPanel`, `WorkflowCanvas`). |
| **tRPC Router** | `src/server/routers/*.ts` | Business RPC layer for agents, workflows, analytics, subscriptions, AI Admin, suggestions. | `appRouter`, `agentsRouter`, `workflowsRouter`, `analyticsRouter`, etc. |
| **AGI Stack** | `src/lib/agi/**` | Enhanced AGI reasoning, conversation, memory, creativity engines powering `/api/agi/*`. | `EnhancedAGICore`, `agiCore`, `agiMemoryService`. |
| **AI Admin** | `src/lib/ai-admin/**` | Patch automation agent, context gathering, GitHub integration, streaming chat support. | `AIAdminAgent`, `ContextBuilder`, `patchStorage`, `RequestInterpreter`. |
| **Agent Runtime** | `src/lib/ai/agents.ts`, `src/lib/agent-execution/executor.ts` | Concrete agent implementations plus execution orchestrator for manual or workflow-driven runs. | `AgentFactory`, `executeAgent`, `executeAgentStream`. |
| **Workflow Engine** | `src/lib/workflow-engine/executor.ts` | Step orchestration across agent, condition, loop, and parallel nodes with analytics persistence. | `WorkflowExecutor`, `getWorkflowExecutor`. |
| **Knowledge Ops** | `src/app/api/documents/**`, `src/lib/document-processor.ts`, `src/lib/pinecone-service.ts` | Document upload, parsing, chunking, vector storage, search, and download. | Route handlers, `DocumentProcessor`, `PineconeService`. |
| **Subscription & Billing** | `src/lib/subscription/**`, `src/app/api/webhooks/stripe/route.ts` | Plan limits, usage tracking, checkout + webhook sync, monitoring. | `SubscriptionService`, `SubscriptionMonitor`, Stripe webhook handler. |
| **Monitoring & Debugging** | `src/lib/debugger/**`, `src/lib/monitoring/**`, `src/app/api/debugger` | Runtime health checks, error logging, admin metrics. | `appMonitor`, `WebhookMonitor`, `/api/debugger` handlers. |

---

## 1. App Router & UI Layer
- **Composition**: Server components by default (`app/layout.tsx`, `app/page.tsx`); client components only when hooks or browser APIs are needed (`'use client';` at top).
- **Styling**: Tailwind CSS utility classes (`src/app/globals.css`) with gradient-heavy dashboard theme.
- **Notable Components**:
  - `VoiceCommandPanel` triggers `/api/voice`.
  - `WorkflowCanvas` + `components/workflow-builder/*` manage drag/drop nodes using React Flow.
  - `Sidebar`, `NotificationCenter`, `UsageDisplay` share App Router context.
- **State/Data**: `trpc` hooks (`src/lib/trpc/client.ts`) fetch analytics, agents, workflows. React Query caching handles revalidation.

## 2. tRPC Routers
- Central router defined in `src/server/routers/_app.ts`; individual routers scoped per domain.
- **Auth Router** (`auth.ts`): login/logout, session introspection.
- **Agents Router** (`agents.ts`): CRUD, execution, bulk operations. Uses `AgentFactory` + `executeAgent`.
- **Workflows Router** (`workflows.ts`): definitions, execution telemetry, versioning.
- **Analytics Router** (`analytics.ts`): dashboard metrics, sparklines, recent activity.
- **AI Admin Router** (`ai-admin.ts`): conversation history, patch jobs, queue introspection.
- **Subscription Router** (`subscription.ts`): plan lookups, upgrade/cancel flows.
- **Suggestions Router** (`suggestions.ts`): surfaces `user_suggestions` data for UI prompts.
- All protected procedures use `protectedProcedure` from `src/server/trpc.ts`, ensuring `ctx.userId` is set or throwing `UNAUTHORIZED`.

## 3. AGI Stack (`src/lib/agi`)
- **Core Types**: `AGIThought`, `AGIResponse`, `AGIConfig`.
- **EnhancedAGICore Workflow**:
  1. Validates/creates conversation via `agiConversationService`.
  2. Stores working memory snapshots with `agiMemoryService`.
  3. Runs `AdvancedReasoningEngine`, `EmotionalIntelligence`, and `CreativityEngine`.
  4. Persists assistant responses + consciousness states for audit.
- **API Surface**:
  - `/api/agi/status`: uses `agiCore.getStatus()`.
  - `/api/agi/process`: instantiates `EnhancedAGICore` with user context, handles rate limiting and subscription usage checks.

## 4. AI Admin Automation (`src/lib/ai-admin`)
- **AIAdminAgent**: Entry point exposing `chat`, `generatePatch`, `applyPatch`, and context helpers.
- **Context Gathering**:
  - `ContextBuilder` scans project tree + embeddings to fetch relevant files.
  - `ContextGatherer` (toggleable) uses GitHub service for repository-wide search when running in production.
- **Patch Lifecycle**:
  1. `RequestInterpreter` structures natural language commands.
  2. `patchStorage` records generated diffs per session.
  3. `PatchValidator` ensures generated patches meet safety rules before applying.
  4. Optional GitHub integration (`github-service.ts`) opens PRs/commits when tokens supplied.
- **Streaming Endpoint**: `/api/ai-admin/stream` uses SSE to send status + patch details; supports `mode=chat` and `mode=patch`.

## 5. Agent Runtime & Workflow Engine
- **Agent Classes** (in `src/lib/ai/agents.ts`): `ResearchAgent`, `AnalysisAgent`, `WritingAgent`, `CodeAgent`, `DecisionAgent`, etc., all inheriting from `BaseAgent`.
- **Execution Telemetry**:
  - `executeAgent` persists rows in `executions` table with input/output JSON, tokens, durations.
  - Streaming variant yields incremental text for live UIs.
- **WorkflowExecutor**:
  - Executes DAG-like `steps` array from `workflows.steps` JSON.
  - Supports agent nodes, conditional branching, loops, and parallel fan-out.
  - Records per-step entries in `executionSteps`, updates workflow stats (count, lastExecution, duration).

## 6. Knowledge & Document Intelligence
- **Upload Handler** (`/api/documents/upload`):
  - JWT-authenticated, rate-limited to 10 uploads/hour.
  - Saves file to `/uploads`, inserts `documents` entry, triggers background processing.
- **Processing Pipeline**:
  - `DocumentProcessor` normalizes text (PDF via `pdf-parse`, DOCX via `mammoth`, plaintext).
  - `chunkText` + `PineconeService.upsertDocumentChunks` embed and index segments with metadata.
  - Database updated with summary, embedding references, and chunk counts.
- **Search** (`/api/documents/search`):
  - Generates embedding for query, filters Pinecone namespace by `userId`, groups matches by `documentId`.
  - Returns sorted results with chunk excerpts and scores.
- **Download**: `/api/documents/[id]/download` streams stored file, verifying user ownership.

## 7. Subscription, Billing, and Monitoring
- **SubscriptionService**:
  - Initializes trials, upgrades plans, enforces feature limits (agents, workflows, AGI messages, storage, API calls).
  - `canUseFeature` + `trackUsage` guard AGI routes and heavy operations.
- **Stripe Webhook Handler** (`/api/webhooks/stripe`):
  - Handles checkout completion, subscription lifecycle, invoice payment success/failure.
  - Persists status transitions, period boundaries, cancellation flags.
  - Logs via `WebhookMonitor` with processing duration + errors.
- **Monitoring APIs**:
  - `/api/monitoring/metrics` (GET) returns `SubscriptionMonitor.getMetrics()`, health, expiring trials, limit alerts, recent activity.
  - POST variant returns a plain-text report for automation bots.
  - `/api/debugger` exposes health checks, error stats, unresolved incidents; POST allows manual error injection for testing.

## 8. Voice Control Surface
- `/api/voice` accepts audio form-data, transcribes via Whisper (`gpt-4o-mini-transcribe`), interprets commands (respond, metrics, run_agent), and either fetches dashboard metrics or triggers agent execution.
- Guards:
  - JWT authentication via `extractTokenFromRequest`.
  - `commandSchema` (Zod) ensures model output is structured before executing actions.
  - Database queries verify agent ownership prior to execution.

## 9. Extensibility Guidelines
- **Add a new API capability**: create route handler under `src/app/api/<feature>` or add a tRPC procedure. Reuse `protectedProcedure` to enforce auth; centralize validation via Zod.
- **Introduce a new agent type**: extend `BaseAgent`, register in `AgentFactory`, update `agentsRouter` validation enum, and document in this file plus `docs/TECHNICAL-SPEC.md`.
- **Augment workflows**: expand `WorkflowExecutor.executeStep` with new case, ensuring telemetry records step type + output. Update dashboard UI to visualize new statuses if needed.
- **Telemetry**: prefer writing aggregated metrics to `usage_tracking` or `alerts` tables so monitoring endpoints can surface them automatically.

