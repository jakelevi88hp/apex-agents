# Apex Agents Code Module Catalog

This catalog maps major directories and files to their responsibilities so new contributors can find the right entry point quickly.

## 1. Frontend (App Router)

| Path | Purpose | Notes |
| --- | --- | --- |
| `src/app/layout.tsx` | Root layout, metadata, font setup | Wraps providers from `src/components/providers`. |
| `src/app/(auth)/login`, `signup`, `forgot-password`, `reset-password` | Authentication flows | Server components that call `authRouter` mutations. |
| `src/app/dashboard/page.tsx` | Main overview dashboard | Fetches analytics via tRPC, renders cards, charts, and suggestions. |
| `src/app/dashboard/agents/*` | Agent management screens | Interact with `agentsRouter`; uses skeletons from `components/AgentCardSkeleton`. |
| `src/app/dashboard/workflows/*` | Workflow builder & history | Uses `reactflow`, `workflow-builder` components, and `workflowsRouter`. |
| `src/app/dashboard/knowledge/*` | Knowledge base UI | Upload & search forms wired to `/api/documents/*`. |
| `src/app/api/trpc/[trpc]/route.ts` | Client ↔️ server bridge | Invokes `fetchRequestHandler` with `appRouter`; required for all tRPC hooks. |

Support components live under `src/components`:

- `agent-wizard/` – multi-step agent creation UI.
- `workflow-builder/` + `WorkflowCanvas.tsx` – drag/drop workflow editor.
- `DocumentUpload.tsx`, `PDFViewer.tsx`, `SemanticSearchTab.tsx` – knowledge tools.
- `NotificationCenter.tsx`, `SubscriptionBanner.tsx`, `UpgradePrompt.tsx` – account messaging.
- `VoiceCommandPanel.tsx` – mic control that posts to `/api/voice`.

## 2. API Routes (App Router `route.ts`)

| Route | File(s) | Responsibility |
| --- | --- | --- |
| `/api/agi/process` / `/api/agi/status` | `src/app/api/agi/*` | Authenticated AGI processing with usage limits + health info. |
| `/api/ai-admin/stream` | `src/app/api/ai-admin/stream/route.ts` | SSE streaming endpoint for AI Admin chat or patch mode. |
| `/api/documents` | `src/app/api/documents/*.ts` | CRUD, upload validation, Pinecone-backed search, secure download. |
| `/api/voice` | `src/app/api/voice/route.ts` | Whisper transcription + GPT command interpreter + executor. |
| `/api/monitoring/metrics` | `src/app/api/monitoring/metrics/route.ts` | Admin metrics, alerts, and plain-text reports from `SubscriptionMonitor`. |
| `/api/debugger` | `src/app/api/debugger/route.ts` | Health/status/error feeds powered by `appMonitor`. |
| `/api/health` + `/api/health/db` | `src/app/api/health/*` | Lightweight uptime checks (DB connectivity, env info). |
| `/api/webhooks/stripe` | `src/app/api/webhooks/stripe/route.ts` | Handles checkout, subscription, invoice events; logs via `WebhookMonitor`. |
| `/api/upgrade-admin` | `src/app/api/upgrade-admin/route.ts` | Secret-guarded utility to elevate a user to admin (bootstrap only). |

Most routes share helpers:
- `extractTokenFromRequest` + `verifyToken` (JWT).
- `SubscriptionService.canUseFeature` + `trackUsage`.
- `rateLimit` presets in `src/lib/rate-limit.ts`.

## 3. tRPC Routers (`src/server/routers`)

| Router | Key Procedures | Notes |
| --- | --- | --- |
| `authRouter` | `signup`, `login`, `me`, `requestPasswordReset`, `resetPassword` | Uses bcrypt + Resend; owner email auto-promoted to admin. |
| `agentsRouter` | `list`, `get`, `create`, `update`, `execute`, `bulkDelete`, `bulkUpdateStatus` | Wraps `AgentFactory` + `executions` logging. |
| `workflowsRouter` | `list`, `create`, `execute`, `getExecutionStatus`, `getExecutionHistory` | Calls `getWorkflowExecutor`; enforces usage limits. |
| `analyticsRouter` | `getDashboardMetrics`, `getSparklineData`, `getRecentActivity`, `getExecutionStats`, `getAgentPerformance`, `getWorkflowPerformance`, `getExecutionTrend` | Heavy SQL aggregations; reused by dashboard + voice analytics command. |
| `aiAdminRouter` | Conversation CRUD, `chat`, `generatePatch`, `applyPatch`, `rollbackPatch`, GitHub helpers, file uploads | Guards admin role; streams via subscription where needed. |
| `executionRouter` | `execute`, `getHistory`, `getById` | Thin wrapper over `executeAgent` helpers. |
| `settingsRouter` | User settings, API keys, model config, billing info, team management | Touches `userSettings`, `apiKeys`, `teamMembers`, and Stripe customer portal. |
| `subscriptionRouter` | `getCurrent`, `getUsage`, `canUseFeature`, `getPlans`, `createCheckoutSession`, `cancelSubscription`, `getCustomerPortal` | Talks to Stripe helpers + `SubscriptionService`. |
| `suggestionsRouter` | `list`, `generate`, `updateStatus` | Uses `SuggestionService` for dashboard coaching. |

`src/server/trpc.ts` wires context (db + userId) and exports `router`, `publicProcedure`, `protectedProcedure`.

## 4. Domain Services (`src/lib/**`)

| Module | Highlights |
| --- | --- |
| `lib/agi/*` | `EnhancedAGICore` orchestrates emotional analysis, reasoning, creativity, and memory persistence (`agiConversationService`, `agiMemoryService`). |
| `lib/ai-admin/*` | `AIAdminAgent` + context builders, GitHub service, patch validation/storage, request interpreter, and file context gatherer. |
| `lib/agent-execution/executor.ts` | Executes a single agent run with telemetry, used by API and workflows. |
| `lib/workflow-engine` | Parses workflow JSON, coordinates step execution, writes to `executions` + `execution_steps`. |
| `lib/document-processor.ts` | Handles PDF/DOCX/TXT parsing, chunking, summary generation. |
| `lib/pinecone-service.ts` | Handles embedding generation and vector upserts/search/deletes. |
| `lib/subscription/*` | Plan metadata, usage tracking, health monitoring (`SubscriptionMonitor`). |
| `lib/monitoring/*` | `appMonitor`, `WebhookMonitor`, `SubscriptionMonitor` for diagnostics. |
| `lib/rate-limit.ts` | KV-backed (?) token bucket per preset (AGI, uploads, health). |
| `lib/notifications`, `lib/email` | Wrap Resend + notification preferences. |
| `lib/stripe/stripe.ts` | Stripe SDK helpers (checkout, portal, ensure products). |
| `lib/auth/jwt.ts` | JWT sign/verify + helpers for App Router handlers. |

## 5. Data & Persistence

- **Drizzle schema** lives in `src/lib/db/schema.ts` plus sub-folders for AI + subscriptions. Relations defined via `relations`.
- **Database client** exported from `src/lib/db/index.ts` and injected into tRPC context + services.
- **Migrations** stored in `/drizzle` and executed with `drizzle-kit`.

## 6. Testing & Tooling

| Path | Use |
| --- | --- |
| `tests/` | Stress tests (`tests/stress`), debugging suites (`tests/debug`). |
| `scripts/` | Operational TS scripts (seed, security audit, debugger setup, production tests). |
| `playwright.config.ts` | Playwright e2e entry. |

## 7. Mental Model

Picture the repository as a layered cake:
1. **Presentation layer** – App Router + components.
2. **API layer** – App Router handlers for REST, tRPC routers for RPC.
3. **Service layer** – AGI, AI Admin, workflows, documents, subscriptions.
4. **Integration layer** – Drizzle/Postgres, Pinecone, Stripe, OpenAI, S3, GitHub.

Each slice exposes TypeScript classes or functions with strong typing and JSDoc so you can compose features without reaching across layers.

