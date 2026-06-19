import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Printer, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";

const Book = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [generating, setGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded-2xl bg-slate-900 text-slate-100 p-6 font-mono text-sm shadow-inner border border-slate-800",
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
        placeholder: "Start writing your book here...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "justify",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "font-mixed prose-xl md:prose-2xl max-w-none focus:outline-none min-h-[70vh]",
        dir: "auto",
      },
    },
  });

  const handleDownloadPDF = async () => {
    if (!editor) return;
    setGenerating(true);

    const bodyHtml = editor.getHTML();
    const safeTitle = (title || "Untitled").trim();
    const safeAuthor = author.trim();

    // Build a hidden printable container
    const container = document.createElement("div");
    container.style.fontFamily = "'Inter', system-ui, sans-serif";
    container.style.color = "#0f172a";
    container.style.background = "#ffffff";
    container.innerHTML = `
      <div class="book-cover" style="
        page-break-after: always;
        break-after: page;
        height: 247mm;
        padding: 25mm 20mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-sizing: border-box;
      ">
        <h1 style="
          font-size: 48pt;
          font-weight: 400;
          line-height: 1.15;
          margin: 0 0 32pt 0;
          letter-spacing: -0.01em;
          word-wrap: break-word;
          max-width: 100%;
        ">${escapeHtml(safeTitle)}</h1>
        ${
          safeAuthor
            ? `<p style="
                font-size: 14pt;
                font-weight: 400;
                margin: 0;
                color: #334155;
              ">${escapeHtml(safeAuthor)}</p>`
            : ""
        }
      </div>
      <div class="book-body tiptap prose" style="
        font-size: 12pt;
        line-height: 1.7;
        text-align: justify;
      ">${bodyHtml}</div>
    `;

    container.style.width = "170mm";
    container.style.minHeight = "297mm";
    container.style.display = "block";

    try {
      await html2pdf()
        .set({
          margin: [20, 20, 20, 20], // mm
          filename: `${safeTitle.replace(/[^a-z0-9\u0980-\u09FF\s-]/gi, "").trim() || "book"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            windowWidth: container.scrollWidth,
            windowHeight: container.scrollHeight,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], before: ".book-body" },
        } as any)
        .from(container)
        .save();
    } finally {
      container.remove();
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-10 md:p-20 lg:p-32 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-10">
        {/* Title + Author */}
        <div className="space-y-4 border-b border-slate-100 pb-10">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title"
            className="w-full font-mixed text-4xl md:text-5xl font-medium tracking-tight bg-transparent border-none focus:outline-none placeholder:text-slate-300"
            dir="auto"
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="w-full font-mixed text-lg md:text-xl text-slate-600 bg-transparent border-none focus:outline-none placeholder:text-slate-300"
            dir="auto"
          />
        </div>

        {/* Editor */}
        <div className="tiptap" ref={contentRef}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Floating print button */}
      <button
        onClick={handleDownloadPDF}
        disabled={generating}
        className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        title="Download as PDF"
      >
        {generating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-medium">Generating...</span>
          </>
        ) : (
          <>
            <Printer size={18} />
            <span className="text-sm font-medium">Print / PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default Book;