# Empty Patch Fix - Test Plan

## Test Scenarios

### Test 1: Vague Request (Previously Failed)
**Request:** "Add dark mode support"

**Expected Behavior:**
- ContextGatherer extracts keywords: ["dark", "mode", "theme"]
- FileTreeCache finds relevant files:
  * `src/app/globals.css` or `src/index.css`
  * `tailwind.config.ts`
  * `src/contexts/ThemeContext.tsx` (if exists)
- Loads file contents before patch generation
- AI generates patch with actual context
- PatchValidator validates patch has files
- **Success:** Patch generated with 2-3 files

**How to Test:**
1. Go to AI Admin
2. Switch to Patch Mode
3. Enter: "Add dark mode support"
4. Check browser console for logs:
   ```
   [ContextGatherer] Keywords extracted: ...
   [ContextGatherer] Found X relevant files
   [FileTreeCache] Cache hit/miss
   ```
5. Verify patch is generated (not empty)

---

### Test 2: Specific File Request
**Request:** "Modify src/app/admin/ai/page.tsx to add a help button in the header"

**Expected Behavior:**
- ContextGatherer extracts path: `src/app/admin/ai/page.tsx`
- Direct file loading (no pattern matching needed)
- File content provided to AI
- Patch generated with 1 file
- **Success:** Patch modifies the correct file

**How to Test:**
1. Enter the request in Patch Mode
2. Check console for:
   ```
   [ContextGatherer] Direct path found: src/app/admin/ai/page.tsx
   ```
3. Verify patch targets the correct file

---

### Test 3: Component Creation Request
**Request:** "Create a LoadingSpinner component in the components directory"

**Expected Behavior:**
- ContextGatherer finds components directory
- Suggests location for new component
- Patch creates new file
- **Success:** Patch has action: "create"

**How to Test:**
1. Enter the request
2. Check if patch creates `src/components/LoadingSpinner.tsx`
3. Verify file has proper React component code

---

### Test 4: Empty Patch Scenario (Should Fail Gracefully)
**Request:** "Fix the bug in the nonexistent file that doesn't exist"

**Expected Behavior:**
- ContextGatherer tries to find files
- No relevant files found
- AI generates patch (possibly empty)
- **PatchValidator catches empty patch**
- User gets helpful error message:
  * "The patch has no files to modify"
  * "Try being more specific..."
  * Suggestions provided

**How to Test:**
1. Enter the nonsense request
2. Should see validation error (not GitHub API error)
3. Error message should be helpful and actionable

---

### Test 5: Multiple Files Request
**Request:** "Add TypeScript types for the AGI system across all files"

**Expected Behavior:**
- ContextGatherer finds AGI-related files
- Loads multiple file contents
- Patch modifies 3-5 files
- **Success:** Multi-file patch generated

**How to Test:**
1. Enter the request
2. Check console for multiple files loaded
3. Verify patch has multiple files in the array

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Empty Patch Rate | <10% | Count patches with 0 files / total patches |
| Success Rate (first attempt) | >80% | Patches that apply successfully / total |
| Context Gathering Time | <2s | Check console timestamps |
| Error Message Quality | Helpful | User can understand and act on errors |

---

## Console Logs to Watch For

### ✅ Good Signs:
```
[ContextGatherer] Keywords extracted: ["dark", "mode", "theme"]
[ContextGatherer] Found 3 relevant files
[FileTreeCache] Cache hit for apex-agents
[ContextGatherer] Loaded 3 files, total size: 15.2 KB
Enhanced context: 5 total files after merging
Patch validation warnings: Missing testing steps
Patch generated successfully on attempt 1
```

### ❌ Bad Signs:
```
[ContextGatherer] No relevant files found
[PatchValidator] ERROR: Files array is empty
Patch validation failed after 3 attempts
```

### 🔍 Debugging Info:
```
[FileTreeCache] Building tree for apex-agents...
[FileTreeCache] Tree built: 245 files
[ContextGatherer] Pattern matches for "theme": 4 files
[PatchValidator] Patch quality score: 85/100
```

---

## Testing Checklist

- [ ] Test 1: Vague request (dark mode)
- [ ] Test 2: Specific file request
- [ ] Test 3: Component creation
- [ ] Test 4: Empty patch scenario
- [ ] Test 5: Multiple files request
- [ ] Check console logs for all tests
- [ ] Verify error messages are helpful
- [ ] Measure success rate
- [ ] Compare with pre-fix behavior

---

## Expected Improvements

**Before Fix:**
- ~60% empty patches
- Generic error messages
- No context gathering
- Wasted GitHub API calls

**After Fix:**
- <10% empty patches
- Specific, actionable errors
- Proactive file discovery
- Reduced API waste

---

## Next Steps After Testing

1. **If success rate >80%:** Mark as complete, move to next feature
2. **If success rate 50-80%:** Fine-tune keyword mappings
3. **If success rate <50%:** Debug and investigate failures
4. **Collect feedback:** Ask user about error message clarity

---

## Notes

- Test on production (Vercel) where the fix is deployed
- Use AI Admin's Patch Mode for all tests
- Check browser console (F12) for detailed logs
- Compare results with previous behavior
- Document any unexpected issues
