# Apex Agents Technical Specification

## 1. Product Overview
- **Purpose:** Apex Agents is a Next.js 14 platform for building, orchestrating, and monitoring AI agents that leverage OpenAI models, Pinecone vector search, and Stripe billing.
- **Analogy:** Think of the system as an airport control tower—specialized subsystems (agents, workflows, AGI core, billing) are runways that the tower coordinates to keep every takeoff/landing safe and predictable.
- **Primary personas:**
  - *Operator:* configures agents/workflows, uploads knowledge, watches analytics.
  - *Engineer:* extends agents, tunes prompts, debugs executions.
  - *Executive:* monitors subscription health and compliance dashboards.

## 2. Functional Requirements
| Capability | Requirements | Data Sources |
| --- | --- | --- |
| Agent Management | CRUD agents, configure tools/capabilities, execute synchronously or via workflows, view execution history. | Tables `agents`, `executions`, `execution_steps`. |
| Workflow Builder | Persist triggers, steps, assignments, and status per workflow; execute on-demand with context payload; log step telemetry. | Tables `workflows`, `executions`. |
| Knowledge Base | Upload documents (PDF, DOCX, TXT, MD), sanitize, chunk, embed in Pinecone, store metadata, enable semantic search. | Tables `documents`, `document_chunks`; Pinecone index. |
| AGI Core | Route `/api/agi/process` through `EnhancedAGICore` with memory, reasoning, emotion, creativity modules; enforce per-plan usage limits; persist conversations. | Tables in `agi_memory`, `agi_conversations`, `usageTracking`. |
| AI Admin | Provide SSE chat + patch generation, store patches, support GitHub + file context, enforce admin role. | Tables `ai_patches`, `ai_uploaded_files`; GitHub API. |
| Voice Commands | Accept audio, transcribe via Whisper, interpret command, fetch metrics or trigger agent execution. | Tables `agents`, `executions`; OpenAI Whisper. |
| Monitoring & Debugging | `/api/debugger` for health/errors, `SubscriptionMonitor` metrics endpoint, webhook telemetry. | Tables `usage_logs`, `alerts`; in-memory monitors. |
| Billing & Subscription | Stripe checkout/webhooks, plan enforcement (trial/premium/pro), usage tracking per feature, cancellation + customer portal. | Tables `subscriptions`, `usageTracking`. |

## 3. Non-Functional Requirements
- **Performance:** AGI/agent requests complete < 8s P95; document uploads process asynchronously to keep API < 2s.
- **Scalability:** Stateless API routes, tRPC handlers rely on shared Postgres + Pinecone; long jobs pushed to background functions (document processing, subscription monitors).
- **Security:** JWT auth for all private routes; SSE and streaming endpoints verify ownership; admin operations double-check role server-side; Stripe webhook signatures validated.
- **Observability:** `appMonitor` health checks, subscription metrics, webhook monitor, execution telemetry stored in `executions` table.
- **Reliability:** Rate limiting (AGI 20 req/min, uploads 10/hr), retry-friendly background processors, subscription usage reset monthly.

## 4. Data Contract Snapshot
| Table | Key Columns | Purpose |
| --- | --- | --- |
| `users` | `id`, `role`, `subscriptionTier` | Identity, RBAC. |
| `agents` | `config`, `capabilities`, `status` | Agent definitions + metadata. |
| `workflows` | `trigger`, `steps`, `agents` | Declarative orchestration. |
| `executions` | `status`, `inputData`, `outputData`, `durationMs` | Runtime telemetry. |
| `documents` | `mimeType`, `summary`, `metadata` | Knowledge artifacts. |
| `agi_memory_*` | Domain-specific JSONB | Persistent multi-type AGI memory. |
| `ai_patches` | `summary`, `files`, `status` | AI Admin patch ledger. |
| `subscriptions`, `usageTracking` | `plan`, `limit`, `count` | Billing + quotas. |

## 5. Key System Flows
### 5.1 Agent Execution
1. UI invokes `trpc.agents.execute.mutate({ agentId, objective })`.
2. Server loads agent config, writes `executions` row, calls OpenAI Chat, streams tokens (optional).
3. Completion persisted; usage counts incremented (feature `agent_executions`).
4. Response object:
```json
{
  "executionId": "c40d6a1f-...",
  "result": {
    "output": "Action plan...",
    "tokensUsed": 842,
    "duration": 3132
  }
}
```

### 5.2 Knowledge Upload
1. Authenticated POST `/api/documents/upload` (multipart) with `file`.
2. File stored locally, DB row inserted as `processing`.
3. Background processor extracts text, chunks, embeds via OpenAI, upserts Pinecone vectors, updates DB to `completed`.
4. Semantic search uses `PineconeService.searchSimilar(query)` to return grouped document hits.

### 5.3 AGI Processing
1. Client sends `{ "input": "Need launch plan" }` to `/api/agi/process`.
2. Endpoint validates JWT, subscription quota, rate-limit.
3. `EnhancedAGICore` orchestrates memory, reasoning, emotion, creativity modules, logs conversation + working memory.
4. Response includes `thoughts`, `reasoning`, `creativity`, `emotionalState`.

## 6. External Integrations
- **OpenAI:** Chat Completions (agent execution, AI Admin chat), embeddings, Whisper transcription.
- **Pinecone:** Vector storage + search for knowledge base.
- **Stripe:** Checkout session creation, webhooks for subscription lifecycle, customer portal.
- **GitHub:** Issue/PR management for AI Admin (via Octokit).
- **S3-Compatible Storage:** Uploaded file persistence (via `uploadFile` helper).

## 7. Compliance & Security Notes
- Secrets loaded from environment variables only on the server.
- File uploads sanitized, stored outside repo under `uploads/`.
- SSE endpoints and tRPC subscriptions validate conversation ownership to prevent data leakage.
- Stripe webhook secrets validated per request; webhook activity logged by `WebhookMonitor`.

## 8. Acceptance Checklist
- [ ] Agent CRUD + execution succeed with enforced quotas.
- [ ] Workflow execution returns telemetry + persists history.
- [ ] Document upload -> Pinecone search round trip verified.
- [ ] `/api/agi/process` returns structured AGI response under 8 seconds.
- [ ] Voice command flow transcribes, interprets, executes agent or returns metrics.
- [ ] Admin-only routes reject non-admin JWTs.
- [ ] Stripe webhook updates subscription + usage stats without manual intervention.
- [ ] Health and monitoring endpoints expose actionable data for ops.

