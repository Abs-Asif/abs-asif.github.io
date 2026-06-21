import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { buildEditorExtensions } from "@/lib/editor-extensions";
import { Printer, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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

    // A5 page dimensions (mm)
    const PAGE_W = 148;
    const PAGE_H = 210;
    const MARGIN = 14;
    const CONTENT_W = PAGE_W - MARGIN * 2; // 120mm
    const CONTENT_H = PAGE_H - MARGIN * 2; // 182mm
    const SECTION_GAP = 2; // mm between body sections

    // Build offscreen container. We keep it on-screen-but-invisible so html2canvas captures correctly.
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "-1";
    container.style.background = "#ffffff";
    container.style.color = "#0f172a";
    container.style.fontFamily =
      "'EB Garamond', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', serif";
    // Use a CSS pixel width that matches CONTENT_W mm at the browser's standard 96dpi.
    // 1mm = 3.7795275591 px. We use a larger base so text isn't squeezed; we'll scale via scaleFactor.
    const PX_PER_MM = 3.7795275591;
    const widthPx = Math.round(CONTENT_W * PX_PER_MM);
    container.style.width = `${widthPx}px`;
    container.className = "font-mixed";

    // Cover section
    const coverHtml = `
      <div data-pdf-section data-pdf-cover style="
        width: 100%;
        box-sizing: border-box;
        padding-top: 8mm;
        text-align: center;
      ">
        <h1 style="
          font-size: 26pt;
          font-weight: 400;
          line-height: 1.2;
          margin: 0 0 14mm 0;
          letter-spacing: -0.005em;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        ">${escapeHtml(safeTitle)}</h1>
        ${
          safeAuthor
            ? `<p style="
                font-size: 12pt;
                font-weight: 400;
                line-height: 1.4;
                margin: 0;
                color: #334155;
                word-wrap: break-word;
                overflow-wrap: break-word;
              ">${escapeHtml(safeAuthor)}</p>`
            : ""
        }
      </div>
    `;

    // Body wrapper — natural typography
    const bodyWrap = document.createElement("div");
    bodyWrap.className = "tiptap";
    bodyWrap.setAttribute("data-pdf-body", "");
    bodyWrap.style.fontSize = "11pt";
    bodyWrap.style.lineHeight = "1.65";
    bodyWrap.style.textAlign = "left";
    bodyWrap.innerHTML = bodyHtml;

    container.innerHTML = coverHtml;
    container.appendChild(bodyWrap);
    document.body.appendChild(container);

    // Wait for fonts to be ready so captured text uses the right faces.
    try {
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
    } catch {}
    // Tiny tick to allow layout flush
    await new Promise((r) => setTimeout(r, 50));

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
        compress: true,
      });

      const renderScale = 3; // sharp output

      const captureElement = async (el: HTMLElement) => {
        // Temporarily add vertical padding so html2canvas doesn't clip
        // ascenders/descenders of the first/last line.
        const prevPadTop = el.style.paddingTop;
        const prevPadBot = el.style.paddingBottom;
        el.style.paddingTop = "6px";
        el.style.paddingBottom = "8px";
        const canvas = await html2canvas(el, {
          scale: renderScale,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: widthPx,
        });
        el.style.paddingTop = prevPadTop;
        el.style.paddingBottom = prevPadBot;
        const elWidthPx = canvas.width / renderScale;
        const elHeightPx = canvas.height / renderScale;
        const mmPerPx = CONTENT_W / elWidthPx;
        const heightMM = elHeightPx * mmPerPx;
        return { dataUrl: canvas.toDataURL("image/jpeg", 0.95), heightMM };
      };

      // --- Cover page ---
      const coverEl = container.querySelector(
        "[data-pdf-cover]"
      ) as HTMLElement;
      const cover = await captureElement(coverEl);
      pdf.addImage(
        cover.dataUrl,
        "JPEG",
        MARGIN,
        MARGIN,
        CONTENT_W,
        Math.min(cover.heightMM, CONTENT_H)
      );

      // --- Body: always start on a new page ---
      const bodyChildren = Array.from(bodyWrap.children) as HTMLElement[];
      if (bodyChildren.length > 0) {
        pdf.addPage();
        let currentY = MARGIN;

        for (const child of bodyChildren) {
          // Skip empty paragraphs that have no text and no images
          const isEmpty =
            !child.textContent?.trim() &&
            child.querySelectorAll("img").length === 0;
          if (isEmpty) {
            currentY += 4; // small blank-line spacing
            continue;
          }

          const section = await captureElement(child);
          let { dataUrl, heightMM } = section;

          // If a single section is taller than a full page, scale it down proportionally
          // to fit on one page (prevents arbitrary clipping of long blocks).
          let drawW = CONTENT_W;
          let drawH = heightMM;
          if (drawH > CONTENT_H) {
            const ratio = CONTENT_H / drawH;
            drawH = CONTENT_H;
            drawW = CONTENT_W * ratio;
          }

          const remaining = PAGE_H - MARGIN - currentY;
          if (drawH > remaining && currentY > MARGIN) {
            pdf.addPage();
            currentY = MARGIN;
          }

          const xOffset = MARGIN + (CONTENT_W - drawW) / 2;
          pdf.addImage(dataUrl, "JPEG", xOffset, currentY, drawW, drawH);
          currentY += drawH + SECTION_GAP;
        }
      }

      const filename =
        safeTitle.replace(/[^a-z0-9\u0980-\u09FF\s-]/gi, "").trim() || "book";
      pdf.save(`${filename}.pdf`);
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