# Apex Agents Module Catalog

Use this file as a map when navigating the codebase. When an area feels abstract, imagine the system as a layered research lab: the lobby (App Router) greets users, the labs (lib modules) run experiments, and the archive (db schemas) stores every result.

## 1. Top-Level Structure
| Path | Description |
| --- | --- |
| `src/app` | Next.js App Router pages (login, signup, dashboard subroutes, pricing, auth flows) plus API routes under `app/api/*`. Defaults to server components; client components opt into `"use client"`. |
| `src/components` | Reusable UI building blocks: agent wizard, workflow builder canvas, knowledge-base widgets, PDF viewer, notifications, voice command panel. Tailwind-only styling. |
| `src/lib` | Domain services and helper modules (AGI, AI Admin, auth, document processing, Pinecone integration, monitoring, subscription enforcement, workflow engine, rate limiting). |
| `src/server` | tRPC context + routers (`agents`, `workflows`, `analytics`, `aiAdmin`, `settings`, `subscription`, etc.) and supporting services. |
| `drizzle/` + `src/lib/db` | Database config plus Drizzle schema definitions (users, agents, workflows, executions, subscriptions, AGI memory, AI patches, suggestions, etc.). |
| `scripts/` | Operational scripts (seeding, security audit, debugger setup, production test suite). |
| `tests/` | Playwright suites, stress tests, debugging scripts for health verification. |

## 2. High-Impact Modules

### 2.1 AGI Suite (`src/lib/agi/*`)
| File | Role |
| --- | --- |
| `enhanced-core.ts` | Orchestrates memory, reasoning, emotion, creativity, and consciousness logging per AGI request. |
| `memory.ts` + `agi-memory` schemas | CRUD for episodic, semantic, working, procedural, and emotional memory tables. |
| `reasoning.ts`, `creativity.ts`, `emotion.ts` | Specialized engines for reasoning strategies, ideation techniques, and empathy generation. |
| `conversation.ts` | Manages AGI conversations, summaries, and analysis. |

### 2.2 AI Admin (`src/lib/ai-admin/*`)
| Component | Highlights |
| --- | --- |
| `agent.ts` | Factory that bundles prompts, codebase context, and OpenAI calls. |
| `conversation-manager.ts` | Stores conversation trees, branching, streaming history. |
| `plain-language-patch.ts`, `patch-storage.ts`, `patch-validator.ts` | Translate natural language into structured patches, persist them, enforce integrity. |
| `file-context-gatherer.ts`, `github-service.ts` | Harvest local files and GitHub issues/PRs for better context, caching file trees when needed. |
| `vision-analyzer.ts` | Sends image URLs through Vision APIs for UI screenshot analysis. |

### 2.3 Knowledge & Search
- `document-processor.ts`: Extracts text from PDF/DOCX/TXT/MD, chunks text, generates excerpts.
- `pinecone-service.ts`: Lazy-loads Pinecone + OpenAI to embed/search vectors with per-user namespace filtering.
- `app/api/documents/*`: REST endpoints for CRUD + search flows.

### 2.4 Agent Execution & Workflows
- `lib/agent-execution/executor.ts`: Handles OpenAI calls, execution logging, streaming.
- `lib/workflow-engine/*`: Runtime for multi-step workflows, including step scheduling and failure handling.
- `components/workflow-builder/*`: Client UI for visual editing of workflow graphs.

### 2.5 Monitoring & Reliability
- `lib/debugger/monitor.ts`: Aggregates service health, error stats, exposed via `/api/debugger`.
- `lib/monitoring/subscription-monitor.ts` and `webhook-monitor.ts`: Collect billing/usage anomalies and webhook metrics.
- `tests/debug/system-health.ts`: Scriptable regression test for ops to run post-deploy.

### 2.6 Subscription & Billing
- `lib/subscription/service.ts`: Trial initialization, usage counters, plan upgrades, limit checks, cancellations.
- `lib/subscription/config.ts`: Declarative plan definitions (trial/premium/pro) with quotas.
- `app/api/webhooks/stripe/route.ts`: Single entry for Stripe webhook signing + event branching.

### 2.7 Auth & Security
- `lib/auth/jwt.ts`, `lib/auth.ts`: Token extraction + verification, owner auto-upgrade, password hashing.
- `app/api/upgrade-admin/route.ts`: Controlled elevation for support with shared secret.
- Rate limit middleware at `lib/rate-limit.ts`, consumed by AGI + upload endpoints.

## 3. UI Feature Bundles
| Folder | Description |
| --- | --- |
| `src/app/dashboard/agents`, `/workflows`, `/analytics`, `/knowledge`, `/ai-admin` | Server components that fetch data (often via tRPC) and compose specialized widgets. |
| `src/components/agent-wizard/*` | Multi-step wizard for configuring agent templates, preview, and testing. |
| `src/components/workflow-builder/*` | Drag-and-drop canvas built on React Flow for orchestrating agent steps. |
| `src/components/VoiceCommandPanel.tsx` | Client component that records microphone input and posts to `/api/voice`. |
| `src/components/providers.tsx` | Wraps React Query, ThemeContext, and other client providers. |

## 4. Scripts & Tooling
- `scripts/seed.ts`: Inserts baseline agents/workflows/testing data.
- `scripts/security-audit.ts`: Runs dependency + secret scans.
- `scripts/production-test-suite.ts`: Smoke-test critical paths (auth, AGI, billing) in CI.
- Playwright config at `playwright.config.ts` plus tests under `tests/` for end-to-end coverage.

## 5. Extensibility Tips
- **Add a new API route:** Create `src/app/api/<feature>/route.ts`, use Next.js `NextRequest/NextResponse`, import shared lib modules, avoid duplicating auth logic (reuse `extractTokenFromRequest` + `verifyToken`).
- **Add a new tRPC procedure:** Extend the relevant router in `src/server/routers`, keep input schemas in `zod`, and prefer service-level helpers from `src/lib`.
- **Create a new module:** Co-locate under `src/lib/<domain>` with pure TypeScript, JSDoc blocks, and unit tests in adjacent `__tests__` folders.
- **Analogy:** Treat each new domain feature as a new lab bench—plug it into the existing electrical grid (auth, db, logging) rather than rewiring the entire building.

