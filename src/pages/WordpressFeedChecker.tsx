import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, RefreshCw, ExternalLink, Clock, Globe, Newspaper, Eye, X, ImageIcon, Trash2, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

const WordpressFeedChecker = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Cache for pre-fetched post details
  const [cachedDetails, setCachedDetails] = useState<Record<string, { title: string; image: string; content?: string }>>({});

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<{ title: string; image: string; content?: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const cleanUrl = (input: string) => {
    let formatted = input.trim();
    if (!formatted) return "";
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = "https://" + formatted;
    }
    return formatted.replace(/\/+$/, "");
  };

  const fetchWithProxy = async (target: string) => {
    // Try CodeTabs first
    try {
      const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`);
      if (response.ok) return await response.text();
    } catch (e) {}

    // Try AllOrigins fallback
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}&timestamp=${Date.now()}`);
      const data = await response.json();
      if (data && data.contents) return data.contents;
    } catch (e) {}

    // Try Corsproxy.io fallback
    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(target)}`);
      if (response.ok) return await response.text();
    } catch (e) {}

    return null;
  };

  const fetchFeed = async (baseUrl: string) => {
    const patterns = ["/feed/", "/feed/rss2/", "/feed/atom/", "/?feed=rss2"];
    let lastError = "";

    for (const pattern of patterns) {
      const targetUrl = `${baseUrl}${pattern}`;
      try {
        const contents = await fetchWithProxy(targetUrl);

        if (contents) {
          const trimmed = contents.trim();
          if (!trimmed.startsWith("<?xml")) {
            continue;
          }
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(trimmed, "text/xml");

          const parseError = xmlDoc.getElementsByTagName("parsererror");
          if (parseError.length > 0) continue;

          const feedItems: FeedItem[] = [];

          // Try RSS format
          const rssItems = xmlDoc.getElementsByTagName("item");
          if (rssItems.length > 0) {
            for (let i = 0; i < rssItems.length; i++) {
              const item = rssItems[i];
              feedItems.push({
                title: item.getElementsByTagName("title")[0]?.textContent || "No Title",
                link: item.getElementsByTagName("link")[0]?.textContent || "#",
                pubDate: item.getElementsByTagName("pubDate")[0]?.textContent || "No Date",
                description: item.getElementsByTagName("description")[0]?.textContent || "",
              });
            }
          } else {
            // Try Atom format
            const atomEntries = xmlDoc.getElementsByTagName("entry");
            if (atomEntries.length > 0) {
              for (let i = 0; i < atomEntries.length; i++) {
                const entry = atomEntries[i];
                const links = entry.getElementsByTagName("link");
                let link = "#";
                for (let j = 0; j < links.length; j++) {
                  if (links[j].getAttribute("rel") === "alternate" || !links[j].getAttribute("rel")) {
                    link = links[j].getAttribute("href") || "#";
                    break;
                  }
                }
                feedItems.push({
                  title: entry.getElementsByTagName("title")[0]?.textContent || "No Title",
                  link: link,
                  pubDate: entry.getElementsByTagName("published")[0]?.textContent || entry.getElementsByTagName("updated")[0]?.textContent || "No Date",
                  description: entry.getElementsByTagName("summary")[0]?.textContent || entry.getElementsByTagName("content")[0]?.textContent || "",
                });
              }
            }
          }

          if (feedItems.length > 0) {
            setItems(feedItems);
            return true;
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Fetch failed";
      }
    }
    throw new Error("This is not a WordPress website.");
  };

  const handleCheck = async (targetOverride?: string) => {
    const target = targetOverride || url;
    const formattedUrl = cleanUrl(target);
    if (!formattedUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    try {
      await fetchFeed(formattedUrl);
      if (!targetOverride) toast.success("Feed updated");
      setActiveUrl(formattedUrl);
      setIsAutoRefreshing(true);
      setTimeLeft(60);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setUrl("");
    setActiveUrl("");
    setItems([]);
    setCachedDetails({});
    setIsAutoRefreshing(false);
    setTimeLeft(60);
    setLastUpdated(null);
    toast.success("All records cleared");
  };

  const prefetchDetails = async (feedItems: FeedItem[]) => {
    const top10 = feedItems.slice(0, 10);
    for (const item of top10) {
      if (cachedDetails[item.link]) continue;

      try {
        const html = await fetchWithProxy(item.link);
        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
          const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
          const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
          const metaTitle = doc.querySelector('title')?.textContent;

          const article = doc.querySelector('article') || doc.body;
          const contentSnippet = article.querySelector('p')?.textContent || "";

          setCachedDetails(prev => ({
            ...prev,
            [item.link]: {
              title: ogTitle || metaTitle || item.title,
              image: ogImage || twitterImage || "",
              content: contentSnippet
            }
          }));
        }
      } catch (e) {
        console.error(`Prefetch failed for ${item.link}`);
      }
    }
  };

  const openDetail = async (item: FeedItem) => {
    setSelectedItem(item);

    // Check cache first
    if (cachedDetails[item.link]) {
      setDetailData(cachedDetails[item.link]);
      setIsDetailLoading(false);
      return;
    }

    setIsDetailLoading(true);
    setDetailData(null);
    try {
      const html = await fetchWithProxy(item.link);
      if (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
        const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
        const metaTitle = doc.querySelector('title')?.textContent;

        const article = doc.querySelector('article') || doc.body;
        const contentSnippet = article.querySelector('p')?.textContent || "";

        const data = {
          title: ogTitle || metaTitle || item.title,
          image: ogImage || twitterImage || "",
          content: contentSnippet
        };

        setDetailData(data);
        setCachedDetails(prev => ({ ...prev, [item.link]: data }));
      }
    } catch (e) {
      toast.error("Failed to load post details");
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    if (items.length > 0) {
      prefetchDetails(items);
    }
  }, [items]);

  useEffect(() => {
    if (isAutoRefreshing && activeUrl) {
      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAutoRefreshing, activeUrl]);

  useEffect(() => {
    if (timeLeft <= 0 && isAutoRefreshing && activeUrl) {
      handleCheck(activeUrl);
    }
  }, [timeLeft, isAutoRefreshing, activeUrl]);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12 font-mono relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary/20 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3">
                <span className="text-primary tracking-[0.2em]">WP</span>
                <span className="opacity-50">Feed.checker</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">WordPress Syndication Monitor v1.0.4</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full ${isAutoRefreshing ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <span className="text-[10px] text-primary uppercase tracking-widest">
              {isAutoRefreshing ? 'System Active' : 'System Standby'}
            </span>
          </div>
        </header>

        <div className="terminal-window border-primary/20">
          <div className="terminal-header flex justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3 h-3" /> Input Parameters
            </span>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="url" className="text-[10px] uppercase mb-1 block opacity-60">Base URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-background/50 border-primary/20 font-mono text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={() => handleCheck()}
                  disabled={isLoading}
                  className="flex-1 md:w-auto uppercase text-xs font-bold tracking-widest bg-primary hover:bg-primary/90"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Initialize Scan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="border-primary/20 hover:bg-primary/10 text-primary"
                  title="Clear results"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isAutoRefreshing && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5 border border-primary/10 rounded px-4 py-3 text-[10px] uppercase tracking-[0.2em]">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Clock className="w-3 h-3 text-primary animate-pulse" />
                <span>Sync in: <span className="font-bold text-primary">{timeLeft}s</span></span>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-3 opacity-60">
                  <RefreshCw className="w-3 h-3" />
                  <span>Last Updated: <span className="font-bold">{lastUpdated}</span></span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsAutoRefreshing(false)}
              className="text-muted-foreground hover:text-destructive transition-colors border-b border-transparent hover:border-destructive uppercase font-bold"
            >
              [ Terminate Loop ]
            </button>
          </div>
        )}

        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="terminal-window border-primary/10 hover:border-primary/40 hover:bg-primary/[0.02] hover:scale-[1.01] hover:shadow-xl transition-all duration-500 group">
                <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-3 h-3 text-primary/60" />
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{item.pubDate}</span>
                    </div>
                    <h3 className="font-bold text-sm md:text-base leading-tight group-hover:text-primary transition-colors line-clamp-2 font-bangla">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                        {stripHtml(item.description)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetail(item)}
                      className="p-3 bg-primary/5 hover:bg-primary/20 rounded-full transition-all duration-300 border border-primary/10 hover:border-primary/40"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                    </Button>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-primary/5 hover:bg-primary/20 rounded-full transition-all duration-300 border border-primary/10 hover:border-primary/40"
                    >
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : !isLoading && url && (
            <div className="py-20 text-center border-2 border-dashed border-primary/10 rounded-lg">
              <div className="inline-flex p-4 rounded-full bg-primary/5 mb-4">
                <Globe className="w-8 h-8 text-primary/20" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">No data records found for target host.</p>
            </div>
          )}
        </div>

        <footer className="pt-12 border-t border-primary/10 text-[9px] text-muted-foreground uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <span>Scan Mode: Recursive</span>
            <span>Protocol: RSS/ATOM</span>
          </div>
          <span>&copy; {new Date().getFullYear()} WP_FEED_CHECKER.sys</span>
        </footer>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="terminal-window max-w-2xl w-full border-primary/30 animate-fade-in-up bg-card/95 shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="terminal-header flex justify-between items-center sticky top-0 z-10 bg-secondary/80 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-3 h-3 text-primary" /> Content Preview
              </span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)} className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {isDetailLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                    <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0 [animation-delay:-0.5s]" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary animate-pulse">Initializing Data Stream...</p>
                </div>
              ) : (
                <>
                  <div className="aspect-video relative rounded-xl overflow-hidden bg-primary/5 border border-primary/10 flex items-center justify-center group">
                    {detailData?.image ? (
                      <img src={detailData.image} alt={detailData.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/20">
                        <ImageIcon className="w-16 h-16" />
                        <span className="text-[10px] uppercase tracking-widest">No Visual Assets Detected</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold leading-tight text-primary font-bangla decoration-primary/30 decoration-2 underline-offset-4">
                      {detailData?.title || selectedItem.title}
                    </h2>
                    <div className="text-sm text-foreground/80 leading-relaxed space-y-4 font-sans">
                      {detailData?.content ? (
                        <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                          {detailData.content}
                        </p>
                      ) : (
                        <p>{stripHtml(selectedItem.description)}</p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Publication Date</span>
                        <span className="text-xs font-bold text-primary/80">{selectedItem.pubDate}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(selectedItem.link)}
                          className="flex-1 sm:flex-none border-primary/20 hover:bg-primary/10 gap-2 uppercase text-[10px] tracking-widest"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Copied' : 'Copy Link'}
                        </Button>
                        <Button asChild size="sm" className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white gap-2 uppercase text-[10px] tracking-widest font-bold">
                          <a href={selectedItem.link} target="_blank" rel="noopener noreferrer">
                            Visit Site <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default WordpressFeedChecker;
