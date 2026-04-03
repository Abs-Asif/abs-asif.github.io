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
    If a form is not applicable, omit the field or return an empty array/null. Be precise.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
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
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const content = JSON.parse(data.choices[0].message.content);
        setResult(content);
      } else {
        throw new Error(data.error?.message || "Failed to process the word.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during analysis. Please check your API key or try again.");
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
      <div className="max-w-4xl mx-auto pt-10 px-4">
        {/* Header */}
        <header className="flex items-center gap-6 mb-12 animate-fade-in-up">
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-xl bg-surface-1 border-2 border-border hover:border-primary transition-all active:scale-95 group shrink-0"
          >
            <ArrowLeft size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <Beaker size={28} className="text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold font-mono tracking-tighter uppercase italic">
                The <span className="gradient-text">Laboratory</span>
              </h1>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
                {"// Word Morphological Research Unit v1.0.4"}
              </p>
            </div>
          </div>
        </header>

        {/* Input Terminal */}
        <div className="terminal-window mb-12 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="terminal-header">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-primary/50" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground ml-4 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={10} /> input_word.sh
            </span>
          </div>
          <div className="p-8 space-y-6 bg-surface-1">
            <div className="relative group">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeWord()}
                placeholder="Enter a word to analyze..."
                className="w-full bg-background border-2 border-border p-5 rounded-xl font-mono text-xl focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30"
              />
              <button
                onClick={analyzeWord}
                disabled={isLoading || !word.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-12 px-6 rounded-lg bg-primary text-primary-foreground font-mono font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all shadow-[4px_4px_0px_0px_#14532d]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isLoading ? "PROCESSING..." : "PROCESS"}
              </button>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/60 italic">
              * Using Qwen-3.6-Plus Research Model for morphological analysis.
            </p>
          </div>
        </div>

        {/* Results Area */}
        <div className="min-h-[400px]">
          {error && (
            <div className="terminal-window p-8 border-destructive/50 bg-destructive/5 animate-fade-in-up">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-destructive shrink-0" size={24} />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-destructive font-mono uppercase tracking-tighter italic">Linguistic_Kernel_Panic</h3>
                  <p className="text-muted-foreground font-mono text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && result && (
            <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
              {/* Parts of Speech Column */}
              <div className="terminal-window border-primary/20">
                <div className="terminal-header bg-primary/5 border-primary/10">
                  <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Morphology::Variants</span>
                </div>
                <div className="p-6 space-y-6">
                  {Object.entries(result.partsOfSpeech).map(([pos, items]) => {
                    if (!items || (Array.isArray(items) && items.length === 0)) return null;

                    const isOther = pos === 'other';
                    if (isOther) {
                      return Object.entries(items).map(([subPos, subItems]) => (
                        <div key={subPos} className="space-y-3">
                          <h4 className="text-xs font-mono text-primary/70 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {subPos}
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
                        <h4 className="text-xs font-mono text-primary/70 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {pos}
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
                  <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-widest">Temporal::Conjugations</span>
                </div>
                <div className="p-6 space-y-4">
                  {Object.entries(result.tenses).map(([tense, w]) => {
                    if (!w) return null;
                    return (
                      <div key={tense} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border group hover:border-accent/30 transition-all">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{tense.replace(/([A-Z])/g, ' $1')}</span>
                          <p className="text-lg font-mono font-bold text-foreground">{w as string}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(w as string)}
                          className="p-2 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all opacity-0 group-hover:opacity-100"
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
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-3xl bg-surface-1 border-2 border-border/50 flex items-center justify-center mb-8 relative">
                <Beaker size={48} className="text-muted-foreground/20" />
                <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-pulse" />
              </div>
              <h3 className="text-2xl font-mono text-muted-foreground uppercase tracking-widest">Laboratory_Idle</h3>
              <p className="text-sm text-muted-foreground/40 max-w-sm font-mono mt-2">
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
    <span className="font-mono text-sm font-medium">{word}</span>
    {isCopied ? (
      <Check size={12} className="text-primary animate-in zoom-in" />
    ) : (
      <Copy size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
    )}
  </button>
);

export default Lab;
