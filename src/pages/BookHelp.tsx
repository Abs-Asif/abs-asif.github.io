import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/*
 * /book/help — Design & authoring reference.
 *
 * This page is written to be consumed by an AI assistant as a design brief.
 * The audience is expert: no live examples, no beginner hand-holding.
 * Every rule below is authoritative for content that will be exported as PDF.
 */

type Rule = { title: string; body: React.ReactNode };

const rules: Rule[] = [
  {
    title: "Document model",
    body: (
      <>
        A book has three plain-text fields: <code>title</code>, <code>author</code>,
        and <code>content</code>. Only <code>content</code> is Markdown. The cover
        page renders <code>title</code> and <code>author</code> with inline
        Markdown (<code>**bold**</code>, <code>*italic*</code>) — no block syntax.
        Line breaks in title/author are literal <code>&lt;br&gt;</code>.
      </>
    ),
  },
  {
    title: "Headings",
    body: (
      <>
        Use <code>#</code> through <code>######</code>. Headings are centered in
        the PDF. <code>#</code>, <code>##</code>, and <code>###</code> also
        populate the auto-generated Index. Headings never appear as the last
        block on a page — the generator moves widow headings to the next page.
      </>
    ),
  },
  {
    title: "Paragraphs & line breaks",
    body: (
      <>
        Blank line = new paragraph. Single <code>\n</code> inside a paragraph is
        rendered as a hard line break (GFM <code>breaks: true</code>). Body text
        is justified in all scripts.
      </>
    ),
  },
  {
    title: "Emphasis",
    body: (
      <>
        <code>**bold**</code>, <code>*italic*</code>, <code>~~strike~~</code>.
        No spaces between the marker and the text.
      </>
    ),
  },
  {
    title: "Bulleted lists",
    body: (
      <>
        Prefix each item with <code>-</code>. Indent nested items with four
        spaces. Bullets are drawn manually to keep glyph baselines aligned
        across scripts.
      </>
    ),
  },
  {
    title: "Numbered lists (multi-script)",
    body: (
      <>
        Accepted markers: Western <code>1.</code>, Bangla <code>১.</code> or{" "}
        <code>১।</code>, Arabic-Indic <code>١.</code>. Any of <code>.</code>,{" "}
        <code>)</code>, or <code>।</code> counts as a terminator. The renderer
        preserves the script the author used — do not mix scripts inside a
        single list.
      </>
    ),
  },
  {
    title: "Blockquotes",
    body: (
      <>
        Standard <code>&gt;</code> prefix. Blockquotes always render with a red
        left border and a very light red background — this is a permanent
        design decision, not a toggle. Use them for pull quotes and cited
        passages; do not use them for regular emphasis.
      </>
    ),
  },
  {
    title: "Links & images",
    body: (
      <>
        Standard Markdown: <code>[label](url)</code> and{" "}
        <code>![alt](url)</code>. Link rectangles are preserved in the PDF and
        remain clickable. Link text carries no underline — colour alone
        signals interactivity. Images are constrained to content width.
      </>
    ),
  },
  {
    title: "Tables",
    body: (
      <>
        GFM tables. The PDF strips all vertical rules and internal borders —
        only a top and bottom horizontal rule remain, plus a thin rule under
        the header row. Keep cells short; long text still wraps but the
        minimal style favours short, scannable rows.
      </>
    ),
  },
  {
    title: "Code",
    body: (
      <>
        Inline: single backticks. Blocks: triple backticks with an optional
        language tag (any hljs-supported language). Highlighting uses
        atom-one-dark tokens. Long lines wrap.
      </>
    ),
  },
  {
    title: "Horizontal rule",
    body: (
      <>
        A line with only <code>---</code>. Rendered as a 2px slate rule with
        generous vertical margin. Use to divide sections within a chapter.
      </>
    ),
  },
  {
    title: "Auto smart-quotes",
    body: (
      <>
        Straight <code>"</code> and <code>'</code> typed anywhere in title,
        author, or content are auto-replaced with curly forms
        (<code>“ ” ‘ ’</code>). The rule is context-sensitive: after a
        whitespace, bracket, or start-of-input the opening form is used;
        otherwise the closing form. Already-curly quotes are never re-written.
      </>
    ),
  },
  {
    title: "Auto-red numerals",
    body: (
      <>
        Every run of digits — Western, Bangla, and Arabic-Indic — is
        colourised red in preview and PDF. Footnote markers, list markers,
        code, and link text are excluded. This is permanent.
      </>
    ),
  },
  {
    title: "Script-aware direction",
    body: (
      <>
        A paragraph, list item, blockquote, or table cell whose visible
        content is <em>entirely</em> Arabic (ignoring punctuation, digits,
        whitespace) is set to <code>dir="rtl"</code> with right-anchored
        justification. Headings that are entirely Arabic remain centered but
        use RTL text flow. Mixed-script blocks stay LTR.
      </>
    ),
  },
  {
    title: "Footnotes",
    body: (
      <>
        Marker syntax: <code>[[id]]</code>. Definition syntax:{" "}
        <code>[[id==body]]</code>. The same <code>id</code> may be referenced
        multiple times but is defined exactly once. In the PDF, every page
        that contains at least one marker also renders every referenced
        footnote body at the bottom of that page, separated from body text by
        a short horizontal rule anchored to the left margin. Footnote bodies
        support inline Markdown. <code>id</code> should be a number so it can
        be transliterated into the numeral system of the book’s primary
        script.
      </>
    ),
  },
  {
    title: "Page numbers",
    body: (
      <>
        Body pagination starts at 1 on the first content page. Odd pages
        stamp the number top-right, even pages top-left, mirroring a bound
        book. Numerals follow the script detected from the first non-space
        character of the title (or content, if the title is empty).
      </>
    ),
  },
  {
    title: "Auto-generated index",
    body: (
      <>
        When the Index toggle is on, an Index is inserted immediately after
        the cover, listing every <code>#</code>/<code>##</code>/
        <code>###</code> heading with its resolved page number. The layout is
        a dotted leader — chapter name, gray dot-line, page number — all
        chapter names start at the same margin regardless of heading level.
        Direction is RTL only when every listed chapter contains at least
        one Arabic character; otherwise LTR. Users cannot edit the index; it
        is derived at export time.
      </>
    ),
  },
  {
    title: "Book-level password (open/delete gate)",
    body: (
      <>
        Each book tile on <code>/book</code> has a lock/unlock toggle. Setting
        a password stores its SHA-256 hash locally under{" "}
        <code>book-lock-v1:&lt;id&gt;</code>. A locked book requires the
        password to open and to delete. Removing the lock also requires the
        password. There is no reset mechanism — a lost password means the
        book stays locked forever.
      </>
    ),
  },
  {
    title: "PDF-level password (viewer gate)",
    body: (
      <>
        The editor exposes a separate PDF-password button. When set, the next
        export encrypts the PDF with that password (both user and owner) and
        restricts permissions to print and copy. The password is stored per
        book alongside its draft and is independent of the book-level lock.
      </>
    ),
  },
  {
    title: "Storage & lifecycle",
    body: (
      <>
        Drafts persist to <code>localStorage</code> under{" "}
        <code>book-draft-v1:&lt;id&gt;</code>. The list of book ids lives at{" "}
        <code>book-list-v1</code>. On returning to the library, any book
        whose <code>title</code>, <code>author</code>, and <code>content</code>{" "}
        are all empty is deleted — untitled placeholder books never
        accumulate.
      </>
    ),
  },
  {
    title: "Compression trade-off",
    body: (
      <>
        Body pages are rasterised at scale 3 and encoded as JPEG at quality
        0.78 inside a jsPDF stream with <code>compress: true</code>. This
        keeps typographic fidelity while producing substantially smaller
        files than a scale-4/quality-0.88 baseline.
      </>
    ),
  },
];

const BookHelp: React.FC = () => (
  <div className="min-h-screen bg-white px-5 pt-8 md:px-16 md:pt-14 lg:px-28 pb-24">
    <div className="w-full max-w-3xl mx-auto">
      <Link
        to="/book"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8"
      >
        <ArrowLeft size={16} /> Back to library
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
          Book authoring — design specification
        </h1>
        <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">
          Authoritative reference for the Markdown dialect and rendering rules
          used by the <code>/book</code> editor and its PDF exporter. Intended
          audience: expert human authors and AI assistants generating source
          text on their behalf. Every rule below is enforced by the exporter;
          content that ignores a rule will still render but may look wrong.
        </p>
      </header>

      <section className="space-y-8">
        {rules.map((r, i) => (
          <article key={i} className="border-b border-slate-100 pb-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
              {i + 1}. {r.title}
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">
              {r.body}
            </p>
          </article>
        ))}
      </section>
    </div>
  </div>
);

export default BookHelp;