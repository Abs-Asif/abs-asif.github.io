import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, Eye, EyeOff } from "lucide-react";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

interface POSData {
  word: string;
  partsOfSpeech: string[];
  loading: boolean;
  error: boolean;
}

const posColors: Record<string, string> = {
  noun: "bg-blue-500",
  verb: "bg-green-500",
  adjective: "bg-yellow-500",
  adverb: "bg-purple-500",
  pronoun: "bg-pink-500",
  preposition: "bg-cyan-500",
  conjunction: "bg-indigo-500",
  interjection: "bg-teal-500",
  determiner: "bg-orange-500",
  unknown: "bg-red-500",
};

const posFullNames: Record<string, string> = {
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  pronoun: "Pronoun",
  preposition: "Preposition",
  conjunction: "Conjunction",
  interjection: "Interjection",
  determiner: "Determiner",
  unknown: "Unknown",
};

const PartsOfSpeechAdvanced = () => {
  const [text, setText] = useState("");
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [wordCache, setWordCache] = useState<Record<string, POSData>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);

  const words = useMemo(() => {
    return text.split(/(\s+)/);
  }, [text]);

  const uniqueWords = useMemo(() => {
    return Array.from(new Set(
      text.toLowerCase()
        .split(/[^a-zA-Z']+/)
        .filter(w => w.length > 0)
    ));
  }, [text]);

  useEffect(() => {
    uniqueWords.forEach(word => {
      if (!wordCache[word]) {
        fetchWordData(word);
      }
    });
  }, [uniqueWords]);

  const fetchWordData = async (word: string) => {
    setWordCache(prev => ({
      ...prev,
      [word]: { word, partsOfSpeech: [], loading: true, error: false }
    }));

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error("Not found");
      }
      const data = await response.json();
      const meanings = data[0].meanings;
      const partsOfSpeech = Array.from(new Set(meanings.map((m: any) => m.partOfSpeech.toLowerCase()))) as string[];

      setWordCache(prev => ({
        ...prev,
        [word]: { word, partsOfSpeech, loading: false, error: false }
      }));
    } catch (err) {
      setWordCache(prev => ({
        ...prev,
        [word]: { word, partsOfSpeech: ["unknown"], loading: false, error: true }
      }));
    }
  };

  // Sync scroll
  const handleScroll = () => {
    if (textareaRef.current && renderRef.current) {
      renderRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Link
              to="/tools"
              className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
              aria-label="Back to tools"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">POS Advanced</h1>
              <p className="text-muted-foreground text-sm md:text-base">Sentence analyzer.</p>
            </div>
          </div>

          <button
            onClick={() => setImmersiveMode(!immersiveMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium",
              immersiveMode ? "bg-m3-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}
          >
            {immersiveMode ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="hidden sm:inline">{immersiveMode ? "Normal Mode" : "Immersive Mode"}</span>
          </button>
        </div>

        <div className="relative w-full aspect-[3/4] md:aspect-[16/10] bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-border shadow-xl overflow-hidden group">
          {/* Paper lines background */}
          <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
               style={{
                 backgroundImage: 'linear-gradient(#000 1px, transparent 1px)',
                 backgroundSize: '100% 3rem',
                 marginTop: '2.8rem'
               }}
          />

          {/* Rendering Layer */}
          <div
            ref={renderRef}
            className="absolute inset-0 p-8 md:p-12 text-xl md:text-2xl leading-[3rem] break-words whitespace-pre-wrap overflow-y-auto pointer-events-none font-serif"
          >
            {words.map((part, i) => {
              const cleanWord = part.toLowerCase().replace(/[^a-zA-Z']+/, "");
              const data = cleanWord ? wordCache[cleanWord] : null;

              if (!cleanWord || !data) {
                return <span key={i}>{part}</span>;
              }

              return (
                <span key={i} className="relative inline-block">
                  <span className={cn(immersiveMode && "text-transparent")}>{part}</span>
                  {immersiveMode && (
                    <span className="absolute left-0 top-0 text-foreground">
                      {part}
                    </span>
                  )}

                  {/* Underlines */}
                  <div className="absolute left-0 right-0 top-[2.2rem] flex flex-col gap-[2px]">
                    {data.loading ? (
                      <div className="h-1 bg-muted animate-pulse rounded-full" />
                    ) : (
                      data.partsOfSpeech.map((pos, idx) => (
                        <div key={idx} className="relative group/pos">
                          <div className={cn("h-1 rounded-full", posColors[pos] || "bg-gray-400")} />
                          {immersiveMode && (
                            <div
                              className="absolute left-1/2 -translate-x-1/2 opacity-100 transition-all pointer-events-none flex flex-col items-center"
                              style={{ top: `-${3 + (idx * 2)}rem` }}
                            >
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-sm",
                                posColors[pos] || "bg-gray-400"
                              )}>
                                {posFullNames[pos] || pos}
                              </span>
                              <div className={cn("w-px flex-grow", posColors[pos] || "bg-gray-400")} style={{ height: `${1.5 + (idx * 2)}rem` }} />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </span>
              );
            })}
            {/* Caret placeholder for when text ends with space */}
            {text.endsWith(" ") && <span>&nbsp;</span>}
          </div>

          {/* Input Layer */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onScroll={handleScroll}
            placeholder="Type your sentence here..."
            className="absolute inset-0 w-full h-full p-8 md:p-12 text-xl md:text-2xl leading-[3rem] bg-transparent border-none outline-none resize-none font-serif text-transparent caret-foreground selection:bg-m3-primary/30"
            spellCheck={false}
          />
        </div>

        {/* Legend */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          {Object.entries(posFullNames).map(([key, name]) => (
            <div key={key} className="flex items-center gap-2 bg-secondary/20 p-2 rounded-xl border border-border/50">
              <div className={cn("w-3 h-3 rounded-full", posColors[key])} />
              <span className="text-xs font-medium">{name}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 p-4 bg-m3-primary-container/20 rounded-2xl text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
          <Info size={18} className="shrink-0 mt-0.5 text-m3-primary" />
          <p>
            This tool analyzes your sentence in real-time. Each word is underlined based on its part of speech.
            Enable <strong>Immersive Mode</strong> to see tags and clear distractions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartsOfSpeechAdvanced;
