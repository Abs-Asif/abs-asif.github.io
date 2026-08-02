import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Download,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Plus,
  Search,
  ArrowLeft,
  Lock,
  Unlock,
  FileLock2,
  MoreHorizontal,
  Image as ImageIcon,
  X,
  EyeOff,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/* ---------- Quran Surah List ---------- */
const SURAHS = [
  { id: 1, name: "Al-Fatihah", nameBn: "আল ফাতিহা", totalVerses: 7 },
  { id: 2, name: "Al-Baqarah", nameBn: "আল বাকারা", totalVerses: 286 },
  { id: 3, name: "Ali 'Imran", nameBn: "আলে ইমরান", totalVerses: 200 },
  { id: 4, name: "An-Nisa", nameBn: "আন নিসা", totalVerses: 176 },
  { id: 5, name: "Al-Ma'idah", nameBn: "আল মায়িদাহ", totalVerses: 120 },
  { id: 6, name: "Al-An'am", nameBn: "আল আনআম", totalVerses: 165 },
  { id: 7, name: "Al-A'raf", nameBn: "আল আরাফ", totalVerses: 206 },
  { id: 8, name: "Al-Anfal", nameBn: "আল আনফাল", totalVerses: 75 },
  { id: 9, name: "At-Tawbah", nameBn: "আত তাওবাহ", totalVerses: 129 },
  { id: 10, name: "Yunus", nameBn: "ইউনুস", totalVerses: 109 },
  { id: 11, name: "Hud", nameBn: "হুদ", totalVerses: 123 },
  { id: 12, name: "Yusuf", nameBn: "ইউসুফ", totalVerses: 111 },
  { id: 13, name: "Ar-Ra'd", nameBn: "আর রা'দ", totalVerses: 43 },
  { id: 14, name: "Ibrahim", nameBn: "ইব্রাহিম", totalVerses: 52 },
  { id: 15, name: "Al-Hijr", nameBn: "আল হিজর", totalVerses: 99 },
  { id: 16, name: "An-Nahl", nameBn: "আন নাহল", totalVerses: 128 },
  { id: 17, name: "Al-Isra", nameBn: "আল ইসরা", totalVerses: 111 },
  { id: 18, name: "Al-Kahf", nameBn: "আল কাহফ", totalVerses: 110 },
  { id: 19, name: "Maryam", nameBn: "মারইয়াম", totalVerses: 98 },
  { id: 20, name: "Taha", nameBn: "ত্বোয়া-হা", totalVerses: 135 },
  { id: 21, name: "Al-Anbya", nameBn: "আল আম্বিয়া", totalVerses: 112 },
  { id: 22, name: "Al-Hajj", nameBn: "আল হাজ্জ্ব", totalVerses: 78 },
  { id: 23, name: "Al-Mu'minun", nameBn: "আল মুমিনুন", totalVerses: 118 },
  { id: 24, name: "An-Nur", nameBn: "আন নূর", totalVerses: 64 },
  { id: 25, name: "Al-Furqan", nameBn: "আল ফুরকান", totalVerses: 77 },
  { id: 26, name: "Ash-Shu'ara", nameBn: "আশ শুয়ারা", totalVerses: 227 },
  { id: 27, name: "An-Naml", nameBn: "আন নামল", totalVerses: 93 },
  { id: 28, name: "Al-Qasas", nameBn: "আল কাসাস", totalVerses: 88 },
  { id: 29, name: "Al-'Ankabut", nameBn: "আল আনকাবুত", totalVerses: 69 },
  { id: 30, name: "Ar-Rum", nameBn: "আর রুম", totalVerses: 60 },
  { id: 31, name: "Luqman", nameBn: "লোকমান", totalVerses: 34 },
  { id: 32, name: "As-Sajdah", nameBn: "আস সাজদাহ", totalVerses: 30 },
  { id: 33, name: "Al-Ahzab", nameBn: "আল আহযাব", totalVerses: 73 },
  { id: 34, name: "Saba", nameBn: "সাবা", totalVerses: 54 },
  { id: 35, name: "Fatir", nameBn: "ফাতির", totalVerses: 45 },
  { id: 36, name: "Ya-Sin", nameBn: "ইয়াসীন", totalVerses: 83 },
  { id: 37, name: "As-Saffat", nameBn: "আস সাফফাত", totalVerses: 182 },
  { id: 38, name: "Sad", nameBn: "ছোয়াদ", totalVerses: 88 },
  { id: 39, name: "Az-Zumar", nameBn: "আজ জুমার", totalVerses: 75 },
  { id: 40, name: "Ghafir", nameBn: "গাফির", totalVerses: 85 },
  { id: 41, name: "Fussilat", nameBn: "ফুসসিলাত", totalVerses: 54 },
  { id: 42, name: "Ash-Shuraa", nameBn: "আশ শুরা", totalVerses: 53 },
  { id: 43, name: "Az-Zukhruf", nameBn: "আজ জুখরুফ", totalVerses: 89 },
  { id: 44, name: "Ad-Dukhan", nameBn: "আদ দুখান", totalVerses: 59 },
  { id: 45, name: "Al-Jathiyah", nameBn: "আল জাসিয়াহ", totalVerses: 37 },
  { id: 46, name: "Al-Ahqaf", nameBn: "আল আহকাফ", totalVerses: 35 },
  { id: 47, name: "Muhammad", nameBn: "মুহাম্মদ", totalVerses: 38 },
  { id: 48, name: "Al-Fath", nameBn: "আল ফাতহ", totalVerses: 29 },
  { id: 49, name: "Al-Hujurat", nameBn: "আল হুজুরাত", totalVerses: 18 },
  { id: 50, name: "Qaf", nameBn: "কাফ", totalVerses: 45 },
  { id: 51, name: "Adh-Dhariyat", nameBn: "আজ জারিয়াত", totalVerses: 60 },
  { id: 52, name: "At-Tur", nameBn: "আত তূর", totalVerses: 49 },
  { id: 53, name: "An-Najm", nameBn: "আন নাজম", totalVerses: 62 },
  { id: 54, name: "Al-Qamar", nameBn: "আল কমার", totalVerses: 55 },
  { id: 55, name: "Ar-Rahman", nameBn: "আর রহমান", totalVerses: 78 },
  { id: 56, name: "Al-Waqi'ah", nameBn: "আল ওয়াকিয়াহ", totalVerses: 96 },
  { id: 57, name: "Al-Hadid", nameBn: "আল হাদীদ", totalVerses: 29 },
  { id: 58, name: "Al-Mujadila", nameBn: "আল মুজাদাलाহ", totalVerses: 22 },
  { id: 59, name: "Al-Hashr", nameBn: "আল হাশর", totalVerses: 24 },
  { id: 60, name: "Al-Mumtahanah", nameBn: "আল মুমতাহিনাহ", totalVerses: 13 },
  { id: 61, name: "As-Saf", nameBn: "আস সাফ", totalVerses: 14 },
  { id: 62, name: "Al-Jumu'ah", nameBn: "আল জুমুআহ", totalVerses: 11 },
  { id: 63, name: "Al-Munafiqun", nameBn: "আল মুনাফিকুন", totalVerses: 11 },
  { id: 64, name: "At-Taghabun", nameBn: "আত তাগাবুন", totalVerses: 18 },
  { id: 65, name: "At-Talaq", nameBn: "আত তালাক", totalVerses: 12 },
  { id: 66, name: "At-Tahrim", nameBn: "আত তাহরীম", totalVerses: 12 },
  { id: 67, name: "Al-Mulk", nameBn: "আল মুলক", totalVerses: 30 },
  { id: 68, name: "Al-Qalam", nameBn: "আল কলম", totalVerses: 52 },
  { id: 69, name: "Al-Haqqah", nameBn: "আল হাক্কাহ", totalVerses: 52 },
  { id: 70, name: "Al-Ma'arij", nameBn: "আল মাআরিজ", totalVerses: 44 },
  { id: 71, name: "Nuh", nameBn: "নূহ", totalVerses: 28 },
  { id: 72, name: "Al-Jinn", nameBn: "আল জিন", totalVerses: 28 },
  { id: 73, name: "Al-Muzzammil", nameBn: "আল মুযযাম্মিল", totalVerses: 20 },
  { id: 74, name: "Al-Muddaththir", nameBn: "আল মুদ্দাসসের", totalVerses: 56 },
  { id: 75, name: "Al-Qiyamah", nameBn: "আল কিয়ামাহ", totalVerses: 40 },
  { id: 76, name: "Al-Insan", nameBn: "আল ইনসান", totalVerses: 31 },
  { id: 77, name: "Al-Mursalat", nameBn: "আল মুরসালাত", totalVerses: 50 },
  { id: 78, name: "An-Naba", nameBn: "আন নাবা", totalVerses: 40 },
  { id: 79, name: "An-Nazi'at", nameBn: "আন নাযিয়াত", totalVerses: 46 },
  { id: 80, name: "'Abasa", nameBn: "আবাসা", totalVerses: 42 },
  { id: 81, name: "At-Takwir", nameBn: "আত তাকভীর", totalVerses: 29 },
  { id: 82, name: "Al-Infitar", nameBn: "আল ইনফিতার", totalVerses: 19 },
  { id: 83, name: "Al-Mutaffifin", nameBn: "আল মুতাফফিফীন", totalVerses: 36 },
  { id: 84, name: "Al-Inshiqaq", nameBn: "আল ইনশিকাক", totalVerses: 25 },
  { id: 85, name: "Al-Buruj", nameBn: "আল বুরুজ", totalVerses: 22 },
  { id: 86, name: "At-Tariq", nameBn: "আত তারিক", totalVerses: 17 },
  { id: 87, name: "Al-A'la", nameBn: "আল আ'la", totalVerses: 19 },
  { id: 88, name: "Al-Ghashiyah", nameBn: "আল গাশিয়াহ", totalVerses: 26 },
  { id: 89, name: "Al-Fajr", nameBn: "আল ফজর", totalVerses: 30 },
  { id: 90, name: "Al-Balad", nameBn: "আল বালাদ", totalVerses: 20 },
  { id: 91, name: "Ash-Shams", nameBn: "আশ শামস", totalVerses: 15 },
  { id: 92, name: "Al-Layl", nameBn: "আল লাইল", totalVerses: 21 },
  { id: 93, name: "Ad-Duhaa", nameBn: "আদ দুহা", totalVerses: 11 },
  { id: 94, name: "Ash-Sharh", nameBn: "আশ শারহ", totalVerses: 8 },
  { id: 95, name: "At-Tin", nameBn: "আত তীন", totalVerses: 8 },
  { id: 96, name: "Al-'Alaq", nameBn: "আল আলাক", totalVerses: 19 },
  { id: 97, name: "Al-Qadr", nameBn: "আল কদর", totalVerses: 5 },
  { id: 98, name: "Al-Bayyinah", nameBn: "আল বাইয়্যিনাহ", totalVerses: 8 },
  { id: 99, name: "Az-Zalzalah", nameBn: "আজ জালজালাহ", totalVerses: 8 },
  { id: 100, name: "Al-'Adiyat", nameBn: "আল আদিয়াত", totalVerses: 11 },
  { id: 101, name: "Al-Qari'ah", nameBn: "আল কারিয়াহ", totalVerses: 11 },
  { id: 102, name: "At-Takathur", nameBn: "আত তাকাসুর", totalVerses: 8 },
  { id: 103, name: "Al-'Asr", nameBn: "আল আছর", totalVerses: 3 },
  { id: 104, name: "Al-Humazah", nameBn: "আল হুমাযাহ", totalVerses: 9 },
  { id: 105, name: "Al-Fil", nameBn: "আল ফীল", totalVerses: 5 },
  { id: 106, name: "Quraysh", nameBn: "কুরাইশ", totalVerses: 4 },
  { id: 107, name: "Al-Ma'un", nameBn: "আল মাউন", totalVerses: 7 },
  { id: 108, name: "Al-Kawthar", nameBn: "আল কাওসার", totalVerses: 3 },
  { id: 109, name: "Al-Kafirun", nameBn: "আল কাফিরুন", totalVerses: 6 },
  { id: 110, name: "An-Nasr", nameBn: "আন নাসর", totalVerses: 3 },
  { id: 111, name: "Al-Masad", nameBn: "আল মাসাদ", totalVerses: 5 },
  { id: 112, name: "Al-Ikhlas", nameBn: "আল ইখলাস", totalVerses: 4 },
  { id: 113, name: "Al-Falaq", nameBn: "আল ফালাক", totalVerses: 5 },
  { id: 114, name: "An-Nas", nameBn: "আন নাস", totalVerses: 6 }
];

/* ---------- Local Numerals Helper ---------- */
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
  }
  return "bn";
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

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/* ---------- Simplified Parsers ---------- */
function extractFootnoteDefs(text: string): { cleaned: string; defs: Map<string, string> } {
  const defs = new Map<string, string>();
  const cleaned = (text || "").replace(/\[\[([^\]\s=]+)==([\s\S]*?)\]\]/g, (_m, id, body) => {
    defs.set(String(id).trim(), String(body).trim());
    return "";
  });
  return { cleaned, defs };
}

function renderSimpleQuranText(text: string, script: NumeralScript, validIds: Set<string>): string {
  if (!text) return "";
  let { cleaned } = extractFootnoteDefs(text);

  // Parse footnotes [[id]]
  cleaned = cleaned.replace(/\[\[([^\]\s=]+)\]\]/g, (raw, id) => {
    const t = String(id).trim();
    if (!validIds.has(t)) return raw;
    const n = parseInt(t, 10);
    const label = !isNaN(n) ? toNumerals(n, script) : t;
    return `<sup class="fn-ref" data-fn-id="${escapeAttr(t)}">${label}</sup>`;
  });

  // Simple Markdown Parsers for Bold and Italic only
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  cleaned = cleaned.replace(/___([^_]+)___/g, "<strong><em>$1</em></strong>");
  cleaned = cleaned.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  cleaned = cleaned.replace(/_([^_]+)_/g, "<em>$1</em>");

  return cleaned;
}

/* ---------- Local Storage Keys ---------- */
const LIST_KEY = "quran-list-v1";
const cacheKeyFor = (id: number) => `quran-draft-v1:${id}`;
const lockKeyFor = (id: number) => `quran-lock-v1:${id}`;

type QuranProject = {
  id: number;
  title: string;
  author: string;
  surahId: number;
  startAyat: number;
  endAyat: number;
  translations: Record<number, string>; // mapping: ayatNumber -> translationText
  coverImage?: string;
  pdfPassword?: string;
  lastEdited?: number;
};

function loadProjectList(): number[] {
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

function saveProjectList(ids: number[]) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(ids));
  } catch {}
}

function readProject(id: number): QuranProject {
  try {
    const raw = localStorage.getItem(cacheKeyFor(id));
    if (raw) {
      const p = JSON.parse(raw);
      return {
        id,
        title: typeof p.title === "string" ? p.title : "",
        author: typeof p.author === "string" ? p.author : "",
        surahId: typeof p.surahId === "number" ? p.surahId : 1,
        startAyat: typeof p.startAyat === "number" ? p.startAyat : 1,
        endAyat: typeof p.endAyat === "number" ? p.endAyat : 7,
        translations: p.translations && typeof p.translations === "object" ? p.translations : {},
        coverImage: typeof p.coverImage === "string" ? p.coverImage : undefined,
        pdfPassword: typeof p.pdfPassword === "string" ? p.pdfPassword : "",
        lastEdited: typeof p.lastEdited === "number" ? p.lastEdited : undefined,
      };
    }
  } catch {}
  return { id, title: "", author: "আব্দুল্লাহ বারী আসিফ", surahId: 1, startAyat: 1, endAyat: 7, translations: {} };
}

function writeProject(id: number, meta: Partial<QuranProject>) {
  try {
    const existing = readProject(id);
    const merged = { ...existing, ...meta, lastEdited: Date.now() };
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

function deleteProjectEntirely(id: number) {
  try {
    localStorage.removeItem(cacheKeyFor(id));
    localStorage.removeItem(lockKeyFor(id));
    saveProjectList(loadProjectList().filter((x) => x !== id));
  } catch {}
}

async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

function generateWatermarkPng(text: string, script: NumeralScript): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1135;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let fontName = "'TimesNR', 'Times New Roman', serif";
  if (script === "bn") fontName = "'Kalpurush'";
  else if (script === "ar") fontName = "'Scheherazade New', 'Noto Naskh Arabic'";

  ctx.font = `bold 42px ${fontName}`;
  ctx.fillStyle = "rgba(180, 180, 180, 0.16)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.translate(canvas.width / 2, canvas.height / 2);
  const angleRad = Math.atan2(-canvas.height, canvas.width);
  ctx.rotate(angleRad);

  ctx.fillText(text, 0, 0);

  return canvas.toDataURL("image/png");
}

/* ---------- Route Manager ---------- */
const QuranRouter = () => {
  const [hash, setHash] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const m = hash.match(/^#(\d+)$/);
  if (!m) return <QuranLanding />;
  const id = parseInt(m[1], 10);
  return <QuranGate projectId={id} key={id} />;
};

/* ---------- Access Gate ---------- */
const QuranGate: React.FC<{ projectId: number }> = ({ projectId }) => {
  const lockHash = readLockHash(projectId);
  const initial = !lockHash;
  const [unlocked, setUnlocked] = useState<boolean>(initial);
  const [error, setError] = useState<string | undefined>();

  if (unlocked) return <QuranEditor projectId={projectId} />;

  const onSubmit = async (pwd: string) => {
    const h = await sha256Hex(pwd);
    if (h === lockHash) {
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
        title="প্রজেক্টটি লকড"
        description="এই প্রজেক্ট খোলার জন্য পাসওয়ার্ড প্রয়োজন। ভুলে গেলে পুনরুদ্ধারের কোনো উপায় নেই।"
        submitLabel="খুলুন"
        error={error}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
};

/* ---------- Quran Landing / Select Page ---------- */
const QuranLanding = () => {
  const [projects, setProjects] = useState<QuranProject[]>([]);
  const [locks, setLocks] = useState<Record<number, string | null>>({});
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Selectors State
  const [selectedSurahId, setSelectedSurahId] = useState<number>(2);
  const [startAyat, setStartAyat] = useState<number>(1);
  const [endAyat, setEndAyat] = useState<number>(18);

  const selectedSurah = useMemo(() => {
    return SURAHS.find((s) => s.id === selectedSurahId) || SURAHS[1];
  }, [selectedSurahId]);

  // Adjust Ayat constraints
  useEffect(() => {
    if (startAyat > selectedSurah.totalVerses) {
      setStartAyat(1);
    }
    if (endAyat > selectedSurah.totalVerses || endAyat < startAyat) {
      setEndAyat(selectedSurah.totalVerses);
    }
  }, [selectedSurahId, selectedSurah]);

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
    const ids = loadProjectList();
    const loaded = ids.map(readProject);
    setProjects(loaded);
    const lockMap: Record<number, string | null> = {};
    ids.forEach((id) => (lockMap[id] = readLockHash(id)));
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

  const handleCreateProject = () => {
    const ids = loadProjectList();
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;

    // Build prewritten title
    const startNum = toNumerals(startAyat, "bn");
    const endNum = toNumerals(endAyat, "bn");
    const titleText = `সূরাহ ${selectedSurah.nameBn} আয়াত ${startNum} - ${endNum}`;

    writeProject(nextId, {
      title: titleText,
      author: "আব্দুল্লাহ বারী আসিফ",
      surahId: selectedSurahId,
      startAyat,
      endAyat,
      translations: {},
    });
    saveProjectList([...ids, nextId]);
    window.location.hash = `#${nextId}`;
  };

  const openProject = (id: number) => {
    const h = locks[id];
    if (h) {
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
    writeProject(id, { coverImage: undefined });
    refresh();
  };

  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || coverTargetId == null) return;
    try {
      const cropped = await cropToA5DataUrl(file);
      writeProject(coverTargetId, { coverImage: cropped });
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
      setPwdModal(null);
      window.location.hash = `#${id}`;
    } else if (pwdModal.kind === "delete") {
      if (hashed !== pwdModal.hash) return setPwdError("ভুল পাসওয়ার্ড।");
      deleteProjectEntirely(pwdModal.id);
      setPwdModal(null);
      refresh();
    } else if (pwdModal.kind === "unlock-remove") {
      if (hashed !== pwdModal.hash) return setPwdError("ভুল পাসওয়ার্ড।");
      writeLockHash(pwdModal.id, null);
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
    if (!q) return projects;
    return projects.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q)
    );
  }, [projects, query]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCoverFile}
      />

      {/* Main Header and Surah Selector */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-8 md:px-16 lg:px-28">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-mixed">আল-কুরআন অনুবাদক</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mixed">
                সূরা এবং আয়াত সীমানা সিলেক্ট করে নতুন অনুবাদ প্রজেক্ট শুরু করুন
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-full md:max-w-xs">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="প্রজেক্ট খুঁজুন..."
                className="bg-transparent focus:outline-none text-sm font-mixed placeholder:text-slate-400 dark:text-slate-200 w-full"
                dir="auto"
              />
            </div>
          </div>

          {/* Selector Card */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 font-mixed">সূরা নির্বাচন</label>
              <select
                value={selectedSurahId}
                onChange={(e) => setSelectedSurahId(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-800 font-mixed text-slate-900 dark:text-white"
              >
                {SURAHS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {toNumerals(s.id, "bn")}. {s.nameBn} ({s.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 font-mixed">শুরুর আয়াত</label>
              <input
                type="number"
                min={1}
                max={selectedSurah.totalVerses}
                value={startAyat}
                onChange={(e) => setStartAyat(Math.max(1, Math.min(selectedSurah.totalVerses, parseInt(e.target.value, 10) || 1)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-800 font-mixed text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 font-mixed">শেষের আয়াত</label>
              <input
                type="number"
                min={startAyat}
                max={selectedSurah.totalVerses}
                value={endAyat}
                onChange={(e) => setEndAyat(Math.max(startAyat, Math.min(selectedSurah.totalVerses, parseInt(e.target.value, 10) || startAyat)))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-800 font-mixed text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <button
                onClick={handleCreateProject}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-mixed"
              >
                <Plus size={16} />
                প্রজেক্ট তৈরি করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Previously Created Projects List */}
      <div className="flex-1 px-5 py-8 md:px-16 lg:px-28">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 font-mixed">পূর্বে তৈরি করা প্রজেক্টসমূহ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((b) => {
              const locked = !!locks[b.id];
              const expanded = expandedId === b.id;
              const corner = cornerFor(b.id);
              return (
                <div
                  key={b.id}
                  onClick={() => openProject(b.id)}
                  className="group relative aspect-[3/4] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md transition-all overflow-hidden cursor-pointer"
                >
                  {b.coverImage ? (
                    <img
                      src={b.coverImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                    />
                  ) : (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                      <div
                        className="absolute font-mixed text-slate-400 font-semibold leading-none"
                        style={{
                          fontSize: "12rem",
                          top: corner.top,
                          left: corner.left,
                          opacity: 0.08,
                        }}
                      >
                        কুরআন
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between">
                    <div className="relative flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <div
                          className={`text-[10px] font-mono uppercase tracking-wider ${
                            b.coverImage ? "text-white/90 drop-shadow" : "text-slate-400"
                          }`}
                        >
                          #{b.id}
                        </div>
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
                        <div className="font-mixed text-sm md:text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-3">
                          {b.title || "Untitled Project"}
                        </div>
                        {b.author && (
                          <div className="mt-1 font-mixed text-[11px] md:text-xs text-slate-500">
                            {b.author}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {expanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-10 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 min-w-[10rem] font-mixed animate-in fade-in-0 zoom-in-95"
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
                          icon={<X size={14} />}
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
          </div>
          {projects.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-10 font-mixed">
              কোনো প্রজেক্ট নেই। উপরে সূরা ও আয়াত সিলেক্ট করে নতুন প্রজেক্ট তৈরি করুন।
            </p>
          )}
        </div>
      </div>

      <PrettyPasswordPrompt
        open={!!pwdModal}
        title={
          pwdModal?.kind === "open"
            ? "প্রজেক্ট খুলতে পাসওয়ার্ড দিন"
            : pwdModal?.kind === "delete"
            ? "মুছে ফেলার জন্য পাসওয়ার্ড দিন"
            : pwdModal?.kind === "unlock-remove"
            ? "লক সরাতে পাসওয়ার্ড দিন"
            : "নতুন পাসওয়ার্ড দিন"
        }
        description={
          pwdModal?.kind === "set-lock"
            ? "এই প্রজেক্টটি লক হবে। ভুলে গেলে পুনরুদ্ধারের কোনো উপায় নেই — সাবধানে পাসওয়ার্ড সংরক্ষণ করুন।"
            : pwdModal?.kind === "open"
            ? "সঠিক পাসওয়ার্ড দিলে প্রজেক্টটি এই সেশনে খোলা থাকবে।"
            : pwdModal?.kind === "delete"
            ? "লকড প্রজেক্ট মুছতে পাসওয়ার্ড লাগে। মুছে ফেললে আর ফিরে পাওয়া যাবে না।"
            : "লক সরানোর পর যেকেউ এই প্রজেক্ট খুলতে পারবে।"
        }
        submitLabel={pwdModal?.kind === "set-lock" ? "লক করুন" : "নিশ্চিত করুন"}
        error={pwdError}
        onCancel={() => setPwdModal(null)}
        onSubmit={handlePwdSubmit}
      />

      <ConfirmModal
        open={confirmDelete != null}
        title="প্রজেক্টটি মুছে ফেলবেন?"
        description="এই কাজটি অপরিবর্তনীয় — সমস্ত অনুবাদ, কভার ও সেটিংস স্থায়ীভাবে মুছে যাবে।"
        confirmLabel="মুছে ফেলুন"
        onConfirm={() => {
          if (confirmDelete != null) deleteProjectEntirely(confirmDelete);
          setConfirmDelete(null);
          refresh();
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

/* ---------- Quran Editor Component ---------- */
const QuranEditor = ({ projectId }: { projectId: number }) => {
  const CACHE_KEY = cacheKeyFor(projectId);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [surahId, setSurahId] = useState<number>(1);
  const [startAyat, setStartAyat] = useState<number>(1);
  const [endAyat, setEndAyat] = useState<number>(1);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [pdfPassword, setPdfPassword] = useState<string>("");

  const [preview, setPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Modal controls
  const [showLockModal, setShowLockModal] = useState(false);
  const [pdfPwdModal, setPdfPwdModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Arabic Verses Storage
  const [arabicVerses, setArabicVerses] = useState<Record<number, string>>({});
  const [loadingArabic, setLoadingArabic] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.title === "string") setTitle(p.title);
        if (typeof p.author === "string") setAuthor(p.author);
        if (typeof p.surahId === "number") setSurahId(p.surahId);
        if (typeof p.startAyat === "number") setStartAyat(p.startAyat);
        if (typeof p.endAyat === "number") setEndAyat(p.endAyat);
        if (p.translations && typeof p.translations === "object") setTranslations(p.translations);
        if (typeof p.pdfPassword === "string") setPdfPassword(p.pdfPassword);
        if (typeof p.coverImage === "string") setCoverImage(p.coverImage);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ title, author, surahId, startAyat, endAyat, translations, pdfPassword, coverImage })
      );
    } catch {}
  }, [title, author, surahId, startAyat, endAyat, translations, pdfPassword, coverImage, hydrated]);

  // Fetch Arabic Text
  useEffect(() => {
    if (!surahId) return;
    let active = true;
    const fetchArabic = async () => {
      setLoadingArabic(true);
      try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/${surahId}.json`);
        const data = await res.json();
        if (active && data && Array.isArray(data.verses)) {
          const mapping: Record<number, string> = {};
          data.verses.forEach((v: { id: number; text: string }) => {
            mapping[v.id] = v.text;
          });
          setArabicVerses(mapping);
        }
      } catch (err) {
        console.error("Failed to load Arabic Quran text", err);
      } finally {
        if (active) setLoadingArabic(false);
      }
    };
    fetchArabic();
    return () => {
      active = false;
    };
  }, [surahId]);

  const goBack = () => {
    window.location.hash = "";
  };

  const isLocked = !!readLockHash(projectId);
  const toggleBookLock = async (pwd: string) => {
    if (isLocked) {
      writeLockHash(projectId, null);
    } else {
      const hashed = await sha256Hex(pwd);
      writeLockHash(projectId, hashed);
    }
    setShowLockModal(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const cropped = await cropToA5DataUrl(file);
      setCoverImage(cropped);
    }
  };

  // Build range array of Ayats
  const ayatRangeList = useMemo(() => {
    const list: number[] = [];
    for (let i = startAyat; i <= endAyat; i++) {
      list.push(i);
    }
    return list;
  }, [startAyat, endAyat]);

  // Process and aggregate footnote valid IDs for rendering
  const footnoteIds = useMemo(() => {
    const valid = new Set<string>();
    ayatRangeList.forEach((num) => {
      const text = translations[num] || "";
      const { defs } = extractFootnoteDefs(text);
      defs.forEach((_, id) => valid.add(id));
    });
    return valid;
  }, [ayatRangeList, translations]);

  // Handle download PDF with dual columns side-by-side
  const handleDownloadPDF = async () => {
    try {
      setGenerating(true);
      setProgress(0);
      setProgressLabel("প্রস্তুতি...");

      const safeTitle = (title || "Untitled").trim();
      const safeAuthor = author.trim();
      const numeralScript = detectScript(safeTitle);

      const watermarkText = localStorage.getItem("book-settings-watermark") || "";
      const creditText = "Compiled by Abdullah Bari Asif.";
      const watermarkPng = watermarkText ? generateWatermarkPng(watermarkText, numeralScript) : "";

      const PAGE_W = 148;
      const PAGE_H = 210;
      const MARGIN = 14;
      const CONTENT_W = PAGE_W - MARGIN * 2;
      const CONTENT_H = PAGE_H - MARGIN * 2;
      const SECTION_GAP = 2;

      // Create PDF HTML container
      const container = document.createElement("div");
      container.setAttribute("data-pdf-container-root", "");
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "-9999px";
      container.style.opacity = "1";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-1";
      container.style.background = "#ffffff";
      container.style.color = "#0f172a";
      container.style.fontFamily =
        "'TimesNR', 'Times New Roman', 'Kalpurush', 'Scheherazade New', 'Noto Naskh Arabic', Times, serif";
      const PX_PER_MM = 3.7795275591;
      const widthPx = Math.round(CONTENT_W * PX_PER_MM);
      container.style.width = `${widthPx}px`;

      const styleEl = document.createElement("style");
      styleEl.textContent = `
        .fn-ref {
          font-size: 0.7em; vertical-align: super; line-height: 0;
          color: #1d4ed8; margin: 0 0.05em;
        }
        .fn-item {
          display: flex; gap: 0.5em; align-items: flex-start;
          margin: 0; padding: 0 0 0.15em 0; line-height: 1.4;
          font-size: 9pt;
        }
        .fn-item .fn-num {
          font-weight: 600; min-width: 1.6em; text-align: right;
          color: #1d4ed8; line-height: 1.4;
        }
        .fn-item .fn-body {
          flex: 1; text-align: justify; line-height: 1.4; padding-bottom: 0.2em;
        }
        .ayat-row {
          display: flex;
          width: 100%;
          border-bottom: 0.5px solid #e2e8f0;
          box-sizing: border-box;
          padding: 3.5mm 0;
        }
        .translation-col {
          width: 50%;
          padding-right: 4.5mm;
          border-right: 0.5px solid #94a3b8;
          text-align: justify;
          font-size: 10.5pt;
          line-height: 1.6;
          box-sizing: border-box;
          font-family: 'Kalpurush', 'TimesNR', serif;
        }
        .arabic-col {
          width: 50%;
          padding-left: 4.5mm;
          text-align: justify;
          direction: rtl;
          font-family: 'Scheherazade New', serif;
          font-size: 15.5pt;
          line-height: 2.1;
          box-sizing: border-box;
        }
        .serial-num {
          font-size: 8pt;
          color: #64748b;
          font-family: 'TimesNR', 'Kalpurush', serif;
          margin-bottom: 2px;
          display: block;
        }
      `;
      container.appendChild(styleEl);

      const mlInline = (s: string) => s.split("\n").map(escapeHtml).join("<br>");

      const coverHtml = `
        <div data-pdf-section data-pdf-cover style="
          width: 100%; box-sizing: border-box; padding-top: 15mm;
          text-align: center; position: relative; min-height: ${CONTENT_H}mm;">
          <h1 style="
            font-size: 26pt; font-weight: 500; line-height: 1.4;
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
            font-size: 9pt; color: #475569;">${escapeHtml(creditText)}</div>
        </div>
      `;

      // Build rows for bilingual text
      const bodyWrap = document.createElement("div");
      bodyWrap.setAttribute("data-pdf-body", "");
      bodyWrap.style.width = "100%";

      ayatRangeList.forEach((num) => {
        const arabicText = arabicVerses[num] || "";
        const rawTranslation = translations[num] || "";
        const formattedTranslation = renderSimpleQuranText(rawTranslation, numeralScript, footnoteIds);

        const row = document.createElement("div");
        row.className = "ayat-row";
        row.innerHTML = `
          <div class="translation-col">
            <span class="serial-num">আয়াত ${toNumerals(num, "bn")}</span>
            <div>${formattedTranslation || '<span style="color:#cbd5e1;">অনুবাদ লিখুন...</span>'}</div>
          </div>
          <div class="arabic-col">
            <span class="serial-num" style="direction: ltr; text-align: right; display: block;">Ayah ${toNumerals(num, "ar")}</span>
            <div>${arabicText}</div>
          </div>
        `;
        bodyWrap.appendChild(row);
      });

      const coverWrap = document.createElement("div");
      coverWrap.innerHTML = coverHtml;
      container.appendChild(coverWrap);
      container.appendChild(bodyWrap);
      document.body.appendChild(container);

      try {
        if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      } catch {}
      await new Promise((r) => setTimeout(r, 50));

      const pdfOpts: any = {
        orientation: "portrait",
        unit: "mm",
        format: "a5",
        compress: true,
      };

      let pdf;
      try {
        if (pdfPassword) {
          pdfOpts.encryption = {
            userPassword: pdfPassword,
            ownerPassword: pdfPassword,
            userPermissions: ["print", "copy"],
          };
        }
        pdf = new jsPDF(pdfOpts);
      } catch (e) {
        console.error("jsPDF init with encryption failed:", e);
        delete pdfOpts.encryption;
        pdf = new jsPDF(pdfOpts);
      }

      const renderScale = 3;
      const JPEG_Q = 0.78;

      type LinkRect = { x: number; y: number; w: number; h: number; href: string };
      type CaptureResult = {
        dataUrl: string; heightMM: number;
        elWidthPx: number; elHeightPx: number;
        links: LinkRect[]; canvas: HTMLCanvasElement;
        fnRefs: FnRefPos[];
      };

      const captureElement = async (el: HTMLElement): Promise<CaptureResult> => {
        const baseRect = el.getBoundingClientRect();
        const links: LinkRect[] = [];
        const fnRefs: FnRefPos[] = [];
        el.querySelectorAll(".fn-ref").forEach((r) => {
          const id = r.getAttribute("data-fn-id");
          if (!id) return;
          const rects = (r as HTMLElement).getClientRects();
          for (const rect of Array.from(rects)) {
            fnRefs.push({ id, x: rect.left - baseRect.left, y: rect.top - baseRect.top, w: rect.width, h: rect.height });
          }
        });
        const canvas = await html2canvas(el, {
          scale: renderScale, useCORS: true, backgroundColor: "#ffffff",
          logging: false, windowWidth: widthPx,
        });
        const elWidthPx = canvas.width / renderScale;
        const elHeightPx = canvas.height / renderScale;
        const mmPerPx = CONTENT_W / elWidthPx;
        const heightMM = elHeightPx * mmPerPx;
        return {
          dataUrl: canvas.toDataURL("image/jpeg", JPEG_Q),
          heightMM, elWidthPx, elHeightPx, links, canvas, fnRefs,
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
        numDiv.style.padding = "4px 8px";
        numDiv.style.margin = "0";
        numDiv.style.display = "inline-block";
        numDiv.style.background = "#ffffff";
        numDiv.style.color = "#475569";
        numDiv.style.fontSize = `${PAGE_NUM_PT * 3}pt`;
        numDiv.style.lineHeight = "1.2";
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

      // Stamp page number in the horizontal center and running line
      const stampPageNumber = async () => {
        bodyPageNum += 1;
        const tile = await renderNumberTile(bodyPageNum);

        // Centered horizontally above running header line
        const x = (PAGE_W - tile.wMM) / 2;
        const yNum = 4;
        pdf.addImage(tile.dataUrl, "PNG", x, yNum, tile.wMM, tile.hMM);

        // Draw horizontal line below the page number
        const lineY = yNum + tile.hMM + 1;
        pdf.setDrawColor(203, 213, 225); // Slate 200
        pdf.setLineWidth(0.3);
        pdf.line(MARGIN, lineY, PAGE_W - MARGIN, lineY);
      };

      const addBodyPage = async () => {
        pdf.addPage();
        await stampPageNumber();
        if (watermarkText) {
          pdf.addImage(watermarkPng, "PNG", 0, 0, PAGE_W, PAGE_H);
        }
      };

      type FnTile = { id: string; cap: CaptureResult };
      const fnTiles = new Map<string, FnTile>();

      // Extract footprint definitions from translations
      const footnoteDefs = new Map<string, string>();
      ayatRangeList.forEach((num) => {
        const text = translations[num] || "";
        const { defs } = extractFootnoteDefs(text);
        defs.forEach((val, key) => footnoteDefs.set(key, val));
      });

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
        fnWrap.style.width = `${widthPx}px`;
        fnWrap.style.fontSize = "8.5pt";
        fnWrap.style.lineHeight = "1.5";
        container.appendChild(fnWrap);
        for (const id of allRefIds) {
          const n = parseInt(id, 10);
          const label = !isNaN(n) ? toNumerals(n, numeralScript) : id;
          const bodyHtmlF = footnoteDefs.get(id) || "";
          const item = document.createElement("div");
          item.className = "fn-item";
          item.innerHTML = `<span class="fn-num">${escapeHtml(label)}.</span><div class="fn-body">${escapeHtml(bodyHtmlF)}</div>`;
          fnWrap.appendChild(item);
          const cap = await captureElement(item);
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
          if (fnTiles.has(id)) {
            h += fnTiles.get(id)!.cap.heightMM;
          }
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
        pdf.line(MARGIN, dividerY, PAGE_W - MARGIN, dividerY);
        let y = dividerY + DIV_GAP_BOT;
        for (const id of pageFnIds) {
          if (fnTiles.has(id)) {
            const t = fnTiles.get(id)!.cap;
            pdf.addImage(t.dataUrl, "JPEG", MARGIN, y, CONTENT_W, t.heightMM);
            addLinkAnnotations(t, MARGIN, y, CONTENT_W, t.heightMM);
            y += t.heightMM + FN_ITEM_GAP;
          }
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

      if (bodyChildren.length > 0) {
        await addBodyPage();
        let currentY = MARGIN + 6; // slightly lower than standard margin because of top line
        setProgressLabel("পৃষ্ঠা রেন্ডার...");
        for (let ci = 0; ci < bodyChildren.length; ci++) {
          const child = bodyChildren[ci];
          setProgress(0.1 + 0.8 * (ci / Math.max(1, bodyChildren.length)));

          const section = await captureElement(child);
          const mmPerPx = CONTENT_W / section.elWidthPx;

          const childIds = idsInChild(child);
          const reservedFor = (ids: string[]) => {
            if (ids.length === 0) return 0;
            let h = DIV_GAP_TOP + DIV_GAP_BOT;
            ids.forEach((id, i) => {
              if (fnTiles.has(id)) {
                h += fnTiles.get(id)!.cap.heightMM;
              }
              if (i < ids.length - 1) h += FN_ITEM_GAP;
            });
            return h;
          };

          const tentativeIdsWhole = [...pageFnIds];
          for (const id of childIds) {
            if (!tentativeIdsWhole.includes(id)) tentativeIdsWhole.push(id);
          }
          const wholeAvail = PAGE_H - MARGIN - reservedFor(tentativeIdsWhole) - currentY;

          if (section.heightMM <= wholeAvail) {
            pdf.addImage(section.dataUrl, "JPEG", MARGIN, currentY, CONTENT_W, section.heightMM);
            addLinkAnnotations(section, MARGIN, currentY, CONTENT_W, section.heightMM);
            currentY += section.heightMM + SECTION_GAP;
            pageFnIds = tentativeIdsWhole;
            continue;
          }

          const freshAvail = CONTENT_H - 6 - reservedFor(childIds);
          if (section.heightMM <= freshAvail && currentY > MARGIN + 6) {
            flushFootnotes();
            await addBodyPage();
            currentY = MARGIN + 6;
            pdf.addImage(section.dataUrl, "JPEG", MARGIN, currentY, CONTENT_W, section.heightMM);
            addLinkAnnotations(section, MARGIN, currentY, CONTENT_W, section.heightMM);
            currentY += section.heightMM + SECTION_GAP;
            pageFnIds = childIds;
            continue;
          }

          // Slice multi-page rows
          let remainingPx = section.elHeightPx;
          let srcYpx = 0;

          while (remainingPx > 0) {
            const activeRefs = section.fnRefs
              .filter((ref) => {
                const midY = ref.y + ref.h / 2;
                return midY >= srcYpx && midY < section.elHeightPx;
              })
              .sort((a, b) => a.y - b.y);

            let bestTakePx = 0;
            let bestFnIds: string[] = [];

            const optWholeTakePx = remainingPx;
            const optWholeFnIds = [...pageFnIds];
            activeRefs.forEach((ref) => {
              if (!optWholeFnIds.includes(ref.id)) optWholeFnIds.push(ref.id);
            });
            const optWholeNeededFnHeight = reservedFor(optWholeFnIds);
            const optWholeMaxTextHeight = CONTENT_H - 6 - optWholeNeededFnHeight - (currentY - (MARGIN + 6));
            if (optWholeTakePx * mmPerPx <= optWholeMaxTextHeight) {
              bestTakePx = optWholeTakePx;
              bestFnIds = optWholeFnIds;
            } else {
              let found = false;
              for (let i = activeRefs.length - 1; i >= 0; i--) {
                const ref = activeRefs[i];
                const cutPx = ref.y - srcYpx;
                if (cutPx <= 0) continue;

                const includedFnIds = [...pageFnIds];
                activeRefs.forEach((r) => {
                  if (r.y + r.h / 2 < srcYpx + cutPx) {
                    if (!includedFnIds.includes(r.id)) includedFnIds.push(r.id);
                  }
                });
                const neededFnHeight = reservedFor(includedFnIds);
                const maxTextHeight = CONTENT_H - 6 - neededFnHeight - (currentY - (MARGIN + 6));
                if (cutPx * mmPerPx <= maxTextHeight) {
                  bestTakePx = cutPx;
                  bestFnIds = includedFnIds;
                  found = true;
                  break;
                }
              }

              if (!found) {
                const optNoneFnIds = [...pageFnIds];
                const neededFnHeight = reservedFor(optNoneFnIds);
                const maxTextHeight = CONTENT_H - 6 - neededFnHeight - (currentY - (MARGIN + 6));
                bestTakePx = Math.max(0, maxTextHeight / mmPerPx);
                bestFnIds = optNoneFnIds;
              }
            }

            bestTakePx = Math.min(bestTakePx, remainingPx);

            const sliceMM = bestTakePx * mmPerPx;
            const remMM = remainingPx * mmPerPx;
            const minAllowedSliceMM = 20;

            if (currentY > MARGIN + 6 && sliceMM < minAllowedSliceMM && remMM >= minAllowedSliceMM) {
              flushFootnotes();
              await addBodyPage();
              currentY = MARGIN + 6;
              continue;
            }

            let finalTakePx = bestTakePx;
            if (currentY === MARGIN + 6 && finalTakePx <= 0) {
              finalTakePx = Math.min(remainingPx, 10 / mmPerPx);
            }

            // Adjust finalTakePx to avoid cutting text lines if there's remaining content
            if (remainingPx > finalTakePx) {
              const scale = section.canvas.width / section.elWidthPx;
              const splitCanvasY = Math.round((srcYpx + finalTakePx) * scale);
              const maxSearchCanvas = Math.round(40 * scale);
              const blankCanvasY = findBlankRow(section.canvas, splitCanvasY, maxSearchCanvas);
              const adjustedTakePx = (blankCanvasY / scale) - srcYpx;
              if (adjustedTakePx * mmPerPx >= 5) {
                finalTakePx = adjustedTakePx;
              }
            }

            pageFnIds = bestFnIds;

            const slice = sliceSection(section, srcYpx, finalTakePx);
            pdf.addImage(slice.dataUrl, "JPEG", MARGIN, currentY, CONTENT_W, slice.heightMM);

            currentY += slice.heightMM;
            srcYpx += finalTakePx;
            remainingPx -= finalTakePx;

            if (remainingPx > 0) {
              flushFootnotes();
              await addBodyPage();
              currentY = MARGIN + 6;
            } else {
              currentY += SECTION_GAP;
            }
          }
        }
        flushFootnotes();
      }

      const filename = safeTitle.replace(/[^a-z0-9\u0980-\u09FF\s-]/gi, "").trim() || "quran-translation";
      setProgress(0.98);
      setProgressLabel("সংরক্ষণ...");
      pdf.save(`${filename}.pdf`);
      setProgress(1);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert("PDF তৈরি করার সময় একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।\n" + (err.message || "Unknown error"));
    } finally {
      const container = document.querySelector("[data-pdf-container-root]");
      if (container) container.remove();
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
        setProgressLabel("");
      }, 350);
    }
  };

  const handleTextChange = (num: number, val: string) => {
    setTranslations((prev) => ({
      ...prev,
      [num]: val,
    }));
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-10 md:px-16 md:pt-16 lg:px-24 lg:pt-20 pb-40 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        {/* Title and Author Header */}
        <div className="space-y-4 border-b border-slate-100 pb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="প্রজেক্টের নাম"
            className="w-full font-mixed text-3xl md:text-4xl font-bold tracking-tight bg-transparent border-none focus:outline-none placeholder:text-slate-300 leading-tight"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="অনুবাদকের নাম"
            className="w-full font-mixed text-base text-slate-500 bg-transparent border-none focus:outline-none placeholder:text-slate-300 leading-snug"
          />
        </div>

        {/* Loading Indicator */}
        {loadingArabic && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-slate-500" size={32} />
            <p className="text-sm text-slate-500 font-mixed">আরবি আয়াত লোড হচ্ছে...</p>
          </div>
        )}

        {/* Editor Body */}
        {!loadingArabic && (
          <div className="space-y-8">
            {ayatRangeList.map((num) => {
              const arabicText = arabicVerses[num] || "";
              const userTranslation = translations[num] || "";

              if (preview) {
                // Real-time preview mode matching PDF Side-by-Side layout
                return (
                  <div key={num} className="flex border-b border-slate-100 py-6 gap-6 items-start font-mixed">
                    {/* Left Part: Translation (justified, Kalpurush) */}
                    <div className="w-1/2 pr-6 border-r border-slate-200 text-justify">
                      <span className="text-[10px] text-slate-400 font-mixed block mb-1">আয়াত {toNumerals(num, "bn")}</span>
                      <div
                        className="text-base text-slate-800 leading-relaxed font-normal font-bangla"
                        dangerouslySetInnerHTML={{
                          __html: renderSimpleQuranText(userTranslation, "bn", footnoteIds) || '<span class="text-slate-300">অনুবাদ নেই</span>',
                        }}
                      />
                    </div>
                    {/* Right Part: Arabic Quran text (justified, RTL) */}
                    <div className="w-1/2 pl-6 text-justify direction-rtl">
                      <span className="text-[10px] text-slate-400 font-mixed block mb-1" style={{ direction: "ltr", textAlign: "right" }}>
                        Ayah {toNumerals(num, "ar")}
                      </span>
                      <div className="text-2xl text-slate-900 leading-loose font-arabic font-semibold">
                        {arabicText || "..."}
                      </div>
                    </div>
                  </div>
                );
              }

              // Edit Mode boxes
              return (
                <div
                  key={num}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-semibold font-mixed">আয়াত {toNumerals(num, "bn")}</span>
                    <span className="font-mono">Ayah {num}</span>
                  </div>

                  {/* Arabic Text Display */}
                  <div className="text-right py-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-2xl text-slate-900 dark:text-slate-100 leading-loose font-semibold font-arabic" dir="rtl">
                      {arabicText || "লোড হচ্ছে..."}
                    </p>
                  </div>

                  {/* Translation input area */}
                  <div className="space-y-1">
                    <textarea
                      value={userTranslation}
                      onChange={(e) => handleTextChange(num, e.target.value)}
                      placeholder="এখানে আপনার অনুবাদ এবং ফুটনোট লিখুন..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-slate-800 font-mixed min-h-[100px] resize-y"
                    />
                    <span className="text-[10px] text-slate-400 block font-mixed">
                      Formatting: **bold**, *italic*, [[১]] (ফুটনোট রেফারেন্স), [[১==ফুটনোট বিবরণ]] (ফুটনোট বর্ণনা)।
                    </span>
                  </div>
                </div>
              );
            })}

            {/* List footnotes below in preview mode */}
            {preview && footnoteIds.size > 0 && (
              <div className="border-t border-slate-200 pt-8 mt-12 space-y-2">
                <h3 className="text-sm font-semibold text-slate-600 mb-3 font-mixed">ফুটনোটসমূহ (Footnotes)</h3>
                {Array.from(footnoteIds).map((id) => {
                  // Find def from any translation text
                  let defText = "";
                  ayatRangeList.forEach((num) => {
                    const text = translations[num] || "";
                    const { defs } = extractFootnoteDefs(text);
                    if (defs.has(id)) {
                      defText = defs.get(id) || "";
                    }
                  });
                  return (
                    <div key={id} className="flex gap-2 text-xs text-slate-600 font-mixed">
                      <span className="font-semibold">{toNumerals(parseInt(id, 10) || 0, "bn")}.</span>
                      <p>{defText || "বর্ণনা পাওয়া যায়নি"}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Compact Action bar */}
      <div className="fixed z-40 pointer-events-none bottom-3 left-3 right-3 flex justify-center md:bottom-6 md:left-6 md:right-6">
        {generating ? (
          <div className="pointer-events-auto w-full max-w-sm bg-white border border-slate-200 shadow-xl rounded-2xl px-4 py-3">
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
          <div className="pointer-events-auto flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl p-1.5 max-w-full">
            <SquareBtn onClick={goBack} title="লাইব্রেরিতে ফিরে যান">
              <ArrowLeft size={18} className="dark:text-slate-200" />
            </SquareBtn>
            <SquareBtn
              onClick={() => isLocked ? toggleBookLock("") : setShowLockModal(true)}
              title={isLocked ? "Unlock Project" : "Lock Project"}
              className={isLocked ? "text-rose-600" : "dark:text-slate-200"}
            >
              {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
            </SquareBtn>
            <SquareBtn
              onClick={() => coverImage ? setCoverImage(undefined) : coverInputRef.current?.click()}
              title={coverImage ? "Remove Cover" : "Add Cover"}
              className={coverImage ? "text-rose-600" : "dark:text-slate-200"}
            >
              <ImageIcon size={18} />
            </SquareBtn>
            <SquareBtn onClick={() => setShowDeleteConfirm(true)} title="Delete Project" className="text-rose-600">
              <Trash2 size={18} />
            </SquareBtn>
            <SquareBtn
              onClick={() => setPdfPwdModal(true)}
              title={pdfPassword ? "PDF পাসওয়ার্ড সেট" : "PDF পাসওয়ার্ড দিন"}
              className={pdfPassword ? "bg-amber-500 text-white hover:bg-amber-600" : "dark:text-slate-200"}
            >
              <FileLock2 size={18} />
            </SquareBtn>
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
            <SquareBtn onClick={() => setPreview((p) => !p)} title={preview ? "Edit" : "Preview"} className="dark:text-slate-200">
              {preview ? <Pencil size={18} /> : <Eye size={18} />}
            </SquareBtn>
            <SquareBtn
              onClick={handleDownloadPDF}
              title="Download PDF"
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              <Download size={18} />
            </SquareBtn>
          </div>
        )}
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />

      <PrettyPasswordPrompt
        open={showLockModal}
        title="প্রজেক্টটি লক করুন"
        description="পাসওয়ার্ড দিলে প্রজেক্টটি সুরক্ষিত থাকবে। ভুলে গেলে পুনরুদ্ধারের পথ নেই।"
        submitLabel="লক করুন"
        onCancel={() => setShowLockModal(false)}
        onSubmit={toggleBookLock}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        title="প্রজেক্টটি মুছে ফেলবেন?"
        description="এই কাজটি অপরিবর্তনীয় — সমস্ত অনুবাদ, কভার ও সেটিংস স্থায়ীভাবে মুছে যাবে।"
        confirmLabel="মুছে ফেলুন"
        onConfirm={() => {
          deleteProjectEntirely(projectId);
          window.location.hash = "";
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <PrettyPasswordPrompt
        open={pdfPwdModal}
        title={pdfPassword ? "PDF পাসওয়ার্ড পরিবর্তন" : "PDF-এর জন্য পাসওয়ার্ড"}
        description="এই পাসওয়ার্ড দিয়ে exported PDF এনক্রিপ্ট হবে। প্রিন্ট ও কপি অনুমোদিত থাকবে।"
        submitLabel="সংরক্ষণ"
        onCancel={() => setPdfPwdModal(false)}
        onSubmit={(pwd) => {
          setPdfPassword(pwd);
          setPdfPwdModal(false);
        }}
        extraActions={
          pdfPassword
            ? [{ label: "পাসওয়ার্ড সরান", onClick: () => { setPdfPassword(""); setPdfPwdModal(false); }, tone: "danger" }]
            : undefined
        }
      />
    </div>
  );
};

/* ---------- Reuseable Components ---------- */
const MenuBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left w-full ${
      danger ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="flex-1">{label}</span>
  </button>
);

const PrettyPasswordPrompt: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onSubmit: (pwd: string) => void;
  extraActions?: { label: string; onClick: () => void; tone?: "primary" | "danger" | "ghost" }[];
  error?: string;
}> = ({
  open,
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
  const [showPwd, setShowPwd] = useState(false);
  useEffect(() => {
    if (open) {
      setPwd("");
      setShowPwd(false);
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4 font-mixed animate-in fade-in-0">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 border border-slate-100 animate-in fade-in-0 zoom-in-95">
        <div className="mb-5">
          <h3 className="text-lg font-normal text-slate-900 leading-tight">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-slate-600 leading-relaxed font-normal">{description}</p>
          )}
        </div>
        <div className="relative">
          <input
            autoFocus
            type={showPwd ? "text" : "password"}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pwd) onSubmit(pwd);
            }}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-4 pr-12 py-3 text-base focus:outline-none focus:border-slate-800 focus:bg-white transition-colors font-normal text-slate-900"
            placeholder="পাসওয়ার্ড লিখুন"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPwd ? <X size={18} /> : <Eye size={18} />}
          </button>
        </div>
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
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4 font-mixed animate-in fade-in-0">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 border border-slate-100 animate-in fade-in-0 zoom-in-95">
        <div className="mb-5">
          <h3 className="text-lg font-normal text-slate-900 leading-tight">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-slate-600 leading-relaxed font-normal">{description}</p>
          )}
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

const SquareBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors ${className}`}
  >
    {children}
  </button>
);

// Find completely white row to split canvas without cutting text lines
function findBlankRow(canvas: HTMLCanvasElement, startY: number, maxSearch: number): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return startY;

  const yStart = Math.max(0, startY - maxSearch);
  const height = startY - yStart;
  if (height <= 0) return startY;

  try {
    const imgData = ctx.getImageData(0, yStart, canvas.width, height);
    const data = imgData.data;
    const w = canvas.width;

    for (let dy = height - 1; dy >= 0; dy--) {
      let isBlank = true;
      const rowOffset = dy * w * 4;
      for (let x = 0; x < w; x++) {
        const idx = rowOffset + x * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        if (a > 10 && (r < 254 || g < 254 || b < 254)) {
          isBlank = false;
          break;
        }
      }
      if (isBlank) {
        return yStart + dy;
      }
    }
  } catch (e) {
    console.warn("findBlankRow error", e);
  }
  return startY;
}

// Footnote Reference Position type
type FnRefPos = { id: string; x: number; y: number; w: number; h: number };

export default QuranRouter;
