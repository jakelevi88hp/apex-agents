'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

interface ExecutionPlaygroundProps {
  agentId: string;
  agentName: string;
}

export function ExecutionPlayground({ agentId, agentName }: ExecutionPlaygroundProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);

  const executeMutation = trpc.execution.execute.useMutation({
    onSuccess: (data) => {
      setOutput(data.output);
      setExecutionTime(data.duration);
      setTokensUsed(data.tokensUsed);
      setIsExecuting(false);
    },
    onError: (error) => {
      setOutput(`Error: ${error.message}`);
      setIsExecuting(false);
    },
  });

  const { data: history, refetch: refetchHistory } = trpc.execution.getHistory.useQuery({
    agentId,
    limit: 5,
  });

  const handleExecute = async () => {
    if (!input.trim()) return;

    setIsExecuting(true);
    setOutput('');
    setExecutionTime(null);
    setTokensUsed(null);

    executeMutation.mutate({
      agentId,
      input: input.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleExecute();
    }
  };

  return (
    <div className="space-y-6">
      {/* Playground Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Test {agentName}</h2>
        <p className="text-gray-600">
          Enter your input below and click Execute to test the agent with real AI.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
          Input
        </label>
        <textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter your prompt or question here..."
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isExecuting}
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Cmd</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to execute
          </p>
          <button
            onClick={handleExecute}
            disabled={isExecuting || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isExecuting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Executing...
              </span>
            ) : (
              'Execute'
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {(output || isExecuting) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Output
            </label>
            {executionTime !== null && tokensUsed !== null && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>⏱️ {executionTime}ms</span>
                <span>🎯 {tokensUsed} tokens</span>
              </div>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            {isExecuting ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-gray-600">Thinking...</p>
                </div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm">
                {output}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Execution History */}
      {history && history.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
          <div className="space-y-3">
            {history.map((execution) => {
              const inputData = execution.inputData as any;
              const outputData = execution.outputData as any;
              
              return (
                <div
                  key={execution.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => {
                    setInput(inputData?.input || '');
                    setOutput(outputData?.output || '');
                    setExecutionTime(execution.durationMs || null);
                    setTokensUsed(execution.tokensUsed || null);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                      execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {execution.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(execution.startedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">
                    {inputData?.input || 'No input'}
                  </p>
                  {execution.durationMs && execution.tokensUsed && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>⏱️ {execution.durationMs}ms</span>
                      <span>🎯 {execution.tokensUsed} tokens</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

