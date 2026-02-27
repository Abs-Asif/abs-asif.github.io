import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  Send,
  Zap,
  Settings,
  LogOut,
  Plus,
  Image as ImageIcon,
  RefreshCw,
  Clock,
  Trash2,
  Volume2,
  Play,
  Square,
  Download,
  ClipboardPaste,
  ChevronRight,
  ExternalLink,
  Eye,
  Check,
  Copy,
  Loader2,
  Newspaper,
  List,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { censorText } from "@/lib/censor";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;
const BOX = { x: 30, y: 32, w: 1020, h: 574 };
const GRAY_BAR_Y = 660;
const GRAY_BAR_H = 85;
const DATE_X = 88;
const DATE_Y = GRAY_BAR_Y + (GRAY_BAR_H / 2);
const TITLE_X = CANVAS_WIDTH / 2;
const TITLE_Y = 860;

const DB_NAME = 'NewsCardDB';
const STORE_NAME = 'photocards';

interface LogEntry {
  message: string;
  timestamp: number;
  type?: 'info' | 'success' | 'error' | 'process';
}

interface AutoRecord {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
  previewUrl: string;
  timestamp: string;
}

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("manual");
  const [user, setUser] = useState<any>(null);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontSize, setFontSize] = useState(70);
  const [titleLetterSpacing, setTitleLetterSpacing] = useState(-2.4);

  // Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [semiAutoUrl, setSemiAutoUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automation State
  const [autoModeActive, setAutoModeActive] = useState(false);
  const [autoLogs, setAutoLogs] = useState<LogEntry[]>([]);
  const [autoRecords, setAutoRecords] = useState<AutoRecord[]>([]);
  const isAutoCheckingRef = useRef(false);
  const [processedUrls, setProcessedUrls] = useState<Set<string>>(new Set());
  const processedUrlsRef = useRef<Set<string>>(new Set());

  // Settings
  const [selectedAudio, setSelectedAudio] = useState(localStorage.getItem('bg_notification_audio') || '/alert.mp3');

  useEffect(() => {
    processedUrlsRef.current = processedUrls;
  }, [processedUrls]);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      toast.error("Please login first.");
      navigate("/");
      return;
    }
    const userData = JSON.parse(session);
    setUser(userData);

    // Load from IndexedDB
    getAllRecords().then(records => {
      setAutoRecords(records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });

    // Load processed URLs
    const savedUrls = localStorage.getItem(`processed_urls_${userData.portalUrl}`);
    if (savedUrls) {
      setProcessedUrls(new Set(JSON.parse(savedUrls)));
    }

    // Interval for Cache Clearing (6 hours)
    const clearCacheInterval = setInterval(() => {
        checkAndClearCache(userData.portalUrl);
    }, 60000); // Check every minute

    return () => clearInterval(clearCacheInterval);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`processed_urls_${user.portalUrl}`, JSON.stringify(Array.from(processedUrls)));
    }
  }, [processedUrls, user]);

  const checkAndClearCache = (portalUrl: string) => {
    const lastClear = localStorage.getItem(`last_cache_clear_${portalUrl}`);
    const sixHours = 6 * 60 * 60 * 1000;
    if (!lastClear || Date.now() - parseInt(lastClear) > sixHours) {
        setProcessedUrls(new Set());
        clearAllRecords().then(() => setAutoRecords([]));
        localStorage.setItem(`last_cache_clear_${portalUrl}`, Date.now().toString());
        addLog("Periodic cache cleared (6h cycle).", "info");
    }
  };

  const saveRecord = async (record: AutoRecord) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
  };

  const getAllRecords = async (): Promise<AutoRecord[]> => {
    const db = await initDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result);
    });
  };

  const clearAllRecords = async () => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = { message, timestamp: Date.now(), type };
    setAutoLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const playNotification = (file?: string) => {
    const audio = new Audio(file || selectedAudio);
    audio.play().catch(e => console.warn("Audio play failed:", e));
  };

  const saveAudioSetting = (file: string) => {
    setSelectedAudio(file);
    localStorage.setItem('bg_notification_audio', file);
    toast.success("Notification sound updated.");
    playNotification(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    navigate("/");
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]} | ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const fetchWithProxy = async (target: string) => {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}&timestamp=${Date.now()}`);
      const data = await response.json();
      if (data && data.contents) return data.contents;
    } catch (e) {}
    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(target)}`);
      if (response.ok) return await response.text();
    } catch (e) {}
    return null;
  };

  const fetchImageWithProxy = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    if (url.startsWith('blob:')) return url;

    const proxies = [
      (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
      (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    ];

    for (const proxy of proxies) {
      try {
        const proxiedUrl = proxy(url);
        const response = await fetch(proxiedUrl);
        if (response.ok) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      } catch (e) {}
    }
    throw new Error("Failed to load image.");
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const generatePhotoCardInternal = async (targetTitle: string, targetImageUrl: string): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas not found");
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Context not found");

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let userImgBlobUrl = '';
    try {
      const template = new Image();
      template.crossOrigin = "anonymous";
      template.src = "/PhotocardTemplate.png";
      await new Promise((resolve, reject) => {
        template.onload = resolve;
        template.onerror = reject;
      });
      ctx.drawImage(template, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      await Promise.all([
        document.fonts.load(`bold ${fontSize}px "Kalpurush"`),
        document.fonts.load(`20px "Cambria"`)
      ]);

      userImgBlobUrl = await fetchImageWithProxy(targetImageUrl);
      const userImg = new Image();
      userImg.src = userImgBlobUrl;
      await new Promise((resolve, reject) => {
        userImg.onload = resolve;
        userImg.onerror = reject;
      });

      const scale = Math.max(BOX.w / userImg.width, BOX.h / userImg.height);
      const drawW = userImg.width * scale;
      const drawH = userImg.height * scale;
      const drawX = BOX.x + (BOX.w - drawW) / 2;
      const drawY = BOX.y + (BOX.h - drawH) / 2;

      const radius = 35;
      const defineBoxPath = () => {
        ctx.beginPath();
        ctx.moveTo(BOX.x + radius, BOX.y);
        ctx.lineTo(BOX.x + BOX.w - radius, BOX.y);
        ctx.quadraticCurveTo(BOX.x + BOX.w, BOX.y, BOX.x + BOX.w, BOX.y + radius);
        ctx.lineTo(BOX.x + BOX.w, BOX.y + BOX.h - radius);
        ctx.quadraticCurveTo(BOX.x + BOX.w, BOX.y + BOX.h, BOX.x + BOX.w - radius, BOX.y + BOX.h);
        ctx.lineTo(BOX.x + radius, BOX.y + BOX.h);
        ctx.quadraticCurveTo(BOX.x, BOX.y + BOX.h, BOX.x, BOX.y + BOX.h - radius);
        ctx.lineTo(BOX.x, BOX.y + radius);
        ctx.quadraticCurveTo(BOX.x, BOX.y, BOX.x + radius, BOX.y);
        ctx.closePath();
      };

      ctx.save();
      defineBoxPath();
      ctx.clip();
      ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
      ctx.restore();

      ctx.save();
      defineBoxPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22C55E';
      ctx.stroke();
      ctx.restore();

      ctx.font = `20px "Cambria"`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatDate(new Date()), DATE_X - 40, DATE_Y - 30);

      let currentFontSize = fontSize;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = `${titleLetterSpacing}px`;

      const maxW = 980;
      let lines: string[] = [];
      let attempts = 0;
      while (attempts < 10) {
        ctx.font = `bold ${currentFontSize}px "Kalpurush"`;
        lines = wrapText(ctx, targetTitle, maxW);
        let maxLineW = 0;
        lines.forEach(l => { maxLineW = Math.max(maxLineW, ctx.measureText(l).width); });
        if (lines.length <= 3 && maxLineW <= maxW) break;
        if (lines.length > 3) currentFontSize *= 0.9;
        else if (maxLineW > maxW) currentFontSize *= (maxW / maxLineW);
        attempts++;
      }

      const lineHeight = currentFontSize * 1.1;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = TITLE_Y - (totalHeight / 2);
      lines.forEach((line, index) => {
        ctx.fillText(line, TITLE_X, startY + (index * lineHeight));
      });

      ctx.letterSpacing = "0px";
      return canvas.toDataURL('image/png');
    } finally {
      if (userImgBlobUrl && userImgBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(userImgBlobUrl);
      }
    }
  };

  const checkAutomation = async () => {
    if (isAutoCheckingRef.current || !user) return;
    isAutoCheckingRef.current = true;
    addLog("Scanning feed for new posts...", "process");

    try {
      const feedUrls = [`${user.portalUrl}/feed/`, `${user.portalUrl}/rss/`, `${user.portalUrl}/feeds/posts/default`];
      let feedContent = "";

      for (const url of feedUrls) {
        const content = await fetchWithProxy(url);
        if (content && (content.includes("<rss") || content.includes("<feed"))) {
          feedContent = content;
          break;
        }
      }

      if (!feedContent) throw new Error("No feed discovered.");

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(feedContent, "text/xml");
      const items = Array.from(xmlDoc.getElementsByTagName("item")).slice(0, 5);

      const newItems = items.filter(item => {
        const link = item.getElementsByTagName("link")[0]?.textContent;
        return link && !processedUrlsRef.current.has(link);
      });

      if (newItems.length === 0) {
        addLog("No new posts found.");
      } else {
        addLog(`Found ${newItems.length} new post(s)!`, "success");
        for (const item of newItems) {
          const title = item.getElementsByTagName("title")[0]?.textContent || "";
          const link = item.getElementsByTagName("link")[0]?.textContent || "";

          let imageUrl = "";
          const mediaContent = item.getElementsByTagName("media:content")[0];
          if (mediaContent) imageUrl = mediaContent.getAttribute("url") || "";

          if (!imageUrl) {
            const html = await fetchWithProxy(link);
            if (html) {
              const doc = parser.parseFromString(html, "text/html");
              imageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
            }
          }

          if (title && imageUrl) {
            const censoredTitle = censorText(title);
            const dataUrl = await generatePhotoCardInternal(censoredTitle, imageUrl);

            const newRecord: AutoRecord = {
              id: Math.random().toString(36).substr(2, 9),
              url: link,
              title: censoredTitle,
              imageUrl: imageUrl,
              previewUrl: dataUrl,
              timestamp: new Date().toISOString()
            };

            await saveRecord(newRecord);
            setAutoRecords(prev => [newRecord, ...prev]);
            setProcessedUrls(prev => {
              const next = new Set(prev);
              next.add(link);
              return next;
            });

            playNotification();
            toast.success(`Auto-generated: ${censoredTitle}`);
          }
        }
      }
    } catch (e: any) {
      addLog(`Error: ${e.message}`, "error");
    } finally {
      isAutoCheckingRef.current = false;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoModeActive) {
      checkAutomation();
      interval = setInterval(checkAutomation, 120000);
    }
    return () => clearInterval(interval);
  }, [autoModeActive, user]);

  const handleGenerateManual = async () => {
    if (!manualTitle || !manualImage) {
      toast.error("Please provide both title and image URL");
      return;
    }
    setIsGenerating(true);
    try {
      const censoredTitle = censorText(manualTitle);
      const dataUrl = await generatePhotoCardInternal(censoredTitle, manualImage);
      setPreviewUrl(dataUrl);
      playNotification();
      toast.success("Photocard generated!");
    } catch (error) {
      toast.error("Failed to generate photocard.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualImage(reader.result as string);
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSemiAutoFetch = async () => {
    if (!semiAutoUrl) {
      toast.error("Please enter a Post URL");
      return;
    }
    setIsFetching(true);
    try {
      const html = await fetchWithProxy(semiAutoUrl);
      if (!html) throw new Error("Could not fetch page content.");

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const twitterImage = doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
      const metaTitle = doc.querySelector('title')?.textContent;

      const title = ogTitle || metaTitle || "";
      const image = ogImage || twitterImage || "";

      if (title && image) {
        setManualTitle(title);
        setManualImage(image);
        toast.success("Data fetched! Generating photocard...");
        const censoredTitle = censorText(title);
        const dataUrl = await generatePhotoCardInternal(censoredTitle, image);
        setPreviewUrl(dataUrl);
        playNotification();
        setActiveTab("manual");
      } else {
        toast.error("Could not find title or image on this page.");
      }
    } catch (e: any) {
      toast.error(e.message || "Fetch failed.");
    } finally {
      setIsFetching(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b flex items-center gap-2">
          <Zap className="text-primary w-6 h-6 fill-current" />
          <span className="font-bold text-lg tracking-tight">NewsCard AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("manual")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "manual" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Plus className="w-4 h-4" />
            Manual Post
          </button>
          <button
            onClick={() => setActiveTab("semi-auto")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "semi-auto" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
            Semi-Auto
          </button>
          <button
            onClick={() => setActiveTab("automation")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "automation" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Zap className="w-4 h-4" />
            Automation
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.portalUrl}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight capitalize">{activeTab.replace("-", " ")}</h1>
          <p className="text-muted-foreground">Manage your news portal photocards.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            {activeTab === "manual" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualTitle">Title Text</Label>
                    <Textarea
                      id="manualTitle"
                      placeholder="Enter news title..."
                      className="min-h-[100px] font-bangla text-lg"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manualImage">Image Source</Label>
                    <div className="flex gap-2">
                      <Input
                        id="manualImage"
                        placeholder="https://example.com/image.jpg"
                        value={manualImage.startsWith('data:') ? 'Local Image Uploaded' : manualImage}
                        onChange={(e) => setManualImage(e.target.value)}
                      />
                      <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Upload Image">
                        <Upload className="w-4 h-4" />
                      </Button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <Button variant="outline" size="icon" onClick={async () => {
                        const text = await navigator.clipboard.readText();
                        setManualImage(text);
                      }} title="Paste URL">
                        <ClipboardPaste className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full h-12 text-base font-bold" onClick={handleGenerateManual} disabled={isGenerating}>
                    {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    Generate Photocard
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "semi-auto" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="semiAutoUrl">Post URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="semiAutoUrl"
                        placeholder="https://yournews.com/post-123"
                        value={semiAutoUrl}
                        onChange={(e) => setSemiAutoUrl(e.target.value)}
                      />
                      <Button variant="outline" size="icon" onClick={async () => {
                        const text = await navigator.clipboard.readText();
                        setSemiAutoUrl(text);
                      }}>
                        <ClipboardPaste className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full h-12 text-base font-bold" onClick={handleSemiAutoFetch} disabled={isFetching || isGenerating}>
                    {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Fetch and Generate
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "automation" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", autoModeActive ? "bg-green-500 animate-pulse" : "bg-muted")} />
                      <h3 className="font-bold">Auto-Sync Status</h3>
                    </div>
                    <Button
                      variant={autoModeActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => setAutoModeActive(!autoModeActive)}
                    >
                      {autoModeActive ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {autoModeActive ? "Stop Automation" : "Start Automation"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Activity Log</Label>
                    <div className="bg-muted/30 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-1 scrollbar-hide">
                      {autoLogs.length === 0 ? (
                        <p className="text-muted-foreground italic">System idle. Waiting for start...</p>
                      ) : (
                        autoLogs.map((log, i) => (
                          <div key={i} className={cn(
                            log.type === 'success' ? 'text-green-600' :
                            log.type === 'error' ? 'text-red-600' :
                            log.type === 'process' ? 'text-primary' : 'text-muted-foreground'
                          )}>
                            [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {autoRecords.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <List className="w-4 h-4 text-primary" />
                        Recent Generations
                      </h3>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                        if (confirm("Clear all?")) {
                            clearAllRecords().then(() => setAutoRecords([]));
                        }
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {autoRecords.map(record => (
                        <div key={record.id} className="bg-card border rounded-xl overflow-hidden group">
                          <div className="aspect-square relative overflow-hidden bg-muted">
                            <img src={record.previewUrl} alt={record.title} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button variant="secondary" size="icon" onClick={() => {
                                const link = document.createElement('a');
                                link.download = "photocard.png";
                                link.href = record.previewUrl;
                                link.click();
                              }}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-[10px] font-bangla line-clamp-1">{record.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-primary" />
                      Notification Sound
                    </Label>
                    <div className="space-y-3">
                      {[
                        { name: 'Alert (Default)', file: '/alert.mp3' },
                        { name: 'Instant', file: '/instant.mp3' },
                        { name: 'Loud', file: '/loud.mp3' }
                      ].map((audio) => (
                        <div key={audio.file} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                          <span className="text-sm">{audio.name}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => playNotification(audio.file)}>
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={selectedAudio === audio.file ? "default" : "outline"}
                              size="sm"
                              className="h-8 px-4 text-xs"
                              onClick={() => saveAudioSetting(audio.file)}
                            >
                              {selectedAudio === audio.file ? "Selected" : "Select"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      Canvas Settings
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                        <Input
                          id="fontSize"
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value) || 70)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="spacing" className="text-xs">Letter Spacing</Label>
                        <Input
                          id="spacing"
                          type="number"
                          step="0.1"
                          value={titleLetterSpacing}
                          onChange={(e) => setTitleLetterSpacing(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card border-2 border-dashed rounded-3xl aspect-square flex items-center justify-center overflow-hidden shadow-inner relative group">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button variant="secondary" size="sm" onClick={() => {
                      const link = document.createElement('a');
                      link.download = "photocard.png";
                      link.href = previewUrl;
                      link.click();
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground">Preview will appear here</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="hidden" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
