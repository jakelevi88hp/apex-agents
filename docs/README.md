# Apex Agents Documentation Index
_Last updated: 2025-11-14_

| Category | File | Purpose |
| --- | --- | --- |
| System Overview | [`TECHNICAL-SPEC.md`](./TECHNICAL-SPEC.md) | High-level goals, architecture snapshot, data contracts, NFRs. |
| Architecture | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Mermaid diagrams for system context, AGI flow, document pipeline, telemetry. |
| Code Reference | [`CODE-MODULES.md`](./CODE-MODULES.md) | Responsibilities and extension notes per module (UI, AGI, workflows, billing). |
| API Surface | [`API-REFERENCE.md`](./API-REFERENCE.md) | REST + tRPC endpoint definitions, auth requirements, payload schemas. |
| Onboarding | [`DEVELOPER-ONBOARDING.md`](./DEVELOPER-ONBOARDING.md) | Step-by-step setup, daily dev loop, testing, deployment checklist. |
| AI Admin Guides | [`AI-ADMIN-KNOWLEDGE-BASE.md`](./AI-ADMIN-KNOWLEDGE-BASE.md), [`ai-admin-self-improvement-guide.md`](./ai-admin-self-improvement-guide.md) | Deep dives into the autonomous patching agent. |
| Deployment & Ops | [`DEPLOYMENT-GUIDE.md`](./DEPLOYMENT-GUIDE.md), [`PRODUCTION-READINESS.md`](./PRODUCTION-READINESS.md), [`deployment-verification-guide.md`](./deployment-verification-guide.md) | Environments, rollout process, verification steps. |
| Testing | [`FRONTEND-TESTING-GUIDE.md`](./FRONTEND-TESTING-GUIDE.md), [`FINAL-TESTING-GUIDE.md`](./FINAL-TESTING-GUIDE.md) | Checklists for manual + automated validation. |

## How to Use This Folder
1. **Start Here**: skim `TECHNICAL-SPEC.md` + `ARCHITECTURE.md` for the system mental model.
2. **Build/Debug**: browse `CODE-MODULES.md` and module-specific READMEs (AI Admin, debugger, PWA).
3. **Integrate**: consult `API-REFERENCE.md` for payloads and sample calls, especially when scripting against tRPC or REST endpoints.
4. **Ramp Up**: follow `DEVELOPER-ONBOARDING.md` to configure a workstation; reference onboarding analogies for context.
5. **Ship**: before release, review deployment + testing guides plus `PRODUCTION-READINESS.md`.

Missing something? Add a new markdown file in this directory and link it in the table above so the index stays evergreen.

