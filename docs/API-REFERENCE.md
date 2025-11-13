# Apex Agents - API Reference

**Last Updated:** November 9, 2024  
**Version:** 1.0  
**Base URL:** https://apex-agents.vercel.app/api/trpc

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Agents](#agents)
3. [Workflows](#workflows)
4. [AGI](#agi)
5. [AI Admin](#ai-admin)
6. [Knowledge Base](#knowledge-base)
7. [Analytics](#analytics)
8. [Settings](#settings)
9. [Error Handling](#error-handling)

---

## 🔐 Authentication

All API endpoints use JWT authentication via cookies. Protected procedures require a valid session.

### Get Current User

**Endpoint:** `auth.me`  
**Type:** Query  
**Auth:** Optional

```typescript
const { data: user } = trpc.auth.me.useQuery();

// Response
{
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  subscriptionPlan: 'free' | 'premium' | 'pro';
  createdAt: Date;
}
```

### Logout

**Endpoint:** `auth.logout`  
**Type:** Mutation  
**Auth:** Optional

```typescript
const logoutMutation = trpc.auth.logout.useMutation();
await logoutMutation.mutateAsync();

// Response
{ success: true }
```

---

## 🤖 Agents

### List Agents

**Endpoint:** `agents.list`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: agents } = trpc.agents.list.useQuery();

// Response
[
  {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    model: string;
    systemPrompt: string | null;
    temperature: number;
    maxTokens: number;
    status: 'active' | 'paused' | 'archived';
    createdAt: Date;
    updatedAt: Date;
  }
]
```

### Get Agent

**Endpoint:** `agents.get`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: agent } = trpc.agents.get.useQuery({ id: 'agent-id' });

// Input
{
  id: string;
}

// Response
{
  id: string;
  userId: string;
  name: string;
  description: string | null;
  model: string;
  systemPrompt: string | null;
  temperature: number;
  maxTokens: number;
  status: 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Agent

**Endpoint:** `agents.create`  
**Type:** Mutation  
**Auth:** Required

```typescript
const createMutation = trpc.agents.create.useMutation();
const agent = await createMutation.mutateAsync({
  name: 'My Agent',
  description: 'Agent description',
  model: 'gpt-4o',
  systemPrompt: 'You are a helpful assistant',
  temperature: 0.7,
  maxTokens: 2000,
});

// Input
{
  name: string;
  description?: string;
  model: 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  systemPrompt?: string;
  temperature?: number; // 0-2
  maxTokens?: number;
}

// Response
{
  id: string;
  userId: string;
  name: string;
  // ... other fields
}
```

### Update Agent

**Endpoint:** `agents.update`  
**Type:** Mutation  
**Auth:** Required

```typescript
const updateMutation = trpc.agents.update.useMutation();
await updateMutation.mutateAsync({
  id: 'agent-id',
  name: 'Updated Name',
  status: 'paused',
});

// Input
{
  id: string;
  name?: string;
  description?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  status?: 'active' | 'paused' | 'archived';
}

// Response
{
  id: string;
  // ... updated fields
}
```

### Delete Agent

**Endpoint:** `agents.delete`  
**Type:** Mutation  
**Auth:** Required

```typescript
const deleteMutation = trpc.agents.delete.useMutation();
await deleteMutation.mutateAsync({ id: 'agent-id' });

// Input
{
  id: string;
}

// Response
{ success: true }
```

### Bulk Delete Agents

**Endpoint:** `agents.bulkDelete`  
**Type:** Mutation  
**Auth:** Required

```typescript
const bulkDeleteMutation = trpc.agents.bulkDelete.useMutation();
await bulkDeleteMutation.mutateAsync({ ids: ['id1', 'id2', 'id3'] });

// Input
{
  ids: string[];
}

// Response
{ success: true, count: number }
```

### Bulk Pause Agents

**Endpoint:** `agents.bulkPause`  
**Type:** Mutation  
**Auth:** Required

```typescript
const bulkPauseMutation = trpc.agents.bulkPause.useMutation();
await bulkPauseMutation.mutateAsync({ ids: ['id1', 'id2'] });

// Input
{
  ids: string[];
}

// Response
{ success: true, count: number }
```

### Bulk Activate Agents

**Endpoint:** `agents.bulkActivate`  
**Type:** Mutation  
**Auth:** Required

```typescript
const bulkActivateMutation = trpc.agents.bulkActivate.useMutation();
await bulkActivateMutation.mutateAsync({ ids: ['id1', 'id2'] });

// Input
{
  ids: string[];
}

// Response
{ success: true, count: number }
```

---

## 🔄 Workflows

### List Workflows

**Endpoint:** `workflows.list`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: workflows } = trpc.workflows.list.useQuery();

// Response
[
  {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    definition: {
      nodes: Array<{
        id: string;
        type: 'agent' | 'condition' | 'loop' | 'parallel';
        data: any;
        position: { x: number; y: number };
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
      }>;
    };
    status: 'draft' | 'active' | 'archived';
    version: number;
    createdAt: Date;
    updatedAt: Date;
  }
]
```

### Get Workflow

**Endpoint:** `workflows.get`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: workflow } = trpc.workflows.get.useQuery({ id: 'workflow-id' });

// Input
{
  id: string;
}

// Response
{
  id: string;
  userId: string;
  name: string;
  description: string | null;
  definition: { nodes: [], edges: [] };
  status: 'draft' | 'active' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Workflow

**Endpoint:** `workflows.create`  
**Type:** Mutation  
**Auth:** Required

```typescript
const createMutation = trpc.workflows.create.useMutation();
const workflow = await createMutation.mutateAsync({
  name: 'My Workflow',
  description: 'Workflow description',
  definition: {
    nodes: [
      { id: 'node1', type: 'agent', data: {}, position: { x: 0, y: 0 } }
    ],
    edges: []
  },
});

// Input
{
  name: string;
  description?: string;
  definition: {
    nodes: Array<{
      id: string;
      type: 'agent' | 'condition' | 'loop' | 'parallel';
      data: any;
      position: { x: number; y: number };
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
    }>;
  };
}

// Response
{
  id: string;
  // ... workflow fields
}
```

### Update Workflow

**Endpoint:** `workflows.update`  
**Type:** Mutation  
**Auth:** Required

```typescript
const updateMutation = trpc.workflows.update.useMutation();
await updateMutation.mutateAsync({
  id: 'workflow-id',
  name: 'Updated Name',
  definition: { nodes: [], edges: [] },
});

// Input
{
  id: string;
  name?: string;
  description?: string;
  definition?: { nodes: [], edges: [] };
  status?: 'draft' | 'active' | 'archived';
}

// Response
{
  id: string;
  // ... updated fields
}
```

### Delete Workflow

**Endpoint:** `workflows.delete`  
**Type:** Mutation  
**Auth:** Required

```typescript
const deleteMutation = trpc.workflows.delete.useMutation();
await deleteMutation.mutateAsync({ id: 'workflow-id' });

// Input
{
  id: string;
}

// Response
{ success: true }
```

### Execute Workflow

**Endpoint:** `workflows.execute`  
**Type:** Mutation  
**Auth:** Required

```typescript
const executeMutation = trpc.workflows.execute.useMutation();
const execution = await executeMutation.mutateAsync({
  workflowId: 'workflow-id',
  input: { key: 'value' },
});

// Input
{
  workflowId: string;
  input?: Record<string, any>;
}

// Response
{
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output: any;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
}
```

### Get Execution Status

**Endpoint:** `workflows.getExecutionStatus`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: execution } = trpc.workflows.getExecutionStatus.useQuery({
  executionId: 'execution-id'
});

// Input
{
  executionId: string;
}

// Response
{
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output: any;
  error: string | null;
  completedAt: Date | null;
}
```

### Get Execution History

**Endpoint:** `workflows.getExecutionHistory`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: executions } = trpc.workflows.getExecutionHistory.useQuery({
  workflowId: 'workflow-id',
  limit: 10,
});

// Input
{
  workflowId: string;
  limit?: number; // default: 10
}

// Response
[
  {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt: Date;
    completedAt: Date | null;
    durationMs: number | null;
  }
]
```

---

## 🧠 AGI

### Chat with AGI

**Endpoint:** `agi.chat`  
**Type:** Mutation  
**Auth:** Required

```typescript
const chatMutation = trpc.agi.chat.useMutation();
const response = await chatMutation.mutateAsync({
  message: 'Hello, AGI!',
  conversationId: 'conversation-id', // optional
});

// Input
{
  message: string;
  conversationId?: string; // creates new if not provided
}

// Response
{
  conversationId: string;
  response: string;
  thoughts: {
    reasoning: string;
    emotionalState: string;
    creativity: any;
  };
  memories: {
    episodic: any[];
    semantic: any[];
  };
}
```

### Get Conversations

**Endpoint:** `agi.getConversations`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: conversations } = trpc.agi.getConversations.useQuery();

// Response
[
  {
    id: string;
    userId: string;
    title: string | null;
    summary: string | null;
    emotionalTone: string | null;
    topics: any;
    startedAt: Date;
    endedAt: Date | null;
    messageCount: number;
  }
]
```

### Get Conversation

**Endpoint:** `agi.getConversation`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: conversation } = trpc.agi.getConversation.useQuery({
  conversationId: 'conversation-id'
});

// Input
{
  conversationId: string;
}

// Response
{
  id: string;
  userId: string;
  title: string | null;
  messages: [
    {
      id: string;
      role: 'user' | 'assistant';
      content: string;
      thoughts: any;
      emotionalState: string | null;
      createdAt: Date;
    }
  ];
}
```

---

## 🛠️ AI Admin

### Chat with AI Admin

**Endpoint:** `aiAdmin.chat`  
**Type:** Mutation  
**Auth:** Required (Admin only)

```typescript
const chatMutation = trpc.aiAdmin.chat.useMutation();
const response = await chatMutation.mutateAsync({
  message: 'Add dark mode to the dashboard',
  mode: 'chat',
  conversationId: 'conversation-id', // optional
});

// Input
{
  message: string;
  mode: 'chat' | 'patch';
  conversationId?: string;
}

// Response
{
  conversationId: string;
  response: string;
  patch?: {
    id: string;
    summary: string;
    files: Array<{
      path: string;
      operation: 'create' | 'modify' | 'delete';
      content: string;
    }>;
  };
}
```

### Generate Patch from Plain Language

**Endpoint:** `aiAdmin.generatePatchFromPlainLanguage`  
**Type:** Mutation  
**Auth:** Required (Admin only)

```typescript
const patchMutation = trpc.aiAdmin.generatePatchFromPlainLanguage.useMutation();
const patch = await patchMutation.mutateAsync({
  request: 'add dark mode',
  conversationId: 'conversation-id',
});

// Input
{
  request: string;
  conversationId?: string;
}

// Response
{
  id: string;
  summary: string;
  description: string;
  files: Array<{
    path: string;
    operation: 'create' | 'modify' | 'delete';
    content: string;
  }>;
  testingSteps: string[];
  risks: string[];
  confidence: number; // 0-1
}
```

### Upload File for Analysis

**Endpoint:** `aiAdmin.uploadFile`  
**Type:** Mutation  
**Auth:** Required (Admin only)

```typescript
const uploadMutation = trpc.aiAdmin.uploadFile.useMutation();
const file = await uploadMutation.mutateAsync({
  fileName: 'design.png',
  fileType: 'image/png',
  fileSize: 1024000,
  base64Data: 'data:image/png;base64,...',
  messageId: 'message-id',
});

// Input
{
  fileName: string;
  fileType: string;
  fileSize: number;
  base64Data: string; // base64 encoded file
  messageId: string;
}

// Response
{
  id: string;
  fileName: string;
  s3Url: string;
  analysisResult: {
    description: string;
    elements: string[];
    colors: string[];
    suggestions: string[];
  };
}
```

### Get Example Requests

**Endpoint:** `aiAdmin.getExampleRequests`  
**Type:** Query  
**Auth:** Required (Admin only)

```typescript
const { data: examples } = trpc.aiAdmin.getExampleRequests.useQuery();

// Response
[
  {
    category: string;
    examples: string[];
  }
]
```

---

## 📚 Knowledge Base

### Upload Document

**Endpoint:** `knowledge.uploadDocument`  
**Type:** Mutation  
**Auth:** Required

```typescript
const uploadMutation = trpc.knowledge.uploadDocument.useMutation();
const document = await uploadMutation.mutateAsync({
  file: fileObject,
  folder: 'my-folder',
  tags: ['tag1', 'tag2'],
});

// Input
{
  file: File;
  folder?: string;
  tags?: string[];
}

// Response
{
  id: string;
  name: string;
  mimeType: string;
  size: number;
  status: 'processing' | 'completed' | 'failed';
  source: string; // S3 URL
  createdAt: Date;
}
```

### List Documents

**Endpoint:** `knowledge.listDocuments`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: documents } = trpc.knowledge.listDocuments.useQuery({
  folder: 'my-folder',
  limit: 20,
});

// Input
{
  folder?: string;
  limit?: number; // default: 20
}

// Response
[
  {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    status: 'processing' | 'completed' | 'failed';
    summary: string | null;
    tags: string[];
    folder: string | null;
    chunkCount: number;
    createdAt: Date;
  }
]
```

### Get Document

**Endpoint:** `knowledge.getDocument`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: document } = trpc.knowledge.getDocument.useQuery({
  id: 'document-id'
});

// Input
{
  id: string;
}

// Response
{
  id: string;
  name: string;
  mimeType: string;
  size: number;
  source: string; // S3 URL
  status: 'processing' | 'completed' | 'failed';
  summary: string | null;
  tags: string[];
  folder: string | null;
  metadata: any;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Delete Document

**Endpoint:** `knowledge.deleteDocument`  
**Type:** Mutation  
**Auth:** Required

```typescript
const deleteMutation = trpc.knowledge.deleteDocument.useMutation();
await deleteMutation.mutateAsync({ id: 'document-id' });

// Input
{
  id: string;
}

// Response
{ success: true }
```

### Search Documents

**Endpoint:** `knowledge.searchDocuments`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: results } = trpc.knowledge.searchDocuments.useQuery({
  query: 'machine learning',
  limit: 10,
});

// Input
{
  query: string;
  limit?: number; // default: 10
}

// Response
[
  {
    documentId: string;
    documentName: string;
    chunkText: string;
    similarity: number; // 0-1
    metadata: any;
  }
]
```

---

## 📊 Analytics

### Get Dashboard Metrics

**Endpoint:** `analytics.getDashboardMetrics`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: metrics } = trpc.analytics.getDashboardMetrics.useQuery();

// Response
{
  activeAgents: number;
  totalWorkflows: number;
  totalExecutions: number;
  successRate: number; // 0-100
}
```

### Get Sparkline Data

**Endpoint:** `analytics.getSparklineData`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: sparkline } = trpc.analytics.getSparklineData.useQuery();

// Response
{
  executions: number[]; // Last 7 days
  successRate: number[]; // Last 7 days
}
```

### Get Recent Activity

**Endpoint:** `analytics.getRecentActivity`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: activity } = trpc.analytics.getRecentActivity.useQuery({
  limit: 10
});

// Input
{
  limit?: number; // default: 10
}

// Response
[
  {
    id: string;
    type: 'agent_created' | 'workflow_executed' | 'document_uploaded';
    description: string;
    timestamp: Date;
    metadata: any;
  }
]
```

### Get Execution Stats

**Endpoint:** `analytics.getExecutionStats`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: stats } = trpc.analytics.getExecutionStats.useQuery({
  days: 30
});

// Input
{
  days?: number; // default: 30
}

// Response
{
  total: number;
  successful: number;
  failed: number;
  successRate: number; // 0-100
  averageDuration: number; // milliseconds
}
```

### Get Agent Performance

**Endpoint:** `analytics.getAgentPerformance`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: performance } = trpc.analytics.getAgentPerformance.useQuery({
  limit: 10
});

// Input
{
  limit?: number; // default: 10
}

// Response
[
  {
    agentId: string;
    agentName: string;
    executionCount: number;
    successRate: number; // 0-100
    averageDuration: number; // milliseconds
  }
]
```

### Get Workflow Performance

**Endpoint:** `analytics.getWorkflowPerformance`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: performance } = trpc.analytics.getWorkflowPerformance.useQuery({
  limit: 10
});

// Input
{
  limit?: number; // default: 10
}

// Response
[
  {
    workflowId: string;
    workflowName: string;
    executionCount: number;
    successRate: number; // 0-100
    averageDuration: number; // milliseconds
  }
]
```

### Get Execution Trend

**Endpoint:** `analytics.getExecutionTrend`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: trend } = trpc.analytics.getExecutionTrend.useQuery({
  period: 'daily',
  days: 30,
});

// Input
{
  period: 'daily' | 'weekly' | 'monthly';
  days?: number; // default: 30
}

// Response
[
  {
    date: string; // ISO date
    executions: number;
    successful: number;
    failed: number;
  }
]
```

---

## ⚙️ Settings

### Get Settings

**Endpoint:** `settings.getSettings`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: settings } = trpc.settings.getSettings.useQuery();

// Response
{
  general: {
    organizationName: string | null;
    email: string;
    timezone: string;
    notifications: boolean;
  };
  apiKeys: Array<{
    id: string;
    name: string;
    key: string; // masked
    createdAt: Date;
    lastUsed: Date | null;
  }>;
  modelConfig: {
    openaiKey: string | null; // masked
    anthropicKey: string | null; // masked
    defaultModel: string;
  };
  billing: {
    plan: 'free' | 'premium' | 'pro';
    trialEndsAt: Date | null;
    currentPeriodEnd: Date | null;
  };
}
```

### Update General Settings

**Endpoint:** `settings.updateGeneral`  
**Type:** Mutation  
**Auth:** Required

```typescript
const updateMutation = trpc.settings.updateGeneral.useMutation();
await updateMutation.mutateAsync({
  organizationName: 'My Organization',
  timezone: 'America/New_York',
  notifications: true,
});

// Input
{
  organizationName?: string;
  email?: string;
  timezone?: string;
  notifications?: boolean;
}

// Response
{ success: true }
```

### Create API Key

**Endpoint:** `settings.createApiKey`  
**Type:** Mutation  
**Auth:** Required

```typescript
const createMutation = trpc.settings.createApiKey.useMutation();
const apiKey = await createMutation.mutateAsync({
  name: 'My API Key'
});

// Input
{
  name: string;
}

// Response
{
  id: string;
  name: string;
  key: string; // full key, only shown once
  createdAt: Date;
}
```

### Revoke API Key

**Endpoint:** `settings.revokeApiKey`  
**Type:** Mutation  
**Auth:** Required

```typescript
const revokeMutation = trpc.settings.revokeApiKey.useMutation();
await revokeMutation.mutateAsync({ id: 'api-key-id' });

// Input
{
  id: string;
}

// Response
{ success: true }
```

### Update Model Config

**Endpoint:** `settings.updateModelConfig`  
**Type:** Mutation  
**Auth:** Required

```typescript
const updateMutation = trpc.settings.updateModelConfig.useMutation();
await updateMutation.mutateAsync({
  openaiKey: 'sk-...',
  defaultModel: 'gpt-4o',
});

// Input
{
  openaiKey?: string;
  anthropicKey?: string;
  defaultModel?: string;
}

// Response
{ success: true }
```

### Get Team Members

**Endpoint:** `settings.getTeamMembers`  
**Type:** Query  
**Auth:** Required

```typescript
const { data: members } = trpc.settings.getTeamMembers.useQuery();

// Response
[
  {
    id: string;
    email: string;
    name: string | null;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
  }
]
```

### Invite Team Member

**Endpoint:** `settings.inviteTeamMember`  
**Type:** Mutation  
**Auth:** Required

```typescript
const inviteMutation = trpc.settings.inviteTeamMember.useMutation();
await inviteMutation.mutateAsync({
  email: 'user@example.com',
  role: 'member',
});

// Input
{
  email: string;
  role: 'admin' | 'member';
}

// Response
{ success: true }
```

### Update Team Member Role

**Endpoint:** `settings.updateTeamMemberRole`  
**Type:** Mutation  
**Auth:** Required

```typescript
const updateMutation = trpc.settings.updateTeamMemberRole.useMutation();
await updateMutation.mutateAsync({
  userId: 'user-id',
  role: 'admin',
});

// Input
{
  userId: string;
  role: 'admin' | 'member';
}

// Response
{ success: true }
```

### Remove Team Member

**Endpoint:** `settings.removeTeamMember`  
**Type:** Mutation  
**Auth:** Required

```typescript
const removeMutation = trpc.settings.removeTeamMember.useMutation();
await removeMutation.mutateAsync({ userId: 'user-id' });

// Input
{
  userId: string;
}

// Response
{ success: true }
```

---

## ❌ Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | User not authenticated |
| `FORBIDDEN` | User doesn't have permission |
| `NOT_FOUND` | Resource not found |
| `BAD_REQUEST` | Invalid input |
| `INTERNAL_SERVER_ERROR` | Server error |
| `CONFLICT` | Resource conflict (e.g., duplicate) |
| `TIMEOUT` | Request timeout |

### Error Response Format

```typescript
{
  code: string; // Error code
  message: string; // Human-readable message
  data?: {
    code: string; // tRPC error code
    httpStatus: number;
    path: string; // API path
    zodError?: any; // Zod validation errors
  };
}
```

### Handling Errors

```typescript
const { data, error } = trpc.agents.list.useQuery();

if (error) {
  console.error('Error code:', error.data?.code);
  console.error('Error message:', error.message);
  
  if (error.data?.zodError) {
    // Handle validation errors
    console.error('Validation errors:', error.data.zodError);
  }
}
```

### Retry Logic

```typescript
const { data } = trpc.agents.list.useQuery(undefined, {
  retry: 3, // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

## 📝 Notes

### Rate Limiting

- **Free Tier:** 100 requests/minute
- **Premium Tier:** 1000 requests/minute
- **Pro Tier:** Unlimited

### Pagination

Most list endpoints support pagination:

```typescript
const { data } = trpc.agents.list.useQuery({
  limit: 20,
  offset: 0,
});
```

### Caching

tRPC queries are cached by default. To refetch:

```typescript
const utils = trpc.useUtils();

// Invalidate specific query
utils.agents.list.invalidate();

// Refetch specific query
utils.agents.list.refetch();
```

### WebSocket Support

Real-time updates are available for:
- Workflow executions
- AGI conversations
- Document processing status

```typescript
const { data } = trpc.workflows.getExecutionStatus.useQuery(
  { executionId: 'execution-id' },
  { refetchInterval: 1000 } // Poll every second
);
```

---

**Last Updated:** November 9, 2024  
**Version:** 1.0  
**Maintainer:** Jake Levi (jakelevi88hp@gmail.com)
