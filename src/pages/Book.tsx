import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, Eye, Pencil, HelpCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// Configure marked once: GFM, line breaks, and highlight.js for code fences.
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      try {
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
      } catch {
        return code;
      }
    },
  })
);

type NumeralScript = "bn" | "ar" | "en";

function detectScript(text: string): NumeralScript {
  for (const ch of text) {
    if (/\s/.test(ch)) continue;
    const code = ch.codePointAt(0)!;
    if (code >= 0x0980 && code <= 0x09ff) return "bn";
    if (
      (code >= 0x0600 && code <= 0x06ff) ||
      (code >= 0x0750 && code <= 0x077f) ||
      (code >= 0xfb50 && code <= 0xfdff) ||
      (code >= 0xfe70 && code <= 0xfeff)
    )
      return "ar";
    return "en";
  }
  return "en";
}

function toNumerals(n: number, script: NumeralScript): string {
  const s = String(n);
  if (script === "en") return s;
  const map =
    script === "bn"
      ? ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
      : ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return s
    .split("")
    .map((d) => (/\d/.test(d) ? map[+d] : d))
    .join("");
}

/* ---------- Arabic-only block detection ---------- */
function isArabicOnly(text: string): boolean {
  const stripped = text.replace(/\s+/g, "").replace(/[\p{P}\p{S}\d]/gu, "");
  if (!stripped) return false;
  for (const ch of stripped) {
    const c = ch.codePointAt(0)!;
    const inArabic =
      (c >= 0x0600 && c <= 0x06ff) ||
      (c >= 0x0750 && c <= 0x077f) ||
      (c >= 0xfb50 && c <= 0xfdff) ||
      (c >= 0xfe70 && c <= 0xfeff);
    if (!inArabic) return false;
  }
  return true;
}

function applyArabicAlignment(html: string): string {
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(
    `<div id="__root">${html}</div>`,
    "text/html"
  );
  const root = doc.getElementById("__root");
  if (!root) return html;
  root
    .querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th")
    .forEach((el) => {
      const txt = el.textContent || "";
      if (isArabicOnly(txt)) {
        el.setAttribute("dir", "rtl");
        (el as HTMLElement).style.textAlign = "right";
      }
    });
  return root.innerHTML;
}

/* ---------- Bangla / Arabic numbered list preprocessing ---------- */
// Marked doesn't recognise "১." or "٢." as ordered lists. We detect groups
// of consecutive such lines and emit raw HTML <ol> with the original markers
// preserved as <span class="num-marker">.
function preprocessNumeralLists(md: string): string {
  const lines = md.split("\n");
  const re = /^(\s*)([০-৯]+|[٠-٩]+)([\.\)])\s+(.*)$/;
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(re);
    if (m) {
      const items: string[] = [];
      while (i < lines.length) {
        const mm = lines[i].match(re);
        if (!mm) break;
        items.push(
          `<li><span class="num-marker">${escapeHtml(
            mm[2] + mm[3]
          )}</span><span class="num-body">${escapeHtml(mm[4])}</span></li>`
        );
        i++;
      }
      out.push("");
      out.push(`<ol class="numeral-ol">${items.join("")}</ol>`);
      out.push("");
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return out.join("\n");
}

function renderMarkdown(md: string): string {
  const pre = preprocessNumeralLists(md || "");
  const html = marked.parse(pre, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
  return applyArabicAlignment(html);
}

const Book = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  const previewHtml = useMemo(() => renderMarkdown(content), [content]);

  const handleDownloadPDF = async () => {
    setGenerating(true);

    const bodyHtml = renderMarkdown(content);
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
      "'Tinos', 'Times New Roman', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', Times, serif";
    container.style.fontFeatureSettings = "normal";
    // Use a CSS pixel width that matches CONTENT_W mm at the browser's standard 96dpi.
    // 1mm = 3.7795275591 px. We use a larger base so text isn't squeezed; we'll scale via scaleFactor.
    const PX_PER_MM = 3.7795275591;
    const widthPx = Math.round(CONTENT_W * PX_PER_MM);
    container.style.width = `${widthPx}px`;
    container.className = "font-mixed";

    // Inject styles so markdown-rendered elements (tables, lists, quotes,
    // headings, code) look natural in the captured PDF.
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      [data-pdf-body] { color: #0f172a; text-align: justify; hyphens: none; }
      [data-pdf-body] p { margin: 0 0 0.75em 0; }
      [data-pdf-body] h1,
      [data-pdf-body] h2,
      [data-pdf-body] h3,
      [data-pdf-body] h4,
      [data-pdf-body] h5,
      [data-pdf-body] h6 {
        font-family: inherit;
        font-weight: 400;
        text-align: center;
        margin: 1em 0 0.5em;
        line-height: 1.3;
      }
      [data-pdf-body] h1 { font-size: 22pt; }
      [data-pdf-body] h2 { font-size: 18pt; }
      [data-pdf-body] h3 { font-size: 15pt; }
      [data-pdf-body] h4 { font-size: 13pt; }
      [data-pdf-body] h5 { font-size: 12pt; }
      [data-pdf-body] h6 { font-size: 11.5pt; }
      /* Manual list markers so html2canvas aligns dots with the text baseline */
      [data-pdf-body] ul, [data-pdf-body] ol {
        margin: 0 0 0.75em 0;
        padding-left: 0;
        list-style: none;
      }
      [data-pdf-body] ol { counter-reset: pdf-ol; }
      [data-pdf-body] ul > li,
      [data-pdf-body] ol > li {
        position: relative;
        padding-left: 1.4em;
        margin: 0.1em 0;
        line-height: 1.6;
      }
      [data-pdf-body] ul > li::before {
        content: "•";
        position: absolute;
        left: 0.45em;
        top: 0;
        line-height: 1.6;
        color: #0f172a;
      }
      [data-pdf-body] ol > li {
        counter-increment: pdf-ol;
      }
      [data-pdf-body] ol > li::before {
        content: counter(pdf-ol) ".";
        position: absolute;
        left: 0;
        top: 0;
        width: 1.2em;
        text-align: right;
        line-height: 1.6;
      }
      [data-pdf-body] li > p { margin: 0; }
      /* Numeral-aware OL (Bangla / Arabic) */
      [data-pdf-body] ol.numeral-ol > li {
        padding-left: 2em;
        line-height: 1.6;
      }
      [data-pdf-body] ol.numeral-ol > li::before { content: none; }
      [data-pdf-body] ol.numeral-ol .num-marker {
        position: absolute;
        left: 0;
        top: 0;
        width: 1.7em;
        text-align: right;
        line-height: 1.6;
        padding-right: 0.3em;
      }
      [data-pdf-body] blockquote {
        margin: 0.5em 0 1em;
        padding: 0.2em 1em;
        border-left: 3px solid #94a3b8;
        color: #334155;
        font-style: italic;
      }
      [data-pdf-body] hr { border: none; border-top: 1px solid #cbd5e1; margin: 1.2em 0; }
      [data-pdf-body] code {
        background: #f1f5f9;
        padding: 0.05em 0.35em;
        border-radius: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.9em;
      }
      [data-pdf-body] pre {
        background: #282c34;
        color: #abb2bf;
        padding: 0.9em 1em;
        border-radius: 8px;
        overflow: hidden;
        white-space: pre-wrap;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 9.5pt;
        line-height: 1.5;
        margin: 0 0 1em 0;
      }
      [data-pdf-body] pre code { background: transparent; padding: 0; color: inherit; }
      /* highlight.js (atom-one-dark) token colors */
      [data-pdf-body] .hljs-keyword,
      [data-pdf-body] .hljs-selector-tag,
      [data-pdf-body] .hljs-built_in { color: #c678dd; }
      [data-pdf-body] .hljs-string,
      [data-pdf-body] .hljs-attr { color: #98c379; }
      [data-pdf-body] .hljs-number,
      [data-pdf-body] .hljs-literal { color: #d19a66; }
      [data-pdf-body] .hljs-comment,
      [data-pdf-body] .hljs-quote { color: #5c6370; font-style: italic; }
      [data-pdf-body] .hljs-function,
      [data-pdf-body] .hljs-title { color: #61afef; }
      [data-pdf-body] .hljs-variable,
      [data-pdf-body] .hljs-name,
      [data-pdf-body] .hljs-tag { color: #e06c75; }
      [data-pdf-body] .hljs-type,
      [data-pdf-body] .hljs-class .hljs-title { color: #e5c07b; }
      [data-pdf-body] .hljs-meta,
      [data-pdf-body] .hljs-symbol { color: #56b6c2; }
      [data-pdf-body] a {
        color: #1d4ed8;
        text-decoration: none;
        border-bottom: 1px solid rgba(29, 78, 216, 0.35);
      }
      [data-pdf-body] strong { font-weight: 700; }
      [data-pdf-body] em { font-style: italic; }
      [data-pdf-body] table {
        border-collapse: collapse;
        width: 100%;
        margin: 0.5em 0 1em;
        table-layout: fixed;
        word-wrap: break-word;
      }
      [data-pdf-body] th, [data-pdf-body] td {
        border: 1px solid #94a3b8;
        padding: 4px 7px;
        vertical-align: top;
        text-align: left;
        font-size: 10pt;
        line-height: 1.4;
      }
      [data-pdf-body] th { background: #f1f5f9; font-weight: 600; }
      [data-pdf-body] img { max-width: 100%; height: auto; display: block; margin: 0.5em auto; }
      [data-pdf-body] ul[data-type="taskList"] { list-style: none; padding-left: 0.2em; }
      [data-pdf-body] ul[data-type="taskList"] li { display: flex; gap: 0.4em; }
      [data-pdf-body] ul[data-type="taskList"] li > label { margin-top: 0.1em; }
      [data-pdf-body] ul[data-type="taskList"] li::before { content: none; }
    `;
    container.appendChild(styleEl);

    // Cover section
    const coverHtml = `
      <div data-pdf-section data-pdf-cover style="
        width: 100%;
        box-sizing: border-box;
        padding-top: 8mm;
        text-align: center;
        position: relative;
        min-height: ${CONTENT_H}mm;
      ">
        <h1 style="
          font-size: 26pt;
          font-weight: 400;
          line-height: 1.2;
          margin: 0 0 14mm 0;
          letter-spacing: normal;
          word-break: keep-all;
          overflow-wrap: break-word;
          font-feature-settings: normal;
          font-variant-ligatures: normal;
          white-space: normal;
        ">${escapeHtml(safeTitle)}</h1>
        ${
          safeAuthor
            ? `<div style="
                font-size: 12pt;
                font-weight: 400;
                line-height: 1.4;
                margin: 0;
                color: #334155;
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: pre-wrap;
              ">${escapeHtml(safeAuthor)}</div>`
            : ""
        }
        <div data-pdf-cover-footer style="
          position: absolute;
          left: 0;
          right: 0;
          bottom: 6mm;
          text-align: center;
          font-size: 9pt;
          color: #475569;
        ">
          Made using <a href="https://abdullah.ami.bd/book" style="color:#1d4ed8;text-decoration:none;border-bottom:1px solid rgba(29,78,216,0.35);">abdullah.ami.bd/book</a>
        </div>
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

    const coverWrap = document.createElement("div");
    coverWrap.innerHTML = coverHtml;
    container.appendChild(coverWrap);
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

      const renderScale = 2; // sharp enough for A5, ~2x faster than 3

      type LinkRect = { x: number; y: number; w: number; h: number; href: string };
      type CaptureResult = {
        dataUrl: string;
        heightMM: number;
        elWidthPx: number;
        elHeightPx: number;
        links: LinkRect[];
      };

      const captureElement = async (el: HTMLElement): Promise<CaptureResult> => {
        const prevPadTop = el.style.paddingTop;
        const prevPadBot = el.style.paddingBottom;
        el.style.paddingTop = "6px";
        el.style.paddingBottom = "8px";

        // Capture link rects in CSS pixels relative to the element box.
        const baseRect = el.getBoundingClientRect();
        const links: LinkRect[] = [];
        el.querySelectorAll("a[href]").forEach((a) => {
          const href = (a as HTMLAnchorElement).href;
          if (!href) return;
          const rects = (a as HTMLAnchorElement).getClientRects();
          for (const r of Array.from(rects)) {
            links.push({
              x: r.left - baseRect.left,
              y: r.top - baseRect.top,
              w: r.width,
              h: r.height,
              href,
            });
          }
        });

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
        return {
          dataUrl: canvas.toDataURL("image/jpeg", 0.95),
          heightMM,
          elWidthPx,
          elHeightPx,
          links,
        };
      };

      const addLinkAnnotations = (
        section: CaptureResult,
        xOffsetMM: number,
        yOffsetMM: number,
        drawW: number,
        drawH: number
      ) => {
        const sx = drawW / section.elWidthPx;
        const sy = drawH / section.elHeightPx;
        for (const lk of section.links) {
          pdf.link(
            xOffsetMM + lk.x * sx,
            yOffsetMM + lk.y * sy,
            lk.w * sx,
            lk.h * sy,
            { url: lk.href }
          );
        }
      };

      // --- Cover page ---
      const coverEl = container.querySelector(
        "[data-pdf-cover]"
      ) as HTMLElement;
      const cover = await captureElement(coverEl);
      const coverDrawH = Math.min(cover.heightMM, CONTENT_H);
      pdf.addImage(cover.dataUrl, "JPEG", MARGIN, MARGIN, CONTENT_W, coverDrawH);
      addLinkAnnotations(cover, MARGIN, MARGIN, CONTENT_W, coverDrawH);

      // --- Body: always start on a new page ---
      const bodyChildren = Array.from(bodyWrap.children) as HTMLElement[];
      const numeralScript = detectScript(safeTitle);
      let bodyPageNum = 0;

      // Pre-render page-number glyphs to canvas tiles once per number so the
      // correct font (Kalpurush / Scheherazade / Tinos) is used. jsPDF's built-in
      // fonts can't render Bangla / Arabic. We size them small (8pt) on output.
      const numberCache = new Map<number, { dataUrl: string; wMM: number; hMM: number }>();
      const PAGE_NUM_PT = 8;
      const renderNumberTile = async (n: number) => {
        const cached = numberCache.get(n);
        if (cached) return cached;
        const label = toNumerals(n, numeralScript);
        const numDiv = document.createElement("div");
        numDiv.style.position = "fixed";
        numDiv.style.left = "-9999px";
        numDiv.style.top = "0";
        numDiv.style.padding = "0";
        numDiv.style.margin = "0";
        numDiv.style.background = "#ffffff";
        numDiv.style.color = "#64748b";
        numDiv.style.fontSize = `${PAGE_NUM_PT * 2}pt`; // render larger, downscale for crispness
        numDiv.style.lineHeight = "1";
        numDiv.style.fontFamily =
          "'Tinos', 'Times New Roman', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', Times, serif";
        numDiv.textContent = label;
        document.body.appendChild(numDiv);
        try {
          const c = await html2canvas(numDiv, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
          });
          // The div was rendered at 2× target pt; final mm should reflect target pt.
          const targetHmm = (PAGE_NUM_PT * 25.4) / 72; // pt -> mm
          const ratio = targetHmm / ((c.height / 2) * (25.4 / 96));
          const wMM = (c.width / 2) * (25.4 / 96) * ratio;
          const hMM = targetHmm;
          const tile = { dataUrl: c.toDataURL("image/png"), wMM, hMM };
          numberCache.set(n, tile);
          return tile;
        } finally {
          numDiv.remove();
        }
      };
      const stampPageNumber = async () => {
        bodyPageNum += 1;
        const tile = await renderNumberTile(bodyPageNum);
        // Top-right, outside the content margin but not touching edge
        const x = PAGE_W - 6 - tile.wMM;
        const y = 5;
        pdf.addImage(tile.dataUrl, "PNG", x, y, tile.wMM, tile.hMM);
      };

      if (bodyChildren.length > 0) {
        pdf.addPage();
        await stampPageNumber();
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
            await stampPageNumber();
            currentY = MARGIN;
          }

          const xOffset = MARGIN + (CONTENT_W - drawW) / 2;
          pdf.addImage(dataUrl, "JPEG", xOffset, currentY, drawW, drawH);
          addLinkAnnotations(section, xOffset, currentY, drawW, drawH);
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
    <div className="min-h-screen bg-white px-6 pt-10 md:px-20 md:pt-20 lg:px-32 lg:pt-24 pb-40 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-10">
        {/* Title + Author */}
        <div className="space-y-4 border-b border-slate-100 pb-10">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title"
            rows={1}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            className="w-full font-mixed text-4xl md:text-5xl font-medium tracking-tight bg-transparent border-none focus:outline-none placeholder:text-slate-300 resize-none overflow-hidden leading-tight"
            dir="auto"
          />
          <textarea
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author (press Enter for a new line)"
            rows={1}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            className="w-full font-mixed text-lg md:text-xl text-slate-600 bg-transparent border-none focus:outline-none placeholder:text-slate-300 resize-none overflow-hidden leading-snug"
            dir="auto"
          />
        </div>

        {/* Editor / Preview */}
        {preview ? (
          <div
            className="font-mixed prose-xl md:prose-2xl max-w-none pdf-preview"
            dir="auto"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your book here... (Markdown supported)"
            dir="auto"
            className="w-full font-mixed text-xl md:text-2xl bg-transparent border-none focus:outline-none placeholder:text-slate-300 resize-none leading-relaxed min-h-[70vh]"
            style={{ whiteSpace: "pre-wrap" }}
          />
        )}
      </div>

      {/* Floating buttons */}
      <button
        onClick={() => setPreview((p) => !p)}
        className="fixed bottom-8 right-56 flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 border border-slate-200 shadow-lg hover:bg-slate-50 transition-all"
        title={preview ? "Back to editor" : "Preview with markdown"}
      >
        {preview ? <Pencil size={18} /> : <Eye size={18} />}
        <span className="text-sm font-medium">
          {preview ? "Edit" : "Preview"}
        </span>
      </button>

      <Link
        to="/book/help"
        className="fixed bottom-8 right-32 flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 border border-slate-200 shadow-lg hover:bg-slate-50 transition-all"
        title="Markdown guide (in Bangla)"
      >
        <HelpCircle size={18} />
        <span className="text-sm font-medium">Help</span>
      </Link>

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
            <Download size={18} />
            <span className="text-sm font-medium">Download</span>
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