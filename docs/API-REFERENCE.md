# Apex Agents API Reference

**Last Updated:** 2025-11-14  
**Version:** 2.0

---

## 1. Base URLs

| Environment | App Router Base | tRPC Endpoint |
| --- | --- | --- |
| Production | `https://apex-agents.vercel.app` | `https://apex-agents.vercel.app/api/trpc` |
| Local dev | `http://localhost:3000` | `http://localhost:3000/api/trpc` |

Unless specified, all HTTP examples use the App Router base URL. Replace with your environment as needed.

---

## 2. Authentication

Apex Agents uses JWTs issued by the tRPC `auth.login` mutation. Clients typically call the mutation via the generated React hook, but you can also hit the tRPC endpoint manually.

### Login (tRPC)

```typescript
const login = trpc.auth.login.useMutation();
const { token } = await login.mutateAsync({ email, password });
```

Use the returned token in the `Authorization` header for HTTP endpoints and when bootstrapping custom tRPC clients:

```
Authorization: Bearer <JWT>
```

JWT payload includes `userId`, `email`, `role`. Admin-only endpoints check `role === 'admin' | 'owner'` via a database lookup.

---

## 3. HTTP Endpoints (App Router)

### 3.1 AGI

#### POST `/api/agi/process`

- **Auth:** Required (Bearer JWT)
- **Rate limit:** 20 requests/minute per user (see `RateLimitPresets.AGI`)

Request:

```http
POST /api/agi/process
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "input": "Summarize the latest runbook."
}
```

Response:

```json
{
  "thoughts": [{ "type": "analysis", "content": "Analyzing input..." }],
  "emotionalState": "attentive",
  "creativity": [{ "description": "Balanced solution" }],
  "reasoning": {
    "mode": "analytical",
    "steps": [...],
    "conclusion": "Here is the summary...",
    "confidence": 0.82
  },
  "mode": "full_agi",
  "conversationId": "2d97a3f2-...",
  "messageId": "d4ab1234-..."
}
```

#### GET `/api/agi/status`

- **Auth:** Required

Returns AGI component health:

```json
{
  "available": true,
  "mode": "full_agi",
  "components": ["Memory System", "Conversation History", "..."],
  "features": {
    "memory": true,
    "conversationHistory": true,
    "advancedReasoning": true,
    "emotionalIntelligence": true,
    "creativity": true
  },
  "sessionId": "f588...",
  "conversationId": "2d97a3f2-..."
}
```

### 3.2 AI Admin Streaming

#### POST `/api/ai-admin/stream`

- **Auth:** Required (Bearer JWT)
- **Admin only**
- **Runtime:** Node.js (SSE)

Body:

```json
{
  "conversationId": "de2f...",
  "message": "Review the new workflow builder.",
  "userId": "<current-user-id>",
  "mode": "chat" // or "patch"
}
```

Response: Server-Sent Events (`Content-Type: text/event-stream`). Events include:

- `status` – textual updates.
- `chunk` – streaming text.
- `patch` – structured patch payload (when `mode=patch`).
- `done` – final aggregated message.
- `error` – message string.

Example SSE payload:

```
data: {"type":"chunk","content":"Investigating workflow builder..."}
```

### 3.3 Documents & Knowledge

#### GET `/api/documents`

Query params: `source`, `status`.

Example:

```
GET /api/documents?source=upload&status=completed
Authorization: Bearer <JWT>
```

Response:

```json
{
  "documents": [
    {
      "id": "b1d4...",
      "name": "Playbook.pdf",
      "mimeType": "application/pdf",
      "size": 204800,
      "source": "upload",
      "status": "completed",
      "summary": "Key steps...",
      "tags": ["runbook"],
      "folder": null,
      "metadata": {
        "pageCount": 12,
        "wordCount": 3200,
        "chunkCount": 6
      },
      "createdAt": "2025-11-14T09:21:00.000Z",
      "updatedAt": "2025-11-14T09:22:15.000Z"
    }
  ],
  "total": 1
}
```

#### POST `/api/documents/upload`

- **Auth:** Required
- **Rate limit:** 10 uploads/hour per user
- **Content-Type:** `multipart/form-data`

Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `file` | File | Allowed MIME types: PDF, DOCX, TXT, MD. Max 50 MB. |

Response:

```json
{
  "success": true,
  "document": {
    "id": "b1d4...",
    "name": "Playbook.pdf",
    "size": 204800,
    "mimeType": "application/pdf",
    "status": "processing",
    "createdAt": "2025-11-14T09:21:00.000Z"
  }
}
```

Processing happens asynchronously; the background worker extracts text, chunks, embeds via Pinecone, and updates the `documents` row.

#### POST `/api/documents/search`

```http
POST /api/documents/search
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "query": "incident response checklist",
  "topK": 5
}
```

Response groups matches by document with chunk-level scores.

#### GET `/api/documents/:id/download`

Streams the original file if the requesting user owns it.

### 3.4 Voice Commands

#### POST `/api/voice`

- **Auth:** Required
- **Body:** `multipart/form-data` with `audio` file (`webm`, `wav`, etc.)

Flow: Authenticate → Whisper transcription → GPT command classification → execute action.

Response:

```json
{
  "success": true,
  "transcript": "Run the revenue reconciliation agent.",
  "command": {
    "action": "run_agent",
    "summary": "Execute revenue reconciliation agent",
    "arguments": {
      "agentName": "Revenue Reconciler",
      "input": "Use default task."
    }
  },
  "result": {
    "agentId": "f8b2...",
    "executionId": "ce54...",
    "output": {...},
    "tokensUsed": 1543,
    "duration": 12.4
  }
}
```

### 3.5 Monitoring & Health

| Endpoint | Description | Auth |
| --- | --- | --- |
| `GET /api/monitoring/metrics` | Subscription metrics, expiring users, usage alerts, 7-day activity. | Admin only |
| `POST /api/monitoring/metrics` | Plain-text summary report. | Admin only |
| `GET /api/debugger?action=health|errors|stats|unresolved` | `health` is public, others require auth. |
| `POST /api/debugger` | Manually log an error (testing). Requires auth. |
| `GET /api/health` | Public readiness (API + DB). |
| `GET /api/health/db` | Detailed DB stats (active connections). |

### 3.6 Admin Utilities

#### POST `/api/upgrade-admin`

```json
{
  "email": "user@example.com",
  "secret": "<ADMIN_UPGRADE_SECRET>"
}
```

Marks the given user as `role = 'admin'`. Use only for bootstrapping.

#### POST `/api/webhooks/stripe`

Stripe sends checkout + subscription lifecycle events here. The endpoint validates the `stripe-signature` header, updates `subscriptions` & `usageTracking`, and logs via `WebhookMonitor`. You generally do not call this manually—configure it in the Stripe dashboard or via CLI.

---

## 4. tRPC Procedures

The tRPC router (`appRouter`) exposes strongly typed procedures. Below is a condensed catalog. All procedures inherit auth from `protectedProcedure` unless noted.

| Router | Notable Procedures | Description |
| --- | --- | --- |
| `auth` | `signup`, `login`, `me`, `requestPasswordReset`, `resetPassword` | User lifecycle (bcrypt hashing + Resend emails). `signup` auto-promotes first user or owner email to admin. |
| `agents` | `list`, `get`, `create`, `update`, `delete`, `execute`, `bulkDelete`, `bulkUpdateStatus`, `getExecutions` | CRUD + execution for AI agents. `execute` writes to `executions` via `AgentFactory`. |
| `workflows` | `list`, `create`, `update`, `delete`, `execute`, `getExecutionStatus`, `getExecutionHistory` | Workflow builder support. `execute` calls `getWorkflowExecutor`. |
| `execution` | `execute`, `getHistory`, `getById` | Direct agent execution helpers (shared with voice). |
| `analytics` | `getDashboardMetrics`, `getSparklineData`, `getRecentActivity`, `getExecutionStats`, `getAgentPerformance`, `getWorkflowPerformance`, `getExecutionTrend` | Dashboard and voice metrics. |
| `aiAdmin` | `chat`, `generatePatch`, `applyPatch`, `rollbackPatch`, conversation CRUD, GitHub helpers, file uploads, image analysis | All admin-specific controls—guards admin role. |
| `settings` | `getSettings`, `updateSettings`, `listApiKeys`, `createApiKey`, `revokeApiKey`, `getModelConfig`, `updateModelConfig`, `getBillingInfo`, `listTeamMembers`, `inviteTeamMember`, `updateTeamMemberRole`, `removeTeamMember` | User/org configuration surfaces. |
| `subscription` | `getCurrent`, `getUsage`, `canUseFeature`, `getPlans`, `createCheckoutSession`, `cancelSubscription`, `getCustomerPortal` | Stripe plan management + usage enforcement. |
| `suggestions` | `list`, `generate`, `updateStatus` | Personalized system suggestions on the dashboard. |

### Sample call (vanilla fetch)

```ts
const result = await fetch('/api/trpc/agents.list', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ input: undefined })
}).then(res => res.json());
```

The response follows tRPC’s JSON-RPC envelope. Prefer the generated client in React (`@/utils/api` or similar) to avoid manual plumbing.

---

## 5. Error Handling

### HTTP Errors

```json
{
  "error": "Authentication required. Please log in again."
}
```

Status codes follow HTTP conventions (`401`, `403`, `404`, `422`, `429`, `500`). Rate-limited responses include:

```
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <ISO timestamp>
Retry-After: <seconds>
```

### tRPC Errors

```json
{
  "id": 0,
  "error": {
    "code": -32603,
    "message": "FORBIDDEN",
    "data": {
      "code": "FORBIDDEN",
      "httpStatus": 403,
      "path": "aiAdmin.generatePatch"
    }
  }
}
```

Handle via the generated hooks (`error` object) or `try/catch` on `client.mutation`.

---

## 6. Rate Limits

| Preset | Limit | Window | Used by |
| --- | --- | --- | --- |
| `AGI` | 20 req/min | 60 s | `/api/agi/process` |
| `AI_ADMIN` | 5 req/min | 60 s | `/api/ai-admin/stream`, AI Admin tRPC helpers |
| `UPLOAD` | 10 uploads/hour | 1 h | `/api/documents/upload` |
| `AUTH` | 5 attempts/15 min | 15 min | Auth endpoints |
| `API` | 100 req/min | 60 s | Generic fallback |
| `SEARCH` | 30 req/min | 60 s | `/api/documents/search`, future search APIs |

429 responses include `retryAfter` seconds. Rate limiting is in-memory; scale-out deployments should swap in Redis/Upstash.

---

## 7. Testing the APIs

### cURL example – AGI

```bash
curl -X POST http://localhost:3000/api/agi/process \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input":"Give me three product ideas."}'
```

### SSE example – AI Admin (Node)

```ts
const resp = await fetch('/api/ai-admin/stream', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ conversationId, message, userId, mode: 'chat' })
});

const reader = resp.body!.getReader();
```

### Stripe webhook test

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

Ensure the CLI prints `200 OK` and the dev server logs “Subscription created...”.

---

## 8. Change Log

| Date | Version | Notes |
| --- | --- | --- |
| 2025-11-14 | 2.0 | Rebuilt reference to match current App Router + tRPC surface, documented voice + monitoring endpoints, added rate-limit table. |
| 2024-11-09 | 1.0 | Initial draft (deprecated). |

For questions or missing endpoints, open an issue or ping the #apex-engineering channel. Always update this document when adding/modifying APIs.

