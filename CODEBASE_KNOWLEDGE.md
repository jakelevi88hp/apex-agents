# Apex Agents - Complete Codebase Knowledge Base

## Project Overview
- **Framework**: Next.js 14 + React 18 + TypeScript
- **Backend**: tRPC + Express
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Authentication**: OAuth + JWT
- **Payments**: Stripe Integration
- **Total Files**: 199 TypeScript/TSX files

## Architecture Overview

### Frontend Structure
```
src/app/
├── api/                    # API routes (tRPC, webhooks, health checks)
├── dashboard/              # Main application pages
│   ├── agents/            # Agent management
│   ├── workflows/         # Workflow builder
│   ├── ai-admin/          # AI Admin chat interface
│   ├── analytics/         # Analytics dashboard
│   ├── pieces/            # Pieces integration
│   └── settings/          # User settings
├── login/                 # Authentication pages
├── signup/
├── pricing/               # Pricing page
└── layout.tsx             # Root layout

src/components/
├── ui/                    # shadcn/ui components
├── agent-wizard/          # Agent creation wizard
├── workflow-builder/      # Visual workflow editor
├── dashboard/             # Dashboard components
└── knowledge-base/        # Knowledge base UI

src/lib/
├── ai/                    # AI/LLM integrations
├── ai-admin/              # AI Admin specific logic
├── agents/                # Agent execution engine
├── workflow-engine/       # Workflow execution
├── db/                    # Database utilities
├── auth/                  # Authentication
├── stripe/                # Stripe integration
├── stores/                # Zustand state management
└── utils/                 # Utility functions
```

### Backend Structure
```
src/server/
├── routers/               # tRPC route definitions
│   ├── agents.ts         # Agent CRUD + execution
│   ├── workflows.ts      # Workflow management
│   ├── ai-admin.ts       # AI Admin endpoints
│   ├── auth.ts           # Authentication
│   ├── analytics.ts      # Analytics queries
│   ├── execution.ts      # Execution management
│   ├── settings.ts       # User settings
│   ├── subscription.ts   # Subscription management
│   └── search.ts         # Search functionality
├── db/
│   └── schema.ts         # Database schema (Drizzle)
├── middleware/           # tRPC middleware
├── services/             # Business logic services
└── trpc.ts              # tRPC configuration
```

## Key Features

### 1. AI Agents
- **Types**: Research, Analysis, Writing, Code, Decision, Communication, Monitoring, Orchestrator, Custom
- **Capabilities**: Configurable per agent type
- **Execution**: Real-time execution with streaming support
- **Storage**: Agent configs stored in PostgreSQL

### 2. Workflow Engine
- **Visual Builder**: Drag-and-drop workflow creation
- **Execution**: Sequential and parallel task execution
- **Monitoring**: Real-time execution tracking
- **History**: Complete execution logs

### 3. AI Admin
- **Purpose**: Intelligent code analysis and patch generation
- **Capabilities**: 
  - Codebase analysis
  - Patch generation
  - Code review
  - Architecture suggestions
- **Integration**: Direct GitHub integration for patch application

### 4. Knowledge Base
- **Document Upload**: PDF, TXT, Markdown support
- **Indexing**: Vector embeddings for semantic search
- **Search**: Full-text and semantic search
- **Integration**: Used by agents for context

### 5. Analytics
- **Metrics**: Agent execution stats, workflow performance
- **Real-time**: Live dashboard updates
- **Reporting**: Historical data analysis

### 6. Subscription Management
- **Plans**: Free, Pro, Enterprise
- **Stripe Integration**: Payment processing
- **Usage Limits**: Per-plan feature limits
- **Billing**: Monthly/yearly options

## API Endpoints (tRPC Routers)

### Auth Router
- `login` - User authentication
- `logout` - Session termination
- `me` - Current user info
- `signup` - New user registration

### Agents Router
- `list` - Get user's agents
- `get` - Get specific agent
- `create` - Create new agent
- `update` - Modify agent
- `delete` - Remove agent
- `execute` - Run agent
- `getExecutionHistory` - Agent execution logs

### Workflows Router
- `list` - Get user's workflows
- `get` - Get specific workflow
- `create` - Create workflow
- `update` - Modify workflow
- `delete` - Remove workflow
- `execute` - Run workflow
- `getStatus` - Execution status

### AI Admin Router
- `chat` - Conversation endpoint
- `generatePatch` - Generate code patch
- `applyPatch` - Apply patch to repo
- `getPatchHistory` - Patch history
- `analyzeCodebase` - Analyze project structure

### Analytics Router
- `getMetrics` - System metrics
- `getAgentStats` - Agent performance
- `getWorkflowStats` - Workflow performance
- `getExecutionTrends` - Historical trends

## State Management

### Zustand Stores
- `useAuthStore` - Authentication state
- `useVoiceAdminStore` - Voice recording state
- `useAgentStore` - Agent management
- `useWorkflowStore` - Workflow state
- `useExecutionStore` - Execution tracking

## Key Libraries & Integrations

### Frontend Libraries
- `@trpc/react-query` - Type-safe API calls
- `@hookform/react` - Form management
- `zod` - Schema validation
- `zustand` - State management
- `react-flow-renderer` - Workflow visualization
- `framer-motion` - Animations

### Backend Libraries
- `openai` - GPT integration
- `stripe` - Payment processing
- `drizzle-orm` - Database ORM
- `zod` - Validation
- `jsonwebtoken` - JWT handling

### Infrastructure
- **Hosting**: Vercel (Next.js)
- **Database**: PostgreSQL (Neon)
- **Storage**: S3 (File uploads)
- **LLM**: OpenAI GPT-4o
- **Monitoring**: Sentry

## Development Patterns

### Component Structure
- Functional components with hooks
- shadcn/ui for UI components
- Tailwind CSS for styling
- React Query for data fetching

### API Patterns
- tRPC for type-safe APIs
- Middleware for auth/validation
- Error handling with TRPCError
- Input validation with Zod

### Database Patterns
- Drizzle ORM for type safety
- Migrations for schema changes
- Connection pooling
- Query optimization

## Configuration Files
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind CSS config
- `drizzle.config.ts` - Database config
- `package.json` - Dependencies

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret
- `GITHUB_TOKEN` - GitHub integration
- `JWT_SECRET` - Session signing
- `NEXT_PUBLIC_*` - Public variables

## Common Development Tasks

### Adding a New Feature
1. Create database schema in `src/server/db/schema.ts`
2. Run migrations: `pnpm db:push`
3. Create tRPC router in `src/server/routers/`
4. Add procedures with validation
5. Create React components in `src/components/`
6. Wire components to tRPC hooks
7. Add tests in `src/__tests__/`

### Creating an Agent
1. Define agent type in schema
2. Create agent class extending `BaseAgent`
3. Implement `execute()` method
4. Register in `AgentFactory`
5. Add UI in agent wizard

### Building a Workflow
1. Define workflow schema
2. Create workflow executor
3. Implement task handlers
4. Add error handling
5. Create visual builder UI

## Performance Considerations
- Use React Query for caching
- Implement pagination for large datasets
- Optimize database queries with indexes
- Use streaming for long-running operations
- Lazy load components
- Compress assets

## Security Practices
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- SQL injection prevention via ORM
- CORS configuration
- Rate limiting on APIs
- Secure password hashing

## Testing
- Unit tests with Vitest
- Integration tests for APIs
- Component tests with React Testing Library
- E2E tests with Playwright (optional)

## Deployment
- Automatic deployment on push to main
- Database migrations run on deploy
- Environment variables configured in Vercel
- Monitoring with Sentry
- Analytics tracking

## Voice Feature Implementation
- **Component**: `AIAdminVoiceInput.tsx`
- **Hook**: `useSpeechRecognitionAdmin.ts`
- **Store**: `voiceAdminStore.ts`
- **Features**:
  - Real-time speech-to-text
  - Automatic message submission on recording stop
  - Text-to-speech response output
  - Natural conversation flow
  - Console logging for debugging

## Recent Fixes & Improvements
1. **Voice Feature**: Fixed infinite loop and spinning state
2. **Sentry Integration**: Removed duplicate config files
3. **Build Warnings**: Resolved all deprecation warnings
4. **Conversation Flow**: Implemented two-phase system (chat + patch generation)
5. **Error Handling**: Added global error handler

## Next Steps for Enhancement
1. Implement comprehensive codebase indexing
2. Add vector embeddings for semantic search
3. Create intelligent patch suggestions
4. Add real-time collaboration features
5. Implement advanced workflow templates
