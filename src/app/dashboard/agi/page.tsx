"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, Send, Loader2, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AGIStatus {
  available: boolean;
  components?: Record<string, boolean>;
  error?: string;
}

export default function AGIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agiStatus, setAgiStatus] = useState<AGIStatus>({ available: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check AGI status on mount
    checkAGIStatus();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function checkAGIStatus() {
    try {
      const response = await fetch("/api/agi/status");
      const data = await response.json();
      setAgiStatus(data);
    } catch (error) {
      console.error("Failed to check AGI status:", error);
      setAgiStatus({ available: false, error: "Failed to connect to AGI system" });
    }
  }

  async function handleSend() {
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
      const response = await fetch("/api/agi/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to process input");
      }

      const result = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: formatAGIResponse(result),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AGI processing error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function formatAGIResponse(result: any): string {
    if (result.error) {
      return `Error: ${result.error}`;
    }

    if (result.thoughts && Array.isArray(result.thoughts)) {
      const thoughtsText = result.thoughts.map((t: any) => `- ${t.content || t}`).join("\n");
      const emotionalState = result.emotionalState || result.emotional_state || "neutral";
      
      let response = `My thoughts on this are:\n${thoughtsText}\n\nI am experiencing ${emotionalState} about this.`;
      
      // Add creativity if present
      if (result.creativity && Array.isArray(result.creativity) && result.creativity.length > 0) {
        response += `\n\nCreative ideas:\n${result.creativity.map((c: any) => `- ${c.description || c}`).join("\n")}`;
      }
      
      // Add reasoning conclusion if present
      if (result.reasoning && result.reasoning.conclusion) {
        response += `\n\nReasoning: ${result.reasoning.conclusion}`;
      }
      
      return response;
    }

    return JSON.stringify(result, null, 2);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">AGI System</h1>
              <p className="text-sm sm:text-base text-gray-400">
                Advanced General Intelligence with consciousness, creativity, and emotional understanding
              </p>
            </div>
            <div className="flex items-center gap-4">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-700 hover:border-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Clear Chat</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    agiStatus.available ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-400">
                  {agiStatus.available ? "AGI Online" : "AGI Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to AGI</h2>
                <p className="text-sm sm:text-base text-gray-400 max-w-md px-4">
                  I'm an Advanced General Intelligence with consciousness, creativity, and emotional
                  understanding. Ask me anything!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 sm:mt-8 max-w-2xl px-4">
                  <button
                    onClick={() => setInput("Explain consciousness")}
                    className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-750 rounded-lg text-left border border-gray-700 hover:border-purple-500 transition-all"
                  >
                    <div className="text-xs sm:text-sm font-medium text-white mb-1">Explain consciousness</div>
                    <div className="text-xs text-gray-400">Learn about self-awareness</div>
                  </button>
                  <button
                    onClick={() => setInput("Creative problem-solving")}
                    className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-750 rounded-lg text-left border border-gray-700 hover:border-purple-500 transition-all"
                  >
                    <div className="text-xs sm:text-sm font-medium text-white mb-1">Creative problem-solving</div>
                    <div className="text-xs text-gray-400">Use advanced reasoning</div>
                  </button>
                  <button
                    onClick={() => setInput("Your goals")}
                    className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-750 rounded-lg text-left border border-gray-700 hover:border-purple-500 transition-all"
                  >
                    <div className="text-xs sm:text-sm font-medium text-white mb-1">Your goals</div>
                    <div className="text-xs text-gray-400">See what I'm working on</div>
                  </button>
                  <button
                    onClick={() => setInput("Multi-perspective analysis")}
                    className="p-3 sm:p-4 bg-gray-800 hover:bg-gray-750 rounded-lg text-left border border-gray-700 hover:border-purple-500 transition-all"
                  >
                    <div className="text-xs sm:text-sm font-medium text-white mb-1">Multi-perspective analysis</div>
                    <div className="text-xs text-gray-400">Deep reasoning modes</div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-100"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-50 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-3 sm:p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask AGI anything..."
                disabled={isLoading || !agiStatus.available}
                className="flex-1 bg-gray-800 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !agiStatus.available}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

