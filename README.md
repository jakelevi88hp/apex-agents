# Apex Agents Platform

AI agent operations platform built with Next.js 14 (App Router), TypeScript, tRPC, Drizzle ORM, Neon Postgres, Pinecone, OpenAI, and Stripe. Apex Agents lets teams design autonomous agents, orchestrate workflows, ingest knowledge, monitor executions, and manage billing in one control plane.

## Platform Features
- **Agent lifecycle**: create typed agents with capabilities, constraints, and toolkits; inspect execution history.
- **Workflow builder**: drag-and-drop orchestration with branching, retries, and monitoring.
- **AGI console**: conversational interface backed by `EnhancedAGICore` with long-term memory.
- **Knowledge base**: secure uploads, document parsing, embedding, and semantic search.
- **AI Admin & debugger**: streaming co-pilot for code patches plus runtime health telemetry.
- **Voice interface**: Whisper transcription + GPT command routing to metrics or agent runs.
- **Subscriptions & analytics**: Stripe billing, usage quotas, dashboards, alerts.

## Architecture Snapshot
- **Frontend**: Next.js App Router (React Server Components), Tailwind UI, TanStack Query, Zustand/context where needed.
- **APIs**: Hybrid REST routes under `app/api/*` for uploads, AI calls, monitoring, webhooks; strongly-typed tRPC router at `/api/trpc` for dashboard data.
- **Domain services**: `src/lib` modules encapsulate AGI, AI Admin, document processor, Pinecone client, subscription enforcement, monitoring, and integrations.
- **Data layer**: Drizzle ORM models for Neon Postgres plus Pinecone vector index and optional S3/local storage for documents.
- **Observability**: Sentry, custom monitors (`SubscriptionMonitor`, `WebhookMonitor`), `/api/debugger` health probes.

## Quick Start
1. **Install prerequisites**
   - Node.js 20.x (`nvm use 20`)
   - pnpm 9.x (`corepack enable`)
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Configure environment**
   - Copy `.env.example` → `.env.local`
   - Set `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `PINECONE_*`, `STRIPE_*`, `RESEND_API_KEY`, `ADMIN_UPGRADE_SECRET`, etc.
   - See `docs/ONBOARDING-GUIDE.md` + `docs/ENVIRONMENT-VARIABLES.md`.
4. **Database**
   ```bash
   pnpm db:generate   # regenerate SQL if schema changed
   pnpm db:push       # apply migrations
   pnpm db:seed       # optional sample data
   ```
5. **Run dev server**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`.

## Scripts
| Command | Description |
| --- | --- |
| `pnpm dev` | Next.js development server (hot reload). |
| `pnpm build` / `pnpm start` | Production build and serve. |
| `pnpm lint` | ESLint (Next + TypeScript config). |
| `pnpm test`, `pnpm test:ui` | Playwright headless/UI suites. |
| `pnpm stress:test` | Synthetic workload against agents/workflows. |
| `pnpm health:check` | Runs system health diagnostics. |
| `pnpm db:generate`, `pnpm db:push`, `pnpm db:seed`, `pnpm db:reset` | Drizzle migrations + seed helpers. |
| `pnpm security:audit` | Dependency vulnerability scan. |

## Documentation
All project docs live in `/docs`. Start here:
- `docs/README.md` — index + reading order.
- `docs/TECHNICAL-SPEC.md` — system requirements and contracts.
- `docs/ARCHITECTURE.md` — Mermaid diagrams and ops notes.
- `docs/API-REFERENCE.md` — REST + tRPC surface area.
- `docs/CODE-MODULES.md` — directory responsibilities.
- `docs/ONBOARDING-GUIDE.md` — environment setup and troubleshooting.

## Testing & Quality Gates
1. `pnpm lint`
2. `pnpm test`
3. `pnpm test:ui` (when touching UI/flows)
4. `pnpm security:audit`
5. `pnpm stress:test` (before major releases)

## Deployment
- Target: Vercel (App Router).  
- Required env on Vercel: same as `.env.local` plus Stripe + Pinecone production keys.  
- Stripe webhooks: configure endpoint `https://<prod-host>/api/webhooks/stripe`.  
- Monitor `/api/health` and `/api/monitoring/metrics` post-deploy; alerts flow via Sentry and Subscription Monitor.

## Contributing & Support
- Branch from `main`, keep changes atomic, update docs when routers/schema change.
- Run the full QA checklist above before opening a PR.
- Production incidents: capture `/api/debugger` output + Sentry link; escalate to platform team.