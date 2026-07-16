import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Search, Loader2, BookOpen, ExternalLink, Moon, Sun, Scale,
  ChevronRight, Bookmark, Filter, Book, Info, Settings, Download,
  Menu, X, Type, FileText, ChevronDown, Archive, CheckCircle, Award
} from "lucide-react";
import { MultiLanguageText, getFontClass } from "@/lib/font-utils";

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

// Curated list of major laws we pre-scraped
const PRE_SCRAPED_IDS = [
  '11', '75', '367', '24', '26', '36', '90', '104', '93', '44', '10', '382', '130'
];

const Law = () => {
  const [laws, setLaws] = useState<LawItem[]>([]);
  const [selectedLaw, setSelectedLaw] = useState<LawDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search, filter, and tabs states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"all" | "bookmarks" | "recent">("all");

  // Reader customizing states
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  // Persistent States
  const [bookmarkedLaws, setBookmarkedLaws] = useState<string[]>([]);
  const [bookmarkedSections, setBookmarkedSections] = useState<{
    id: string;
    lawId: string;
    lawTitle: string;
    head: string;
    details: string;
  }[]>([]);
  const [recentLaws, setRecentLaws] = useState<LawItem[]>([]);

  // Load persistence from LocalStorage
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem("bdlaws_bookmarks");
      if (savedBookmarks) setBookmarkedLaws(JSON.parse(savedBookmarks));

      const savedSecBookmarks = localStorage.getItem("bdlaws_section_bookmarks");
      if (savedSecBookmarks) setBookmarkedSections(JSON.parse(savedSecBookmarks));

      const savedRecent = localStorage.getItem("bdlaws_recent");
      if (savedRecent) setRecentLaws(JSON.parse(savedRecent));
    } catch (e) {
      console.warn("Could not read LocalStorage:", e);
    }
  }, []);

  // Fetch index
  useEffect(() => {
    const loadLaws = async () => {
      try {
        setLoading(true);
        const response = await fetch("/laws/index.json");
        if (!response.ok) {
          throw new Error("Local laws database not found");
        }
        const data = await response.json();
        setLaws(data);
        setError(null);
      } catch (err: any) {
        console.warn("Could not load local law index:", err);
        setError("Unable to load law database. Showing offline catalog instead.");
      } finally {
        setLoading(false);
      }
    };
    loadLaws();
  }, []);

  const saveToRecent = (item: LawItem) => {
    setRecentLaws((prev) => {
      const filtered = prev.filter((x) => x.id !== item.id);
      const updated = [item, ...filtered].slice(0, 8); // Keep 8 recent
      localStorage.setItem("bdlaws_recent", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectLaw = async (item: LawItem) => {
    try {
      setLoadingDetails(true);
      setError(null);

      // Check if details file exists locally
      const response = await fetch(`/laws/${item.id}.json`);
      if (response.ok) {
        const details = await response.json();
        setSelectedLaw(details);
        saveToRecent(item);
        window.scrollTo(0, 0);
        return;
      }

      // If details are not pre-cached, generate an elegant stub/placeholder with link
      setSelectedLaw({
        id: item.id,
        title: item.title,
        actNo: item.actNo,
        publishDate: `Year ${item.year}`,
        preambleTitle: "Preamble Notice",
        preambleBody: `This is a Wikipedia-style catalog entry for ${item.title}. The official text is sourced directly from the Ministry of Law, Justice and Parliamentary Affairs.`,
        chapters: [
          {
            number: "Section 1",
            name: "OFFLINE STUB ENTRY",
            sections: [
              {
                head: "External Resource Redirect",
                details: `The full sections and sub-chapters of ${item.title} (Act No: ${item.actNo}, Year: ${item.year}) are not pre-cached offline inside this repository. You can read, view, or download the authoritative, official version directly on the Ministry's portal.`
              }
            ]
          }
        ],
        unGroupedSections: [],
        footnotes: []
      });
      saveToRecent(item);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error("Failed to load details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleBookmarkedLaw = (lawId: string) => {
    setBookmarkedLaws((prev) => {
      let updated;
      if (prev.includes(lawId)) {
        updated = prev.filter((id) => id !== lawId);
      } else {
        updated = [...prev, lawId];
      }
      localStorage.setItem("bdlaws_bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  const isSectionBookmarked = (secHead: string) => {
    if (!selectedLaw) return false;
    return bookmarkedSections.some(
      (b) => b.lawId === selectedLaw.id && b.head === secHead
    );
  };

  const toggleBookmarkedSection = (sec: LawSection) => {
    if (!selectedLaw) return;
    setBookmarkedSections((prev) => {
      let updated;
      const exists = prev.some(
        (b) => b.lawId === selectedLaw.id && b.head === sec.head
      );

      if (exists) {
        updated = prev.filter(
          (b) => !(b.lawId === selectedLaw.id && b.head === sec.head)
        );
      } else {
        const newBookmark = {
          id: `${selectedLaw.id}-${sec.head}`,
          lawId: selectedLaw.id,
          lawTitle: selectedLaw.title,
          head: sec.head,
          details: sec.details,
        };
        updated = [...prev, newBookmark];
      }
      localStorage.setItem("bdlaws_section_bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  // Extract all unique years for filter dropdown
  const uniqueYears = useMemo(() => {
    const years = laws.map((l) => l.year).filter((y) => y && y !== "N/A");
    return ["All", ...Array.from(new Set(years))].sort((a, b) => b.localeCompare(a));
  }, [laws]);

  // Handle highlighted searches
  const highlightMatches = (text: string, search: string) => {
    if (!search.trim()) return text;
    const cleanSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${cleanSearch})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-100 dark:bg-yellow-950 text-slate-900 dark:text-yellow-100 px-0.5 rounded border border-yellow-200 dark:border-yellow-900/60 font-semibold font-sans">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Filtered laws list
  const filteredLaws = useMemo(() => {
    const currentList = (() => {
      if (activeTab === "bookmarks") {
        return laws.filter((law) => bookmarkedLaws.includes(law.id));
      }
      if (activeTab === "recent") {
        return laws.filter((law) => recentLaws.some((r) => r.id === law.id));
      }
      return laws;
    })();

    return currentList.filter((law) => {
      const matchesSearch =
        law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        law.actNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        law.year.includes(searchTerm);
      const matchesYear = selectedYear === "All" || law.year === selectedYear;
      return matchesSearch && matchesYear;
    });
  }, [laws, searchTerm, selectedYear, activeTab, bookmarkedLaws, recentLaws]);

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowMobileTOC(false);
    }
  };

  // Downloader utilities
  const handleDownloadJSON = () => {
    if (!selectedLaw) return;
    const blob = new Blob([JSON.stringify(selectedLaw, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bdlaw_${selectedLaw.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Dynamic CSS variables for reader sizes
  const sizeClasses = {
    sm: "text-sm md:text-base leading-relaxed",
    base: "text-base md:text-lg leading-relaxed",
    lg: "text-lg md:text-xl leading-loose",
    xl: "text-xl md:text-2xl leading-loose",
  };

  const headerSizeClasses = {
    sm: "text-lg md:text-xl",
    base: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
    xl: "text-3xl md:text-4xl",
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#1a1b1c] text-[#202122] dark:text-[#eaecf0] flex flex-col font-sans selection:bg-[#3498db]/30 transition-colors duration-200">

      {/* Top Wikipedia-style Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#202122] border-b border-[#a2a9b1] dark:border-[#3c3e40] px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 text-primary font-medium hover:underline text-sm mr-2 md:mr-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </Link>
            <div className="h-6 w-[1px] bg-[#a2a9b1] dark:bg-[#3c3e40] hidden sm:block mr-2"></div>

            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <div>
                <h1 className="text-base md:text-lg font-bold font-serif leading-none flex items-center gap-1.5 tracking-tight">
                  WIKIPEDIA <span className="font-sans font-light text-xs text-[#54595d] dark:text-[#a2a9b1]">The Free Legal Wiki</span>
                </h1>
                <p className="text-[10px] text-[#54595d] dark:text-[#a2a9b1] font-sans italic hidden md:block mt-0.5">Bangladesh Laws Chronological Encyclopedia</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Dark Mode toggle & Font adjustments */}
            {selectedLaw && (
              <div className="flex items-center gap-1 bg-[#f8f9fa] dark:bg-[#2a2b2c] p-1 rounded-lg border border-[#c8ccd1] dark:border-[#4c4e50]">
                <button
                  onClick={() => setFontFamily((f) => (f === "serif" ? "sans" : "serif"))}
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-[#1a1b1c] text-[#54595d] dark:text-[#a2a9b1] transition-all"
                  title="Toggle Font Family (Serif / Sans-Serif)"
                >
                  <Type className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setFontSize((s) => (s === "sm" ? "base" : s === "base" ? "lg" : s === "lg" ? "xl" : "sm"))
                  }
                  className="p-1.5 rounded hover:bg-white dark:hover:bg-[#1a1b1c] text-[#54595d] dark:text-[#a2a9b1] font-bold text-xs flex items-center gap-0.5"
                  title="Cycle Text Size"
                >
                  <span>A</span><span className="text-[10px] font-normal">±</span>
                </button>
              </div>
            )}

            {/* Direct catalog selector back button */}
            {selectedLaw && (
              <button
                onClick={() => setSelectedLaw(null)}
                className="px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-sm flex items-center gap-1 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Wiki Catalog</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">

        {/* VIEW 1: SELECTED LAW READING ROOM (WIKIPEDIA STYLE) */}
        {selectedLaw ? (
          <>
            {/* LEFT COLUMN: Table of Contents (Sticky navigation) */}
            <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24 bg-white dark:bg-[#202122] rounded-xl p-4 border border-[#c8ccd1] dark:border-[#3c3e40] max-h-[calc(100vh-140px)] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#a2a9b1] dark:border-[#3c3e40] pb-2 mb-3">
                  <h3 className="font-bold font-serif text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Book className="w-4 h-4 text-amber-600" />
                    <span>Table of Contents</span>
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#2a2b2c] font-sans">
                    {PRE_SCRAPED_IDS.includes(selectedLaw.id) ? "Cached Offline" : "Online Resource"}
                  </span>
                </div>

                <nav className="space-y-4 text-xs font-sans">
                  {/* Preamble quick-link */}
                  {selectedLaw.preambleBody && (
                    <button
                      onClick={() => scrollToElement("law-preamble")}
                      className="w-full text-left font-semibold text-primary hover:underline flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-[#2a2b2c]"
                    >
                      <span>1.</span> Preamble
                    </button>
                  )}

                  {/* Chapters List */}
                  {selectedLaw.chapters.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Chapters</p>
                      <div className="space-y-2 border-l border-slate-100 dark:border-slate-800/60 pl-2">
                        {selectedLaw.chapters.map((ch, idx) => (
                          <div key={idx} className="space-y-1">
                            <button
                              onClick={() => scrollToElement(`chapter-${idx}`)}
                              className="w-full text-left font-medium text-slate-700 dark:text-slate-300 hover:text-primary hover:underline block truncate py-0.5"
                              title={`${ch.number}: ${ch.name}`}
                            >
                              <span className="font-semibold text-primary mr-1">{ch.number}</span>
                              {ch.name}
                            </button>
                            {/* Sections in Chapter */}
                            <div className="pl-3 space-y-0.5 max-h-24 overflow-y-auto scrollbar-thin">
                              {ch.sections.map((sec, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => scrollToElement(`section-${idx}-${sIdx}`)}
                                  className="w-full text-left text-[11px] text-[#54595d] dark:text-[#a2a9b1] hover:text-primary block truncate py-0.5 hover:underline"
                                  title={sec.head}
                                >
                                  {sec.head}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Unclassified Sections */}
                  {selectedLaw.unGroupedSections.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Sections List</p>
                      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {selectedLaw.unGroupedSections.map((sec, idx) => (
                          <button
                            key={idx}
                            onClick={() => scrollToElement(`section-ungrouped-${idx}`)}
                            className="w-full text-left text-slate-700 dark:text-slate-300 hover:text-primary block truncate py-1 border-b border-dashed border-slate-100 dark:border-slate-800/20"
                            title={sec.head}
                          >
                            {sec.head}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footnotes Link */}
                  {selectedLaw.footnotes.length > 0 && (
                    <button
                      onClick={() => scrollToElement("law-footnotes")}
                      className="w-full text-left font-semibold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1.5 py-1 px-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2"
                    >
                      <Info className="w-3 h-3 text-amber-500" />
                      <span>Footnotes ({selectedLaw.footnotes.length})</span>
                    </button>
                  )}
                </nav>
              </div>
            </aside>

            {/* CENTER COLUMN: Reading View & Right-Aligned Wikipedia Infobox */}
            <main className="flex-1 min-w-0 bg-white dark:bg-[#202122] rounded-xl p-5 md:p-8 border border-[#c8ccd1] dark:border-[#3c3e40] shadow-sm flex flex-col md:flex-row gap-6 items-start">

              {/* Actual Legal Document Column */}
              <div className="flex-1 w-full order-2 md:order-1">
                {/* Header Metadata */}
                <div className="border-b border-[#a2a9b1] dark:border-[#3c3e40] pb-4 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs bg-slate-100 dark:bg-[#2a2b2c] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 text-primary font-mono">
                      {selectedLaw.actNo || "CITATION: UNKNOWN"}
                    </span>
                    <button
                      onClick={() => toggleBookmarkedLaw(selectedLaw.id)}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2a2b2c] text-slate-500 hover:text-amber-500 transition-colors"
                      title="Bookmark entire law"
                    >
                      <Bookmark className={`w-5 h-5 ${bookmarkedLaws.includes(selectedLaw.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>
                  </div>

                  <h2 className={`text-2xl md:text-3xl font-bold font-serif leading-tight text-slate-900 dark:text-slate-50 ${getFontClass(selectedLaw.title)}`}>
                    {selectedLaw.title}
                  </h2>

                  <div className="text-xs text-[#54595d] dark:text-[#a2a9b1] mt-2 flex items-center gap-3 flex-wrap">
                    <span>Sourced from: Ministry of Law Portal</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-green-600 dark:text-green-500">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Authoritative Copy
                    </span>
                  </div>
                </div>

                {/* Wikipedia-style Infobox (Rendered stacked for mobile inside read view) */}
                <div className="block md:hidden mb-6">
                  <WikipediaInfobox
                    law={selectedLaw}
                    onDownload={handleDownloadJSON}
                    bookmarked={bookmarkedLaws.includes(selectedLaw.id)}
                    onToggleBookmark={() => toggleBookmarkedLaw(selectedLaw.id)}
                  />
                </div>

                {/* Article Body Container with custom font-sizes */}
                <div className={`prose prose-slate dark:prose-invert max-w-none ${fontFamily === "serif" ? "font-serif" : "font-sans"} ${sizeClasses[fontSize]}`}>

                  {/* Preamble */}
                  {selectedLaw.preambleBody && (
                    <div id="law-preamble" className="bg-[#f8f9fa] dark:bg-[#1a1b1c] border-l-4 border-amber-600 rounded-r-lg p-4 md:p-6 mb-8 mt-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 font-serif m-0">PREAMBLE</h4>
                      </div>
                      <p className={`text-[#202122] dark:text-[#eaecf0] italic m-0 leading-relaxed ${getFontClass(selectedLaw.preambleBody)}`}>
                        {selectedLaw.preambleBody}
                      </p>
                    </div>
                  )}

                  {/* Uncategorized Sections */}
                  {selectedLaw.unGroupedSections.length > 0 && (
                    <div className="space-y-6 md:space-y-8 mb-10">
                      {selectedLaw.unGroupedSections.map((sec, idx) => (
                        <div
                          key={idx}
                          id={`section-ungrouped-${idx}`}
                          className="group relative border-b border-slate-100 dark:border-[#3c3e40]/40 pb-5 hover:bg-slate-50/50 dark:hover:bg-[#2a2b2c]/10 rounded-lg p-2 -mx-2 transition-all"
                        >
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <h4 className={`text-base md:text-lg font-bold font-serif text-slate-800 dark:text-slate-200 m-0 ${getFontClass(sec.head)}`}>
                              {highlightMatches(sec.head, searchTerm)}
                            </h4>
                            <button
                              onClick={() => toggleBookmarkedSection(sec)}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#2a2b2c] text-slate-400 hover:text-amber-500"
                              title="Bookmark this specific section"
                            >
                              <Bookmark className={`w-4 h-4 ${isSectionBookmarked(sec.head) ? "fill-amber-500 text-amber-500 opacity-100" : ""}`} />
                            </button>
                          </div>
                          <p className={`text-slate-600 dark:text-[#eaecf0] m-0 ${getFontClass(sec.details)}`}>
                            {highlightMatches(sec.details, searchTerm)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chapters and interior Sections */}
                  {selectedLaw.chapters.length > 0 && (
                    <div className="space-y-12 mt-6">
                      {selectedLaw.chapters.map((chapter, cIdx) => (
                        <div key={cIdx} id={`chapter-${cIdx}`} className="space-y-4 pt-4 border-t border-slate-100 dark:border-[#3c3e40]/60">
                          <div className="bg-slate-100/60 dark:bg-[#2a2b2c] px-4 py-2.5 rounded-lg border border-slate-200/80 dark:border-[#3c3e40]">
                            <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-500 tracking-wider">
                              {chapter.number}
                            </span>
                            <h3 className={`text-lg md:text-xl font-bold font-serif text-slate-900 dark:text-slate-100 m-0 mt-0.5 ${getFontClass(chapter.name)}`}>
                              {chapter.name}
                            </h3>
                          </div>

                          <div className="space-y-6 pl-1 md:pl-4">
                            {chapter.sections.map((sec, sIdx) => (
                              <div
                                key={sIdx}
                                id={`section-${cIdx}-${sIdx}`}
                                className="group relative pl-4 border-l-2 border-slate-200 dark:border-[#3c3e40] pb-3 hover:bg-slate-50/50 dark:hover:bg-[#2a2b2c]/10 rounded-r-lg p-2 transition-all"
                              >
                                <div className="flex items-center justify-between gap-4 mb-2">
                                  <h4 className={`text-base font-bold font-serif text-slate-800 dark:text-slate-200 m-0 ${getFontClass(sec.head)}`}>
                                    {highlightMatches(sec.head, searchTerm)}
                                  </h4>
                                  <button
                                    onClick={() => toggleBookmarkedSection(sec)}
                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#2a2b2c] text-slate-400 hover:text-amber-500"
                                    title="Bookmark this specific section"
                                  >
                                    <Bookmark className={`w-4 h-4 ${isSectionBookmarked(sec.head) ? "fill-amber-500 text-amber-500 opacity-100" : ""}`} />
                                  </button>
                                </div>
                                <p className={`text-[#202122] dark:text-[#eaecf0] m-0 ${getFontClass(sec.details)}`}>
                                  {highlightMatches(sec.details, searchTerm)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footnotes block */}
                  {selectedLaw.footnotes.length > 0 && (
                    <div id="law-footnotes" className="border-t-2 border-[#a2a9b1] dark:border-[#3c3e40] mt-16 pt-6">
                      <h4 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Info className="w-5 h-5 text-amber-600" />
                        <span>Footnotes & Amendments</span>
                      </h4>
                      <ol className="space-y-3 text-xs md:text-sm text-[#54595d] dark:text-[#a2a9b1] list-decimal pl-5">
                        {selectedLaw.footnotes.map((fn, idx) => (
                          <li key={idx} className={`${getFontClass(fn.text)} pl-2 pb-1 border-b border-dashed border-slate-100 dark:border-[#2a2b2c]`}>
                            <span className="font-semibold text-amber-600 dark:text-amber-500 mr-1.5">[{fn.num}]</span>
                            {fn.text}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                </div>
              </div>

              {/* Wikipedia-style Infobox (Desktop right panel) */}
              <div className="w-full md:w-80 order-1 md:order-2 hidden md:block flex-shrink-0">
                <div className="sticky top-24">
                  <WikipediaInfobox
                    law={selectedLaw}
                    onDownload={handleDownloadJSON}
                    bookmarked={bookmarkedLaws.includes(selectedLaw.id)}
                    onToggleBookmark={() => toggleBookmarkedLaw(selectedLaw.id)}
                  />
                </div>
              </div>

            </main>
          </>
        ) : (

          /* VIEW 2: SEARCH ENGINE & WIKI DIRECTORY HOME */
          <main className="flex-1 flex flex-col md:flex-row gap-6 w-full animate-fade-in">

            {/* LEFT BAR: Navigation controls & Quick lists */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-[#202122] rounded-xl p-4 shadow-sm border border-[#c8ccd1] dark:border-[#3c3e40] h-fit">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-primary" />
                    <span>View Portal</span>
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setActiveTab("all"); setSearchTerm(""); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeTab === "all"
                          ? "bg-primary text-white"
                          : "hover:bg-slate-100 dark:hover:bg-[#2a2b2c] text-[#54595d] dark:text-[#a2a9b1]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> All Chronicles</span>
                      <span className="text-[10px] bg-slate-200/50 dark:bg-[#1a1b1c]/60 px-1.5 py-0.25 rounded">
                        {laws.length || 1670}
                      </span>
                    </button>

                    <button
                      onClick={() => { setActiveTab("bookmarks"); setSearchTerm(""); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeTab === "bookmarks"
                          ? "bg-primary text-white"
                          : "hover:bg-slate-100 dark:hover:bg-[#2a2b2c] text-[#54595d] dark:text-[#a2a9b1]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5"><Bookmark className="w-3.5 h-3.5" /> Bookmarked Laws</span>
                      <span className="text-[10px] bg-slate-200/50 dark:bg-[#1a1b1c]/60 px-1.5 py-0.25 rounded">
                        {bookmarkedLaws.length}
                      </span>
                    </button>

                    <button
                      onClick={() => { setActiveTab("recent"); setSearchTerm(""); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-between transition-colors ${
                        activeTab === "recent"
                          ? "bg-primary text-white"
                          : "hover:bg-slate-100 dark:hover:bg-[#2a2b2c] text-[#54595d] dark:text-[#a2a9b1]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5"><Archive className="w-3.5 h-3.5" /> Recent History</span>
                      <span className="text-[10px] bg-slate-200/50 dark:bg-[#1a1b1c]/60 px-1.5 py-0.25 rounded">
                        {recentLaws.length}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#a2a9b1]/30 dark:border-[#3c3e40]/30 pt-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Chronological Index</h3>
                  <div className="relative mb-2">
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 dark:bg-[#1a1b1c] border border-[#c8ccd1] dark:border-[#4c4e50] rounded-md focus:outline-none"
                    >
                      <option value="All">All Years</option>
                      {uniqueYears.filter((y) => y !== "All").map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Scraped Offline Info Panel */}
                <div className="bg-[#f8f9fa] dark:bg-[#1a1b1c] border-l-2 border-green-500 rounded p-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-green-700 dark:text-green-500 font-bold mb-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Wiki Status Offline</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 m-0 leading-relaxed">
                    All 1,670+ laws from index are searchable. Core acts (Penal Code, CrPC, etc.) are pre-scraped with full text for direct offline study.
                  </p>
                </div>
              </div>
            </aside>

            {/* RIGHT MAIN PANEL: Wiki Search & Results */}
            <div className="flex-1 flex flex-col gap-6">

              {/* Massive Wikipedia Hero Welcome Box */}
              <div className="bg-white dark:bg-[#202122] rounded-xl p-6 shadow-sm border border-[#c8ccd1] dark:border-[#3c3e40]">
                <div className="max-w-2xl">
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span>Welcome to Bangladesh Law Wiki</span>
                  </h2>
                  <p className="text-xs md:text-sm text-[#54595d] dark:text-[#a2a9b1] leading-relaxed mt-2">
                    A beautiful, premium, Wikipedia-inspired reading terminal mapping all chronological legislative records of Bangladesh from 1799 to present day. Type keywords to index statutes, find penal elements, or research codifications.
                  </p>
                </div>

                {/* Big Search Input */}
                <div className="relative mt-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, act number, year or citation (e.g. Penal Code)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#1a1b1c] border border-[#c8ccd1] dark:border-[#4c4e50] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm shadow-inner"
                  />
                </div>
              </div>

              {/* Bookmarked individual sections grid if any exist */}
              {activeTab === "all" && bookmarkedSections.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 px-1">
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Bookmarked Subsections & Elements</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookmarkedSections.map((sec) => (
                      <div
                        key={sec.id}
                        className="bg-white dark:bg-[#202122] rounded-lg p-4 border border-[#c8ccd1] dark:border-[#3c3e40] shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                              {sec.lawTitle.split(",")[0]}
                            </span>
                            <button
                              onClick={() => toggleBookmarkedSection({ head: sec.head, details: sec.details })}
                              className="text-amber-500 hover:text-slate-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4 className="text-xs font-bold font-serif text-slate-800 dark:text-slate-200 mb-1">
                            {sec.head}
                          </h4>
                          <p className="text-[11px] text-[#54595d] dark:text-[#a2a9b1] line-clamp-3 leading-relaxed">
                            {sec.details}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const foundLaw = laws.find(l => l.id === sec.lawId);
                            if (foundLaw) handleSelectLaw(foundLaw);
                          }}
                          className="mt-3 text-left text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          Read full article <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wiki listing items list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-serif font-bold text-sm text-slate-700 dark:text-slate-300">
                    {activeTab === "bookmarks" ? "Saved Enactments" : activeTab === "recent" ? "Recently Read" : "Statutory Directory"}
                  </h3>
                  <span className="text-xs text-[#54595d] dark:text-[#a2a9b1]">
                    Found: <strong className="text-slate-800 dark:text-white font-mono">{filteredLaws.length}</strong> entries
                  </span>
                </div>

                {loading ? (
                  <div className="bg-white dark:bg-[#202122] rounded-xl p-12 border border-[#c8ccd1] dark:border-[#3c3e40] flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-slate-500 font-medium">Decompressing and building legislative index...</p>
                  </div>
                ) : filteredLaws.length === 0 ? (
                  <div className="bg-white dark:bg-[#202122] rounded-xl p-12 border border-[#c8ccd1] dark:border-[#3c3e40] text-center text-slate-500">
                    <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="font-bold text-lg text-slate-700 dark:text-slate-300">No laws indexed matching filters</p>
                    <p className="text-xs mt-1">Try resetting the chronological year filter or adjust search queries.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredLaws.map((law) => {
                      const isPreScraped = PRE_SCRAPED_IDS.includes(law.id);
                      return (
                        <div
                          key={law.id}
                          onClick={() => handleSelectLaw(law)}
                          className="group bg-white dark:bg-[#202122] rounded-xl p-4 border border-[#c8ccd1] dark:border-[#3c3e40] hover:border-amber-600 dark:hover:border-amber-500 cursor-pointer transition-all hover:shadow-md flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="px-1.5 py-0.25 rounded bg-slate-100 dark:bg-[#2a2b2c] text-[10px] font-mono text-primary font-semibold border border-slate-200 dark:border-slate-800">
                                {law.actNo !== "N/A" ? law.actNo : `Act of ${law.year}`}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                Year: {law.year}
                              </span>
                              {isPreScraped && (
                                <span className="text-[9px] bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-500 px-1.5 py-0.25 rounded font-bold border border-green-200/50 dark:border-green-900/40">
                                  Cached Offline
                                </span>
                              )}
                            </div>
                            <h3 className={`text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors truncate ${getFontClass(law.title)}`}>
                              {law.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[10px] text-slate-400 dark:text-slate-600 hidden sm:inline font-mono">
                              {isPreScraped ? "FULL TEXT" : "STUB"}
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </main>
        )}
      </div>

      {/* FLOATING ACTION PANEL: TOC DRAWER BUTTON FOR MOBILE DEVICES */}
      {selectedLaw && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowMobileTOC((v) => !v)}
            className="p-3.5 bg-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-700 transition-colors"
          >
            {showMobileTOC ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* MOBILE TOC OVERLAY */}
      {selectedLaw && showMobileTOC && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in flex items-end justify-center">
          <div className="bg-white dark:bg-[#202122] w-full max-h-[80vh] rounded-t-2xl p-5 overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#a2a9b1] dark:border-[#3c3e40] pb-3 mb-4">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>Table of Contents</span>
              </h3>
              <button onClick={() => setShowMobileTOC(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-4 text-xs font-sans pb-8">
              {/* Preamble quick-link */}
              {selectedLaw.preambleBody && (
                <button
                  onClick={() => scrollToElement("law-preamble")}
                  className="w-full text-left font-semibold text-primary hover:underline flex items-center gap-1.5 py-2 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-[#2a2b2c]"
                >
                  <span>1.</span> Preamble
                </button>
              )}

              {/* Chapters */}
              {selectedLaw.chapters.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Chapters</p>
                  <div className="space-y-3 border-l border-slate-100 dark:border-slate-800 pl-2">
                    {selectedLaw.chapters.map((ch, idx) => (
                      <div key={idx} className="space-y-1">
                        <button
                          onClick={() => scrollToElement(`chapter-${idx}`)}
                          className="w-full text-left font-semibold text-slate-800 dark:text-slate-200 hover:text-primary block py-0.5"
                        >
                          <span className="font-bold text-amber-600 mr-1">{ch.number}</span>
                          {ch.name}
                        </button>
                        {/* Sections */}
                        <div className="pl-3 space-y-1.5">
                          {ch.sections.map((sec, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => scrollToElement(`section-${idx}-${sIdx}`)}
                              className="w-full text-left text-[11px] text-slate-600 dark:text-slate-400 block py-1 hover:underline active:text-primary"
                            >
                              {sec.head}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unclassified Sections */}
              {selectedLaw.unGroupedSections.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Sections List</p>
                  <div className="space-y-1 pl-2">
                    {selectedLaw.unGroupedSections.map((sec, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToElement(`section-ungrouped-${idx}`)}
                        className="w-full text-left text-slate-700 dark:text-slate-300 hover:text-primary block py-2 border-b border-dashed border-slate-100 dark:border-slate-800/40"
                      >
                        {sec.head}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footnotes Link */}
              {selectedLaw.footnotes.length > 0 && (
                <button
                  onClick={() => scrollToElement("law-footnotes")}
                  className="w-full text-left font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 py-2 px-1.5 border-t border-slate-100 dark:border-slate-800 pt-2"
                >
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  <span>Footnotes ({selectedLaw.footnotes.length})</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Wikipedia-style Footer */}
      <footer className="bg-white dark:bg-[#1a1b1c] border-t border-[#a2a9b1] dark:border-[#3c3e40] py-8 px-6 text-center text-xs text-[#54595d] dark:text-[#a2a9b1] mt-auto">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Scale className="w-5 h-5 text-[#a2a9b1]" />
            <span className="font-serif font-bold text-sm tracking-widest text-slate-400 uppercase">Bangladesh Legal Wiki Project</span>
          </div>
          <p className="max-w-xl mx-auto leading-relaxed">
            Content is sourced dynamically from the public domain laws repository hosted by the Ministry of Law, Justice and Parliamentary Affairs, Bangladesh. This site is a high-speed, local-first search portal intended purely for legal research and educational purposes.
          </p>
          <div className="text-[11px] text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} • Wikipedia-Style Legal Encyclopedia
          </div>
        </div>
      </footer>
    </div>
  );
};

// COMPONENT: Wikipedia Infobox
interface WikipediaInfoboxProps {
  law: LawDetails;
  onDownload: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

const WikipediaInfobox: React.FC<WikipediaInfoboxProps> = ({ law, onDownload, bookmarked, onToggleBookmark }) => {
  return (
    <div className="bg-[#f8f9fa] dark:bg-[#1e1f20] border border-[#a2a9b1] dark:border-[#4c4e50] rounded-lg overflow-hidden text-xs shadow-sm font-sans">

      {/* Title Header */}
      <div className="bg-slate-200/80 dark:bg-[#2d2e30] px-3 py-2.5 text-center font-bold text-slate-800 dark:text-slate-100 font-serif border-b border-[#a2a9b1] dark:border-[#4c4e50] tracking-wide text-[13px]">
        {law.title.split(",")[0]}
      </div>

      {/* Decorative Wiki Image / Crest Placeholder */}
      <div className="py-4 bg-white dark:bg-[#151617] flex flex-col items-center justify-center border-b border-[#a2a9b1]/60 dark:border-[#4c4e50]/60">
        <div className="w-12 h-12 rounded-full border-2 border-amber-600 dark:border-amber-500 flex items-center justify-center bg-amber-50 dark:bg-amber-950/20 shadow-inner">
          <Scale className="w-6 h-6 text-amber-600 dark:text-amber-500" />
        </div>
        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-2.5">
          Act of Parliament
        </p>
      </div>

      {/* Metadata Table */}
      <div className="divide-y divide-[#a2a9b1]/40 dark:divide-[#4c4e50]/40">
        <div className="grid grid-cols-5 p-2">
          <span className="col-span-2 font-bold text-slate-500 dark:text-[#a2a9b1]">Jurisdiction</span>
          <span className="col-span-3 text-right font-medium">Bangladesh</span>
        </div>
        <div className="grid grid-cols-5 p-2">
          <span className="col-span-2 font-bold text-slate-500 dark:text-[#a2a9b1]">Enacted by</span>
          <span className="col-span-3 text-right leading-tight">Parliament of Bangladesh</span>
        </div>
        <div className="grid grid-cols-5 p-2">
          <span className="col-span-2 font-bold text-slate-500 dark:text-[#a2a9b1]">Citation</span>
          <span className="col-span-3 text-right font-mono truncate" title={law.actNo}>{law.actNo || "N/A"}</span>
        </div>
        {law.publishDate && (
          <div className="grid grid-cols-5 p-2">
            <span className="col-span-2 font-bold text-slate-500 dark:text-[#a2a9b1]">Enacted date</span>
            <span className="col-span-3 text-right leading-tight">{law.publishDate}</span>
          </div>
        )}
        <div className="grid grid-cols-5 p-2">
          <span className="col-span-2 font-bold text-slate-500 dark:text-[#a2a9b1]">Status</span>
          <span className="col-span-3 text-right">
            <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold text-[10px]">
              Active (In Force)
            </span>
          </span>
        </div>
        <div className="grid grid-cols-5 p-2">
          <span className="col-span-2 font-bold text-slate-500 dark:text-[#a2a9b1]">Languages</span>
          <span className="col-span-3 text-right font-medium">English / Bangla</span>
        </div>
      </div>

      {/* External Action Panel */}
      <div className="p-3 bg-slate-100/80 dark:bg-[#2d2e30] border-t border-[#a2a9b1] dark:border-[#4c4e50] space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Wiki Integrations
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onDownload}
            className="w-full py-1 px-2 bg-white dark:bg-[#1a1b1c] hover:bg-slate-50 dark:hover:bg-[#232425] border border-[#a2a9b1] dark:border-[#4c4e50] rounded font-semibold flex items-center justify-center gap-1 text-[11px] transition-all"
            title="Export as JSON Schema"
          >
            <Download className="w-3 h-3 text-amber-600" />
            <span>JSON</span>
          </button>

          <a
            href={`/laws/${law.id}.md`}
            download={`bdlaw_${law.id}.md`}
            className="w-full py-1 px-2 bg-white dark:bg-[#1a1b1c] hover:bg-slate-50 dark:hover:bg-[#232425] border border-[#a2a9b1] dark:border-[#4c4e50] rounded font-semibold flex items-center justify-center gap-1 text-[11px] text-[#202122] dark:text-white transition-all"
            title="Download formatted Markdown text"
          >
            <FileText className="w-3 h-3 text-blue-500" />
            <span>Markdown</span>
          </a>
        </div>

        <a
          href={`http://bdlaws.minlaw.gov.bd/act-details-${law.id}.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-1.5 bg-primary hover:bg-primary/90 text-white rounded font-bold flex items-center justify-center gap-1 text-[10px] shadow-sm transition-colors mt-2"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Official Portal Direct</span>
        </a>
      </div>
    </div>
  );
};

// Exposing parsers for unit tests and direct integrations
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

  const parentContainer = doc.querySelector(".lineremoves")?.parentElement || doc.body;
  const children = Array.from(parentContainer.children);

  children.forEach(child => {
    const isChapter = child.querySelector(".act-chapter-group") || child.classList.contains("act-chapter-group");
    if (isChapter) {
      const chapterNoEl = child.querySelector(".act-chapter-no");
      const chapterNameEl = child.querySelector(".act-chapter-name");
      const numStr = chapterNoEl ? chapterNoEl.textContent?.trim() || "" : "";
      const nameStr = chapterNameEl ? chapterNameEl.textContent?.trim() || "" : "";

      chapters.push({
        number: numStr,
        name: nameStr,
        sections: []
      });
      return;
    }

    const txtHead = child.querySelector(".txt-head");
    const txtDetails = child.querySelector(".txt-details");
    if (txtHead && txtDetails) {
      const head = txtHead.textContent?.trim() || "";
      const details = txtDetails.textContent?.trim() || "";
      const section: LawSection = { head, details };

      if (chapters.length > 0) {
        chapters[chapters.length - 1].sections.push(section);
      } else {
        unGroupedSections.push(section);
      }
    }
  });

  if (chapters.length === 0 && unGroupedSections.length === 0) {
    const secHeads = doc.querySelectorAll(".col-sm-3.txt-head, td.txt-head");
    const secDetails = doc.querySelectorAll(".col-sm-9.txt-details, td.txt-details");
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

export default Law;
