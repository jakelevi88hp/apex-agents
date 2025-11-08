# File Context Integration Test Plan

## Overview
Testing the integration of uploaded files and Vision API analysis into AI Admin chat and patch generation flows.

---

## Test Environment

**Components to Test:**
1. FileContextGatherer class
2. getConversationFiles endpoint
3. chat endpoint with file context
4. generatePatch endpoint with file context
5. AI's ability to use file context in responses

**Prerequisites:**
- ✅ Vision API integration working
- ✅ File upload working
- ✅ Image analysis working
- ✅ Database persistence working

---

## Test Scenarios

### Test 1: File Context Gathering
**Objective:** Verify FileContextGatherer retrieves uploaded files correctly

**Steps:**
1. Upload 2-3 images to a conversation
2. Wait for Vision API analysis to complete
3. Call `getConversationFiles` endpoint with conversation ID
4. Check the returned file context

**Expected Results:**
- ✅ All uploaded files are returned
- ✅ Each file has complete metadata (name, type, size, URL)
- ✅ Analysis results are included for analyzed images
- ✅ `contextText` is properly formatted

**Success Criteria:**
- `totalFiles` matches number of uploaded files
- `analyzedFiles` matches number of images
- `contextText` includes all file information

---

### Test 2: Chat with Image Context
**Objective:** Verify AI uses uploaded images in chat responses

**Test Scenario:**
1. Upload a UI screenshot (e.g., dashboard with cards and charts)
2. Wait for analysis to complete
3. Ask in chat: "What UI components do you see in the uploaded image?"
4. Check AI response

**Expected AI Response:**
- ✅ Mentions specific UI components from the image
- ✅ References the uploaded file by name
- ✅ Uses Vision API analysis results
- ✅ Provides relevant details about the UI

**Example Response:**
```
Based on the uploaded image "dashboard.png", I can see the following UI components:

- **Cards**: Multiple card components displaying metrics
- **Charts**: A line chart showing data trends
- **Navigation**: A sidebar navigation menu
- **Header**: Top navigation bar with user profile

The dashboard follows a modern card-based layout with...
```

**Success Criteria:**
- AI acknowledges the uploaded file
- AI mentions specific components from Vision API analysis
- Response is contextually relevant to the image

---

### Test 3: Code Generation from UI Screenshot
**Objective:** Verify AI generates code based on uploaded UI design

**Test Scenario:**
1. Upload a UI mockup/screenshot (e.g., login form)
2. Wait for analysis
3. Request patch: "Create a component matching the uploaded design"
4. Check generated code

**Expected Results:**
- ✅ AI references the uploaded image in patch summary
- ✅ Generated code matches the UI components in the image
- ✅ Component structure reflects the design
- ✅ Styling matches the visual design

**Example Patch:**
```typescript
// src/components/LoginForm.tsx
export default function LoginForm() {
  return (
    <div className="flex flex-col gap-4">
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button>Sign In</button>
    </div>
  );
}
```

**Success Criteria:**
- Generated code includes components from Vision API analysis
- Layout matches the uploaded design
- Patch summary mentions the uploaded file

---

### Test 4: Error Debugging with Screenshot
**Objective:** Verify AI can debug errors from screenshots

**Test Scenario:**
1. Upload an error screenshot (e.g., browser console error)
2. Wait for analysis
3. Ask: "Fix the error shown in the screenshot"
4. Check AI response and generated patch

**Expected Results:**
- ✅ AI identifies the error from the screenshot
- ✅ AI explains the error cause
- ✅ AI generates a patch to fix the error
- ✅ Patch targets the correct file and line

**Success Criteria:**
- Error message is extracted from Vision API analysis
- AI provides accurate diagnosis
- Generated fix addresses the error

---

### Test 5: Multiple Files Context
**Objective:** Verify AI can use multiple uploaded files

**Test Scenario:**
1. Upload 3 different UI screenshots (header, sidebar, content area)
2. Wait for all analyses to complete
3. Request: "Create a layout combining all three uploaded designs"
4. Check generated code

**Expected Results:**
- ✅ AI references all 3 uploaded files
- ✅ Generated code combines elements from all images
- ✅ Layout structure reflects all designs
- ✅ Patch summary mentions all files

**Success Criteria:**
- All uploaded files are included in context
- Generated code integrates all designs
- No files are missed or ignored

---

### Test 6: Code Screenshot to Implementation
**Objective:** Verify AI can implement code from screenshots

**Test Scenario:**
1. Upload a code screenshot (e.g., TypeScript function)
2. Wait for analysis
3. Request: "Implement the function shown in the screenshot"
4. Check generated code

**Expected Results:**
- ✅ AI extracts code from Vision API analysis
- ✅ Generated code matches the screenshot
- ✅ Function signature is correct
- ✅ Implementation is accurate

**Success Criteria:**
- Code is accurately extracted from image
- Generated implementation is functional
- No syntax errors

---

### Test 7: Context Text Formatting
**Objective:** Verify file context text is properly formatted for AI

**Steps:**
1. Upload an image with UI components
2. Get file context using `getConversationFiles`
3. Check the `contextText` field

**Expected Format:**
```markdown
# UPLOADED FILES CONTEXT

The user has uploaded 1 file(s) in this conversation:

## File: dashboard.png
- Type: image/png
- URL: https://s3.amazonaws.com/...

### Vision API Analysis:
A dashboard interface with cards, charts, and navigation...

**UI Components Detected:** card, chart, navigation, button

**Context:** UI components detected: card, chart, navigation, button

---
```

**Success Criteria:**
- Clear section headers
- All file metadata included
- Analysis results properly formatted
- Easy for AI to parse

---

### Test 8: File Context in Patch Generation
**Objective:** Verify file context is passed to patch generation

**Steps:**
1. Upload a UI design
2. Request a patch: "Implement this design"
3. Check console logs for file context inclusion
4. Verify generated patch uses the context

**Expected Console Logs:**
```
[generatePatch] Including 1 uploaded files in context
```

**Expected Patch:**
- Summary mentions the uploaded file
- Code reflects the design in the image
- Explanation references the file

**Success Criteria:**
- Console confirms file context inclusion
- Patch quality is improved by file context
- AI explicitly references the uploaded file

---

### Test 9: Chat Without Files
**Objective:** Verify chat works normally when no files are uploaded

**Steps:**
1. Start a new conversation (no files)
2. Ask a question: "How do I create a button component?"
3. Check response

**Expected Results:**
- ✅ Chat works normally
- ✅ No file context is included
- ✅ No errors or warnings
- ✅ Response is relevant

**Success Criteria:**
- No crashes or errors
- Normal chat functionality
- No file context in logs

---

### Test 10: File Context Persistence
**Objective:** Verify file context persists across conversation

**Steps:**
1. Upload an image in message 1
2. Wait for analysis
3. Send message 2: "What did I upload?"
4. Send message 3: "Create a component based on it"
5. Check that AI remembers the file in all messages

**Expected Results:**
- ✅ AI remembers the uploaded file in message 2
- ✅ AI uses the file context in message 3
- ✅ File context is available throughout conversation

**Success Criteria:**
- File context persists across messages
- AI can reference files from earlier in conversation
- No need to re-upload files

---

## Integration Verification

### Verify File Context Flow

**1. Upload → Analysis → Storage**
```
User uploads image
  → Vision API analyzes
  → Analysis saved to database
  → File record created in aiUploadedFiles
```

**2. Chat Request → Context Gathering → AI Response**
```
User sends chat message with conversationId
  → FileContextGatherer retrieves files
  → Analysis results formatted as contextText
  → contextText passed to agent.chat()
  → AI receives file context in system prompt
  → AI response uses file context
```

**3. Patch Request → Context Gathering → Patch Generation**
```
User requests patch with conversationId
  → FileContextGatherer retrieves files
  → Analysis results formatted as contextText
  → contextText passed to agent.generatePatch()
  → AI receives file context in user prompt
  → Generated patch uses file context
```

---

## Console Logs to Watch For

### ✅ Success Logs:
```
[chat] Including 2 uploaded files in context
[generatePatch] Including 1 uploaded files in context
[FileContextGatherer] Retrieved 3 files for conversation abc-123
```

### ❌ Error Logs:
```
[FileContextGatherer] Error getting conversation files: ...
[chat] Failed to get file context: ...
```

---

## Performance Benchmarks

| Operation | Target | Acceptable |
|-----------|--------|------------|
| Get conversation files | < 100ms | < 500ms |
| Format context text | < 50ms | < 200ms |
| Chat with file context | < 5s | < 10s |
| Patch with file context | < 15s | < 30s |

---

## Testing Checklist

### Functional Tests
- [ ] Test 1: File context gathering
- [ ] Test 2: Chat with image context
- [ ] Test 3: Code generation from UI screenshot
- [ ] Test 4: Error debugging with screenshot
- [ ] Test 5: Multiple files context
- [ ] Test 6: Code screenshot to implementation
- [ ] Test 7: Context text formatting
- [ ] Test 8: File context in patch generation
- [ ] Test 9: Chat without files
- [ ] Test 10: File context persistence

### Integration Tests
- [ ] Upload → Analysis → Context flow
- [ ] Chat → Context → Response flow
- [ ] Patch → Context → Generation flow

### Edge Cases
- [ ] Conversation with no files
- [ ] Files without analysis (non-images)
- [ ] Very large context (many files)
- [ ] Conversation with mixed file types

---

## Success Criteria

**Must Pass:**
- ✅ All 10 functional tests pass
- ✅ File context is correctly retrieved
- ✅ AI uses file context in responses
- ✅ Generated code reflects uploaded designs
- ✅ No errors or crashes

**Quality Indicators:**
- ✅ AI explicitly references uploaded files
- ✅ Generated code quality improves with file context
- ✅ Error debugging is more accurate
- ✅ UI implementation matches designs

---

## Example Test Conversation

**User:** *[Uploads dashboard.png]*

**System:** ✓ Uploaded dashboard.png (analyzing...)

**System:** ✓ Analyzed

**User:** "What UI components do you see?"

**AI:** "Based on the uploaded dashboard.png, I can see:
- 3 metric cards (Total Users, Revenue, Active Sessions)
- 1 line chart showing user growth
- Sidebar navigation with menu items
- Header with user profile

Would you like me to create components for any of these?"

**User:** "Yes, create the metric cards component"

**AI:** *[Generates patch]*
```
Summary: Create MetricCard component based on uploaded dashboard design

Files:
- src/components/MetricCard.tsx (create)

The component matches the card design shown in dashboard.png...
```

---

## Next Steps After Testing

1. **If all tests pass:** Mark file context integration as complete
2. **If issues found:** Debug and fix before proceeding
3. **Collect metrics:** Track improvement in code generation quality
4. **User feedback:** Ask about usefulness of file context feature

---

## Related Files

- `src/lib/ai-admin/file-context-gatherer.ts` - File context gathering
- `src/lib/ai-admin/agent.ts` - Chat and patch generation with context
- `src/server/routers/ai-admin.ts` - API endpoints
- `docs/vision-api-integration.md` - Vision API documentation
