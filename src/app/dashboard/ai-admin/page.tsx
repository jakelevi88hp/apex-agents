"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Code, History, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("chat");

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
        toast.success("Patch generated successfully!");
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error.message || "Failed to generate patch"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to generate patch");
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
        toast.success("Patch applied successfully!");
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: "system",
        content: `Failed to apply patch: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to apply patch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollbackPatch = async (patchId: string) => {
    setIsLoading(true);
    try {
      const result = await rollbackPatchMutation.mutateAsync({ patchId });

      if (result.success) {
        toast.success("Patch rolled back successfully!");
        refetchHistory();
      }
    } catch (error: any) {
      toast.error(`Failed to rollback patch: ${error.message}`);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      applied: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Admin</h1>
          <p className="text-muted-foreground">
            Manage your codebase with AI-powered analysis and patching
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Admin Access
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">
            <Send className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="patches">
            <History className="h-4 w-4 mr-2" />
            Patch History
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Code className="h-4 w-4 mr-2" />
            Codebase Analysis
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Admin Chat</CardTitle>
              <CardDescription>
                Describe what you want to change, and I'll generate a patch for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.role === "system"
                            ? "bg-muted"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {message.patchId && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => handleApplyPatch(message.patchId!)}
                            disabled={isLoading}
                          >
                            Apply Patch
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-lg p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2 mt-4">
                <Input
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
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patch History Tab */}
        <TabsContent value="patches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Patch History</h2>
            <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {patchHistory?.data && patchHistory.data.length > 0 ? (
              patchHistory.data.map((patch: Patch) => (
                <Card key={patch.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(patch.status)}
                          {patch.description}
                        </CardTitle>
                        <CardDescription>
                          Created: {new Date(patch.createdAt).toLocaleString()}
                          {patch.appliedAt && (
                            <> • Applied: {new Date(patch.appliedAt).toLocaleString()}</>
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(patch.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Files Modified:</h4>
                        <div className="space-y-1">
                          {patch.files.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <Badge variant="outline" className="text-xs">
                                {file.action}
                              </Badge>
                              <code className="text-xs">{file.path}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      {patch.error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                          <strong>Error:</strong> {patch.error}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {patch.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleApplyPatch(patch.id)}
                            disabled={isLoading}
                          >
                            Apply Patch
                          </Button>
                        )}
                        {patch.status === "applied" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRollbackPatch(patch.id)}
                            disabled={isLoading}
                          >
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No patches yet. Start a conversation in the Chat tab to generate patches.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Codebase Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Codebase Analysis</h2>
            <Button variant="outline" size="sm" onClick={() => refetchAnalysis()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {codebaseAnalysis?.data ? (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Comprehensive analysis of your codebase structure and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(codebaseAnalysis.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing codebase...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
