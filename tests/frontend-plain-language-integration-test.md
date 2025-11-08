# Frontend Plain-Language Integration Test

## Overview

Test plan for the complete frontend integration of the plain-language patch system in AI Admin.

---

## Test Environment

- **URL:** `/admin/ai`
- **Mode:** Patch Mode
- **Simple Mode:** Enabled (toggle ON)

---

## Test Scenarios

### 1. **Example Requests Display**

**Test:** Verify example requests panel appears

**Steps:**
1. Navigate to `/admin/ai`
2. Click "Patch" mode
3. Ensure "Simple Mode" toggle is ON
4. Observe example requests panel

**Expected:**
- ✅ Example requests panel appears below header
- ✅ Shows 10 example requests with descriptions
- ✅ Each example has:
  - Simple request text (e.g., "add dark mode")
  - Expanded description
  - Clickable card with hover effect
- ✅ Tip message at bottom

**Screenshot Areas:**
- Example requests panel layout
- Hover states
- Responsive design

---

### 2. **Simple Mode Toggle**

**Test:** Verify simple mode toggle works

**Steps:**
1. In Patch mode, locate "Simple Mode" toggle
2. Click toggle to turn OFF
3. Observe UI changes
4. Click toggle to turn ON again

**Expected:**
- ✅ Toggle switches between ON (purple) and OFF (gray)
- ✅ When OFF: Example requests panel disappears
- ✅ When ON: Example requests panel appears
- ✅ Smooth animation
- ✅ State persists during session

---

### 3. **Example Request Selection**

**Test:** Verify clicking example fills input

**Steps:**
1. Ensure Simple Mode is ON
2. Click any example request card
3. Observe input field

**Expected:**
- ✅ Input field auto-fills with simple request text
- ✅ Cursor moves to input field
- ✅ User can edit the filled text
- ✅ User can send immediately or modify first

---

### 4. **Plain-Language Patch Generation - Happy Path**

**Test:** Generate patch from simple request

**Steps:**
1. Ensure Simple Mode is ON
2. Type "add dark mode" in input
3. Click Send
4. Wait for interpretation
5. Observe confirmation dialog

**Expected:**
- ✅ Loading state shows "Processing..."
- ✅ Confirmation dialog appears with:
  - Intent: "Implement a complete dark mode theme system"
  - Scope: "feature" badge
  - Confidence: ~95%
  - Expanded description
  - List of files to modify
  - List of actions
  - Technical details (frameworks, patterns)
  - Similar implementations
- ✅ Two buttons: "No, let me clarify" and "Yes, proceed"

---

### 5. **Confirmation Dialog - Confirm**

**Test:** Confirm patch generation

**Steps:**
1. Follow steps from Test 4
2. Click "Yes, proceed" button
3. Wait for patch generation
4. Observe results

**Expected:**
- ✅ Dialog shows "Generating..." state
- ✅ Button disabled during generation
- ✅ Dialog closes after generation
- ✅ Assistant message appears with:
  - "Patch Generated Successfully (Plain-Language Mode)"
  - Summary and description
  - Files to be modified
  - Testing steps
  - Risks
  - Patch ID
- ✅ "Apply Patch" button appears

---

### 6. **Confirmation Dialog - Cancel**

**Test:** Cancel patch generation

**Steps:**
1. Type "add export to CSV" in input
2. Click Send
3. Wait for confirmation dialog
4. Click "No, let me clarify" button

**Expected:**
- ✅ Dialog closes immediately
- ✅ No patch generated
- ✅ User message remains in chat
- ✅ No assistant response added
- ✅ Input field cleared
- ✅ User can type new request

---

### 7. **Clarification Prompt**

**Test:** Handle unclear request

**Steps:**
1. Ensure Simple Mode is ON
2. Type "fix it" in input
3. Click Send
4. Observe response

**Expected:**
- ✅ No confirmation dialog appears
- ✅ Assistant message with clarification questions:
  - "I need some clarification..."
  - List of questions
  - "What I think you want:"
  - Request for more details
- ✅ User can respond with more details
- ✅ Next request uses clarification

---

### 8. **Low Confidence Request**

**Test:** Handle low confidence interpretation

**Steps:**
1. Type "make it better" in input
2. Click Send
3. Observe response

**Expected:**
- ✅ Clarification prompt appears (confidence < 70%)
- ✅ Message explains low confidence
- ✅ Provides helpful questions
- ✅ User can provide more context

---

### 9. **Standard Mode Fallback**

**Test:** Verify standard patch mode still works

**Steps:**
1. Turn Simple Mode OFF
2. Type "add dark mode toggle to dashboard" in input
3. Click Send
4. Observe behavior

**Expected:**
- ✅ No confirmation dialog
- ✅ Direct patch generation (standard flow)
- ✅ Patch generated without interpretation step
- ✅ Standard patch result message

---

### 10. **Error Handling**

**Test:** Handle API errors gracefully

**Steps:**
1. Ensure Simple Mode is ON
2. Type a valid request
3. Simulate network error (disconnect network)
4. Click Send
5. Observe error handling

**Expected:**
- ✅ Error message appears
- ✅ User-friendly error text
- ✅ Suggestion to try again
- ✅ No crash or broken state
- ✅ User can retry after reconnecting

---

## UI/UX Checks

### Visual Design

- [ ] Confirmation dialog is centered and modal
- [ ] Dialog has proper z-index (above other elements)
- [ ] Backdrop blur effect works
- [ ] Colors match theme (purple/blue gradient)
- [ ] Icons are appropriate and visible
- [ ] Text is readable (good contrast)
- [ ] Spacing is consistent
- [ ] Rounded corners match design system

### Responsive Design

- [ ] Dialog works on mobile (< 768px)
- [ ] Example requests panel stacks on mobile
- [ ] Toggle button accessible on mobile
- [ ] Dialog scrollable on small screens
- [ ] Touch targets large enough (min 44px)

### Accessibility

- [ ] Dialog can be closed with ESC key
- [ ] Tab navigation works correctly
- [ ] Focus trap within dialog
- [ ] Screen reader friendly labels
- [ ] Keyboard shortcuts work
- [ ] Color contrast meets WCAG AA

### Performance

- [ ] Example requests load quickly (< 1s)
- [ ] Interpretation request completes (< 5s)
- [ ] Patch generation completes (< 20s)
- [ ] No UI freezing or lag
- [ ] Smooth animations (60fps)

---

## Integration Checks

### Data Flow

- [ ] Example requests fetched from API
- [ ] Interpretation request sent correctly
- [ ] Confirmation data passed to dialog
- [ ] Patch generation triggered on confirm
- [ ] Patch data displayed correctly
- [ ] Error states handled properly

### State Management

- [ ] Simple mode toggle state persists
- [ ] Pending request stored correctly
- [ ] Interpreted request stored correctly
- [ ] Dialog state managed correctly
- [ ] Messages array updated correctly
- [ ] Selected patch ID set correctly

### API Integration

- [ ] `getExampleRequests` query works
- [ ] `generatePatchFromPlainLanguage` mutation works
- [ ] Skip confirmation parameter works
- [ ] Error responses handled
- [ ] Loading states shown
- [ ] Success responses processed

---

## Edge Cases

### 1. **Multiple Rapid Requests**

**Test:** Send multiple requests quickly

**Steps:**
1. Type request and send
2. Immediately type another and send
3. Observe behavior

**Expected:**
- ✅ Second request blocked until first completes
- ✅ Or queued properly
- ✅ No race conditions
- ✅ UI state consistent

### 2. **Very Long Request**

**Test:** Type very long request (500+ chars)

**Steps:**
1. Type a very detailed, long request
2. Send and observe

**Expected:**
- ✅ Request accepted
- ✅ Interpretation handles long text
- ✅ Dialog displays properly (scrollable)
- ✅ No truncation or overflow

### 3. **Special Characters**

**Test:** Request with special characters

**Steps:**
1. Type request with quotes, apostrophes, emojis
2. Send and observe

**Expected:**
- ✅ Characters handled correctly
- ✅ No encoding issues
- ✅ Display correct in dialog
- ✅ No errors

### 4. **Network Interruption**

**Test:** Network drops during generation

**Steps:**
1. Start patch generation
2. Disconnect network mid-generation
3. Observe behavior

**Expected:**
- ✅ Timeout error shown
- ✅ User can retry
- ✅ State recovers gracefully
- ✅ No data loss

---

## Success Criteria

### Must Have ✅
- [x] Example requests display correctly
- [x] Simple mode toggle works
- [x] Clicking example fills input
- [x] Confirmation dialog appears
- [x] Confirm generates patch
- [x] Cancel closes dialog
- [x] Clarification prompts work
- [x] Error handling works
- [x] Standard mode still works

### Should Have 🎯
- [ ] Responsive on mobile
- [ ] Keyboard navigation
- [ ] Loading states smooth
- [ ] Error messages helpful
- [ ] Performance acceptable

### Nice to Have 💡
- [ ] Animations polished
- [ ] Accessibility perfect
- [ ] Edge cases handled
- [ ] Network resilience

---

## Test Results

### Test Date: _______________
### Tester: _______________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Example Requests Display | ⬜ Pass ⬜ Fail | |
| 2 | Simple Mode Toggle | ⬜ Pass ⬜ Fail | |
| 3 | Example Selection | ⬜ Pass ⬜ Fail | |
| 4 | Patch Generation - Happy Path | ⬜ Pass ⬜ Fail | |
| 5 | Confirmation - Confirm | ⬜ Pass ⬜ Fail | |
| 6 | Confirmation - Cancel | ⬜ Pass ⬜ Fail | |
| 7 | Clarification Prompt | ⬜ Pass ⬜ Fail | |
| 8 | Low Confidence Request | ⬜ Pass ⬜ Fail | |
| 9 | Standard Mode Fallback | ⬜ Pass ⬜ Fail | |
| 10 | Error Handling | ⬜ Pass ⬜ Fail | |

---

## Issues Found

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| | | | |

---

## Recommendations

1. **Performance:**
   - Monitor API response times
   - Add caching for example requests
   - Optimize dialog rendering

2. **UX:**
   - Add keyboard shortcuts
   - Improve loading states
   - Add success animations

3. **Accessibility:**
   - Add ARIA labels
   - Test with screen readers
   - Improve focus management

4. **Error Handling:**
   - Add retry mechanisms
   - Improve error messages
   - Add offline detection

---

## Next Steps

- [ ] Fix all critical issues
- [ ] Test on production
- [ ] Collect user feedback
- [ ] Iterate based on feedback
- [ ] Add analytics tracking
- [ ] Monitor success rates
