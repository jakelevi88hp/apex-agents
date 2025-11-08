# Frontend File Context Integration Documentation

## Overview

This document describes the frontend changes made to integrate file context into AI Admin's chat and patch generation features. The frontend now automatically passes conversation IDs to the backend, enabling the AI to use uploaded files and their Vision API analysis results.

---

## Changes Made

### 1. Added conversationId to Chat Mutation

**Location:** `src/app/admin/ai/page.tsx` (lines 200-215)

**Before:**
```typescript
const result = await chatMutation.mutateAsync({
  message: input,
  conversationHistory,
});
```

**After:**
```typescript
const result = await chatMutation.mutateAsync({
  message: input,
  conversationHistory,
  conversationId: activeConversationId || undefined,
});
```

**Impact:**
- Chat requests now include the active conversation ID
- Backend can retrieve uploaded files for this conversation
- AI receives file context in system prompt

---

### 2. Added conversationId to generatePatch Mutation

**Location:** `src/app/admin/ai/page.tsx` (lines 248-251)

**Before:**
```typescript
const result = await generatePatchMutation.mutateAsync({ 
  request: input
});
```

**After:**
```typescript
const result = await generatePatchMutation.mutateAsync({ 
  request: input,
  conversationId: activeConversationId || undefined,
});
```

**Impact:**
- Patch generation requests now include the active conversation ID
- Backend can retrieve uploaded files for this conversation
- AI receives file context in user prompt
- Generated patches can use uploaded designs and screenshots

---

### 3. Added getConversationFiles Query

**Location:** `src/app/admin/ai/page.tsx` (lines 59-63)

**Code:**
```typescript
// Query for conversation files (for file context)
const { data: conversationFiles } = trpc.aiAdmin.getConversationFiles.useQuery(
  { conversationId: activeConversationId! },
  { enabled: !!activeConversationId }
);
```

**Purpose:**
- Fetches uploaded files for the active conversation
- Provides file count and analysis status
- Used to display file context indicator
- Enables console logging of file context status

---

### 4. Added Console Logging

**Location:** `src/app/admin/ai/page.tsx` (lines 206-209, 243-246)

**Chat Mode:**
```typescript
// Log file context status
if (activeConversationId && conversationFiles?.data) {
  console.log(`[AI Admin] File context available: ${conversationFiles.data.totalFiles} files, ${conversationFiles.data.analyzedFiles} analyzed`);
}
```

**Patch Mode:**
```typescript
// Log file context status
if (activeConversationId && conversationFiles?.data) {
  console.log(`[AI Admin] File context available: ${conversationFiles.data.totalFiles} files, ${conversationFiles.data.analyzedFiles} analyzed`);
}
```

**Purpose:**
- Helps debug file context integration
- Shows when file context is being used
- Displays file counts for verification

---

### 5. Added File Context Indicator

**Location:** `src/app/admin/ai/page.tsx` (lines 708-722)

**Code:**
```tsx
{/* File Context Indicator */}
{conversationFiles?.data && conversationFiles.data.totalFiles > 0 && (
  <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
    <FileText className="w-3 h-3" />
    <span>
      {conversationFiles.data.totalFiles} file{conversationFiles.data.totalFiles > 1 ? 's' : ''} uploaded
      {conversationFiles.data.analyzedFiles > 0 && (
        <span className="ml-1 text-green-400">
          ({conversationFiles.data.analyzedFiles} analyzed)
        </span>
      )}
      - AI will use this context
    </span>
  </div>
)}
```

**Visual Design:**
- Purple background (`bg-purple-500/10`)
- Purple border (`border-purple-500/20`)
- Purple text (`text-purple-300`)
- Green text for analyzed count (`text-green-400`)
- Small file icon (`FileText` with `w-3 h-3`)
- Located below the input box

**Example Display:**
```
📄 2 files uploaded (2 analyzed) - AI will use this context
```

**Purpose:**
- Provides visual feedback that files are uploaded
- Shows how many files are analyzed
- Confirms AI will use the file context
- Only shown when files are present

---

## User Experience Flow

### Complete Flow: Upload → Analyze → Use in Chat/Patch

```
1. USER UPLOADS IMAGE
   ↓
   FileUpload component
   ↓
   S3 upload + metadata save
   ↓
   Vision API analysis (automatic)
   ↓
   Analysis saved to database

2. FILE CONTEXT INDICATOR APPEARS
   ↓
   Shows: "1 file uploaded (1 analyzed) - AI will use this context"

3. USER SENDS CHAT MESSAGE
   ↓
   conversationId passed to chat endpoint
   ↓
   Backend retrieves files via FileContextGatherer
   ↓
   File context included in AI prompt
   ↓
   AI response uses file analysis

4. USER REQUESTS PATCH
   ↓
   conversationId passed to generatePatch endpoint
   ↓
   Backend retrieves files via FileContextGatherer
   ↓
   File context included in AI prompt
   ↓
   Generated patch uses file analysis
```

---

## Console Output

### When File Context is Available

**Chat Mode:**
```
[AI Admin] File context available: 2 files, 2 analyzed
[chat] Including 2 uploaded files in context
```

**Patch Mode:**
```
[AI Admin] File context available: 2 files, 2 analyzed
[generatePatch] Including 2 uploaded files in context
```

### When No Files are Uploaded

No console logs are shown (file context indicator is hidden).

---

## Testing Guide

### Test 1: Upload and Chat

**Steps:**
1. Open AI Admin in Chat mode
2. Upload an image (e.g., dashboard screenshot)
3. Wait for "✓ Analyzed" status
4. Check for file context indicator below input
5. Send a message: "What UI components do you see?"
6. Check console for file context logs
7. Verify AI response mentions the uploaded file

**Expected Results:**
- ✅ File context indicator appears: "1 file uploaded (1 analyzed) - AI will use this context"
- ✅ Console shows: `[AI Admin] File context available: 1 files, 1 analyzed`
- ✅ Console shows: `[chat] Including 1 uploaded files in context`
- ✅ AI response references the uploaded file and detected components

---

### Test 2: Upload and Generate Patch

**Steps:**
1. Open AI Admin in Patch mode
2. Upload a UI design mockup
3. Wait for "✓ Analyzed" status
4. Check for file context indicator
5. Request: "Create a component matching the uploaded design"
6. Check console for file context logs
7. Verify generated patch uses the design

**Expected Results:**
- ✅ File context indicator appears
- ✅ Console shows: `[AI Admin] File context available: 1 files, 1 analyzed`
- ✅ Console shows: `[generatePatch] Including 1 uploaded files in context`
- ✅ Generated patch summary mentions the uploaded file
- ✅ Generated code matches the design

---

### Test 3: Multiple Files

**Steps:**
1. Upload 3 different images
2. Wait for all to be analyzed
3. Check file context indicator
4. Send a chat message or generate patch
5. Verify all files are included

**Expected Results:**
- ✅ Indicator shows: "3 files uploaded (3 analyzed) - AI will use this context"
- ✅ Console shows: `[AI Admin] File context available: 3 files, 3 analyzed`
- ✅ AI uses all 3 files in response

---

### Test 4: No Files

**Steps:**
1. Start a new conversation (no files)
2. Check for file context indicator
3. Send a message
4. Check console

**Expected Results:**
- ✅ No file context indicator shown
- ✅ No file context logs in console
- ✅ Chat/patch generation works normally

---

## Visual Examples

### File Context Indicator (1 File)

```
┌─────────────────────────────────────────────────────────┐
│ [FileText icon] 1 file uploaded (1 analyzed) - AI will │
│                 use this context                        │
└─────────────────────────────────────────────────────────┘
```

### File Context Indicator (Multiple Files)

```
┌─────────────────────────────────────────────────────────┐
│ [FileText icon] 3 files uploaded (3 analyzed) - AI will│
│                 use this context                        │
└─────────────────────────────────────────────────────────┘
```

### File Context Indicator (Partially Analyzed)

```
┌─────────────────────────────────────────────────────────┐
│ [FileText icon] 3 files uploaded (2 analyzed) - AI will│
│                 use this context                        │
└─────────────────────────────────────────────────────────┘
```

---

## Code Locations

### Main File
- `src/app/admin/ai/page.tsx` - AI Admin page component

### Key Changes
- **Line 59-63:** Added `getConversationFiles` query
- **Line 200-215:** Updated chat mutation with conversationId
- **Line 206-209:** Added console log for chat
- **Line 243-251:** Updated generatePatch mutation with conversationId
- **Line 243-246:** Added console log for patch
- **Line 708-722:** Added file context indicator UI

---

## Backend Integration

### Endpoints Used

**getConversationFiles:**
- Query endpoint
- Input: `{ conversationId: string }`
- Output: `{ success: boolean, data: FileContextSummary }`

**chat (enhanced):**
- Mutation endpoint
- Input: `{ message: string, conversationHistory: [], conversationId?: string }`
- Output: `{ success: boolean, message: string }`

**generatePatch (enhanced):**
- Mutation endpoint
- Input: `{ request: string, conversationId?: string }`
- Output: `{ success: boolean, data: PatchRecord }`

---

## Troubleshooting

### Issue: File context indicator not showing

**Possible Causes:**
- No files uploaded in conversation
- Files not yet analyzed
- Query not enabled (no active conversation)

**Solution:**
- Check that files are uploaded and analyzed
- Verify `activeConversationId` is set
- Check browser console for query errors

---

### Issue: Console logs not showing

**Possible Causes:**
- No active conversation ID
- No files uploaded
- Query failed

**Solution:**
- Verify conversation is active
- Check that files are uploaded
- Open browser DevTools console

---

### Issue: AI not using file context

**Possible Causes:**
- conversationId not passed to backend
- Backend not retrieving files
- Files not analyzed

**Solution:**
- Check console logs for file context status
- Verify conversationId is in network request
- Check backend logs for file retrieval

---

## Future Enhancements

### Planned Features

1. **File Context Preview**
   - Show thumbnails of uploaded files
   - Display analysis summary
   - Allow clicking to view full analysis

2. **File Selection**
   - Allow users to select which files to include
   - Toggle file context on/off
   - Exclude specific files

3. **Analysis Status**
   - Show real-time analysis progress
   - Display analysis errors
   - Retry failed analyses

4. **Context Summary**
   - Show extracted UI components
   - Display detected code snippets
   - Show error messages

---

## Related Documentation

- [File Context Integration](./file-context-integration.md) - Backend integration
- [Vision API Integration](./vision-api-integration.md) - Image analysis
- [File Context Integration Test Plan](../tests/file-context-integration-test.md) - Testing guide

---

## Changelog

### v1.0.0 (Current)
- Added conversationId to chat mutation
- Added conversationId to generatePatch mutation
- Added getConversationFiles query
- Added console logging for debugging
- Added visual file context indicator
- Indicator shows file count and analyzed count
- Indicator only shown when files are present

### Planned for v1.1.0
- File context preview with thumbnails
- Manual file selection
- Real-time analysis status
- Context summary display
