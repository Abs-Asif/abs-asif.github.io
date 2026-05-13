import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Loader2, Copy, BookOpen } from "lucide-react";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

interface DictionaryEntry {
  word: string;
  meanings: Array<{
    partOfSpeech: string;
    synonyms: string[];
    antonyms: string[];
  }>;
}

const SynonymFinder = () => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied "${text}" to clipboard`);
  };

  const allSynonyms = result?.meanings.flatMap(m => m.synonyms) || [];
  const allAntonyms = result?.meanings.flatMap(m => m.antonyms) || [];

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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Synonym Finder</h1>
            <p className="text-muted-foreground">Find synonyms and antonyms for any word.</p>
          </div>
        </div>

        <form onSubmit={searchWord} className="mb-8 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <div className="relative group">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter a word..."
              className="w-full bg-m3-secondary-container/20 border-2 border-transparent focus:border-m3-secondary/30 p-6 rounded-[2rem] outline-none text-xl font-medium transition-all pr-16 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 aspect-square bg-m3-secondary text-m3-on-secondary rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
            </div>

            <div className="grid gap-6">
              <div className="bg-m3-primary-container/20 rounded-[2.5rem] border border-m3-primary/10 p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="text-m3-primary" size={20} />
                  Synonyms
                </h3>
                {allSynonyms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(allSynonyms)).map((syn, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(syn)}
                        className="bg-m3-primary/10 hover:bg-m3-primary/20 text-m3-primary px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 group"
                      >
                        {syn}
                        <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No synonyms found for this word.</p>
                )}
              </div>

              <div className="bg-m3-tertiary-container/20 rounded-[2.5rem] border border-m3-tertiary/10 p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="text-m3-tertiary" size={20} />
                  Antonyms
                </h3>
                {allAntonyms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(allAntonyms)).map((ant, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(ant)}
                        className="bg-m3-tertiary/10 hover:bg-m3-tertiary/20 text-m3-tertiary px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 group"
                      >
                        {ant}
                        <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No antonyms found for this word.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SynonymFinder;
