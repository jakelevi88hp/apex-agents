# Vision API Integration Documentation

## Overview

The Vision API integration enables AI Admin to analyze uploaded images using OpenAI's GPT-4 Vision model. This allows the AI to understand UI screenshots, code snippets, design mockups, error messages, and other visual content to provide better code generation and assistance.

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
├─────────────────────────────────────────────────────────────┤
│  FileUpload Component                                        │
│  ├─ Drag & Drop Interface                                    │
│  ├─ File Validation                                          │
│  ├─ Upload Progress                                          │
│  └─ Analysis Status Display                                  │
│                                                              │
│  ImageAnalysisDisplay Component                              │
│  ├─ Image Preview                                            │
│  ├─ Analysis Description                                     │
│  ├─ Detected UI Components                                   │
│  ├─ Code Snippets                                            │
│  └─ Error Messages                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ tRPC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
├─────────────────────────────────────────────────────────────┤
│  tRPC Endpoints (ai-admin.ts)                                │
│  ├─ uploadFile: Upload to S3 + Save metadata                │
│  ├─ analyzeImage: Analyze single image                       │
│  └─ analyzeImages: Batch analyze multiple images             │
│                                                              │
│  VisionAnalyzer Class                                        │
│  ├─ analyzeImage(): OpenAI Vision API call                   │
│  ├─ analyzeImages(): Batch processing                        │
│  ├─ parseAnalysis(): Extract structured data                 │
│  └─ summarizeAnalyses(): Aggregate results                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
├─────────────────────────────────────────────────────────────┤
│  OpenAI Vision API (GPT-4o)                                  │
│  ├─ Image understanding                                      │
│  ├─ UI component detection                                   │
│  ├─ Code extraction                                          │
│  └─ Error message detection                                  │
│                                                              │
│  S3 Storage                                                  │
│  ├─ File storage                                             │
│  └─ Public URL generation                                    │
│                                                              │
│  PostgreSQL Database (Neon)                                  │
│  └─ aiUploadedFiles table                                    │
│     ├─ File metadata                                         │
│     └─ Analysis results (JSONB)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. File Upload Flow

```
User selects file
      │
      ▼
FileUpload component validates file
      │
      ├─ Check file type (images, PDFs, code files)
      ├─ Check file size (max 10MB)
      └─ Convert to base64
      │
      ▼
tRPC uploadFile mutation
      │
      ├─ Upload to S3
      ├─ Get public URL
      └─ Save metadata to database
      │
      ▼
Return file ID and URL
```

### 2. Image Analysis Flow

```
File uploaded successfully
      │
      ▼
Check if file is an image
      │
      ▼ (yes)
tRPC analyzeImage mutation
      │
      ▼
VisionAnalyzer.analyzeImage()
      │
      ├─ Call OpenAI Vision API
      ├─ Send image URL + context
      └─ Receive analysis text
      │
      ▼
Parse analysis text
      │
      ├─ Extract UI components
      ├─ Extract code snippets
      ├─ Extract error messages
      └─ Generate suggested context
      │
      ▼
Save analysis to database
      │
      └─ Update aiUploadedFiles.analysisResult
      │
      ▼
Return analysis to frontend
      │
      └─ Display "✓ Analyzed" status
```

---

## Database Schema

### aiUploadedFiles Table

```typescript
export const aiUploadedFiles = pgTable('ai_uploaded_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull().references(() => aiMessages.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  s3Key: varchar('s3_key', { length: 1000 }).notNull(),
  s3Url: text('s3_url').notNull(),
  analysisResult: jsonb('analysis_result'), // VisionAnalysisResult
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Analysis Result Structure

```typescript
interface VisionAnalysisResult {
  description: string;              // Full text description of the image
  detectedElements: string[];       // List of all detected elements
  suggestedContext: string;         // Suggested context for AI
  codeSnippets?: string[];          // Extracted code snippets
  uiComponents?: string[];          // Detected UI components
  errorMessages?: string[];         // Detected error messages
}
```

**Example:**
```json
{
  "description": "A dashboard interface with a navigation sidebar on the left, showing menu items for Dashboard, Analytics, and Settings. The main content area displays three cards with metrics: Total Users (1,234), Revenue ($45,678), and Active Sessions (89). Below the cards is a line chart showing user growth over time.",
  "detectedElements": ["card", "chart", "navigation", "sidebar", "button"],
  "suggestedContext": "UI components detected: card, chart, navigation, sidebar, button",
  "uiComponents": ["card", "chart", "navigation", "sidebar", "button"],
  "codeSnippets": [],
  "errorMessages": []
}
```

---

## API Endpoints

### 1. uploadFile

**Purpose:** Upload a file to S3 and save metadata to database

**Input:**
```typescript
{
  fileName: string;
  fileData: string;        // base64 encoded
  contentType: string;
  messageId?: string;      // Optional: link to message
}
```

**Output:**
```typescript
{
  success: boolean;
  data: {
    id?: string;           // Database record ID
    key: string;           // S3 key
    url: string;           // Public S3 URL
  }
}
```

**Usage:**
```typescript
const result = await trpc.aiAdmin.uploadFile.mutate({
  fileName: 'screenshot.png',
  fileData: base64Data,
  contentType: 'image/png',
});
```

---

### 2. analyzeImage

**Purpose:** Analyze a single image using Vision API

**Input:**
```typescript
{
  imageUrl: string;
  context?: string;        // Optional: additional context
  fileId?: string;         // Optional: update database record
}
```

**Output:**
```typescript
{
  success: boolean;
  data: VisionAnalysisResult;
}
```

**Usage:**
```typescript
const analysis = await trpc.aiAdmin.analyzeImage.mutate({
  imageUrl: 'https://s3.amazonaws.com/...',
  context: 'Dashboard UI design',
  fileId: 'file_id_123',
});
```

---

### 3. analyzeImages

**Purpose:** Batch analyze multiple images

**Input:**
```typescript
{
  images: Array<{
    url: string;
    fileId?: string;
  }>;
  context?: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  data: {
    analyses: VisionAnalysisResult[];
    summary: string;
  }
}
```

**Usage:**
```typescript
const result = await trpc.aiAdmin.analyzeImages.mutate({
  images: [
    { url: 'https://...', fileId: 'file1' },
    { url: 'https://...', fileId: 'file2' },
  ],
  context: 'Multi-page form design',
});
```

---

## VisionAnalyzer Class

### Methods

#### analyzeImage(imageUrl: string, context?: string): Promise<VisionAnalysisResult>

Analyzes a single image using OpenAI's Vision API.

**Parameters:**
- `imageUrl`: Public URL of the image to analyze
- `context`: Optional context to guide the analysis

**Returns:** VisionAnalysisResult with structured analysis data

**Example:**
```typescript
const analyzer = new VisionAnalyzer();
const result = await analyzer.analyzeImage(
  'https://example.com/screenshot.png',
  'Dashboard UI with charts'
);
```

---

#### analyzeImages(imageUrls: string[], context?: string): Promise<VisionAnalysisResult[]>

Analyzes multiple images in sequence.

**Parameters:**
- `imageUrls`: Array of public image URLs
- `context`: Optional shared context for all images

**Returns:** Array of VisionAnalysisResult

---

#### parseAnalysis(text: string): VisionAnalysisResult

Parses raw analysis text into structured data.

**Extraction Patterns:**
- **UI Components:** Searches for keywords like "button", "form", "card", "navigation", etc.
- **Code Snippets:** Extracts code blocks marked with backticks
- **Error Messages:** Finds patterns like "error:", "exception:", "failed:"

---

#### summarizeAnalyses(analyses: VisionAnalysisResult[]): string

Creates a summary of multiple image analyses.

**Returns:** Text summary of all detected elements across all images

---

## Frontend Components

### FileUpload Component

**Purpose:** Handle file uploads with drag-and-drop support

**Props:**
```typescript
interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;           // Default: 5
  maxSizeMB?: number;          // Default: 10
  showAnalysis?: boolean;      // Default: true
}
```

**Features:**
- Drag-and-drop interface
- File type validation
- File size validation
- Upload progress indicator
- Automatic image analysis
- Analysis status display ("Uploading...", "Analyzing...", "✓ Analyzed")

**Usage:**
```tsx
<FileUpload
  onFilesUploaded={(files) => {
    console.log('Files uploaded:', files);
    // Use files in chat context
  }}
  maxFiles={5}
  maxSizeMB={10}
  showAnalysis={true}
/>
```

---

### ImageAnalysisDisplay Component

**Purpose:** Display Vision API analysis results

**Props:**
```typescript
interface ImageAnalysisDisplayProps {
  analysis: VisionAnalysisResult;
  imageUrl: string;
}
```

**Features:**
- Image preview
- Full analysis description
- Detected UI components (as tags)
- Code snippets (syntax highlighted)
- Error messages (highlighted in red)
- All detected elements summary

**Usage:**
```tsx
<ImageAnalysisDisplay
  analysis={analysisResult}
  imageUrl="https://s3.amazonaws.com/..."
/>
```

---

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...                    # OpenAI API key for Vision API

# S3 Storage (already configured)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...

# Database (already configured)
DATABASE_URL=postgresql://...
```

### OpenAI Model

The integration uses **GPT-4o** (gpt-4o) for vision analysis:
- Supports image understanding
- High-resolution image analysis
- Fast response times
- Cost-effective for production use

---

## Best Practices

### 1. Image Quality

**Recommendations:**
- Use high-resolution images (at least 1024x768)
- Ensure text is readable
- Avoid heavily compressed images
- Use PNG for screenshots (better quality than JPEG)

### 2. Context Provision

**Good Context:**
- "Dashboard UI with user metrics and charts"
- "Login form with email and password fields"
- "Error page showing 404 not found"

**Bad Context:**
- "Image" (too vague)
- "UI" (too generic)
- "" (empty)

### 3. Batch Processing

- Use `analyzeImages` for multiple related images
- Provide shared context for better results
- Process up to 5 images at a time to avoid rate limits

### 4. Error Handling

Always wrap Vision API calls in try-catch:
```typescript
try {
  const analysis = await analyzer.analyzeImage(url);
  // Use analysis
} catch (error) {
  console.error('Analysis failed:', error);
  // Graceful fallback
}
```

---

## Performance Considerations

### Timing Benchmarks

| Operation | Average Time | Max Acceptable |
|-----------|--------------|----------------|
| File Upload (1MB) | 1-2s | 5s |
| Vision API Call | 3-5s | 10s |
| Database Write | 100-300ms | 1s |
| Total (upload + analysis) | 5-8s | 15s |

### Optimization Tips

1. **Parallel Processing:** Upload and analyze multiple files concurrently
2. **Caching:** Cache analysis results in database
3. **Lazy Loading:** Only analyze when needed (not automatic for all files)
4. **Image Resizing:** Resize large images before upload to reduce costs

---

## Cost Estimation

### OpenAI Vision API Pricing (as of 2024)

- **GPT-4o:** $0.00150 per image (low detail)
- **GPT-4o:** $0.00765 per image (high detail)

**Current Configuration:** High detail for better accuracy

**Monthly Cost Estimate:**
- 100 images/day × 30 days = 3,000 images/month
- 3,000 × $0.00765 = **$22.95/month**

---

## Troubleshooting

### Common Issues

#### 1. "Image analysis failed"

**Possible Causes:**
- Invalid OpenAI API key
- Network timeout
- Unsupported image format
- Image URL not accessible

**Solution:**
- Check API key in environment variables
- Verify S3 URL is publicly accessible
- Check OpenAI API status
- Review console logs for detailed error

---

#### 2. "Upload failed"

**Possible Causes:**
- File too large (> 10MB)
- Unsupported file type
- S3 credentials invalid
- Network error

**Solution:**
- Check file size and type
- Verify S3 configuration
- Check network connectivity
- Review server logs

---

#### 3. Analysis is inaccurate

**Possible Causes:**
- Low-quality image
- Unclear context
- Complex/ambiguous UI
- Model limitations

**Solution:**
- Use higher resolution images
- Provide specific context
- Break complex UIs into smaller parts
- Manually review and adjust

---

## Future Enhancements

### Planned Features

1. **PDF Text Extraction:** Extract text from PDF files
2. **Diagram Understanding:** Better analysis of flowcharts and diagrams
3. **Multi-page Analysis:** Analyze multi-page documents as a sequence
4. **Custom Prompts:** Allow users to customize analysis prompts
5. **Analysis History:** View past analyses for comparison
6. **Export Analysis:** Export analysis results as JSON or Markdown

### Potential Improvements

1. **Caching:** Cache analysis results to avoid re-analyzing same images
2. **Streaming:** Stream analysis results as they're generated
3. **Thumbnails:** Generate thumbnails for faster preview
4. **OCR Integration:** Add dedicated OCR for text extraction
5. **Model Selection:** Allow choosing between different Vision models

---

## Related Documentation

- [AI Admin Enhancement Architecture](./ai-admin-enhancement-architecture.md)
- [Vision API Integration Test Plan](../tests/vision-api-integration-test.md)
- [OpenAI Vision API Documentation](https://platform.openai.com/docs/guides/vision)
- [File Upload Best Practices](./file-upload-best-practices.md)

---

## Support

For issues or questions:
1. Check console logs for detailed errors
2. Review test plan for common scenarios
3. Check OpenAI API status page
4. Contact development team

---

## Changelog

### v1.0.0 (Current)
- Initial Vision API integration
- Basic image analysis
- UI component detection
- Code snippet extraction
- Error message detection
- Database persistence
- Automatic analysis on upload

### Planned for v1.1.0
- PDF text extraction
- Batch analysis improvements
- Custom analysis prompts
- Analysis history viewer
