'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  X,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  DollarSign,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface ExecutionResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  execution: {
    id: string;
    status: 'running' | 'completed' | 'failed';
    output?: string;
    error?: string;
    tokensUsed?: number;
    durationMs?: number;
    cost?: number;
    steps?: Array<{
      id: string;
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      output?: string;
      duration?: number;
    }>;
  };
  streaming?: boolean;
}

export default function ExecutionResultsModal({
  isOpen,
  onClose,
  execution,
  streaming = false,
}: ExecutionResultsModalProps) {
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (streaming && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [execution.output, streaming]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = execution.output || execution.error || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = execution.output || execution.error || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${execution.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const estimateCost = (tokens: number) => {
    // Rough estimate: $0.03 per 1K tokens for GPT-4
    return ((tokens / 1000) * 0.03).toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border shadow-2xl animate-in zoom-in-95 duration-200 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-4">
            {execution.status === 'running' ? (
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            ) : execution.status === 'completed' ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Execution Results
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ID: {execution.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics */}
        <div
          className={`grid grid-cols-4 gap-4 p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Duration
              </span>
            </div>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {execution.durationMs ? formatDuration(execution.durationMs) : streaming ? '...' : 'N/A'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tokens
              </span>
            </div>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {execution.tokensUsed?.toLocaleString() || (streaming ? '...' : '0')}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Est. Cost
              </span>
            </div>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${execution.tokensUsed ? estimateCost(execution.tokensUsed) : '0.00'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              {execution.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : execution.status === 'failed' ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              )}
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Status
              </span>
            </div>
            <p
              className={`text-lg font-semibold ${
                execution.status === 'completed'
                  ? 'text-green-400'
                  : execution.status === 'failed'
                  ? 'text-red-400'
                  : 'text-blue-400'
              }`}
            >
              {execution.status}
            </p>
          </div>
        </div>

        {/* Steps Timeline (if available) */}
        {execution.steps && execution.steps.length > 0 && (
          <div
            className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Execution Steps
            </h3>
            <div className="space-y-2">
              {execution.steps.map((step, index) => (
                <div key={step.id}>
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {expandedSteps.has(step.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {index + 1}.
                      </span>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : step.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : step.status === 'running' ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {step.name}
                      </span>
                    </div>
                    {step.duration && (
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDuration(step.duration)}
                      </span>
                    )}
                  </button>
                  {expandedSteps.has(step.id) && step.output && (
                    <div
                      className={`ml-12 mt-2 p-3 rounded-lg text-sm font-mono ${
                        isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {step.output}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {execution.error ? 'Error Output' : 'Output'}
              {streaming && <span className="ml-2 text-blue-400 animate-pulse">●</span>}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 inline mr-1" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <Download className="w-4 h-4 inline mr-1" />
                Download
              </button>
            </div>
          </div>

          <div
            ref={outputRef}
            className={`rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap ${
              execution.error
                ? isDarkMode
                  ? 'bg-red-900/20 text-red-300 border border-red-500/30'
                  : 'bg-red-50 text-red-700 border border-red-200'
                : isDarkMode
                ? 'bg-gray-900 text-gray-300'
                : 'bg-gray-50 text-gray-700'
            }`}
          >
            {execution.error || execution.output || (streaming ? 'Generating...' : 'No output')}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex justify-end gap-2 p-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
