'use client';

import { useState } from 'react';
import { X, Check, AlertTriangle, FileCode, Download } from 'lucide-react';
import DiffViewer from './DiffViewer';

interface PatchPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patch: any;
  onApply: () => void;
  onApplySelective?: (hunkIds: string[]) => void;
}

export default function PatchPreviewModal({
  isOpen,
  onClose,
  patch,
  onApply,
  onApplySelective,
}: PatchPreviewModalProps) {
  const [selectedHunks, setSelectedHunks] = useState<Set<string>>(new Set());
  const [showSelectiveMode, setShowSelectiveMode] = useState(false);

  if (!isOpen) return null;

  const handleApplyHunk = (hunkId: string) => {
    setSelectedHunks(prev => new Set([...prev, hunkId]));
  };

  const handleRejectHunk = (hunkId: string) => {
    setSelectedHunks(prev => {
      const newSet = new Set(prev);
      newSet.delete(hunkId);
      return newSet;
    });
  };

  const handleApplySelected = () => {
    if (onApplySelective) {
      onApplySelective(Array.from(selectedHunks));
    }
    onClose();
  };

  const handleApplyAll = () => {
    onApply();
    onClose();
  };

  const downloadPatch = () => {
    const patchContent = JSON.stringify(patch, null, 2);
    const blob = new Blob([patchContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patch-${patch.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileCode className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Patch Preview</h2>
              <p className="text-sm text-gray-400 mt-1">{patch.description || 'Review changes before applying'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Patch Info */}
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Files Modified:</span>
              <span className="ml-2 text-white font-semibold">{patch.files?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">Created:</span>
              <span className="ml-2 text-white">{new Date(patch.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 font-semibold ${
                patch.status === 'applied' ? 'text-green-400' :
                patch.status === 'failed' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {patch.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>

          {patch.risks && patch.risks.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-yellow-400 mb-1">Potential Risks:</div>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    {patch.risks.map((risk: string, idx: number) => (
                      <li key={idx}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {patch.files?.map((file: any, idx: number) => (
            <DiffViewer
              key={idx}
              diff={file}
              onApplyHunk={handleApplyHunk}
              onRejectHunk={handleRejectHunk}
              showHunkControls={showSelectiveMode}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPatch}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Patch
            </button>
            
            {onApplySelective && (
              <button
                onClick={() => setShowSelectiveMode(!showSelectiveMode)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  showSelectiveMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {showSelectiveMode ? 'Exit Selective Mode' : 'Selective Apply'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {showSelectiveMode && selectedHunks.size > 0 ? (
              <button
                onClick={handleApplySelected}
                className="px-6 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply Selected ({selectedHunks.size})
              </button>
            ) : (
              <button
                onClick={handleApplyAll}
                className="px-6 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply All Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
