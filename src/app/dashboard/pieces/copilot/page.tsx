"use client";

import { useState, useEffect } from "react";
import { Sparkles, Code, MessageSquare, Bug, FileText, Loader2 } from "lucide-react";

interface CopilotResponse {
  response: string;
  suggestions?: string[];
  relevantContext?: Array<{
    type: 'ltm' | 'drive' | 'memory';
    title: string;
    url?: string;
    snippet?: string;
  }>;
  codeBlocks?: Array<{
    language: string;
    code: string;
    explanation?: string;
  }>;
}

export default function PiecesCopilotPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<CopilotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [task, setTask] = useState<'question' | 'debug' | 'comment' | 'generate' | 'explain'>('question');

  async function handleSubmit() {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in');
      }

      const res = await fetch("/api/pieces/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          task,
          context: {
            includeLTM: true,
            includeDrive: true,
            includeMemory: true,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Copilot error:', error);
      setResponse({
        response: 'Sorry, I encountered an error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Pieces Copilot</h1>
              <p className="text-sm text-gray-400">AI assistant with LTM-2.7 context</p>
            </div>
          </div>
        </div>

        {/* Task Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTask('question')}
            className={`px-4 py-2 rounded-lg transition-all ${
              task === 'question'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Question
          </button>
          <button
            onClick={() => setTask('debug')}
            className={`px-4 py-2 rounded-lg transition-all ${
              task === 'debug'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Bug className="w-4 h-4 inline mr-2" />
            Debug
          </button>
          <button
            onClick={() => setTask('comment')}
            className={`px-4 py-2 rounded-lg transition-all ${
              task === 'comment'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Comment
          </button>
          <button
            onClick={() => setTask('generate')}
            className={`px-4 py-2 rounded-lg transition-all ${
              task === 'generate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Generate
          </button>
          <button
            onClick={() => setTask('explain')}
            className={`px-4 py-2 rounded-lg transition-all ${
              task === 'explain'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Explain
          </button>
        </div>

        {/* Input */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              task === 'debug'
                ? 'Paste your code and describe the issue...'
                : task === 'comment'
                ? 'Paste code to generate comments...'
                : task === 'generate'
                ? 'Describe what code you want to generate...'
                : 'Ask a question...'
            }
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            disabled={isLoading}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-2 font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Ask Copilot
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response */}
        {response && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Response</h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-100 whitespace-pre-wrap mb-6">{response.response}</div>

              {/* Code Blocks */}
              {response.codeBlocks && response.codeBlocks.length > 0 && (
                <div className="mb-6">
                  {response.codeBlocks.map((block, i) => (
                    <div key={i} className="mb-4">
                      <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                        <div className="text-xs text-gray-400 mb-2">{block.language}</div>
                        <pre className="text-sm text-gray-100">
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Relevant Context */}
              {response.relevantContext && response.relevantContext.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Relevant Context</h3>
                  <div className="space-y-2">
                    {response.relevantContext.map((ctx, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 uppercase">{ctx.type}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium">{ctx.title}</div>
                            {ctx.snippet && (
                              <div className="text-gray-400 text-xs mt-1">{ctx.snippet}...</div>
                            )}
                            {ctx.url && (
                              <a
                                href={ctx.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 text-xs hover:underline mt-1 inline-block"
                              >
                                View →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {response.suggestions && response.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Suggestions</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {response.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
