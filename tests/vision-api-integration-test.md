# Vision API Integration Test Plan

## Overview
Testing the complete file upload and Vision API integration for AI Admin, including:
- File upload to S3
- Metadata persistence in database
- Automatic image analysis with OpenAI Vision API
- Analysis result storage and display
- Integration with chat context

---

## Test Environment

**Components to Test:**
1. FileUpload component (frontend)
2. uploadFile endpoint (backend)
3. analyzeImage endpoint (backend)
4. VisionAnalyzer class (AI integration)
5. Database persistence (aiUploadedFiles table)

**Prerequisites:**
- ✅ OpenAI API key configured
- ✅ S3 storage configured
- ✅ Database tables created (aiUploadedFiles)
- ✅ AI Admin access (admin role)

---

## Test Scenarios

### Test 1: Basic Image Upload
**Objective:** Verify image uploads to S3 and triggers analysis

**Steps:**
1. Open AI Admin in Chat mode
2. Click on file upload area or drag an image
3. Select a UI screenshot (e.g., dashboard, form, button)
4. Wait for upload to complete

**Expected Results:**
- ✅ File shows "Uploading..." status
- ✅ Upload completes successfully
- ✅ File shows "Analyzing..." status
- ✅ Analysis completes with "✓ Analyzed" indicator
- ✅ Console shows: `[FileUpload] Image analysis completed: {...}`
- ✅ File is accessible via S3 URL

**Success Criteria:**
- Upload time < 5 seconds
- Analysis time < 10 seconds
- No errors in console

---

### Test 2: UI Component Detection
**Objective:** Verify Vision API detects UI components correctly

**Test Images:**
1. Dashboard with cards, charts, navigation
2. Form with inputs, buttons, labels
3. Modal dialog with overlay
4. Navigation menu with links

**Steps:**
1. Upload each test image
2. Wait for analysis to complete
3. Check console for analysis results
4. Verify detected components

**Expected Analysis Results:**
- Dashboard: `uiComponents: ["card", "chart", "navigation", "header"]`
- Form: `uiComponents: ["form", "input", "button"]`
- Modal: `uiComponents: ["modal", "dialog", "button"]`
- Navigation: `uiComponents: ["menu", "navigation"]`

**Success Criteria:**
- At least 3 UI components detected per image
- Components are relevant to the image content
- `suggestedContext` is meaningful

---

### Test 3: Code Screenshot Analysis
**Objective:** Verify Vision API detects code snippets

**Test Images:**
1. Code editor screenshot with TypeScript
2. Terminal with error message
3. Browser console with stack trace
4. Code diff/patch view

**Steps:**
1. Upload code screenshot
2. Wait for analysis
3. Check for code snippet detection

**Expected Results:**
- ✅ `codeSnippets` array is populated
- ✅ Code language is identified (if visible)
- ✅ `detectedElements` includes "code snippet"
- ✅ Analysis description mentions code

**Success Criteria:**
- Code snippets are extracted accurately
- Error messages are detected if present
- Relevant context is suggested

---

### Test 4: Error Message Detection
**Objective:** Verify Vision API detects error messages

**Test Images:**
1. Browser error page (404, 500)
2. Application error with stack trace
3. Console error messages
4. Build/compilation errors

**Steps:**
1. Upload error screenshot
2. Wait for analysis
3. Check for error detection

**Expected Results:**
- ✅ `errorMessages` array is populated
- ✅ Error text is extracted
- ✅ `detectedElements` includes "error message"
- ✅ Analysis highlights the error

**Success Criteria:**
- Error messages are accurately extracted
- Stack traces are identified
- Helpful context is provided

---

### Test 5: Multiple File Upload
**Objective:** Verify batch upload and analysis

**Steps:**
1. Select 3-5 images at once
2. Upload all files
3. Wait for all analyses to complete

**Expected Results:**
- ✅ All files upload in parallel
- ✅ Each file shows individual status
- ✅ All files are analyzed independently
- ✅ No race conditions or errors
- ✅ All analyses complete successfully

**Success Criteria:**
- All files upload within 30 seconds
- All analyses complete within 60 seconds
- No errors or timeouts

---

### Test 6: Database Persistence
**Objective:** Verify metadata and analysis are saved to database

**Steps:**
1. Upload an image
2. Wait for analysis to complete
3. Query the database directly

**Database Query:**
```sql
SELECT 
  id, 
  file_name, 
  file_type, 
  file_size, 
  s3_key, 
  s3_url, 
  analysis_result,
  created_at
FROM ai_uploaded_files
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Results:**
- ✅ Record exists in `ai_uploaded_files` table
- ✅ `s3_key` and `s3_url` are populated
- ✅ `analysis_result` contains JSON with:
  - `description`
  - `detectedElements`
  - `suggestedContext`
  - `uiComponents` (if image has UI)
  - `codeSnippets` (if image has code)
  - `errorMessages` (if image has errors)

**Success Criteria:**
- All fields are populated correctly
- JSON structure matches VisionAnalysisResult interface
- Data persists across sessions

---

### Test 7: File Type Validation
**Objective:** Verify only supported file types are accepted

**Test Files:**
1. ✅ Supported: .jpg, .png, .gif, .webp, .pdf, .txt, .md, .ts, .tsx, .py, .js, .jsx, .json
2. ❌ Unsupported: .exe, .zip, .mp4, .mp3, .doc

**Steps:**
1. Try uploading each file type
2. Check validation messages

**Expected Results:**
- ✅ Supported files upload successfully
- ❌ Unsupported files show error: "File type not supported"
- ✅ Images trigger analysis
- ✅ Non-images skip analysis

**Success Criteria:**
- Validation works correctly
- Clear error messages
- No crashes or exceptions

---

### Test 8: File Size Limits
**Objective:** Verify file size limits are enforced

**Test Files:**
1. Small image (< 1MB)
2. Medium image (5MB)
3. Large image (> 10MB)

**Steps:**
1. Try uploading each file
2. Check validation

**Expected Results:**
- ✅ Small and medium files upload successfully
- ❌ Large files show error: "File size exceeds 10MB limit"

**Success Criteria:**
- Size limit is enforced
- Clear error message
- No partial uploads

---

### Test 9: Analysis Error Handling
**Objective:** Verify graceful handling of analysis failures

**Test Scenarios:**
1. Invalid API key (temporarily)
2. Network timeout
3. Unsupported image format
4. Corrupted image file

**Steps:**
1. Simulate each error scenario
2. Upload a file
3. Observe error handling

**Expected Results:**
- ✅ File uploads successfully (even if analysis fails)
- ✅ Error is logged to console
- ✅ User sees upload success
- ✅ Analysis failure doesn't block upload
- ✅ No crashes or unhandled exceptions

**Success Criteria:**
- Graceful degradation
- User can still use uploaded file
- Clear error logging

---

### Test 10: Integration with Chat Context
**Objective:** Verify uploaded files and analysis are available in chat

**Steps:**
1. Upload an image with UI components
2. Wait for analysis
3. Ask AI Admin: "Create a component based on the uploaded image"
4. Check if AI references the image analysis

**Expected Results:**
- ✅ AI acknowledges the uploaded file
- ✅ AI uses analysis results in response
- ✅ AI mentions detected UI components
- ✅ Generated code reflects image content

**Success Criteria:**
- AI has access to file analysis
- Responses are contextually relevant
- Analysis improves code generation quality

---

## Performance Benchmarks

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Upload Time (1MB image) | < 2s | < 5s | > 5s |
| Analysis Time | < 5s | < 10s | > 10s |
| Total Time (upload + analysis) | < 7s | < 15s | > 15s |
| Batch Upload (5 images) | < 15s | < 30s | > 30s |
| Database Write Time | < 500ms | < 1s | > 1s |

---

## Console Logs to Watch For

### ✅ Success Logs:
```
[FileUpload] Image analysis completed: {
  description: "A dashboard interface with...",
  detectedElements: ["card", "chart", "button"],
  suggestedContext: "UI components detected: card, chart, button",
  uiComponents: ["card", "chart", "button"]
}
```

### ❌ Error Logs:
```
[FileUpload] Image analysis failed: Error: Vision API request failed
[VisionAnalyzer] Analysis failed: OpenAI API error
```

### 🔍 Debug Logs:
```
[VisionAnalyzer] Analyzing image: https://s3.amazonaws.com/...
[VisionAnalyzer] Analysis complete in 3.2s
[aiAdmin.uploadFile] File saved to database: file_id_123
[aiAdmin.analyzeImage] Analysis saved to database
```

---

## Testing Checklist

### Functional Tests
- [ ] Test 1: Basic image upload
- [ ] Test 2: UI component detection
- [ ] Test 3: Code screenshot analysis
- [ ] Test 4: Error message detection
- [ ] Test 5: Multiple file upload
- [ ] Test 6: Database persistence
- [ ] Test 7: File type validation
- [ ] Test 8: File size limits
- [ ] Test 9: Analysis error handling
- [ ] Test 10: Integration with chat context

### Performance Tests
- [ ] Upload time benchmarks
- [ ] Analysis time benchmarks
- [ ] Batch upload performance
- [ ] Database query performance

### Edge Cases
- [ ] Empty/blank images
- [ ] Very small images (< 100x100)
- [ ] Very large images (> 4000x4000)
- [ ] Images with no text/UI
- [ ] Images with multiple languages
- [ ] Screenshots with dark/light themes

---

## Known Limitations

1. **Vision API Accuracy:** May not detect all UI components perfectly
2. **Code Extraction:** Limited to visible code in screenshots
3. **Language Support:** Best results with English text
4. **File Size:** 10MB limit per file
5. **Rate Limits:** OpenAI API rate limits apply

---

## Success Criteria

**Must Pass:**
- ✅ All 10 functional tests pass
- ✅ No critical errors or crashes
- ✅ Files upload and persist correctly
- ✅ Analysis completes within acceptable time
- ✅ Database records are created correctly

**Nice to Have:**
- ✅ Performance meets target benchmarks
- ✅ All edge cases handled gracefully
- ✅ Analysis accuracy > 80%
- ✅ User experience is smooth and intuitive

---

## Next Steps After Testing

1. **If all tests pass:** Mark Phase 2 as complete, move to Phase 3
2. **If minor issues:** Document and create follow-up tasks
3. **If major issues:** Debug and fix before proceeding
4. **Collect feedback:** Ask user about analysis quality and usefulness

---

## Related Files

- `src/lib/ai-admin/vision-analyzer.ts` - Vision API integration
- `src/server/routers/ai-admin.ts` - Upload and analysis endpoints
- `src/app/admin/ai/components/FileUpload.tsx` - Upload UI
- `src/app/admin/ai/components/ImageAnalysisDisplay.tsx` - Analysis display
- `src/lib/db/schema/ai-conversations.ts` - Database schema
