'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Search, Loader2, FileText, ExternalLink, Sparkles } from 'lucide-react';

interface SearchResult {
  id: string;
  documentId: string;
  title: string;
  content: string;
  source: string;
  type: string;
  similarity: number;
  metadata: Record<string, unknown> | null;
}

export default function SemanticSearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = trpc.search.semanticSearch.useMutation();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await searchMutation.mutateAsync({
        query: query.trim(),
        limit: 10,
        threshold: 0.7,
      });

      if (response.success && response.data) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'text-green-400';
    if (similarity >= 0.8) return 'text-blue-400';
    if (similarity >= 0.7) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.9) return 'Excellent Match';
    if (similarity >= 0.8) return 'Good Match';
    if (similarity >= 0.7) return 'Relevant';
    return 'Related';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-8 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Semantic Search</h2>
            <p className="text-gray-300">Search your knowledge base using natural language</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question or search for content..."
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              disabled={isSearching}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-semibold"
          >
            {isSearching ? (
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

        {/* Search Tips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-400">Try:</span>
          {['market trends 2025', 'customer feedback analysis', 'product roadmap', 'financial projections'].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Searching through your knowledge base...</p>
          </div>
        </div>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
            <p className="text-gray-400 mb-4">
              We couldn&rsquo;t find any documents matching your query.
            </p>
          <p className="text-sm text-gray-500">
            Try different keywords or check if your data sources are connected.
          </p>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Found {results.length} {results.length === 1 ? 'result' : 'results'}
            </h3>
            <div className="text-sm text-gray-400">
              Sorted by relevance
            </div>
          </div>

            {results.map((result) => (
            <div
              key={result.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
                      {result.title || 'Untitled Document'}
                    </h4>
                    <span className={`text-sm font-medium ${getSimilarityColor(result.similarity)}`}>
                      {(result.similarity * 100).toFixed(0)}% • {getSimilarityLabel(result.similarity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{result.source}</span>
                    <span>•</span>
                    <span>{result.type}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-700 rounded transition">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-300 leading-relaxed mb-4">
                {result.content.length > 300
                  ? `${result.content.substring(0, 300)}...`
                  : result.content}
              </p>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition text-sm font-medium">
                  View Full Document
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition text-sm">
                  Add to Context
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasSearched && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Semantic Search Powered by AI</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Search your knowledge base using natural language. Our AI understands the meaning behind your queries
              and finds the most relevant documents, even if they don&rsquo;t contain the exact keywords.
            </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="text-purple-400 font-semibold mb-2">🎯 Contextual Understanding</div>
              <div className="text-sm text-gray-300">
                Finds documents based on meaning, not just keywords
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="text-blue-400 font-semibold mb-2">⚡ Lightning Fast</div>
              <div className="text-sm text-gray-300">
                Search millions of documents in milliseconds
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="text-green-400 font-semibold mb-2">🔒 Secure & Private</div>
              <div className="text-sm text-gray-300">
                Only searches your authorized documents
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

