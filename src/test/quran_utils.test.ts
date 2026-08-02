import { describe, it, expect } from "vitest";

function extractFootnoteDefs(text: string): { cleaned: string; defs: Map<string, string> } {
  const defs = new Map<string, string>();
  const cleaned = (text || "").replace(/\[\[([^\]\s=]+)==([\s\S]*?)\]\]/g, (_m, id, body) => {
    defs.set(String(id).trim(), String(body).trim());
    return "";
  });
  return { cleaned, defs };
}

function renderSimpleQuranText(text: string, script: "bn" | "ar" | "en", validIds: Set<string>): string {
  if (!text) return "";
  let { cleaned } = extractFootnoteDefs(text);

  // Convert to numerals helper
  const toNumerals = (n: number, scr: "bn" | "ar" | "en"): string => {
    const s = String(n);
    if (scr === "en") return s;
    const map =
      scr === "bn"
        ? ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
        : ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return s.split("").map((d) => (/\d/.test(d) ? map[+d] : d)).join("");
  };

  // Parse footnotes [[id]]
  cleaned = cleaned.replace(/\[\[([^\]\s=]+)\]\]/g, (raw, id) => {
    const t = String(id).trim();
    if (!validIds.has(t)) return raw;
    const n = parseInt(t, 10);
    const label = !isNaN(n) ? toNumerals(n, script) : t;
    return `<sup class="fn-ref" data-fn-id="${t}">${label}</sup>`;
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

describe("Quran Simple Parser and Helpers", () => {
  it("should extract footnote definitions and leave cleaned text", () => {
    const text = "আজকে আমরা [[১]] শুরু করব। [[১==প্রথম আয়াত এর ফুটনোট]]";
    const { cleaned, defs } = extractFootnoteDefs(text);
    expect(cleaned).toBe("আজকে আমরা [[১]] শুরু করব। ");
    expect(defs.get("১")).toBe("প্রথম আয়াত এর ফুটনোট");
  });

  it("should render footnotes with superscript tags when valid", () => {
    const text = "আজকে আমরা [[১]] শুরু করব।";
    const validIds = new Set(["১"]);
    const rendered = renderSimpleQuranText(text, "bn", validIds);
    expect(rendered).toBe('আজকে আমরা <sup class="fn-ref" data-fn-id="১">১</sup> শুরু করব।');
  });

  it("should not render footnote tag if id is not in validIds", () => {
    const text = "আজকে আমরা [[১]] শুরু করব।";
    const validIds = new Set<string>();
    const rendered = renderSimpleQuranText(text, "bn", validIds);
    expect(rendered).toBe("আজকে আমরা [[১]] শুরু করব।");
  });

  it("should parse bold and italic tags correctly", () => {
    const text = "এটি একটি **বোল্ড** এবং *ইটালিক* লেখা।";
    const rendered = renderSimpleQuranText(text, "bn", new Set());
    expect(rendered).toBe("এটি একটি <strong>বোল্ড</strong> এবং <em>ইটালিক</em> লেখা।");
  });

  it("should parse bold and italic combined tag correctly", () => {
    const text = "এটি ***উভয়ই*** লেখা।";
    const rendered = renderSimpleQuranText(text, "bn", new Set());
    expect(rendered).toBe("এটি <strong><em>উভয়ই</em></strong> লেখা।");
  });
});
