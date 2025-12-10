# Pieces Features Implementation

This document describes the implementation of Pieces-like core features in Apex Agents.

## Overview

Three core features have been implemented:

1. **LTM-2.7 (Long-Term Memory Engine)** - Captures workflow context over 7 days
2. **Pieces Copilot** - AI assistant with LTM context integration
3. **Pieces Drive** - Material management system
4. **Workstream Activity** - Automated activity roll-ups every 20 minutes

## Features

### 1. LTM-2.7 (Long-Term Memory Engine)

**Location:** `src/lib/pieces/ltm-engine.ts`

**Features:**
- Captures live context from workflow over a 7-day period
- Remembers websites visited, code worked on, snippets saved
- Natural language queries to find past materials
- Contextual recall with clickable URLs/paths
- Automatic expiration after 7 days

**API Endpoints:**
- `POST /api/pieces/ltm/capture` - Capture workflow context
- `POST /api/pieces/ltm/query` - Natural language query

**Usage Example:**
```typescript
import { ltmEngine } from '@/lib/pieces/ltm-engine';

// Capture context
await ltmEngine.captureContext({
  userId: 'user-123',
  contextType: 'code',
  title: 'React Component',
  content: 'const MyComponent = () => {...}',
  url: '/src/components/MyComponent.tsx',
  importance: { score: 0.8, factors: ['frequently_used'] }
});

// Natural language query
const result = await ltmEngine.processNaturalLanguageQuery(
  'user-123',
  'link to Firestore database I was working in last week'
);
```

### 2. Pieces Copilot

**Location:** `src/lib/pieces/copilot.ts`

**Features:**
- AI assistant leveraging LTM-2.7 context
- Assists with debugging, code generation, comments, questions
- Integrates with workflow context, Drive materials, and AGI memory
- Supports multiple tasks: debug, comment, generate, explain, question
- LLM flexibility (OpenAI models or local)

**API Endpoint:**
- `POST /api/pieces/copilot` - Process copilot request

**UI:** `src/app/dashboard/pieces/copilot/page.tsx`

**Usage Example:**
```typescript
import { piecesCopilot } from '@/lib/pieces/copilot';

// Debug code
const response = await piecesCopilot.debugCode(
  'user-123',
  'const x = undefined; x.toString();',
  'TypeError: Cannot read property toString of undefined'
);

// Generate comments
const comments = await piecesCopilot.generateComments(
  'user-123',
  'function calculateTotal(items) { return items.reduce(...) }',
  'typescript'
);
```

### 3. Pieces Drive

**Location:** `src/lib/pieces/drive.ts`

**Features:**
- Save code, notes, links, documents, snippets
- Organize into collections
- Shareable links (no account required for recipients)
- Search and filter materials
- View, edit, re-use materials

**API Endpoints:**
- `GET /api/pieces/drive` - Get user materials
- `POST /api/pieces/drive` - Save material
- `GET /api/pieces/drive/[id]` - Get material by ID
- `GET /share/[link]` - Get material by shareable link

**UI:** `src/app/dashboard/pieces/drive/page.tsx`

**Usage Example:**
```typescript
import { piecesDrive } from '@/lib/pieces/drive';

// Save material
const materialId = await piecesDrive.saveMaterial({
  userId: 'user-123',
  materialType: 'code',
  title: 'Useful React Hook',
  content: 'const useCustomHook = () => {...}',
  language: 'typescript',
  tags: ['react', 'hooks'],
  isPublic: false
});

// Get materials
const materials = await piecesDrive.getUserMaterials('user-123', 'code');
```

### 4. Workstream Activity

**Location:** `src/lib/pieces/workstream-activity.ts`

**Features:**
- Automatic roll-up generation every 20 minutes
- Summarizes tasks, projects, issues, decisions, discussions, documents, code reviews
- Includes helpful links
- Can start Copilot chats with roll-ups

**API Endpoints:**
- `GET /api/pieces/workstream` - Get recent roll-ups
- `POST /api/pieces/workstream` - Generate roll-up

**UI:** `src/app/dashboard/pieces/workstream/page.tsx`

**Usage Example:**
```typescript
import { workstreamActivityService } from '@/lib/pieces/workstream-activity';

// Generate roll-up
const rollupId = await workstreamActivityService.generateRollup('user-123');

// Get recent roll-ups
const rollups = await workstreamActivityService.getRecentRollups('user-123', 10);
```

## Database Schema

All tables are defined in `src/lib/db/schema/pieces-features.ts`:

- `ltm_workflow_context` - Workflow context storage
- `ltm_queries` - Natural language queries
- `pieces_drive_materials` - Saved materials
- `pieces_drive_collections` - Material collections
- `workstream_activity` - Activity roll-ups
- `workstream_activity_sources` - Roll-up source references

**Migration:** Run `migrations/pieces-features.sql` to create the tables.

## Setup

1. **Run Database Migration:**
   ```bash
   # Apply the migration
   psql $DATABASE_URL -f migrations/pieces-features.sql
   
   # Or use Drizzle
   pnpm db:push
   ```

2. **Access UI:**
   - Pieces Copilot: `/dashboard/pieces/copilot`
   - Pieces Drive: `/dashboard/pieces/drive`
   - Workstream Activity: `/dashboard/pieces/workstream`

3. **API Authentication:**
   All API endpoints require Bearer token authentication:
   ```
   Authorization: Bearer <token>
   ```

## Integration with Existing Systems

### AGI Memory Integration
- LTM-2.7 stores important contexts in AGI episodic memory
- Pieces Copilot uses AGI memory for enhanced context
- Workstream Activity collects data from AGI conversations

### Workflow Integration
- LTM captures context from agent executions
- Workstream Activity summarizes workflow executions
- Pieces Drive can save code from workflow outputs

## Future Enhancements

1. **Automatic Roll-up Scheduling:**
   - Set up a cron job to generate roll-ups every 20 minutes
   - Example: Use Vercel Cron or a background worker

2. **Browser Extension:**
   - Capture website visits automatically
   - Save code snippets from web pages

3. **IDE Integration:**
   - VS Code extension for capturing code context
   - JetBrains plugin support

4. **Enhanced Natural Language Processing:**
   - Better query understanding
   - Semantic search improvements

5. **Local LLM Support:**
   - Integration with local models for privacy
   - Fallback to cloud models when needed

## Notes

- LTM contexts expire after 7 days automatically
- Shareable links are unique 16-character base64url strings
- Workstream roll-ups are generated on-demand (cron job recommended)
- All features integrate with existing AGI memory system
