# Apex Agents Architecture
_Last updated: 2025-11-14_

## System Context
```mermaid
flowchart LR
    Browser["Client UI\nNext.js App Router (`src/app`)"]
    TRPC["tRPC Router\n`src/server/routers/_app.ts`"]
    Domain["Domain Services\n`src/lib/**` & `src/server/**`"]
    DB["PostgreSQL + Drizzle\n`src/lib/db/schema.ts`"]
    Pinecone["Pinecone Vector Index\n`PineconeService`"]
    OpenAI["OpenAI APIs\nChat, Whisper, Embeddings"]
    Stripe["Stripe Billing\nWebhooks"]
    Storage["Uploads / S3-compatible storage"]

    Browser -->|RSC + client islands| TRPC
    TRPC --> Domain
    Domain --> DB
    Domain --> Pinecone
    Domain --> OpenAI
    Domain --> Stripe
    Domain --> Storage
    Stripe --> Domain
```

**Highlights**
- App Router serves server components by default; client components (e.g., dashboard charts, VoiceCommandPanel) hydrate only where interaction is required.
- All state-changing calls funnel through either tRPC or dedicated API routes; each handler enforces JWT auth and often subscription limits/rate limiting.
- Domain services are clean TypeScript modules; they do not rely on React, which simplifies testing and background execution.

## AGI Request Lifecycle
```mermaid
sequenceDiagram
    participant User
    participant UI as Dashboard / AGI Console
    participant API as POST /api/agi/process
    participant Subs as SubscriptionService
    participant Enhanced as EnhancedAGICore
    participant OpenAI
    participant DB as PostgreSQL

    User->>UI: Submit AGI prompt
    UI->>API: JSON { input }
    API->>Subs: canUseFeature(userId, "agi_messages")
    Subs-->>API: { allowed, limit, current }
    API->>Enhanced: processInput()
    Enhanced->>DB: store working memory + conversation
    Enhanced->>OpenAI: advanced reasoning + creative calls
    OpenAI-->>Enhanced: completions + token usage
    Enhanced-->>API: structured AGIResponse
    API-->>UI: JSON (thoughts, reasoning, emotionalState)
```

**Key Safeguards**
- `rateLimit(request, RateLimitPresets.AGI)` caps burst load at 20 req/min per user.
- `SubscriptionService.trackUsage` increments quotas asynchronously; failure to record does not block the response but logs warnings.
- Enhanced AGI stores conversation IDs so downstream audits can replay sessions.

## Document Intelligence Pipeline
```mermaid
sequenceDiagram
    participant User
    participant UI as DocumentUpload component
    participant Upload as POST /api/documents/upload
    participant Processor as DocumentProcessor
    participant Pinecone
    participant DB as PostgreSQL

    User->>UI: Submit formData(audio/file)
    UI->>Upload: multipart/form-data (JWT)
    Upload->>DB: insert documents row (status=processing)
    Upload-->>User: 202 Accepted + doc metadata
    Upload->>Processor: processDocumentAsync()
    Processor->>DB: store extracted text + summary
    Processor->>Pinecone: upsertDocumentChunks()
    Processor->>DB: mark status=completed, save embedding metadata
```

**Notes**
- Upload handler enforces MIME whitelist (PDF, DOCX, TXT, MD) and max size (50 MB).
- Pinecone IDs follow `documentId-chunk-{index}` format for deterministic deletion.
- Search endpoint (`POST /api/documents/search`) vectors queries and groups matches by document before returning to the UI.

## Operational Telemetry Flow
```mermaid
flowchart TD
    Usage["Usage Tracking\n`usage_tracking` table"]
    Monitor["SubscriptionMonitor\n`src/lib/monitoring/subscription-monitor.ts`"]
    MetricsAPI["GET /api/monitoring/metrics"]
    Dashboard["Operator Dashboard / CLI"]
    Webhooks["POST /api/webhooks/stripe"]
    Stripe["Stripe Events"]

    Stripe --> Webhooks --> Usage
    Usage --> Monitor --> MetricsAPI --> Dashboard
    Webhooks --> Monitor
```

**Operational Guardrails**
- `WebhookMonitor` logs processing latency/outcome per Stripe event (success/fail) to aid alerting.
- `/api/debugger` exposes run-time health (overall, unresolved errors, stats) for lightweight probing.
- Health endpoints feed load balancer checks; CI smoke tests call them post-deploy.

