import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Code, Play, Sparkles, Binary, Layout, FileJson, Loader2, Info } from "lucide-react";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "html" | "css" | "js" | "binary";

const Coder = () => {
  const [html, setHtml] = useState("<h1>Hello World</h1>");
  const [css, setCss] = useState("h1 { color: #6366f1; font-family: sans-serif; }");
  const [js, setJs] = useState("console.log('Hello from Coder!');");
  const [binaryContent, setBinaryContent] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [prevTextTab, setPrevTextTab] = useState<Tab>("html");
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const textToBinary = (str: string) => {
    return str
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");
  };

  const binaryToText = (bin: string) => {
    try {
      const cleanBin = bin.replace(/\s+/g, "");
      if (cleanBin.length % 8 !== 0) return null;

      let text = "";
      for (let i = 0; i < cleanBin.length; i += 8) {
        const byte = cleanBin.slice(i, i + 8);
        text += String.fromCharCode(parseInt(byte, 2));
      }
      return text;
    } catch (e) {
      return null;
    }
  };

  const updatePreview = () => {
    const combinedCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = combinedCode;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  // Sync binary when entering binary tab
  useEffect(() => {
    if (activeTab === "binary") {
      const source = prevTextTab === "html" ? html : prevTextTab === "css" ? css : js;
      setBinaryContent(textToBinary(source));
    } else {
      setPrevTextTab(activeTab);
    }
  }, [activeTab]);

  const handleAiAssistant = async () => {
    setIsLoading(true);
    const currentCode = `HTML:\n${html}\n\nCSS:\n${css}\n\nJS:\n${js}`;

    try {
      const response = await fetch("https://qwen.ai.unturf.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "hf.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF:Q4_K_M",
          messages: [
            {
              role: "system",
          content: "You are an expert web developer. Your task is to check the provided HTML, CSS, and JS code for errors and improvements. If there are errors, fix them. If the code is correct, complement it with useful additions. Return the result in a strict JSON format: {\"html\": \"...\", \"css\": \"...\", \"js\": \"...\", \"explanation\": \"...\"}. The 'explanation' should be a concise summary of what you changed or improved. Only return the JSON, nothing else."
            },
            {
              role: "user",
              content: currentCode
            }
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) throw new Error("AI Service unavailable");

      const data = await response.json();
      const content = data.choices[0].message.content;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.html) setHtml(parsed.html);
        if (parsed.css) setCss(parsed.css);
        if (parsed.js) setJs(parsed.js);

        if (parsed.explanation) {
          toast.info(parsed.explanation, {
            duration: Infinity,
          });
        }
        toast.success("Code updated by AI Assistant!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(error);
      toast.error("AI Assistant failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBinaryChange = (val: string) => {
    setBinaryContent(val);
    const text = binaryToText(val);
    if (text !== null) {
      if (prevTextTab === "html") setHtml(text);
      else if (prevTextTab === "css") setCss(text);
      else if (prevTextTab === "js") setJs(text);
    }
  };

  const getActiveContent = () => {
    if (activeTab === "html") return html;
    if (activeTab === "css") return css;
    if (activeTab === "js") return js;
    return binaryContent;
  };

  const handleContentChange = (val: string) => {
    if (activeTab === "html") setHtml(val);
    else if (activeTab === "css") setCss(val);
    else if (activeTab === "js") setJs(val);
    else handleBinaryChange(val);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-6xl mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Link
              to="/tools"
              className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
              aria-label="Back to tools"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Coder</h1>
              <p className="text-muted-foreground text-sm md:text-base">Binary, HTML, CSS & JS Environment.</p>
            </div>
          </div>

          <button
            onClick={handleAiAssistant}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-m3-primary text-primary-foreground hover:opacity-90 transition-all font-bold shadow-lg disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            AI Assistant
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] lg:h-[600px]">
          {/* Editor Side */}
          <div className="flex flex-col bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm h-[400px] lg:h-full">
            <div className="flex items-center gap-1 p-2 bg-muted/50 border-b border-border overflow-x-auto no-scrollbar">
              {(["html", "css", "js", "binary"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize flex items-center gap-2 shrink-0",
                    activeTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/50"
                  )}
                >
                  {tab === "html" && <Layout size={14} />}
                  {tab === "css" && <Code size={14} />}
                  {tab === "js" && <FileJson size={14} />}
                  {tab === "binary" && <Binary size={14} />}
                  {tab === "binary" ? `Binary (${prevTextTab})` : tab}
                </button>
              ))}
            </div>

            <div className="flex-grow relative">
              <textarea
                value={getActiveContent()}
                onChange={(e) => handleContentChange(e.target.value)}
                className={cn(
                  "absolute inset-0 w-full h-full p-6 font-mono text-sm resize-none outline-none focus:ring-0 selection:bg-m3-primary/30 transition-colors",
                  activeTab === "binary" ? "bg-zinc-950 text-green-500" : "bg-zinc-950 text-zinc-100"
                )}
                spellCheck={false}
                placeholder={activeTab === "binary" ? "Enter binary data (0s and 1s)..." : "Type your code here..."}
              />
            </div>
          </div>

          {/* Preview Side */}
          <div className="flex flex-col bg-white border border-border rounded-[2rem] overflow-hidden shadow-sm h-[400px] lg:h-full">
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-50 border-b border-border">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Play size={12} /> Live Preview
              </span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <iframe
              ref={iframeRef}
              title="preview"
              className="w-full h-full bg-white"
              sandbox="allow-scripts"
            />
          </div>
        </div>

        <div className="mt-8 p-6 bg-m3-secondary-container/20 rounded-3xl border border-border/50 text-sm text-muted-foreground animate-fade-in-up">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <Info size={18} className="text-m3-secondary" /> Features & Usage
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Switch between HTML, CSS, and JS tabs to build your page.</li>
            <li>The <strong>Binary</strong> tab allows you to edit the machine code of your active tab.</li>
            <li>Valid binary (8-bit blocks) will automatically sync back to your code.</li>
            <li>Click <strong>AI Assistant</strong> to automatically improve or complete your code using Qwen LLM.</li>
            <li>Preview updates in real-time as you type or sync from binary.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Coder;
