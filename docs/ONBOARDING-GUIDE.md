# Apex Agents Onboarding Guide

**Audience:** New engineers and operators  
**Last updated:** 2025-11-14

## 1. Prerequisites
- Node.js 20.x (use `nvm use 20`).
- pnpm 9.x (`corepack enable` recommended).
- PostgreSQL access (Neon connection string) + optional local fallback.
- Pinecone index, OpenAI API key, Stripe test keys, Resend token.
- AWS credentials if targeting S3; local filesystem works for development.

## 2. Environment Setup
1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd apex-agents
   corepack enable
   pnpm install
   ```
2. **Env files**
   - Copy `.env.example` (if unavailable, request from ops) to `.env.local`.
   - Add secrets (see §3). Vercel builds consume `.env.production`.
3. **Verify tooling**
   ```bash
   pnpm lint
   pnpm test -- --list  # quick Playwright smoke
   ```

## 3. Required Environment Variables
| Category | Keys | Notes |
| --- | --- | --- |
| Core | `DATABASE_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`, `ADMIN_UPGRADE_SECRET` | Neon/Postgres URL must allow migrations; admin secret gates `/api/upgrade-admin`. |
| AI/Knowledge | `OPENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX` | Pinecone settings align with `PineconeService`. |
| Storage | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION` | Optional—local uploads directory is fallback. |
| Billing | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_PRO` | Price IDs drive plan mapping. |
| Messaging | `RESEND_API_KEY`, `SENTRY_DSN` | Required for invites + monitoring in higher envs. |

Keep `docs/ENVIRONMENT-VARIABLES.md` synchronized when you add or rotate keys.

## 4. Database & Seed Data
```bash
pnpm db:generate   # regenerate drizzle SQL (if schema changed)
pnpm db:push       # apply schema to Neon/local
pnpm db:seed       # optional sample agents/workflows
```
Use `pnpm db:reset` to rebuild from scratch (drops + seeds).

## 5. Running the Stack
```bash
pnpm dev
```
- App serves at `http://localhost:3000`.
- Ensure browser cookies persist to avoid JWT issues.
- Run `pnpm health:check` to hit system diagnostics.

## 6. Testing & Quality Gates
- `pnpm lint` — ESLint (Next + TypeScript rules).
- `pnpm test` — Playwright headless smoke.
- `pnpm test:ui` — interactive debugging.
- `pnpm stress:test` — synthetic workload against agents/workflows.
- `pnpm security:audit` — dependency scan before release.

## 7. Debugging Checklist
| Symptom | Investigation Steps |
| --- | --- |
| Auth failures | Check `JWT_SECRET`, clear cookies, inspect `/api/health`. |
| Upload errors | Confirm 50 MB limit, verify `uploads/` write permissions, inspect server logs for `DocumentProcessor`. |
| Pinecone search empty | Ensure embeddings finished (doc status `completed`), validate `PINECONE_INDEX`. |
| Stripe webhook failing | Confirm raw body passthrough (Next auto-handled) and `STRIPE_WEBHOOK_SECRET`. Use Stripe CLI to replay. |
| SSE disconnects | Inspect browser network tab for `/api/ai-admin/stream`; ensure OpenAI key set and conversation IDs valid. |

## 8. Contribution Workflow
1. Create feature branch from `main`.
2. Update docs (especially `TECHNICAL-SPEC.md`, `API-REFERENCE.md`, `README.md`) when routers or schema change.
3. Run lint + tests locally before pushing.
4. Open PR with summary + screenshots (if UI) + test evidence.

## 9. Escalation & Support
- Operational alerts flow through `/api/debugger` and Sentry dashboards.
- Stripe or Pinecone incidents: notify platform team, rotate keys if necessary.
- For AGI model regressions, capture prompts/responses and attach to issue for reproducibility.

