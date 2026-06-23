import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

type Section = {
  title: string;
  desc: string;
  example: string;
};

const sections: Section[] = [
  {
    title: "শিরোনাম (Headings)",
    desc:
      "লাইনের শুরুতে # চিহ্ন দিয়ে শিরোনাম বানান। যত বেশি # ব্যবহার করবেন, শিরোনাম তত ছোট হবে (h1 থেকে h6 পর্যন্ত)। প্রতিটি শিরোনাম PDF-এ স্বয়ংক্রিয়ভাবে কেন্দ্রে দেখাবে।",
    example: `# প্রথম অধ্যায়\n## উপ-শিরোনাম\n### আরও ছোট শিরোনাম`,
  },
  {
    title: "প্যারাগ্রাফ ও লাইন ভাঙা",
    desc:
      "নতুন প্যারাগ্রাফ শুরু করতে একটি ফাঁকা লাইন দিন। সাধারণ Enter চাপলে একই প্যারাগ্রাফের ভেতরে নতুন লাইন তৈরি হবে।",
    example: `এটি প্রথম প্যারাগ্রাফ।\n\nএটি দ্বিতীয় প্যারাগ্রাফ — মাঝে একটি ফাঁকা লাইন আছে।`,
  },
  {
    title: "মোটা (Bold), হেলানো (Italic) ও বাতিল লেখা",
    desc:
      "মোটা করতে দুটি তারকাচিহ্ন **এভাবে**, হেলানো করতে একটি *এভাবে*, এবং বাতিল লেখা দেখাতে দুটি টিল্ডা ~~এভাবে~~ ব্যবহার করুন।",
    example: `এটি **মোটা লেখা**, এটি *হেলানো লেখা*, এবং এটি ~~বাতিল লেখা~~।`,
  },
  {
    title: "ইংরেজি বুলেট তালিকা",
    desc: "প্রতিটি আইটেমের আগে - অথবা * চিহ্ন দিন। ভেতরে আরেকটি তালিকা চাইলে চার স্পেস (অথবা ট্যাব) দিয়ে ভেতরে ঢোকান।",
    example: `- প্রথম পয়েন্ট\n- দ্বিতীয় পয়েন্ট\n    - ভেতরের পয়েন্ট\n    - আরেকটি ভেতরের পয়েন্ট\n- তৃতীয় পয়েন্ট`,
  },
  {
    title: "সংখ্যাযুক্ত তালিকা (১., ২., ৩.)",
    desc:
      "ইংরেজি 1., 2., 3. ছাড়াও বাংলা ১., ২., ৩. এবং আরবি ١., ٢., ٣. সংখ্যা ব্যবহার করতে পারেন। তালিকার প্রতিটি লাইন এভাবে লিখুন।",
    example: `১. প্রথম কাজ\n২. দ্বিতীয় কাজ\n৩. তৃতীয় কাজ`,
  },
  {
    title: "উদ্ধৃতি (Blockquote)",
    desc: "লাইনের শুরুতে > চিহ্ন বসান। একাধিক লাইনে চালিয়ে যেতে প্রতিটি লাইনের আগে > দিন।",
    example: `> জ্ঞান এমন এক সম্পদ যা যত খরচ করা হয়, তত বাড়ে।\n> — অজানা`,
  },
  {
    title: "লিঙ্ক (Link)",
    desc:
      "[দেখানো লেখা](সম্পূর্ণ ঠিকানা) এই গঠনে লিঙ্ক বানান। PDF-এ লিঙ্কগুলো ক্লিকযোগ্য থাকবে।",
    example: `আমার পোর্টফোলিও দেখুন: [abdullah.ami.bd](https://abdullah.ami.bd)।`,
  },
  {
    title: "ছবি (Image)",
    desc:
      "![বিকল্প লেখা](ছবির লিংক) এই গঠনে ছবি যোগ করুন। অনলাইন থেকে যেকোনো ছবির সরাসরি লিংক ব্যবহার করতে পারেন।",
    example: `![একটি নমুনা ছবি](https://picsum.photos/400/200)`,
  },
  {
    title: "টেবিল (Table)",
    desc:
      "প্রতিটি কলামকে | চিহ্ন দিয়ে আলাদা করুন। প্রথম লাইনে শিরোনাম, দ্বিতীয় লাইনে ড্যাশ (---) দিয়ে আলাদা করতে হবে।",
    example: `| বিষয় | মান |\n|------|------|\n| ভাষা | বাংলা |\n| প্রকাশ | ২০২৬ |\n| পৃষ্ঠা | ২৫০ |`,
  },
  {
    title: "কোড (Inline ও Block)",
    desc:
      "ছোট কোডের জন্য একটি ব্যাকটিক \\` দিয়ে ঘিরে দিন। বড় কোড ব্লকের জন্য তিনটি ব্যাকটিক ``` ব্যবহার করুন এবং প্রথম লাইনে ভাষার নাম দিলে রঙিন syntax highlighting হবে।",
    example: `\`console.log()\` একটি ফাংশন।\n\n\`\`\`js\nfunction hello(name) {\n  return "Hello, " + name;\n}\n\`\`\``,
  },
  {
    title: "অনুভূমিক রেখা (Horizontal Rule)",
    desc: "তিনটি ড্যাশ --- আলাদা একটি লাইনে লিখলে পৃষ্ঠাজুড়ে একটি লম্বা রেখা আসবে — অধ্যায়ের ভাগ করতে দারুণ কাজে দেয়।",
    example: `প্রথম অংশ শেষ।\n\n---\n\nদ্বিতীয় অংশ শুরু।`,
  },
  {
    title: "আরবি লাইনের জন্য বিশেষ ব্যবস্থা",
    desc:
      "যদি কোনো লাইন শুরু থেকে শেষ পর্যন্ত পুরোপুরি আরবি হয়, তবে সেটি স্বয়ংক্রিয়ভাবে ডান দিকে align হবে (RTL)। আপনাকে আলাদা কিছু করতে হবে না।",
    example: `بسم الله الرحمن الرحيم\n\nالحمد لله رب العالمين`,
  },
  {
    title: "পৃষ্ঠা নম্বর",
    desc:
      "প্রচ্ছদের পরের পাতা থেকে স্বয়ংক্রিয়ভাবে পৃষ্ঠা নম্বর বসে যাবে। শিরোনামের প্রথম অক্ষর বাংলা হলে ১, ২, ৩…; ইংরেজি হলে 1, 2, 3…; এবং আরবি হলে ١, ٢, ٣… ব্যবহার হবে।",
    example: `# আমার বই\n(শিরোনাম বাংলায় → পৃষ্ঠা নম্বরও বাংলায় বসবে)`,
  },
];

const TRY_DEFAULT = `# আমার প্রথম বই\n\nএটি একটি **নমুনা প্যারাগ্রাফ**। এখানে *হেলানো লেখাও* আছে।\n\n## কাজের তালিকা\n\n১. বই শুরু করা\n২. লেখা চালিয়ে যাওয়া\n৩. PDF বানানো\n\n> পড়াশোনার কোনো বিকল্প নেই।\n\n| ভাষা | লিপি |\n|------|------|\n| বাংলা | ব্রাহ্মী |\n| আরবি | আরবি |\n\n\`\`\`js\nconsole.log("Hello, World!");\n\`\`\`\n\nএকটি লিঙ্ক: [abdullah.ami.bd](https://abdullah.ami.bd)\n`;

const BookHelp = () => {
  const [tryText, setTryText] = useState(TRY_DEFAULT);
  const previewHtml = useMemo(
    () => marked.parse(tryText, { async: false, gfm: true, breaks: true }) as string,
    [tryText]
  );

  return (
    <div className="min-h-screen bg-white px-6 pt-10 md:px-20 md:pt-16 lg:px-32 pb-24">
      <div className="w-full max-w-4xl mx-auto">
        <Link
          to="/book"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft size={16} /> বইয়ের পাতায় ফিরে যান
        </Link>

        <header className="mb-12 font-mixed">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            Markdown গাইড — বাংলায়
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            <span className="font-medium">/book</span> পৃষ্ঠায় আপনি কীভাবে আপনার বইয়ের
            লেখাকে সাজাবেন — শিরোনাম, তালিকা, টেবিল, ছবি, কোড, লিঙ্ক — সবকিছুর
            সম্পূর্ণ নির্দেশিকা। প্রতিটি উদাহরণ সরাসরি কপি করে চেষ্টা করতে পারবেন।
          </p>
        </header>

        <section className="space-y-10 font-mixed">
          {sections.map((s, i) => (
            <article key={i} className="border-b border-slate-100 pb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                {i + 1}. {s.title}
              </h2>
              <p className="text-base text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                {s.desc}
              </p>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {s.example}
              </pre>
            </article>
          ))}
        </section>

        <section className="mt-16 font-mixed">
          <h2 className="text-3xl font-semibold text-slate-900 mb-3">
            লাইভ এডিটর — এখানে চেষ্টা করুন
          </h2>
          <p className="text-base text-slate-600 mb-6">
            বাঁ পাশে লিখুন, ডান পাশে সরাসরি ফলাফল দেখুন।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-2xl overflow-hidden">
            <textarea
              value={tryText}
              onChange={(e) => setTryText(e.target.value)}
              className="w-full min-h-[420px] p-5 font-mono text-sm leading-relaxed bg-slate-50 focus:outline-none resize-y"
              dir="auto"
              spellCheck={false}
            />
            <div
              className="font-mixed pdf-preview p-5 min-h-[420px] overflow-auto bg-white border-l border-slate-100"
              dir="auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookHelp;