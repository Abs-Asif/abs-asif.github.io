import { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Loader2,
  ExternalLink,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  LayoutGrid,
  List,
  ChevronDown,
  Image as ImageIcon,
  AlertTriangle,
  Globe,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { fetchXmlWithProxy, getProxyUrl, PROXIES, fetchWithProxyFallback } from "@/lib/api-utils";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  source: string;
  sourceId: string;
  image?: string;
  description?: string;
}

interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'sitemap-news' | 'sitemap-daily' | 'sitemap-monthly' | 'sitemap-standard' | 'php-sitemap';
}

const NEWS_SOURCES: NewsSource[] = [
  { id: "desh-bulletin", name: "Desh Bulletin", url: "https://desh-bulletin.com/feed/", type: 'rss' },
  { id: "projonmo24bd", name: "Projonmo 24 BD", url: "https://www.projonmo24bd.com/sitemap/daily-YYYY-MM-DD.xml", type: 'sitemap-daily' },
  { id: "entertvnews", name: "Enter TV News", url: "https://entertvnews.com/sitemap.xml/news", type: 'sitemap-news' },
  { id: "amarsangbad", name: "Amar Sangbad", url: "https://www.amarsangbad.com/sitemaps/news-sitemap.xml", type: 'sitemap-news' },
  { id: "awaazbd", name: "Awaaz BD", url: "https://awaazbd.us/sitemaps/sitemap-YYYY-MM-DD.xml", type: 'sitemap-daily' },
  { id: "awaznewsbd", name: "Awaz News BD", url: "https://awaznewsbd.com/feed", type: 'rss' },
  { id: "banijjoprotidin", name: "Banijjo Protidin", url: "https://banijjoprotidin.com/feed/", type: 'rss' },
  { id: "sarabangla", name: "Sara Bangla", url: "https://sarabangla.net/feed/", type: 'rss' },
  { id: "npbnews", name: "NPB News", url: "https://npbnews.com/sitemap/news-sitemap.xml", type: 'sitemap-news' },
  { id: "sangbadexpress", name: "Sangbad Express", url: "https://sangbadexpress.com/feed/", type: 'rss' },
  { id: "dhakapost", name: "Dhaka Post", url: "https://www.dhakapost.com/sitemaps/news-sitemap.xml", type: 'sitemap-news' },
  { id: "dhakatribune", name: "Dhaka Tribune", url: "https://www.dhakatribune.com/YYYY-MM-01.xml", type: 'sitemap-monthly' },
  { id: "dhakaprotidin", name: "Dhaka Protidin", url: "https://www.dhakaprotidin.com/feed/", type: 'rss' },
  { id: "somoyerkonthosor", name: "Somoyer Konthosor", url: "https://www.somoyerkonthosor.com/feed", type: 'rss' },
  { id: "somoyerkontha", name: "Somoyer Kontha", url: "https://somoyerkontha.com/feed", type: 'rss' },
  { id: "desh-deshantor", name: "Desh Deshantor", url: "https://desh-deshantor.com/feed/", type: 'rss' },
  { id: "jonotatimes", name: "Jonota Times", url: "https://jonotatimes.com/feed/", type: 'rss' },
  { id: "dailysobujbangladesh", name: "Daily Sobuj Bangladesh", url: "https://dailysobujbangladesh.com/feed/", type: 'rss' },
  { id: "alap", name: "Alap News", url: "https://www.alap.news/news-sitemap.xml", type: 'sitemap-news' },
  { id: "nantvbd", name: "NAN TV BD", url: "https://nantvbd.com/feed/", type: 'rss' },
  { id: "shomoyeralo", name: "Shomoyer Alo", url: "https://www.shomoyeralo.com/sitemap.php", type: 'php-sitemap' },
  { id: "deshebideshe", name: "Deshe Bideshe", url: "https://www.deshebideshe.com/post-sitemap.xml", type: 'sitemap-standard' },
  { id: "agamirsomoy", name: "Agamir Somoy", url: "https://www.agamirsomoy.com/sitemap-news.xml", type: 'sitemap-news' },
  { id: "banglanews24", name: "Bangla News 24", url: "https://www.banglanews24.com/daily-sitemap/YYYY-MM-DD/sitemap.xml", type: 'sitemap-daily' },
  { id: "bdnewstrinamool", name: "BD News Trinamool", url: "https://bdnewstrinamool.com/feed/", type: 'rss' },
  { id: "tob", name: "Times of Bangladesh", url: "https://tob.news/feed/", type: 'rss' },
  { id: "morningpost", name: "Morning Post", url: "https://morningpost.com.bd/feed/", type: 'rss' },
  { id: "ajkerjanogan", name: "Ajker Janogan", url: "https://ajkerjanogan.com/feed/", type: 'rss' },
  { id: "risingcumilla", name: "Rising Cumilla", url: "https://risingcumilla.com/feed/", type: 'rss' },
  { id: "thedailycampus", name: "The Daily Campus", url: "https://thedailycampus.com/sitemap/news/YYYY-MM-DD", type: 'sitemap-daily' },
  { id: "campus24", name: "Campus 24", url: "https://campus24.news/feed/", type: 'rss' },
  { id: "rudrabarta", name: "Rudrabarta", url: "https://rudrabarta.net/feed", type: 'rss' },
  { id: "bonikbarta", name: "Bonik Barta", url: "https://bonikbarta.com/sitemaps/sitemap-news-YYYY-MM-DD.xml", type: 'sitemap-daily' },
  { id: "en-bonikbarta", name: "Bonik Barta (EN)", url: "https://en.bonikbarta.com/sitemaps/sitemap-news-YYYY-MM-DD.xml", type: 'sitemap-daily' },
  { id: "bd24report", name: "BD 24 Report", url: "https://bd24report.com/feed/", type: 'rss' },
  { id: "abongtv", name: "Abong TV", url: "https://abong.tv/feed/", type: 'rss' },
  { id: "bd-pratidin", name: "BD Pratidin", url: "https://www.bd-pratidin.com/daily-sitemap/YYYY-MM-DD/sitemap.xml", type: 'sitemap-daily' },
  { id: "swadhindesh", name: "Swadhin Desh", url: "https://www.swadhindesh.com/feed/", type: 'rss' },
  { id: "kolikal", name: "Kolikal", url: "https://kolikal.com/feed/", type: 'rss' },
  { id: "dainikbanglarnabokantha", name: "Dainik Banglar Nabokantha", url: "https://dainikbanglarnabokantha.com/feed/", type: 'rss' },
  { id: "karatoa", name: "Karatoa", url: "https://karatoa.com.bd/sitemap.xml", type: 'sitemap-standard' },
];

const Newsroom = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const [activeProxies, setActiveProxies] = useState<number>(0);

  const initialized = useRef(false);

  const getSourceUrl = (source: NewsSource) => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');

    let url = source.url;
    url = url.replace('YYYY', YYYY.toString());
    url = url.replace('MM', MM);
    url = url.replace('DD', DD);
    return url;
  };

  const universalParser = (xml: Document, source: NewsSource): NewsItem[] => {
    const extracted: NewsItem[] = [];

    if (xml.getElementsByTagName("parsererror").length > 0) return [];

    // RSS 2.0 / 0.9 / 1.0
    const rssItems = xml.getElementsByTagName("item");
    if (rssItems.length > 0) {
        for (let i = 0; i < rssItems.length; i++) {
            const item = rssItems[i];
            const title = item.getElementsByTagName("title")[0]?.textContent || "";
            let link = item.getElementsByTagName("link")[0]?.textContent ||
                       item.getElementsByTagName("guid")[0]?.textContent || "";

            // WordPress & CDATA Link Hack
            if (!link || link.trim().length < 5) {
                const linkTag = item.getElementsByTagName("link")[0];
                if (linkTag) {
                    link = linkTag.textContent || linkTag.innerHTML || "";
                    if (!link.includes("http")) {
                        // Look for text nodes manually
                        for (let j=0; j<linkTag.childNodes.length; j++) {
                            if (linkTag.childNodes[j].nodeType === 3 || linkTag.childNodes[j].nodeType === 4) {
                                link = linkTag.childNodes[j].nodeValue || "";
                                break;
                            }
                        }
                    }
                }
            }

            const pubDateStr = item.getElementsByTagName("pubDate")[0]?.textContent ||
                               item.getElementsByTagName("dc:date")[0]?.textContent ||
                               item.getElementsByTagName("published")[0]?.textContent || "";

            const description = item.getElementsByTagName("description")[0]?.textContent || "";
            const content = item.getElementsByTagName("content:encoded")[0]?.textContent || "";

            let image = "";
            const mediaContent = item.getElementsByTagName("media:content")[0];
            if (mediaContent) image = mediaContent.getAttribute("url") || "";

            if (!image) {
                const enclosure = item.getElementsByTagName("enclosure")[0];
                if (enclosure) image = enclosure.getAttribute("url") || "";
            }

            if (!image) {
                const thumb = item.getElementsByTagName("media:thumbnail")[0];
                if (thumb) image = thumb.getAttribute("url") || "";
            }

            if (!image) {
                const imgMatch = (content || description).match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) image = imgMatch[1];
            }

            if (title || link) {
                extracted.push({
                    id: link || Math.random().toString(36).substring(2, 11),
                    title: title.trim(),
                    link: link.trim(),
                    pubDate: new Date(pubDateStr),
                    source: source.name,
                    sourceId: source.id,
                    image,
                    description: description.replace(/<[^>]*>?/gm, '').substring(0, 150).trim() + "..."
                });
            }
        }
    }

    // Atom
    const atomEntries = xml.getElementsByTagName("entry");
    if (atomEntries.length > 0 && extracted.length === 0) {
        for (let i = 0; i < atomEntries.length; i++) {
            const entry = atomEntries[i];
            const title = entry.getElementsByTagName("title")[0]?.textContent || "";
            let link = "";
            const links = entry.getElementsByTagName("link");
            for (let j = 0; j < links.length; j++) {
                if (links[j].getAttribute("rel") === "alternate" || !link) {
                    link = links[j].getAttribute("href") || "";
                }
            }

            const pubDateStr = entry.getElementsByTagName("updated")[0]?.textContent ||
                               entry.getElementsByTagName("published")[0]?.textContent || "";
            const summary = entry.getElementsByTagName("summary")[0]?.textContent ||
                            entry.getElementsByTagName("content")[0]?.textContent || "";

            let image = "";
            const imgMatch = summary.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) image = imgMatch[1];

            extracted.push({
                id: link || Math.random().toString(36).substring(2, 11),
                title: title.trim(),
                link: link.trim(),
                pubDate: new Date(pubDateStr),
                source: source.name,
                sourceId: source.id,
                image,
                description: summary.replace(/<[^>]*>?/gm, '').substring(0, 150).trim() + "..."
            });
        }
    }

    // Sitemap (Google News / standard)
    const urls = xml.getElementsByTagName("url");
    if (urls.length > 0 && extracted.length === 0) {
        for (let i = 0; i < urls.length; i++) {
            const urlNode = urls[i];
            const loc = urlNode.getElementsByTagName("loc")[0]?.textContent || "";
            const lastmod = urlNode.getElementsByTagName("lastmod")[0]?.textContent || "";
            const newsNode = urlNode.getElementsByTagName("news:news")[0] || urlNode.getElementsByTagName("news")[0];

            let title = "";
            let pubDate = new Date();
            let image = "";

            if (newsNode) {
                title = newsNode.getElementsByTagName("news:title")[0]?.textContent ||
                        newsNode.getElementsByTagName("title")[0]?.textContent || "";
                const newsDate = newsNode.getElementsByTagName("news:publication_date")[0]?.textContent ||
                                 newsNode.getElementsByTagName("publication_date")[0]?.textContent || "";
                if (newsDate) pubDate = new Date(newsDate);
            } else {
                title = loc.split('/').filter(Boolean).pop()?.replace(/(-|.html)/g, ' ') || "Untitled";
                title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                if (lastmod) pubDate = new Date(lastmod);
            }

            const imageNode = urlNode.getElementsByTagName("image:image")[0] || urlNode.getElementsByTagName("image")[0];
            if (imageNode) {
                image = imageNode.getElementsByTagName("image:loc")[0]?.textContent ||
                        imageNode.getElementsByTagName("loc")[0]?.textContent || "";
            }

            if (loc) {
                extracted.push({
                    id: loc,
                    title: title.trim(),
                    link: loc.trim(),
                    pubDate,
                    source: source.name,
                    sourceId: source.id,
                    image,
                    description: ""
                });
            }
        }
    }

    return extracted;
  };

  const fetchAllNews = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setFailedSources([]);
    setActiveProxies(0);

    let allItems: NewsItem[] = [];

    const fetchPromises = NEWS_SOURCES.map(async (source) => {
        try {
            const url = getSourceUrl(source);
            const { text, proxyIndex } = await fetchWithProxyFallback(url);
            setActiveProxies(p => Math.max(p, proxyIndex + 1));

            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");
            const sourceItems = universalParser(xml, source);

            if (sourceItems.length === 0) throw new Error("Parsed zero items");
            return sourceItems;
        } catch (err) {
            setFailedSources(prev => [...prev, source.name]);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(res => {
      allItems = [...allItems, ...res];
    });

    allItems = allItems.filter(item => item.pubDate && !isNaN(item.pubDate.getTime()));
    allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    const seen = new Set();
    allItems = allItems.filter(item => {
        const val = (item.link || item.id).trim();
        if (!val || seen.has(val)) return false;
        seen.add(val);
        return true;
    });

    setItems(allItems);
    setIsLoading(false);
    if (allItems.length > 0) {
        toast.success(`Success: ${allItems.length} news packets interrogated`);
    } else {
        toast.error("Handshake failed: Zero packets received");
    }
  };

  useEffect(() => {
    if (!initialized.current) {
        fetchAllNews();
        initialized.current = true;
    }
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.source.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = selectedSource === "all" || item.sourceId === selectedSource;
      return matchesSearch && matchesSource;
    });
  }, [items, searchQuery, selectedSource]);

  const displayedItems = filteredItems.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-white text-black font-mono selection:bg-primary selection:text-white p-3 sm:p-4 md:p-8 pt-20">
      {/* Brutalist Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 md:mb-12 border-4 border-black p-4 md:p-6 bg-white shadow-[6px_6px_0_0_#000] md:shadow-[8px_8px_0_0_#000]">
        <div className="flex items-center gap-4 self-stretch lg:self-auto">
          <button onClick={() => navigate("/")} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0_0_#000]">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter truncate">News_Room</h1>
            <span className="text-[10px] font-bold text-primary">UNIVERSAL_DATA_INTERROGATOR_v1.5</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 justify-center w-full lg:w-auto">
            <div className="relative w-full md:w-64">
                <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 border-4 border-black px-4 pl-10 font-bold focus:bg-primary/5 outline-none"
                />
                <Search className="absolute left-3 top-3.5 text-black" size={20} />
            </div>

            <div className="flex border-4 border-black overflow-hidden bg-black">
                <button
                    onClick={() => setViewMode("grid")}
                    className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary text-white" : "bg-white text-black hover:bg-slate-100")}
                >
                    <LayoutGrid size={20} />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary text-white" : "bg-white text-black hover:bg-slate-100")}
                >
                    <List size={20} />
                </button>
            </div>

            <button
                onClick={() => { setItems([]); fetchAllNews(); }}
                disabled={isLoading}
                className="px-6 py-3 bg-primary text-white border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase font-black flex items-center gap-2"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Sync
            </button>
        </div>
      </div>

      {failedSources.length > 0 && (
          <div className="mb-8 border-4 border-yellow-500 bg-yellow-50 p-4 flex items-start gap-3 shadow-[4px_4px_0_0_#eab308]">
              <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
              <div className="text-[10px] font-bold text-yellow-800 uppercase">
                  {failedSources.length === NEWS_SOURCES.length ? "FATAL_CONNECTION_ERROR: ALL NODES OFFLINE" : `Node failure detected: ${failedSources.length}/${NEWS_SOURCES.length} sources unresponsive. Check failover logs.`}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
            <section className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
                <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                    <Filter size={18} /> Source_Matrix
                </h2>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedSource("all")}
                        className={cn(
                            "w-full text-left px-3 py-2 text-xs font-black uppercase border-2 border-black transition-all",
                            selectedSource === "all" ? "bg-primary text-white" : "hover:bg-slate-100"
                        )}
                    >
                        Master_Stream ({items.length})
                    </button>
                    {NEWS_SOURCES.map(source => {
                        const count = items.filter(i => i.sourceId === source.id).length;
                        const isFailed = failedSources.includes(source.name);
                        return (
                            <button
                                key={source.id}
                                onClick={() => setSelectedSource(source.id)}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-[10px] font-black uppercase border-2 border-black transition-all flex justify-between items-center",
                                    selectedSource === source.id ? "bg-primary text-white" : isFailed ? "bg-red-50 text-red-400 border-red-200" : "hover:bg-slate-100"
                                )}
                            >
                                <span className="truncate mr-2">{source.name}</span>
                                <span className={cn("shrink-0", selectedSource === source.id ? "text-white" : isFailed ? "text-red-300" : "text-primary")}>[{count}]</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="border-4 border-black p-6 bg-slate-900 text-white shadow-[6px_6px_0_0_#000]">
                <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2 text-primary border-b-2 border-primary/30 pb-2">
                    <Clock size={18} /> Engine_Logs
                </h2>
                <div className="space-y-4 text-[10px] font-bold">
                    <div className="flex justify-between">
                        <span className="text-slate-400">PACKETS_INDEXED:</span>
                        <span>{filteredItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">ACTIVE_GATEWAYS:</span>
                        <span className="text-primary">{activeProxies || "DISCONNECTED"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">STATUS:</span>
                        <span className={cn(isLoading ? "text-yellow-400 animate-pulse" : "text-green-400")}>
                            {isLoading ? "INTERROGATING..." : "STABILIZED"}
                        </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                        <span className="text-slate-400">LOCAL_TIME:</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </section>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-8">
            {isLoading && items.length === 0 ? (
                <div className="border-4 border-black bg-white p-20 flex flex-col items-center justify-center shadow-[8px_8px_0_0_#000]">
                    <div className="relative mb-10">
                        <Loader2 size={80} className="animate-spin text-primary" />
                        <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black" size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-center">Protocol_Initialization</h2>
                    <p className="text-sm font-bold text-slate-500 mt-4 text-center uppercase tracking-tighter max-w-md">
                        Establishing encrypted handshake with 41 distributed nodes. Sequentially bypassing origin security via multi-layered proxy failover...
                    </p>
                </div>
            ) : (
                <>
                    <div className={cn(
                        "grid gap-6",
                        viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>
                        {displayedItems.length > 0 ? (
                            displayedItems.map((item) => (
                                <article
                                    key={item.id}
                                    className={cn(
                                        "border-4 border-black bg-white group hover:shadow-[6px_6px_0_0_#000] transition-all flex flex-col",
                                        viewMode === "list" && "md:flex-row"
                                    )}
                                >
                                    {item.image && (
                                        <div className={cn(
                                            "overflow-hidden border-black bg-slate-100 relative",
                                            viewMode === "grid" ? "aspect-video border-b-4" : "w-full md:w-48 md:border-r-4 aspect-square md:aspect-auto"
                                        )}>
                                            <img
                                                src={getProxyUrl(item.image)}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).parentElement?.remove();
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase">
                                                {item.source}
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4 flex-1 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                                                <Calendar size={10} />
                                                {item.pubDate.toLocaleDateString()}
                                                <span className="mx-1">•</span>
                                                <Clock size={10} />
                                                {item.pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {!item.image && (
                                                <span className="bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase">
                                                    {item.source}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-sm md:text-base font-black uppercase leading-tight group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.description && viewMode === "grid" && (
                                            <p className="text-[10px] font-bold text-slate-600 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t-2 border-slate-100">
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-black uppercase flex items-center gap-1 hover:underline text-primary"
                                            >
                                                INTERROGATE_DOC <ExternalLink size={12} />
                                            </a>
                                            <span className="text-[9px] font-bold text-slate-300">CRC_{item.id.substring(0, 4).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="col-span-full border-4 border-black p-20 bg-white text-center shadow-[8px_8px_0_0_#000]">
                                <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-xl font-black uppercase">Null_Result_Return</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase">Zero data packets intercepted for current parameters.</p>
                            </div>
                        )}
                    </div>

                    {filteredItems.length > displayCount && (
                        <div className="flex justify-center pt-8">
                            <button
                                onClick={() => setDisplayCount(prev => prev + 50)}
                                className="px-12 py-4 bg-white text-black border-4 border-black font-black uppercase shadow-[6px_6px_0_0_#000] hover:bg-primary hover:text-white hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-3"
                            >
                                <ChevronDown size={24} />
                                LOAD_NEXT_BUFFER (+50)
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
      </div>

      {/* Engineering Footer */}
      <footer className="mt-20 border-t-8 border-black pt-12 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4 max-w-md">
                  <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary border-2 border-black" />
                      <h4 className="text-xl font-black uppercase tracking-tighter">Protocol_System_OS</h4>
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase">
                      Decentralized data ingestion engine with multi-layered failover. Normalizing 41 heterogeneous Bangladeshi news streams into a unified 8-field schema.
                  </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                  <div className="space-y-2">
                      <span className="text-[10px] font-black text-primary uppercase">Engine</span>
                      <ul className="text-[9px] font-bold space-y-1 uppercase">
                          <li>v1.5.2-stable</li>
                          <li>Failover_L4</li>
                          <li>React_v18.3</li>
                      </ul>
                  </div>
                  <div className="space-y-2">
                      <span className="text-[10px] font-black text-primary uppercase">Nodes</span>
                      <ul className="text-[9px] font-bold space-y-1 uppercase">
                          <li>41_Sources</li>
                          <li>5_Gateways</li>
                          <li>Encrypted_Stream</li>
                      </ul>
                  </div>
                  <div className="space-y-2">
                      <span className="text-[10px] font-black text-primary uppercase">SysOp</span>
                      <ul className="text-[9px] font-bold space-y-1 uppercase">
                          <li>Md. Abdullah Bari</li>
                          <li>Medical_Informatics</li>
                          <li>AFMC_Archives</li>
                      </ul>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default Newsroom;
