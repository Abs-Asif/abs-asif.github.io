import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { buildEditorExtensions } from "@/lib/editor-extensions";
import { Printer, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";

const Book = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [generating, setGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: buildEditorExtensions("Start writing your book here..."),
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
    container.className = "font-mixed";
    container.style.fontFamily =
      "'EB Garamond', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', serif";
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
          font-size: 32pt;
          font-weight: 400;
          line-height: 1.15;
          margin: 0 0 24pt 0;
          letter-spacing: -0.01em;
          word-wrap: break-word;
          max-width: 100%;
        ">${escapeHtml(safeTitle)}</h1>
        ${
          safeAuthor
            ? `<p style="
                font-size: 13pt;
                font-weight: 400;
                margin: 0;
                color: #334155;
              ">${escapeHtml(safeAuthor)}</p>`
            : ""
        }
      </div>
      <div class="book-body tiptap" style="
        font-size: 12pt;
        line-height: 1.7;
        text-align: justify;
      ">${bodyHtml}</div>
    `;

    container.style.width = "170mm";
    container.style.minHeight = "297mm";
    container.style.display = "block";
    container.style.position = "absolute";
    container.style.left = "-10000px";
    container.style.top = "0";
    document.body.appendChild(container);

    // Wait for web fonts (Kalpurush, Scheherazade, EB Garamond) so html2canvas captures them properly
    try {
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
    } catch {}

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
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
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