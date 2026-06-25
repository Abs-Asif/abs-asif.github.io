import React, { useMemo, useState } from "react";
import { Download, Loader2, Eye, Pencil, HelpCircle, ListTree } from "lucide-react";
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

/* ---------- Footnotes ---------- */
// Definition: [[id==footnote body]]   Marker: [[id]]
function extractFootnoteDefs(md: string): {
  md: string;
  defs: Map<string, string>;
} {
  const defs = new Map<string, string>();
  const stripped = (md || "").replace(
    /\[\[([^\]\s=]+)==([\s\S]*?)\]\]/g,
    (_m, id, body) => {
      defs.set(String(id).trim(), String(body).trim());
      return "";
    }
  );
  return { md: stripped, defs };
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function injectFootnoteMarkers(
  md: string,
  script: NumeralScript,
  validIds: Set<string>
): string {
  return md.replace(/\[\[([^\]\s=]+)\]\]/g, (raw, id) => {
    const t = String(id).trim();
    if (!validIds.has(t)) return raw;
    const n = parseInt(t, 10);
    const label = !isNaN(n) ? toNumerals(n, script) : t;
    return `<sup class="fn-ref" data-fn-id="${escapeAttr(t)}">${label}</sup>`;
  });
}

function collectFootnoteOrder(
  md: string,
  defs: Map<string, string>
): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  md.replace(/\[\[([^\]\s=]+)\]\]/g, (_m, id) => {
    const t = String(id).trim();
    if (defs.has(t) && !seen.has(t)) {
      seen.add(t);
      order.push(t);
    }
    return _m;
  });
  return order;
}

function renderFootnoteBodyHtml(text: string): string {
  // Footnote body supports markdown but cannot itself contain footnote markers.
  return marked.parse(text || "", {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
}

function renderForPreview(md: string, script: NumeralScript): string {
  const { md: stripped, defs } = extractFootnoteDefs(md);
  const order = collectFootnoteOrder(stripped, defs);
  const validIds = new Set(defs.keys());
  const withMarkers = injectFootnoteMarkers(stripped, script, validIds);
  const pre = preprocessNumeralLists(withMarkers);
  let html = marked.parse(pre, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
  html = applyArabicAlignment(html);
  if (order.length > 0) {
    const items = order
      .map((id) => {
        const n = parseInt(id, 10);
        const label = !isNaN(n) ? toNumerals(n, script) : id;
        const body = renderFootnoteBodyHtml(defs.get(id) || "");
        return `<div class="fn-item"><span class="fn-num">${label}.</span><div class="fn-body">${body}</div></div>`;
      })
      .join("");
    html += `<div class="fn-list">${items}</div>`;
  }
  return html;
}

function indexTitle(script: NumeralScript): string {
  return script === "bn" ? "সূচিপত্র" : script === "ar" ? "الفهرس" : "Index";
}

function renderForPdfBody(
  md: string,
  script: NumeralScript
): { html: string; defs: Map<string, string> } {
  const { md: stripped, defs } = extractFootnoteDefs(md);
  const validIds = new Set(defs.keys());
  const withMarkers = injectFootnoteMarkers(stripped, script, validIds);
  const pre = preprocessNumeralLists(withMarkers);
  let html = marked.parse(pre, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
  html = applyArabicAlignment(html);
  return { html, defs };
}

const Book = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [includeIndex, setIncludeIndex] = useState(false);

  const previewHtml = useMemo(
    () => renderForPreview(content, detectScript(title || content)),
    [content, title]
  );

  const handleDownloadPDF = async () => {
    setGenerating(true);

    const safeTitle = (title || "Untitled").trim();
    const safeAuthor = author.trim();
    const numeralScript = detectScript(safeTitle || content);
    const { html: bodyHtml, defs: footnoteDefs } = renderForPdfBody(
      content,
      numeralScript
    );

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
      "'TimesNR', 'Times New Roman', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', Times, serif";
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
        border-bottom: none;
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
        padding: 4px 6px;
        vertical-align: middle;
        text-align: left;
        font-size: 10pt;
        line-height: 1.35;
      }
      [data-pdf-body] th { background: #f1f5f9; font-weight: 600; }
      [data-pdf-body] td > p,
      [data-pdf-body] th > p { margin: 0; }
      [data-pdf-body] img { max-width: 100%; height: auto; display: block; margin: 0.5em auto; }
      [data-pdf-body] ul[data-type="taskList"] { list-style: none; padding-left: 0.2em; }
      [data-pdf-body] ul[data-type="taskList"] li { display: flex; gap: 0.4em; }
      [data-pdf-body] ul[data-type="taskList"] li > label { margin-top: 0.1em; }
      [data-pdf-body] ul[data-type="taskList"] li::before { content: none; }
      [data-pdf-body] .fn-ref {
        font-size: 0.7em;
        vertical-align: super;
        line-height: 0;
        color: #1d4ed8;
        margin: 0 0.05em;
      }
      [data-pdf-body] .fn-item {
        display: flex;
        gap: 0.55em;
        align-items: flex-start;
        margin: 0;
        padding: 0;
        line-height: 1.5;
      }
      [data-pdf-body] .fn-item .fn-num {
        font-weight: 600;
        min-width: 1.6em;
        text-align: right;
        color: #1d4ed8;
      }
      [data-pdf-body] .fn-item .fn-body { flex: 1; text-align: justify; }
      [data-pdf-body] .fn-item .fn-body > p { margin: 0; }
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

      const renderScale = 3; // higher quality / sharper PDF

      type LinkRect = { x: number; y: number; w: number; h: number; href: string };
      type CaptureResult = {
        dataUrl: string;
        heightMM: number;
        elWidthPx: number;
        elHeightPx: number;
        links: LinkRect[];
        canvas: HTMLCanvasElement;
      };

      const captureElement = async (
        el: HTMLElement,
        opts: { pad?: boolean } = {}
      ): Promise<CaptureResult> => {
        const pad = opts.pad !== false;
        const prevPadTop = el.style.paddingTop;
        const prevPadBot = el.style.paddingBottom;
        if (pad) {
          el.style.paddingTop = "2px";
          el.style.paddingBottom = "2px";
        }

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
          canvas,
        };
      };

      // Slice a captured section vertically. Returns image dataUrl + heightMM for a
      // contiguous range of source pixels [sy, sy+sh) of the original canvas.
      const sliceSection = (
        section: CaptureResult,
        syPx: number,
        shPx: number
      ): { dataUrl: string; heightMM: number } => {
        const src = section.canvas;
        const scale = src.width / section.elWidthPx; // = renderScale
        const slice = document.createElement("canvas");
        slice.width = src.width;
        slice.height = Math.round(shPx * scale);
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(
          src,
          0,
          Math.round(syPx * scale),
          src.width,
          slice.height,
          0,
          0,
          src.width,
          slice.height
        );
        const mmPerPx = CONTENT_W / section.elWidthPx;
        return {
          dataUrl: slice.toDataURL("image/jpeg", 0.95),
          heightMM: shPx * mmPerPx,
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
      let bodyPageNum = 0;

      // Pre-render page-number glyphs to canvas tiles once per number so the
      // correct font (Kalpurush / Scheherazade / TimesNR) is used. jsPDF's built-in
      // fonts can't render Bangla / Arabic.
      const numberCache = new Map<number, { dataUrl: string; wMM: number; hMM: number }>();
      const PAGE_NUM_PT = 9; // visible final size in PDF
      const renderNumberTile = async (n: number) => {
        const cached = numberCache.get(n);
        if (cached) return cached;
        const label = toNumerals(n, numeralScript);
        const numDiv = document.createElement("div");
        numDiv.style.position = "fixed";
        numDiv.style.left = "-9999px";
        numDiv.style.top = "0";
        numDiv.style.padding = "10px 6px"; // generous padding so html2canvas never clips ascenders/descenders
        numDiv.style.margin = "0";
        numDiv.style.display = "inline-block";
        numDiv.style.background = "#ffffff";
        numDiv.style.color = "#475569";
        numDiv.style.fontSize = `${PAGE_NUM_PT * 3}pt`; // render large, downscale for crispness
        numDiv.style.lineHeight = "1.6"; // room for descenders (e.g. Bangla ৭, ৯)
        numDiv.style.whiteSpace = "nowrap";
        numDiv.style.fontFamily =
          "'TimesNR', 'Times New Roman', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', Times, serif";
        numDiv.textContent = label;
        document.body.appendChild(numDiv);
        try {
          const c = await html2canvas(numDiv, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
          });
          // Canvas was rendered at 3× the final pt size and 2× device scale.
          // Convert back to mm by downscaling by 3 — preserves aspect, keeps full glyph (including descenders).
          const wMM = (c.width / 2) * (25.4 / 96) / 3;
          const hMM = (c.height / 2) * (25.4 / 96) / 3;
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
        // Real-book layout: odd pages on the right, even pages on the left.
        // Position uses the tile's full padded height so glyphs are never clipped.
        const edgePad = 8; // mm from outer page edge
        const y = 2; // tile carries its own internal padding, so flush near top edge is safe
        const isOdd = bodyPageNum % 2 === 1;
        const x = isOdd ? PAGE_W - edgePad - tile.wMM : edgePad;
        pdf.addImage(tile.dataUrl, "PNG", x, y, tile.wMM, tile.hMM);
      };

      // ----- Pre-render footnote tiles for every referenced id -----
      type FnTile = { id: string; cap: CaptureResult };
      const fnTiles = new Map<string, FnTile>();
      const allRefIds: string[] = (() => {
        const seen = new Set<string>();
        const order: string[] = [];
        bodyWrap.querySelectorAll(".fn-ref").forEach((r) => {
          const id = r.getAttribute("data-fn-id");
          if (id && footnoteDefs.has(id) && !seen.has(id)) {
            seen.add(id);
            order.push(id);
          }
        });
        return order;
      })();

      if (allRefIds.length > 0) {
        const fnWrap = document.createElement("div");
        fnWrap.setAttribute("data-pdf-body", "");
        fnWrap.style.fontSize = "8.5pt";
        fnWrap.style.lineHeight = "1.5";
        container.appendChild(fnWrap);
        for (const id of allRefIds) {
          const n = parseInt(id, 10);
          const label = !isNaN(n) ? toNumerals(n, numeralScript) : id;
          const bodyHtml = renderFootnoteBodyHtml(footnoteDefs.get(id) || "");
          const item = document.createElement("div");
          item.className = "fn-item";
          item.innerHTML = `<span class="fn-num">${escapeHtml(label)}.</span><div class="fn-body">${bodyHtml}</div>`;
          fnWrap.appendChild(item);
          const cap = await captureElement(item);
          fnTiles.set(id, { id, cap });
        }
        fnWrap.remove();
      }

      // ----- Per-page footnote tracking -----
      const DIV_GAP_TOP = 2.5; // mm above divider
      const DIV_GAP_BOT = 1.8; // mm below divider
      const FN_ITEM_GAP = 0.8; // mm between footnotes
      let pageFnIds: string[] = [];
      const pageFnHeight = () => {
        if (pageFnIds.length === 0) return 0;
        let h = DIV_GAP_TOP + DIV_GAP_BOT;
        pageFnIds.forEach((id, i) => {
          h += fnTiles.get(id)!.cap.heightMM;
          if (i < pageFnIds.length - 1) h += FN_ITEM_GAP;
        });
        return h;
      };
      const flushFootnotes = () => {
        if (pageFnIds.length === 0) return;
        const total = pageFnHeight();
        const startY = PAGE_H - MARGIN - total;
        const dividerY = startY + DIV_GAP_TOP;
        pdf.setDrawColor(170, 170, 170);
        pdf.setLineWidth(0.25);
        pdf.line(MARGIN, dividerY, MARGIN + CONTENT_W * 0.45, dividerY);
        let y = dividerY + DIV_GAP_BOT;
        for (const id of pageFnIds) {
          const t = fnTiles.get(id)!.cap;
          pdf.addImage(t.dataUrl, "JPEG", MARGIN, y, CONTENT_W, t.heightMM);
          addLinkAnnotations(t, MARGIN, y, CONTENT_W, t.heightMM);
          y += t.heightMM + FN_ITEM_GAP;
        }
        pageFnIds = [];
      };

      const idsInChild = (child: HTMLElement): string[] => {
        const out: string[] = [];
        child.querySelectorAll(".fn-ref").forEach((r) => {
          const id = r.getAttribute("data-fn-id");
          if (id && fnTiles.has(id) && !out.includes(id)) out.push(id);
        });
        return out;
      };

      if (bodyChildren.length > 0) {
        pdf.addPage();
        await stampPageNumber();
        let currentY = MARGIN;

        for (const child of bodyChildren) {
          const isEmpty =
            !child.textContent?.trim() &&
            child.querySelectorAll("img").length === 0;
          if (isEmpty) {
            currentY += 4;
            continue;
          }

          const section = await captureElement(child);
          let drawW = CONTENT_W;
          let drawH = section.heightMM;
          if (drawH > CONTENT_H) {
            const ratio = CONTENT_H / drawH;
            drawH = CONTENT_H;
            drawW = CONTENT_W * ratio;
          }

          // Footnote ids introduced by this section (not already on the page).
          const childIds = idsInChild(child);
          const newIds = childIds.filter((id) => !pageFnIds.includes(id));

          // Compute reserved bottom space if we accept this section + its new footnotes.
          const tentativeIds = [...pageFnIds, ...newIds];
          let tentativeReserved = 0;
          if (tentativeIds.length > 0) {
            tentativeReserved = DIV_GAP_TOP + DIV_GAP_BOT;
            tentativeIds.forEach((id, i) => {
              tentativeReserved += fnTiles.get(id)!.cap.heightMM;
              if (i < tentativeIds.length - 1) tentativeReserved += FN_ITEM_GAP;
            });
          }
          const availableBottom = PAGE_H - MARGIN - tentativeReserved;

          if (currentY + drawH > availableBottom && currentY > MARGIN) {
            // Doesn't fit: flush current page footnotes, start a new page.
            flushFootnotes();
            pdf.addPage();
            await stampPageNumber();
            currentY = MARGIN;
          }

          const xOffset = MARGIN + (CONTENT_W - drawW) / 2;
          pdf.addImage(section.dataUrl, "JPEG", xOffset, currentY, drawW, drawH);
          addLinkAnnotations(section, xOffset, currentY, drawW, drawH);
          currentY += drawH + SECTION_GAP;

          // Commit new footnotes to this page.
          for (const id of newIds) pageFnIds.push(id);
        }
        // Final flush for the last page.
        flushFootnotes();
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
            placeholder="বইয়ের শিরোনাম"
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
            placeholder="লেখকের নাম (নতুন লাইনের জন্য Enter চাপুন)"
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
            placeholder="এখানে আপনার বই লেখা শুরু করুন... (Markdown সমর্থিত)"
            dir="auto"
            className="w-full font-mixed text-xl md:text-2xl bg-transparent border-none focus:outline-none placeholder:text-slate-300 resize-none leading-relaxed min-h-[70vh]"
            style={{ whiteSpace: "pre-wrap" }}
          />
        )}
      </div>

      {/* Floating action bar — responsive, no overlap on mobile */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 flex justify-end items-center gap-2 sm:gap-3 pointer-events-none">
        <button
          onClick={() => setPreview((p) => !p)}
          className="pointer-events-auto flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white text-slate-900 border border-slate-200 shadow-lg hover:bg-slate-50 transition-all"
          title={preview ? "Back to editor" : "Preview with markdown"}
        >
          {preview ? <Pencil size={18} /> : <Eye size={18} />}
          <span className="text-sm font-medium hidden sm:inline">
            {preview ? "Edit" : "Preview"}
          </span>
        </button>

        <a
          href="/book/help"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white text-slate-900 border border-slate-200 shadow-lg hover:bg-slate-50 transition-all"
          title="Markdown guide (in Bangla) — opens in a new tab"
        >
          <HelpCircle size={18} />
          <span className="text-sm font-medium hidden sm:inline">Help</span>
        </a>

        <button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="pointer-events-auto flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          title="Download as PDF"
        >
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-medium hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span className="text-sm font-medium hidden sm:inline">Download</span>
            </>
          )}
        </button>
      </div>
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