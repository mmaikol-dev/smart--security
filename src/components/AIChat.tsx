import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  executionTime?: number;
  functionsUsed?: string[];
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Hello! I'm Cchef, your AI security assistant powered by Gemini. I can help you analyze security data and answer questions about your guard dogs, bodyguards, CCTV cameras, and security events. Try asking me something like:\n\n• \"Which dogs were not on patrol yesterday?\"\n• \"How many cameras are offline?\"\n• \"Summarize suspicious activities in the last 24 hours.\"\n• \"Show me the status of all bodyguards.\"\n• \"Give me a complete system overview.\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const processAIQuery = useAction(api.ai.processAIQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await processAIQuery({ query: input });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: result.response,
        timestamp: new Date(),
        executionTime: result.executionTime,
        functionsUsed: result.functionsUsed,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = [
    "Which dogs were not on patrol yesterday?",
    "How many cameras are offline?",
    "Summarize suspicious activities in the last 24 hours",
    "Show me all bodyguards on duty",
    "What's the current security status?",
    "List all critical security events",
    "Give me a complete system overview",
    "Which cameras need maintenance?",
  ];

  return (
    <div className="bg-white rounded-lg shadow h-[700px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cchef AI Assistant</h2>
            <p className="text-sm text-gray-600">Powered by Gemini • Your intelligent security monitoring companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-4xl rounded-lg p-4 ${
              message.type === "user" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-900"
            }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="mt-2 text-xs opacity-70 flex items-center space-x-2">
                <span>{message.timestamp.toLocaleTimeString()}</span>
                {message.executionTime && (
                  <span>• ⚡ {message.executionTime}ms</span>
                )}
                {message.functionsUsed && message.functionsUsed.length > 0 && (
                  <span>• 🔧 Used: {message.functionsUsed.join(", ")}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Cchef is analyzing your security data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Queries */}
      {messages.length === 1 && (
        <div className="px-6 py-3 border-t bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">💡 Try these sample queries:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setInput(query)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your security system..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          🔒 Powered by Gemini AI • Real-time security data analysis
        </p>
      </div>
    </div>
  );
}
