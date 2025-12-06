# Apex Agents - Codebase Knowledge Base

## Project Overview
- **Framework**: Next.js 14 + React 18 + TypeScript
- **Backend**: tRPC + Express
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Authentication**: OAuth + JWT

## Architecture

### Frontend (src/app & src/components)
- **Pages**: dashboard (agents, workflows, ai-admin, analytics, settings), login, signup, pricing
- **Components**: shadcn/ui, agent-wizard, workflow-builder, dashboard components
- **State**: Zustand stores (auth, voice, agents, workflows, execution)

### Backend (src/server)
- **Routers**: agents, workflows, ai-admin, auth, analytics, execution, settings, subscription, search
- **Database**: PostgreSQL with Drizzle ORM
- **Services**: LLM integrations, payment processing, file storage

## Key Features

### 1. AI Agents
- Types: Research, Analysis, Writing, Code, Decision, Communication, Monitoring, Orchestrator
- Real-time execution with streaming
- Configurable per agent type

### 2. Workflow Engine
- Drag-and-drop visual builder
- Sequential and parallel execution
- Real-time monitoring and history

### 3. AI Admin
- Code analysis and patch generation
- Conversation-based interface
- Voice input/output support
- GitHub integration for patches

### 4. Knowledge Base
- Document upload (PDF, TXT, Markdown)
- Vector embeddings for semantic search
- Integration with agents

### 5. Analytics & Monitoring
- Agent execution stats
- Workflow performance metrics
- Real-time dashboard

## API Endpoints (tRPC)

### Core Routers
- **auth**: login, logout, me, signup
- **agents**: list, get, create, update, delete, execute, getExecutionHistory
- **workflows**: list, get, create, update, delete, execute, getStatus
- **ai-admin**: chat, generatePatch, applyPatch, getPatchHistory, analyzeCodebase
- **analytics**: getMetrics, getAgentStats, getWorkflowStats, getExecutionTrends

## Tech Stack

### Frontend Libraries
- @trpc/react-query, @hookform/react, zod, zustand, react-flow-renderer, framer-motion

### Backend Libraries
- openai, stripe, drizzle-orm, jsonwebtoken, express

### Infrastructure
- **Hosting**: Vercel
- **Database**: PostgreSQL (Neon)
- **Storage**: S3
- **LLM**: OpenAI (GPT-4o, GPT-4 Turbo)
- **Payments**: Stripe

## Development Patterns

### Component Structure
- Functional components with React hooks
- shadcn/ui components + Tailwind CSS
- React Query for data fetching

### API Patterns
- tRPC for type-safe APIs
- Zod for input validation
- TRPCError for error handling
- Middleware for auth/validation

### Database
- Drizzle ORM for type safety
- Migrations for schema changes
- Connection pooling

## Common Tasks

### Adding a Feature
1. Update schema in `src/server/db/schema.ts`
2. Run `pnpm db:push`
3. Create tRPC router in `src/server/routers/`
4. Create React components in `src/components/`
5. Wire components to tRPC hooks

### Creating an Agent
1. Define agent type in schema
2. Create agent class extending `BaseAgent`
3. Implement `execute()` method
4. Register in `AgentFactory`
5. Add UI in agent wizard

## Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret
- `GITHUB_TOKEN` - GitHub integration
- `JWT_SECRET` - Session signing

### Config Files
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind CSS config
- `drizzle.config.ts` - Database config

## Voice Feature
- **Component**: `AIAdminVoiceInput.tsx`
- **Hook**: `useSpeechRecognitionAdmin.ts`
- **Store**: `voiceAdminStore.ts`
- **Features**: Real-time speech-to-text, text-to-speech output, automatic submission

## Deployment
- Automatic deployment on push to main
- Database migrations run on deploy
- Environment variables configured in Vercel
- Monitoring with Sentry
