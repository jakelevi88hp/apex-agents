"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Loader2, Send, Code, History, CheckCircle, XCircle, AlertCircle, RefreshCw, RotateCcw, Mic, Volume2 } from "lucide-react";
import { AIAdminVoiceInput } from "@/components/AIAdminVoiceInput";
import { AIAdminVoiceOutput } from "@/components/AIAdminVoiceOutput";
import { useVoiceAdminStore } from "@/lib/stores/voiceAdminStore";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  patchId?: string;
}

interface Patch {
  id: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
    action: "create" | "update" | "delete";
  }>;
  status: "pending" | "applied" | "failed" | "rolled_back";
  createdAt: Date;
  appliedAt?: Date;
  error?: string;
}

// Type for patch history records from the API
interface PatchRecord {
  id: string;
  timestamp: Date | string;
  request: string;
  patch: string;
  files: string[];
  status: "pending" | "applied" | "failed" | "rolled_back";
  error?: string;
}

// Helper function to speak text using Web Speech API
const speakText = (text: string) => {
  if (typeof window === 'undefined') return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Speak
  window.speechSynthesis.speak(utterance);
};

// Force rebuild - using generatePatch endpoint
export default function AIAdminPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome to AI Admin! I can help you analyze code, generate patches, and manage your codebase. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitialScrollRef = useRef(true);
  const lastSubmittedTranscriptRef = useRef<string>("");
  const isSubmittingRef = useRef(false);
  const [activeTab, setActiveTab] = useState<"chat" | "patches" | "analysis">("chat");
  
  // Voice state and hooks
  const { voiceMode, setVoiceMode, transcript, clearTranscript, isRecording } = useVoiceAdminStore();

  // tRPC mutations and queries
  const chatMutation = trpc.aiAdmin.chat.useMutation();
  const generatePatchMutation = trpc.aiAdmin.generatePatch.useMutation();
  const applyPatchMutation = trpc.aiAdmin.applyPatch.useMutation();
  const rollbackPatchMutation = trpc.aiAdmin.rollbackPatch.useMutation();
  const { data: patchHistory, refetch: refetchHistory } = trpc.aiAdmin.getPatchHistory.useQuery();
  const { data: codebaseAnalysis, refetch: refetchAnalysis } = trpc.aiAdmin.analyzeCodebase.useQuery();

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Check if user is asking to generate a patch
      const isPatchRequest = /generate patch|create patch|make patch|apply changes|generate code|write code/i.test(messageText);

      if (isPatchRequest) {
        // Generate patch from natural language request
        const result = await generatePatchMutation.mutateAsync({
          request: messageText,
        });

        if (result.success && result.data) {
          const files = Array.isArray(result.data.files) ? result.data.files : [];
          const filesCount = files.length;
          const description = typeof result.data.description === "string" ? result.data.description : "N/A";
          const patchId = typeof result.data.id === "string" ? result.data.id : "";

          const assistantMessage: Message = {
            role: "assistant",
            content: `Patch generated successfully!\n\n**Description:** ${description}\n\n**Files to be modified:** ${filesCount}\n\nWould you like me to apply this patch?`,
            timestamp: new Date(),
            patchId,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          // Speak the patch response
          speakText("Patch generated successfully!");
          refetchHistory();
        }
      } else {
        // Regular conversation - use chat endpoint
        // Include the current message in conversation history for better context
        const conversationHistory = messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
          .concat([{ role: 'user' as const, content: messageText }]);

        const result = await chatMutation.mutateAsync({
          message: messageText,
          conversationHistory,
        });

        if (result.success) {
          const assistantMessage: Message = {
            role: "assistant",
            content: result.message,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          // Speak the AI response for natural conversation
          speakText(result.message);
        } else {
          const errorMessage: Message = {
            role: "assistant",
            content: "Failed to get response. Please try again.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to process message"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPatch = async (patchId: string) => {
    setIsLoading(true);
    try {
      const result = await applyPatchMutation.mutateAsync({ patchId });

      if (result.success) {
        const successMessage: Message = {
          role: "system",
          content: "Patch applied successfully! The changes have been written to the filesystem.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        refetchHistory();
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "system",
        content: `Failed to apply patch: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackPatch = async (patchId: string) => {
    setIsLoading(true);
    try {
      const result = await rollbackPatchMutation.mutateAsync({ patchId });

      if (result.success) {
        refetchHistory();
      }
    } catch (error) {
      console.error("Rollback failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Returns a status icon component based on the patch status.
   *
   * @param status - The status of the patch.
   * @returns The corresponding status icon element or null.
   */
  const getStatusIcon = (status: Patch["status"]): React.ReactElement | null => {
    switch (status) {
      case "applied":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "rolled_back":
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  // Auto-submit voice input when recording stops
  useEffect(() => {
    if (!voiceMode || !transcript || isRecording) {
      isSubmittingRef.current = false;
      return;
    }

    const messageText = transcript.trim();
    console.log('[Voice] Recording stopped, message ready:', messageText);
    
    // Prevent duplicate submissions
    if (lastSubmittedTranscriptRef.current === messageText || isSubmittingRef.current) {
      console.log('[Voice] Skipping duplicate submission');
      return;
    }
    
    // Mark as submitting to prevent re-triggers
    isSubmittingRef.current = true;
    lastSubmittedTranscriptRef.current = messageText;
    console.log('[Voice] Starting message submission...');
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Send after a short delay
    const timer = setTimeout(async () => {
      try {
        console.log('[Voice] Sending message:', messageText);
        const isPatchRequest = /generate patch|create patch|make patch|apply changes|generate code|write code/i.test(messageText);

        if (isPatchRequest) {
          const result = await generatePatchMutation.mutateAsync({ request: messageText });
          if (result.success && result.data) {
            const files = Array.isArray(result.data.files) ? result.data.files : [];
            const assistantMessage: Message = {
              role: "assistant",
              content: `Patch generated!\n\n**Description:** ${result.data.description}\n\n**Files:** ${files.length}`,
              timestamp: new Date(),
              patchId: String(result.data.id),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            // Speak the patch response
            speakText("Patch generated successfully!");
            refetchHistory();
          }
        } else {
          // Build conversation history including current message
          const conversationHistory = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }))
            .concat([{ role: 'user' as const, content: messageText }]);
          
          const result = await chatMutation.mutateAsync({ message: messageText, conversationHistory });
          if (result.success) {
            console.log('[Voice] Response received:', result.message);
            setMessages((prev) => [...prev, { role: "assistant", content: result.message, timestamp: new Date() }]);
            // Speak the AI response for natural conversation
            speakText(result.message);
          } else {
            console.error('[Voice] Chat failed:', result);
          }
        }
      } catch (error) {
        console.error('[Voice] Error submitting message:', error);
        const errorMessage: Message = { role: "assistant", content: `Error: ${error}`, timestamp: new Date() };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        console.log('[Voice] Submission complete, clearing state');
        setIsLoading(false);
        isSubmittingRef.current = false;
        lastSubmittedTranscriptRef.current = "";
        // Clear transcript AFTER all state updates are done
        setTimeout(() => clearTranscript(), 0);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      isSubmittingRef.current = false;
    };
  }, [voiceMode, isRecording, transcript])

  useEffect(() => {
    // Ensure the scroll container is available before attempting to scroll
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const scrollBehavior: ScrollBehavior = isInitialScrollRef.current ? "auto" : "smooth";

    container.scrollTo({
      top: container.scrollHeight,
      behavior: scrollBehavior,
    });

    if (isInitialScrollRef.current) {
      isInitialScrollRef.current = false;
    }
  }, [messages, isLoading]);

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Admin</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your codebase with AI-powered analysis and patching
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Admin Access</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "chat"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Send className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("patches")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "patches"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <History className="h-4 w-4" />
            Patch History
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analysis"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Code className="h-4 w-4" />
            Codebase Analysis
          </button>
        </div>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI Admin Chat</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Describe what you want to change, and I&apos;ll generate a patch for you
            </p>

            {/* Messages */}
            <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.role === "system"
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {message.patchId && (
                      <button
                        onClick={() => handleApplyPatch(message.patchId!)}
                        disabled={isLoading}
                        className="mt-2 px-3 py-1.5 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply Patch
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-900 dark:text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Voice Mode Toggle */}
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setVoiceMode(!voiceMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  voiceMode
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <Mic className="h-4 w-4" />
                {voiceMode ? "Voice Mode" : "Text Mode"}
              </button>
              {voiceMode && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isRecording ? "🎤 Listening..." : "Click microphone to start speaking"}
                </span>
              )}
            </div>

            {/* Voice Input */}
            {voiceMode && (
              <div className="mb-4">
                <AIAdminVoiceInput />
              </div>
            )}
            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Describe the changes you want to make..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patch History Tab */}
      {activeTab === "patches" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patch History</h2>
            <button
              onClick={() => refetchHistory()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {patchHistory?.data && patchHistory.data.length > 0 ? (
              patchHistory.data.map((patchRecord: PatchRecord) => {
                // Convert PatchRecord to display format
                const timestamp = typeof patchRecord.timestamp === "string" 
                  ? new Date(patchRecord.timestamp) 
                  : patchRecord.timestamp;
                const description = patchRecord.request || "No description";
                const files = patchRecord.files || [];

                return (
                  <div
                    key={patchRecord.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(patchRecord.status as Patch["status"])}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {description}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Created: {timestamp instanceof Date ? timestamp.toLocaleString() : new Date(timestamp).toLocaleString()}
                        </p>
                      </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            patchRecord.status === "applied"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : patchRecord.status === "failed"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : patchRecord.status === "rolled_back"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                        {patchRecord.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                          Files Modified:
                        </h4>
                        <div className="space-y-1">
                          {files.length > 0 ? (
                            files.map((filePath, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                  update
                                </span>
                                <code className="text-xs">{filePath}</code>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No files listed</p>
                          )}
                        </div>
                      </div>

                      {patchRecord.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                          <strong>Error:</strong> {patchRecord.error}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {patchRecord.status === "pending" && (
                          <button
                            onClick={() => handleApplyPatch(patchRecord.id)}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Apply Patch
                          </button>
                        )}
                        {(patchRecord.status === "applied" || patchRecord.status === "rolled_back") && (
                          <button
                            onClick={() => handleRollbackPatch(patchRecord.id)}
                            disabled={isLoading}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                No patches yet. Start a conversation in the Chat tab to generate patches.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Codebase Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Codebase Analysis</h2>
            <button
              onClick={() => refetchAnalysis()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {codebaseAnalysis?.data ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Analysis Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comprehensive analysis of your codebase structure and patterns
              </p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm text-gray-900 dark:text-gray-100">
                {JSON.stringify(codebaseAnalysis.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-900 dark:text-white" />
              <p className="text-gray-600 dark:text-gray-400">Analyzing codebase...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
