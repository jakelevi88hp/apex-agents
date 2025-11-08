# File Context Integration Documentation

## Overview

The File Context Integration enables AI Admin to use uploaded files and their Vision API analysis results when generating code patches and responding to chat messages. This allows the AI to understand visual designs, code screenshots, error messages, and other visual content to provide more accurate and contextually relevant assistance.

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    File Upload & Analysis                    │
├─────────────────────────────────────────────────────────────┤
│  User uploads image → S3 Storage → Vision API Analysis       │
│  → Database (aiUploadedFiles with analysisResult)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  FileContextGatherer                         │
├─────────────────────────────────────────────────────────────┤
│  Retrieves uploaded files by conversation ID                 │
│  Extracts Vision API analysis results                        │
│  Formats context text for AI prompts                         │
│  Returns FileContextSummary with all file information        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Admin Agent                             │
├─────────────────────────────────────────────────────────────┤
│  chat(message, history, fileContextText)                     │
│  generatePatch(request, fileContextText)                     │
│  → Includes file context in system/user prompts              │
│  → AI uses file analysis to generate better responses        │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Complete Flow: Upload → Analysis → Context → AI Response

```
1. USER UPLOADS IMAGE
   └─> FileUpload component
       └─> tRPC uploadFile mutation
           ├─> Upload to S3
           ├─> Save metadata to aiUploadedFiles table
           └─> Trigger Vision API analysis
               └─> Update analysisResult field

2. USER SENDS CHAT MESSAGE
   └─> Chat component with conversationId
       └─> tRPC chat mutation
           └─> FileContextGatherer.getConversationFileContext()
               ├─> Query aiUploadedFiles by conversation
               ├─> Extract analysis results
               └─> Format as contextText
           └─> agent.chat(message, history, fileContextText)
               └─> AI receives file context in system prompt
                   └─> AI response uses file analysis

3. USER REQUESTS PATCH
   └─> Patch mode with conversationId
       └─> tRPC generatePatch mutation
           └─> FileContextGatherer.getConversationFileContext()
               ├─> Query aiUploadedFiles by conversation
               ├─> Extract analysis results
               └─> Format as contextText
           └─> agent.generatePatch(request, fileContextText)
               └─> AI receives file context in user prompt
                   └─> Generated patch uses file analysis
```

---

## FileContextGatherer Class

### Purpose
Retrieves uploaded files and their Vision API analysis results, formats them into context text for AI prompts.

### Methods

#### getConversationFiles(conversationId: string): Promise<FileContext[]>
Retrieves all uploaded files for a specific conversation.

**Returns:** Array of FileContext objects

**Example:**
```typescript
const gatherer = new FileContextGatherer();
const files = await gatherer.getConversationFiles('conv-123');
// files: [{ id, fileName, fileType, url, analysis, ... }]
```

---

#### getConversationFileContext(conversationId: string): Promise<FileContextSummary>
Retrieves files and generates a formatted context summary.

**Returns:** FileContextSummary with:
- `totalFiles`: Total number of uploaded files
- `imageFiles`: Number of image files
- `analyzedFiles`: Number of files with Vision API analysis
- `files`: Array of FileContext objects
- `contextText`: Formatted text for AI prompts

**Example:**
```typescript
const gatherer = new FileContextGatherer();
const context = await gatherer.getConversationFileContext('conv-123');

console.log(context.totalFiles); // 2
console.log(context.analyzedFiles); // 2
console.log(context.contextText); // Formatted markdown text
```

---

#### getRecentFiles(limit: number): Promise<FileContext[]>
Retrieves the most recently uploaded files (across all conversations).

**Parameters:**
- `limit`: Maximum number of files to retrieve (default: 5)

**Example:**
```typescript
const gatherer = new FileContextGatherer();
const recentFiles = await gatherer.getRecentFiles(10);
```

---

#### generateFileContextSummary(files: FileContext[]): FileContextSummary
Generates a formatted context summary from an array of files.

**Example:**
```typescript
const gatherer = new FileContextGatherer();
const files = await gatherer.getConversationFiles('conv-123');
const summary = gatherer.generateFileContextSummary(files);
```

---

#### extractUIComponents(files: FileContext[]): string[]
Extracts all UI components from analyzed images.

**Example:**
```typescript
const components = gatherer.extractUIComponents(files);
// ['button', 'card', 'navigation', 'form']
```

---

#### extractCodeSnippets(files: FileContext[]): string[]
Extracts all code snippets from analyzed images.

---

#### extractErrorMessages(files: FileContext[]): string[]
Extracts all error messages from analyzed images.

---

## Data Structures

### FileContext

```typescript
interface FileContext {
  id: string;                    // Database record ID
  fileName: string;              // Original file name
  fileType: string;              // MIME type (e.g., 'image/png')
  fileSize: number;              // File size in bytes
  url: string;                   // S3 public URL
  uploadedAt: Date;              // Upload timestamp
  analysis?: {                   // Vision API analysis (if available)
    description: string;
    detectedElements: string[];
    suggestedContext: string;
    codeSnippets?: string[];
    uiComponents?: string[];
    errorMessages?: string[];
  };
}
```

### FileContextSummary

```typescript
interface FileContextSummary {
  totalFiles: number;            // Total uploaded files
  imageFiles: number;            // Number of image files
  analyzedFiles: number;         // Files with Vision API analysis
  files: FileContext[];          // Array of file objects
  contextText: string;           // Formatted text for AI prompts
}
```

---

## Context Text Format

The `contextText` field is formatted as Markdown for easy AI parsing:

```markdown
# UPLOADED FILES CONTEXT

The user has uploaded 2 file(s) in this conversation:

## File: dashboard.png
- Type: image/png
- URL: https://s3.amazonaws.com/...

### Vision API Analysis:
A dashboard interface with a navigation sidebar on the left, showing menu items for Dashboard, Analytics, and Settings. The main content area displays three cards with metrics: Total Users (1,234), Revenue ($45,678), and Active Sessions (89). Below the cards is a line chart showing user growth over time.

**UI Components Detected:** card, chart, navigation, sidebar, button

**Context:** UI components detected: card, chart, navigation, sidebar, button

---

## File: login-form.png
- Type: image/png
- URL: https://s3.amazonaws.com/...

### Vision API Analysis:
A login form with email and password input fields, a "Sign In" button, and a "Forgot Password?" link below.

**UI Components Detected:** form, input, button

**Context:** UI components detected: form, input, button

---
```

---

## API Endpoints

### getConversationFiles

**Purpose:** Retrieve all uploaded files for a conversation

**Input:**
```typescript
{
  conversationId: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  data: FileContextSummary;
}
```

**Usage:**
```typescript
const result = await trpc.aiAdmin.getConversationFiles.query({
  conversationId: 'conv-123',
});

console.log(result.data.totalFiles); // 2
console.log(result.data.contextText); // Formatted context
```

---

### getRecentFiles

**Purpose:** Retrieve recently uploaded files (across all conversations)

**Input:**
```typescript
{
  limit?: number; // Default: 5
}
```

**Output:**
```typescript
{
  success: boolean;
  data: FileContextSummary;
}
```

---

### chat (Enhanced)

**Purpose:** Chat with AI Admin, including file context

**Input:**
```typescript
{
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  conversationId?: string; // NEW: For file context
}
```

**Behavior:**
- If `conversationId` is provided, retrieves uploaded files
- Formats file context and passes to AI
- AI receives file analysis in system prompt

**Example:**
```typescript
const response = await trpc.aiAdmin.chat.mutate({
  message: 'What UI components do you see in the uploaded image?',
  conversationId: 'conv-123',
});
```

---

### generatePatch (Enhanced)

**Purpose:** Generate code patch, including file context

**Input:**
```typescript
{
  request: string;
  conversationId?: string; // NEW: For file context
}
```

**Behavior:**
- If `conversationId` is provided, retrieves uploaded files
- Formats file context and passes to AI
- AI receives file analysis in user prompt
- Generated patch uses file context

**Example:**
```typescript
const patch = await trpc.aiAdmin.generatePatch.mutate({
  request: 'Create a component matching the uploaded design',
  conversationId: 'conv-123',
});
```

---

## Integration with AI Admin Agent

### chat() Method

**Signature:**
```typescript
async chat(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  fileContextText?: string
): Promise<string>
```

**File Context Injection:**
The file context is injected into the system prompt after the "RELEVANT FILES" section:

```typescript
const systemPrompt = `
# PROJECT CONTEXT
...

# RELEVANT FILES
...

${fileContextText ? `\n${fileContextText}\n` : ''}

# YOUR ROLE
...
`;
```

---

### generatePatch() Method

**Signature:**
```typescript
async generatePatch(
  requestText: string,
  fileContextText?: string
): Promise<PatchRecord>
```

**File Context Injection:**
The file context is injected into the user prompt after the relevant file contents:

```typescript
const userPrompt = `
Request: ${requestText}

${context.summary}

Relevant file contents:
...

${fileContextText ? `${fileContextText}\n\n` : ''}

🚨 CRITICAL: Your response MUST be a valid JSON object...
`;
```

---

## Use Cases

### 1. UI Implementation from Design

**Scenario:** User uploads a UI mockup and wants code generated

**Flow:**
1. User uploads `dashboard-design.png`
2. Vision API analyzes: detects cards, charts, navigation
3. User requests: "Create a dashboard component matching this design"
4. FileContextGatherer retrieves file and analysis
5. AI receives context with detected UI components
6. AI generates code with matching components

**Result:** Generated code includes cards, charts, and navigation as shown in the design

---

### 2. Error Debugging from Screenshot

**Scenario:** User uploads an error screenshot and wants help fixing it

**Flow:**
1. User uploads `console-error.png`
2. Vision API analyzes: detects error message "TypeError: Cannot read property 'map' of undefined"
3. User asks: "Fix this error"
4. FileContextGatherer retrieves file and analysis
5. AI receives context with error message
6. AI identifies the issue and generates a fix

**Result:** AI provides accurate diagnosis and fix for the error

---

### 3. Code Implementation from Screenshot

**Scenario:** User uploads a code screenshot and wants it implemented

**Flow:**
1. User uploads `function-code.png`
2. Vision API analyzes: extracts code snippet
3. User requests: "Implement this function"
4. FileContextGatherer retrieves file and analysis
5. AI receives context with code snippet
6. AI generates implementation

**Result:** AI implements the function shown in the screenshot

---

### 4. Multi-Design Integration

**Scenario:** User uploads multiple design screenshots for different parts of the UI

**Flow:**
1. User uploads `header.png`, `sidebar.png`, `content.png`
2. Vision API analyzes all three
3. User requests: "Create a layout combining all three designs"
4. FileContextGatherer retrieves all files and analyses
5. AI receives context with all designs
6. AI generates integrated layout

**Result:** AI creates a cohesive layout incorporating all designs

---

## Best Practices

### 1. Always Provide Conversation ID

When calling chat or generatePatch, always include the conversation ID to enable file context:

```typescript
// ✅ Good: Includes conversationId
await trpc.aiAdmin.chat.mutate({
  message: 'Create a button component',
  conversationId: currentConversationId,
});

// ❌ Bad: No conversationId, file context not available
await trpc.aiAdmin.chat.mutate({
  message: 'Create a button component',
});
```

---

### 2. Upload Files Before Requesting Code

Ensure files are uploaded and analyzed before requesting code generation:

```typescript
// 1. Upload file
const uploadResult = await trpc.aiAdmin.uploadFile.mutate({
  fileName: 'design.png',
  fileData: base64Data,
  contentType: 'image/png',
  messageId: messageId,
});

// 2. Wait for analysis (automatic)
await new Promise(resolve => setTimeout(resolve, 5000));

// 3. Request code generation
const patch = await trpc.aiAdmin.generatePatch.mutate({
  request: 'Create component matching the design',
  conversationId: conversationId,
});
```

---

### 3. Provide Clear Context in Requests

Help the AI understand how to use the uploaded files:

```typescript
// ✅ Good: Clear context
"Create a dashboard component matching the uploaded design mockup"

// ✅ Good: Specific reference
"Implement the login form shown in the screenshot"

// ❌ Bad: Vague
"Create a component"
```

---

### 4. Use Multiple Files for Complex UIs

For complex interfaces, upload multiple screenshots showing different parts:

```typescript
// Upload header design
await uploadFile('header.png');

// Upload sidebar design
await uploadFile('sidebar.png');

// Upload content area design
await uploadFile('content.png');

// Request integrated implementation
await generatePatch('Create a layout combining all three uploaded designs');
```

---

## Performance Considerations

### Timing Benchmarks

| Operation | Average Time | Max Acceptable |
|-----------|--------------|----------------|
| Get conversation files | 50-100ms | 500ms |
| Format context text | 10-50ms | 200ms |
| Chat with file context | 3-7s | 15s |
| Patch with file context | 10-20s | 45s |

### Optimization Tips

1. **Lazy Loading:** Only retrieve file context when conversation ID is provided
2. **Caching:** Consider caching file context for active conversations
3. **Batch Queries:** Retrieve all files in a single database query
4. **Limit Context Size:** Only include recent files if conversation has many uploads

---

## Troubleshooting

### Issue: File context not included in AI response

**Possible Causes:**
- Conversation ID not provided
- No files uploaded in conversation
- Files not yet analyzed

**Solution:**
- Verify conversation ID is passed to chat/generatePatch
- Check that files are uploaded and analyzed
- Review console logs for file context inclusion

---

### Issue: AI doesn't reference uploaded files

**Possible Causes:**
- File context not formatted correctly
- AI doesn't understand the context
- Request doesn't mention the files

**Solution:**
- Check `contextText` format
- Provide clearer context in request
- Explicitly mention "uploaded file" or "design" in request

---

### Issue: Generated code doesn't match uploaded design

**Possible Causes:**
- Vision API analysis incomplete
- Design is too complex
- AI misinterpreted the design

**Solution:**
- Upload higher resolution images
- Break complex designs into smaller parts
- Provide additional context in request

---

## Future Enhancements

### Planned Features

1. **File Context History:** Show which files were used in each response
2. **Manual File Selection:** Allow users to select specific files to include
3. **File Context Preview:** Show file context before sending to AI
4. **Context Summarization:** Summarize large file contexts for efficiency
5. **File Comparison:** Compare multiple designs and generate differences

### Potential Improvements

1. **Smart File Selection:** Automatically select most relevant files
2. **Context Compression:** Compress large contexts to fit token limits
3. **File Relationships:** Track relationships between files (e.g., before/after)
4. **Version Control:** Track file versions and changes
5. **Collaborative Context:** Share file context across team members

---

## Related Documentation

- [Vision API Integration](./vision-api-integration.md)
- [File Context Integration Test Plan](../tests/file-context-integration-test.md)
- [AI Admin Enhancement Architecture](./ai-admin-enhancement-architecture.md)

---

## Changelog

### v1.0.0 (Current)
- Initial file context integration
- FileContextGatherer class
- Enhanced chat and generatePatch methods
- Automatic context gathering by conversation ID
- Formatted context text for AI prompts

### Planned for v1.1.0
- File context history tracking
- Manual file selection
- Context preview UI
- Smart file selection
- Context compression
