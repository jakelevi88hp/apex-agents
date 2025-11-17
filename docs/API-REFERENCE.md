# Apex Agents API Reference

**Last updated:** 2025-11-14  
**Audience:** Engineers integrating with REST or tRPC surfaces.

## 1. Base URLs & Formats
| Interface | URL | Notes |
| --- | --- | --- |
| REST | `https://<host>/api` | JSON everywhere except SSE (`/ai-admin/stream`) and Stripe webhooks (raw body). |
| tRPC | `https://<host>/api/trpc` | Superjson transformer; follow procedure naming (`router.procedure`). |

## 2. Authentication & Headers
- JWT tokens issued at login.  
- REST routes expect `Authorization: Bearer <JWT>` unless marked public.  
- Cookies are accepted for browser calls; server-to-server should pass bearer headers.  
- SSE endpoint (`/api/ai-admin/stream`) requires JSON body containing `userId` (validated on server).  

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## 3. Rate Limits
| Route | Limit | Enforcement |
| --- | --- | --- |
| `POST /api/agi/process` | 20 requests/minute per user | `RateLimitPresets.AGI` + subscription quota (`SubscriptionService`). |
| `POST /api/documents/upload` | 10 uploads/hour per user | `RateLimitPresets.UPLOAD`. |
| Other REST/tRPC | 100 req/min (free), 1 000 req/min (premium), unlimited (pro) | Gateway-level; see plan metadata. |

Limit breaches respond with `429` and `Retry-After`.

## 4. REST Endpoints

### 4.1 AGI
| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/agi/process` | Runs `EnhancedAGICore` with conversation + memory context. Requires bearer token. |
| `GET` | `/api/agi/status` | Returns AGI availability snapshot (public). |

```http
POST /api/agi/process
Authorization: Bearer <token>
Content-Type: application/json
{
  "input": "Draft a launch plan for Apex Agents."
}
```

```json
{
  "response": "Here's a structured launch plan...",
  "thoughts": { "reasoning": "...", "emotionalState": "focused" },
  "memories": { "episodic": [...], "semantic": [...] }
}
```

### 4.2 Documents & Knowledge
| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/documents` | Lists current user documents; supports `?source` and `?status`. |
| `POST` | `/api/documents/upload` | `multipart/form-data` with `file`. 50 MB max, allowed MIME: PDF, DOCX, TXT, MD. |
| `GET` | `/api/documents/:id/download` | Streams stored file if user owns it. |
| `POST` | `/api/documents/search` | `{ "query": string, "topK": number }`; returns grouped Pinecone hits. |

Upload example:
```
form-data:
  file: <binary>
```
Response
```json
{
  "success": true,
  "document": {
    "id": "doc_123",
    "name": "brief.pdf",
    "status": "processing"
  }
}
```

### 4.3 AI Admin & Dev Tooling
| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/ai-admin/stream` | SSE stream for chat or patch generation. Body: `{ conversationId, message, userId, mode }`. |
| `GET` | `/api/debugger?action=health|errors|stats|unresolved|health-detailed` | Health & diagnostics; `action=health` is public, others require auth. |
| `POST` | `/api/debugger` | Manually log error (`{ level, category, message }`). |

SSE events emit `{ type: "chunk" | "patch" | "status" | "done" }`.

### 4.4 Voice Commands
| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/voice` | Accepts `FormData` field `audio` (WebM/MP4). Pipeline: Whisper → GPT command → execute (`respond`, `get_dashboard_metrics`, `run_agent`). |

Response example:
```json
{
  "success": true,
  "transcript": "How many workflows ran today?",
  "command": {
    "action": "get_dashboard_metrics",
    "summary": "Share today's metrics"
  },
  "result": {
    "metrics": {
      "activeAgents": 4,
      "workflows": 7,
      "executionsToday": 19,
      "executionsTrend": { "change": 12.5, "direction": "up" }
    }
  }
}
```

### 4.5 Monitoring & Health
| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/monitoring/metrics` | Admin-only JSON snapshot of subscription health, usage, alerts. |
| `POST` | `/api/monitoring/metrics` | Admin-only plaintext report. |
| `GET` | `/api/health` | API + DB health summary (public). |
| `GET` | `/api/health/db` | Detailed DB stats (public). |

### 4.6 Admin Utilities & Webhooks
| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/upgrade-admin` | Promote user by email. Body `{ email, secret }`. Requires `ADMIN_UPGRADE_SECRET`. |
| `POST` | `/api/webhooks/stripe` | Consumes Stripe events (raw body). Handles checkout, subscription lifecycle, invoice results. Validates `stripe-signature`. |

Stripe handler side-effects: updates `subscriptions` table, logs metrics via `WebhookMonitor`, and returns `{ "received": true }` on success.

## 5. tRPC Surface ( `/api/trpc` )

### 5.1 Routers
| Router | Key Procedures | Notes |
| --- | --- | --- |
| `auth` | `me`, `register`, `login`, `logout` | Issues JWT + session metadata. |
| `agents` | `list`, `get`, `create`, `update`, `delete`, `execute`, `getExecutions`, `bulkDelete`, `bulkUpdateStatus` | Uses Drizzle + `AgentFactory`. |
| `workflows` | `list`, `get`, `create`, `update`, `delete`, `execute`, `getExecutionStatus`, `getExecutionHistory` | Executes via workflow engine. |
| `aiAdmin` | `chat`, `generatePatchFromPlainLanguage`, `getExampleRequests`, `uploadFile` | Admin-only. |
| `analytics` | `getDashboardMetrics`, `getSparklineData`, `getRecentActivity`, `getExecutionStats`, `getAgentPerformance`, `getWorkflowPerformance`, `getExecutionTrend` | Backed by aggregated SQL. |
| `settings` | `getSettings`, `updateGeneral`, `createApiKey`, `revokeApiKey`, `updateModelConfig`, `getTeamMembers`, `inviteTeamMember`, `updateTeamMemberRole`, `removeTeamMember` | Persists to `user_settings`, `api_keys`, `team_members`. |
| `execution` | `get`, `cancel`, `retry` (where implemented) | Hooks into `executions` table. |
| `subscription` | `getPlans`, `createCheckoutSession`, `getPortalLink` | Wraps Stripe SDK. |
| `suggestions` | `list`, `resolve`, `create` | Surfaces AI/UX suggestions. |

### 5.2 Usage Example
```typescript
import { trpc } from '@/lib/trpc';

const { data, error, isLoading } = trpc.agents.list.useQuery(undefined, {
  staleTime: 5 * 60 * 1000,
});

const createMutation = trpc.workflows.create.useMutation();
await createMutation.mutateAsync({
  name: 'Weekly digest',
  definition: { nodes: [...], edges: [...] },
});
```

### 5.3 Input Validation
- All procedures define Zod schemas; invalid input yields `BAD_REQUEST` + `zodError`.
- Protected procedures wrap `protectedProcedure` and throw `UNAUTHORIZED` if `ctx.userId` missing.

## 6. Error Model
```json
{
  "error": "AGI message limit reached",
  "code": "FORBIDDEN",
  "data": {
    "httpStatus": 403,
    "path": "agi.process",
    "limit": 200,
    "current": 200
  }
}
```
- REST endpoints respond with `{ error: string }` and standard HTTP codes.  
- tRPC errors include `error.data` with `code`, `httpStatus`, `path`, and optional `zodError`.  
- Stripe/webhook failures log via `WebhookMonitor` and return `400` to trigger Stripe retry.

## 7. Testing & Sandbox Tips
- Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) to replay billing events.
- Pinecone and OpenAI calls require valid keys even in development; use separate dev indexes and org keys.
- Voice endpoint accepts any file convertible by Whisper; `multipart/form-data` boundary must include filename.
- For AGI/tRPC testing without browser, send `POST /api/trpc/<router.procedure>` with `{ "input": <json> }` encoded via `superjson`.

## 8. Change Log
- **2025-11-14:** Added REST coverage for AGI, documents, AI Admin, monitoring, voice; expanded tRPC table; updated rate-limit notes.
