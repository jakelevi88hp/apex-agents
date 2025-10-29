# Knowledge Management System Documentation

## Overview

The Apex Agents Knowledge Management System is a comprehensive document storage, processing, and retrieval system with vector search capabilities powered by Pinecone and OpenAI embeddings.

---

## Features

### ✅ **Document Upload**
- Drag-and-drop file upload interface
- Supported formats: PDF, DOCX, TXT, MD
- Maximum file size: 50MB
- Real-time upload progress
- Background processing

### ✅ **Document Processing**
- Automatic text extraction from uploaded documents
- PDF parsing with metadata extraction
- DOCX text extraction
- Plain text and Markdown support
- Word count and page count tracking
- Automatic summary generation

### ✅ **Vector Storage & Search**
- Integration with Pinecone vector database
- OpenAI text-embedding-3-large model
- Automatic document chunking (1000 words with 200-word overlap)
- Semantic search across all documents
- Relevance scoring and ranking

### ✅ **Document Viewing**
- Built-in PDF viewer with:
  - Page navigation
  - Zoom controls (50% - 200%)
  - Full-screen modal view
- Document preview for supported formats

### ✅ **Document Management**
- List all uploaded documents
- Download original files
- Document status tracking (pending, processing, completed, failed)
- Metadata storage (file size, upload date, processing status)

---

## Architecture

### **Database Schema**

#### `documents` table
```typescript
{
  id: uuid (primary key)
  userId: uuid (foreign key to users)
  name: text
  originalName: text
  mimeType: text
  size: integer
  filePath: text
  storageType: text (default: 'local')
  extractedText: text
  summary: text
  pineconeId: text
  embeddingModel: text
  source: text (default: 'upload')
  tags: jsonb (array of strings)
  folder: text
  processingStatus: text (pending/processing/completed/failed)
  processingError: text
  metadata: jsonb
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp (soft delete)
}
```

#### `document_chunks` table
```typescript
{
  id: uuid (primary key)
  documentId: uuid (foreign key to documents)
  content: text
  chunkIndex: integer
  pineconeId: text
  metadata: jsonb
  createdAt: timestamp
}
```

### **API Endpoints**

#### `POST /api/documents/upload`
Upload a new document
- **Auth:** Bearer token required
- **Body:** multipart/form-data with `file` field
- **Response:** Document metadata with processing status

#### `GET /api/documents`
List all documents for the authenticated user
- **Auth:** Bearer token required
- **Query params:** `source`, `status` (optional filters)
- **Response:** Array of document metadata

#### `GET /api/documents/[id]/download`
Download a document
- **Auth:** Bearer token required
- **Response:** File stream with appropriate headers

#### `POST /api/documents/search`
Semantic search across documents
- **Auth:** Bearer token required
- **Body:** `{ query: string, topK?: number }`
- **Response:** Ranked search results with relevance scores

---

## Components

### **DocumentUpload** (`src/components/DocumentUpload.tsx`)
- Drag-and-drop upload interface
- File validation (type and size)
- Upload progress tracking
- Error handling

### **PDFViewer** (`src/components/PDFViewer.tsx`)
- PDF rendering using react-pdf
- Page navigation controls
- Zoom controls (50% - 200%)
- Fullscreen modal view

### **KnowledgePage** (`src/app/dashboard/knowledge/page.tsx`)
- Main knowledge base interface
- Three tabs: Documents, Upload, Search
- Document list with status indicators
- Semantic search interface
- Document viewer modal

---

## Services

### **DocumentProcessor** (`src/lib/document-processor.ts`)
```typescript
class DocumentProcessor {
  // Extract text from documents
  static async processDocument(filePath, mimeType): Promise<ProcessedDocument>
  
  // Split text into chunks for embedding
  static chunkText(text, chunkSize, overlap): string[]
  
  // Generate excerpt/summary
  static generateExcerpt(text, wordLimit): string
}
```

### **PineconeService** (`src/lib/pinecone-service.ts`)
```typescript
class PineconeService {
  // Generate embeddings using OpenAI
  static async generateEmbedding(text): Promise<number[]>
  
  // Store document chunks in Pinecone
  static async upsertDocumentChunks(documentId, chunks, metadata): Promise<string[]>
  
  // Search for similar documents
  static async searchSimilar(query, userId, topK): Promise<SearchResult[]>
  
  // Delete document vectors
  static async deleteDocument(documentId): Promise<void>
  
  // Get index statistics
  static async getStats(): Promise<Stats>
}
```

---

## Workflow

### **Document Upload Flow**

1. **User uploads file** via drag-and-drop or file picker
2. **Frontend validation** checks file type and size
3. **API receives file** and saves to disk (`/uploads` directory)
4. **Database record created** with status "processing"
5. **Background processing starts:**
   - Extract text from document
   - Generate chunks (1000 words, 200 overlap)
   - Create embeddings using OpenAI
   - Store vectors in Pinecone
   - Generate summary
   - Update database status to "completed"
6. **User sees document** in list with "completed" status

### **Search Flow**

1. **User enters search query** in natural language
2. **Query sent to API** with authentication
3. **API generates embedding** for query using OpenAI
4. **Pinecone searches** for similar vectors
5. **Results grouped** by document
6. **Ranked results returned** with relevance scores
7. **User sees matching documents** with highlighted excerpts

---

## Configuration

### **Environment Variables**

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-...

# Pinecone (for vector storage)
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=apex-corporate-brain

# JWT (for authentication)
JWT_SECRET=your-secret-key
```

### **File Storage**

Documents are stored locally in `/uploads` directory by default. The system supports:
- **Local storage:** Files saved to disk
- **S3 storage:** (Future) Files uploaded to AWS S3

---

## Usage

### **Uploading Documents**

1. Navigate to **Dashboard → Knowledge**
2. Click **Upload** tab
3. Drag and drop files or click to browse
4. Wait for processing to complete
5. View documents in **Documents** tab

### **Searching Documents**

1. Navigate to **Dashboard → Knowledge**
2. Click **Semantic Search** tab
3. Enter a natural language query (e.g., "What are our Q4 revenue projections?")
4. Click **Search**
5. View ranked results with relevance scores

### **Viewing Documents**

1. Navigate to **Dashboard → Knowledge → Documents**
2. Click the **eye icon** next to a PDF document
3. Use navigation controls to browse pages
4. Use zoom controls to adjust view
5. Close modal when done

### **Downloading Documents**

1. Navigate to **Dashboard → Knowledge → Documents**
2. Click the **download icon** next to any document
3. File will be downloaded to your browser's download folder

---

## Performance

### **Processing Times**

- **PDF (10 pages):** ~5-10 seconds
- **DOCX (5000 words):** ~3-5 seconds
- **TXT (1MB):** ~2-3 seconds

### **Search Performance**

- **Query embedding:** ~200-500ms
- **Pinecone search:** ~100-300ms
- **Total search time:** ~300-800ms

### **Storage**

- **Local disk:** Unlimited (depends on server)
- **Pinecone:** 1536 dimensions per vector
- **Database:** ~1KB per document metadata

---

## Troubleshooting

### **Upload fails with "Unsupported file type"**
- Only PDF, DOCX, TXT, and MD files are supported
- Check file extension matches actual file type

### **Document stuck in "processing" status**
- Check server logs for processing errors
- Verify OpenAI API key is valid
- Verify Pinecone API key and index name are correct
- Check file is not corrupted

### **Search returns no results**
- Ensure documents have been processed (status: "completed")
- Try different search queries
- Check Pinecone index has vectors

### **PDF viewer not loading**
- Ensure PDF is not corrupted
- Check browser console for errors
- Try downloading and opening locally

---

## Future Enhancements

- [ ] Document folders and organization
- [ ] Document tags and categories
- [ ] Batch upload
- [ ] Document sharing between users
- [ ] Advanced filters (date range, file type, etc.)
- [ ] Full-text search (in addition to semantic search)
- [ ] Document versioning
- [ ] OCR for scanned PDFs
- [ ] Support for more file types (PPTX, XLSX, etc.)
- [ ] S3 storage integration
- [ ] Document collaboration and annotations

---

## Dependencies

```json
{
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0",
  "@pinecone-database/pinecone": "^2.0.0",
  "react-pdf": "^7.7.0",
  "pdfjs-dist": "^3.11.174",
  "openai": "^4.0.0",
  "drizzle-orm": "^0.29.0",
  "postgres": "^3.4.0"
}
```

---

## Support

For issues or questions about the Knowledge Management System:
1. Check this documentation
2. Review server logs
3. Check database migrations are applied
4. Verify environment variables are set correctly
5. Contact system administrator

---

**Last Updated:** October 29, 2025
**Version:** 1.0.0

