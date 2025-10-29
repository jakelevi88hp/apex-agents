'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FileText, Download, Eye, Trash2, Search, Loader2 } from 'lucide-react';
import DocumentUpload from '@/components/DocumentUpload';

// Lazy load PDFViewer to avoid server-side rendering issues
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>,
});

interface Document {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  source: string;
  status: string;
  summary?: string;
  tags?: string[];
  folder?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface SearchResult {
  documentId: string;
  documentName: string;
  source: string;
  maxScore: number;
  chunks: Array<{
    text: string;
    score: number;
    chunkIndex: number;
  }>;
}

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<'documents' | 'upload' | 'search'>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          topK: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-900 text-green-300',
      processing: 'bg-yellow-900 text-yellow-300',
      pending: 'bg-gray-700 text-gray-300',
      failed: 'bg-red-900 text-red-300',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Knowledge Base</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'documents'
              ? 'border-b-2 border-purple-600 text-purple-400'
              : 'text-gray-300 hover:text-gray-100'
          }`}
        >
          Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'upload'
              ? 'border-b-2 border-purple-600 text-purple-400'
              : 'text-gray-300 hover:text-gray-100'
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'search'
              ? 'border-b-2 border-purple-600 text-purple-400'
              : 'text-gray-300 hover:text-gray-100'
          }`}
        >
          Semantic Search
        </button>
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No documents yet</h3>
              <p className="text-gray-400 mb-6">Upload your first document to get started</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Upload Document
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">{doc.name}</div>
                            {doc.summary && (
                              <div className="text-gray-400 text-sm truncate max-w-md">
                                {doc.summary}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{formatFileSize(doc.size)}</td>
                      <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                      <td className="px-6 py-4 text-gray-300">{formatDate(doc.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {doc.mimeType === 'application/pdf' && doc.status === 'completed' && (
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="p-2 text-purple-400 hover:text-purple-300 hover:bg-gray-600 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl">
          <DocumentUpload
            onUploadComplete={() => {
              loadDocuments();
              setActiveTab('documents');
            }}
          />
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search your documents using natural language..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Found {searchResults.length} relevant document{searchResults.length > 1 ? 's' : ''}
              </h3>
              {searchResults.map((result, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {result.documentName}
                      </h4>
                      <p className="text-sm text-gray-400">
                        Relevance: {(result.maxScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {result.chunks.slice(0, 2).map((chunk, chunkIndex) => (
                      <div key={chunkIndex} className="bg-gray-700/50 p-4 rounded">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {chunk.text.length > 300
                            ? chunk.text.substring(0, 300) + '...'
                            : chunk.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Match: {(chunk.score * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !searching && (
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-gray-400">Try different keywords or upload more documents</p>
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{selectedDocument.name}</h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedDocument.mimeType === 'application/pdf' ? (
                <PDFViewer
                  fileUrl={`/api/documents/${selectedDocument.id}/download`}
                  fileName={selectedDocument.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

