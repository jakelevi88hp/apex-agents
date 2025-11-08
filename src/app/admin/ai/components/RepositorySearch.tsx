'use client';

import { useState } from 'react';
import { Search, File, Folder, ChevronRight, Loader2, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface SearchResult {
  path: string;
  content: string;
  lineNumber: number;
  repository: string;
}

interface RepositorySearchProps {
  onFileSelect: (path: string, content?: string) => void;
}

export default function RepositorySearch({ onFileSelect }: RepositorySearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchMutation = trpc.aiAdmin.searchRepository.useMutation();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchMutation.mutateAsync({ query });
      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-500/30 text-yellow-200">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search repository..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {isSearching && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 && !isSearching && query && (
          <div className="p-8 text-center text-gray-500">
            No results found for "{query}"
          </div>
        )}

        {results.length === 0 && !query && (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Search across all repository files</p>
            <p className="text-sm mt-2">Try searching for function names, variables, or text</p>
          </div>
        )}

        {results.map((result, index) => (
          <button
            key={index}
            onClick={() => onFileSelect(result.path, result.content)}
            className="w-full text-left p-4 hover:bg-gray-800 border-b border-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <File className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300 font-mono">{result.path}</span>
              <span className="text-xs text-gray-500">Line {result.lineNumber}</span>
            </div>
            <div className="text-sm text-gray-400 font-mono bg-gray-950 p-2 rounded overflow-x-auto">
              {highlightMatch(result.content, query)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
