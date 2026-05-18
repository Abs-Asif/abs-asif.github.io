import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clipboard, ClipboardPaste, Sparkles, Trash2, Loader2, Check } from "lucide-react";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BanglishConverter = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      toast.success("Text pasted from clipboard");
    } catch (err) {
      toast.error("Failed to read clipboard");
    }
  };

  const handleClear = () => {
    setInput("");
    setResult("");
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const handleConvert = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("https://qwen.ai.unturf.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3.6:27b",
          messages: [
            {
              role: "system",
              content: `You are an expert Banglish to Bangla translator.
              Your task is to convert Banglish (Bengali written in Latin/English script) into proper, natural-sounding Bangla script.

              Examples:
              - "ami tumake chini" -> "আমি তোমাকে চিনি"
              - "kemon acho?" -> "কেমন আছো?"

              Rules:
              1. Return ONLY the translated Bangla text.
              2. Maintain the original meaning and punctuation.
              3. Do not add any explanations or notes.`
            },
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) throw new Error("AI Service unavailable");

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      setResult(content);
      toast.success("Conversion complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to convert Banglish. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Banglish Converter</h1>
            <p className="text-muted-foreground font-bangla">বাংলায় রূপান্তর করুন</p>
          </div>
        </div>

        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter Banglish text here... (e.g., ami bhalo achi)"
              className="w-full bg-m3-primary-container/20 border-2 border-transparent focus:border-m3-primary/30 p-6 rounded-[2rem] outline-none text-lg font-medium transition-all min-h-[150px] resize-none shadow-inner"
            />
            <div className="absolute right-4 bottom-4 flex gap-2">
              <button
                onClick={handlePaste}
                className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground transition-all active:scale-95"
                title="Paste"
              >
                <ClipboardPaste size={20} />
              </button>
              {input && (
                <button
                  onClick={handleClear}
                  className="p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all active:scale-95"
                  title="Clear"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={isLoading || !input.trim()}
            className="w-full py-4 rounded-[2rem] bg-m3-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
            Convert to Bangla
          </button>

          {/* Result Display Area */}
          {result && (
            <div className="mt-8 p-8 md:p-12 rounded-[2.5rem] bg-card border border-border shadow-md animate-fade-in-up overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-m3-primary/30" />
              <div className="absolute right-4 top-4">
                <button
                  onClick={handleCopy}
                  className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground transition-all active:scale-95 flex items-center gap-2"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={20} className="text-green-600" /> : <Clipboard size={20} />}
                  <span className="text-sm font-bold">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="text-3xl md:text-4xl font-bangla leading-relaxed text-foreground/90 mt-4">
                {result}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-m3-secondary-container/20 rounded-3xl border border-border/50 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-bold text-foreground mb-2">How it works</h3>
          <p className="leading-relaxed">
            This tool uses AI to intelligently convert Banglish (Bengali written with Latin characters) into proper Bangla script.
            It understands phonetic patterns and context to provide accurate conversions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BanglishConverter;
