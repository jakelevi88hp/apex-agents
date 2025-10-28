'use client';

import { useState } from 'react';
import { ChevronLeft, Sparkles, Send, Check } from 'lucide-react';

interface PreviewTestProps {
  config: any;
  onComplete: () => void;
  onBack: () => void;
}

export default function PreviewTest({ config, onComplete, onBack }: PreviewTestProps) {
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!testInput.trim()) return;

    setTesting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestOutput(`[Simulated Response]\n\nThis is a test response from your ${config.name}. In production, this would be the actual AI-generated response based on your configuration.\n\nModel: ${config.model}\nTemperature: ${config.temperature}\nTools: ${config.tools.join(', ')}`);
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Agent Name</div>
            <div className="text-white font-medium">{config.name}</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Type</div>
            <div className="text-white font-medium capitalize">{config.type}</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Model</div>
            <div className="text-white font-medium">{config.model}</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Temperature</div>
            <div className="text-white font-medium">{config.temperature}</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 col-span-2">
            <div className="text-sm text-gray-400 mb-1">Tools ({config.tools.length})</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.tools.slice(0, 5).map((tool: string) => (
                <span key={tool} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {tool.replace(/_/g, ' ')}
                </span>
              ))}
              {config.tools.length > 5 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                  +{config.tools.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Test Agent */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Test Your Agent</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Input
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTest()}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter a test query..."
                disabled={testing}
              />
              <button
                onClick={handleTest}
                disabled={testing || !testInput.trim()}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Test
                  </>
                )}
              </button>
            </div>
          </div>

          {testOutput && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Agent Response</div>
              <div className="text-white whitespace-pre-wrap">{testOutput}</div>
            </div>
          )}
        </div>
      </section>

      {/* System Prompt Preview */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">System Prompt</h3>
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            {config.promptTemplate || 'No system prompt configured'}
          </pre>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          <Check className="w-4 h-4" />
          Create Agent
        </button>
      </div>
    </div>
  );
}

