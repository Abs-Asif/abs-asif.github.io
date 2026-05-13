import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Quote as QuoteIcon, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";

interface Quote {
  q: string;
  a: string;
}

const QuoteGenerator = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Using a proxy or direct API if CORS allows, ZenQuotes often needs a proxy for browser fetch
      // Falling back to a static list if it fails or using a different open API
      const response = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent("https://zenquotes.io/api/random"));
      const data = await response.json();
      setQuote(data[0]);
    } catch (error) {
      console.error("Failed to fetch quote");
      // Fallback quote
      setQuote({ q: "The only way to do great work is to love what you do.", a: "Steve Jobs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Quotes</h1>
            <p className="text-muted-foreground">Daily inspiration and wisdom.</p>
          </div>
        </div>

        <div className="bg-m3-primary-container/20 rounded-[3rem] p-10 md:p-16 relative overflow-hidden animate-fade-in-up min-h-[400px] flex flex-col justify-center border border-m3-primary/10">
          <QuoteIcon className="absolute -top-4 -left-4 text-m3-primary/10" size={160} />

          <div className="relative z-10 space-y-10 text-center">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 size={48} className="animate-spin text-m3-primary" />
              </div>
            ) : quote ? (
              <>
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight text-foreground italic font-serif">
                    "{quote.q}"
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="h-[1px] w-12 bg-m3-primary/40 mb-4"></div>
                    <p className="text-xl font-black text-m3-primary uppercase tracking-[0.2em]">
                      — {quote.a}
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex justify-center animate-fade-in-up">
          <button
            onClick={fetchQuote}
            disabled={loading}
            className="flex items-center gap-3 bg-m3-primary text-m3-on-primary px-10 py-5 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
            Inspire Me
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuoteGenerator;
