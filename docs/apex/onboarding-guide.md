# Apex Agents Onboarding Guide

Welcome aboard! Picture the platform like a multi-story control center: ground floor hosts the Next.js UI, middle floors run tRPC and REST services, and the basement stores data (Postgres, Pinecone, Stripe). This guide walks you through powering up every floor safely.

## 1. Prerequisites
- **Node.js 18.18+** (match `.nvmrc` if present).
- **pnpm 9+** (project uses a lockfile for pnpm).
- **Postgres 15+** (local or managed; Neon-compatible).
- **Pinecone index** and **OpenAI API key** with GPT-4 and embeddings access.
- **Stripe test account** with webhook secret.
- Optional: AWS S3 (or compatible) for file uploads; otherwise local `uploads/` is used.

## 2. Environment Setup
```bash
# Step 1: Clone and install
git clone git@github.com:org/apex-agents.git
cd apex-agents
pnpm install

# Step 2: Copy env template (create if missing)
cp .env.example .env.local  # if file exists

# Step 3: Populate secrets
cat <<'EOF' >> .env.local
DATABASE_URL=postgres://user:pass@localhost:5432/apex
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=apex-corporate-brain
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_UPGRADE_SECRET=apex-admin-secret-2025
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```
- **Tip:** Treat `.env.local` like a flight checklist—never commit it, always double-check keys before takeoff.

## 3. Database & Migrations
```bash
# Step 1: Generate SQL from Drizzle schemas (optional)
pnpm db:generate

# Step 2: Push schema to Postgres
pnpm db:push

# Step 3: Seed starter data (agents, workflows, test users)
pnpm db:seed
```
- If you prefer manual SQL, the `drizzle/migrations` folder contains deterministic migration scripts.

## 4. Running the App
```bash
# Step 1: Launch dev server with hot reload
pnpm dev

# Step 2: Verify from another shell
curl http://localhost:3000/api/health | jq
```
Expected output snippet:
```json
{
  "status": "healthy",
  "services": {
    "api": { "status": "up" },
    "database": { "status": "up" }
  }
}
```
- Visit `http://localhost:3000` for the UI, `http://localhost:3000/dashboard` after signup/login.

## 5. Testing & Quality Gates
| Command | Purpose |
| --- | --- |
| `pnpm lint` | ESLint (Next.js config) with TypeScript strictness. |
| `pnpm test` | Playwright test suite (requires running server). |
| `pnpm stress:test` | TS-based stress runner under `tests/stress`. |
| `pnpm health:check` | System health script that hits AGI, documents, billing flows. |

## 6. Feature Smoke Tests
1. **Signup/Login:** Use the UI; first user or owner email becomes admin automatically.
2. **Upgrade Admin:** `curl -X POST /api/upgrade-admin` with shared secret to promote test accounts.
3. **Agent Execution:** From dashboard, create an agent and click “Run Test”; check `executions` table for records.
4. **Knowledge Upload:** Upload a PDF under Knowledge tab; confirm `/api/documents` shows `completed` and Pinecone index grows.
5. **AGI Chat:** Hit `/api/agi/process` via Postman with a JWT; ensure response includes `thoughts`.
6. **Voice Command:** Use `VoiceCommandPanel` or `curl` with audio file to run an agent or fetch metrics.

## 7. Debugging Tips
- **tRPC errors:** Check server console for `TRPCError` stack plus client network tab.
- **Upload failures:** Inspect server logs for `DocumentProcessor` errors and ensure `uploads/` is writable.
- **Stripe webhooks:** Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- **Rate limits:** AGI (20/min) and upload (10/hr) will return `429`. Look for `Retry-After` header.
- **Analogy:** Treat debugging like air-traffic rerouting—if one runway (API) is congested, inspect the preceding tower (auth, quotas) before reattempting takeoff.

## 8. Common Pitfalls
| Symptom | Fix |
| --- | --- |
| `OPENAI_API_KEY` error on dev start | Ensure the key exists before hitting AGI or voice endpoints; restart server after adding. |
| `PineconeService` crashes | Index name mismatch or API key missing; double-check `PINECONE_INDEX`. |
| SSE disconnects | Browser must keep `/api/ai-admin/stream` connection open; ensure reverse proxy permits long-lived requests. |
| Stripe webhook 400 | Verify webhook secret and send raw body (Next.js automatically gives `request.text()` inside handler). |

## 9. Ready for Contributions
- Run `pnpm lint` and `pnpm test` before pushing.
- Document new APIs inside `docs/apex/api-reference.md`.
- Update `docs/apex/module-catalog.md` if new directories/modules are added.
- For big features, add Mermaid diagrams to `docs/apex/architecture.md` to keep the “control tower” view accurate.

