'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { 
  Send, Bot, User, CheckCircle, XCircle, Clock, 
  Code, FileText, AlertTriangle, Loader2, Terminal,
  History, RotateCcw, ShieldAlert, LogIn
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  patchId?: string;
  status?: 'pending' | 'applied' | 'failed';
}

export default function AIAdminPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'AI Admin Agent initialized. I can help you upgrade and modify the codebase using natural language commands. Try commands like "add dark mode toggle", "optimize database queries", or "refactor API routes".',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedPatchId, setSelectedPatchId] = useState<string | null>(null);
  const [showPatchDetails, setShowPatchDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Not logged in - redirect to login
      router.push('/login?redirect=/admin/ai');
      return;
    }
  }, [router]);

  // tRPC mutations with error handling
  const executeCommand = trpc.aiAdmin.executeCommand.useMutation({
    onError: (error: any) => {
      if (error.data?.code === 'FORBIDDEN') {
        setAuthError(error.message);
      }
    },
  });
  
  const applyPatch = trpc.aiAdmin.applyPatch.useMutation({
    onError: (error: any) => {
      if (error.data?.code === 'FORBIDDEN') {
        setAuthError(error.message);
      }
    },
  });
  
  const rollbackPatch = trpc.aiAdmin.rollbackPatch.useMutation({
    onError: (error: any) => {
      if (error.data?.code === 'FORBIDDEN') {
        setAuthError(error.message);
      }
    },
  });

  // tRPC queries
  const { data: patchHistory, error: patchHistoryError } = trpc.aiAdmin.getPatchHistory.useQuery();
  
  // Check for auth error in query
  useEffect(() => {
    if (patchHistoryError && (patchHistoryError as any).data?.code === 'FORBIDDEN') {
      setAuthError(patchHistoryError.message);
    }
  }, [patchHistoryError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show error page if not admin
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-500/20 p-4 rounded-full">
              <ShieldAlert className="w-12 h-12 text-red-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">{authError}</p>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-white mb-2">How to Get Admin Access:</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>The first user to sign up automatically becomes an admin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Contact your system administrator to grant you admin privileges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Admin role can be set in the database users table</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/50"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const result = await executeCommand.mutateAsync({ 
        command: input,
        autoApply: false  // Keep false for manual approval
      });

      if (result.success && result.data) {
        // Parse the patch to show details
        let patchData: any = {};
        try {
          patchData = JSON.parse(result.data.patch || '{}');
        } catch (e) {
          console.error('Failed to parse patch:', e);
        }
        
        // Build detailed message content
        let messageContent = '**Patch Generated Successfully**\n\n';
        
        if (patchData.summary) {
          messageContent += `${patchData.summary}\n\n`;
        }
        
        if (result.data.files && result.data.files.length > 0) {
          messageContent += '**Files to be modified:**\n';
          messageContent += result.data.files.map((f: string) => `• ${f}`).join('\n');
          messageContent += '\n\n';
        }
        
        if (patchData.testingSteps && patchData.testingSteps.length > 0) {
          messageContent += '**Testing Steps:**\n';
          messageContent += patchData.testingSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
          messageContent += '\n\n';
        }
        
        if (patchData.risks && patchData.risks.length > 0) {
          messageContent += '**⚠️ Potential Risks:**\n';
          messageContent += patchData.risks.map((r: string) => `• ${r}`).join('\n');
          messageContent += '\n\n';
        }
        
        messageContent += 'Click "Apply Patch" to implement these changes or "View Details" to see the full code diff.';
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: messageContent,
          timestamp: new Date(),
          patchId: result.data.id,
          status: 'pending',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: ${error.message || 'Failed to execute command'}`,
        timestamp: new Date(),
        status: 'failed',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (patchId: string) => {
    setSelectedPatchId(patchId);
    setShowPatchDetails(true);
  };

  const handleApplyPatch = async (patchId: string) => {
    console.log('[handleApplyPatch] Starting patch application for:', patchId);
    try {
      console.log('[handleApplyPatch] Calling applyPatch mutation...');
      const result = await applyPatch.mutateAsync({ patchId });
      console.log('[handleApplyPatch] Result:', result);
      
      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.patchId === patchId ? { ...msg, status: 'applied' as const } : msg
          )
        );
        
        // Check if PR was created (production mode)
        const prUrl = (result.data as any)?.prUrl;
        let successContent = '✅ Patch applied successfully!';
        
        if (prUrl) {
          successContent += `\n\n🔗 **Pull Request Created:** [View PR](${prUrl})\n\nThe changes have been committed to a new branch and a pull request has been created. Once the PR is merged, Vercel will automatically deploy the changes.`;
        } else {
          successContent += ' Changes have been implemented locally.';
        }
        
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: successContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      } else {
        // Handle failure when success is false
        console.error('[handleApplyPatch] Patch application failed:', result);
        const errorContent = result.data?.error || result.data?.message || 'Unknown error occurred';
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: `❌ Failed to apply patch: ${errorContent}\n\nPlease check the Vercel logs for more details.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error('[handleApplyPatch] Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `❌ Failed to apply patch: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleRollback = async (patchId: string) => {
    try {
      const result = await rollbackPatch.mutateAsync({ patchId });
      
      if (result.success) {
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: '↩️ Patch rolled back successfully! Changes have been reverted.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `❌ Failed to rollback: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Admin Agent</h1>
              <p className="text-gray-400 text-sm">Self-upgrading system powered by GPT-4</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0">
                  {message.role === 'assistant' ? (
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                  )}
                </div>
              )}

              <div
                className={`max-w-2xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                    : message.role === 'system'
                    ? 'bg-gray-800 border border-gray-700 text-gray-300'
                    : 'bg-gray-800 border border-gray-700 text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {message.patchId && message.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleApplyPatch(message.patchId!)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Apply Patch
                    </button>
                    <button
                      onClick={() => handleViewDetails(message.patchId!)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                )}
                
                {message.status === 'applied' && (
                  <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Applied</span>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing command...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 p-6 bg-gray-800/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Enter a command... (e.g., 'add loading skeletons to all pages')"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Patch History */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Patch History</h2>
        </div>

        <div className="space-y-3">
          {patchHistory && patchHistory.length > 0 ? (
            patchHistory.map((patch: any) => (
              <div
                key={patch.id}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {patch.status === 'applied' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : patch.status === 'rolled_back' ? (
                      <RotateCcw className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-white">
                      {patch.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {patch.description}
                </p>
                
                <div className="text-xs text-gray-500">
                  {new Date(patch.createdAt).toLocaleString()}
                </div>
                
                {patch.status === 'applied' && (
                  <button
                    onClick={() => handleRollback(patch.id)}
                    className="mt-3 w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Rollback
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No patches yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Patch Details Modal */}
      {showPatchDetails && selectedPatchId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Patch Details</h2>
                </div>
                <button
                  onClick={() => setShowPatchDetails(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <PatchDetailsContent patchId={selectedPatchId} />
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-700 p-6 bg-gray-900">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPatchDetails(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleApplyPatch(selectedPatchId);
                    setShowPatchDetails(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white transition flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Apply Patch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Patch Details Component
function PatchDetailsContent({ patchId }: { patchId: string }) {
  const { data: patchData, isLoading } = trpc.aiAdmin.getPatch.useQuery({ patchId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!patchData || !patchData.success) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
        <p>Failed to load patch details</p>
      </div>
    );
  }

  const patch = patchData.data;
  let parsedPatch: any = {};
  
  try {
    parsedPatch = JSON.parse(patch.patch || '{}');
  } catch (e) {
    console.error('Failed to parse patch:', e);
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {parsedPatch.summary && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
          <p className="text-gray-300">{parsedPatch.summary}</p>
        </div>
      )}

      {/* Files */}
      {parsedPatch.files && parsedPatch.files.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Files to be Modified</h3>
          <div className="space-y-3">
            {parsedPatch.files.map((file: any, index: number) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="font-mono text-sm text-white">{file.path}</span>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                    {file.action}
                  </span>
                </div>
                {file.explanation && (
                  <p className="text-sm text-gray-400 mt-2">{file.explanation}</p>
                )}
                {file.content && (
                  <details className="mt-3">
                    <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                      View Code
                    </summary>
                    <pre className="mt-2 p-3 bg-black/50 rounded text-xs text-gray-300 overflow-x-auto">
                      <code>{file.content}</code>
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testing Steps */}
      {parsedPatch.testingSteps && parsedPatch.testingSteps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Testing Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            {parsedPatch.testingSteps.map((step: string, index: number) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Risks */}
      {parsedPatch.risks && parsedPatch.risks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Potential Risks
          </h3>
          <ul className="space-y-2">
            {parsedPatch.risks.map((risk: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-gray-300">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

