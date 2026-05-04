
import React, { useState } from "react";
import { Clipboard, X, Search, ArrowRight } from "lucide-react";
import { getMultiLayerDecryptionSteps } from "@/lib/encryption";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LetterRaw = () => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<{ level: number; data: string; decrypted: string }[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheck = () => {
    if (!input.trim()) return;
    const resultSteps = getMultiLayerDecryptionSteps(input);
    setSteps(resultSteps);
    setHasChecked(true);
  };

  const handleClear = () => {
    setInput("");
    setSteps([]);
    setHasChecked(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error("Failed to read clipboard", err);
    }
  };

  const finalResult = steps.length > 0 ? steps[steps.length - 1].decrypted : "";

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-20 font-mixed">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* Left/Top Section: Input and Layers */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Letter Inspector</h1>
            <p className="text-slate-500">Paste an encrypted URL or code to see the raw content.</p>
          </div>

          {/* Input Form */}
          <div className="relative group">
            <textarea
              className="w-full min-h-[150px] p-4 pr-12 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all resize-none font-mono text-sm"
              placeholder="Paste URL or encrypted code here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleClear}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Clear"
              >
                <X size={18} className="text-slate-500" />
              </button>
              <button
                onClick={handlePaste}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Paste"
              >
                <Clipboard size={18} className="text-slate-500" />
              </button>
            </div>
          </div>

          <button
            onClick={handleCheck}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Check Content
          </button>

          {/* Decryption Layers */}
          {hasChecked && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold">Decryption Layers</h2>
              {steps.length === 0 ? (
                <p className="text-red-500 text-sm">Failed to decrypt. Please check the input.</p>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 shrink-0">
                          {step.level === 0 ? "Legacy" : step.level.toString().padStart(3, "0")}
                        </div>
                        {index < steps.length - 1 && (
                          <div className="w-0.5 h-12 bg-slate-100" />
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <span className="text-[10px] uppercase tracking-widest font-bold">
                            {index === steps.length - 1 ? "Final Content" : "Next Level Code"}
                          </span>
                          <ArrowRight size={12} />
                        </div>
                        {step.level !== 1 && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 font-mono break-all whitespace-pre-wrap">
                            {step.decrypted}
                          </div>
                        )}
                        {step.level === 1 && (
                          <div className="text-[10px] text-slate-300 italic">
                            Content hidden for final step
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right/Bottom Section: Result */}
        <div className="flex-1">
          <div className="sticky top-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Result</h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] uppercase tracking-widest font-bold">
                Read Only
              </span>
            </div>

            <div className="min-h-[60vh] p-8 rounded-3xl border border-slate-100 bg-white shadow-sm overflow-auto">
              {finalResult ? (
                <div className="prose prose-xl md:prose-2xl max-w-none tiptap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {finalResult}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 italic">
                  No content to display
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterRaw;
