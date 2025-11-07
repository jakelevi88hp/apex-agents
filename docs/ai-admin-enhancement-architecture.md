# AI Admin Enhancement Architecture
## Transforming AI Admin into a Manus/Cursor-like Development Assistant

---

## Overview

This document outlines the comprehensive architecture for upgrading AI Admin from a basic chat/patch tool into a full-featured development assistant comparable to Manus and Cursor.

**Target Features:**
1. Multi-turn conversations with context retention
2. File/image upload and analysis
3. Streaming responses (real-time text generation)
4. Conversation history persistence
5. Multi-file editing in a single operation
6. Code suggestions and completions
7. File tree navigation and search
8. Apply/reject individual changes
9. Conversation branching/forking
10. Code search across repository
11. Integration with GitHub Issues/PRs

---

## Database Schema

### New Tables

#### 1. `ai_conversations`
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  branch_from_id UUID REFERENCES ai_conversations(id),
  branch_at_message_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_conversations_branch ON ai_conversations(branch_from_id);
```

#### 2. `ai_messages`
```sql
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB, -- stores file attachments, code blocks, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id)
);

CREATE INDEX idx_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_messages_created ON ai_messages(created_at);
```

#### 3. `ai_uploaded_files`
```sql
CREATE TABLE ai_uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  s3_key VARCHAR(1000) NOT NULL,
  s3_url TEXT NOT NULL,
  analysis_result JSONB, -- stores AI analysis of the file
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_message ON ai_uploaded_files(message_id);
```

#### 4. `ai_patch_changes` (for granular change tracking)
```sql
CREATE TABLE ai_patch_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID NOT NULL REFERENCES ai_patches(id) ON DELETE CASCADE,
  file_path VARCHAR(1000) NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- 'add', 'modify', 'delete'
  hunk_index INTEGER NOT NULL,
  old_content TEXT,
  new_content TEXT,
  line_start INTEGER,
  line_end INTEGER,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'applied', 'rejected'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_changes_patch ON ai_patch_changes(patch_id);
```

---

## Backend Architecture

### 1. Streaming Responses with Server-Sent Events (SSE)

**New tRPC Endpoint:**
```typescript
// src/server/routers/ai-admin.ts
chatStream: adminProcedure
  .input(z.object({
    conversationId: z.string().uuid(),
    message: z.string(),
    files: z.array(z.object({
      name: z.string(),
      type: z.string(),
      url: z.string()
    })).optional()
  }))
  .mutation(async function* ({ input, ctx }) {
    // Save user message
    const userMessage = await saveMessage({
      conversationId: input.conversationId,
      role: 'user',
      content: input.message,
      files: input.files
    });

    // Get conversation history
    const history = await getConversationHistory(input.conversationId);

    // Stream OpenAI response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: history,
      stream: true
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      yield { type: 'chunk', content };
    }

    // Save assistant message
    await saveMessage({
      conversationId: input.conversationId,
      role: 'assistant',
      content: fullResponse
    });

    yield { type: 'done' };
  })
```

### 2. File Upload & Analysis

**File Upload Flow:**
1. Frontend uploads file to S3 via presigned URL
2. Backend receives file metadata and S3 URL
3. For images: Use OpenAI Vision API for analysis
4. For code files: Extract and index content
5. For PDFs: Extract text and analyze
6. Store analysis in `ai_uploaded_files.analysis_result`

**Implementation:**
```typescript
// src/lib/ai-admin/file-analyzer.ts
export async function analyzeFile(file: {
  url: string;
  type: string;
  name: string;
}): Promise<FileAnalysis> {
  if (file.type.startsWith('image/')) {
    return analyzeImage(file);
  } else if (file.type === 'application/pdf') {
    return analyzePDF(file);
  } else if (isCodeFile(file.name)) {
    return analyzeCode(file);
  }
  // ... other file types
}

async function analyzeImage(file: File): Promise<ImageAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this image and describe what you see.' },
        { type: 'image_url', image_url: { url: file.url } }
      ]
    }]
  });
  
  return {
    description: response.choices[0].message.content,
    type: 'image'
  };
}
```

### 3. Repository-Wide Code Search

**GitHub API Integration:**
```typescript
// src/lib/ai-admin/github-search.ts
export async function searchCode(query: string, repo: string): Promise<SearchResult[]> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  const { data } = await octokit.rest.search.code({
    q: `${query} repo:${repo}`,
    per_page: 50
  });
  
  return data.items.map(item => ({
    path: item.path,
    url: item.html_url,
    repository: item.repository.full_name,
    score: item.score
  }));
}

export async function getFileTree(repo: string, branch: string = 'main'): Promise<FileNode[]> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  const { data } = await octokit.rest.git.getTree({
    owner: repo.split('/')[0],
    repo: repo.split('/')[1],
    tree_sha: branch,
    recursive: 'true'
  });
  
  return buildTreeStructure(data.tree);
}
```

### 4. Granular Patch Management

**Split patches into individual changes:**
```typescript
// src/lib/ai-admin/patch-parser.ts
export function parsePatchIntoChanges(patch: string, patchId: string): PatchChange[] {
  const changes: PatchChange[] = [];
  const files = parseDiff(patch);
  
  for (const file of files) {
    for (let i = 0; i < file.hunks.length; i++) {
      const hunk = file.hunks[i];
      changes.push({
        patchId,
        filePath: file.newPath || file.oldPath,
        changeType: determineChangeType(file),
        hunkIndex: i,
        oldContent: hunk.oldLines.join('\n'),
        newContent: hunk.newLines.join('\n'),
        lineStart: hunk.oldStart,
        lineEnd: hunk.oldStart + hunk.oldLines.length,
        status: 'pending'
      });
    }
  }
  
  return changes;
}

export async function applySelectedChanges(
  patchId: string,
  changeIds: string[]
): Promise<ApplyResult> {
  const changes = await getChangesByIds(changeIds);
  const groupedByFile = groupBy(changes, 'filePath');
  
  for (const [filePath, fileChanges] of Object.entries(groupedByFile)) {
    const reconstructedPatch = reconstructPatchFromChanges(fileChanges);
    await applyPatchToGitHub(filePath, reconstructedPatch);
    
    // Mark changes as applied
    await updateChangeStatus(fileChanges.map(c => c.id), 'applied');
  }
  
  return { success: true, appliedCount: changeIds.length };
}
```

### 5. Conversation Branching

**Branch Creation:**
```typescript
// src/lib/ai-admin/conversation-manager.ts
export async function branchConversation(
  sourceConversationId: string,
  branchAtMessageId: string,
  userId: string
): Promise<Conversation> {
  // Create new conversation
  const newConversation = await db.insert(ai_conversations).values({
    userId,
    title: `Branch from conversation`,
    branchFromId: sourceConversationId,
    branchAtMessageId
  }).returning();
  
  // Copy messages up to branch point
  const messages = await db
    .select()
    .from(ai_messages)
    .where(
      and(
        eq(ai_messages.conversationId, sourceConversationId),
        lte(ai_messages.createdAt, 
          db.select({ createdAt: ai_messages.createdAt })
            .from(ai_messages)
            .where(eq(ai_messages.id, branchAtMessageId))
        )
      )
    );
  
  // Insert copied messages
  await db.insert(ai_messages).values(
    messages.map(msg => ({
      ...msg,
      id: undefined, // Generate new IDs
      conversationId: newConversation.id
    }))
  );
  
  return newConversation;
}
```

### 6. GitHub Issues & PRs Integration

**Create PR from Patch:**
```typescript
// src/lib/ai-admin/github-integration.ts
export async function createPRFromPatch(
  patch: Patch,
  options: {
    title: string;
    description: string;
    baseBranch: string;
    headBranch: string;
  }
): Promise<PullRequest> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const [owner, repo] = process.env.GITHUB_REPO!.split('/');
  
  // Create branch
  const { data: ref } = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${options.headBranch}`,
    sha: await getLatestCommitSha(owner, repo, options.baseBranch)
  });
  
  // Apply changes to branch
  for (const file of patch.files) {
    await updateFileOnBranch(owner, repo, options.headBranch, file);
  }
  
  // Create PR
  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    title: options.title,
    body: options.description,
    head: options.headBranch,
    base: options.baseBranch
  });
  
  return pr;
}
```

---

## Frontend Architecture

### 1. Component Structure

```
src/app/admin/ai/
├── page.tsx                          # Main AI Admin page
├── components/
│   ├── ConversationList.tsx          # Sidebar with conversation list
│   ├── ConversationView.tsx          # Main chat interface
│   ├── MessageBubble.tsx             # Individual message component
│   ├── StreamingMessage.tsx          # Real-time streaming message
│   ├── FileUpload.tsx                # Drag-and-drop file upload
│   ├── FilePreview.tsx               # Preview uploaded files
│   ├── CodeBlock.tsx                 # Syntax-highlighted code
│   ├── DiffViewer.tsx                # Side-by-side diff view
│   ├── PatchChangeList.tsx           # List of individual changes
│   ├── FileTree.tsx                  # Repository file tree
│   ├── SearchBar.tsx                 # Code search interface
│   ├── BranchVisualization.tsx       # Conversation branch tree
│   ├── GitHubIntegration.tsx         # Issues/PRs panel
│   └── CommandPalette.tsx            # Cmd+K command palette
```

### 2. Streaming Response Implementation

**Frontend Hook:**
```typescript
// src/hooks/useStreamingChat.ts
export function useStreamingChat(conversationId: string) {
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const sendMessage = async (content: string, files?: File[]) => {
    setIsStreaming(true);
    setStreamingMessage('');
    
    // Upload files first
    const uploadedFiles = await uploadFiles(files);
    
    // Start streaming
    const stream = trpc.aiAdmin.chatStream.useMutation();
    
    for await (const chunk of stream.mutateAsync({
      conversationId,
      message: content,
      files: uploadedFiles
    })) {
      if (chunk.type === 'chunk') {
        setStreamingMessage(prev => prev + chunk.content);
      } else if (chunk.type === 'done') {
        setIsStreaming(false);
      }
    }
  };
  
  return { sendMessage, streamingMessage, isStreaming };
}
```

### 3. File Upload Component

```typescript
// src/app/admin/ai/components/FileUpload.tsx
export function FileUpload({ onFilesUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  
  const handleDrop = async (files: File[]) => {
    setUploading(true);
    
    const uploaded = await Promise.all(
      files.map(async (file) => {
        // Get presigned URL
        const { url, key } = await trpc.aiAdmin.getUploadUrl.mutate({
          fileName: file.name,
          fileType: file.type
        });
        
        // Upload to S3
        await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });
        
        return { name: file.name, type: file.type, key, url };
      })
    );
    
    onFilesUploaded(uploaded);
    setUploading(false);
  };
  
  return (
    <Dropzone onDrop={handleDrop}>
      {/* Dropzone UI */}
    </Dropzone>
  );
}
```

### 4. Diff Viewer Component

```typescript
// src/app/admin/ai/components/DiffViewer.tsx
import { DiffEditor } from '@monaco-editor/react';

export function DiffViewer({ change, onApply, onReject }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-gray-100">
        <span className="font-mono text-sm">{change.filePath}</span>
        <div className="flex gap-2">
          <button onClick={() => onApply(change.id)} className="btn-success">
            Apply
          </button>
          <button onClick={() => onReject(change.id)} className="btn-danger">
            Reject
          </button>
        </div>
      </div>
      
      <DiffEditor
        original={change.oldContent}
        modified={change.newContent}
        language={getLanguageFromPath(change.filePath)}
        options={{
          readOnly: true,
          renderSideBySide: true
        }}
      />
    </div>
  );
}
```

### 5. Conversation Branching UI

```typescript
// src/app/admin/ai/components/BranchVisualization.tsx
import { Tree } from 'react-d3-tree';

export function BranchVisualization({ conversationId }: Props) {
  const { data: branches } = trpc.aiAdmin.getConversationBranches.useQuery({
    conversationId
  });
  
  const treeData = buildTreeFromBranches(branches);
  
  return (
    <div className="h-96 border rounded-lg">
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="step"
        onNodeClick={(node) => switchToConversation(node.id)}
      />
    </div>
  );
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Database migrations for new tables
- Conversation persistence backend
- Streaming response implementation
- Basic conversation list UI

### Phase 2: File Upload & Analysis (Week 1-2)
- S3 upload integration
- File analysis with OpenAI Vision
- File preview components
- Repository file tree

### Phase 3: Advanced Patch Management (Week 2)
- Patch parsing into individual changes
- Diff viewer component
- Apply/reject individual changes
- Patch preview modal

### Phase 4: GitHub Integration (Week 2-3)
- GitHub code search
- Issues integration
- PR creation from patches
- Branch management

### Phase 5: Conversation Branching (Week 3)
- Branch creation logic
- Branch visualization
- Branch switching
- Branch merging

### Phase 6: Polish & Testing (Week 3-4)
- Keyboard shortcuts
- Command palette
- E2E tests
- Documentation

---

## Technical Dependencies

### New npm Packages
```json
{
  "@monaco-editor/react": "^4.6.0",
  "react-dropzone": "^14.2.3",
  "react-d3-tree": "^3.6.2",
  "parse-diff": "^0.11.1",
  "diff": "^5.1.0",
  "@octokit/rest": "^20.0.2",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0"
}
```

### Environment Variables
```
GITHUB_TOKEN=ghp_xxx
GITHUB_REPO=owner/repo
OPENAI_API_KEY=sk-xxx
AWS_S3_BUCKET=ai-admin-uploads
```

---

## Security Considerations

1. **File Upload Validation**
   - Limit file size (10MB max)
   - Validate file types
   - Scan for malware

2. **GitHub Token Permissions**
   - Use fine-grained tokens
   - Limit to specific repositories
   - Rotate tokens regularly

3. **Conversation Access Control**
   - Users can only access their own conversations
   - Admin-only feature (already implemented)
   - Audit log for sensitive operations

4. **Rate Limiting**
   - Limit streaming requests
   - Throttle file uploads
   - GitHub API rate limit handling

---

## Performance Optimizations

1. **Conversation Loading**
   - Paginate message history
   - Lazy load old conversations
   - Cache conversation metadata

2. **File Analysis**
   - Queue file analysis jobs
   - Cache analysis results
   - Parallel processing for multiple files

3. **Code Search**
   - Cache search results
   - Debounce search input
   - Index frequently accessed files

4. **Streaming**
   - Use WebSockets for better performance
   - Implement backpressure handling
   - Compress large responses

---

## Monitoring & Analytics

1. **Usage Metrics**
   - Conversation count per user
   - File upload volume
   - Patch application success rate
   - GitHub API usage

2. **Performance Metrics**
   - Streaming response latency
   - File analysis duration
   - Code search response time
   - Database query performance

3. **Error Tracking**
   - Failed file uploads
   - GitHub API errors
   - Streaming interruptions
   - Patch application failures

---

## Future Enhancements

1. **AI-Powered Features**
   - Code completion suggestions
   - Automated refactoring
   - Bug detection and fixes
   - Performance optimization suggestions

2. **Collaboration**
   - Share conversations with team
   - Collaborative patch review
   - Real-time co-editing

3. **Integration**
   - Slack notifications
   - Jira integration
   - CI/CD pipeline triggers
   - Code review automation

4. **Advanced Search**
   - Natural language code search
   - Semantic similarity search
   - Cross-repository search
   - Historical code search

---

## Conclusion

This architecture provides a comprehensive roadmap for transforming AI Admin into a world-class development assistant. The phased approach ensures incremental delivery of value while maintaining system stability and code quality.
