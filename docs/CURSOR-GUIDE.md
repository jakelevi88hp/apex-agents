# Apex Agents - Complete Guide for Cursor AI

**Last Updated:** November 9, 2024  
**Version:** 1.0  
**Purpose:** Help Cursor AI understand and contribute to the Apex Agents platform

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Codebase Structure](#codebase-structure)
4. [Key Features](#key-features)
5. [Development Workflow](#development-workflow)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Deployment](#deployment)
9. [Current Status](#current-status)
10. [Remaining Tasks](#remaining-tasks)

---

## 🎯 Project Overview

### What is Apex Agents?

**Apex Agents** is a comprehensive AI agent orchestration platform that enables users to create, manage, and deploy autonomous AI agents with advanced capabilities including:

- **Multi-Agent Orchestration** - Create and manage multiple AI agents
- **Workflow Automation** - Visual workflow builder with React Flow
- **AGI System** - Advanced General Intelligence with consciousness, memory, reasoning, creativity, and emotional intelligence
- **AI Admin** - Natural language code generation and patch management
- **Knowledge Base** - Document upload, processing, and semantic search with Pinecone
- **Analytics** - Real-time performance monitoring and insights

### Tech Stack

**Frontend:**
- Next.js 15.0.3 (App Router)
- React 19.0.0-rc
- TypeScript 5.x
- Tailwind CSS 4.0.0-alpha
- tRPC 11.0.0-rc for type-safe APIs
- React Flow for workflow visualization
- Shadcn/ui components

**Backend:**
- Next.js API Routes
- tRPC for API layer
- Drizzle ORM for database
- PostgreSQL (Neon serverless)
- Pinecone for vector search

**AI/ML:**
- OpenAI GPT-4o for AGI and AI Admin
- OpenAI Embeddings for semantic search
- Custom AGI modules (consciousness, memory, reasoning, creativity, emotion)

**Infrastructure:**
- Vercel for hosting
- Neon for PostgreSQL database
- Pinecone for vector database
- GitHub for version control

### Key Differentiators

1. **Conscious AGI System** - Not just a chatbot, but a system with episodic memory, emotional intelligence, and creative reasoning
2. **Natural Language Code Generation** - AI Admin can generate production-ready code patches from plain English
3. **Visual Workflow Builder** - Drag-and-drop interface for complex agent workflows
4. **Semantic Knowledge Base** - Upload documents and search with natural language

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │   AGI    │  │AI Admin  │  │Knowledge │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ tRPC (Type-safe API)
┌────────────────────────┴────────────────────────────────────┐
│                    Backend (tRPC Routers)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Agents  │  │Workflows │  │   AGI    │  │AI Admin  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│  PostgreSQL  │  │   Pinecone  │  │  OpenAI    │
│    (Neon)    │  │   (Vectors) │  │  (GPT-4o)  │
└──────────────┘  └─────────────┘  └────────────┘
```

### Data Flow

1. **User Request** → Frontend Component
2. **tRPC Call** → Type-safe API request
3. **Router Handler** → Business logic execution
4. **Database Query** → Drizzle ORM → PostgreSQL
5. **AI Processing** → OpenAI API (if needed)
6. **Response** → Type-safe return to frontend

### Authentication Flow

1. User logs in → `/api/auth/login`
2. JWT token generated and stored in cookie
3. Middleware validates token on protected routes
4. User context available in all tRPC procedures

---

## 📁 Codebase Structure

### Directory Layout

```
apex-agents/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── dashboard/         # Main dashboard pages
│   │   │   ├── agents/        # Agents management
│   │   │   ├── workflows/     # Workflow builder
│   │   │   ├── agi/           # AGI chat interface
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── knowledge/     # Knowledge base
│   │   │   └── settings/      # User settings
│   │   ├── admin/             # Admin-only pages
│   │   │   └── ai/            # AI Admin interface
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── trpc/          # tRPC handler
│   │   │   ├── agi/           # AGI endpoints
│   │   │   └── documents/     # Document upload
│   │   └── layout.tsx         # Root layout
│   │
│   ├── server/                # Backend logic
│   │   ├── routers/           # tRPC routers
│   │   │   ├── agents.ts      # Agent CRUD operations
│   │   │   ├── workflows.ts   # Workflow operations
│   │   │   ├── agi.ts         # AGI operations
│   │   │   ├── ai-admin.ts    # AI Admin operations
│   │   │   ├── analytics.ts   # Analytics queries
│   │   │   ├── knowledge.ts   # Knowledge base operations
│   │   │   └── settings.ts    # User settings
│   │   ├── db.ts              # Database client
│   │   └── trpc.ts            # tRPC setup
│   │
│   ├── lib/                   # Shared utilities
│   │   ├── agi/               # AGI modules
│   │   │   ├── enhanced-core.ts      # Main AGI orchestrator
│   │   │   ├── memory.ts             # Memory system
│   │   │   ├── conversation.ts       # Conversation tracking
│   │   │   ├── reasoning.ts          # Reasoning engine
│   │   │   ├── emotion.ts            # Emotional intelligence
│   │   │   └── creativity.ts         # Creativity engine
│   │   ├── ai-admin/          # AI Admin modules
│   │   │   ├── agent.ts              # Main AI Admin agent
│   │   │   ├── system-prompt-v2.ts   # Action-oriented prompt
│   │   │   ├── request-interpreter.ts # Plain-language interpreter
│   │   │   ├── file-context-gatherer.ts # File context for patches
│   │   │   └── vision-analyzer.ts    # Image analysis
│   │   ├── db/                # Database utilities
│   │   │   └── schema/        # Drizzle schemas
│   │   ├── pinecone-service.ts # Pinecone vector search
│   │   └── document-processor.ts # Document parsing
│   │
│   ├── components/            # React components
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── Sidebar.tsx        # Main navigation
│   │   ├── workflow-builder/  # Workflow canvas components
│   │   └── ...
│   │
│   └── types/                 # TypeScript types
│
├── drizzle/                   # Database migrations
│   ├── schema.ts              # Main schema file
│   └── migrations/            # SQL migrations
│
├── public/                    # Static assets
│   ├── icons/                 # PWA icons
│   └── manifest.json          # PWA manifest
│
├── docs/                      # Documentation
│   ├── CURSOR-GUIDE.md        # This file
│   ├── agi-complete-system.md # AGI documentation
│   ├── plain-language-patch-system.md # AI Admin docs
│   └── ...
│
├── tests/                     # Test files
│   ├── e2e/                   # Playwright E2E tests
│   └── ...
│
├── scripts/                   # Utility scripts
│   └── migrate-agi-tables.mjs # Database migration script
│
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
├── drizzle.config.ts          # Drizzle ORM config
└── next.config.mjs            # Next.js config
```

### Key Files to Know

#### Frontend Entry Points
- `src/app/layout.tsx` - Root layout with providers
- `src/app/dashboard/layout.tsx` - Dashboard layout with sidebar
- `src/components/Sidebar.tsx` - Main navigation component

#### Backend Entry Points
- `src/server/routers/_app.ts` - Main tRPC router
- `src/server/trpc.ts` - tRPC configuration
- `src/app/api/trpc/[trpc]/route.ts` - tRPC HTTP handler

#### Database
- `drizzle/schema.ts` - All database tables
- `src/lib/db/schema/*.ts` - Individual schema files
- `src/server/db.ts` - Database client

#### AGI System
- `src/lib/agi/enhanced-core.ts` - Main AGI orchestrator
- `src/lib/agi/memory.ts` - Memory persistence
- `src/lib/agi/conversation.ts` - Conversation tracking

#### AI Admin
- `src/lib/ai-admin/agent.ts` - Main AI Admin agent
- `src/lib/ai-admin/system-prompt-v2.ts` - Action-oriented system prompt
- `src/lib/ai-admin/request-interpreter.ts` - Plain-language request interpreter

---

## 🚀 Key Features

### 1. AGI System

**Location:** `/dashboard/agi`

**Description:** Advanced General Intelligence system with consciousness, memory, reasoning, creativity, and emotional intelligence.

**Key Components:**
- **Enhanced AGI Core** (`src/lib/agi/enhanced-core.ts`) - Main orchestrator
- **Memory System** (`src/lib/agi/memory.ts`) - 5 types of memory:
  - Episodic (personal experiences)
  - Semantic (facts and concepts)
  - Working (current context)
  - Procedural (skills)
  - Emotional (emotional experiences)
- **Conversation Service** (`src/lib/agi/conversation.ts`) - Tracks conversations with analysis
- **Reasoning Engine** (`src/lib/agi/reasoning.ts`) - 7 reasoning modes:
  - Analytical, Creative, Critical, Analogical, Deductive, Inductive, Abductive
- **Emotional Intelligence** (`src/lib/agi/emotion.ts`) - Detects and responds to emotions
- **Creativity Engine** (`src/lib/agi/creativity.ts`) - 7 creativity techniques

**Database Tables:**
- `agi_consciousness_state` - Consciousness levels
- `agi_conversations` - Conversation metadata
- `agi_messages` - Chat messages
- `agi_episodic_memory` - Personal experiences
- `agi_semantic_memory` - Facts and concepts
- `agi_working_memory` - Current context
- `agi_procedural_memory` - Skills
- `agi_emotional_memory` - Emotional experiences

**API Endpoints:**
- `POST /api/agi/process` - Process AGI requests
- `GET /api/agi/status` - Get AGI status

**tRPC Procedures:**
- `agi.chat` - Send message to AGI
- `agi.getConversations` - List conversations
- `agi.getConversation` - Get conversation details

### 2. AI Admin

**Location:** `/admin/ai`

**Description:** Natural language code generation system that generates production-ready patches from plain English requests.

**Key Features:**
- Plain-language request interpretation
- Automatic codebase analysis
- File context gathering (with Vision API for images)
- Confidence-based clarification
- Patch generation with validation
- Example requests library

**Key Components:**
- **AI Admin Agent** (`src/lib/ai-admin/agent.ts`) - Main agent
- **System Prompt V2** (`src/lib/ai-admin/system-prompt-v2.ts`) - Action-oriented prompt
- **Request Interpreter** (`src/lib/ai-admin/request-interpreter.ts`) - Interprets plain-language requests
- **File Context Gatherer** (`src/lib/ai-admin/file-context-gatherer.ts`) - Gathers file context for patches
- **Vision Analyzer** (`src/lib/ai-admin/vision-analyzer.ts`) - Analyzes uploaded images

**Database Tables:**
- `ai_patches` - Generated patches
- `ai_conversations` - AI Admin conversations
- `ai_messages` - Chat messages
- `ai_uploaded_files` - Uploaded files with Vision API analysis

**tRPC Procedures:**
- `aiAdmin.chat` - Chat with AI Admin
- `aiAdmin.generatePatch` - Generate code patch
- `aiAdmin.generatePatchFromPlainLanguage` - Generate patch from plain English
- `aiAdmin.uploadFile` - Upload file for analysis
- `aiAdmin.analyzeImage` - Analyze image with Vision API
- `aiAdmin.getExampleRequests` - Get example requests

### 3. Workflow Builder

**Location:** `/dashboard/workflows`

**Description:** Visual workflow builder using React Flow for creating complex agent workflows.

**Key Features:**
- Drag-and-drop node creation
- 4 node types: Agent, Condition, Loop, Parallel
- Edge connections with validation
- Zoom/pan controls
- Minimap
- Node configuration panels
- Save/load workflows
- Execute workflows

**Key Components:**
- **WorkflowCanvas** (`src/components/workflow-builder/WorkflowCanvas.tsx`) - Main canvas
- **Node Components** (`src/components/workflow-builder/nodes/`) - Custom node types
- **Workflow Router** (`src/server/routers/workflows.ts`) - Backend operations

**Database Tables:**
- `workflows` - Workflow definitions
- `executions` - Workflow execution history
- `execution_steps` - Individual step results

**tRPC Procedures:**
- `workflows.list` - List workflows
- `workflows.get` - Get workflow details
- `workflows.create` - Create workflow
- `workflows.update` - Update workflow
- `workflows.delete` - Delete workflow
- `workflows.execute` - Execute workflow
- `workflows.getExecutionStatus` - Get execution status
- `workflows.getExecutionHistory` - Get execution history

### 4. Knowledge Base

**Location:** `/dashboard/knowledge`

**Description:** Document upload, processing, and semantic search with Pinecone vector database.

**Key Features:**
- Drag-and-drop file upload
- PDF, DOCX, TXT support
- Automatic text extraction
- Chunking and embedding
- Semantic search
- PDF viewer with zoom/navigation
- Folder organization

**Key Components:**
- **Document Processor** (`src/lib/document-processor.ts`) - Extracts text from documents
- **Pinecone Service** (`src/lib/pinecone-service.ts`) - Vector search
- **Knowledge Router** (`src/server/routers/knowledge.ts`) - Backend operations

**Database Tables:**
- `documents` - Document metadata
- `document_chunks` - Text chunks with embeddings
- `knowledge_base` - Additional knowledge entries

**tRPC Procedures:**
- `knowledge.uploadDocument` - Upload document
- `knowledge.listDocuments` - List documents
- `knowledge.getDocument` - Get document details
- `knowledge.deleteDocument` - Delete document
- `knowledge.searchDocuments` - Semantic search

### 5. Analytics

**Location:** `/dashboard/analytics`

**Description:** Real-time performance monitoring and insights with Chart.js visualizations.

**Key Features:**
- Dashboard metrics (agents, workflows, executions)
- 7-day sparkline trends
- Recent activity feed
- Execution stats (success/failure)
- Agent performance
- Workflow performance
- Execution trends (daily/weekly/monthly)

**Key Components:**
- **Analytics Router** (`src/server/routers/analytics.ts`) - Backend queries
- **Analytics Page** (`src/app/dashboard/analytics/page.tsx`) - Frontend dashboard

**tRPC Procedures:**
- `analytics.getDashboardMetrics` - Get overview metrics
- `analytics.getSparklineData` - Get 7-day trends
- `analytics.getRecentActivity` - Get activity feed
- `analytics.getExecutionStats` - Get success/failure stats
- `analytics.getAgentPerformance` - Get agent metrics
- `analytics.getWorkflowPerformance` - Get workflow metrics
- `analytics.getExecutionTrend` - Get execution trends

---

## 💻 Development Workflow

### Local Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/jakelevi88hp/apex-agents.git
cd apex-agents
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Set Up Environment Variables**
Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Pinecone
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="..."
PINECONE_INDEX_NAME="..."

# JWT
JWT_SECRET="..."

# (Other variables as needed)
```

4. **Run Database Migrations**
```bash
pnpm db:push
```

5. **Start Development Server**
```bash
pnpm dev
```

6. **Access Application**
- Frontend: http://localhost:3000
- tRPC Playground: http://localhost:3000/api/trpc-playground (if enabled)

### Common Development Tasks

#### Create a New Feature

1. **Add Database Schema** (if needed)
```typescript
// drizzle/schema/my-feature.ts
export const myFeature = pgTable('my_feature', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

2. **Run Migration**
```bash
pnpm db:push
```

3. **Create tRPC Router**
```typescript
// src/server/routers/my-feature.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const myFeatureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(myFeature).where(eq(myFeature.userId, ctx.user.id));
  }),
  
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(myFeature).values({
        userId: ctx.user.id,
        name: input.name,
      });
    }),
});
```

4. **Add to Main Router**
```typescript
// src/server/routers/_app.ts
import { myFeatureRouter } from './my-feature';

export const appRouter = router({
  // ... existing routers
  myFeature: myFeatureRouter,
});
```

5. **Create Frontend Page**
```typescript
// src/app/dashboard/my-feature/page.tsx
'use client';

import { trpc } from '@/lib/trpc';

export default function MyFeaturePage() {
  const { data, isLoading } = trpc.myFeature.list.useQuery();
  const createMutation = trpc.myFeature.create.useMutation();
  
  // ... component logic
}
```

#### Add a New API Endpoint

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // ... logic
  
  return NextResponse.json({ success: true });
}
```

#### Run Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Specific test file
pnpm test src/lib/agi/memory.test.ts
```

---

## 📡 API Reference

### tRPC Routers

All API endpoints are type-safe through tRPC. Import the client:

```typescript
import { trpc } from '@/lib/trpc';
```

#### Agents Router

```typescript
// List agents
const { data } = trpc.agents.list.useQuery();

// Get agent
const { data } = trpc.agents.get.useQuery({ id: 'agent-id' });

// Create agent
const createMutation = trpc.agents.create.useMutation();
await createMutation.mutateAsync({
  name: 'My Agent',
  description: 'Agent description',
  model: 'gpt-4o',
  systemPrompt: 'You are a helpful assistant',
});

// Update agent
const updateMutation = trpc.agents.update.useMutation();
await updateMutation.mutateAsync({
  id: 'agent-id',
  name: 'Updated Name',
});

// Delete agent
const deleteMutation = trpc.agents.delete.useMutation();
await deleteMutation.mutateAsync({ id: 'agent-id' });

// Bulk operations
const bulkDeleteMutation = trpc.agents.bulkDelete.useMutation();
await bulkDeleteMutation.mutateAsync({ ids: ['id1', 'id2'] });
```

#### Workflows Router

```typescript
// List workflows
const { data } = trpc.workflows.list.useQuery();

// Create workflow
const createMutation = trpc.workflows.create.useMutation();
await createMutation.mutateAsync({
  name: 'My Workflow',
  description: 'Workflow description',
  definition: { nodes: [], edges: [] },
});

// Execute workflow
const executeMutation = trpc.workflows.execute.useMutation();
await executeMutation.mutateAsync({
  workflowId: 'workflow-id',
  input: { key: 'value' },
});
```

#### AGI Router

```typescript
// Chat with AGI
const chatMutation = trpc.agi.chat.useMutation();
const response = await chatMutation.mutateAsync({
  message: 'Hello, AGI!',
  conversationId: 'conversation-id', // optional
});

// Get conversations
const { data } = trpc.agi.getConversations.useQuery();
```

#### AI Admin Router

```typescript
// Chat with AI Admin
const chatMutation = trpc.aiAdmin.chat.useMutation();
const response = await chatMutation.mutateAsync({
  message: 'Add dark mode to the dashboard',
  mode: 'chat',
});

// Generate patch from plain language
const patchMutation = trpc.aiAdmin.generatePatchFromPlainLanguage.useMutation();
const patch = await patchMutation.mutateAsync({
  request: 'add dark mode',
  conversationId: 'conversation-id',
});

// Upload file for analysis
const uploadMutation = trpc.aiAdmin.uploadFile.useMutation();
const file = await uploadMutation.mutateAsync({
  fileName: 'design.png',
  fileType: 'image/png',
  fileSize: 1024000,
  base64Data: 'data:image/png;base64,...',
});
```

#### Knowledge Router

```typescript
// Upload document
const uploadMutation = trpc.knowledge.uploadDocument.useMutation();
const document = await uploadMutation.mutateAsync({
  file: fileObject,
  folder: 'my-folder',
});

// Search documents
const { data } = trpc.knowledge.searchDocuments.useQuery({
  query: 'machine learning',
  limit: 10,
});
```

#### Analytics Router

```typescript
// Get dashboard metrics
const { data } = trpc.analytics.getDashboardMetrics.useQuery();

// Get execution trends
const { data } = trpc.analytics.getExecutionTrend.useQuery({
  period: 'daily', // 'daily' | 'weekly' | 'monthly'
  days: 30,
});
```

---

## 🗄️ Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role VARCHAR(20) DEFAULT 'user', -- 'user' | 'admin'
  subscription_plan VARCHAR(20) DEFAULT 'free', -- 'free' | 'premium' | 'pro'
  trial_started_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### agents
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  model VARCHAR(100) DEFAULT 'gpt-4o',
  system_prompt TEXT,
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'paused' | 'archived'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### workflows
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL, -- { nodes: [], edges: [] }
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'active' | 'archived'
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### executions
```sql
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'running' | 'completed' | 'failed'
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  duration_ms INTEGER
);
```

### AGI Tables

#### agi_conversations
```sql
CREATE TABLE agi_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  emotional_tone VARCHAR(50),
  topics JSONB,
  started_at TIMESTAMP DEFAULT now(),
  ended_at TIMESTAMP,
  message_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### agi_messages
```sql
CREATE TABLE agi_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES agi_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  thoughts JSONB, -- AGI's internal thoughts
  emotional_state VARCHAR(50),
  creativity JSONB,
  reasoning JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

#### agi_episodic_memory
```sql
CREATE TABLE agi_episodic_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  context JSONB,
  emotional_valence REAL, -- -1 to 1
  emotional_arousal REAL, -- 0 to 1
  importance_score REAL, -- 0 to 1
  participants JSONB,
  location TEXT,
  outcome TEXT,
  learned_lessons JSONB,
  created_at TIMESTAMP DEFAULT now(),
  last_accessed TIMESTAMP DEFAULT now(),
  access_count INTEGER DEFAULT 0
);
```

#### agi_semantic_memory
```sql
CREATE TABLE agi_semantic_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  definition TEXT,
  category VARCHAR(100),
  properties JSONB,
  relationships JSONB,
  examples JSONB,
  confidence REAL, -- 0 to 1
  source TEXT,
  verification_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_accessed TIMESTAMP DEFAULT now(),
  access_count INTEGER DEFAULT 0
);
```

### AI Admin Tables

#### ai_patches
```sql
CREATE TABLE ai_patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  files JSONB NOT NULL, -- [{ path, operation, content }]
  testing_steps JSONB,
  risks JSONB,
  status TEXT DEFAULT 'pending', -- 'pending' | 'applied' | 'rolled_back'
  applied_at TIMESTAMP,
  rolled_back_at TIMESTAMP,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### ai_uploaded_files
```sql
CREATE TABLE ai_uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  s3_key VARCHAR(1000) NOT NULL,
  s3_url TEXT NOT NULL,
  analysis_result JSONB, -- Vision API analysis
  created_at TIMESTAMP DEFAULT now()
);
```

### Knowledge Base Tables

#### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  source TEXT NOT NULL, -- S3 URL
  status VARCHAR(20) DEFAULT 'processing', -- 'processing' | 'completed' | 'failed'
  summary TEXT,
  tags JSONB,
  folder VARCHAR(255),
  metadata JSONB,
  embedding_status VARCHAR(20) DEFAULT 'pending',
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### document_chunks
```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  embedding TEXT, -- Serialized vector
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 🚀 Deployment

### Vercel Deployment

**Production URL:** https://apex-agents.vercel.app/

**Deployment Process:**
1. Push to `main` branch on GitHub
2. Vercel automatically detects changes
3. Builds and deploys within 2-3 minutes
4. Environment variables configured in Vercel dashboard

**Environment Variables (Vercel):**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `DATABASE_URL_UNPOOLED` - Direct connection (for migrations)
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_ENVIRONMENT` - Pinecone environment
- `PINECONE_INDEX_NAME` - Pinecone index name
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_APP_URL` - Application URL

### Database Migrations

**Run migrations on production:**
```bash
# Using the migration script
DATABASE_URL="postgresql://..." node scripts/migrate-agi-tables.mjs

# Or using Drizzle
pnpm db:push
```

### Monitoring

**Health Checks:**
- `/api/health` - Basic health check
- `/api/health/db` - Database health check

**Logs:**
- Vercel Dashboard → Project → Logs
- Filter by function, status code, or search term

---

## 📊 Current Status

### ✅ Completed Features

1. **AGI System** - Fully implemented with all 5 memory types, 7 reasoning modes, emotional intelligence, and creativity
2. **AI Admin** - Plain-language patch generation with Vision API integration
3. **Workflow Builder** - Visual workflow builder with React Flow
4. **Knowledge Base** - Document upload, processing, and semantic search
5. **Analytics** - Real-time dashboards with Chart.js
6. **Settings** - All settings tabs (general, API keys, model config, billing, team)
7. **Mobile Navigation** - Responsive hamburger menu
8. **PWA** - Progressive Web App with offline support
9. **Database** - All tables created and migrated to production
10. **Deployment** - Live on Vercel at https://apex-agents.vercel.app/

### 🚧 In Progress

1. **AI Admin Conversational Improvements** - Making AI Admin work like natural conversation (deployed, needs testing)
2. **Production Testing** - Testing all features in production environment
3. **Bug Fixes** - Resolving deployment issues (canvas dependency, AGI tables)

### 📋 Remaining Tasks

See `todo.md` for complete list. Key priorities:

1. **Test AGI in Production** - Verify AGI memory persistence works
2. **Test AI Admin Plain-Language** - Verify simple requests work ("add dark mode")
3. **Fix Deployment Issues** - Resolve any remaining errors
4. **Subscription System** - Implement 3-day free trial + Premium/Pro tiers
5. **Billing Integration** - Stripe integration for payments
6. **Feature Gating** - Limit features based on subscription tier
7. **Team Management** - Invite and manage team members
8. **API Key Management** - Generate and revoke API keys
9. **Documentation** - Complete user guides and API documentation
10. **Performance Optimization** - Optimize database queries and API responses

---

## 🎯 Remaining Tasks (Priority Order)

### High Priority (Production Blockers)

1. **Test AGI System in Production**
   - Verify all 8 AGI tables are working
   - Test memory persistence across sessions
   - Verify conversation tracking
   - Test reasoning modes
   - Test emotional intelligence
   - Test creativity engine

2. **Test AI Admin Plain-Language**
   - Test simple requests: "add dark mode", "fix the login bug"
   - Verify request interpretation works
   - Test patch generation
   - Test Vision API integration
   - Verify file context gathering

3. **Fix Any Remaining Deployment Errors**
   - Monitor Vercel logs for errors
   - Fix canvas dependency issues
   - Verify all API endpoints work
   - Test document upload
   - Test PDF processing

### Medium Priority (Core Features)

4. **Subscription System**
   - Create subscription database tables
   - Implement 3-day free trial logic
   - Add Premium/Pro tier definitions
   - Create pricing page
   - Add subscription status banner
   - Implement trial countdown

5. **Stripe Integration**
   - Set up Stripe products and prices
   - Create checkout session endpoint
   - Implement webhook handler
   - Add customer portal
   - Test payment flow

6. **Feature Gating**
   - Define limits per tier (agents, workflows, storage, API calls)
   - Implement limit checks in all features
   - Add usage displays in UI
   - Create upgrade prompts
   - Test gating logic

### Low Priority (Enhancements)

7. **Team Management**
   - Implement team invite flow
   - Add role management (owner, admin, member)
   - Create team settings page
   - Add team member list
   - Implement permissions

8. **API Key Management**
   - Generate API keys
   - Revoke API keys
   - Display usage statistics
   - Add rate limiting
   - Create API documentation

9. **Performance Optimization**
   - Optimize database queries
   - Add caching layer
   - Implement lazy loading
   - Optimize bundle size
   - Add CDN for static assets

10. **Documentation**
    - User guides for each feature
    - API documentation
    - Video tutorials
    - FAQ section
    - Troubleshooting guide

---

## 💡 Tips for Cursor AI

### When Adding New Features

1. **Always check existing code first** - Search for similar implementations
2. **Follow the tRPC pattern** - All API endpoints should use tRPC
3. **Use Drizzle ORM** - Never write raw SQL unless absolutely necessary
4. **Type everything** - TypeScript types should be explicit
5. **Follow the file structure** - Put files in the correct directories
6. **Use Shadcn/ui components** - Don't create custom UI components unless needed
7. **Test locally first** - Always test before pushing to production
8. **Update todo.md** - Mark tasks as complete when done

### When Fixing Bugs

1. **Check Vercel logs** - Most errors are logged there
2. **Verify environment variables** - Missing env vars cause many issues
3. **Test database connection** - Use `/api/health/db` endpoint
4. **Check browser console** - Client-side errors show there
5. **Review recent commits** - Bug might be in recent changes

### When Refactoring

1. **Don't break existing functionality** - Test thoroughly
2. **Keep backward compatibility** - Don't change API contracts
3. **Update types** - Ensure TypeScript types are correct
4. **Update documentation** - Keep docs in sync with code
5. **Run tests** - Ensure all tests pass

### Code Style Guidelines

1. **Use functional components** - No class components
2. **Use hooks** - useState, useEffect, useMemo, useCallback
3. **Use async/await** - No .then() chains
4. **Use const** - Avoid let and var
5. **Use arrow functions** - Consistent function syntax
6. **Use template literals** - For string interpolation
7. **Use destructuring** - For objects and arrays
8. **Use optional chaining** - `user?.name` instead of `user && user.name`
9. **Use nullish coalescing** - `value ?? default` instead of `value || default`
10. **Use TypeScript** - No `any` types unless absolutely necessary

---

## 📚 Additional Resources

### Documentation Files

- `docs/agi-complete-system.md` - Complete AGI system documentation
- `docs/plain-language-patch-system.md` - AI Admin documentation
- `docs/mobile-navigation-improvements-summary.md` - Mobile navigation guide
- `docs/deployment-verification-guide.md` - Deployment testing guide
- `docs/placeholder-data-audit-report.md` - Placeholder data audit

### Test Files

- `tests/e2e/` - Playwright E2E tests
- `tests/ai-admin/` - AI Admin test plans
- `tests/agi/` - AGI test plans

### Scripts

- `scripts/migrate-agi-tables.mjs` - AGI database migration
- `scripts/stress-test.ts` - API stress testing

### External Links

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Flow Documentation](https://reactflow.dev/docs)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## 🤝 Contributing

When contributing to Apex Agents:

1. **Read this guide thoroughly** - Understand the architecture
2. **Check todo.md** - See what needs to be done
3. **Create a branch** - Don't push directly to main
4. **Test locally** - Ensure everything works
5. **Update documentation** - Keep docs in sync
6. **Mark tasks complete** - Update todo.md
7. **Push to GitHub** - Vercel will auto-deploy

---

## 📞 Support

For questions or issues:

1. **Check documentation** - Most answers are here
2. **Check Vercel logs** - For deployment issues
3. **Check browser console** - For client-side errors
4. **Check database** - Use `/api/health/db` endpoint
5. **Contact maintainer** - jakelevi88hp@gmail.com

---

**Last Updated:** November 9, 2024  
**Version:** 1.0  
**Maintainer:** Jake Levi (jakelevi88hp@gmail.com)

---

*This guide is maintained by the Apex Agents team and updated regularly. If you find any errors or have suggestions, please update this document.*
