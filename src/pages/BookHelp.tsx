import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

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

/* Small footnote renderer (mirrors /book preview behavior). */
function renderWithFootnotes(md: string): string {
  const defs = new Map<string, string>();
  const stripped = (md || "").replace(
    /\[\[([^\]\s=]+)==([\s\S]*?)\]\]/g,
    (_m, id, body) => {
      defs.set(String(id).trim(), String(body).trim());
      return "";
    }
  );
  const order: string[] = [];
  const seen = new Set<string>();
  stripped.replace(/\[\[([^\]\s=]+)\]\]/g, (_m, id) => {
    const t = String(id).trim();
    if (defs.has(t) && !seen.has(t)) {
      seen.add(t);
      order.push(t);
    }
    return _m;
  });
  const bnDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
  const arDigits = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  const firstCh = (md || "").trim().codePointAt(0) ?? 0;
  const script: "bn" | "ar" | "en" =
    firstCh >= 0x0980 && firstCh <= 0x09ff
      ? "bn"
      : (firstCh >= 0x0600 && firstCh <= 0x06ff) ||
        (firstCh >= 0xfb50 && firstCh <= 0xfdff)
      ? "ar"
      : "en";
  const toNum = (n: number) =>
    String(n)
      .split("")
      .map((d) =>
        /\d/.test(d)
          ? script === "bn"
            ? bnDigits[+d]
            : script === "ar"
            ? arDigits[+d]
            : d
          : d
      )
      .join("");
  const withMarkers = stripped.replace(/\[\[([^\]\s=]+)\]\]/g, (raw, id) => {
    const t = String(id).trim();
    if (!defs.has(t)) return raw;
    const n = parseInt(t, 10);
    const label = !isNaN(n) ? toNum(n) : t;
    return `<sup class="fn-ref">${label}</sup>`;
  });
  let html = marked.parse(withMarkers, {
    async: false,
    gfm: true,
    breaks: true,
  }) as string;
  if (order.length > 0) {
    const items = order
      .map((id) => {
        const n = parseInt(id, 10);
        const label = !isNaN(n) ? toNum(n) : id;
        const body = marked.parse(defs.get(id) || "", {
          async: false,
          gfm: true,
          breaks: true,
        }) as string;
        return `<div class="fn-item"><span class="fn-num">${label}.</span><div class="fn-body">${body}</div></div>`;
      })
      .join("");
    html += `<div class="fn-list">${items}</div>`;
  }
  return html;
}

type Section = {
  title: string;
  desc: React.ReactNode;
  example: string;
};

const sections: Section[] = [
  {
    title: "শিরোনাম",
    desc: (
      <>
        লাইনের শুরুতে <code>#</code> বসিয়ে শিরোনাম লিখুন। যত বেশি{" "}
        <code>#</code>, শিরোনাম তত ছোট। PDF-এ প্রতিটি শিরোনাম মাঝখানে বসবে।
      </>
    ),
    example: `# অধ্যায় এক\n## একটি ছোট ভাগ\n### আরও ছোট ভাগ`,
  },
  {
    title: "নতুন প্যারাগ্রাফ",
    desc: (
      <>
        নতুন প্যারাগ্রাফ চাইলে দুই লাইনের মাঝে একটা ফাঁকা লাইন রাখুন। শুধু
        Enter চাপলে একই প্যারাগ্রাফের ভেতরেই লাইন ভাঙবে।
      </>
    ),
    example: `প্রথম প্যারাগ্রাফ।\n\nদ্বিতীয় প্যারাগ্রাফ।`,
  },
  {
    title: "মোটা, হেলানো ও কাটা লেখা",
    desc: (
      <>
        মোটা — <code>**এভাবে**</code>, হেলানো — <code>*এভাবে*</code>, কাটা —{" "}
        <code>~~এভাবে~~</code>। মাঝখানে কোনো স্পেস দেবেন না।
      </>
    ),
    example: `এটি **মোটা**, এটি *হেলানো*, এটি ~~কাটা~~ লেখা।`,
  },
  {
    title: "বুলেট তালিকা",
    desc: (
      <>
        প্রতিটি লাইনের শুরুতে <code>-</code> দিন। ভেতরে আরেকটা তালিকা চাইলে
        চারটি স্পেস দিয়ে ভেতরে নিয়ে যান।
      </>
    ),
    example: `- চা\n- কফি\n    - দুধ চা\n    - রং চা\n- পানি`,
  },
  {
    title: "সংখ্যার তালিকা — বাংলা ও আরবিতেও",
    desc: (
      <>
        শুধু <code>1.</code> না, <code>১.</code> বা <code>١.</code> দিয়েও
        তালিকা বানানো যাবে। যেই সংখ্যায় শুরু করবেন, পুরো তালিকা সেই সংখ্যায়ই
        চলবে।
      </>
    ),
    example: `১. সকালে উঠা\n২. নাশতা করা\n৩. বের হওয়া`,
  },
  {
    title: "উদ্ধৃতি",
    desc: (
      <>
        লাইনের শুরুতে <code>&gt;</code> বসান। একাধিক লাইনের উদ্ধৃতি দিতে চাইলে
        প্রতিটি লাইনের শুরুতেই <code>&gt;</code> লাগাবেন।
      </>
    ),
    example: `> পড়ো, তোমার প্রভুর নামে যিনি সৃষ্টি করেছেন।`,
  },
  {
    title: "লিঙ্ক",
    desc: (
      <>
        গঠনটা সহজ — <code>[যা দেখাবে](ঠিকানা)</code>। PDF-এও এই লিঙ্কগুলো
        ক্লিক করা যাবে।
      </>
    ),
    example: `আমার সাইট: [abdullah.ami.bd](https://abdullah.ami.bd)`,
  },
  {
    title: "ছবি",
    desc: (
      <>
        লিঙ্কের মতোই, শুধু আগে একটা <code>!</code> বসান:{" "}
        <code>![বিকল্প লেখা](ছবির ঠিকানা)</code>।
      </>
    ),
    example: `![নমুনা ছবি](https://picsum.photos/400/200)`,
  },
  {
    title: "টেবিল",
    desc: (
      <>
        কলামগুলো <code>|</code> দিয়ে আলাদা করুন। প্রথম লাইনে শিরোনাম, পরের
        লাইনে <code>---</code> দিয়ে আলাদা করতে হবে।
      </>
    ),
    example: `| নাম | বয়স |\n|------|------|\n| রহিম | ২২ |\n| করিম | ২৫ |`,
  },
  {
    title: "কোড",
    desc: (
      <>
        একটামাত্র শব্দ কোড করতে চাইলে দুপাশে একটা করে ব্যাকটিক দিন। বড় কোড
        ব্লকের জন্য তিনটা ব্যাকটিক দিয়ে শুরু-শেষ করুন; প্রথম লাইনে ভাষার নাম
        লিখলে রং দিয়ে highlight হবে।
      </>
    ),
    example: "`print()` একটি ফাংশন।\n\n```python\nprint(\"হ্যালো\")\n```",
  },
  {
    title: "লম্বা রেখা",
    desc: (
      <>
        একটা আলাদা লাইনে শুধু <code>---</code> লিখুন — পাতা জুড়ে একটা পাতলা
        রেখা বসবে। অধ্যায় ভাগ করার জন্য বেশ কাজের।
      </>
    ),
    example: `আগের অংশ শেষ।\n\n---\n\nনতুন অংশ শুরু।`,
  },
  {
    title: "পুরোপুরি আরবি লাইন",
    desc: (
      <>
        কোনো লাইন যদি শুরু থেকে শেষ পর্যন্ত পুরোপুরি আরবি হয়, সেটা নিজে থেকেই
        ডান দিক ঘেঁষে বসবে। আপনাকে আলাদা কিছু করতে হবে না।
      </>
    ),
    example: `بسم الله الرحمن الرحيم`,
  },
  {
    title: "পৃষ্ঠা নম্বর সম্পর্কে",
    desc: (
      <>
        প্রচ্ছদের পরের পাতা থেকে নম্বর শুরু হবে। বিজোড় পাতা (১, ৩, ৫…) উপরে
        ডানে, জোড় পাতা (২, ৪, ৬…) উপরে বাঁয়ে — আসল বইয়ের মতো। শিরোনামের প্রথম
        অক্ষর কোন ভাষার, সেটা দেখে নম্বরও সেই ভাষার সংখ্যায় বসবে।
      </>
    ),
    example: `# আমার বই\n(শিরোনাম বাংলা → পৃষ্ঠা নম্বরও বাংলায়)`,
  },
  {
    title: "ফুটনোট",
    desc: (
      <>
        মূল লেখায় যেখানে নম্বর বসাতে চান, সেখানে <code>[[1]]</code> লিখুন —
        এটা ছোট করে উপরে <sup>১</sup> হয়ে বসবে। আর সেই নম্বরের ব্যাখ্যা
        লিখতে যেকোনো জায়গায় <code>[[1==এখানে ব্যাখ্যা]]</code> দিন। প্রিভিউ ও
        PDF-এ ব্যাখ্যাটা পাতার নিচে, একটা ছোট রেখার পরে আলাদা করে দেখানো হবে।
        PDF-এ যেই পাতায় নম্বর আছে, ঠিক সেই পাতার নিচেই ফুটনোটটা বসবে।
        ফুটনোটের ভেতরেও সাধারণ markdown (মোটা, হেলানো, লিঙ্ক) কাজ করবে।
      </>
    ),
    example: `ইমাম শাফেয়ী রাহিমাহুল্লাহ একজন বড় ফকীহ ছিলেন। [[1]] তাঁর বই *আল-উম্ম* আজও পড়া হয়। [[2]]\n\n[[1==জন্ম ১৫০ হিজরী, মৃত্যু ২০৪ হিজরী।]]\n[[2==মূল আরবি গ্রন্থ, একাধিক খণ্ডে।]]`,
  },
];

/* Sections shown only when experimental features are enabled. */
const experimentalSections: Section[] = [
  {
    title: "লোকাল AI সহকারী",
    desc: (
      <>
        <strong>Experimental.</strong> নিচের ফ্লাস্ক-বোতাম চালু থাকলে বইয়ের
        পাতায় একটা বেগুনি <em>Sparkles</em> বোতাম আসবে (মডেল লোড হওয়ার পর)।
        সেখানে ছোট একটা কমান্ড লিখে পাঠালে ব্রাউজারের ভেতরেই একটা ছোট AI মডেল
        (~৭৭M) উত্তর তৈরি করে সরাসরি বইয়ের লেখায় বসিয়ে দেবে। কোনো ডেটা
        সার্ভারে যায় না — সব কিছু আপনার মেশিনেই চলে। ছোট মডেল, তাই সাধারণ ও
        সংক্ষিপ্ত কাজেই ভালো।
      </>
    ),
    example: `> AI-কে বলুন: "বন্ধুত্ব নিয়ে ৩ লাইনের একটি অনুচ্ছেদ লেখো।"`,
  },
];

const MiniTry: React.FC<{ initial: string }> = ({ initial }) => {
  const [text, setText] = useState(initial);
  const html = useMemo(
    () => renderWithFootnotes(text),
    [text]
  );
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200 rounded-xl overflow-hidden">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        dir="auto"
        className="w-full min-h-[140px] p-3 font-mono text-[13px] leading-relaxed bg-slate-50 focus:outline-none resize-y"
      />
      <div
        className="font-mixed pdf-preview p-3 min-h-[140px] text-base overflow-auto bg-white border-t md:border-t-0 md:border-l border-slate-100"
        dir="auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

const BookHelp = () => {
  const [experimental, setExperimental] = useState(false);
  useEffect(() => {
    try {
      setExperimental(localStorage.getItem("book-experimental-v1") === "1");
    } catch {}
  }, []);
  return (
    <div className="min-h-screen bg-white px-5 pt-8 md:px-16 md:pt-14 lg:px-28 pb-24">
      <div className="w-full max-w-3xl mx-auto">
        <Link
          to="/book"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft size={16} /> বইয়ের পাতায় ফিরে যান
        </Link>

        <header className="mb-10 font-mixed">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            লেখার গাইড
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">
            বইয়ের পাতায় কীভাবে শিরোনাম, তালিকা, টেবিল, ছবি — এসব সাজাবেন,
            সেটাই এখানে ছোট ছোট ভাগে বলা আছে। প্রতিটার নিচে একটা ছোট
            এডিটরও আছে — সেখানে নিজে হাত দিয়ে দেখে নিতে পারবেন কেমন দেখায়।
          </p>
        </header>

        <section className="space-y-10 font-mixed">
          {sections.map((s, i) => (
            <article key={i} className="border-b border-slate-100 pb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                {i + 1}. {s.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {s.desc}
              </p>
              <MiniTry initial={s.example} />
            </article>
          ))}
        </section>

        {experimental && experimentalSections.length > 0 && (
          <section className="mt-14 font-mixed">
            <div className="flex items-center gap-2 mb-6">
              <FlaskConical size={20} className="text-amber-600" />
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                পরীক্ষামূলক ফিচার
              </h2>
              <span className="ml-2 text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                Experimental
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              এই ফিচারগুলো এখনো পরীক্ষার পর্যায়ে আছে — যেকোনো সময় বদলাতে বা
              সরিয়ে ফেলতে পারি। বইয়ের পাতায় নিচের বার-এ ফ্লাস্ক বোতাম আছে,
              সেটা দিয়ে চালু/বন্ধ করা যাবে।
            </p>
            <div className="space-y-10">
              {experimentalSections.map((s, i) => (
                <article key={i} className="border-b border-slate-100 pb-8">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    {s.title}
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                      Experimental
                    </span>
                  </h3>
                  <p className="text-base text-slate-700 leading-relaxed">
                    {s.desc}
                  </p>
                  <MiniTry initial={s.example} />
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BookHelp;