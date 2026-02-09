# Apex Agents Overview

## Why Operators Use It
- Control plane for autonomous + human-in-the-loop agents with deterministic guardrails.
- Unified dashboards for executions, billing, and health so ops teams don’t juggle five consoles.
- Drop-in debugging, observability, and subscription enforcement patterns built for production.

## First Ten Minutes
1. `corepack enable && corepack pnpm install`
2. `cp .env.example .env.local` and set database + model keys.
3. `pnpm db:push && pnpm db:seed`
4. `pnpm debugger:setup && pnpm dev`
5. Visit `http://localhost:3000/debugger` → run the guided tour in the Debugger panel.

## Key Surfaces (screenshot cues)
- **Agent Console** – configure contracts + see last runs (screenshot: `/public/docs/agents-console.png`).
- **Debugger Timeline** – streaming traces + patch suggestions (`/public/docs/debugger.png`).
- **Ops Dashboards** – subscription health + usage charts (`/public/docs/ops-dashboards.png`).
- **Control Plane Ops Kit** – diff-triggered gateway snapshots (`docs/addons/control-plane-ops.md`).

## Production Checklist
- `pnpm lint && pnpm test && pnpm health:check`
- `pnpm build` (CI) → Vercel deploy tied to `VERCEL_TOKEN`
- `pnpm stress:test` before pricing/launch changes
- `pnpm security:audit` weekly (cron friendly)

## Distribution Hooks
- Embed Debugger tour video in README hero.
- Link Control Plane Ops Kit as optional add-on for reliability-focused teams.
- Highlight Stripe subscription enforcement + Pinecone knowledge ingestion in release notes.
