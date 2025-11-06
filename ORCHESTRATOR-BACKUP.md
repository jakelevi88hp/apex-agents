# Apex Conscious Orchestrator - Project Backup

**Date:** November 6, 2025  
**Original Path:** /home/ubuntu/apex-conscious-orchestrator  
**Reason for Backup:** Removing to avoid confusion with apex-agents project

## Project Overview

This was a tRPC + Manus Auth + Database template project that was initialized but not actively developed. It contains:

- **Framework:** React 19 + Tailwind 4 + Express 4 + tRPC 11
- **Auth:** Manus OAuth
- **Database:** MySQL/TiDB with Drizzle ORM
- **UI:** shadcn/ui components

## Custom Components Found

1. **ConsciousnessDashboard.tsx** - A consciousness simulation dashboard with:
   - Self-awareness status monitoring
   - Attention events tracking
   - Reasoning traces
   - Emotional states
   - Creative ideas
   - Learning sessions

## tRPC Routers (from ConsciousnessDashboard)

The dashboard expected these tRPC endpoints:
- `consciousness.getSelfStatus`
- `attention.getEvents`
- `reasoning.getTraces`
- `emotion.getStates`
- `creative.getIdeas`
- `learning.getSessions`

## Decision

This project was a template scaffold that wasn't being used. All active development is in **apex-agents** project. Removing this to avoid confusion and focus efforts on the main project.

## Files Preserved

None - this was a fresh template with minimal customization. The ConsciousnessDashboard component was interesting but not implemented with backend logic.

---

*If you need to recreate this project, use the Manus webdev template with tRPC + DB + User features.*
