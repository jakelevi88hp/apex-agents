# Apex Agents Documentation Index

**Last updated:** 2025-11-14

| File | Purpose | What you will find |
| --- | --- | --- |
| `TECHNICAL-SPEC.md` | Product and system requirements | Scope, functional and non-functional constraints, interface contracts |
| `ARCHITECTURE.md` | System and data-flow diagrams | Mermaid context, sequence, and pipeline diagrams with explanatory notes |
| `API-REFERENCE.md` | Integration surface area | REST endpoints, tRPC procedures, auth model, and rate limits |
| `CODE-MODULES.md` | Codebase topology | Directory-by-directory responsibilities, key entry points, and shared utilities |
| `ONBOARDING-GUIDE.md` | Contributor quick start | Environment setup, env vars, database/bootstrap steps, and troubleshooting |
| `ENVIRONMENT-VARIABLES.md` | Secret reference | Required keys for local, staging, and production (kept in sync with onboarding guide) |

## Reading Order
1. Start with `TECHNICAL-SPEC.md` for context and requirements.
2. Use `ARCHITECTURE.md` to visualize service boundaries before touching code.
3. Reference `CODE-MODULES.md` when locating functionality.
4. Keep `API-REFERENCE.md` open while building or testing integrations.
5. Follow `ONBOARDING-GUIDE.md` the first time you run the stack.

## Maintenance Expectations
- Update the “Last updated” stamp whenever substantial changes land.
- Keep diagrams and specs aligned with the implemented Drizzle schema and routers.
- Mirror any environment-variable additions in both `ENVIRONMENT-VARIABLES.md` and `ONBOARDING-GUIDE.md`.
- Cross-link new domain-specific docs from this index to keep the folder navigable.

