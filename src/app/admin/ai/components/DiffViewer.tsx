'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';

interface DiffHunk {
  id: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
  header: string;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface FileDiff {
  path: string;
  oldPath?: string;
  action: 'add' | 'modify' | 'delete' | 'rename';
  hunks: DiffHunk[];
}

interface DiffViewerProps {
  diff: FileDiff;
  onApplyHunk?: (hunkId: string) => void;
  onRejectHunk?: (hunkId: string) => void;
  showHunkControls?: boolean;
}

export default function DiffViewer({
  diff,
  onApplyHunk,
  onRejectHunk,
  showHunkControls = false,
}: DiffViewerProps) {
  const [expandedHunks, setExpandedHunks] = useState<Set<string>>(
    new Set(diff.hunks.map(h => h.id))
  );
  const [appliedHunks, setAppliedHunks] = useState<Set<string>>(new Set());
  const [rejectedHunks, setRejectedHunks] = useState<Set<string>>(new Set());

  const toggleHunk = (hunkId: string) => {
    const newExpanded = new Set(expandedHunks);
    if (newExpanded.has(hunkId)) {
      newExpanded.delete(hunkId);
    } else {
      newExpanded.add(hunkId);
    }
    setExpandedHunks(newExpanded);
  };

  const handleApplyHunk = (hunkId: string) => {
    setAppliedHunks(prev => new Set([...prev, hunkId]));
    setRejectedHunks(prev => {
      const newSet = new Set(prev);
      newSet.delete(hunkId);
      return newSet;
    });
    onApplyHunk?.(hunkId);
  };

  const handleRejectHunk = (hunkId: string) => {
    setRejectedHunks(prev => new Set([...prev, hunkId]));
    setAppliedHunks(prev => {
      const newSet = new Set(prev);
      newSet.delete(hunkId);
      return newSet;
    });
    onRejectHunk?.(hunkId);
  };

  const getActionBadge = () => {
    const colors = {
      add: 'bg-green-500/20 text-green-400 border-green-500/30',
      modify: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      delete: 'bg-red-500/20 text-red-400 border-red-500/30',
      rename: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded border ${colors[diff.action]}`}>
        {diff.action.toUpperCase()}
      </span>
    );
  };

  const getLineClassName = (line: DiffLine) => {
    if (line.type === 'add') return 'bg-green-500/10 border-l-2 border-green-500';
    if (line.type === 'remove') return 'bg-red-500/10 border-l-2 border-red-500';
    return 'bg-gray-900/50';
  };

  const getLinePrefix = (line: DiffLine) => {
    if (line.type === 'add') return '+';
    if (line.type === 'remove') return '-';
    return ' ';
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      {/* File Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-white">
            {diff.oldPath && diff.oldPath !== diff.path ? (
              <>
                <span className="text-red-400">{diff.oldPath}</span>
                {' → '}
                <span className="text-green-400">{diff.path}</span>
              </>
            ) : (
              diff.path
            )}
          </span>
          {getActionBadge()}
        </div>
        <div className="text-xs text-gray-400">
          {diff.hunks.length} {diff.hunks.length === 1 ? 'change' : 'changes'}
        </div>
      </div>

      {/* Hunks */}
      <div className="divide-y divide-gray-800">
        {diff.hunks.map((hunk) => {
          const isExpanded = expandedHunks.has(hunk.id);
          const isApplied = appliedHunks.has(hunk.id);
          const isRejected = rejectedHunks.has(hunk.id);

          return (
            <div key={hunk.id} className="bg-gray-900">
              {/* Hunk Header */}
              <div className="bg-gray-850 px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <button
                  onClick={() => toggleHunk(hunk.id)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-mono">{hunk.header}</span>
                </button>

                {showHunkControls && (
                  <div className="flex items-center gap-2">
                    {isApplied && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Applied
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    {!isApplied && !isRejected && (
                      <>
                        <button
                          onClick={() => handleApplyHunk(hunk.id)}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Apply
                        </button>
                        <button
                          onClick={() => handleRejectHunk(hunk.id)}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Hunk Content */}
              {isExpanded && (
                <div className="font-mono text-sm">
                  {hunk.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex ${getLineClassName(line)}`}
                    >
                      <div className="flex-shrink-0 w-12 px-2 text-right text-gray-500 select-none">
                        {line.oldLineNumber || ''}
                      </div>
                      <div className="flex-shrink-0 w-12 px-2 text-right text-gray-500 select-none">
                        {line.newLineNumber || ''}
                      </div>
                      <div className="flex-shrink-0 w-8 px-2 text-gray-500 select-none">
                        {getLinePrefix(line)}
                      </div>
                      <div className="flex-1 px-2 py-1 overflow-x-auto">
                        <code className="text-gray-200">{line.content}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
