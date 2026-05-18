import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardPaste, Sparkles, Trash2, History, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HighlightResult {
  type: "quote" | "text";
  text?: string;
  person?: string;
  highlightedText?: string;
  original: string;
}

const NewsHighlighter = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HighlightResult | null>(null);
  const [history, setHistory] = useState<HighlightResult[]>([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("news-highlighter-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newResult: HighlightResult) => {
    const updatedHistory = [newResult, ...history.filter(h => h.original !== newResult.original)].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem("news-highlighter-history", JSON.stringify(updatedHistory));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      toast.success("Text pasted from clipboard");
    } catch (err) {
      toast.error("Failed to read clipboard");
    }
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
  };

  const handleHighlight = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("https://qwen.ai.unturf.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "hf.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF:Q4_K_M",
          messages: [
            {
              role: "system",
              content: `You are a news analyzer for both English and Bangla. Your task is to analyze a news title and determine if it's a quote or regular text.

              Rules:
              1. A quote can be identified by patterns like "Person: Statement", "Statement - Person", "Person said...", or if the context strongly implies a direct statement/opinion. Robustly identify quotes even without explicit quotation marks.
              2. STRICTLY DO NOT ALTER THE NEWS/QUOTE CONTENT.
              3. For Bangla text, be extremely careful not to split words or conjunct characters (juktakkhor).

              If it's a quote:
              - Return JSON: {"type": "quote", "text": "The actual quote content", "person": "The person who said it"}
              - The "text" should be the news content without the person attribution.
              - The "person" should be the name/position of the person.

              If it's regular text:
              - Return JSON: {"type": "text", "highlightedText": "Text with *word* for highlighting"}
              - Highlight full words or multi-word phrases that, when read together in sequence, form a "clickbait" summary of the news.
              - NEVER highlight individual letters or parts of a word. Ensure * markers are always outside the word boundaries.
              - The "highlightedText" must be identical to the input except for the added * markers.

              Always return ONLY the JSON.`
            },
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) throw new Error("AI Service unavailable");

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const finalResult: HighlightResult = {
          ...parsed,
          original: input
        };
        setResult(finalResult);
        saveToHistory(finalResult);
        toast.success("Analysis complete!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze news title. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-4xl mx-auto px-6 py-6">
        <div className="mb-8 flex items-center gap-6 animate-fade-in-up">
          <Link
            to="/tools"
            className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
            aria-label="Back to tools"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">News Highlighter</h1>
            <p className="text-muted-foreground">Analyze and highlight news titles using AI.</p>
          </div>
        </div>

        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter news title here..."
              className="w-full bg-m3-primary-container/20 border-2 border-transparent focus:border-m3-primary/30 p-6 rounded-[2rem] outline-none text-lg font-medium transition-all min-h-[150px] resize-none shadow-inner"
            />
            <div className="absolute right-4 bottom-4 flex gap-2">
              <button
                onClick={handlePaste}
                className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground transition-all active:scale-95"
                title="Paste"
              >
                <ClipboardPaste size={20} />
              </button>
              {input && (
                <button
                  onClick={handleClear}
                  className="p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all active:scale-95"
                  title="Clear"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          {input && (
            <button
              onClick={handleHighlight}
              disabled={isLoading}
              className="w-full py-4 rounded-[2rem] bg-m3-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              Highlight
            </button>
          )}

          {/* Result Display Area */}
          {result && (
            <div className="mt-8 p-8 md:p-12 rounded-[2.5rem] bg-card border border-border shadow-md animate-fade-in-up overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-m3-primary/30" />

              {result.type === "quote" ? (
                <div className="flex flex-col space-y-6">
                  <div className="text-2xl md:text-3xl font-medium text-center text-justify [text-align-last:center] italic leading-relaxed text-foreground/90">
                    "{result.text}"
                  </div>
                  <div className="self-end mt-4">
                    <span className="text-xl md:text-2xl font-bold text-red-600">
                      — {result.person}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-2xl md:text-3xl font-medium leading-relaxed max-w-none text-foreground/90">
                  {result.highlightedText?.split(/(\*.*?\*)/g).map((part, i) => {
                    if (part.startsWith('*') && part.endsWith('*')) {
                      return (
                        <span key={i} className="font-bold text-red-600">
                          {part.slice(1, -1)}
                        </span>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="mt-12 border-t border-border pt-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <button
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-secondary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <History size={20} className="text-m3-primary" />
                  <span className="font-bold">Recent History</span>
                </div>
                {isHistoryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isHistoryExpanded && (
                <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setResult(item);
                        setInput(item.original);
                      }}
                      className="p-4 rounded-2xl bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-all border border-transparent hover:border-m3-primary/20"
                    >
                      <p className="line-clamp-2 text-sm opacity-80">{item.original}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsHighlighter;
