"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Loader2, Send, Code, History, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

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
  status: "pending" | "applied" | "failed";
  createdAt: Date;
  appliedAt?: Date;
  error?: string;
}

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
  const [activeTab, setActiveTab] = useState<"chat" | "patches" | "analysis">("chat");

  // tRPC mutations and queries
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
    setInput("");
    setIsLoading(true);

    try {
      // Generate patch from natural language request
      const result = await generatePatchMutation.mutateAsync({
        request: input.trim(),
      });

      if (result.success && result.data) {
        const assistantMessage: Message = {
          role: "assistant",
          content: `Patch generated successfully!\n\n**Description:** ${result.data.description}\n\n**Files to be modified:** ${result.data.files.length}\n\nWould you like me to apply this patch?`,
          timestamp: new Date(),
          patchId: result.data.id,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        refetchHistory();
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error.message || "Failed to generate patch"}`,
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
    } catch (error: any) {
      const errorMessage: Message = {
        role: "system",
        content: `Failed to apply patch: ${error.message}`,
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
    } catch (error: any) {
      console.error("Rollback failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

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
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Admin Access
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
              Describe what you want to change, and I'll generate a patch for you
            </p>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-4">
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
              patchHistory.data.map((patch: Patch) => (
                <div
                  key={patch.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(patch.status)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {patch.description}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Created: {new Date(patch.createdAt).toLocaleString()}
                        {patch.appliedAt && (
                          <> • Applied: {new Date(patch.appliedAt).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        patch.status === "applied"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : patch.status === "failed"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {patch.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Files Modified:
                      </h4>
                      <div className="space-y-1">
                        {patch.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${
                                file.action === "create"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : file.action === "delete"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              }`}
                            >
                              {file.action}
                            </span>
                            <code className="text-xs">{file.path}</code>
                          </div>
                        ))}
                      </div>
                    </div>

                    {patch.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                        <strong>Error:</strong> {patch.error}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {patch.status === "pending" && (
                        <button
                          onClick={() => handleApplyPatch(patch.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply Patch
                        </button>
                      )}
                      {patch.status === "applied" && (
                        <button
                          onClick={() => handleRollbackPatch(patch.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Rollback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
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
