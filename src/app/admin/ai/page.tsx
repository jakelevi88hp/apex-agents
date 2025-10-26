'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { 
  Send, Bot, User, CheckCircle, XCircle, Clock, 
  Code, FileText, AlertTriangle, Loader2, Terminal,
  History, RotateCcw
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC mutations
  const executeCommand = trpc.aiAdmin.executeCommand.useMutation();
  const applyPatch = trpc.aiAdmin.applyPatch.useMutation();
  const rollbackPatch = trpc.aiAdmin.rollbackPatch.useMutation();

  // tRPC queries
  const { data: patchHistory } = trpc.aiAdmin.getPatchHistory.useQuery();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Execute command (generate patch)
      const result = await executeCommand.mutateAsync({
        command: input,
        autoApply: false,
      });

      const patchData = JSON.parse(result.data.patch);

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant',
        content: `I've analyzed your request and generated a patch:\n\n**Summary:** ${patchData.summary}\n\n**Files affected:** ${result.data.files.length}\n- ${result.data.files.join('\n- ')}\n\n**Testing steps:**\n${patchData.testingSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n**Potential risks:**\n${patchData.risks.map((risk: string) => `⚠️ ${risk}`).join('\n')}\n\nWould you like me to apply this patch?`,
        timestamp: new Date(),
        patchId: result.data.id,
        status: 'pending',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'system',
        content: `Error: ${error.message || 'Failed to process command'}`,
        timestamp: new Date(),
        status: 'failed',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPatch = async (patchId: string) => {
    setIsProcessing(true);

    try {
      const result = await applyPatch.mutateAsync({ patchId });

      const systemMessage: Message = {
        id: `msg_${Date.now()}_applied`,
        role: 'system',
        content: result.success
          ? '✅ Patch applied successfully! The changes have been written to the codebase.'
          : '❌ Failed to apply patch. Check the logs for details.',
        timestamp: new Date(),
        status: result.success ? 'applied' : 'failed',
      };

      setMessages(prev => [...prev, systemMessage]);

      // Update the message status
      setMessages(prev =>
        prev.map(msg =>
          msg.patchId === patchId
            ? { ...msg, status: result.success ? 'applied' : 'failed' }
            : msg
        )
      );
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'system',
        content: `Error applying patch: ${error.message}`,
        timestamp: new Date(),
        status: 'failed',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRollback = async (patchId: string) => {
    setIsProcessing(true);

    try {
      const result = await rollbackPatch.mutateAsync({ patchId });

      const systemMessage: Message = {
        id: `msg_${Date.now()}_rollback`,
        role: 'system',
        content: result.success
          ? '↩️ Patch rolled back successfully. Changes have been reverted.'
          : '❌ Failed to rollback patch.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, systemMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'system',
        content: `Error rolling back: ${error.message}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar - Patch History */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Patch History</h2>
          </div>
          <p className="text-sm text-gray-400">Recent code changes</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {patchHistory?.data.map((patch: any) => (
            <div
              key={patch.id}
              className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">
                  {new Date(patch.timestamp).toLocaleTimeString()}
                </span>
                {patch.status === 'applied' && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {patch.status === 'failed' && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                {patch.status === 'pending' && (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-white line-clamp-2">{patch.request}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <FileText className="w-3 h-3" />
                <span>{patch.files.length} files</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Terminal className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Admin Agent</h1>
              <p className="text-sm text-gray-400">Self-upgrading system • GPT-4 Turbo</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-lg ${
                    message.role === 'assistant'
                      ? 'bg-purple-500/20'
                      : 'bg-blue-500/20'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Terminal className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                </div>
              )}

              <div
                className={`max-w-2xl ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.role === 'system'
                    ? 'bg-blue-900/50 text-blue-200 border border-blue-500/30'
                    : 'bg-gray-800 text-gray-200 border border-gray-700'
                } rounded-lg p-4`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.patchId && message.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleApplyPatch(message.patchId!)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Apply Patch
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      <Code className="w-4 h-4" />
                      View Code
                    </button>
                  </div>
                )}

                {message.patchId && message.status === 'applied' && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleRollback(message.patchId!)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Rollback
                    </button>
                  </div>
                )}

                <div className="mt-2 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing your request...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Enter a command (e.g., 'add dark mode toggle', 'optimize database queries')..."
              className="flex-1 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <AlertTriangle className="w-3 h-3" />
            <span>
              Admin access required • All changes are logged • Backups are created automatically
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

