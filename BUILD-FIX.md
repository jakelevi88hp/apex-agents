# Build Fix for Production Deployment

## Issues Fixed

### 1. OpenAI Initialization in AI Admin Route ✅
**Problem:** OpenAI was being instantiated at module load time, causing build failures when `OPENAI_API_KEY` wasn't available during the build phase.

**Solution:** Implemented lazy initialization with `getOpenAI()` function that only creates the OpenAI instance when the route is actually called.

**File:** `/src/app/api/ai-admin/stream/route.ts`

```typescript
// Before (caused build error):
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// After (lazy initialization):
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}
```

### 2. PDF Parse Import Issue ✅
**Problem:** `pdf-parse` package doesn't have a default export, causing build warnings.

**Solution:** Implemented dynamic import with proper error handling.

**File:** `/src/lib/document-processor.ts`

```typescript
// Before:
import pdf from 'pdf-parse';

// After (dynamic import):
let pdfParse: any = null;

async function getPdfParse() {
  if (!pdfParse) {
    try {
      const pdfModule = await import('pdf-parse');
      pdfParse = pdfModule.default || pdfModule;
    } catch (error) {
      console.error('Failed to load pdf-parse:', error);
      throw new Error('PDF processing is not available');
    }
  }
  return pdfParse;
}
```

## Sentry Warnings (Non-Critical)

The build shows Sentry configuration warnings. These are **informational only** and don't affect deployment:

1. **Instrumentation file recommendation**: Sentry recommends using Next.js instrumentation files instead of separate config files. Current setup works fine, but can be refactored later.

2. **Global error handler**: Sentry suggests adding a `global-error.js` file. This is optional and can be added for better error coverage.

To suppress these warnings, add to environment variables:
```bash
SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1
```

## Testing the Fix

### Local Build Test
```bash
# Test build locally
npm run build

# Should complete without errors
```

### Vercel Deployment
```bash
# Push changes to trigger deployment
git add .
git commit -m "Fix: Lazy initialization for OpenAI and pdf-parse"
git push origin main
```

### Verify Functionality
After deployment:

1. **AI Admin**: Visit `/admin/ai` and test chat
2. **Document Upload**: Test PDF upload (if using)
3. **Check Logs**: Monitor Vercel logs for any runtime errors

## Environment Variables Required

Make sure these are set in Vercel:

```bash
# Required for AI Admin to work at runtime
OPENAI_API_KEY=sk-...

# Other required variables
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
NEXT_PUBLIC_APP_URL=https://apex-agents.vercel.app
```

## Notes

- OpenAI will only be initialized when AI Admin routes are actually called
- PDF processing will only load the library when a PDF is uploaded
- Both changes improve build reliability and startup performance
- No functionality is lost; just deferred until needed

---

**Status:** ✅ Ready to redeploy
**Next Step:** Push changes and verify build succeeds
