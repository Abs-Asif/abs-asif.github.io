import { useState } from "react";
import { ArrowLeft, Beaker, Copy, Check, Loader2, AlertCircle, Terminal, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WordAnalysis {
  word: string;
  partsOfSpeech: {
    noun?: string[];
    verb?: string[];
    adjective?: string[];
    adverb?: string[];
    other?: Record<string, string[]>;
  };
  tenses: {
    present?: string;
    past?: string;
    pastParticiple?: string;
    presentParticiple?: string;
    thirdPersonSingular?: string;
  };
}

const Lab = () => {
  const navigate = useNavigate();
  const [word, setWord] = useState("");
  const [result, setResult] = useState<WordAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  const cleanJsonString = (str: string) => {
    try {
      const cleaned = str.replace(/```json\n?|```/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      }
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON Clean Error:", e);
      throw new Error("Invalid response format from AI.");
    }
  };

  const analyzeWord = async () => {
    if (!word.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const systemPrompt = `You are a linguistic analysis assistant. Analyze the given word and provide its parts of speech variants and tense variants in a JSON format.
    Return ONLY a JSON object with this structure:
    {
      "word": "original_word",
      "partsOfSpeech": {
        "noun": ["list", "of", "nouns"],
        "verb": ["list", "of", "verbs"],
        "adjective": ["list", "of", "adjectives"],
        "adverb": ["list", "of", "adverbs"],
        "other": { "category_name": ["list"] }
      },
      "tenses": {
        "present": "word",
        "past": "word",
        "pastParticiple": "word",
        "presentParticiple": "word",
        "thirdPersonSingular": "word"
      }
    }
    If a form is not applicable, omit the field or return an empty array/null. Be precise. Respond only with the JSON object.`;

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "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";

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Ecosystem OS Lab",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-plus:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Analyze the word: "${word}"` }
          ],
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const content = cleanJsonString(data.choices[0].message.content);
        setResult(content);
      } else {
        throw new Error(data.error?.message || "Failed to process the word.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis. Please try again.");
      toast.error("Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWord(text);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20 selection:bg-primary/30">
      <div className="max-w-4xl mx-auto pt-6 md:pt-10 px-4">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 md:mb-12 animate-fade-in-up">
          <button
            onClick={() => navigate("/")}
            className="self-start sm:self-center p-2.5 md:p-3 rounded-xl bg-surface-1 border-2 border-border hover:border-primary transition-all active:scale-95 group shrink-0"
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <div className="flex items-center gap-3 md:gap-4 w-full">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <Beaker size={24} className="md:w-7 md:h-7 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-5xl font-bold font-mono tracking-tighter uppercase italic leading-none">
                The <span className="gradient-text">Laboratory</span>
              </h1>
              <p className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">
                {"// Word Research Unit v1.0.4"}
              </p>
            </div>
          </div>
        </header>

        {/* Input Terminal */}
        <div className="terminal-window mb-8 md:mb-12 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="terminal-header">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
            </div>
            <span className="text-[9px] md:text-[10px] font-mono text-muted-foreground ml-3 md:ml-4 uppercase tracking-widest flex items-center gap-1.5">
              <Terminal size={10} /> input_word.sh
            </span>
          </div>
          <div className="p-5 md:p-8 space-y-4 md:space-y-6 bg-surface-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeWord()}
                placeholder="Enter a word..."
                className="flex-1 bg-background border-2 border-border p-4 md:p-5 rounded-xl font-mono text-lg md:text-xl focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30"
              />
              <button
                onClick={analyzeWord}
                disabled={isLoading || !word.trim()}
                className="h-14 md:h-16 px-6 md:px-8 rounded-xl bg-primary text-primary-foreground font-mono font-bold flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 disabled:grayscale transition-all shadow-[4px_4px_0px_0px_#14532d]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                <span className="whitespace-nowrap">{isLoading ? "PROCESSING..." : "PROCESS"}</span>
              </button>
            </div>
            <p className="text-[9px] md:text-[10px] font-mono text-muted-foreground/60 italic text-center sm:text-left">
              * Using Qwen-3.6-Plus Research Model for morphological analysis.
            </p>
          </div>
        </div>

        {/* Results Area */}
        <div className="min-h-[300px]">
          {error && (
            <div className="terminal-window p-6 md:p-8 border-destructive/50 bg-destructive/5 animate-fade-in-up">
              <div className="flex items-start gap-3 md:gap-4">
                <AlertCircle className="text-destructive shrink-0 mt-1" size={20} />
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-destructive font-mono uppercase tracking-tighter italic leading-none">Kernel_Panic</h3>
                  <p className="text-muted-foreground font-mono text-xs md:text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-fade-in-up">
              {/* Parts of Speech Column */}
              <div className="terminal-window border-primary/20">
                <div className="terminal-header bg-primary/5 border-primary/10">
                  <span className="text-[9px] md:text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Morphology::Variants</span>
                </div>
                <div className="p-4 md:p-6 space-y-6">
                  {Object.entries(result.partsOfSpeech).map(([pos, items]) => {
                    if (!items || (Array.isArray(items) && items.length === 0)) return null;

                    const isOther = pos === 'other';
                    if (isOther) {
                      return Object.entries(items).map(([subPos, subItems]) => (
                        <div key={subPos} className="space-y-3">
                          <h4 className="text-[10px] font-mono text-primary/70 uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-primary" /> {subPos}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(subItems as string[]).map((w) => (
                              <WordChip key={w} word={w} onCopy={copyToClipboard} isCopied={copiedWord === w} />
                            ))}
                          </div>
                        </div>
                      ));
                    }

                    return (
                      <div key={pos} className="space-y-3">
                        <h4 className="text-[10px] font-mono text-primary/70 uppercase tracking-widest flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-primary" /> {pos}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(items as string[]).map((w) => (
                            <WordChip key={w} word={w} onCopy={copyToClipboard} isCopied={copiedWord === w} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tenses Column */}
              <div className="terminal-window border-accent/20">
                <div className="terminal-header bg-accent/5 border-accent/10">
                  <span className="text-[9px] md:text-[10px] font-mono text-accent font-bold uppercase tracking-widest">Temporal::Conjugations</span>
                </div>
                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                  {Object.entries(result.tenses).map(([tense, w]) => {
                    if (!w) return null;
                    return (
                      <div key={tense} className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border group hover:border-accent/30 transition-all">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider block truncate">{tense.replace(/([A-Z])/g, ' $1')}</span>
                          <p className="text-base md:text-lg font-mono font-bold text-foreground truncate">{w as string}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(w as string)}
                          className="p-2 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          {copiedWord === w ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center animate-fade-in-up">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-surface-1 border-2 border-border/50 flex items-center justify-center mb-6 md:mb-8 relative shrink-0">
                <Beaker size={40} className="md:w-12 md:h-12 text-muted-foreground/20" />
                <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl font-mono text-muted-foreground uppercase tracking-widest">Laboratory_Idle</h3>
              <p className="text-xs md:text-sm text-muted-foreground/40 max-w-[280px] md:max-w-sm font-mono mt-2">
                Initiate research by entering a word into the input buffer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WordChip = ({ word, onCopy, isCopied }: { word: string; onCopy: (w: string) => void; isCopied: boolean }) => (
  <button
    onClick={() => onCopy(word)}
    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95"
  >
    <span className="font-mono text-xs md:text-sm font-medium">{word}</span>
    {isCopied ? (
      <Check size={12} className="text-primary animate-in zoom-in" />
    ) : (
      <Copy size={12} className="text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all" />
    )}
  </button>
);

export default Lab;
