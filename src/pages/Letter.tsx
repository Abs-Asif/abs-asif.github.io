import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { wrapText } from "@/lib/font-utils";
import { compressAndEncryptForUrl, decryptAndDecompressFromUrl } from "@/lib/encryption";

const Letter = () => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize from URL
  useEffect(() => {
    const hash = window.location.search.substring(1);
    if (hash) {
      try {
        const decoded = decodeURIComponent(hash);
        const decrypted = decryptAndDecompressFromUrl(decoded);
        if (decrypted) {
          setText(decrypted);
        }
      } catch (e) {
        console.error("Failed to decode URL hash", e);
      }
    }
  }, []);

  // Update URL hash when text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (newText.trim()) {
      const encrypted = compressAndEncryptForUrl(newText);
      const encoded = encodeURIComponent(encrypted);
      const newUrl = `${window.location.pathname}?${encoded}`;
      window.history.replaceState(null, "", newUrl);
    } else {
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 md:p-16 lg:p-24 flex flex-col">
      <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="relative group border-r border-slate-100 pr-12 hidden lg:block">
          <textarea
            ref={textareaRef}
            className="w-full h-full min-h-[70vh] resize-none border-none outline-none focus:ring-0 p-0 text-lg md:text-xl font-serif leading-relaxed"
            placeholder="Write your letter here..."
            value={text}
            onChange={handleTextChange}
            autoFocus
          />
        </div>

        {/* Mobile Editor / Always visible preview */}
        <div className="lg:hidden mb-8 border-b border-slate-100 pb-8">
           <textarea
            className="w-full h-48 resize-none border rounded-xl p-4 text-lg font-serif leading-relaxed bg-slate-50 focus:bg-white transition-colors"
            placeholder="Write your letter here..."
            value={text}
            onChange={handleTextChange}
          />
        </div>

        <div className="prose prose-slate md:prose-xl max-w-none prose-headings:font-serif prose-p:font-serif prose-li:font-serif text-justify break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({children}) => <p dir="auto" className="mb-6 leading-relaxed text-slate-800">{wrapText(children)}</p>,
              h1: ({children}) => <h1 dir="auto" className="text-4xl font-bold mb-8 text-slate-900">{wrapText(children)}</h1>,
              h2: ({children}) => <h2 dir="auto" className="text-3xl font-bold mb-6 text-slate-900">{wrapText(children)}</h2>,
              h3: ({children}) => <h3 dir="auto" className="text-2xl font-bold mb-4 text-slate-900">{wrapText(children)}</h3>,
              ul: ({children}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-800">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-slate-800">{children}</ol>,
              li: ({children}) => <li dir="auto" className="mb-1">{wrapText(children)}</li>,
              code: ({node, inline, className, children, ...props}: any) => {
                if (inline) {
                  return (
                    <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="block text-inherit font-mono" {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({children}) => (
                <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto mb-8 text-sm font-mono shadow-inner border border-slate-800">
                  {children}
                </pre>
              ),
              img: ({src, alt}) => (
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full h-auto rounded-2xl mx-auto my-8 shadow-md"
                />
              ),
              strong: ({children}) => <strong className="font-bold">{wrapText(children)}</strong>,
              em: ({children}) => <em className="italic">{wrapText(children)}</em>,
            }}
          >
            {text || "*Your markdown will appear here...*"}
          </ReactMarkdown>
        </div>
      </div>

      {/* Floating help/status */}
      <div className="fixed bottom-8 right-8 text-[10px] uppercase tracking-widest text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Changes are saved in the URL
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .prose {
          font-family: 'EB Garamond', serif;
        }
        .prose p {
          text-align: justify;
          text-justify: inter-word;
        }
      `}} />
    </div>
  );
};

export default Letter;
