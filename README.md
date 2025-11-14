# Apex Agents Platform

Apex Agents is an AI operations console built on **Next.js 14 (App Router)**, **TypeScript**, **tRPC 11**, **Drizzle ORM**, and **Pinecone**. It lets operators design autonomous agents, orchestrate workflows, ingest knowledge, interact with an AGI surface, and monitor subscriptions—all inside a single UI.

Think of it as an airport control tower for AI: agents (planes) need routes, fuel (data), and clearances (subscriptions). This repo contains the entire stack needed to run that tower.

---

## Feature Highlights

- **Enhanced AGI**: Stateful conversational core (`lib/agi`) with memory, emotional cues, and creativity controls exposed via `/api/agi/*`.
- **AI Admin**: Autonomous maintainer that analyzes the repo, drafts patches, and can apply them locally or through GitHub via SSE streaming.
- **Workflow Builder**: Drag-and-drop orchestration backed by `workflow-engine` and `executions` telemetry.
- **Knowledge Hub**: Document uploads (PDF/DOCX/TXT/MD), text extraction, Pinecone embedding, and semantic search.
- **Voice Commands**: Whisper transcription + GPT command parsing routed through `/api/voice`.
- **Subscription Guardrails**: Stripe billing, quota tracking, and monitoring dashboards.
- **Observability**: Sentry + custom debugger APIs + `/api/health/*` endpoints.

---

## Architecture (Snapshot)

| Layer | Tech | Notes |
| --- | --- | --- |
| UI | Next.js App Router, Tailwind, React Server Components | Client-only islands for dashboards, workflow canvas, voice widget. |
| API | App Router handlers + tRPC routers | REST for external integrations, tRPC for strongly typed app calls. |
| Services | `lib/agi`, `lib/ai-admin`, `workflow-engine`, `DocumentProcessor`, `SubscriptionService` | Encapsulate reasoning, GitOps, execution, ingestion, billing. |
| Persistence | Neon Postgres (Drizzle ORM), Pinecone vectors, S3/Uploads | Schema definitions in `src/lib/db/schema.ts`. |
| Integrations | OpenAI (chat/embeddings/Whisper), Stripe, Resend, GitHub | Keys configured via `.env.local` / Vercel dashboard. |

For diagrams and detailed flows, see `docs/ARCHITECTURE.md`.

---

## Quick Start

1. **Install prerequisites**
   - Node.js 18 (`nvm install 18 && nvm use 18`)
   - npm ≥10 (ships with Node 18)
   - Optional: Stripe CLI, Vercel CLI
2. **Clone + install**

   ```bash
   git clone git@github.com:YOUR_ORG/apex-agents.git
   cd apex-agents
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` (or follow `docs/ENVIRONMENT-VARIABLES.md`) to `.env.local`.
   - Set `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `PINECONE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `ADMIN_UPGRADE_SECRET`, etc.
   - Apply schema: `npm run db:push`
4. **Run dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`. Create an account at `/signup`; the first account or owner email becomes admin automatically.

---

## Common Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server with live reload. |
| `npm run lint` | ESLint (flat config, TypeScript aware). |
| `npm run build` | Production build (Next). |
| `npm run test` | Playwright smoke tests. |
| `npm run health:check` | TSX script probing DB/OpenAI/Pinecone health. |
| `npm run db:generate` / `npm run db:push` | Drizzle migration tooling. |
| `npm run stress:test` | Agent stress harness (`tests/stress`). |

---

## Testing & Verification

1. **Unit/E2E** – `npm run test` (ensure Playwright browsers installed).
2. **AGI smoke** – `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/agi/status`.
3. **AI Admin SSE** – Use `/dashboard/ai-admin`, watch dev tools for `text/event-stream`.
4. **Document ingestion** – Upload a PDF in the Knowledge tab; confirm status transitions to `completed`.
5. **Voice command** – Use the Voice Command panel, speak “Show me today’s metrics,” verify JSON output.
6. **Stripe webhooks** – `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe` then `stripe trigger checkout.session.completed`.

---

## Documentation Index

| File | Description |
| --- | --- |
| `docs/TECHNICAL-SPEC.md` | High-level goals, stack, and non-functional requirements. |
| `docs/ARCHITECTURE.md` | System diagrams (Mermaid) + pipelines + failure modes. |
| `docs/API-REFERENCE.md` | HTTP + tRPC contracts, rate limits, examples. |
| `docs/CODE-MODULES.md` | Directory-to-responsibility map. |
| `docs/ONBOARDING-GUIDE.md` | Step-by-step ramp plan for new contributors. |
| `docs/ENVIRONMENT-VARIABLES.md` | Secrets checklist and verification tips. |

---

## Contributing

1. Create a feature branch from `main`.
2. Write code + tests, and update any docs affected (API reference, onboarding, etc.).
3. Run `npm run lint && npm run test`.
4. Submit a PR with screenshots or cURL snippets for UI/API changes.

Need help? Open an issue or post in `#apex-engineering`. We aim for the runway lights to stay on—if something is unclear, surface it and we’ll document the fix.
