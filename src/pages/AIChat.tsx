import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, AlertCircle, Terminal, User, Bot, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "System initialized. Gemini 2.5 Flash at your service. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://g4f.space/api/gemini/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage: Message = data.choices[0].message;
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      setError("Failed to connect to the neural network. Please check your connection or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Memory cleared. System re-initialized. How can I assist you?" }
    ]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <div className="max-w-4xl mx-auto pt-6 md:pt-20 px-4">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 rounded-xl bg-surface-1 border border-border hover:border-primary transition-all active:scale-95 group shrink-0"
              aria-label="Back to home"
            >
              <ArrowLeft size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            <div className="min-w-0">
              <h1 className="text-2xl md:text-5xl font-bold font-mono truncate gradient-text">
                Neural.Link
              </h1>
              <p className="text-muted-foreground font-mono text-[10px] md:text-sm truncate">
                {"// Conversational AI Interface"}
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-2.5 rounded-xl bg-surface-1 border border-border hover:border-destructive transition-all active:scale-95 group shrink-0"
            title="Clear Chat"
          >
            <Trash2 size={20} className="text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        </header>

        {/* Chat Area */}
        <div className="terminal-window flex flex-col h-[600px] shadow-none backdrop-blur-none bg-card animate-fade-in-up">
          <div className="terminal-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-primary" />
              <span className="text-xs font-mono text-primary">SESSION::ACTIVE // MODEL::GEMINI-2.5-FLASH</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-border" />
              <div className="w-2 h-2 rounded-full bg-border" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-4 max-w-[85%] animate-fade-in-up",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                  msg.role === "user"
                    ? "bg-primary/20 border-primary/30 text-primary"
                    : "bg-surface-1 border-border text-muted-foreground"
                )}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-surface-1 border border-border text-foreground"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-surface-1 border border-border flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-muted-foreground" />
                </div>
                <div className="p-4 rounded-2xl bg-surface-1 border border-border flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">Processing...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-4 max-w-[85%] mx-auto">
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-secondary/30">
            <div className="relative flex gap-2">
              <input
                type="text"
                placeholder="Enter command or message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl border border-border bg-surface-1 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all font-mono disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:active:scale-100"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
