# Apex Agents Onboarding Guide

Welcome aboard! This guide walks through the first week as an Apex Agents contributor. Think of the repo as a smart city: roads (routes), utilities (services), and zoning maps (docs). We’ll help you get the right keys and navigate safely.

## 1. Prerequisites

| Tool | Version | Install Tips |
| --- | --- | --- |
| Node.js | 18.x LTS | `nvm install 18 && nvm use 18` |
| npm | ≥10 (ships with Node 18) | Use `corepack enable` if you prefer pnpm. |
| PostgreSQL client | any | Needed for debugging directly against Neon if required. |
| Stripe CLI | latest | For local webhook testing (`stripe listen`). |
| Vercel CLI (optional) | latest | Sync env vars and preview deploys. |

Clone the repo:

```bash
git clone git@github.com:YOUR_ORG/apex-agents.git
cd apex-agents
```

## 2. Environment Setup

1. Copy environment template:
   ```bash
   cp docs/ENVIRONMENT-VARIABLES.md .env.example  # optional reference
   cp .env.example .env.local
   ```
2. Populate `.env.local` with:
   - `DATABASE_URL` pointing to Neon (or local Postgres for dev).
   - `OPENAI_API_KEY` (required for AGI, AI Admin, voice).
   - `PINECONE_API_KEY` and `PINECONE_INDEX` if you want semantic search locally.
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (testing plan upgrades).
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` for email flows.
   - `JWT_SECRET` and `ADMIN_UPGRADE_SECRET`.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Generate and apply latest schema:
   ```bash
   npm run db:generate   # optional if schema changed
   npm run db:push
   ```

## 3. Running the Stack

```bash
npm run dev
```

Visit `http://localhost:3000`. The default landing page is the marketing splash; authenticated areas live under `/dashboard`.

### Useful companion commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint flat config check. |
| `npm run test` | Playwright smoke tests (requires browser deps). |
| `npm run health:check` | TSX script verifying DB, OpenAI, Pinecone. |
| `npm run debugger:setup` | Seeds debugger dashboards with sample data. |

## 4. Creating a Dev Account

1. Visit `/signup`.
2. Use your company email. First signup or owner email becomes `admin`.
3. If you need to elevate later, call:
   ```bash
   curl -X POST http://localhost:3000/api/upgrade-admin \
     -H "Content-Type: application/json" \
     -d '{"email":"you@example.com","secret":"<ADMIN_UPGRADE_SECRET>"}'
   ```

## 5. Verifying Key Flows

| Flow | Steps |
| --- | --- |
| **AGI health** | `curl -H "Authorization: Bearer <JWT>" http://localhost:3000/api/agi/status` should return `{ available: true }`. |
| **AI Admin streaming** | Open `/dashboard/ai-admin`, start a chat, watch SSE logs in dev console. |
| **Document upload** | Use the knowledge tab, upload a PDF; check `/api/documents` response for `status=completed`. |
| **Voice command** | Start the Voice Command panel, record “Show me today’s metrics”; confirm JSON response with `metrics`. |
| **Subscriptions** | Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, complete Checkout via `/pricing`, watch console logs. |

## 6. Code Tour (First Week)

- **Day 1:** Read `docs/TECHNICAL-SPEC.md`, `docs/ARCHITECTURE.md`, and skim `src/server/routers`.
- **Day 2:** Launch the app, run through agent creation, workflow execution, document search.
- **Day 3:** Trace a bug or small feature—start from UI → tRPC → service; take notes for future runbooks.
- **Day 4:** Explore AI Admin modules (`src/lib/ai-admin`), try generating a harmless patch (e.g., README change) on a throwaway branch.
- **Day 5:** Pair with another engineer to review `docs/API-REFERENCE.md` vs. actual handlers, ensuring mental models align.

## 7. Common Issues & Fixes

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `OPENAI_API_KEY environment variable is required` | Missing key or using `next dev` without `.env.local`. | Update `.env.local`, restart dev server. |
| Upload fails with `Unsupported file type` | MIME not in allowlist. | Stick to PDF, DOCX, TXT, MD or extend `allowedTypes`. |
| `Webhook signature verification failed` | Stripe CLI secret mismatch. | Run `stripe listen` again and update `STRIPE_WEBHOOK_SECRET`. |
| `Admin access required` errors in AI Admin panel | Account not elevated. | Use `/api/upgrade-admin` or sign up with owner email. |
| Pinecone errors on startup | Keys missing but routes still invoked. | Set `PINECONE_API_KEY` or gate features in UI while absent. |

## 8. Contribution Checklist

1. Run `npm run lint && npm run test`.
2. Update or add documentation (this guide + others) when behavior changes.
3. If touching API routes, sync `docs/API-REFERENCE.md`.
4. For new env vars, document them in `docs/ENVIRONMENT-VARIABLES.md`.
5. Request review via GitHub; include screenshots or cURL snippets for API work.

## 9. Resources

- `docs/CODE-MODULES.md` – map of the codebase.
- `docs/API-REFERENCE.md` – HTTP + tRPC contracts.
- `docs/TECHNICAL-SPEC.md` – system-level goals and constraints.
- `docs/ARCHITECTURE.md` – diagrams + failure modes.
- `docs/ENVIRONMENT-VARIABLES.md` – secrets checklist.

If you get stuck, drop questions in the #apex-engineering Slack channel—remember, there are no silly questions, only unvoiced blockers.

