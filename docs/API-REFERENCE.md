# Apex Agents API Reference
_Last updated: 2025-11-14_

This document summarizes every public API surface exposed by the Apex Agents platform: typed tRPC procedures for first-party clients and REST/streaming endpoints for external automation or system integrations.

---

## Base URLs
| Surface | URL | Notes |
| --- | --- | --- |
| Next.js App Router REST | `https://<host>/api/*` | Route handlers defined under `src/app/api/**/route.ts`. |
| tRPC Router | `https://<host>/api/trpc` | Multiplexed endpoint powered by `fetchRequestHandler` in `src/app/api/trpc/[trpc]/route.ts`. |
| Local Development | `http://localhost:3000` | Same paths; ensure `.env.local` contains valid secrets. |

---

## Authentication & Authorization
- JWT tokens (HS256) generated server-side are required for all protected routes.  
- Tokens can be sent via `Authorization: Bearer <token>` or HttpOnly cookie. Utilities `extractTokenFromRequest` and `verifyToken` in `src/lib/auth/jwt.ts` implement shared logic.  
- Role checks (e.g., admin-only AI Admin endpoints) query the `users` table through Drizzle before fulfilling the request.

## Rate Limiting & Plan Quotas
- `src/lib/rate-limit.ts` enforces per-route ceilings (e.g., `RateLimitPresets.AGI` = 20 req/min). Responses include `X-RateLimit-Remaining` and `Retry-After` when throttled.
- Subscription usage is tracked via `SubscriptionService` (`src/lib/subscription/service.ts`). High-cost actions (AGI messages, agent/workflow creation, document uploads) call `canUseFeature` before proceeding and `trackUsage` afterwards. Expect HTTP 403 with `{ upgradeRequired: true }` when limits are exceeded.

## Error Format
```json
{
  "error": "human readable message",
  "code": "OPTIONAL_ERROR_CODE",
  "details": { "context": "optional metadata" }
}
```
| HTTP Code | Meaning |
| --- | --- |
| 400 | Validation failed (Zod errors) |
| 401 | Missing or invalid JWT |
| 403 | Feature/plan restriction or admin-only route |
| 404 | Record not found or not owned by caller |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error (captured by `appMonitor`) |

---

## tRPC Routers
tRPC is the standard interface for first-party React clients. All routers live in `src/server/routers/*.ts` and are composed via `appRouter`. The client helper `src/lib/trpc/client.ts` provides hooks.

| Router | File | Description |
| --- | --- | --- |
| `auth` | `src/server/routers/auth.ts` | Login/logout, session metadata. |
| `agents` | `src/server/routers/agents.ts` | CRUD + execution APIs for autonomous agents. |
| `workflows` | `src/server/routers/workflows.ts` | Workflow design, execution, telemetry. |
| `aiAdmin` | `src/server/routers/ai-admin.ts` | AI Admin conversations, patch records, file context. |
| `analytics` | `src/server/routers/analytics.ts` | Dashboard metrics, sparklines, recent activity. |
| `execution` | `src/server/routers/execution.ts` | Low-level execution inspection utilities. |
| `settings` | `src/server/routers/settings.ts` | User preferences. |
| `subscription` | `src/server/routers/subscription.ts` | Plan lookups, upgrade, cancellation. |
| `suggestions` | `src/server/routers/suggestions.ts` | User suggestion feed surfaced on dashboard. |

### Agents Router Highlights (`src/server/routers/agents.ts`)
| Procedure | Type | Auth | Description |
| --- | --- | --- | --- |
| `agents.list` | query | required | Returns all agents owned by current user (filters by `userId`). |
| `agents.create` | mutation | required | Validates payload via Zod (name, type, config) then inserts via Drizzle. Applies `checkUsageLimit('agents')`. |
| `agents.update` | mutation | required | Partial updates; stamps `updatedAt`. |
| `agents.delete` | mutation | required | Removes agent + cascades executions. |
| `agents.execute` | mutation | required | Invokes `AgentFactory` and `executeAgent`. Returns `{ executionId, result }`. |
| `agents.getExecutions` | query | required | Last 50 executions ordered by `startedAt DESC`. |
| `agents.bulkDelete` / `agents.bulkUpdateStatus` | mutation | required | Multi-agent maintenance with best-effort semantics. |

Usage example:
```typescript
const { data: agents } = trpc.agents.list.useQuery();
const execute = trpc.agents.execute.useMutation();
await execute.mutateAsync({ agentId, objective: 'Draft release notes' });
```

### Workflows Router Highlights (`src/server/routers/workflows.ts`)
- `workflows.list/get/create/update/delete`: Manage DAG definitions stored as JSON (nodes + edges).
- `workflows.execute`: Creates an execution record, dispatches to `WorkflowExecutor`, streams results into `executionSteps`.
- `workflows.getExecutionHistory`: Returns run history with status/duration for observability dashboards.

### Analytics Router (`src/server/routers/analytics.ts`)
- `analytics.getDashboardMetrics`: Aggregates agent/workflow counts, execution trend, usage stats.
- `analytics.getSparklineData`: Returns arrays for Recharts visualizations (agents/workflows/executions).
- `analytics.getRecentActivity`: Surfaces recent executions, document ingest events, and subscription actions.

### AI Admin Router (`src/server/routers/ai-admin.ts`)
- `aiAdmin.chat`: Append to AI Admin conversation, using `AIAdminAgent` internally.
- `aiAdmin.generatePatchFromPlainLanguage`: Produces structured patch JSON (files, risks, testing steps).
- `aiAdmin.getExampleRequests` / `aiAdmin.getConversations`: Provide UI seeds and history.

### Subscription & Settings Routers
- `subscription.getPlan`, `subscription.upgrade`, `subscription.cancel`: Wrap `SubscriptionService`.
- `settings.get/update`: Manage notification prefs, MFA flags, feature toggles stored in `user_settings`.

### Suggestions Router
- `suggestions.list`: Returns prioritized backlog from `user_suggestions`.
- `suggestions.resolve`: Marks idea resolved with auditing metadata.

---

## REST & Streaming Endpoints
| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/api/agi/status` | `src/app/api/agi/status/route.ts` | Health/status of AGI components. |
| POST | `/api/agi/process` | `.../agi/process/route.ts` | Executes Enhanced AGI pipeline. |
| POST (SSE) | `/api/ai-admin/stream` | `.../ai-admin/stream/route.ts` | Streaming AI Admin chat/patch responses. |
| GET/POST | `/api/documents` | `.../documents/route.ts` | List documents (GET). |
| POST | `/api/documents/upload` | `.../documents/upload/route.ts` | Multipart upload pipeline. |
| POST | `/api/documents/search` | `.../documents/search/route.ts` | Vector search via Pinecone. |
| GET | `/api/documents/[id]/download` | `.../documents/[id]/download/route.ts` | Download original file. |
| POST | `/api/voice` | `.../voice/route.ts` | Voice command ingestion (Whisper + GPT). |
| GET/POST | `/api/monitoring/metrics` | `.../monitoring/metrics/route.ts` | Admin-only subscription telemetry / reports. |
| GET/POST | `/api/debugger` | `.../debugger/route.ts` | Health + error stats, manual error logging. |
| GET | `/api/health`, `/api/health/db` | `.../health/*` | Liveness + DB readiness checks. |
| POST | `/api/upgrade-admin` | `.../upgrade-admin/route.ts` | Promote user to admin with shared secret. |
| POST | `/api/webhooks/stripe` | `.../webhooks/stripe/route.ts` | Stripe event ingestion (checkout, subscription, invoices). |

### AGI Endpoints
#### `GET /api/agi/status`
Response:
```json
{
  "available": true,
  "mode": "full_agi",
  "components": ["Reasoning Engine", "Creativity Engine", "..."]
}
```

#### `POST /api/agi/process`
Request body:
```json
{ "input": "Summarize today's incidents" }
```
Guards: requires JWT, subscription check for `agi_messages`, rate limit preset AGI.  
Response (abridged):
```json
{
  "thoughts": [{ "content": "...", "type": "analysis" }],
  "reasoning": { "mode": "chain_of_thought", "conclusion": "...", "confidence": 0.82 },
  "creativity": [{ "description": "..." }],
  "emotionalState": "attentive",
  "mode": "full_agi"
}
```

### AI Admin Streaming (`POST /api/ai-admin/stream`)
- Body: `{ conversationId, message, userId, mode?: "chat" | "patch" }`.
- Response: Server-Sent Events stream with events `{type:"status"|"chunk"|"patch"|"done"|"error"}`.
- Patch mode emits chunked text plus final `{ summary, patchId, files[] }`.
- Relies on `getAIAdminAgent()` to gather context and `conversation-manager` to persist transcripts.

### Documents & Knowledge
1. **List documents** – `GET /api/documents?source=upload&status=completed` returns `{ documents: [], total }`.
2. **Upload** – `POST /api/documents/upload`
   - Multipart fields: `file` (PDF/DOCX/TXT/MD).
   - Validates size ≤ 50 MB, MIME whitelist.
   - Creates DB record with `status=processing`, triggers `processDocumentAsync` to parse text, chunk, embed via Pinecone, and update metadata.
3. **Search** – `POST /api/documents/search`
   - Body `{ "query": "vector db schema", "topK": 10 }`.
   - Response groups matches per document, each with chunk excerpts + scores.
4. **Download** – `GET /api/documents/{id}/download` ensures caller owns the document and streams bytes from `/uploads`.

### Voice Command (`POST /api/voice`)
- Form-data field `audio` (WebM/MP3).  
- Steps: transcribe via Whisper (`gpt-4o-mini-transcribe`), interpret command via GPT JSON mode (`commandSchema`), execute action (`respond`, `get_dashboard_metrics`, or `run_agent`).  
- Response:
```json
{
  "success": true,
  "transcript": "...",
  "command": { "action": "run_agent", "arguments": { "agentId": "..." } },
  "result": { "executionId": "...", "output": "..." }
}
```

### Monitoring & Debugger
- `GET /api/monitoring/metrics`: Admin-only JWT required. Returns `metrics`, `health`, `alerts`, `activity` from `SubscriptionMonitor`.
- `POST /api/monitoring/metrics?format=report`: Returns plaintext snapshot for cron bots.
- `GET /api/debugger?action=health|errors|stats|health-detailed`: Public `action=health`, authenticated for others. Wraps `appMonitor`.
- `POST /api/debugger`: Accepts `{ level, category, message, stack }` to manually log incidents.

### Health Checks
- `GET /api/health`: Basic app + DB ping (`SELECT 1`), returns response time per component.
- `GET /api/health/db`: Adds `pg_stat_activity` insights (active connections, latency).

### Upgrade Admin (`POST /api/upgrade-admin`)
Body: `{ "email": "user@example.com", "secret": "<ADMIN_UPGRADE_SECRET>" }`.  
Promotes existing user to `role='admin'`; secret defaults to `apex-admin-secret-2025` locally but should be overridden in production.

### Stripe Webhook (`POST /api/webhooks/stripe`)
- Validates `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`.
- Handles events: `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_succeeded|failed`.
- Updates `subscriptions` table, sets plan/period boundaries, records cancellations. Each event is logged via `WebhookMonitor` with latency + status.

### tRPC Handler (`/api/trpc/[trpc]/route.ts`)
All tRPC requests flow through this handler:
```ts
fetchRequestHandler({
  endpoint: '/api/trpc',
  router: appRouter,
  req,
  createContext: () => ({ db, userId })
});
```
Client calls must send JSON payloads like:
```json
{
  "id": 1,
  "method": "agents.list",
  "params": { "input": null }
}
```
The Next.js/React client wrapper abstracts these details; external callers can mimic this schema if needed.

---

## Example Requests
### Fetch AGI Status
```bash
curl https://localhost:3000/api/agi/status
```

### Trigger AGI Processing
```bash
curl -X POST https://localhost:3000/api/agi/process \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Summarize Q4 incidents"}'
```

### Upload Document
```bash
curl -X POST https://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./runbook.pdf"
```

### tRPC Client Snippet
```typescript
import { trpc } from '@/lib/trpc/client';

const { data } = trpc.analytics.getDashboardMetrics.useQuery();
const mutation = trpc.workflows.execute.useMutation();
await mutation.mutateAsync({ workflowId, input: { ticketId: 'INC-42' } });
```

---

## Reference Links
- tRPC router composition: `src/server/routers/_app.ts`
- REST handlers: `src/app/api/**/route.ts`
- Rate limiting: `src/lib/rate-limit.ts`
- Subscription enforcement: `src/lib/subscription/service.ts`
- AI/AGI engines: `src/lib/agi/**`, `src/lib/ai-admin/**`

Use this reference alongside `docs/TECHNICAL-SPEC.md` and `docs/ARCHITECTURE.md` to understand request lifecycles end-to-end.

