import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Search, Loader2, BookOpen, ExternalLink, Moon, Sun, Newspaper,
  ChevronRight, Bookmark, Filter, Book, Info, Download, Trash2, Play, Square,
  CheckCircle, AlertCircle, FileText, ChevronDown, ChevronUp, Copy, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export interface ArticleData {
  title: string;
  author: string;
  date: string;
  url: string;
  text: string;
  source: string;
  timestamp: string;
}

export interface CrawlLog {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: string;
}

// Reference Python code strings matching the KSMubasshir/bd-newspaper-crawlers repository
const PYTHON_TEMPLATES: Record<string, string> = {
  prothomalo_bn: `import os
import json
import time
from datetime import date, timedelta
from bs4 import BeautifulSoup
import requests

newspaper_base_url = 'http://www.prothom-alo.com/'
newspaper_archive_base_url = 'http://www.prothom-alo.com/archive/'

start_date = date(2018, 9, 12)
end_date = date.today()
delta = end_date - start_date
output_result = []

for i in range(delta.days + 1):
    date_str = start_date + timedelta(days=i)
    index = 0
    output_dir = './{}/{}/{}/bn'.format(date_str.year, date_str.month, date_str.day)
    try: os.makedirs(output_dir)
    except OSError: pass

    while (True):
        index = index + 1
        url = newspaper_archive_base_url + str(date_str) + '?edition=all&page=' + str(index)
        archive_soup = requests.get(url)
        soup = BeautifulSoup(archive_soup.content, "html.parser")
        all_links = soup.find_all("a", attrs={"class": "link_overlay"})
        if len(all_links) == 0: break

        for link in all_links:
            link_separator = link.get('href').split('/')
            link = link_separator[1] + "/" + link_separator[2] + "/" + link_separator[3]
            output_file_name = 'bn_{}{}.txt'.format(link_separator[2], link_separator[3])
            article_url = newspaper_base_url + link

            article_data = requests.get(article_url).text
            article_soup = BeautifulSoup(article_data, "html.parser")

            try: author = article_soup.find("div", {"class": "author"}).find("span", {"class": "name"}).text
            except: author = ""

            try: date_published = article_soup.find("span", {"itemprop": "datePublished"}).text
            except: date_published = ""

            article_title = article_soup.find("h1", {"class": "title"})
            article_body = article_soup.find("div", {"itemprop": "articleBody"})

            article_title_text = str(article_title.text.strip()) if article_title else ""
            article_body_text = article_body.get_text(separator="\\n\\n") if article_body else ""

            data = "<article>\\n"
            data += "<title>" + article_title_text + "</title>\\n"
            data += "<date>" + date_published + "</date>\\n"
            data += "<author>" + author + "</author>\\n"
            data += "<text>" + article_body_text + "</text>\\n"
            data += "</article>"

            with open(output_dir + '/' + output_file_name, 'w', encoding='utf8') as file:
                file.write(data + '\\n\\n')`,

  daily_star: `import os
import time
from datetime import date
from bs4 import BeautifulSoup
import requests

newspaper_base_url = 'https://www.thedailystar.net/bangla/'

for index in range(1051):
    url = newspaper_base_url + "শীর্ষ-খবর" + "?page=" + str(index)
    archive_soup = requests.get(url)
    soup = BeautifulSoup(archive_soup.content, "html.parser")
    all_links = soup.find_all("a")

    for link in all_links:
        link_separator = link.get('href')
        try: link_tokens = link_separator.split("/")
        except: continue

        if len(link_tokens) == 4 and link_tokens[1] == "bangla":
            article_url = newspaper_base_url + link_separator[8:]
        else: continue

        article_data = requests.get(article_url).text
        article_soup = BeautifulSoup(article_data, "html.parser")

        try: title = article_soup.find("title").get_text().split("|")[0].strip()
        except: title = ""

        try: author = article_soup.find("div", {"class": "author-name margin-bottom-big"}).get_text().strip()
        except: author = ""

        try: date = article_soup.find("div", {"class": "small-text"}).get_text().split("/")[0].strip()
        except: date = "০১/০১/২০০০"

        try: article_content = article_soup.find("div", {"class": "field-body view-mode-teaser"}).get_text().strip()
        except: article_content = ""

        data = "<article>\\n"
        data += "<title>" + title + "</title>\\n"
        data += "<author>" + author + "</author>\\n"
        data += "<date>" + date + "</date>\\n"
        data += "<text>\\n" + article_content + "\\n</text>\\n"
        data += "</article>"`,

  bdpratidin: `import os
from bs4 import BeautifulSoup
import requests

newspaper_base_url = 'https://www.bd-pratidin.com/'

for i in range(100):
    index = i * 12
    url = newspaper_base_url + "national/" + str(index)
    archive_soup = requests.get(url)
    soup = BeautifulSoup(archive_soup.content, "html.parser")
    all_links = soup.find_all("a")

    for link in all_links:
        link_separator = link.get('href')
        link_tokens = link_separator.split("/")
        if len(link_tokens) == 5:
            link = "https://www.bd-pratidin.com/" + link_separator
        else: continue

        article_url = link
        article_data = requests.get(article_url).text
        article_soup = BeautifulSoup(article_data, "html.parser")

        paragraphs = article_soup.find_all("p")
        title = article_soup.find("h1").get_text()

        article_content = ""
        for paragraph in paragraphs:
            article_content += paragraph.get_text() + "\\n"

        data = "<article>\\n"
        data += "<title>" + title + "</title>\\n"
        data += "<text>" + article_content + "</text>\\n"
        data += "</article>"`,

  jugantor: `import os
from bs4 import BeautifulSoup
import requests

newspaper_base_url = 'https://www.jugantor.com/'
newspaper_archive_base_url = 'https://www.jugantor.com/archive/'

start_date = date(2017, 12, 18)
delta = date.today() - start_date

for i in range(delta.days + 1):
    date_str = start_date + timedelta(days=i)
    url = newspaper_archive_base_url + str(date_str.year) + "/" + str(date_str.month) + "/" + str(date_str.day)
    archive_soup = requests.get(url)
    soup = BeautifulSoup(archive_soup.content, "html.parser")
    all_links = soup.find_all("a")

    for link in all_links:
        article_url = link.get('href')
        link_separator = article_url.split('/')
        if len(link_separator) != 6 or link_separator[2] != "www.jugantor.com":
            continue

        article_data = requests.get(article_url).text
        article_soup = BeautifulSoup(article_data, "html.parser")
        paragraphs = article_soup.find_all("p")

        article_content = ""
        for paragraph in paragraphs:
            article_content += paragraph.get_text() + "\\n"

        data = "<article>\\n"
        data += "<title>" + link_separator[5].replace("-", " ") + "</title>\\n"
        data += "<text>\\n" + article_content + "</text>\\n"
        data += "</article>"`,

  samakal: `import os
from bs4 import BeautifulSoup
import requests

newspaper_archive_base_url = 'https://samakal.com/archive/'

for index in range(15):
    url = newspaper_archive_base_url + '?date=2024-01-01&page=' + str(index)
    archive_soup = requests.get(url)
    soup = BeautifulSoup(archive_soup.content, "html.parser")
    all_links = soup.find_all("a", attrs={"class": "link-overlay"})

    for link in all_links:
        article_url = link.get('href')
        article_data = requests.get(article_url).text
        article_soup = BeautifulSoup(article_data, "html.parser")
        paragraphs = article_soup.find_all("p")

        article_content = ""
        for paragraph in paragraphs:
            article_content += paragraph.get_text() + "\\n"

        data = "<article>\\n"
        data += "<title>" + article_url.split('/')[-1].replace("-", " ") + "</title>\\n"
        data += "<text>\\n" + article_content + "</text>\\n"
        data += "</article>"`
};

interface NewspaperConfig {
  id: string;
  name: string;
  baseUrl: string;
  latestPath: string;
  pythonKey: string;
  linkPatterns: string[];
}

const NEWSPAPERS: NewspaperConfig[] = [
  {
    id: "prothomalo",
    name: "Prothom Alo (প্রথম আলো)",
    baseUrl: "https://www.prothomalo.com",
    latestPath: "/collection/latest",
    pythonKey: "prothomalo_bn",
    linkPatterns: ["/bangladesh/", "/international/", "/sports/", "/entertainment/", "/business/", "/opinion/", "/lifestyle/"]
  },
  {
    id: "dailystar",
    name: "The Daily Star Bangla (ডেইলি স্টার)",
    baseUrl: "https://bangla.thedailystar.net",
    latestPath: "/শীর্ষ-খবর",
    pythonKey: "daily_star",
    linkPatterns: ["/news/", "/bangladesh/", "/opinion/", "/sports/", "/entertainment/"]
  },
  {
    id: "bdpratidin",
    name: "Bangladesh Pratidin (বাংলাদেশ প্রতিদিন)",
    baseUrl: "https://www.bd-pratidin.com",
    latestPath: "/national",
    pythonKey: "bdpratidin",
    linkPatterns: ["/national/", "/city-news/", "/country/", "/international-news/", "/entertainment/", "/sports/"]
  },
  {
    id: "jugantor",
    name: "Jugantor (যুগান্তর)",
    baseUrl: "https://www.jugantor.com",
    latestPath: "/national",
    pythonKey: "jugantor",
    linkPatterns: ["/national/", "/international/", "/sports/", "/entertainment/", "/country/"]
  },
  {
    id: "samakal",
    name: "Samakal (সমকাল)",
    baseUrl: "https://samakal.com",
    latestPath: "/bangladesh",
    pythonKey: "samakal",
    linkPatterns: ["/bangladesh/", "/international/", "/sports/", "/entertainment/", "/national/"]
  },
  {
    id: "ittefaq",
    name: "Daily Ittefaq (ইত্তেফাক)",
    baseUrl: "https://www.ittefaq.com.bd",
    latestPath: "/national",
    pythonKey: "samakal", // Samakal shares highly similar structures
    linkPatterns: ["/national/", "/international/", "/sports/", "/entertainment/"]
  },
  {
    id: "kalerkantho",
    name: "Kalerkantho (কালের কণ্ঠ)",
    baseUrl: "https://www.kalerkantho.com",
    latestPath: "/online/national",
    pythonKey: "bdpratidin",
    linkPatterns: ["/online/national/", "/online/international/", "/online/sports/", "/online/entertainment/"]
  }
];

const PROXIES = [
  { id: "corsproxy.io", name: "CORSProxy.io (Recommended)" },
  { id: "allorigins", name: "AllOrigins Proxy" },
  { id: "everyorigin", name: "EveryOrigin Proxy" },
  { id: "direct", name: "Direct (May cause CORS block)" }
];

const News = () => {
  const [selectedNewspaperId, setSelectedNewspaperId] = useState(NEWSPAPERS[0].id);
  const [proxyType, setProxyType] = useState("corsproxy.io");
  const [crawlMode, setCrawlMode] = useState<"latest" | "custom">("latest");
  const [customUrl, setCustomUrl] = useState("");
  const [scrapeLimit, setScrapeLimit] = useState(5);
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [scrapedArticles, setScrapedArticles] = useState<ArticleData[]>([]);
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [selectedPythonKey, setSelectedPythonKey] = useState(NEWSPAPERS[0].pythonKey);
  const [showCodeView, setShowCodeView] = useState(false);

  const stopScrapingRef = useRef(false);

  const selectedNewspaper = NEWSPAPERS.find(n => n.id === selectedNewspaperId) || NEWSPAPERS[0];

  useEffect(() => {
    setSelectedPythonKey(selectedNewspaper.pythonKey);
    if (crawlMode === "latest") {
      setCustomUrl(selectedNewspaper.baseUrl + selectedNewspaper.latestPath);
    }
  }, [selectedNewspaperId, crawlMode]);

  const addLog = (message: string, type: CrawlLog["type"] = "info") => {
    setLogs(prev => [
      {
        id: Math.random().toString(),
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  const cleanLogs = () => {
    setLogs([]);
    toast.success("Logs cleared");
  };

  const cleanArticles = () => {
    setScrapedArticles([]);
    setExpandedArticles({});
    setProgress(0);
    toast.success("Scraped articles list cleared");
  };

  const handleStop = () => {
    stopScrapingRef.current = true;
    addLog("Cancellation requested. Stopping crawler...", "warning");
  };

  const fetchWithProxy = async (url: string, selectedProxy: string): Promise<string> => {
    let proxyUrl = "";
    if (selectedProxy === "corsproxy.io") {
      proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    } else if (selectedProxy === "allorigins") {
      proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    } else if (selectedProxy === "everyorigin") {
      proxyUrl = `https://every-origin-ecru.vercel.app/api?url=${encodeURIComponent(url)}`;
    } else {
      proxyUrl = url;
    }

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
    }

    if (selectedProxy === "allorigins") {
      const data = await response.json();
      return data.contents;
    }

    return await response.text();
  };

  const startScraping = async () => {
    if (isScraping) return;

    setIsScraping(true);
    stopScrapingRef.current = false;
    setProgress(5);
    setLogs([]);
    setScrapedArticles([]);
    setExpandedArticles({});

    const targetUrl = crawlMode === "latest"
      ? selectedNewspaper.baseUrl + selectedNewspaper.latestPath
      : customUrl;

    addLog(`Initializing crawler on device...`, "info");
    addLog(`Target Feed URL: ${targetUrl}`, "info");
    addLog(`Using Proxy: ${proxyType}`, "info");

    try {
      addLog(`Fetching archive/index page...`, "info");
      let html = "";

      try {
        html = await fetchWithProxy(targetUrl, proxyType);
      } catch (err: any) {
        addLog(`Proxy ${proxyType} failed: ${err.message || err}. Trying fallback AllOrigins proxy...`, "warning");
        html = await fetchWithProxy(targetUrl, "allorigins");
      }

      setProgress(25);
      addLog(`Successfully retrieved index page content! Parsing links...`, "success");

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const anchorElements = doc.querySelectorAll("a");
      const articleLinks: string[] = [];

      anchorElements.forEach(a => {
        let href = a.getAttribute("href") || "";
        if (!href) return;

        // Convert relative links to absolute
        if (href.startsWith("/")) {
          href = selectedNewspaper.baseUrl + href;
        }

        // Validate links
        if (!href.startsWith(selectedNewspaper.baseUrl)) return;
        if (href === selectedNewspaper.baseUrl || href === targetUrl || href.includes("#") || href.includes("?")) return;

        // Check patterns matches
        const matchesPattern = selectedNewspaper.linkPatterns.some(pattern => href.includes(pattern));
        if (matchesPattern && !articleLinks.includes(href)) {
          articleLinks.push(href);
        }
      });

      // Simple fallback if no pattern matched: collect any plausible long links
      if (articleLinks.length === 0) {
        anchorElements.forEach(a => {
          let href = a.getAttribute("href") || "";
          if (href.startsWith("/")) href = selectedNewspaper.baseUrl + href;
          if (href.startsWith(selectedNewspaper.baseUrl) && href.length > selectedNewspaper.baseUrl.length + 15) {
            if (!articleLinks.includes(href) && !href.includes("/category/") && !href.includes("/tags/")) {
              articleLinks.push(href);
            }
          }
        });
      }

      addLog(`Found ${articleLinks.length} article links in index page.`, "info");

      const linksToScrape = articleLinks.slice(0, scrapeLimit);
      if (linksToScrape.length === 0) {
        throw new Error("No valid article links could be extracted from the target page. The page structure might be dynamically rendered or blocked.");
      }

      addLog(`Capping list to maximum limit of ${scrapeLimit} articles.`, "info");

      const tempArticles: ArticleData[] = [];

      for (let i = 0; i < linksToScrape.length; i++) {
        if (stopScrapingRef.current) {
          addLog("Scraping cancelled by user", "warning");
          break;
        }

        const link = linksToScrape[i];
        const stepProgress = Math.floor(25 + ((i + 1) / linksToScrape.length) * 75);
        setProgress(stepProgress);

        addLog(`[${i + 1}/${linksToScrape.length}] Fetching article: ${link}`, "info");

        try {
          const articleHtml = await fetchWithProxy(link, proxyType);
          const articleDoc = parser.parseFromString(articleHtml, "text/html");

          // Smart parser selectors
          const title = articleDoc.querySelector("h1.title, h1.heading, h1 .story-title, h1, .title, .heading")?.textContent?.trim() ||
                        articleDoc.querySelector("title")?.textContent?.split("|")[0].trim() ||
                        "Untitled Article";

          const author = articleDoc.querySelector(".author-name, .story-author, span.name, [itemprop='author'] .name, .author, a[href*='/author/']")?.textContent?.trim() ||
                         "Staff Reporter";

          const date = articleDoc.querySelector("span[itemprop='datePublished'], [itemprop='datePublished'], time, .story-time, .publish-time, .time")?.textContent?.trim() ||
                       new Date().toLocaleDateString("bn-BD");

          // Extract text paragraphs
          const paragraphElements = articleDoc.querySelectorAll("article p, .story-element p, .content_detail p, .article-content p, .story-content p, .entry-content p, .field-body p, p");
          let bodyParagraphs: string[] = [];

          paragraphElements.forEach(p => {
            const pText = p.textContent?.trim() || "";
            // Filter out short layout elements/noise
            if (pText.length > 30 && !bodyParagraphs.includes(pText) && pText.length < 5000) {
              bodyParagraphs.push(pText);
            }
          });

          // Fallback if structured divs didn't match: get generic paragraphs
          if (bodyParagraphs.length === 0) {
            articleDoc.querySelectorAll("p").forEach(p => {
              const pText = p.textContent?.trim() || "";
              if (pText.length > 40) {
                bodyParagraphs.push(pText);
              }
            });
          }

          const fullText = bodyParagraphs.join("\n\n");

          if (!fullText) {
            addLog(`Warning: No content body found in article ${i + 1}`, "warning");
          }

          const article: ArticleData = {
            title,
            author,
            date,
            url: link,
            text: fullText || "Unable to extract article text content completely.",
            source: selectedNewspaper.name,
            timestamp: new Date().toISOString()
          };

          tempArticles.push(article);
          setScrapedArticles([...tempArticles]);
          addLog(`Success! Scraped: "${title}"`, "success");

        } catch (itemErr: any) {
          addLog(`Failed to fetch article ${i + 1}: ${itemErr.message || itemErr}`, "error");
        }

        // Add a gentle sleep to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setProgress(100);
      if (tempArticles.length > 0) {
        addLog(`Scraping complete! ${tempArticles.length} articles extracted successfully.`, "success");
        toast.success(`Scraped ${tempArticles.length} articles!`);
      } else {
        addLog(`Scraping finished but 0 articles were parsed successfully.`, "warning");
      }

    } catch (err: any) {
      addLog(`Fatal Error: ${err.message || err}`, "error");
      toast.error("Scraping failed: " + (err.message || err));
    } finally {
      setIsScraping(false);
    }
  };

  const toggleExpand = (idx: number) => {
    setExpandedArticles(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDownloadJSON = () => {
    if (scrapedArticles.length === 0) {
      toast.error("No articles available to export!");
      return;
    }
    const blob = new Blob([JSON.stringify(scrapedArticles, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crawled_news_${selectedNewspaper.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON data exported!");
  };

  const handleDownloadRawText = () => {
    if (scrapedArticles.length === 0) {
      toast.error("No articles available to export!");
      return;
    }

    // Format output in original bd-newspaper-crawlers XML format
    let dataStr = "";
    scrapedArticles.forEach(art => {
      dataStr += `<article>\n`;
      dataStr += `<title>${art.title}</title>\n`;
      dataStr += `<date>${art.date}</date>\n`;
      dataStr += `<author>${art.author}</author>\n`;
      dataStr += `<url>${art.url}</url>\n`;
      dataStr += `<text>\n${art.text}\n</text>\n`;
      dataStr += `</article>\n\n`;
    });

    const blob = new Blob([dataStr], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crawled_news_${selectedNewspaper.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Formatted txt file exported!");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_TEMPLATES[selectedPythonKey]);
    toast.success("Python code copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#1a1b1c] text-[#202122] dark:text-[#eaecf0] flex flex-col font-sans selection:bg-[#3498db]/30 transition-colors duration-200">

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#202122] border-b border-[#a2a9b1] dark:border-[#3c3e40] px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 text-primary font-medium hover:underline text-sm mr-2 md:mr-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </Link>
            <div className="h-6 w-[1px] bg-[#a2a9b1] dark:bg-[#3c3e40] hidden sm:block mr-2"></div>

            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <div>
                <h1 className="text-base md:text-lg font-bold font-serif leading-none tracking-tight">
                  BD Newspaper Crawler <span className="font-sans font-light text-xs text-[#54595d] dark:text-[#a2a9b1]">Interactive Client-Side Scraper</span>
                </h1>
                <p className="text-[10px] text-[#54595d] dark:text-[#a2a9b1] font-sans italic hidden md:block mt-0.5">
                  User device crawler built with client parsing inspired by KSMubasshir python crawlers
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeView(!showCodeView)}
              className="px-3 py-1.5 text-xs border border-[#c8ccd1] dark:border-[#4c4e50] bg-white dark:bg-[#2a2b2c] hover:bg-slate-50 dark:hover:bg-[#1e1f20] rounded-md font-semibold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showCodeView ? "Hide Python Code" : "Show Python Code"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">

        {/* Python Reference Code Panel */}
        {showCodeView && (
          <div className="bg-white dark:bg-[#202122] rounded-2xl p-5 border border-amber-600/30 dark:border-amber-500/30 shadow-md animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#a2a9b1]/40 dark:border-[#3c3e40]/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm">Reference Crawler Source Code (Python)</h3>
                  <p className="text-[10px] text-slate-400">Exact parsing routine from KSMubasshir/bd-newspaper-crawlers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedPythonKey}
                  onChange={(e) => setSelectedPythonKey(e.target.value)}
                  className="px-2 py-1 bg-slate-50 dark:bg-[#1a1b1c] border border-[#c8ccd1] dark:border-[#4c4e50] rounded text-xs focus:outline-none"
                >
                  <option value="prothomalo_bn">prothomalo_bn.py</option>
                  <option value="daily_star">daily_star.py</option>
                  <option value="bdpratidin">bdpratidin.py</option>
                  <option value="jugantor">jugantor.py</option>
                  <option value="samakal">samakal.py</option>
                </select>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-slate-100 dark:bg-[#2a2b2c] hover:bg-slate-200 rounded text-slate-500 hover:text-primary transition-colors"
                  title="Copy Python Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="text-xs font-mono bg-slate-50 dark:bg-[#151617] p-4 rounded-xl border border-[#c8ccd1]/40 dark:border-slate-800 overflow-x-auto max-h-72 leading-relaxed text-slate-800 dark:text-slate-300">
                <code>{PYTHON_TEMPLATES[selectedPythonKey]}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Configurations & Scraper Controller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Controls Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-[#202122] rounded-2xl p-5 border border-[#c8ccd1] dark:border-[#3c3e40] shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-sm border-b border-[#a2a9b1]/30 dark:border-[#3c3e40]/30 pb-2 text-slate-800 dark:text-slate-200">
              Crawler Control Center
            </h3>

            {/* Choose Newspaper */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-[#a2a9b1]">
                Select Newspaper
              </label>
              <select
                value={selectedNewspaperId}
                onChange={(e) => setSelectedNewspaperId(e.target.value)}
                disabled={isScraping}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1b1c] border border-[#c8ccd1] dark:border-[#4c4e50] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
              >
                {NEWSPAPERS.map(news => (
                  <option key={news.id} value={news.id}>
                    {news.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Crawl Mode Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-[#a2a9b1]">
                Crawl Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCrawlMode("latest")}
                  disabled={isScraping}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    crawlMode === "latest"
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 dark:bg-[#1a1b1c] text-slate-600 dark:text-slate-300 border-[#c8ccd1] dark:border-[#4c4e50] hover:bg-slate-100"
                  }`}
                >
                  Latest Section Feed
                </button>
                <button
                  type="button"
                  onClick={() => setCrawlMode("custom")}
                  disabled={isScraping}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    crawlMode === "custom"
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 dark:bg-[#1a1b1c] text-slate-600 dark:text-slate-300 border-[#c8ccd1] dark:border-[#4c4e50] hover:bg-slate-100"
                  }`}
                >
                  Custom/Archive URL
                </button>
              </div>
            </div>

            {/* Scrape Target Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-[#a2a9b1]">
                {crawlMode === "latest" ? "Scraped Endpoint" : "Custom Scrape URL"}
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                disabled={isScraping || crawlMode === "latest"}
                placeholder="https://example.com/section/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1b1c] border border-[#c8ccd1] dark:border-[#4c4e50] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-70"
              />
            </div>

            {/* Scrape Limit and Proxy choice */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-[#a2a9b1]">
                  Scrape Limit
                </label>
                <select
                  value={scrapeLimit}
                  onChange={(e) => setScrapeLimit(Number(e.target.value))}
                  disabled={isScraping}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#1a1b1c] border border-[#c8ccd1] dark:border-[#4c4e50] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                >
                  <option value={3}>3 Articles</option>
                  <option value={5}>5 Articles</option>
                  <option value={10}>10 Articles</option>
                  <option value={15}>15 Articles</option>
                  <option value={20}>20 Articles</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-[#a2a9b1]">
                  CORS Proxy
                </label>
                <select
                  value={proxyType}
                  onChange={(e) => setProxyType(e.target.value)}
                  disabled={isScraping}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#1a1b1c] border border-[#c8ccd1] dark:border-[#4c4e50] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                >
                  {PROXIES.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Run Buttons */}
            <div className="pt-2 flex gap-2">
              {!isScraping ? (
                <button
                  onClick={startScraping}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Scraper</span>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Cancel Scraping</span>
                </button>
              )}
            </div>

            {/* Scraping Status & Progress */}
            {isScraping && (
              <div className="mt-2 space-y-2 animate-pulse bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-500">
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scraping Active...</span>
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

          </div>

          {/* Console / Crawl Logs */}
          <div className="lg:col-span-2 bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-mono text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-ping"></span>
                <span>Crawler Live Logs console</span>
              </h3>
              <button
                onClick={cleanLogs}
                className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded font-mono"
              >
                Clear Console
              </button>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-2 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600">
                  <span>Console Idle. Select config and launch crawler to see live logs...</span>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex gap-2 items-start leading-relaxed border-b border-slate-800/20 pb-1">
                    <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                    <span className={
                      log.type === "success" ? "text-green-400" :
                      log.type === "warning" ? "text-amber-400 font-bold" :
                      log.type === "error" ? "text-red-400 font-bold" :
                      "text-slate-300"
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Scraped Results Render Room */}
        <div className="bg-white dark:bg-[#202122] rounded-2xl p-5 border border-[#c8ccd1] dark:border-[#3c3e40] shadow-sm mt-2 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#a2a9b1]/30 dark:border-[#3c3e40]/30 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                Scraped Articles Directory ({scrapedArticles.length})
              </h3>
              <p className="text-xs text-slate-400">All successfully crawled articles on your local browser cache memory</p>
            </div>

            {scrapedArticles.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadJSON}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-[#2a2b2c] hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={handleDownloadRawText}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-[#2a2b2c] hover:bg-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-200 font-mono"
                  title="Export raw <article> text files"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Download Raw TXT</span>
                </button>
                <button
                  onClick={cleanArticles}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear List</span>
                </button>
              </div>
            )}
          </div>

          {scrapedArticles.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-[#c8ccd1] dark:border-[#4c4e50] rounded-xl">
              <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="font-bold text-slate-600 dark:text-slate-400">No crawled articles currently loaded</p>
              <p className="text-xs mt-1">Configure parameters and hit 'Start Scraper' above to run the on-device engine.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {scrapedArticles.map((art, idx) => {
                const isExpanded = !!expandedArticles[idx];
                return (
                  <div
                    key={idx}
                    className="border border-[#c8ccd1]/60 dark:border-[#4c4e50]/40 rounded-xl bg-slate-50/50 dark:bg-[#1a1b1c]/40 p-4 hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-[10px] text-amber-700 dark:text-amber-500 font-semibold border border-amber-200/50">
                            {art.source}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Parsed: {new Date(art.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 font-serif leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Author: <strong className="text-slate-600 dark:text-slate-300">{art.author}</strong> • Date published: <strong className="text-slate-600 dark:text-slate-300">{art.date}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => toggleExpand(idx)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 border-t border-[#c8ccd1]/40 dark:border-slate-800/60 pt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans space-y-3 whitespace-pre-line animate-fade-in max-h-96 overflow-y-auto pr-1">
                        {art.text}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                          <a
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 text-primary hover:underline font-mono"
                          >
                            <span>Read original article</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                        {art.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1a1b1c] border-t border-[#a2a9b1] dark:border-[#3c3e40] py-6 px-6 text-center text-xs text-[#54595d] dark:text-[#a2a9b1] mt-auto">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="leading-relaxed">
            All newspaper crawling activities are executed entirely client-side inside your browser sandbox. Please make sure to respect each newspaper's robots.txt directives and terms of services if scraping high quantities of data.
          </p>
          <div className="text-[11px] text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} • BD Newspaper Crawlers Terminal
          </div>
        </div>
      </footer>

    </div>
  );
};

export default News;
