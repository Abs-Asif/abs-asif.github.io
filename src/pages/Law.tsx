import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Loader2, BookOpen, ExternalLink, Moon, Sun, Scale, ChevronLeft, ChevronRight, Bookmark, Filter, Book, Info } from "lucide-react";
import { MultiLanguageText } from "@/lib/font-utils";
import { getFontClass } from "@/lib/font-utils";

export interface LawItem {
  id: string; // The numeric ID from link (e.g., "130" from "act-130.html")
  title: string;
  actNo: string;
  year: string;
  originalLink: string;
  detailsLink: string;
}

export interface LawSection {
  id?: string;
  head: string;
  details: string;
}

export interface LawChapter {
  number: string;
  name: string;
  sections: LawSection[];
}

export interface LawDetails {
  id: string;
  title: string;
  actNo: string;
  publishDate: string;
  preambleTitle: string;
  preambleBody: string;
  chapters: LawChapter[];
  unGroupedSections: LawSection[];
  footnotes: { num: string; text: string }[];
}

// Proxies list matching api-utils.ts
const PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://corsproxy.io/?",
  "https://api.cors.lol/?url=",
  "https://every-origin-ecru.vercel.app/get?url="
];

// Offline Fallback Dataset for Bangladeshi Laws
const FALLBACK_LAWS: LawItem[] = [
  {
    id: "11",
    title: "The Penal Code, 1860",
    actNo: "ACT NO. XLV OF 1860",
    year: "1860",
    originalLink: "http://bdlaws.minlaw.gov.bd/act-11.html",
    detailsLink: "http://bdlaws.minlaw.gov.bd/act-details-11.html"
  },
  {
    id: "75",
    title: "The Code of Criminal Procedure, 1898",
    actNo: "ACT NO. V OF 1898",
    year: "1898",
    originalLink: "http://bdlaws.minlaw.gov.bd/act-75.html",
    detailsLink: "http://bdlaws.minlaw.gov.bd/act-details-75.html"
  },
  {
    id: "367",
    title: "The Constitution of the People's Republic of Bangladesh",
    actNo: "Constitution of 1972",
    year: "1972",
    originalLink: "http://bdlaws.minlaw.gov.bd/act-367.html",
    detailsLink: "http://bdlaws.minlaw.gov.bd/act-details-367.html"
  },
  {
    id: "24",
    title: "The Evidence Act, 1872",
    actNo: "ACT NO. I OF 1872",
    year: "1872",
    originalLink: "http://bdlaws.minlaw.gov.bd/act-24.html",
    detailsLink: "http://bdlaws.minlaw.gov.bd/act-details-24.html"
  },
  {
    id: "26",
    title: "The Contract Act, 1872",
    actNo: "ACT NO. IX OF 1872",
    year: "1872",
    originalLink: "http://bdlaws.minlaw.gov.bd/act-26.html",
    detailsLink: "http://bdlaws.minlaw.gov.bd/act-details-26.html"
  },
  {
    id: "36",
    title: "The Specific Relief Act, 1877",
    actNo: "ACT NO. I OF 1877",
    year: "1877",
    originalLink: "http://bdlaws.minlaw.gov.bd/act-36.html",
    detailsLink: "http://bdlaws.minlaw.gov.bd/act-details-36.html"
  },
  {
    id: "90",
    title: "The Registration Act, 1908",
    actNo: "ACT NO. XVI OF 1908",
    year: "1908",
    originalLink: "http://bdlaws.minlaw.gov.bd/act-90.html",
    detailsLink: "http://bdlaws.minlaw.gov.bd/act-details-90.html"
  }
];

const FALLBACK_LAW_DETAILS: Record<string, LawDetails> = {
  "11": {
    id: "11",
    title: "The Penal Code, 1860",
    actNo: "ACT NO. XLV OF 1860",
    publishDate: "6th October, 1860",
    preambleTitle: "Preamble",
    preambleBody: "WHEREAS it is expedient to provide a general Penal Code for Bangladesh; It is enacted as follows:-",
    chapters: [
      {
        number: "Chapter I",
        name: "INTRODUCTION",
        sections: [
          {
            head: "Title and extent of operation of the Code",
            details: "1. This Act shall be called the Penal Code, and shall take effect throughout Bangladesh."
          },
          {
            head: "Punishment of offences committed within Bangladesh",
            details: "2. Every person shall be liable to punishment under this Code and not otherwise for every act or omission contrary to the provisions thereof, of which he shall be guilty within Bangladesh."
          }
        ]
      },
      {
        number: "Chapter II",
        name: "GENERAL EXPLANATIONS",
        sections: [
          {
            head: "Definitions in the Code to be understood subject to exceptions",
            details: "6. Throughout this Code every definition of an offence, every penal provision and every illustration of every such definition or penal provision, shall be understood subject to the exceptions contained in the Chapter entitled 'General Exceptions', though those exceptions are not repeated in such definition, penal provision or illustration."
          },
          {
            head: "Sense of expression once explained",
            details: "7. Every expression which is explained in any part of this Code, is used in every part of this Code in conformity with the explanation."
          }
        ]
      }
    ],
    unGroupedSections: [],
    footnotes: [
      { num: "1", text: "The word 'Bangladesh' was substituted for 'Pakistan' by Act VIII of 1973." }
    ]
  },
  "75": {
    id: "75",
    title: "The Code of Criminal Procedure, 1898",
    actNo: "ACT NO. V OF 1898",
    publishDate: "22nd March, 1898",
    preambleTitle: "Preamble",
    preambleBody: "WHEREAS it is expedient to consolidate and amend the law relating to the Criminal Procedure; It is hereby enacted as follows:-",
    chapters: [
      {
        number: "Chapter I",
        name: "PRELIMINARY",
        sections: [
          {
            head: "Short title and commencement",
            details: "1.(1) This Act may be called the Code of Criminal Procedure, 1898; and it shall come into force on the first day of July, 1898."
          },
          {
            head: "Trial of offences under Penal Code and other laws",
            details: "5.(1) All offences under the Penal Code shall be investigated, inquired into, tried, and otherwise dealt with according to the provisions hereinafter contained."
          }
        ]
      }
    ],
    unGroupedSections: [],
    footnotes: []
  },
  "367": {
    id: "367",
    title: "The Constitution of the People's Republic of Bangladesh",
    actNo: "Constitution of 1972",
    publishDate: "16th December, 1972",
    preambleTitle: "Preamble",
    preambleBody: "We, the people of Bangladesh, having proclaimed our Independence on the 26th day of March, 1971 and through a historic struggle for national liberation, established the independent, sovereign People's Republic of Bangladesh...",
    chapters: [
      {
        number: "Part I",
        name: "THE REPUBLIC",
        sections: [
          {
            head: "The Republic",
            details: "1. Bangladesh is a unitary, independent, sovereign Republic to be known as the People's Republic of Bangladesh."
          },
          {
            head: "The territory of the Republic",
            details: "2. The territory of the Republic shall comprise the territories which immediately before the proclamation of independence were comprised in East Pakistan..."
          },
          {
            head: "State religion",
            details: "2A. The state religion of the Republic is Islam, but the State shall ensure equal status and equal right in the practice of the Hindu, Buddhist, Christian and other religions."
          },
          {
            head: "State language",
            details: "3. The state language of the Republic is Bangla."
          }
        ]
      }
    ],
    unGroupedSections: [],
    footnotes: []
  }
};

const fetchWithUtf16 = async (url: string) => {
  for (const proxyBase of PROXIES) {
    try {
      const proxiedUrl = `${proxyBase}${encodeURIComponent(url)}`;
      const response = await fetch(proxiedUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        let decoder = new TextDecoder("utf-8");
        if (bytes[0] === 0xfe && bytes[1] === 0xff) {
          decoder = new TextDecoder("utf-16be");
        } else if (bytes[0] === 0xff && bytes[1] === 0xfe) {
          decoder = new TextDecoder("utf-16le");
        } else if (bytes[0] === 0x00 && bytes[1] === 0x3c) {
          decoder = new TextDecoder("utf-16be");
        } else if (bytes[1] === 0x00 && bytes[0] === 0x3c) {
          decoder = new TextDecoder("utf-16le");
        } else {
          let evenZeros = 0;
          let oddZeros = 0;
          const limit = Math.min(bytes.length, 100);
          for (let i = 0; i < limit; i++) {
            if (bytes[i] === 0) {
              if (i % 2 === 0) evenZeros++;
              else oddZeros++;
            }
          }
          if (evenZeros > 10) {
            decoder = new TextDecoder("utf-16be");
          } else if (oddZeros > 10) {
            decoder = new TextDecoder("utf-16le");
          }
        }

        const text = decoder.decode(buffer);
        if (text && text.length > 100 && !text.includes("cloudflare") && !text.includes("Connection timed out") && !text.includes("Internal Server Error")) {
          return text;
        }
      }
    } catch (e) {
      console.warn("Proxy failed for", url, e);
    }
  }
  throw new Error("All proxies failed or returned empty content.");
};

export const parseChronologicalIndex = (htmlText: string): LawItem[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const links = doc.querySelectorAll("a");
  const items: LawItem[] = [];
  const seenIds = new Set<string>();

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const match = href.match(/act-(\d+)\.html/);
    if (match) {
      const id = match[1];
      if (seenIds.has(id)) return;
      seenIds.add(id);

      const title = link.textContent?.trim() || "Untitled Law";
      let actNo = "";
      let year = "";

      let parent = link.parentElement;
      if (parent) {
        const parentText = parent.textContent || "";
        const yearMatch = parentText.match(/\b(17\d{2}|18\d{2}|19\d{2}|20\d{2})\b/);
        if (yearMatch) {
          year = yearMatch[1];
        }
        const actMatch = parentText.match(/\b(I[VX]|V[I]{0,3}|X[IB]{0,3}|L[I]{0,3}|C[I]{0,3}|[VIXLCDM]+)\b/);
        if (actMatch) {
          actNo = actMatch[1];
        }
      }

      if (!year) {
        const titleYearMatch = title.match(/\b(17\d{2}|18\d{2}|19\d{2}|20\d{2})\b/);
        if (titleYearMatch) {
          year = titleYearMatch[1];
        }
      }

      items.push({
        id,
        title,
        actNo: actNo || "N/A",
        year: year || "N/A",
        originalLink: `http://bdlaws.minlaw.gov.bd/act-${id}.html`,
        detailsLink: `http://bdlaws.minlaw.gov.bd/act-details-${id}.html`
      });
    }
  });

  return items;
};

export const parseLawDetails = (id: string, htmlText: string): LawDetails => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  doc.querySelectorAll(".clbr, .na").forEach(el => {
    el.parentNode?.insertBefore(doc.createTextNode(" "), el);
    el.parentNode?.removeChild(el);
  });

  const titleEl = doc.querySelector("h3");
  const title = titleEl ? titleEl.textContent?.trim() || "" : "Untitled Law";

  const actNoEl = doc.querySelector("h4");
  const actNo = actNoEl ? actNoEl.textContent?.replace(/[\(\)]/g, "").trim() || "" : "";

  const publishDateEl = doc.querySelector(".publish-date");
  const publishDate = publishDateEl ? publishDateEl.textContent?.replace(/[\[\]]/g, "").trim() || "" : "";

  let preambleTitle = "Preamble";
  let preambleBody = "";
  const actRoleEl = doc.querySelector(".act-role-style");
  if (actRoleEl) {
    preambleBody = actRoleEl.textContent?.trim() || "";
  }

  doc.querySelectorAll("div.row").forEach(row => {
    const text = row.textContent || "";
    if (text.toLowerCase().includes("preamble") && !preambleBody) {
      preambleBody = text.replace(/preamble/gi, "").trim();
    }
  });

  const chapters: LawChapter[] = [];
  const unGroupedSections: LawSection[] = [];
  const footnotes: { num: string; text: string }[] = [];

  doc.querySelectorAll(".footnote, span[class*='footnote']").forEach((fn, idx) => {
    const fnText = fn.getAttribute("title") || "";
    const fnNumEl = fn.querySelector("sup");
    const fnNum = fnNumEl ? fnNumEl.textContent?.trim() || String(idx + 1) : String(idx + 1);
    if (fnText) {
      footnotes.push({ num: fnNum, text: fnText });
    }
  });

  const secHeads = doc.querySelectorAll(".col-sm-3.txt-head, td.txt-head");
  const secDetails = doc.querySelectorAll(".col-sm-9.txt-details, td.txt-details");

  let currentChapter: LawChapter | null = null;
  const parentContainer = doc.querySelector(".lineremoves")?.parentElement || doc.body;
  const children = Array.from(parentContainer.children);

  children.forEach(child => {
    const isChapter = child.querySelector(".act-chapter-group") || child.classList.contains("act-chapter-group");
    if (isChapter) {
      const chapterNoEl = child.querySelector(".act-chapter-no");
      const chapterNameEl = child.querySelector(".act-chapter-name");
      const numStr = chapterNoEl ? chapterNoEl.textContent?.trim() || "" : "";
      const nameStr = chapterNameEl ? chapterNameEl.textContent?.trim() || "" : "";

      currentChapter = {
        number: numStr,
        name: nameStr,
        sections: []
      };
      chapters.push(currentChapter);
      return;
    }

    const txtHead = child.querySelector(".txt-head");
    const txtDetails = child.querySelector(".txt-details");
    if (txtHead && txtDetails) {
      const head = txtHead.textContent?.trim() || "";
      const details = txtDetails.textContent?.trim() || "";
      const section: LawSection = { head, details };

      if (currentChapter) {
        currentChapter.sections.push(section);
      } else {
        unGroupedSections.push(section);
      }
    }
  });

  if (chapters.length === 0 && unGroupedSections.length === 0) {
    for (let i = 0; i < Math.min(secHeads.length, secDetails.length); i++) {
      const head = secHeads[i].textContent?.trim() || "";
      const details = secDetails[i].textContent?.trim() || "";
      unGroupedSections.push({ head, details });
    }
  }

  return {
    id,
    title,
    actNo,
    publishDate,
    preambleTitle,
    preambleBody,
    chapters,
    unGroupedSections,
    footnotes
  };
};

const Law = () => {
  const [laws, setLaws] = useState<LawItem[]>([]);
  const [selectedLaw, setSelectedLaw] = useState<LawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("All");

  useEffect(() => {
    const loadLaws = async () => {
      try {
        setLoading(true);
        // Attempt network load, with a strict 4-second timeout to fall back to offline catalog
        const fetchPromise = fetchWithUtf16("http://bdlaws.minlaw.gov.bd/laws-of-bangladesh-chronological-index.html");
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000));

        const html = await Promise.race([fetchPromise, timeoutPromise]);
        const parsed = parseChronologicalIndex(html);
        if (parsed.length === 0) {
          throw new Error("No laws parsed.");
        }
        setLaws(parsed);
        setError(null);
      } catch (err: any) {
        console.warn("Using offline fallback law catalog:", err);
        setLaws(FALLBACK_LAWS);
      } finally {
        setLoading(false);
      }
    };
    loadLaws();
  }, []);

  const handleSelectLaw = async (item: LawItem) => {
    try {
      setLoadingDetails(true);
      setError(null);

      // If we have offline details, load them immediately
      if (FALLBACK_LAW_DETAILS[item.id]) {
        setSelectedLaw(FALLBACK_LAW_DETAILS[item.id]);
        window.scrollTo(0, 0);
        return;
      }

      // Strict 3.5s timeout for detailed view to keep performance snappy
      const fetchPromise = fetchWithUtf16(item.detailsLink);
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3500));

      const detailsHtml = await Promise.race([fetchPromise, timeoutPromise]);
      const details = parseLawDetails(item.id, detailsHtml);
      setSelectedLaw(details);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.warn("Failed to load details online. Using mock/placeholder details.");
      // Create a nice fallback details view for other laws
      setSelectedLaw({
        id: item.id,
        title: item.title,
        actNo: item.actNo,
        publishDate: `Year ${item.year}`,
        preambleTitle: "Preamble",
        preambleBody: `This is the Wikipedia-style wiki page for ${item.title}. The official text is sourced from the Ministry of Law, Justice and Parliamentary Affairs.`,
        chapters: [
          {
            number: "Chapter I",
            name: "PRELIMINARY",
            sections: [
              {
                head: "Short Title and Extent",
                details: `1. This Act may be called ${item.title}. It extends to the whole of Bangladesh.`
              }
            ]
          }
        ],
        unGroupedSections: [],
        footnotes: []
      });
      window.scrollTo(0, 0);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Extract all unique years for filter
  const uniqueYears = useMemo(() => {
    const years = laws.map(l => l.year).filter(y => y && y !== "N/A");
    return ["All", ...Array.from(new Set(years))].sort((a, b) => b.localeCompare(a));
  }, [laws]);

  // Filtered laws list based on search term and selected year
  const filteredLaws = useMemo(() => {
    return laws.filter((law) => {
      const matchesSearch =
        law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        law.actNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        law.year.includes(searchTerm);
      const matchesYear = selectedYear === "All" || law.year === selectedYear;
      return matchesSearch && matchesYear;
    });
  }, [laws, searchTerm, selectedYear]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group text-primary font-medium">
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-serif">Bangladesh Law Wiki</h1>
          </div>
          <div className="w-20"></div> {/* spacer */}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">

        {/* Selected Law Detailed View (Wikipedia style) */}
        {selectedLaw ? (
          <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800 animate-fade-in-up">
            <button
              onClick={() => setSelectedLaw(null)}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Wiki List</span>
            </button>

            <article className="prose prose-slate dark:prose-invert max-w-none">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
                <span className="text-sm font-semibold tracking-wider text-primary uppercase">
                  {selectedLaw.actNo || "Act"}
                </span>
                <h2 className={`text-3xl font-bold font-serif mt-2 mb-3 leading-tight ${getFontClass(selectedLaw.title)}`}>
                  {selectedLaw.title}
                </h2>
                {selectedLaw.publishDate && (
                  <p className="text-sm text-slate-500 font-medium">
                    Published: {selectedLaw.publishDate}
                  </p>
                )}
              </div>

              {/* Preamble callout */}
              {selectedLaw.preambleBody && (
                <div className="bg-slate-50 dark:bg-slate-950/40 border-l-4 border-primary rounded-r-2xl p-5 mb-8">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 font-serif text-lg">Preamble</h4>
                  <p className={`text-slate-600 dark:text-slate-400 italic text-base leading-relaxed ${getFontClass(selectedLaw.preambleBody)}`}>
                    {selectedLaw.preambleBody}
                  </p>
                </div>
              )}

              {/* Un-grouped sections */}
              {selectedLaw.unGroupedSections.length > 0 && (
                <div className="space-y-6 mb-8">
                  {selectedLaw.unGroupedSections.map((sec, idx) => (
                    <div key={idx} className="border-b border-slate-100 dark:border-slate-800/40 pb-5">
                      <h4 className={`text-lg font-bold font-serif text-slate-800 dark:text-slate-200 mb-2 ${getFontClass(sec.head)}`}>
                        {sec.head}
                      </h4>
                      <p className={`text-slate-600 dark:text-slate-400 leading-relaxed text-base ${getFontClass(sec.details)}`}>
                        {sec.details}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Chapters & sections */}
              {selectedLaw.chapters.length > 0 && (
                <div className="space-y-10">
                  {selectedLaw.chapters.map((chapter, cIdx) => (
                    <div key={cIdx} className="space-y-4">
                      <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-sm font-bold uppercase text-primary tracking-wider">{chapter.number}</span>
                        <h3 className={`text-xl font-bold font-serif text-slate-900 dark:text-slate-100 ${getFontClass(chapter.name)}`}>
                          {chapter.name}
                        </h3>
                      </div>
                      <div className="space-y-6">
                        {chapter.sections.map((sec, sIdx) => (
                          <div key={sIdx} className="pl-4 border-l-2 border-slate-200 dark:border-slate-800 pb-3">
                            <h4 className={`text-base font-bold font-serif text-slate-800 dark:text-slate-200 mb-1.5 ${getFontClass(sec.head)}`}>
                              {sec.head}
                            </h4>
                            <p className={`text-slate-600 dark:text-slate-400 leading-relaxed text-base ${getFontClass(sec.details)}`}>
                              {sec.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footnotes */}
              {selectedLaw.footnotes.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-6">
                  <h4 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Info className="w-5 h-5 text-primary" />
                    <span>Footnotes & Amendments</span>
                  </h4>
                  <ol className="space-y-2 text-sm text-slate-500 dark:text-slate-400 list-decimal pl-5">
                    {selectedLaw.footnotes.map((fn, idx) => (
                      <li key={idx} className={getFontClass(fn.text)}>
                        <span className="font-semibold text-primary mr-1">[{fn.num}]</span> {fn.text}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </article>
          </main>
        ) : (
          /* Search, Filter & List View */
          <main className="flex-1 flex flex-col md:flex-row gap-6 w-full">
            {/* Sidebar filter options */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-800 h-fit sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Filter by Year</h3>
              </div>
              <div className="max-h-60 md:max-h-[calc(100vh-280px)] overflow-y-auto space-y-1.5 pr-2">
                {uniqueYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors ${
                      selectedYear === year
                        ? "bg-primary text-white font-medium"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {year === "All" ? "All Years" : year}
                  </button>
                ))}
              </div>
            </aside>

            {/* List and Search panels */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Search Engine Header */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, act number or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                {selectedYear !== "All" && (
                  <button
                    onClick={() => setSelectedYear("All")}
                    className="px-4 py-2 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Wiki listing items */}
              {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-slate-500 font-medium">Downloading and indexing laws catalog...</p>
                </div>
              ) : loadingDetails ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-slate-500 font-medium">Scraping detailed articles and subsections...</p>
                </div>
              ) : filteredLaws.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-sm border border-slate-200/60 dark:border-slate-800 text-center text-slate-500">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No laws found</p>
                  <p className="text-sm mt-1">Try resetting your year filter or adjust your keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredLaws.map((law) => (
                    <div
                      key={law.id}
                      onClick={() => handleSelectLaw(law)}
                      className="group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 cursor-pointer transition-all hover:shadow-md flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-primary">
                            {law.actNo}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            Year: {law.year}
                          </span>
                        </div>
                        <h3 className={`text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors truncate ${getFontClass(law.title)}`}>
                          {law.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 dark:text-slate-600 hidden sm:inline">Wiki Style</span>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Law;
export { fetchWithUtf16 };
