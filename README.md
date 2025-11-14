<p align="center">
  <strong>Apex Agents Platform</strong><br/>
  Multi-agent orchestration, AGI workflows, and subscription-aware automation built on Next.js 14.
</p>

## Overview
- **What:** Production-ready AI agent control plane with AGI chat, workflow automation, document intelligence, voice commands, and billing.
- **How:** Next.js App Router + tRPC + Drizzle ORM backed by Postgres, Pinecone, Stripe, and OpenAI (GPT-4 family).
- **Why:** Give operators and engineers a single cockpit to configure agents, feed knowledge, monitor executions, and monetize usage.

## Key Capabilities
- Agent builder with configurable templates, execution history, and analytics.
- Workflow canvas tied to the execution engine for multi-step orchestration.
- AGI core combining memory, reasoning, emotional intelligence, and creativity modules (`/api/agi/process`).
- AI Admin assistant that streams chat, generates/apply patches, and integrates with GitHub + file context.
- Knowledge uploads with PDF/DOCX/TXT/MD extraction, Pinecone embeddings, and semantic search.
- Voice interface powered by Whisper transcription + command interpreter.
- Subscription + usage enforcement via Stripe webhooks, monitors, and in-app billing surfaces.

## Architecture Snapshot
- Next.js server components render dashboards; client components opt-in via `"use client"`.
- REST API routes cover AGI, AI Admin SSE, documents, monitoring, voice, and Stripe webhooks.
- tRPC routers expose strongly typed mutations/queries for agents, workflows, analytics, settings, and subscriptions.
- Domain services under `src/lib` encapsulate AGI engines, Pinecone integration, rate limiting, subscription enforcement, and monitoring.
- Postgres (via Drizzle) stores users, agents, workflows, executions, documents, AGI memory, subscriptions, and AI Admin patches.
- External services: OpenAI (chat/embeddings/Whisper), Pinecone (vector DB), Stripe (billing), S3/local storage (uploads).
- Mermaid diagrams and deeper details live in `docs/apex/architecture.md`.

## Quick Start
```bash
# Install dependencies
pnpm install

# Configure environment (sample keys shown in docs/apex/onboarding-guide.md)
cp .env.example .env.local
# then fill DATABASE_URL, OPENAI_API_KEY, PINECONE_API_KEY, STRIPE credentials, etc.

# Apply schema + seed data
pnpm db:push
pnpm db:seed

# Run the app
pnpm dev
# Visit http://localhost:3000 and monitor http://localhost:3000/api/health
```

## Testing & Tooling
| Command | Purpose |
| --- | --- |
| `pnpm lint` | ESLint over Next.js + TypeScript sources. |
| `pnpm test` | Playwright UI tests. |
| `pnpm stress:test` | Stress harness under `tests/stress`. |
| `pnpm health:check` | End-to-end system validation script. |
| `pnpm debugger:setup` | Configure debugger integrations. |

## Documentation
- [`docs/apex/technical-spec.md`](docs/apex/technical-spec.md) – requirements, flows, and acceptance checklist.
- [`docs/apex/api-reference.md`](docs/apex/api-reference.md) – REST + tRPC surface with sample requests.
- [`docs/apex/architecture.md`](docs/apex/architecture.md) – Mermaid diagrams + context.
- [`docs/apex/module-catalog.md`](docs/apex/module-catalog.md) – directory-level map of important modules.
- [`docs/apex/onboarding-guide.md`](docs/apex/onboarding-guide.md) – setup, smoke tests, debugging tips.

Treat these files as the living source of truth; update them when features evolve.

## Deployment Notes
- Supports Vercel-style deployments or any Node 18+ environment; ensure all env vars are set.
- Long-running background work (document processing, monitors) currently runs inside API handlers—plan for dedicated workers at scale.
- Stripe webhooks require the raw body; see `/api/webhooks/stripe/route.ts` for implementation details.

## Contributing
1. Create a branch, run lint/tests before opening a PR.
2. Document new APIs or flows in `docs/apex/*`.
3. Use Tailwind for styling, keep React components server-side unless interactivity is required.
4. Follow JSDoc + TypeScript best practices in `src/lib` and `src/server`.

Happy building! Let the AGI control tower keep every agent flight on schedule. 