# Plain-Language Patch Generation Test Plan

## Overview

This document outlines testing for the new plain-language patch generation system that allows administrators to make changes using simple, natural language requests.

---

## Test Examples

### Example 1: "add dark mode"

**Expected Flow:**
1. **Interpretation:** System interprets this as implementing a complete dark mode theme system
2. **Expansion:** Expands to include:
   - Theme context/provider
   - Color scheme definitions
   - Toggle UI component
   - Persistence (localStorage)
   - All pages/components that need theme support
3. **Confirmation:** Shows administrator what will be done
4. **Generation:** Generates complete patch with all necessary files

**Expected Files:**
- `src/contexts/ThemeContext.tsx` (create)
- `src/components/ThemeToggle.tsx` (create)
- `src/app/layout.tsx` (modify - add ThemeProvider)
- `src/styles/globals.css` (modify - add dark mode CSS variables)
- Multiple page files (modify - add theme support)

---

### Example 2: "fix the login bug"

**Expected Flow:**
1. **Interpretation:** System analyzes authentication flow
2. **Expansion:** Expands to include:
   - Error handling improvements
   - Validation enhancements
   - User feedback improvements
   - Edge case handling
3. **Clarification (if needed):** "What specific issue are you experiencing with login?"
4. **Generation:** Generates patch with fixes

**Expected Files:**
- `src/app/api/auth/login/route.ts` (modify)
- `src/components/LoginForm.tsx` (modify)
- `src/lib/auth/validation.ts` (modify or create)

---

### Example 3: "make the dashboard prettier"

**Expected Flow:**
1. **Interpretation:** System understands this as UI/UX improvement
2. **Expansion:** Expands to include:
   - Modern UI components
   - Better layout and spacing
   - Improved visual hierarchy
   - Color scheme updates
   - Typography improvements
3. **Confirmation:** Shows specific improvements planned
4. **Generation:** Generates patch with redesign

**Expected Files:**
- `src/app/dashboard/page.tsx` (modify)
- `src/components/dashboard/*` (modify multiple components)
- `src/styles/dashboard.css` (modify or create)

---

### Example 4: "add export to CSV"

**Expected Flow:**
1. **Interpretation:** System understands this as data export feature
2. **Expansion:** Expands to include:
   - CSV generation logic
   - Download functionality
   - Export button UI
   - Proper formatting
   - Error handling
3. **Generation:** Generates complete implementation

**Expected Files:**
- `src/lib/export/csv.ts` (create)
- `src/components/ExportButton.tsx` (create)
- Relevant data table components (modify)

---

### Example 5: "improve performance"

**Expected Flow:**
1. **Interpretation:** System understands this as performance optimization
2. **Expansion:** Expands to include:
   - Code splitting
   - Lazy loading
   - Caching strategies
   - Database query optimization
   - Image optimization
3. **Clarification (likely needed):** "Which pages or features are slow?"
4. **Generation:** Generates targeted optimizations

**Expected Files:**
- Multiple page files (modify - add lazy loading)
- `next.config.js` (modify - add optimization settings)
- API routes (modify - add caching)
- Database queries (modify - add indexes)

---

## Test Scenarios

### Scenario 1: Clear Request (No Clarification Needed)

**Input:** "add dark mode"

**Expected Response:**
```json
{
  "success": true,
  "interpreted": {
    "original": "add dark mode",
    "intent": "Implement a complete dark mode theme system",
    "scope": "feature",
    "confidence": 0.95,
    "expandedDescription": "...",
    "suggestedFiles": [...],
    "suggestedActions": [...],
    "clarificationNeeded": [],
    "examples": [...]
  },
  "confirmationMessage": "I understand you want to: Implement a complete dark mode theme system..."
}
```

**User Action:** Confirm and proceed

**Final Result:** Complete dark mode implementation patch

---

### Scenario 2: Unclear Request (Clarification Needed)

**Input:** "fix it"

**Expected Response:**
```json
{
  "success": false,
  "interpreted": {
    "original": "fix it",
    "intent": "Fix an unspecified issue",
    "scope": "unclear",
    "confidence": 0.2,
    "clarificationNeeded": [
      "What needs to be fixed?",
      "What is the current issue or error?",
      "Which page or feature is affected?"
    ]
  },
  "clarificationNeeded": "I need some clarification to proceed with your request..."
}
```

**User Action:** Provide more details

**Retry Input:** "fix the login form validation"

**Final Result:** Patch with validation fixes

---

### Scenario 3: Moderately Clear Request (Confirmation Recommended)

**Input:** "add notifications"

**Expected Response:**
```json
{
  "success": true,
  "interpreted": {
    "original": "add notifications",
    "intent": "Implement a notification system",
    "scope": "feature",
    "confidence": 0.75,
    "expandedDescription": "...",
    "clarificationNeeded": [
      "What type of notifications? (push, email, in-app)",
      "What events should trigger notifications?"
    ]
  },
  "confirmationMessage": "I understand you want to: Implement a notification system..."
}
```

**User Action:** Either confirm or provide more details

**Final Result:** Complete notification system patch

---

## API Endpoints

### 1. Get Example Requests

**Endpoint:** `trpc.aiAdmin.getExampleRequests.useQuery()`

**Response:**
```json
{
  "success": true,
  "examples": [
    {
      "simple": "add dark mode",
      "expanded": "Implement a complete dark mode theme system..."
    },
    ...
  ]
}
```

---

### 2. Generate Patch from Plain Language

**Endpoint:** `trpc.aiAdmin.generatePatchFromPlainLanguage.useMutation()`

**Input:**
```json
{
  "request": "add dark mode",
  "skipConfirmation": false
}
```

**Response (Confirmation Needed):**
```json
{
  "success": true,
  "interpreted": { ... },
  "confirmationMessage": "..."
}
```

**Response (Patch Generated):**
```json
{
  "success": true,
  "interpreted": { ... },
  "patch": {
    "id": "uuid",
    "request": "...",
    "summary": "...",
    "files": [...],
    "testingSteps": [...],
    "risks": [...]
  }
}
```

**Response (Clarification Needed):**
```json
{
  "success": false,
  "interpreted": { ... },
  "clarificationNeeded": "..."
}
```

---

## UI Flow

### Step 1: Input Request

Administrator types simple request in AI Admin chat:
```
"add dark mode"
```

### Step 2: Interpretation

System shows interpretation:
```
✓ I understand you want to: Implement a complete dark mode theme system

Scope: feature
Confidence: 95%

What I'll do:
- Create theme context and provider
- Add dark mode toggle component
- Update all pages with theme support
- Add CSS variables for dark mode colors
- Persist theme preference in localStorage

Files that will be modified:
- src/contexts/ThemeContext.tsx (create)
- src/components/ThemeToggle.tsx (create)
- src/app/layout.tsx (modify)
- src/styles/globals.css (modify)
- ... (5 more files)

Actions:
1. Create ThemeContext with dark/light mode state
2. Implement ThemeToggle component with icon
3. Add ThemeProvider to root layout
4. Define CSS variables for both themes
5. Update components to use theme colors

New dependencies:
- None (using React Context API)

Similar implementations:
- shadcn/ui theme system
- Next.js theme switcher examples

Would you like me to proceed with generating this patch?
```

### Step 3: Confirmation

Administrator clicks "Yes, proceed" or "No, let me clarify"

### Step 4: Generation

System generates complete patch and shows preview

### Step 5: Review & Apply

Administrator reviews patch and applies it

---

## Success Criteria

### Must Pass:
- ✅ Simple requests generate complete, production-ready patches
- ✅ Unclear requests trigger clarification prompts
- ✅ Confirmation messages are clear and detailed
- ✅ Generated patches include all necessary files
- ✅ No technical knowledge required from administrator

### Should Pass:
- ✅ Interpretation confidence > 70% for clear requests
- ✅ Expanded descriptions are comprehensive
- ✅ Suggested files are accurate
- ✅ Examples are relevant and helpful

### Nice to Have:
- ✅ Automatic dependency detection
- ✅ Similar implementation references
- ✅ Risk assessment
- ✅ Testing steps included

---

## Test Checklist

### Basic Functionality:
- [ ] Simple request ("add dark mode") generates patch
- [ ] Unclear request ("fix it") triggers clarification
- [ ] Confirmation message is shown before generation
- [ ] Skip confirmation flag works correctly
- [ ] Example requests are displayed in UI

### Request Interpretation:
- [ ] Intent is correctly identified
- [ ] Scope is correctly categorized
- [ ] Confidence score is reasonable
- [ ] Expanded description is comprehensive
- [ ] Suggested files are accurate

### Patch Generation:
- [ ] All necessary files are included
- [ ] File actions (create/modify/delete) are correct
- [ ] Code quality is production-ready
- [ ] Dependencies are identified
- [ ] Testing steps are provided

### User Experience:
- [ ] Confirmation message is clear
- [ ] Clarification questions are helpful
- [ ] Examples guide administrators
- [ ] Error messages are actionable
- [ ] Overall flow is intuitive

---

## Example Test Cases

### Test Case 1: Dark Mode
```
Input: "add dark mode"
Expected: Complete theme system with toggle, persistence, and full page support
Files: 5-10 files (create + modify)
Confidence: > 90%
```

### Test Case 2: CSV Export
```
Input: "add export to CSV"
Expected: CSV generation logic + download button + proper formatting
Files: 3-5 files (create + modify)
Confidence: > 85%
```

### Test Case 3: Login Bug
```
Input: "fix the login bug"
Expected: Clarification prompt asking for specific issue
Clarification: "What specific issue are you experiencing?"
After clarification: Targeted bug fix patch
```

### Test Case 4: Performance
```
Input: "improve performance"
Expected: Clarification prompt asking which pages/features
Clarification: "Which pages or features are slow?"
After clarification: Targeted optimization patch
```

### Test Case 5: Dashboard Redesign
```
Input: "make the dashboard prettier"
Expected: UI/UX improvements with modern components
Files: 5-15 files (modify dashboard components)
Confidence: > 80%
```

---

## Notes

- All tests should be run with real OpenAI API calls
- Monitor token usage and costs
- Check for hallucinated files or components
- Verify all suggested files actually exist or are correctly marked as "create"
- Ensure patches are validated before being shown to user
- Test with various administrator skill levels (technical vs non-technical)

---

## Future Enhancements

- [ ] Learn from applied patches to improve future interpretations
- [ ] Suggest related improvements after patch application
- [ ] Detect patterns in administrator requests
- [ ] Auto-apply patches for trusted request types
- [ ] Batch processing for multiple related requests
- [ ] Undo/rollback with one click
- [ ] Patch preview with diff view
- [ ] Estimated time to apply patch
- [ ] Risk scoring for patches
- [ ] Automatic testing after patch application
