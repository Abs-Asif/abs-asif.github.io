import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Laugh, Loader2, Quote } from "lucide-react";
import { Footer } from "@/components/Footer";

interface Joke {
  setup: string;
  punchline: string;
}

const JokeGenerator = () => {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJoke = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://official-joke-api.appspot.com/random_joke");
      const data = await response.json();
      setJoke(data);
    } catch (error) {
      console.error("Failed to fetch joke");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoke();
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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Joke Generator</h1>
            <p className="text-muted-foreground">Lighten up your mood.</p>
          </div>
        </div>

        <div className="bg-m3-tertiary-container/20 rounded-[3rem] p-10 md:p-16 relative overflow-hidden animate-fade-in-up min-h-[400px] flex flex-col justify-center border border-m3-tertiary/10">
          <Quote className="absolute top-8 left-8 text-m3-tertiary/20" size={64} />

          <div className="relative z-10 space-y-8 text-center">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 size={48} className="animate-spin text-m3-tertiary" />
              </div>
            ) : joke ? (
              <>
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
                    {joke.setup}
                  </h2>
                  <div className="h-[2px] w-24 bg-m3-tertiary/30 mx-auto"></div>
                  <p className="text-2xl md:text-3xl font-black text-m3-tertiary animate-fade-in-up" style={{ animationDelay: "1s", animationFillMode: "forwards", opacity: 0 }}>
                    {joke.punchline}
                  </p>
                </div>
              </>
            ) : (
              <p>Failed to load joke. Try again!</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center animate-fade-in-up">
          <button
            onClick={fetchJoke}
            disabled={loading}
            className="flex items-center gap-3 bg-m3-tertiary text-m3-on-tertiary px-10 py-5 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
            Another One
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JokeGenerator;
