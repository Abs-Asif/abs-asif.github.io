import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Loader2, Type, BookOpen, MessageSquare } from "lucide-react";
import { Footer } from "@/components/Footer";

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

const PartsOfSpeech = () => {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim().toLowerCase()}`);
      if (!response.ok) {
        throw new Error("Word not found. Please try another one.");
      }
      const data = await response.json();
      setResult(data[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12 flex items-center gap-6 animate-fade-in-up">
          <Link
            to="/tools"
            className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
            aria-label="Back to tools"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Parts of Speech</h1>
            <p className="text-muted-foreground">Dictionary and grammar lookup.</p>
          </div>
        </div>

        <form onSubmit={searchWord} className="mb-12 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <div className="relative group">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter a word to search..."
              className="w-full bg-m3-primary-container/20 border-2 border-transparent focus:border-m3-primary/30 p-6 rounded-[2rem] outline-none text-xl font-medium transition-all pr-16 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 aspect-square bg-m3-primary text-primary-foreground rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-destructive/10 text-destructive p-6 rounded-[2rem] border border-destructive/20 animate-fade-in-up">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <div className="flex items-baseline gap-4 mb-2">
              <h2 className="text-5xl font-black capitalize tracking-tighter">{result.word}</h2>
              {result.phonetic && (
                <span className="text-xl opacity-40 font-serif italic">{result.phonetic}</span>
              )}
            </div>

            <div className="grid gap-6">
              {result.meanings.map((meaning, mIdx) => (
                <div key={mIdx} className="bg-m3-tertiary-container/20 rounded-[2.5rem] border border-m3-tertiary/10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-m3-tertiary text-m3-on-tertiary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      {meaning.partOfSpeech}
                    </span>
                    <div className="h-[2px] flex-grow bg-m3-tertiary/10"></div>
                  </div>

                  <div className="space-y-6">
                    {meaning.definitions.map((def, dIdx) => (
                      <div key={dIdx} className="group">
                        <div className="flex gap-4">
                          <div className="mt-1 bg-m3-tertiary/10 p-2 rounded-xl h-fit">
                            <BookOpen size={16} className="text-m3-tertiary" />
                          </div>
                          <div className="space-y-3">
                            <p className="text-lg leading-relaxed opacity-90">
                              {def.definition}
                            </p>
                            {def.example && (
                              <div className="flex gap-3 bg-white/40 p-4 rounded-2xl border border-m3-tertiary/5 italic opacity-70 text-sm">
                                <MessageSquare size={14} className="shrink-0 mt-1" />
                                <p>"{def.example}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PartsOfSpeech;
