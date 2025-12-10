<!-- Auto-generated guidance for AI coding agents. Edit only if you understand repository conventions. -->
# Apex Agents — Copilot Instructions

Summary
- Purpose: Help AI coding agents be immediately productive in this repo by giving concise, actionable repo-specific rules, commands, and examples.

Quick orientation
- Framework: Next.js 14 (App Router) + TypeScript. Primary UI code lives under `app/` (React Server Components by default).
- Backend/API: Hybrid API routes under `app/api/*` and a typed tRPC surface at `/api/trpc`.
- Data: Drizzle ORM + Neon Postgres (`drizzle.config.ts`, `migrations/`), Pinecone for vectors, optional S3 for documents.

Must-follow rules (enforceable)
- File placement: Add pages/layouts in `app/`. Default to server components; add `"use client"` only when you need browser hooks or events.
- Styling: Use Tailwind CSS exclusively. Follow tokens in `tailwind.config.js`; do not add new styling libraries.
- Secrets: Never return or embed secret env vars to client code. Server-only access via environment variables (see `docs/ENVIRONMENT-VARIABLES.md`).

Typical developer flows & commands (examples pulled from `package.json`)
- Install: `pnpm install` (project uses `pnpm`, see `pnpm-lock.yaml`).
- Dev server: `pnpm dev` (runs `next dev`).
- Build / run: `pnpm build` then `pnpm start`.
- Database: `pnpm db:generate` (drizzle-kit generate), `pnpm db:push`, `pnpm db:seed`, `pnpm db:reset`.
- Tests: Unit/jest `pnpm test`; e2e Playwright `pnpm test:e2e` (UI variants: `--ui`, `--headed`, `--debug`).
- Diagnostics: `pnpm health:check`, `pnpm stress:test`, `pnpm security:audit`.
- Useful scripts: `pnpm analyze:bundle`, `pnpm debugger:setup`, `pnpm test:production`.

Where to look for authoritative info
- High-level: `README.md` (root) and `docs/README.md` (docs index) — follow the reading order described there.
- Project rules: `.cursorrules` contains explicit agent-oriented conventions (RSC-first, Tailwind, testing locations).
- DB config: `drizzle.config.ts` and `migrations/`.
- Seed/helpers: `scripts/seed.ts`, `scripts/setup-debugger.ts`.

Patterns & conventions to follow (concrete examples)
- Components: prefer server components; put UI components under `components/` and tests in adjacent `__tests__` folders (e.g., `components/ui/Button.tsx` → `components/ui/__tests__/Button.test.tsx`).
- API handlers: put server-side logic in `app/api/*` (not in page components). Use `src/lib/` for domain services (AGI core, Pinecone client, subscription enforcement).
- Typing: Use TypeScript types and JSDoc on exported functions. Prefer explicit types for API payloads and DB models.
- Long-running tasks: follow existing monitors/wrappers (see `src/lib/monitoring` and `SubscriptionMonitor` references in docs).

Integration points & external dependencies
- OpenAI / Anthropic / LangChain clients — server-side only; see `src/lib/ai` modules.
- Pinecone vector index — vector upserts/queries live in `src/lib/pinecone` (or similar).
- Stripe / Resend / S3 — integrations are in `src/lib/integrations` and webhooks under `app/api/webhooks`.
- Observability: Sentry config files `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts` — keep error boundaries and instrumentation intact.

Editor / CI / task notes
- VS Code tasks: repo includes Docker build/run tasks (`docker-build`, `docker-run`) — useful for containerized testing.
- CI expectations: run `pnpm lint` → `pnpm test` → `pnpm test:e2e` as part of PR gating.

What to avoid
- Do not convert server components to client components unless necessary.
- Do not place secrets in code or commit `.env` files. Use `docs/ENVIRONMENT-VARIABLES.md` as the source for required env keys.
- Avoid adding new global state libraries without matching the project's conventions (Zustand is present; prefer existing patterns).

If you change routing, API contracts, or DB schemas
- Update `docs/ARCHITECTURE.md` and `docs/CODE-MODULES.md` with a short note and update `drizzle` migrations. Add or update tests for changed surface area.

When in doubt, inspect these files first
- `package.json` — canonical scripts and deps.
- `README.md` and `docs/README.md` — onboarding and architecture guidance.
- `.cursorrules` — repository-specific agent rules.
- `app/`, `src/lib/`, `drizzle.config.ts`, `migrations/`, `scripts/`.

Feedback
- If any instruction is missing or unclear, open an issue or ask the repo owner for the intended pattern. After your clarification, update this file to keep future agents consistent.

-- End of file
