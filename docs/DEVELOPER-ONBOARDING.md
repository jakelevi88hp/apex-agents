# Apex Agents Developer Onboarding
_Last updated: 2025-11-14_

> Think of Apex Agents like an air-traffic control tower for autonomous AI workers: every new contributor must learn the radar consoles (dashboard UI), flight plans (workflows), and safety protocols (subscription/rate limits) before directing traffic.

## 1. Prerequisites
- **Tooling**: Node.js 20+, npm 10+, pnpm (optional), Git, Docker (optional for Postgres/Pinecone mocks).
- **Accounts**: OpenAI API key, Pinecone API key + index, Stripe test secret & webhook signing secret, GitHub token (only if running AI Admin patch mode).
- **OS Packages**: `libvips`/`imagemagick` optional for PDF parsing, but `pdf-parse` + `mammoth` already bundle binaries for most Linux distros.

## 2. First-Time Setup
1. **Clone & Install**
   ```bash
   git clone <repo>
   cd apex-agents
   npm install
   ```
2. **Environment Variables**
   - Copy `.env.example` to `.env.local`.
   - Fill in at minimum:
     - `OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX`.
     - `DATABASE_URL` (Neon/Local Postgres).
     - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
     - `JWT_SECRET`, `ADMIN_UPGRADE_SECRET` (dev-friendly string).
     - Optional: `GITHUB_TOKEN`, `AI_ADMIN_MODEL`, `S3_BUCKET` replacements.
3. **Database & Schema**
   ```bash
   npm run db:push     # Drizzle push
   npm run db:seed     # Optional test data (scripts/seed.ts)
   ```
4. **Uploads Folder**
   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

## 3. Daily Development Loop
| Action | Command | Notes |
| --- | --- | --- |
| Start dev server | `npm run dev` | Serves App Router + API routes on `http://localhost:3000`. |
| Run lint | `npm run lint` | ESLint 9; fails on unused vars, unsafe any, Tailwind class typos. |
| Execute Playwright tests | `npm run test` | UI smoke tests; use `npm run test:ui` for visual runner. |
| Stress / health checks | `npm run stress:test` / `npm run health:check` | Ensures workflows + AGI endpoints hold under load before merging. |
| Seed sample data | `npm run db:seed` | Adds demo agents, workflows, usage stats. |

Hot reload covers both server + client components. When editing a tRPC router, restart is unnecessary; when editing env-dependant modules (e.g., `stripe`), restart Next dev server.

## 4. Key Concepts (with analogies)
- **tRPC Router** (`src/server/routers/_app.ts`): acts like the airport's flight plan system—every UI request must register here before taking off.
- **Enhanced AGI** (`src/lib/agi/enhanced-core.ts`): comparable to a senior air-traffic controller who keeps a notebook (memory), mood tracker (emotional intelligence), and alternative plans (reasoning steps).
- **Document Pipeline** (`/api/documents/*` + `DocumentProcessor`): works like customs—files come in, get scanned/parsed, then stored as embeddings for quick inspection later.
- **Subscription Guardrails** (`SubscriptionService`): similar to gate assignments—no agent can take off if the airline exceeded its quota.

## 5. Verifying Changes
1. **Unit/Integration**: Add tests near the module (`__tests__` folder). For API routes, consider integration tests under `tests/`.
2. **Manual QA**:
   - Run `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/health`.
   - Upload a PDF via dashboard → Knowledge Base; confirm `/uploads` plus `/api/documents/search`.
   - Trigger `/api/agi/process` using Thunder Client/Postman with valid JWT to confirm AGI reasoning path.
3. **Docs**: Update `docs/TECHNICAL-SPEC.md`, `docs/ARCHITECTURE.md`, or `docs/CODE-MODULES.md` if behavior changes. Link new docs from `README.md`.

## 6. Working with Secrets & Tokens
- Store secrets in `.env.local`; never commit to Git.
- Stripe webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- JWT helpers live in `src/lib/auth/jwt.ts`; use `extractTokenFromRequest` for server-only code. For local tests, generate tokens via `tests/debug/system-health.ts` or Node REPL.
- GitHub automation: set `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` before running `AIAdminAgent` patch mode, otherwise it safely works offline.

## 7. Debugging Tips
- `npm run debugger:setup` seeds debugger tables + ensures `/api/debugger?action=health` works.
- Use `appMonitor` logs to trace errors; `appMonitor.getRecentErrors()` is exposed via `/api/debugger?action=errors`.
- For Pinecone vector issues, run `node scripts/pinecone-stats.ts` (if available) or invoke `PineconeService.getStats()` via a scratch script.
- Voice endpoint: capture network requests from `VoiceCommandPanel`. If transcription fails, inspect server logs for Whisper errors (missing `OPENAI_API_KEY`).

## 8. Deployment Checklist (pre-merge)
1. `npm run lint && npm run test`.
2. `npm run build` locally to ensure no server-only import issues.
3. Confirm `drizzle/migrations` includes latest schema; run `npm run db:generate` if needed.
4. Update docs + README when architecture/API changes occur.
5. Ensure Stripe webhook secret configured in target env; otherwise, subscription updates will silently fail.

## 9. Getting Help
- **Docs**: Start with `README.md`, `docs/TECHNICAL-SPEC.md`, `docs/ARCHITECTURE.md`, `docs/CODE-MODULES.md`.
- **Scripts**: `scripts/production-test-suite.ts` provides realistic smoke runs; `tests/debug/system-health.ts` isolates environment regressions.
- **Community**: For domain questions, inspect `AI_ADMIN_AGENT_README.md` and `docs/AI-ADMIN-KNOWLEDGE-BASE.md`.

Welcome aboard—once comfortable, you can safely direct agents, workflows, and AGI sessions without turbulence.

