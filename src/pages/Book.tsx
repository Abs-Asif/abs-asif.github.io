import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Download,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  ClipboardPaste,
  Plus,
  Search,
  ArrowLeft,
  Lock,
  Unlock,
  FileLock2,
  MoreHorizontal,
  Image as ImageIcon,
  ImageOff,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

/* ---------- Markdown / code rendering ---------- */
const codeRenderer = new marked.Renderer();
codeRenderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  let highlighted: string;
  try {
    highlighted = hljs.highlight(text, { language, ignoreIllegals: true }).value;
  } catch {
    highlighted = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};
marked.use({ renderer: codeRenderer });

function parseInlineMd(s: string): string {
  if (!s) return "";
  try {
    return marked.parseInline(s, { async: false, gfm: true, breaks: false }) as string;
  } catch {
    return escapeHtml(s);
  }
}

function smartQuotes(s: string): string {
  if (!s) return s;
  s = s.replace(/(^|[\s\(\[\{«—–\-])"/g, "$1\u201C").replace(/"/g, "\u201D");
  s = s.replace(/(^|[\s\(\[\{«—–\-])'/g, "$1\u2018").replace(/'/g, "\u2019");
  return s;
}

async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
  return s.split("").map((d) => (/\d/.test(d) ? map[+d] : d)).join("");
}

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
  const doc = new DOMParser().parseFromString(`<div id="__root">${html}</div>`, "text/html");
  const root = doc.getElementById("__root");
  if (!root) return html;
  root.querySelectorAll("p, li, blockquote, td, th").forEach((el) => {
    const txt = el.textContent || "";
    if (isArabicOnly(txt)) {
      el.setAttribute("dir", "rtl");
      (el as HTMLElement).style.textAlign = "justify";
    }
  });
  root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
    const txt = el.textContent || "";
    if (isArabicOnly(txt)) {
      el.setAttribute("dir", "rtl");
      (el as HTMLElement).style.textAlign = "center";
    }
  });
  return root.innerHTML;
}

function preprocessNumeralLists(md: string): string {
  const lines = md.split("\n");
  const re = /^(\s*)([০-৯]+|[٠-٩]+)([.)।])\s+(.*)$/;
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
          `<li><span class="num-marker">${escapeHtml(mm[2] + mm[3])}</span><span class="num-body">${escapeHtml(mm[4])}</span></li>`
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

function colorizeDigits(html: string): string {
  if (typeof DOMParser === "undefined") return html;
  const DIGIT_RE = /[0-9\u09E6-\u09EF\u0660-\u0669]+/;
  const DIGIT_SPLIT = /([0-9\u09E6-\u09EF\u0660-\u0669]+)/g;
  const doc = new DOMParser().parseFromString(`<div id="__root">${html}</div>`, "text/html");
  const root = doc.getElementById("__root");
  if (!root) return html;
  const skip = (el: Element | null): boolean => {
    while (el && el !== root) {
      if (
        el.classList &&
        (el.classList.contains("fn-ref") ||
          el.classList.contains("fn-num") ||
          el.classList.contains("num-marker"))
      )
        return true;
      const tag = el.tagName?.toLowerCase();
      if (tag === "code" || tag === "pre" || tag === "a") return true;
      el = el.parentElement;
    }
    return false;
  };
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    if (!t.nodeValue || !DIGIT_RE.test(t.nodeValue)) continue;
    if (skip(t.parentElement)) continue;
    targets.push(t);
  }
  for (const t of targets) {
    const parts = (t.nodeValue || "").split(DIGIT_SPLIT);
    if (parts.length <= 1) continue;
    const frag = doc.createDocumentFragment();
    for (const p of parts) {
      if (!p) continue;
      if (DIGIT_RE.test(p)) {
        const s = doc.createElement("span");
        s.className = "num-red";
        s.textContent = p;
        frag.appendChild(s);
      } else {
        frag.appendChild(doc.createTextNode(p));
      }
    }
    t.parentNode?.replaceChild(frag, t);
  }
  return root.innerHTML;
}

function extractFootnoteDefs(md: string): { md: string; defs: Map<string, string> } {
  const defs = new Map<string, string>();
  const stripped = (md || "").replace(/\[\[([^\]\s=]+)==([\s\S]*?)\]\]/g, (_m, id, body) => {
    defs.set(String(id).trim(), String(body).trim());
    return "";
  });
  return { md: stripped, defs };
}
function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function injectFootnoteMarkers(md: string, script: NumeralScript, validIds: Set<string>): string {
  return md.replace(/\[\[([^\]\s=]+)\]\]/g, (raw, id) => {
    const t = String(id).trim();
    if (!validIds.has(t)) return raw;
    const n = parseInt(t, 10);
    const label = !isNaN(n) ? toNumerals(n, script) : t;
    return `<sup class="fn-ref" data-fn-id="${escapeAttr(t)}">${label}</sup>`;
  });
}
function collectFootnoteOrder(md: string, defs: Map<string, string>): string[] {
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
  return marked.parse(text || "", { async: false, gfm: true, breaks: true }) as string;
}
function renderForPreview(md: string, script: NumeralScript): string {
  const { md: stripped, defs } = extractFootnoteDefs(md);
  const order = collectFootnoteOrder(stripped, defs);
  const validIds = new Set(defs.keys());
  const withMarkers = injectFootnoteMarkers(stripped, script, validIds);
  const pre = preprocessNumeralLists(withMarkers);
  let html = marked.parse(pre, { async: false, gfm: true, breaks: true }) as string;
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
  return colorizeDigits(html);
}
function indexTitle(script: NumeralScript): string {
  return script === "bn" ? "সূচিপত্র" : script === "ar" ? "الفهرس" : "Index";
}
function renderForPdfBody(md: string, script: NumeralScript): { html: string; defs: Map<string, string> } {
  const { md: stripped, defs } = extractFootnoteDefs(md);
  const validIds = new Set(defs.keys());
  const withMarkers = injectFootnoteMarkers(stripped, script, validIds);
  const pre = preprocessNumeralLists(withMarkers);
  let html = marked.parse(pre, { async: false, gfm: true, breaks: true }) as string;
  html = applyArabicAlignment(html);
  return { html: colorizeDigits(html), defs };
}

const LIST_KEY = "book-list-v1";
const DEFAULT_SEED_KEY = "book-default-seeded-v1";
const cacheKeyFor = (id: number) => `book-draft-v1:${id}`;
const lockKeyFor = (id: number) => `book-lock-v1:${id}`;
const unlockSessionKey = (id: number) => `book-unlocked:${id}`;

type BookMeta = {
  id: number;
  title: string;
  author: string;
  content: string;
  coverImage?: string;
};

const DEFAULT_BOOK_CONTENT =
  "# পরিচিতি\n\n" +
  "এটি একটি *demo* বই। **Preview** (চোখ) বাটনে চাপ দিয়ে দেখুন কীভাবে প্রতিটি উপাদান PDF-এ রেন্ডার হয়, Edit বাটনে ফিরে এসে source দেখতে পারবেন। এই বইটি ইচ্ছেমত মুছে ফেলা যাবে।\n\n" +
  "---\n\n" +
  "# ১. Headings — শিরোনাম — العناوين\n\n" +
  "`#`, `##`, `###` দিয়ে chapter, section ও sub-section। সবগুলো PDF-এ কেন্দ্রীভূত থাকে।\n\n" +
  "## Section (H2)\n\n" +
  "### Sub-section (H3)\n\n" +
  "#### H4 — smaller\n\n" +
  "# ২. Emphasis\n\n" +
  "**Bold text**, *italic text*, ~~strikethrough~~ — inline সব মিলিয়ে ব্যবহার করা যায়।\n\n" +
  "# ৩. Bullets — তালিকা\n\n" +
  "- প্রথম item\n" +
  "- দ্বিতীয় item\n" +
  "    - Nested item\n" +
  "- তৃতীয় item\n\n" +
  "# ৪. Numbered lists (multi-script)\n\n" +
  "1. English one\n" +
  "2. English two\n" +
  "3. English three\n\n" +
  "১. বাংলা এক\n" +
  "২. বাংলা দুই\n" +
  "৩. বাংলা তিন\n\n" +
  "١. عربي واحد\n" +
  "٢. عربي اثنان\n" +
  "٣. عربي ثلاثة\n\n" +
  "# ৫. Blockquote\n\n" +
  "> এই ধরনের উদ্ধৃতির বাম দিকে সবসময় একটি লাল রেখা থাকে — এটি permanent design।\n\n" +
  "# ৬. Table — টেবিল\n\n" +
  "| Name | Language | Year |\n" +
  "| --- | --- | --- |\n" +
  "| Foo | English | 2024 |\n" +
  "| বই | বাংলা | ২০২৫ |\n" +
  "| كتاب | عربي | ٢٠٢٦ |\n\n" +
  "# ৭. Code\n\n" +
  "Inline `const x = 42;` অথবা block:\n\n" +
  "```js\n" +
  "function hello(name) {\n" +
  "  return \"Hello, \" + name;\n" +
  "}\n" +
  "```\n\n" +
  "# ৮. Horizontal rule\n\n" +
  "উপরে ও নিচে জায়গা রেখে একটি রেখা:\n\n" +
  "---\n\n" +
  "# ৯. Links\n\n" +
  "ভিজিট করুন [Lovable](https://lovable.dev)। Link-এর নিচে কোনো underline নেই — শুধু রঙই signal।\n\n" +
  "# ১০. Footnotes — টীকা\n\n" +
  "একই id একাধিকবার cite করা যায় [[1]], কিন্তু body একবারই লেখা হয় [[2]]। আবার প্রথমটি [[1]]।\n\n" +
  "[[1==এটি প্রথম footnote। ভেতরে **markdown** সমর্থিত।]]\n" +
  "[[2==দ্বিতীয় footnote। সংখ্যা ১২৩ স্বয়ংক্রিয়ভাবে লাল।]]\n\n" +
  "# ১১. Auto-red numbers\n\n" +
  "সংখ্যা যেই script-এই থাকুক — 2025, ২০২৫, ٢٠٢٥ — সব স্বয়ংক্রিয়ভাবে লাল হয়ে যায়।\n\n" +
  "# القسم العربي\n\n" +
  "هذه فقرة عربية كاملة، مكتوبة من اليمين إلى اليسار مع ضبط تلقائي للاتجاه. الأرقام ٢٠٢٥ تظهر بلون أحمر.\n\n" +
  "> اقتباس عربي مع خط أحمر على اليمين.\n\n" +
  "# English section\n\n" +
  "This paragraph is entirely in English. Numbers like 2026 are automatically coloured red. Long paragraphs will be split across pages automatically without breaking the layout.\n";

function loadBookList(): number[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => typeof x === "number");
  } catch {
    return [];
  }
}
function saveBookList(ids: number[]) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(ids));
  } catch {}
}
function readBookMeta(id: number): BookMeta {
  try {
    const raw = localStorage.getItem(cacheKeyFor(id));
    if (raw) {
      const p = JSON.parse(raw);
      return {
        id,
        title: typeof p.title === "string" ? p.title : "",
        author: typeof p.author === "string" ? p.author : "",
        content: typeof p.content === "string" ? p.content : "",
        coverImage: typeof p.coverImage === "string" ? p.coverImage : undefined,
      };
    }
  } catch {}
  return { id, title: "", author: "", content: "" };
}
function writeBookMeta(id: number, meta: Partial<BookMeta>) {
  try {
    const existing = readBookMeta(id);
    const merged = { ...existing, ...meta };
    localStorage.setItem(cacheKeyFor(id), JSON.stringify(merged));
  } catch {}
}
function readLockHash(id: number): string | null {
  try {
    const raw = localStorage.getItem(lockKeyFor(id));
    if (!raw) return null;
    const p = JSON.parse(raw);
    return typeof p.hash === "string" ? p.hash : null;
  } catch {
    return null;
  }
}
function writeLockHash(id: number, hash: string | null) {
  try {
    if (hash == null) localStorage.removeItem(lockKeyFor(id));
    else localStorage.setItem(lockKeyFor(id), JSON.stringify({ hash }));
  } catch {}
}
function deleteBookEntirely(id: number) {
  try {
    localStorage.removeItem(cacheKeyFor(id));
    localStorage.removeItem(lockKeyFor(id));
    sessionStorage.removeItem(unlockSessionKey(id));
    saveBookList(loadBookList().filter((x) => x !== id));
  } catch {}
}
function seedDefaultBookIfNeeded() {
  try {
    if (localStorage.getItem(DEFAULT_SEED_KEY)) return;
    const ids = loadBookList();
    if (!ids.includes(0)) {
      writeBookMeta(0, {
        title: "Demo Book — ডেমো বই",
        author: "Book Editor",
        content: DEFAULT_BOOK_CONTENT,
      });
      saveBookList([0, ...ids]);
    }
    localStorage.setItem(DEFAULT_SEED_KEY, "1");
  } catch {}
}

const BookRouter = () => {
  const [hash, setHash] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const m = hash.match(/^#(\d+)$/);
  if (!m) return <BookLanding />;
  const id = parseInt(m[1], 10);
  return <BookGate bookId={id} key={id} />;
};

const BookGate: React.FC<{ bookId: number }> = ({ bookId }) => {
  const lockHash = readLockHash(bookId);
  const initial = !lockHash || sessionStorage.getItem(unlockSessionKey(bookId)) === "1";
  const [unlocked, setUnlocked] = useState<boolean>(initial);
  const [error, setError] = useState<string | undefined>();

  if (unlocked) return <BookEditor bookId={bookId} />;

  const onSubmit = async (pwd: string) => {
    const h = await sha256Hex(pwd);
    if (h === lockHash) {
      sessionStorage.setItem(unlockSessionKey(bookId), "1");
      setUnlocked(true);
    } else {
      setError("ভুল পাসওয়ার্ড।");
    }
  };
  const onCancel = () => {
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
      <PrettyPasswordPrompt
        open
        icon="lock"
        title="বইটি লকড"
        description="এই বই খোলার জন্য পাসওয়ার্ড প্রয়োজন। ভুলে গেলে পুনরুদ্ধারের কোনো উপায় নেই।"
        submitLabel="খুলুন"
        error={error}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
};

type PromptAction = { label: string; onClick: () => void; tone?: "primary" | "danger" | "ghost" };
const PrettyPasswordPrompt: React.FC<{
  open: boolean;
  icon?: "lock" | "unlock" | "file";
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onSubmit: (pwd: string) => void;
  extraActions?: PromptAction[];
  error?: string;
}> = ({
  open,
  icon = "lock",
  title,
  description,
  submitLabel = "ঠিক আছে",
  cancelLabel = "বাতিল",
  onCancel,
  onSubmit,
  extraActions,
  error,
}) => {
  const [pwd, setPwd] = useState("");
  useEffect(() => {
    if (open) setPwd("");
  }, [open]);
  if (!open) return null;
  const Icon = icon === "unlock" ? Unlock : icon === "file" ? FileLock2 : Lock;
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4 font-mixed">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 border border-slate-100 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-start gap-4 mb-5">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center shadow-md">
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <input
          autoFocus
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && pwd) onSubmit(pwd);
          }}
          className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
          placeholder="পাসওয়ার্ড লিখুন"
        />
        {error && (
          <p className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {extraActions?.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className={
                a.tone === "danger"
                  ? "px-4 py-2 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              }
            >
              {a.label}
            </button>
          ))}
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => pwd && onSubmit(pwd)}
            disabled={!pwd}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  description,
  confirmLabel = "নিশ্চিত করুন",
  cancelLabel = "বাতিল",
  tone = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4 font-mixed">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 border border-slate-100 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              tone === "danger"
                ? "bg-gradient-to-br from-rose-600 to-rose-500 text-white"
                : "bg-gradient-to-br from-slate-900 to-slate-700 text-white"
            }`}
          >
            <Trash2 size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              tone === "danger"
                ? "px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white hover:bg-rose-700"
                : "px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

async function cropToA5DataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const targetRatio = 148 / 210;
  const outH = Math.min(2100, img.naturalHeight);
  const outW = Math.round(outH * targetRatio);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);
  const scale = outH / img.naturalHeight;
  const drawW = img.naturalWidth * scale;
  const drawH = outH;
  const dx = (outW - drawW) / 2;
  ctx.drawImage(img, dx, 0, drawW, drawH);
  return canvas.toDataURL("image/jpeg", 0.85);
}

const BookLanding = () => {
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [locks, setLocks] = useState<Record<number, string | null>>({});
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [pwdModal, setPwdModal] = useState<
    | { kind: "open"; id: number; hash: string }
    | { kind: "delete"; id: number; hash: string }
    | { kind: "set-lock"; id: number }
    | { kind: "unlock-remove"; id: number; hash: string }
    | null
  >(null);
  const [pwdError, setPwdError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [coverTargetId, setCoverTargetId] = useState<number | null>(null);

  const refresh = () => {
    seedDefaultBookIfNeeded();
    const ids = loadBookList();
    const kept: number[] = [];
    for (const id of ids) {
      const m = readBookMeta(id);
      const empty = !m.title.trim() && !m.author.trim() && !m.content.trim() && !m.coverImage;
      if (empty) {
        try {
          localStorage.removeItem(cacheKeyFor(id));
          localStorage.removeItem(lockKeyFor(id));
        } catch {}
      } else {
        kept.push(id);
      }
    }
    if (kept.length !== ids.length) saveBookList(kept);
    setBooks(kept.map(readBookMeta));
    const lockMap: Record<number, string | null> = {};
    kept.forEach((id) => (lockMap[id] = readLockHash(id)));
    setLocks(lockMap);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!expandedId) return;
    const onDown = () => setExpandedId(null);
    window.addEventListener("click", onDown);
    return () => window.removeEventListener("click", onDown);
  }, [expandedId]);

  const createBook = () => {
    const ids = loadBookList();
    const next = ids.length ? Math.max(...ids) + 1 : 1;
    saveBookList([...ids, next]);
    window.location.hash = `#${next}`;
  };

  const openBook = (id: number) => {
    const h = locks[id];
    if (h && sessionStorage.getItem(unlockSessionKey(id)) !== "1") {
      setPwdError(undefined);
      setPwdModal({ kind: "open", id, hash: h });
    } else {
      window.location.hash = `#${id}`;
    }
  };

  const startDelete = (id: number) => {
    const h = locks[id];
    if (h) {
      setPwdError(undefined);
      setPwdModal({ kind: "delete", id, hash: h });
    } else {
      setConfirmDelete(id);
    }
  };

  const toggleLock = (id: number) => {
    const h = locks[id];
    setPwdError(undefined);
    if (h) setPwdModal({ kind: "unlock-remove", id, hash: h });
    else setPwdModal({ kind: "set-lock", id });
  };

  const startCover = (id: number) => {
    setCoverTargetId(id);
    coverInputRef.current?.click();
  };
  const removeCover = (id: number) => {
    writeBookMeta(id, { coverImage: undefined });
    refresh();
  };
  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || coverTargetId == null) return;
    try {
      const cropped = await cropToA5DataUrl(file);
      writeBookMeta(coverTargetId, { coverImage: cropped });
      refresh();
    } catch {
      alert("ছবি প্রক্রিয়া করা যায়নি।");
    }
  };

  const handlePwdSubmit = async (pwd: string) => {
    if (!pwdModal) return;
    const hashed = await sha256Hex(pwd);
    if (pwdModal.kind === "open") {
      if (hashed !== pwdModal.hash) return setPwdError("ভুল পাসওয়ার্ড।");
      const id = pwdModal.id;
      sessionStorage.setItem(unlockSessionKey(id), "1");
      setPwdModal(null);
      window.location.hash = `#${id}`;
    } else if (pwdModal.kind === "delete") {
      if (hashed !== pwdModal.hash) return setPwdError("ভুল পাসওয়ার্ড।");
      deleteBookEntirely(pwdModal.id);
      setPwdModal(null);
      refresh();
    } else if (pwdModal.kind === "unlock-remove") {
      if (hashed !== pwdModal.hash) return setPwdError("ভুল পাসওয়ার্ড।");
      writeLockHash(pwdModal.id, null);
      sessionStorage.removeItem(unlockSessionKey(pwdModal.id));
      setPwdModal(null);
      refresh();
    } else if (pwdModal.kind === "set-lock") {
      writeLockHash(pwdModal.id, hashed);
      setPwdModal(null);
      refresh();
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q)
    );
  }, [books, query]);

  const firstLetter = (s: string): string => {
    const t = (s || "").trim();
    if (!t) return "";
    return Array.from(t)[0] || "";
  };

  const cornerFor = (id: number) => {
    const opts = [
      { top: "-45%", left: "-25%" },
      { top: "-45%", left: "60%" },
      { top: "40%", left: "-25%" },
      { top: "40%", left: "60%" },
    ];
    return opts[Math.abs(id) % opts.length];
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCoverFile}
      />
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-5 py-4 md:px-16 lg:px-28">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2.5">
            <Search size={16} className="text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="বই খুঁজুন..."
              className="flex-1 bg-transparent focus:outline-none text-base font-mixed placeholder:text-slate-400"
              dir="auto"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-8 md:px-16 lg:px-28">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const locked = !!locks[b.id];
            const letter = firstLetter(b.title || b.content);
            const expanded = expandedId === b.id;
            const corner = cornerFor(b.id);
            return (
              <div
                key={b.id}
                onClick={() => openBook(b.id)}
                className="group relative aspect-[3/4] rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition-all overflow-hidden cursor-pointer"
              >
                {b.coverImage ? (
                  <img
                    src={b.coverImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  />
                ) : letter ? (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <div
                      className="absolute font-mixed text-slate-100 font-semibold leading-none"
                      style={{
                        fontSize: "20rem",
                        top: corner.top,
                        left: corner.left,
                      }}
                    >
                      {letter}
                    </div>
                  </div>
                ) : null}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="relative flex items-start justify-between">
                    <div
                      className={`text-[10px] font-mono uppercase tracking-wider ${
                        b.coverImage ? "text-white/90 drop-shadow" : "text-slate-400"
                      }`}
                    >
                      #{b.id}
                    </div>
                    <div className="flex items-center gap-1">
                      {locked && (
                        <div
                          title="Locked"
                          className={`p-1.5 rounded-md ${
                            b.coverImage ? "text-rose-100 bg-black/30" : "text-rose-600"
                          }`}
                        >
                          <Lock size={14} />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(expanded ? null : b.id);
                        }}
                        title="Options"
                        className={`p-1.5 rounded-md ${
                          b.coverImage
                            ? "text-white bg-black/30 hover:bg-black/50"
                            : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                  {!b.coverImage && (
                    <div className="relative">
                      <div
                        className="font-mixed text-base md:text-lg font-medium text-slate-900 leading-snug line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: b.title
                            ? parseInlineMd(b.title.split("\n")[0])
                            : '<span class="text-slate-400">Untitled</span>',
                        }}
                      />
                      {b.author && (
                        <div
                          className="mt-2 font-mixed text-xs md:text-sm text-slate-500 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: parseInlineMd(b.author.split("\n")[0]),
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
                {expanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-10 z-10 bg-white border border-slate-200 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 min-w-[10rem] font-mixed animate-in fade-in-0 zoom-in-95"
                  >
                    <MenuBtn
                      icon={locked ? <Unlock size={14} /> : <Lock size={14} />}
                      label={locked ? "লক সরান" : "লক করুন"}
                      onClick={() => {
                        setExpandedId(null);
                        toggleLock(b.id);
                      }}
                    />
                    <MenuBtn
                      icon={<ImageIcon size={14} />}
                      label={b.coverImage ? "কভার পরিবর্তন" : "কভার যোগ"}
                      onClick={() => {
                        setExpandedId(null);
                        startCover(b.id);
                      }}
                    />
                    {b.coverImage && (
                      <MenuBtn
                        icon={<ImageOff size={14} />}
                        label="কভার সরান"
                        onClick={() => {
                          setExpandedId(null);
                          removeCover(b.id);
                        }}
                      />
                    )}
                    <MenuBtn
                      icon={<Trash2 size={14} />}
                      label="মুছে ফেলুন"
                      danger
                      onClick={() => {
                        setExpandedId(null);
                        startDelete(b.id);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={createBook}
            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-500 transition-all flex flex-col items-center justify-center gap-2 text-slate-500"
            title="নতুন বই"
          >
            <Plus size={32} />
            <span className="text-xs font-medium font-mixed">নতুন বই</span>
          </button>
        </div>
        {books.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-10 font-mixed">
            কোনো বই নেই। + চেপে নতুন বই তৈরি করুন।
          </p>
        )}
      </div>

      <PrettyPasswordPrompt
        open={!!pwdModal}
        icon={pwdModal?.kind === "set-lock" ? "lock" : "unlock"}
        title={
          pwdModal?.kind === "open"
            ? "বই খুলতে পাসওয়ার্ড দিন"
            : pwdModal?.kind === "delete"
            ? "মুছে ফেলার জন্য পাসওয়ার্ড দিন"
            : pwdModal?.kind === "unlock-remove"
            ? "লক সরাতে পাসওয়ার্ড দিন"
            : "নতুন পাসওয়ার্ড দিন"
        }
        description={
          pwdModal?.kind === "set-lock"
            ? "এই বইটি লক হবে। ভুলে গেলে পুনরুদ্ধারের কোনো উপায় নেই — সাবধানে পাসওয়ার্ড সংরক্ষণ করুন।"
            : pwdModal?.kind === "open"
            ? "সঠিক পাসওয়ার্ড দিলে বইটি এই সেশনে খোলা থাকবে।"
            : pwdModal?.kind === "delete"
            ? "লকড বই মুছতে পাসওয়ার্ড লাগে। মুছে ফেললে আর ফিরে পাওয়া যাবে না।"
            : "লক সরানোর পর যেকেউ এই বই খুলতে পারবে।"
        }
        submitLabel={pwdModal?.kind === "set-lock" ? "লক করুন" : "নিশ্চিত করুন"}
        error={pwdError}
        onCancel={() => setPwdModal(null)}
        onSubmit={handlePwdSubmit}
      />

      <ConfirmModal
        open={confirmDelete != null}
        title="বইটি মুছে ফেলবেন?"
        description="এই কাজটি অপরিবর্তনীয় — সমস্ত লেখা, কভার ও সেটিংস স্থায়ীভাবে মুছে যাবে।"
        confirmLabel="মুছে ফেলুন"
        onConfirm={() => {
          if (confirmDelete != null) deleteBookEntirely(confirmDelete);
          setConfirmDelete(null);
          refresh();
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

const MenuBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
      danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-100"
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="flex-1">{label}</span>
  </button>
);

const BookEditor = ({ bookId }: { bookId: number }) => {
  const CACHE_KEY = cacheKeyFor(bookId);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [pdfPassword, setPdfPassword] = useState<string>("");
  const [preview, setPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [includeIndex] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [pdfPwdModal, setPdfPwdModal] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [selToolbar, setSelToolbar] = useState<{ top: number; left: number } | null>(null);

  const setTitleSmart = (v: string) => setTitle(smartQuotes(v));
  const setAuthorSmart = (v: string) => setAuthor(smartQuotes(v));
  const setContentSmart = (v: string) => setContent(smartQuotes(v));

  const insertAtCursor = (text: string) => {
    const ta = contentRef.current;
    if (!ta) {
      setContentSmart(content + text);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = content.slice(0, start) + text + content.slice(end);
    setContentSmart(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const wrapSelection = (marker: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return;
    const selected = content.slice(start, end);
    const next = content.slice(0, start) + marker + selected + marker + content.slice(end);
    setContentSmart(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + marker.length, end + marker.length);
      updateSelToolbar();
    });
  };

  const measureCaretRect = (ta: HTMLTextAreaElement, index: number) => {
    const style = window.getComputedStyle(ta);
    const div = document.createElement("div");
    const props = [
      "boxSizing", "width", "height", "overflowX", "overflowY",
      "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
      "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
      "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize",
      "fontSizeAdjust", "lineHeight", "fontFamily", "textAlign", "textTransform",
      "textIndent", "textDecoration", "letterSpacing", "wordSpacing",
      "tabSize", "MozTabSize" as any, "whiteSpace", "wordWrap",
    ];
    props.forEach((p) => { (div.style as any)[p] = (style as any)[p]; });
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.top = "0";
    div.style.left = "-9999px";
    div.textContent = ta.value.slice(0, index);
    const span = document.createElement("span");
    span.textContent = ta.value.slice(index) || ".";
    div.appendChild(span);
    document.body.appendChild(div);
    const rect = span.getBoundingClientRect();
    const taRect = ta.getBoundingClientRect();
    const top = taRect.top + (rect.top - div.getBoundingClientRect().top) - ta.scrollTop;
    const left = taRect.left + (rect.left - div.getBoundingClientRect().left) - ta.scrollLeft;
    document.body.removeChild(div);
    return { top, left };
  };

  const updateSelToolbar = () => {
    const ta = contentRef.current;
    if (!ta) return setSelToolbar(null);
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) return setSelToolbar(null);
    const { top, left } = measureCaretRect(ta, start);
    setSelToolbar({ top: top - 44, left });
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-selection-toolbar]")) return;
      if (t === contentRef.current) return;
      setSelToolbar(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) insertAtCursor(text);
    } catch {
      alert("ক্লিপবোর্ড পড়া যায়নি। ব্রাউজারের অনুমতি পরীক্ষা করুন।");
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.title === "string") setTitle(p.title);
        if (typeof p.author === "string") setAuthor(p.author);
        if (typeof p.content === "string") setContent(p.content);
        if (typeof p.pdfPassword === "string") setPdfPassword(p.pdfPassword);
        if (typeof p.coverImage === "string") setCoverImage(p.coverImage);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ title, author, content, pdfPassword, coverImage })
      );
    } catch {}
  }, [title, author, content, pdfPassword, coverImage, hydrated]);

  const goBack = () => {
    const empty = !title.trim() && !author.trim() && !content.trim() && !coverImage;
    if (empty) deleteBookEntirely(bookId);
    window.location.hash = "";
  };

  const previewHtml = useMemo(
    () => renderForPreview(content, detectScript(title || content)),
    [content, title]
  );

  const handleDownloadPDF = async () => {
    setGenerating(true);
    setProgress(0);
    setProgressLabel("প্রস্তুতি...");

    const safeTitle = (title || "Untitled").trim();
    const safeAuthor = author.trim();
    const numeralScript = detectScript(safeTitle || content);
    const { html: bodyHtml, defs: footnoteDefs } = renderForPdfBody(content, numeralScript);

    const PAGE_W = 148;
    const PAGE_H = 210;
    const MARGIN = 14;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const CONTENT_H = PAGE_H - MARGIN * 2;
    const SECTION_GAP = 2;

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
    const PX_PER_MM = 3.7795275591;
    const widthPx = Math.round(CONTENT_W * PX_PER_MM);
    container.style.width = `${widthPx}px`;
    container.className = "font-mixed";

    const styleEl = document.createElement("style");
    styleEl.textContent = `
      [data-pdf-body] { color: #0f172a; text-align: justify; hyphens: none; }
      [data-pdf-body] .num-red { color: #dc2626; }
      [data-pdf-body] p { margin: 0 0 0.85em 0; padding-bottom: 0.35em; line-height: 1.85; }
      [data-pdf-body] li { line-height: 1.85; padding-bottom: 0.2em; }
      [data-pdf-body] [dir="rtl"] {
        line-height: 2.4 !important;
        padding-top: 0.6em;
        padding-bottom: 0.95em;
      }
      [data-pdf-body] p[dir="rtl"],
      [data-pdf-body] li[dir="rtl"],
      [data-pdf-body] blockquote[dir="rtl"] {
        font-family: 'Scheherazade New', 'Noto Naskh Arabic', 'TimesNR', serif;
      }
      [data-pdf-body] h1, [data-pdf-body] h2, [data-pdf-body] h3,
      [data-pdf-body] h4, [data-pdf-body] h5, [data-pdf-body] h6 {
        font-family: inherit; font-weight: 400; text-align: center;
        margin: 1em 0 0.55em; line-height: 1.55; padding: 0.2em 0 0.45em;
      }
      [data-pdf-body] h1[dir="rtl"], [data-pdf-body] h2[dir="rtl"],
      [data-pdf-body] h3[dir="rtl"], [data-pdf-body] h4[dir="rtl"],
      [data-pdf-body] h5[dir="rtl"], [data-pdf-body] h6[dir="rtl"] {
        line-height: 1.9; padding: 0.25em 0 0.8em;
      }
      [data-pdf-body] h1 { font-size: 22pt; }
      [data-pdf-body] h2 { font-size: 18pt; }
      [data-pdf-body] h3 { font-size: 15pt; }
      [data-pdf-body] h4 { font-size: 13pt; }
      [data-pdf-body] h5 { font-size: 12pt; }
      [data-pdf-body] h6 { font-size: 11.5pt; }
      [data-pdf-body] ul, [data-pdf-body] ol {
        margin: 0 0 0.75em 0; padding-left: 0; list-style: none;
      }
      [data-pdf-body] ol { counter-reset: pdf-ol; }
      [data-pdf-body] ul > li, [data-pdf-body] ol > li {
        position: relative; padding-left: 1.4em; margin: 0.1em 0; line-height: 1.6;
      }
      [data-pdf-body] ul > li::before {
        content: "•"; position: absolute; left: 0.45em; top: 0; line-height: 1.6; color: #0f172a;
      }
      [data-pdf-body] ol > li { counter-increment: pdf-ol; }
      [data-pdf-body] ol > li::before {
        content: counter(pdf-ol) "."; position: absolute; left: 0; top: 0;
        width: 1.2em; text-align: right; line-height: 1.6;
      }
      [data-pdf-body] li > p { margin: 0; }
      [data-pdf-body] ol.numeral-ol > li { padding-left: 2em; line-height: 1.6; }
      [data-pdf-body] ol.numeral-ol > li::before { content: none; }
      [data-pdf-body] ol.numeral-ol .num-marker {
        position: absolute; left: 0; top: 0; width: 1.7em; text-align: right;
        line-height: 1.6; padding-right: 0.3em;
      }
      [data-pdf-body] blockquote {
        margin: 0.6em 0 1em; padding: 0.3em 1em;
        border-left: 4px solid #dc2626;
        background: #fef2f2; border-radius: 6px;
        color: #334155; font-style: italic;
      }
      [data-pdf-body] hr {
        border: none; border-top: 2px solid #64748b; margin: 1.4em 0; height: 0;
      }
      [data-pdf-body] code {
        background: #f1f5f9; padding: 0.05em 0.35em; border-radius: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em;
      }
      [data-pdf-body] pre {
        background: #282c34; color: #abb2bf; padding: 0.9em 1em; border-radius: 8px;
        overflow: visible; white-space: pre-wrap;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 9.5pt; line-height: 1.5; margin: 0 0 1em 0;
      }
      [data-pdf-body] pre code { background: transparent; padding: 0; color: inherit; }
      [data-pdf-body] .hljs-keyword, [data-pdf-body] .hljs-selector-tag, [data-pdf-body] .hljs-built_in { color: #c678dd; }
      [data-pdf-body] .hljs-string, [data-pdf-body] .hljs-attr { color: #98c379; }
      [data-pdf-body] .hljs-number, [data-pdf-body] .hljs-literal { color: #d19a66; }
      [data-pdf-body] .hljs-comment, [data-pdf-body] .hljs-quote { color: #5c6370; font-style: italic; }
      [data-pdf-body] .hljs-function, [data-pdf-body] .hljs-title { color: #61afef; }
      [data-pdf-body] .hljs-variable, [data-pdf-body] .hljs-name, [data-pdf-body] .hljs-tag { color: #e06c75; }
      [data-pdf-body] .hljs-type, [data-pdf-body] .hljs-class .hljs-title { color: #e5c07b; }
      [data-pdf-body] .hljs-meta, [data-pdf-body] .hljs-symbol { color: #56b6c2; }
      [data-pdf-body] a { color: #1d4ed8; text-decoration: none; border-bottom: none; }
      [data-pdf-body] strong { font-weight: 700; }
      [data-pdf-body] em { font-style: italic; }

      /* Full markdown table — matches the on-screen preview */
      [data-pdf-body] table {
        border-collapse: collapse; width: 100%;
        margin: 0.6em 0 1.2em; table-layout: fixed; word-wrap: break-word;
        font-size: 10pt;
      }
      [data-pdf-body] th, [data-pdf-body] td {
        border: 1px solid #94a3b8;
        padding: 6px 9px;
        vertical-align: top;
        text-align: left;
        line-height: 1.5;
        box-sizing: border-box;
      }
      [data-pdf-body] th { background: #f1f5f9; font-weight: 600; }
      [data-pdf-body] td > p:only-child, [data-pdf-body] th > p:only-child { margin: 0; padding: 0; }
      [data-pdf-body] td[dir="rtl"], [data-pdf-body] th[dir="rtl"] {
        text-align: right; line-height: 1.9; padding: 8px 9px 12px 9px;
      }
      [data-pdf-body] img { max-width: 100%; height: auto; display: block; margin: 0.5em auto; }

      [data-pdf-body] .fn-ref {
        font-size: 0.7em; vertical-align: super; line-height: 0;
        color: #1d4ed8; margin: 0 0.05em;
      }
      [data-pdf-body] .fn-item {
        display: flex; gap: 0.5em; align-items: flex-start;
        margin: 0; padding: 0 0 0.15em 0; line-height: 1.4;
      }
      [data-pdf-body] .fn-item .fn-num {
        font-weight: 600; min-width: 1.6em; text-align: right;
        color: #1d4ed8; line-height: 1.4;
      }
      [data-pdf-body] .fn-item .fn-body {
        flex: 1; text-align: justify; line-height: 1.4; padding-bottom: 0.2em;
      }
      [data-pdf-body] .fn-item .fn-body > p {
        margin: 0; padding-bottom: 0.12em; line-height: 1.4;
      }
      [data-pdf-body] .fn-item .fn-body [dir="rtl"] {
        line-height: 1.9 !important; padding-bottom: 0.55em;
      }

      /* Index list — dotted leader; Arabic rows kept tight */
      [data-pdf-index] .idx-row {
        display: flex; align-items: flex-end; gap: 6px;
        margin: 0.28em 0; font-size: 11pt; line-height: 1.35;
      }
      [data-pdf-index] .idx-row[dir="rtl"] {
        line-height: 1.4; margin: 0.22em 0;
        font-family: 'Scheherazade New', 'Noto Naskh Arabic', 'TimesNR', serif;
      }
      [data-pdf-index] .idx-name { flex: 0 0 auto; padding-bottom: 2px; }
      [data-pdf-index] .idx-dots {
        flex: 1 1 auto; min-width: 20px;
        border-bottom: 1.5px dotted #94a3b8;
        transform: translateY(-4px);
      }
      [data-pdf-index] .idx-page {
        flex: 0 0 auto; color: #334155; padding-bottom: 2px;
        font-variant-numeric: tabular-nums;
      }
    `;
    container.appendChild(styleEl);

    const mlInline = (s: string) => s.split("\n").map(parseInlineMd).join("<br>");
    const coverHtml = `
      <div data-pdf-section data-pdf-cover style="
        width: 100%; box-sizing: border-box; padding-top: 8mm;
        text-align: center; position: relative; min-height: ${CONTENT_H}mm;">
        <h1 style="
          font-size: 26pt; font-weight: 400; line-height: 1.35;
          margin: 0 0 14mm 0; padding: 0.15em 0 0.25em;
          word-break: keep-all; overflow-wrap: break-word;
          font-feature-settings: normal; font-variant-ligatures: normal; white-space: normal;
        ">${mlInline(safeTitle)}</h1>
        ${
          safeAuthor
            ? `<div style="font-size: 12pt; line-height: 1.4; color: #334155; white-space: pre-wrap;">${mlInline(safeAuthor)}</div>`
            : ""
        }
        <div style="position: absolute; left: 0; right: 0; bottom: 6mm; text-align: center;
          font-size: 9pt; color: #475569;">Compiled by Abdullah Bari Asif.</div>
      </div>
    `;

    const bodyWrap = document.createElement("div");
    bodyWrap.className = "tiptap";
    bodyWrap.setAttribute("data-pdf-body", "");
    bodyWrap.style.fontSize = "11pt";
    bodyWrap.style.lineHeight = "1.65";
    bodyWrap.style.textAlign = "justify";
    bodyWrap.innerHTML = bodyHtml;

    const coverWrap = document.createElement("div");
    coverWrap.innerHTML = coverHtml;
    container.appendChild(coverWrap);
    container.appendChild(bodyWrap);
    document.body.appendChild(container);

    try {
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
    } catch {}
    await new Promise((r) => setTimeout(r, 50));

    try {
      const pdfOpts: any = {
        orientation: "portrait",
        unit: "mm",
        format: "a5",
        compress: true,
      };
      if (pdfPassword) {
        pdfOpts.encryption = {
          userPassword: pdfPassword,
          ownerPassword: pdfPassword,
          userPermissions: ["print", "copy"],
        };
      }
      const pdf = new jsPDF(pdfOpts);

      const renderScale = 3;
      const JPEG_Q = 0.78;

      type LinkRect = { x: number; y: number; w: number; h: number; href: string };
      type CaptureResult = {
        dataUrl: string; heightMM: number;
        elWidthPx: number; elHeightPx: number;
        links: LinkRect[]; canvas: HTMLCanvasElement;
      };

      const captureElement = async (el: HTMLElement, opts: { pad?: boolean } = {}): Promise<CaptureResult> => {
        const pad = opts.pad !== false;
        const prevPadTop = el.style.paddingTop;
        const prevPadBot = el.style.paddingBottom;
        let padApplied = false;
        if (pad) {
          const cs = window.getComputedStyle(el);
          const curTop = parseFloat(cs.paddingTop) || 0;
          const curBot = parseFloat(cs.paddingBottom) || 0;
          if (curTop < 3 && curBot < 3) {
            el.style.paddingTop = "2px";
            el.style.paddingBottom = "2px";
            padApplied = true;
          }
        }
        const baseRect = el.getBoundingClientRect();
        const links: LinkRect[] = [];
        el.querySelectorAll("a[href]").forEach((a) => {
          const href = (a as HTMLAnchorElement).href;
          if (!href) return;
          const rects = (a as HTMLAnchorElement).getClientRects();
          for (const r of Array.from(rects)) {
            links.push({ x: r.left - baseRect.left, y: r.top - baseRect.top, w: r.width, h: r.height, href });
          }
        });
        const canvas = await html2canvas(el, {
          scale: renderScale, useCORS: true, backgroundColor: "#ffffff",
          logging: false, windowWidth: widthPx,
        });
        if (padApplied) {
          el.style.paddingTop = prevPadTop;
          el.style.paddingBottom = prevPadBot;
        }
        const elWidthPx = canvas.width / renderScale;
        const elHeightPx = canvas.height / renderScale;
        const mmPerPx = CONTENT_W / elWidthPx;
        const heightMM = elHeightPx * mmPerPx;
        return {
          dataUrl: canvas.toDataURL("image/jpeg", JPEG_Q),
          heightMM, elWidthPx, elHeightPx, links, canvas,
        };
      };

      const sliceSection = (section: CaptureResult, syPx: number, shPx: number) => {
        const src = section.canvas;
        const scale = src.width / section.elWidthPx;
        const slice = document.createElement("canvas");
        slice.width = src.width;
        slice.height = Math.round(shPx * scale);
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(src, 0, Math.round(syPx * scale), src.width, slice.height, 0, 0, src.width, slice.height);
        const mmPerPx = CONTENT_W / section.elWidthPx;
        return { dataUrl: slice.toDataURL("image/jpeg", JPEG_Q), heightMM: shPx * mmPerPx };
      };

      const addLinkAnnotations = (section: CaptureResult, xOffsetMM: number, yOffsetMM: number, drawW: number, drawH: number) => {
        const sx = drawW / section.elWidthPx;
        const sy = drawH / section.elHeightPx;
        for (const lk of section.links) {
          pdf.link(xOffsetMM + lk.x * sx, yOffsetMM + lk.y * sy, lk.w * sx, lk.h * sy, { url: lk.href });
        }
      };

      let firstPageUsed = false;
      if (coverImage) {
        try {
          pdf.addImage(coverImage, "JPEG", 0, 0, PAGE_W, PAGE_H);
          firstPageUsed = true;
        } catch {}
      }

      if (firstPageUsed) pdf.addPage();
      const coverEl = container.querySelector("[data-pdf-cover]") as HTMLElement;
      const cover = await captureElement(coverEl);
      const coverDrawH = Math.min(cover.heightMM, CONTENT_H);
      pdf.addImage(cover.dataUrl, "JPEG", MARGIN, MARGIN, CONTENT_W, coverDrawH);
      addLinkAnnotations(cover, MARGIN, MARGIN, CONTENT_W, coverDrawH);

      const bodyChildren = Array.from(bodyWrap.children) as HTMLElement[];
      let bodyPageNum = 0;
      const cleanChapterText = (el: HTMLElement) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(".fn-ref").forEach((n) => n.remove());
        return (clone.textContent || "").trim();
      };

      const numberCache = new Map<number, { dataUrl: string; wMM: number; hMM: number }>();
      const PAGE_NUM_PT = 9;
      const renderNumberTile = async (n: number) => {
        const cached = numberCache.get(n);
        if (cached) return cached;
        const label = toNumerals(n, numeralScript);
        const numDiv = document.createElement("div");
        numDiv.style.position = "fixed";
        numDiv.style.left = "-9999px";
        numDiv.style.top = "0";
        numDiv.style.padding = "10px 6px";
        numDiv.style.margin = "0";
        numDiv.style.display = "inline-block";
        numDiv.style.background = "#ffffff";
        numDiv.style.color = "#475569";
        numDiv.style.fontSize = `${PAGE_NUM_PT * 3}pt`;
        numDiv.style.lineHeight = "1.6";
        numDiv.style.whiteSpace = "nowrap";
        numDiv.style.fontFamily =
          "'TimesNR', 'Times New Roman', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', Times, serif";
        numDiv.textContent = label;
        document.body.appendChild(numDiv);
        try {
          const c = await html2canvas(numDiv, { scale: 2, backgroundColor: "#ffffff", logging: false });
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
        const edgePad = 8;
        const y = 2;
        const isOdd = bodyPageNum % 2 === 1;
        const x = isOdd ? PAGE_W - edgePad - tile.wMM : edgePad;
        pdf.addImage(tile.dataUrl, "PNG", x, y, tile.wMM, tile.hMM);
      };

      type FnTile = { id: string; cap: CaptureResult };
      const fnTiles = new Map<string, FnTile>();
      const allRefIds: string[] = (() => {
        const seen = new Set<string>();
        const order: string[] = [];
        bodyWrap.querySelectorAll(".fn-ref").forEach((r) => {
          const id = r.getAttribute("data-fn-id");
          if (id && footnoteDefs.has(id) && !seen.has(id)) { seen.add(id); order.push(id); }
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
          const bodyHtmlF = renderFootnoteBodyHtml(footnoteDefs.get(id) || "");
          const item = document.createElement("div");
          item.className = "fn-item";
          item.innerHTML = `<span class="fn-num">${escapeHtml(label)}.</span><div class="fn-body">${bodyHtmlF}</div>`;
          fnWrap.appendChild(item);
          const cap = await captureElement(item, { pad: true });
          fnTiles.set(id, { id, cap });
        }
        fnWrap.remove();
      }

      const DIV_GAP_TOP = 2.5;
      const DIV_GAP_BOT = 1.8;
      const FN_ITEM_GAP = 0.4;
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

      const idsInChild = (child: HTMLElement) => {
        const out: string[] = [];
        child.querySelectorAll(".fn-ref").forEach((r) => {
          const id = r.getAttribute("data-fn-id");
          if (id && fnTiles.has(id) && !out.includes(id)) out.push(id);
        });
        return out;
      };

      type Chapter = { level: number; text: string; page: number };
      const chapters: Chapter[] = [];
      const coverPages = 1 + (firstPageUsed ? 1 : 0);

      if (bodyChildren.length > 0) {
        pdf.addPage();
        await stampPageNumber();
        let currentY = MARGIN;
        setProgressLabel("পৃষ্ঠা রেন্ডার...");
        for (let ci = 0; ci < bodyChildren.length; ci++) {
          const child = bodyChildren[ci];
          setProgress(0.1 + 0.8 * (ci / Math.max(1, bodyChildren.length)));
          const isEmpty = !child.textContent?.trim() && child.querySelectorAll("img").length === 0;
          if (isEmpty) { currentY += 4; continue; }

          const section = await captureElement(child);
          const mmPerPx = CONTENT_W / section.elWidthPx;

          const tag = (child.tagName || "").toUpperCase();
          const isHeading = tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4" || tag === "H5" || tag === "H6";

          if (isHeading && currentY > MARGIN) {
            const remainingAfter = PAGE_H - MARGIN - currentY - section.heightMM;
            let breakBefore = remainingAfter < 32;
            if (!breakBefore) {
              for (let j = ci + 1; j < bodyChildren.length; j++) {
                const nx = bodyChildren[j];
                if (!nx.textContent?.trim() && nx.querySelectorAll("img").length === 0) continue;
                if (remainingAfter < 8) breakBefore = true;
                break;
              }
            }
            if (breakBefore) {
              flushFootnotes();
              pdf.addPage();
              await stampPageNumber();
              currentY = MARGIN;
            }
          }

          const childIds = idsInChild(child);
          const reservedFor = (ids: string[]) => {
            if (ids.length === 0) return 0;
            let h = DIV_GAP_TOP + DIV_GAP_BOT;
            ids.forEach((id, i) => {
              h += fnTiles.get(id)!.cap.heightMM;
              if (i < ids.length - 1) h += FN_ITEM_GAP;
            });
            return h;
          };

          const tentativeIdsWhole = [...pageFnIds, ...childIds.filter((id) => !pageFnIds.includes(id))];
          const wholeAvail = PAGE_H - MARGIN - reservedFor(tentativeIdsWhole) - currentY;

          if (section.heightMM <= wholeAvail) {
            if (tag === "H1" || tag === "H2" || tag === "H3") {
              chapters.push({ level: parseInt(tag.substring(1), 10), text: cleanChapterText(child), page: bodyPageNum });
            }
            pdf.addImage(section.dataUrl, "JPEG", MARGIN, currentY, CONTENT_W, section.heightMM);
            addLinkAnnotations(section, MARGIN, currentY, CONTENT_W, section.heightMM);
            currentY += section.heightMM + SECTION_GAP;
            for (const id of childIds) if (!pageFnIds.includes(id)) pageFnIds.push(id);
            continue;
          }

          const freshAvail = CONTENT_H - reservedFor(childIds);
          if (section.heightMM <= freshAvail && currentY > MARGIN) {
            flushFootnotes();
            pdf.addPage();
            await stampPageNumber();
            currentY = MARGIN;
            if (tag === "H1" || tag === "H2" || tag === "H3") {
              chapters.push({ level: parseInt(tag.substring(1), 10), text: cleanChapterText(child), page: bodyPageNum });
            }
            pdf.addImage(section.dataUrl, "JPEG", MARGIN, currentY, CONTENT_W, section.heightMM);
            addLinkAnnotations(section, MARGIN, currentY, CONTENT_W, section.heightMM);
            currentY += section.heightMM + SECTION_GAP;
            for (const id of childIds) if (!pageFnIds.includes(id)) pageFnIds.push(id);
            continue;
          }

          if (tag === "H1" || tag === "H2" || tag === "H3") {
            chapters.push({ level: parseInt(tag.substring(1), 10), text: cleanChapterText(child), page: bodyPageNum });
          }
          let remainingPx = section.elHeightPx;
          let srcYpx = 0;
          for (const id of childIds) if (!pageFnIds.includes(id)) pageFnIds.push(id);

          while (remainingPx > 0) {
            const availMM = PAGE_H - MARGIN - reservedFor(pageFnIds) - currentY;
            const availPx = availMM / mmPerPx;
            if (availPx < 30 / mmPerPx) {
              flushFootnotes();
              pdf.addPage();
              await stampPageNumber();
              currentY = MARGIN;
              continue;
            }
            const takePx = Math.min(remainingPx, availPx);
            const slice = sliceSection(section, srcYpx, takePx);
            pdf.addImage(slice.dataUrl, "JPEG", MARGIN, currentY, CONTENT_W, slice.heightMM);
            const sliceTopPx = srcYpx;
            const sliceBotPx = srcYpx + takePx;
            for (const lk of section.links) {
              if (lk.y >= sliceTopPx && lk.y + lk.h <= sliceBotPx) {
                const localY = lk.y - sliceTopPx;
                pdf.link(MARGIN + lk.x * mmPerPx, currentY + localY * mmPerPx, lk.w * mmPerPx, lk.h * mmPerPx, { url: lk.href });
              }
            }
            currentY += slice.heightMM;
            srcYpx += takePx;
            remainingPx -= takePx;
            if (remainingPx > 0) {
              flushFootnotes();
              pdf.addPage();
              await stampPageNumber();
              currentY = MARGIN;
            } else {
              currentY += SECTION_GAP;
            }
          }
        }
        flushFootnotes();
      }

      if (includeIndex && chapters.length > 0) {
        const idxTitle = indexTitle(numeralScript);
        const arabicRe = /[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufeff]/;
        const isRTL = chapters.every((c) => arabicRe.test(c.text));
        const rows = chapters
          .map((ch) => {
            const pgLabel = toNumerals(ch.page, numeralScript);
            return `<div class="idx-row" dir="${isRTL ? "rtl" : "ltr"}">
              <span class="idx-name">${escapeHtml(ch.text)}</span>
              <span class="idx-dots"></span>
              <span class="idx-page">${escapeHtml(pgLabel)}</span>
            </div>`;
          })
          .join("");
        const indexHtml = `
          <div data-pdf-body data-pdf-index dir="${isRTL ? "rtl" : "ltr"}" style="box-sizing: border-box; font-size: 11pt; line-height: 1.55;">
            <h1 style="font-family: inherit; font-weight: 400; text-align: center; font-size: 22pt; margin: 0 0 10mm 0;">${escapeHtml(idxTitle)}</h1>
            ${rows}
          </div>`;
        const idxWrap = document.createElement("div");
        idxWrap.style.width = `${widthPx}px`;
        idxWrap.innerHTML = indexHtml;
        const idxEl = idxWrap.firstElementChild as HTMLElement;
        container.appendChild(idxWrap);
        const cap = await captureElement(idxEl);
        container.removeChild(idxWrap);

        const idxMmPerPx = CONTENT_W / cap.elWidthPx;
        let remPx = cap.elHeightPx;
        let yPx = 0;
        let insertAt = coverPages + 1;
        while (remPx > 0) {
          const availPx = CONTENT_H / idxMmPerPx;
          const takePx = Math.min(remPx, availPx);
          const slice = sliceSection(cap, yPx, takePx);
          pdf.insertPage(insertAt);
          pdf.setPage(insertAt);
          pdf.addImage(slice.dataUrl, "JPEG", MARGIN, MARGIN, CONTENT_W, slice.heightMM);
          yPx += takePx;
          remPx -= takePx;
          insertAt += 1;
        }
      }

      const filename = safeTitle.replace(/[^a-z0-9\u0980-\u09FF\s-]/gi, "").trim() || "book";
      setProgress(0.98);
      setProgressLabel("সংরক্ষণ...");
      pdf.save(`${filename}.pdf`);
      setProgress(1);
    } finally {
      container.remove();
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
        setProgressLabel("");
      }, 350);
    }
  };

  const [pdfPwdError] = useState<string | undefined>();
  const handlePdfPwdSubmit = (pwd: string) => {
    setPdfPassword(pwd);
    setPdfPwdModal(false);
  };
  const removePdfPwd = () => {
    setPdfPassword("");
    setPdfPwdModal(false);
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-10 md:px-20 md:pt-20 lg:px-32 lg:pt-24 pb-40 md:pl-24 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-10">
        <div className="space-y-4 border-b border-slate-100 pb-10">
          <textarea
            value={title}
            onChange={(e) => setTitleSmart(e.target.value)}
            placeholder="বইয়ের নাম"
            rows={1}
            ref={(el) => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
            className="w-full font-mixed text-4xl md:text-5xl font-medium tracking-tight bg-transparent border-none focus:outline-none placeholder:text-slate-300 resize-none overflow-hidden leading-tight"
            dir="auto"
          />
          <textarea
            value={author}
            onChange={(e) => setAuthorSmart(e.target.value)}
            placeholder="লেখকের নাম (Enter দিয়ে নতুন লাইন)"
            rows={1}
            ref={(el) => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
            className="w-full font-mixed text-lg md:text-xl text-slate-600 bg-transparent border-none focus:outline-none placeholder:text-slate-300 resize-none overflow-hidden leading-snug"
            dir="auto"
          />
        </div>

        {preview ? (
          <div
            className="font-mixed prose-xl md:prose-2xl max-w-none pdf-preview"
            dir="auto"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => {
              setContentSmart(e.target.value);
              requestAnimationFrame(updateSelToolbar);
            }}
            onSelect={updateSelToolbar}
            onMouseUp={updateSelToolbar}
            onKeyUp={updateSelToolbar}
            onBlur={() => setTimeout(() => setSelToolbar(null), 150)}
            placeholder="এখানে লিখা শুরু করুন... (Markdown সমর্থিত)"
            dir="auto"
            className="w-full font-mixed text-xl md:text-2xl bg-transparent border-none focus:outline-none placeholder:text-slate-300 resize-none leading-relaxed min-h-[70vh]"
            style={{ whiteSpace: "pre-wrap" }}
          />
        )}
      </div>

      {selToolbar && !preview && (
        <div
          data-selection-toolbar
          className="fixed z-50 flex items-center gap-1 bg-slate-900 text-white rounded-xl shadow-2xl px-1 py-1 animate-in fade-in-0 zoom-in-95"
          style={{ top: Math.max(8, selToolbar.top), left: Math.max(8, selToolbar.left) }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button onClick={() => wrapSelection("**")} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Bold">
            <BoldIcon size={16} />
          </button>
          <button onClick={() => wrapSelection("*")} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Italic">
            <ItalicIcon size={16} />
          </button>
        </div>
      )}

      <div
        className="fixed z-40 pointer-events-none
                   bottom-3 left-3 right-3 flex justify-center
                   md:bottom-auto md:right-auto md:top-1/2 md:-translate-y-1/2 md:left-3 md:flex-col md:justify-start"
      >
        {generating ? (
          <div className="pointer-events-auto w-full max-w-sm md:max-w-[14rem] bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-2 gap-3">
              <div className="flex items-center gap-2 text-slate-800 text-sm font-medium">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs font-mixed">{progressLabel || "কাজ চলছে..."}</span>
              </div>
              <span className="text-xs text-slate-500 tabular-nums">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 transition-all duration-200" style={{ width: `${Math.max(2, Math.round(progress * 100))}%` }} />
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto flex md:flex-col gap-1 bg-white border border-slate-200 shadow-lg rounded-xl p-1 max-w-full overflow-x-auto md:overflow-visible">
            <SquareBtn onClick={goBack} title="Back to library"><ArrowLeft size={18} /></SquareBtn>
            <SquareBtn onClick={handlePaste} title="Paste from clipboard"><ClipboardPaste size={18} /></SquareBtn>
            <SquareBtn
              onClick={() => setPdfPwdModal(true)}
              title={pdfPassword ? "PDF পাসওয়ার্ড সেট" : "PDF পাসওয়ার্ড দিন"}
              className={pdfPassword ? "bg-amber-500 text-white hover:bg-amber-600" : ""}
            >
              <FileLock2 size={18} />
            </SquareBtn>
            <SquareBtn onClick={() => setPreview((p) => !p)} title={preview ? "Edit" : "Preview"}>
              {preview ? <Pencil size={18} /> : <Eye size={18} />}
            </SquareBtn>
            <SquareBtn
              onClick={handleDownloadPDF}
              title="Download PDF"
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Download size={18} />
            </SquareBtn>
          </div>
        )}
      </div>

      <PrettyPasswordPrompt
        open={pdfPwdModal}
        icon="file"
        title={pdfPassword ? "PDF পাসওয়ার্ড পরিবর্তন" : "PDF-এর জন্য পাসওয়ার্ড"}
        description="এই পাসওয়ার্ড দিয়ে exported PDF এনক্রিপ্ট হবে। প্রিন্ট ও কপি অনুমোদিত থাকবে।"
        submitLabel="সংরক্ষণ"
        error={pdfPwdError}
        onCancel={() => setPdfPwdModal(false)}
        onSubmit={handlePdfPwdSubmit}
        extraActions={
          pdfPassword
            ? [{ label: "পাসওয়ার্ড সরান", onClick: removePdfPwd, tone: "danger" }]
            : undefined
        }
      />
    </div>
  );
};

const SquareBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors ${className}`}
  >
    {children}
  </button>
);

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default BookRouter;
