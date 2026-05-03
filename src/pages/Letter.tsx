import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { wrapText } from "@/lib/font-utils";
import { encrypt, decrypt } from "@/lib/encryption";

const Letter = () => {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize from URL
  useEffect(() => {
    const hash = window.location.search.substring(1);
    if (hash) {
      try {
        const decoded = decodeURIComponent(hash);
        const decrypted = decrypt(decoded);
        if (decrypted) {
          setText(decrypted);
          setIsEditing(false);
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
      const encrypted = encrypt(newText);
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
      <div className="flex-1 w-full max-w-4xl mx-auto relative group">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full min-h-[70vh] resize-none border-none outline-none focus:ring-0 p-0 text-lg md:text-xl font-serif leading-relaxed"
            placeholder="Write your letter here..."
            value={text}
            onChange={handleTextChange}
            onBlur={() => text && setIsEditing(false)}
            autoFocus
          />
        ) : (
          <div
            className="w-full h-full min-h-[70vh] cursor-text prose prose-slate md:prose-xl max-w-none prose-headings:font-serif prose-p:font-serif prose-li:font-serif"
            onClick={() => setIsEditing(true)}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({children}) => <p className="mb-6 leading-relaxed text-slate-800">{wrapText(children)}</p>,
                h1: ({children}) => <h1 className="text-4xl font-bold mb-8 text-slate-900">{wrapText(children)}</h1>,
                h2: ({children}) => <h2 className="text-3xl font-bold mb-6 text-slate-900">{wrapText(children)}</h2>,
                h3: ({children}) => <h3 className="text-2xl font-bold mb-4 text-slate-900">{wrapText(children)}</h3>,
                li: ({children}) => <li className="mb-2 text-slate-800">{wrapText(children)}</li>,
                strong: ({children}) => <strong className="font-bold">{wrapText(children)}</strong>,
                em: ({children}) => <em className="italic">{wrapText(children)}</em>,
              }}
            >
              {text || "Click to start writing..."}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Floating help/status */}
      <div className="fixed bottom-8 right-8 text-[10px] uppercase tracking-widest text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Changes are saved in the URL
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .prose :not(pre) > code {
          font-family: inherit;
          background: transparent;
          padding: 0;
        }
        .prose {
          font-family: 'EB Garamond', serif;
        }
      `}} />
    </div>
  );
};

export default Letter;
