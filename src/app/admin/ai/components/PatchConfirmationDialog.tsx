'use client';

import React from 'react';
import { 
  CheckCircle, AlertTriangle, FileCode, Zap, Package, 
  Lightbulb, X, Loader2 
} from 'lucide-react';

interface InterpretedRequest {
  original: string;
  intent: string;
  scope: 'feature' | 'bug_fix' | 'enhancement' | 'refactor' | 'ui_change' | 'config' | 'unclear';
  confidence: number;
  expandedDescription: string;
  suggestedFiles: string[];
  suggestedActions: string[];
  clarificationNeeded: string[];
  examples: string[];
  technicalDetails: {
    frameworks: string[];
    patterns: string[];
    dependencies: string[];
  };
}

interface PatchConfirmationDialogProps {
  isOpen: boolean;
  interpreted: InterpretedRequest | null;
  onConfirm: () => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

export default function PatchConfirmationDialog({
  isOpen,
  interpreted,
  onConfirm,
  onCancel,
  isGenerating = false,
}: PatchConfirmationDialogProps) {
  if (!isOpen || !interpreted) return null;

  const scopeColors = {
    feature: 'bg-blue-100 text-blue-800 border-blue-300',
    bug_fix: 'bg-red-100 text-red-800 border-red-300',
    enhancement: 'bg-green-100 text-green-800 border-green-300',
    refactor: 'bg-purple-100 text-purple-800 border-purple-300',
    ui_change: 'bg-pink-100 text-pink-800 border-pink-300',
    config: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    unclear: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const scopeIcons = {
    feature: Zap,
    bug_fix: AlertTriangle,
    enhancement: CheckCircle,
    refactor: FileCode,
    ui_change: Lightbulb,
    config: Package,
    unclear: AlertTriangle,
  };

  const ScopeIcon = scopeIcons[interpreted.scope];
  const confidenceColor = interpreted.confidence >= 0.8 ? 'text-green-600' : interpreted.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Confirm Patch Generation</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white transition-colors"
            disabled={isGenerating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Intent */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What you want:</h3>
            <p className="text-gray-700 text-base leading-relaxed bg-blue-50 border border-blue-200 rounded-lg p-4">
              {interpreted.intent}
            </p>
          </div>

          {/* Scope and Confidence */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Scope:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${scopeColors[interpreted.scope]}`}>
                <ScopeIcon className="w-4 h-4" />
                {interpreted.scope.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Confidence:</span>
              <span className={`font-semibold ${confidenceColor}`}>
                {(interpreted.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Expanded Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What I'll do:</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {interpreted.expandedDescription}
              </p>
            </div>
          </div>

          {/* Suggested Files */}
          {interpreted.suggestedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Files that will be modified ({interpreted.suggestedFiles.length}):
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                <ul className="space-y-1">
                  {interpreted.suggestedFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <FileCode className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <code className="font-mono text-xs">{file}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Suggested Actions */}
          {interpreted.suggestedActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions:</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <ol className="space-y-2">
                  {interpreted.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="flex-1">{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Technical Details */}
          {(interpreted.technicalDetails.frameworks.length > 0 ||
            interpreted.technicalDetails.patterns.length > 0 ||
            interpreted.technicalDetails.dependencies.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interpreted.technicalDetails.frameworks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Frameworks:</h4>
                  <div className="flex flex-wrap gap-2">
                    {interpreted.technicalDetails.frameworks.map((framework, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                      >
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {interpreted.technicalDetails.patterns.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Patterns:</h4>
                  <div className="flex flex-wrap gap-2">
                    {interpreted.technicalDetails.patterns.map((pattern, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {interpreted.technicalDetails.dependencies.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">New Dependencies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {interpreted.technicalDetails.dependencies.map((dep, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Examples */}
          {interpreted.examples.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Similar implementations:</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <ul className="space-y-1">
                  {interpreted.examples.map((example, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Would you like me to proceed with generating this patch?
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              disabled={isGenerating}
            >
              No, let me clarify
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Yes, proceed
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
