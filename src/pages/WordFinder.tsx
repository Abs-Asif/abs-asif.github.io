import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Footer } from "@/components/Footer";

// Comprehensive list of prefixes and suffixes (approx 200)
const PREFIXES = [
  "un", "re", "pre", "mis", "dis", "non", "anti", "de", "extra", "inter",
  "intra", "over", "under", "super", "sub", "post", "semi", "tri", "bi", "uni",
  "trans", "poly", "mono", "multi", "auto", "co", "con", "com", "de", "dis",
  "ex", "fore", "in", "im", "il", "ir", "mid", "non", "pre", "pro",
  "sub", "super", "trans", "ultra", "under", "hyper", "hypo", "infra", "macro", "micro",
  "peri", "tele", "a", "ab", "ad", "ante", "be", "bene", "circum", "contra",
  "counter", "dia", "dys", "em", "en", "epi", "eu", "hetero", "homo", "hyper",
  "hypo", "ill", "imm", "inn", "irr", "mal", "mega", "meta", "neo", "omni",
  "pan", "para", "per", "peri", "proto", "pseudo", "retro", "sur", "sym", "syn",
  "vice", "with"
];

const SUFFIXES = [
  "ing", "ed", "ly", "er", "est", "ion", "tion", "ation", "ition", "able",
  "ible", "al", "ial", "ess", "ment", "ness", "ful", "less", "ship", "ity",
  "ty", "en", "ize", "ise", "fy", "ify", "ic", "ist", "ism", "ive",
  "ous", "eous", "ious", "ance", "ence", "ant", "ent", "ary", "ery", "ory",
  "cy", "dom", "hood", "ish", "ive", "ize", "logy", "oid", "some", "ward",
  "wise", "age", "an", "ian", "ance", "ancy", "ate", "cian", "cracy", "crat",
  "cule", "ee", "eer", "ery", "esque", "fold", "form", "gram", "graph", "ia",
  "iana", "iatry", "ics", "id", "ile", "ine", "ish", "ism", "ist", "ite",
  "itis", "ity", "ium", "kin", "latry", "let", "ling", "ly", "mania", "ment",
  "most", "oid", "ology", "oma", "onym", "opia", "opsy", "osis", "path", "pathy",
  "phile", "phobia", "phone", "phyte", "plegia", "plegic", "pnea", "pod", "pode", "scope",
  "scopy", "scribe", "script", "sect", "ship", "sion", "some", "sophic", "sophy", "stat",
  "tropic", "tropy", "ule", "ward", "ways", "wise", "y"
];

interface WordResult {
  word: string;
  partsOfSpeech: string[];
}

const WordFinder = () => {
  const [inputWord, setInputWord] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<WordResult[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalToCheck, setTotalToCheck] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkWord = async (word: string): Promise<WordResult | null> => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) return null;
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const posSet = new Set<string>();
      data.forEach((entry: any) => {
        entry.meanings?.forEach((meaning: any) => {
          if (meaning.partOfSpeech) posSet.add(meaning.partOfSpeech);
        });
      });

      if (posSet.size === 0) return null;
      return { word, partsOfSpeech: Array.from(posSet) };
    } catch (e) {
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord.trim()) return;

    setIsSearching(true);
    setResults([]);
    setError(null);
    setCheckedCount(0);

    const baseWord = inputWord.trim().toLowerCase();
    const permutations = new Set<string>();
    permutations.add(baseWord);

    PREFIXES.forEach(p => permutations.add(p + baseWord));
    SUFFIXES.forEach(s => permutations.add(baseWord + s));
    // Sample combinations to keep it sane but comprehensive
    PREFIXES.slice(0, 20).forEach(p => {
      SUFFIXES.slice(0, 20).forEach(s => {
        permutations.add(p + baseWord + s);
      });
    });

    const permArray = Array.from(permutations);
    setTotalToCheck(permArray.length);

    // Check base word first
    const baseResult = await checkWord(baseWord);
    if (baseResult) {
      setResults([baseResult]);
    }
    setCheckedCount(1);

    // Process in batches with delay to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < permArray.length; i += batchSize) {
      if (permArray[i] === baseWord) continue;

      const batch = permArray.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(w => checkWord(w)));

      const validResults = batchResults.filter((r): r is WordResult => r !== null);
      if (validResults.length > 0) {
        setResults(prev => {
           const existing = new Set(prev.map(r => r.word));
           const news = validResults.filter(r => !existing.has(r.word));
           return [...prev, ...news];
        });
      }

      setCheckedCount(prev => Math.min(prev + batchSize, permArray.length));
      await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting protection
    }

    setIsSearching(false);
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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Word Finder</h1>
            <p className="text-muted-foreground">Find derived words by adding affixes.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <div className="relative">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Enter a base word (e.g., 'play')"
              className="w-full bg-secondary/20 p-5 pl-14 rounded-3xl border-none outline-none focus:ring-2 ring-m3-primary/30 transition-all text-lg font-semibold"
              disabled={isSearching}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
            <button
              type="submit"
              disabled={isSearching || !inputWord.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-m3-primary text-primary-foreground px-6 py-2 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Check"}
            </button>
          </div>

          {isSearching && (
            <div className="px-4">
              <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-m3-primary transition-all duration-300"
                  style={{ width: `${(checkedCount / totalToCheck) * 100}%` }}
                />
              </div>
              <p className="text-[10px] uppercase font-bold opacity-40 mt-2 text-center tracking-widest">
                Checking variations: {checkedCount} / {totalToCheck}
              </p>
            </div>
          )}
        </form>

        <div className="space-y-4">
          {results.length > 0 && (
            <div className="animate-fade-in-up">
              <h2 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4 ml-2">Valid Words Found</h2>
              <div className="grid gap-3">
                {results.map((res, i) => (
                  <div
                    key={res.word}
                    className="bg-m3-secondary-container/30 p-5 rounded-[2rem] border border-m3-secondary/10 flex items-center justify-between group hover:bg-m3-secondary-container/50 transition-all animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div>
                      <div className="text-xl font-bold text-m3-on-secondary-container flex items-center gap-2">
                        {res.word}
                        <CheckCircle2 size={16} className="text-m3-tertiary" />
                      </div>
                      <div className="flex gap-2 mt-1">
                        {res.partsOfSpeech.map(pos => (
                          <span key={pos} className="text-[10px] uppercase font-black bg-m3-secondary/10 px-2 py-0.5 rounded-md opacity-60">
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isSearching && results.length === 0 && inputWord && (
            <div className="text-center py-6 opacity-40 animate-fade-in-up">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p className="font-bold">No valid derived words found yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WordFinder;
