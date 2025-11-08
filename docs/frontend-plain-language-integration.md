# Frontend Plain-Language Integration Documentation

## Overview

Complete documentation for the frontend integration of the plain-language patch generation system in AI Admin.

---

## Architecture

### Component Hierarchy

```
AIAdminPage
├── PatchConfirmationDialog
├── ExampleRequestsPanel
├── ConversationList
├── FileUpload
├── RepositorySearch
├── GitHubIssues
└── ConversationBranching
```

### Data Flow

```
User Input
    ↓
[Simple Mode Check]
    ↓ (if enabled)
generatePatchFromPlainLanguage (skipConfirmation=false)
    ↓
[Interpretation Result]
    ├→ Clarification Needed → Show clarification message
    ├→ Confirmation Needed → Show PatchConfirmationDialog
    └→ Patch Generated → Show patch result
    
[User Confirms in Dialog]
    ↓
generatePatchFromPlainLanguage (skipConfirmation=true)
    ↓
[Patch Generated]
    ↓
Display patch result with "Apply Patch" button
```

---

## Components

### 1. PatchConfirmationDialog

**File:** `src/app/admin/ai/components/PatchConfirmationDialog.tsx`

**Purpose:** Display detailed confirmation before generating patch

**Props:**
```typescript
interface PatchConfirmationDialogProps {
  isOpen: boolean;
  interpreted: InterpretedRequest | null;
  onConfirm: () => void;
  onCancel: () => void;
  isGenerating?: boolean;
}
```

**Features:**
- Modal dialog with backdrop blur
- Displays interpreted request details:
  - Intent and scope
  - Confidence score with color coding
  - Expanded description
  - Files to be modified
  - Actions to be taken
  - Technical details (frameworks, patterns, dependencies)
  - Similar implementations
- Confirm/Cancel buttons
- Loading state during generation
- Responsive design
- Keyboard navigation (ESC to close)

**Styling:**
- Gradient header (blue to purple)
- Color-coded scope badges
- Confidence score colors:
  - Green: >= 80%
  - Yellow: 60-79%
  - Red: < 60%
- Scrollable content area
- Fixed footer with buttons

---

### 2. ExampleRequestsPanel

**File:** `src/app/admin/ai/components/ExampleRequestsPanel.tsx`

**Purpose:** Display example requests to guide users

**Props:**
```typescript
interface ExampleRequestsPanelProps {
  examples: ExampleRequest[];
  onSelectExample: (example: string) => void;
  isLoading?: boolean;
}
```

**Features:**
- Grid layout (2 columns on desktop, 1 on mobile)
- Clickable example cards
- Hover effects
- Simple and expanded text for each example
- Tip message at bottom
- Loading state

**Styling:**
- Gradient background (blue to purple)
- White cards with hover shadow
- Icon indicators
- Responsive grid

---

### 3. Simple Mode Toggle

**Location:** AI Admin page header (Patch mode only)

**Purpose:** Toggle between simple and standard patch modes

**Features:**
- Animated toggle switch
- Purple when ON, gray when OFF
- Only visible in Patch mode
- State persists during session

**Styling:**
- Inline with mode buttons
- Smooth transition animation
- Clear ON/OFF visual states

---

## State Management

### New State Variables

```typescript
const [showConfirmation, setShowConfirmation] = useState(false);
const [interpretedRequest, setInterpretedRequest] = useState<any>(null);
const [pendingRequest, setPendingRequest] = useState<string>('');
const [useSimpleMode, setUseSimpleMode] = useState(true);
```

### State Flow

1. **User types request and sends**
   - `input` → stored in `pendingRequest`
   - `isProcessing` → true

2. **Interpretation received**
   - Result stored in `interpretedRequest`
   - `showConfirmation` → true
   - `isProcessing` → false

3. **User confirms**
   - `showConfirmation` → false
   - Patch generation starts
   - `isProcessing` → true (via mutation)

4. **Patch generated**
   - Result added to `messages`
   - `selectedPatchId` → patch.id
   - `pendingRequest` → cleared
   - `interpretedRequest` → cleared
   - `isProcessing` → false

5. **User cancels**
   - `showConfirmation` → false
   - `pendingRequest` → cleared
   - `interpretedRequest` → cleared

---

## API Integration

### Queries

#### getExampleRequests

```typescript
const getExampleRequests = trpc.aiAdmin.getExampleRequests.useQuery();

// Usage
const examples = getExampleRequests.data?.examples || [];
```

**Returns:**
```typescript
{
  success: true,
  examples: [
    {
      simple: "add dark mode",
      expanded: "Implement a complete dark mode theme system..."
    },
    // ... 9 more examples
  ]
}
```

### Mutations

#### generatePatchFromPlainLanguage

```typescript
const generatePlainLanguagePatch = trpc.aiAdmin.generatePatchFromPlainLanguage.useMutation();

// Step 1: Get interpretation
const result = await generatePlainLanguagePatch.mutateAsync({
  request: "add dark mode",
  skipConfirmation: false,
});

// Step 2: User confirms, generate patch
const result2 = await generatePlainLanguagePatch.mutateAsync({
  request: "add dark mode",
  skipConfirmation: true,
});
```

**Response Types:**

1. **Clarification Needed:**
```typescript
{
  success: false,
  clarificationNeeded: "I need some clarification...",
  interpreted: { ... }
}
```

2. **Confirmation Needed:**
```typescript
{
  success: true,
  confirmationMessage: "I understand you want to...",
  interpreted: {
    original: "add dark mode",
    intent: "Implement a complete dark mode theme system",
    scope: "feature",
    confidence: 0.95,
    expandedDescription: "...",
    suggestedFiles: [...],
    suggestedActions: [...],
    clarificationNeeded: [],
    examples: [...],
    technicalDetails: { ... }
  }
}
```

3. **Patch Generated:**
```typescript
{
  success: true,
  patch: {
    id: "patch_123",
    request: "add dark mode",
    summary: "Dark mode implementation",
    description: "...",
    files: [...],
    testingSteps: [...],
    risks: [...],
    generatedAt: "2024-01-XX",
    status: "pending"
  }
}
```

---

## User Flows

### Flow 1: Happy Path (Clear Request)

1. User enables Simple Mode (toggle ON)
2. User sees example requests panel
3. User clicks "add dark mode" example
4. Input field fills with "add dark mode"
5. User clicks Send
6. Loading state shows "Processing..."
7. Confirmation dialog appears with:
   - Intent: "Implement a complete dark mode theme system"
   - Scope: "feature"
   - Confidence: 95%
   - 5-10 files to modify
   - 7 actions listed
   - Technical details shown
8. User clicks "Yes, proceed"
9. Dialog shows "Generating..." state
10. Dialog closes
11. Assistant message appears with patch details
12. "Apply Patch" button available

**Time:** ~15-25 seconds total

---

### Flow 2: Clarification Needed (Unclear Request)

1. User types "fix it"
2. User clicks Send
3. Loading state shows "Processing..."
4. Assistant message appears with:
   - "I need some clarification..."
   - List of questions
   - "What I think you want:"
5. User types more detailed request
6. Flow continues as Happy Path

**Time:** ~5-10 seconds for clarification

---

### Flow 3: User Cancels

1. User types "add export to CSV"
2. User clicks Send
3. Confirmation dialog appears
4. User reads the plan
5. User clicks "No, let me clarify"
6. Dialog closes
7. User can type new request

**Time:** ~5 seconds

---

### Flow 4: Standard Mode (Simple Mode OFF)

1. User disables Simple Mode (toggle OFF)
2. Example requests panel disappears
3. User types detailed request
4. User clicks Send
5. Patch generated directly (no confirmation)
6. Standard patch result shown

**Time:** ~10-20 seconds

---

## Styling Guide

### Colors

**Primary:**
- Purple: `#9333ea` (purple-600)
- Blue: `#2563eb` (blue-600)
- Gradient: `from-purple-600 to-blue-600`

**Scope Colors:**
- Feature: Blue (`bg-blue-100 text-blue-800`)
- Bug Fix: Red (`bg-red-100 text-red-800`)
- Enhancement: Green (`bg-green-100 text-green-800`)
- Refactor: Purple (`bg-purple-100 text-purple-800`)
- UI Change: Pink (`bg-pink-100 text-pink-800`)
- Config: Yellow (`bg-yellow-100 text-yellow-800`)

**Confidence Colors:**
- High (>= 80%): Green (`text-green-600`)
- Medium (60-79%): Yellow (`text-yellow-600`)
- Low (< 60%): Red (`text-red-600`)

### Typography

**Headers:**
- Dialog title: `text-xl font-semibold`
- Section headers: `text-lg font-semibold`
- Sub-headers: `text-sm font-semibold`

**Body:**
- Main text: `text-sm text-gray-700`
- Description: `text-base leading-relaxed`
- Code: `font-mono text-xs`

### Spacing

- Dialog padding: `p-6`
- Section spacing: `space-y-6`
- Card padding: `p-4`
- Button padding: `px-6 py-2`

### Borders

- Dialog: `rounded-lg`
- Cards: `rounded-lg`
- Buttons: `rounded-lg`
- Badges: `rounded-full`

---

## Responsive Design

### Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Mobile Adaptations

**Example Requests Panel:**
- Grid: 2 columns → 1 column
- Card padding: Reduced
- Font sizes: Slightly smaller

**Confirmation Dialog:**
- Max width: `mx-4` (16px margins)
- Max height: `max-h-[90vh]`
- Scrollable content
- Stacked technical details (3 columns → 1 column)

**Simple Mode Toggle:**
- Remains visible
- May wrap to new line on very small screens

---

## Accessibility

### Keyboard Navigation

**Dialog:**
- ESC: Close dialog (cancel)
- Tab: Navigate between elements
- Enter: Confirm (when focused on confirm button)
- Shift+Tab: Navigate backwards

**Example Cards:**
- Tab: Focus on card
- Enter/Space: Select example

**Toggle:**
- Tab: Focus on toggle
- Space/Enter: Toggle state

### Screen Readers

**ARIA Labels:**
- Dialog: `role="dialog"` `aria-labelledby="dialog-title"`
- Toggle: `aria-label="Simple mode toggle"`
- Example cards: `aria-label="Example request: {simple}"`

**Focus Management:**
- Dialog traps focus when open
- Focus returns to trigger when closed
- First focusable element focused on open

### Color Contrast

- All text meets WCAG AA (4.5:1)
- Interactive elements have sufficient contrast
- Disabled states clearly indicated

---

## Performance

### Optimization

**Example Requests:**
- Fetched once on mount
- Cached by tRPC
- No re-fetch on re-render

**Dialog:**
- Lazy loaded (only rendered when open)
- No expensive computations
- Memoized where appropriate

**Animations:**
- CSS transitions (hardware accelerated)
- No JavaScript animations
- 60fps target

### Loading States

**Example Requests:**
- Skeleton loader while fetching
- Graceful fallback if failed

**Interpretation:**
- "Processing..." message
- Disabled send button
- Loading spinner

**Patch Generation:**
- "Generating..." in dialog
- Disabled confirm button
- Loading spinner

---

## Error Handling

### API Errors

**Network Error:**
```typescript
try {
  const result = await generatePlainLanguagePatch.mutateAsync({...});
} catch (error) {
  // Show error message
  setMessages((prev) => [...prev, {
    role: 'assistant',
    content: `**Error generating patch:** ${error}`,
    timestamp: new Date(),
  }]);
}
```

**Validation Error:**
- Shown in clarification message
- User can retry with more details

**Timeout Error:**
- Shown in assistant message
- User can retry

### UI Errors

**Dialog Rendering:**
- Fallback if interpreted data missing
- Graceful degradation

**Example Requests:**
- Empty state if no examples
- Error message if fetch fails

---

## Testing

See `tests/frontend-plain-language-integration-test.md` for complete test plan.

**Key Test Areas:**
1. Example requests display
2. Simple mode toggle
3. Example selection
4. Confirmation dialog
5. Patch generation
6. Clarification prompts
7. Error handling
8. Responsive design
9. Accessibility
10. Performance

---

## Deployment

### Build

```bash
cd /home/ubuntu/apex-agents
pnpm build
```

### Environment Variables

No new environment variables required. Uses existing tRPC setup.

### Database

No database migrations required. Uses existing tables.

---

## Maintenance

### Updating Examples

Examples are fetched from the backend. To update:

1. Edit `src/lib/ai-admin/plain-language-patch.ts`
2. Update `EXAMPLE_REQUESTS` array
3. Deploy backend changes
4. Frontend automatically uses new examples

### Styling Changes

All styles are in component files. No global CSS changes needed.

### Adding New Features

**New Scope Type:**
1. Add to `scopeColors` in `PatchConfirmationDialog.tsx`
2. Add to `scopeIcons` mapping
3. Update backend scope enum

**New Technical Detail:**
1. Add to `technicalDetails` section in dialog
2. Update grid layout if needed

---

## Troubleshooting

### Dialog Not Appearing

**Check:**
- `showConfirmation` state is true
- `interpretedRequest` is not null
- No console errors
- z-index is correct (50)

**Fix:**
- Verify API response structure
- Check state updates
- Inspect dialog component props

### Examples Not Loading

**Check:**
- `getExampleRequests` query status
- Network tab for API call
- Console for errors

**Fix:**
- Verify backend endpoint
- Check tRPC router
- Ensure examples array exists

### Toggle Not Working

**Check:**
- `useSimpleMode` state updates
- onClick handler attached
- No conflicting styles

**Fix:**
- Verify state setter
- Check event propagation
- Inspect toggle component

### Patch Generation Fails

**Check:**
- `generatePlainLanguagePatch` mutation status
- Request payload
- Backend logs

**Fix:**
- Verify request format
- Check backend implementation
- Review error messages

---

## Future Enhancements

### Short Term

1. **Keyboard Shortcuts:**
   - Cmd/Ctrl+Enter: Send message
   - Cmd/Ctrl+K: Toggle simple mode
   - Cmd/Ctrl+E: Focus on examples

2. **Better Loading States:**
   - Progress bar for patch generation
   - Estimated time remaining
   - Cancellation option

3. **Success Animations:**
   - Confetti on patch success
   - Smooth transitions
   - Toast notifications

### Medium Term

1. **Patch Preview:**
   - Show diff before applying
   - Syntax highlighting
   - Inline editing

2. **History:**
   - View past interpretations
   - Reuse previous requests
   - Learn from patterns

3. **Analytics:**
   - Track success rates
   - Monitor confidence scores
   - Identify common requests

### Long Term

1. **AI Learning:**
   - Learn from user feedback
   - Improve interpretations
   - Personalize suggestions

2. **Batch Operations:**
   - Multiple requests at once
   - Combined patches
   - Dependency resolution

3. **Collaboration:**
   - Share interpretations
   - Team approval workflow
   - Patch review system

---

## Support

For issues or questions:

1. Check this documentation
2. Review test plan
3. Check console logs
4. Contact development team

---

## Changelog

### Version 1.0.0 (2024-01-XX)

**Initial Release:**
- PatchConfirmationDialog component
- ExampleRequestsPanel component
- Simple mode toggle
- Complete integration with backend
- Comprehensive documentation
- Full test coverage

---

## License

Internal use only. Part of the Apex Agents platform.
