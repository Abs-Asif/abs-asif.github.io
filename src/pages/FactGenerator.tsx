import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2, Lightbulb } from "lucide-react";
import { Footer } from "@/components/Footer";

const FactGenerator = () => {
  const [fact, setFact] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFact = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
      const data = await response.json();
      setFact(data.text);
    } catch (error) {
      console.error("Failed to fetch fact");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Random Facts</h1>
            <p className="text-muted-foreground">Interesting but useless facts.</p>
          </div>
        </div>

        <div className="bg-m3-secondary-container/20 rounded-[3rem] p-10 md:p-16 relative overflow-hidden animate-fade-in-up min-h-[300px] flex flex-col justify-center border border-m3-secondary/10">
          <div className="relative z-10 space-y-8 text-center">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 size={48} className="animate-spin text-m3-secondary" />
              </div>
            ) : fact ? (
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-m3-secondary/10 rounded-full flex items-center justify-center text-m3-secondary mb-8">
                  <Lightbulb size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
                  {fact}
                </h2>
              </div>
            ) : (
              <p>Failed to load fact. Try again!</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center animate-fade-in-up">
          <button
            onClick={fetchFact}
            disabled={loading}
            className="flex items-center gap-3 bg-m3-secondary text-m3-on-secondary px-10 py-5 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
            Get Another Fact
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FactGenerator;
