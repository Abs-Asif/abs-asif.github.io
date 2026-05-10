import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2, Book, Volume2 } from "lucide-react";
import { Footer } from "@/components/Footer";

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

const COMMON_WORDS = [
  "resilient", "eloquent", "ubiquitous", "ephemeral", "paradigm",
  "serendipity", "aesthetic", "pragmatic", "tenacious", "magnanimous",
  "meticulous", "venerable", "gregarious", "intrinsic", "capricious",
  "ebullient", "fastidious", "incisive", "laconic", "nebulous"
];

const VocabularyBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomWord = async () => {
    setLoading(true);
    setError(null);
    const randomWord = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
      if (!response.ok) {
        throw new Error("Failed to fetch word.");
      }
      const data = await response.json();
      setResult(data[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomWord();
  }, []);

  const playAudio = () => {
    const audioUrl = result?.phonetics.find(p => p.audio)?.audio;
    if (audioUrl) {
      new Audio(audioUrl).play();
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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Vocabulary Builder</h1>
            <p className="text-muted-foreground">Learn a new word every day.</p>
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={fetchRandomWord}
            disabled={loading}
            className="flex items-center gap-2 bg-m3-primary text-m3-on-primary px-8 py-4 rounded-[2rem] font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
            Get Random Word
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-6 rounded-[2rem] border border-destructive/20 animate-fade-in-up text-center">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="bg-m3-secondary-container/20 rounded-[3rem] border border-m3-secondary/10 p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Book size={120} />
              </div>

              <div className="flex flex-col items-center gap-4 relative z-10">
                <h2 className="text-6xl font-black capitalize tracking-tighter text-m3-secondary">
                  {result.word}
                </h2>
                <div className="flex items-center gap-4">
                  {result.phonetic && (
                    <span className="text-xl opacity-60 font-serif italic">{result.phonetic}</span>
                  )}
                  {result.phonetics.some(p => p.audio) && (
                    <button
                      onClick={playAudio}
                      className="p-3 bg-m3-secondary/10 rounded-full text-m3-secondary hover:bg-m3-secondary/20 transition-colors"
                    >
                      <Volume2 size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {result.meanings.map((meaning, mIdx) => (
                <div key={mIdx} className="bg-background border border-border rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-m3-primary/10 text-m3-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      {meaning.partOfSpeech}
                    </span>
                    <div className="h-[1px] flex-grow bg-border"></div>
                  </div>

                  <div className="space-y-6">
                    {meaning.definitions.slice(0, 2).map((def, dIdx) => (
                      <div key={dIdx} className="space-y-3">
                        <p className="text-lg leading-relaxed font-medium">
                          {def.definition}
                        </p>
                        {def.example && (
                          <p className="text-muted-foreground italic pl-4 border-l-2 border-m3-primary/20">
                            "{def.example}"
                          </p>
                        )}
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

export default VocabularyBuilder;
