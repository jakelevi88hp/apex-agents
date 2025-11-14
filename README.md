# Apex Agents

> Autonomous agent operations platform built with Next.js 14 (App Router), TypeScript, tRPC, Drizzle ORM, OpenAI, Pinecone, Stripe, and server-first design.

---

## Feature Highlights
- **Agent Control Plane**: Create, configure, and execute specialized agents (research, analysis, writing, code, decision, monitoring) with execution history and telemetry.
- **Workflow Builder**: Orchestrate multi-step automation with agent, condition, loop, and parallel nodes executed by `WorkflowExecutor`.
- **AGI & AI Admin**: Enhanced AGI chat endpoint plus AI Admin streaming assistant capable of generating and validating code patches.
- **Knowledge Operations**: Upload PDFs/DOCX/TXT/MD, extract text, embed via Pinecone, and run semantic document search.
- **Voice Interface**: Whisper transcription + GPT reasoning to execute dashboard actions hands-free.
- **Subscriptions & Monitoring**: Stripe billing integration, usage tracking, health endpoints, debugger monitor, and subscription analytics.

---

## Architecture at a Glance
| Layer | Tech/Location | Notes |
| --- | --- | --- |
| UI | Next.js App Router (`src/app`), Tailwind, client islands only where needed | Server components default; interactive widgets (dashboards, workflow canvas, voice panel) opt-in with `"use client"`. |
| API | tRPC routers (`src/server/routers`), REST handlers (`src/app/api/**`) | Shared JWT auth, rate limiting, subscription enforcement. |
| Domain Services | `src/lib/agi`, `src/lib/ai-admin`, `src/lib/workflow-engine`, `src/lib/agent-execution` | Pure TypeScript modules to keep business logic framework-agnostic. |
| Data & Storage | PostgreSQL/Neon via Drizzle ORM, Pinecone vectors, `/uploads` (S3-ready) | Schema defined in `src/lib/db/schema.ts`. |
| Integrations | OpenAI, Pinecone, Stripe, GitHub (optional) | Keys provided via environment variables. |

See `docs/TECHNICAL-SPEC.md` and `docs/ARCHITECTURE.md` for deeper diagrams and data contracts.

---

## Quick Start
```bash
git clone <repo>
cd apex-agents
npm install
cp .env.example .env.local    # fill in secrets
npm run db:push               # apply Drizzle schema
npm run db:seed               # optional sample data
npm run dev
```
Visit `http://localhost:3000` and sign up/login to start using the dashboard.

---

## Key Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server with hot reload for UI + API routes. |
| `npm run build && npm run start` | Production build/start. |
| `npm run lint` | ESLint 9 (strict). |
| `npm run test` / `npm run test:ui` | Playwright regression suite / headed runner. |
| `npm run db:push` / `npm run db:generate` | Drizzle migrations. |
| `npm run health:check` | Runs `tests/debug/system-health.ts`. |
| `npm run stress:test` | Load tests for AGI + workflows. |
| `npm run security:audit` | Dependency audit plus custom checks. |

---

## Environment Variables
| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres/Neon connection string used by Drizzle. |
| `OPENAI_API_KEY` | Required for agent execution, Enhanced AGI, AI Admin, Whisper transcription, embeddings. |
| `PINECONE_API_KEY`, `PINECONE_INDEX` | Vector search for knowledge base. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Billing + webhook validation. |
| `JWT_SECRET` | HMAC secret for auth tokens. |
| `ADMIN_UPGRADE_SECRET` | Secret phrase for `/api/upgrade-admin`. |
| `AI_ADMIN_MODEL`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` | Optional AI Admin GitHub patch integration. |
| `S3_*` (optional) | Swap local `/uploads` with object storage. |

See `docs/ENVIRONMENT-VARIABLES.md` for expanded list.

---

## Testing & QA
1. `npm run lint`
2. `npm run test` (Playwright)
3. Manual smoke:
   - `/api/health` and `/api/health/db`
   - Upload a document and confirm Pinecone search
   - Trigger `POST /api/agi/process` with a valid JWT
4. For release builds run `npm run build` followed by `npm run test:production`.

---

## Deployment Checklist
- [ ] Secrets configured for target environment (database, OpenAI, Pinecone, Stripe, JWT, GitHub if needed).
- [ ] `drizzle-kit` migrations applied (`npm run db:push` or SQL migration pipeline).
- [ ] Stripe webhook endpoint reachable; verify via `stripe listen`.
- [ ] Monitoring endpoints (`/api/monitoring/metrics`, `/api/debugger?action=health`) return healthy status.
- [ ] `docs/` updated (technical spec, architecture, API reference) when behavior changes.

---

## Documentation
- `docs/README.md` – documentation index
- `docs/TECHNICAL-SPEC.md` – system goals & contracts
- `docs/ARCHITECTURE.md` – Mermaid diagrams
- `docs/API-REFERENCE.md` – tRPC + REST details
- `docs/CODE-MODULES.md` – module responsibilities
- `docs/DEVELOPER-ONBOARDING.md` – setup + workflows

For AI Admin specifics see `AI_ADMIN_AGENT_README.md` + `docs/AI-ADMIN-KNOWLEDGE-BASE.md`.

---

## Support & Contributions
- File issues/ideas using the dashboard suggestion widget (persists to `user_suggestions`) or submit PRs referencing updated docs/tests.
- When adding new endpoints, update `docs/API-REFERENCE.md` and include lint/tests in the PR.

Happy building! Autonomous operations start here.
