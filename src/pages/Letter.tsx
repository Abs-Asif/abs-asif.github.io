import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { compressAndEncryptForUrl, decryptAndDecompressFromUrl } from "@/lib/encryption";

const Letter = () => {
  const isInitialMount = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-2xl bg-slate-900 text-slate-100 p-6 font-mono text-sm shadow-inner border border-slate-800",
          },
        },
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        tightListClass: "tight",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-2xl mx-auto my-8 shadow-md",
        },
      }),
      Placeholder.configure({
        placeholder: "Write your letter here...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "justify",
      }),
    ],
    editorProps: {
      attributes: {
        class: "font-mixed prose-lg md:prose-xl max-w-none focus:outline-none min-h-[70vh]",
        dir: "auto",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      updateUrl(markdown);
    },
  });

  const updateUrl = (markdown: string) => {
    if (markdown.trim()) {
      const encrypted = compressAndEncryptForUrl(markdown);
      const encoded = encodeURIComponent(encrypted);
      const newUrl = `${window.location.pathname}?${encoded}`;
      window.history.replaceState(null, "", newUrl);
    } else {
      const newUrl = `${window.location.pathname}`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  // Initialize from URL
  useEffect(() => {
    if (editor && isInitialMount.current) {
      const hash = window.location.search.substring(1);
      if (hash) {
        try {
          const decoded = decodeURIComponent(hash);
          const decrypted = decryptAndDecompressFromUrl(decoded);
          if (decrypted) {
            editor.commands.setContent(decrypted);
          }
        } catch (e) {
          console.error("Failed to decode URL hash", e);
        }
      }
      isInitialMount.current = false;
    }
  }, [editor]);

  return (
    <div className="min-h-screen bg-white p-8 md:p-16 lg:p-24 flex flex-col items-center">
      <div className="w-full max-w-4xl tiptap">
        <EditorContent editor={editor} />
      </div>

      {/* Floating status */}
      <div className="fixed bottom-8 right-8 text-[10px] uppercase tracking-widest text-slate-300 pointer-events-none opacity-50">
        Changes are saved in the URL
      </div>
    </div>
  );
};

export default Letter;
