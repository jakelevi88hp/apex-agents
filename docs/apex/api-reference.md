# Apex Agents API Reference

All endpoints live under the Next.js App Router (`/api/*`) and return JSON unless noted. Authenticated requests require a `Bearer <JWT>` header unless labeled *Public*.

## 1. REST & Streaming Endpoints

### 1.1 `POST /api/agi/process`
- **Purpose:** Run a full AGI reasoning cycle for a user prompt.
- **Auth:** Required. JWT validated + subscription quota + rate limit (20 req/min).
- **Request**
```bash
# Step 1: Send the prompt string in JSON
curl -X POST https://app.example.com/api/agi/process \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "input": "Draft a launch plan for v2" }'
```
- **Response**
```json
{
  "thoughts": [{ "type": "analysis", "content": "Assessing requirements..." }],
  "reasoning": {
    "mode": "analytical",
    "steps": [{ "step": 1, "description": "Gather constraints", "confidence": 0.86 }],
    "conclusion": "Launch plan with phased rollout"
  },
  "creativity": [{ "description": "Customer beta caravan", "novelty": 0.72 }],
  "emotionalState": "attentive",
  "mode": "full_agi",
  "conversationId": "2ad0e..."
}
```

### 1.2 `GET /api/agi/status`
- **Purpose:** Health snapshot of the AGI stack.
- **Auth:** Public.
- **Response:** `{ "available": true, "mode": "full_agi", "components": [...] }`

### 1.3 `POST /api/ai-admin/stream`
- **Purpose:** SSE stream for AI Admin chat or patch generation.
- **Auth:** Required + admin role.
- **Request Body:** `{ conversationId, message, userId, mode: "chat" | "patch" }`.
- **Response:** `text/event-stream` where events have `{ type: "chunk" | "patch" | "done", content }`.

### 1.4 `GET /api/debugger`
- **Modes:** `action=health` (public) or authenticated `action=errors|unresolved|stats|health-detailed`.
- **Returns:** Aggregated health checks, recent errors, or stats from `appMonitor`.

### 1.5 `POST /api/debugger`
- **Purpose:** Manually log an error for testing.
- **Request Example**
```bash
curl -X POST https://app.example.com/api/debugger \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "message": "Simulated failure", "category": "smoke" }'
```

### 1.6 Document Management
| Endpoint | Description |
| --- | --- |
| `GET /api/documents` | List documents for the auth user (filter by `source`, `status`). |
| `POST /api/documents/upload` | Multipart upload (`file` field). Rate limit 10/hr. |
| `GET /api/documents/:id/download` | Download original file if owned. |
| `POST /api/documents/search` | Semantic search across Pinecone chunks. |

Example upload:
```bash
# Step 1: Post multipart data
curl -X POST https://app.example.com/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@brief.pdf"
# -> { "document": { "id": "...", "status": "processing" } }
```

### 1.7 Health Endpoints
- `GET /api/health`: DB ping + service summary.
- `GET /api/health/db`: Detailed Postgres stats (connections, latency).

### 1.8 Monitoring
- `GET /api/monitoring/metrics`: Admin-only subscription metrics + alerts.
- `POST /api/monitoring/metrics`: Returns plaintext summary report.

### 1.9 `POST /api/upgrade-admin`
- **Purpose:** Promote a user to admin using `ADMIN_UPGRADE_SECRET`.
- **Body:** `{ "email": "...", "secret": "..." }`.

### 1.10 `POST /api/voice`
- **Purpose:** Voice command ingestion (audio + action execution).
- **Request**
```bash
curl -X POST https://app.example.com/api/voice \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@command.webm"
```
- **Response:** Transcript, structured command, and execution result or dashboard metrics.

### 1.11 `POST /api/webhooks/stripe`
- **Purpose:** Stripe webhook target (checkout, subscription lifecycle, invoices).
- **Auth:** Stripe signature verification via `STRIPE_WEBHOOK_SECRET`.
- **Side Effects:** Updates `subscriptions`, `usageTracking`, logs via `WebhookMonitor`.

### 1.12 `GET|POST /api/trpc`
- **Purpose:** tRPC router entrypoint used by the client.
- **Context:** Injects Drizzle DB + JWT-derived `userId`.

## 2. tRPC Router Surface

### 2.1 Router Cheat Sheet
| Router | Procedures (key ones) | Notes |
| --- | --- | --- |
| `auth` | `signup`, `login`, `me`, `requestPasswordReset`, `resetPassword` | Signup auto-promotes first/owner user to admin. |
| `agents` | `list`, `get`, `create`, `update`, `delete`, `execute`, `getExecutions`, `bulkDelete`, `bulkUpdateStatus` | `create` guarded by usage limit; `execute` writes to `executions`. |
| `workflows` | `list`, `create`, `execute`, `getExecutionStatus`, `getExecutionHistory`, `update`, `delete` | Execution uses `getWorkflowExecutor` and returns telemetry envelope. |
| `analytics` | `getDashboardMetrics`, `getSparklineData`, `getRecentActivity`, `getExecutionStats`, `getAgentPerformance`, `getWorkflowPerformance`, `getExecutionTrend` | All queries scoped to `ctx.userId`. |
| `execution` | `execute`, `getHistory`, `getById` | Wraps `executeAgent` utilities. |
| `settings` | `getSettings`, `updateSettings`, `listApiKeys`, `createApiKey`, `revokeApiKey`, `getModelConfig`, `updateModelConfig`, `getBillingInfo`, CRUD for team members | API keys prefixed `sk_live_` or `sk_test_`. |
| `subscription` | `getCurrent`, `getUsage`, `canUseFeature`, `getPlans`, `createCheckoutSession`, `cancelSubscription`, `getCustomerPortal` | Touches Stripe + `SubscriptionService`. |
| `suggestions` | `list`, `generate`, `updateStatus` | Backs dashboard suggestion cards. |
| `aiAdmin` | Rich surface (patch generation, chat, GitHub ops, conversation trees, file uploads, image analysis) | `adminProcedure` enforces role; SSE also available via REST. |

### 2.2 Example tRPC Interaction
```ts
// Step 1: Create an agent with config + capabilities
await trpc.agents.create.mutate({
  name: 'Launch Strategist',
  type: 'analysis',
  description: 'Builds GTM plans',
  config: { model: 'gpt-4o-mini', temperature: 0.4 },
  capabilities: ['planning', 'risk_scoring']
});

// Step 2: Execute the agent with context
const result = await trpc.agents.execute.mutate({
  agentId: '7a1b8b6c-d7d4-4e1c-a2ac-1a7f5417dc85',
  objective: 'Draft a 3-phase release roadmap',
  context: { audience: 'enterprise' }
});
console.log(result.output); // => Multi-phase plan text
```

## 3. Error Handling Conventions
- Validation failures return `400` with `{ error: 'message' }`.
- Auth failures return `401` or `403`.
- Rate limiting returns `429` JSON with `retryAfter`.
- Unhandled errors return `500` plus generic message; details logged via `appMonitor` or console (during dev).
- tRPC errors use `TRPCError` codes; clients receive typed error payloads.

## 4. Versioning & Compatibility
- API routes tied to app release; breaking changes require route duplication or version query parameters.
- tRPC routers typed via `AppRouter`; client must regenerate types after schema changes (`npx trpc-openapi` not in use).
- Webhook schema follows Stripe API `2024-06-20`.

