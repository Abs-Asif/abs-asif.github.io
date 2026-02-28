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
  Upload,
  ShieldCheck,
  Search,
  X,
  Edit2,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Palette,
  Maximize2,
  Menu,
  MousePointer2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { censorText, baseMappings } from "@/lib/censor";
import { fetchWithProxy } from "@/lib/proxy";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";

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
  type: 'manual' | 'semi-auto' | 'automation';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sanitizer State
  const [customMappings, setCustomMappings] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('custom_sanitizer_mappings');
    return saved ? JSON.parse(saved) : {};
  });
  const [isSanitizerModalOpen, setIsSanitizerModalOpen] = useState(false);
  const [sanitizerSearch, setSanitizerSearch] = useState("");
  const [newBaseWord, setNewBaseWord] = useState("");
  const [newSanitizedWord, setNewSanitizedWord] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<any[]>(() => {
    const saved = localStorage.getItem('canvas_templates');
    const defaultTemplate = {
      id: 'default',
      name: 'Default Template',
      backgroundImage: '/PhotocardTemplate.png',
      title: {
        color: '#ffffff',
        font: 'Kalpurush',
        size: 70,
        align: 'center',
        letterSpacing: -2.4,
        lineSpacing: 1.1,
        x: 540,
        y: 860
      },
      date: {
        color: '#ffffff',
        font: 'Cambria',
        size: 20,
        align: 'left',
        letterSpacing: 0,
        lineSpacing: 1,
        x: 48,
        y: 660 + (85 / 2) - 30
      },
      image: {
        x: 30,
        y: 32,
        w: 1020,
        h: 574,
        scale: 1,
        border: {
          enabled: true,
          color: '#22C55E',
          width: 2
        }
      },
      qr: {
        enabled: false,
        size: 100,
        x: 930,
        y: 30,
        border: {
          enabled: false,
          color: '#ffffff',
          width: 2
        }
      },
      sanitizer: {
        enabled: true
      }
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }

    // Support legacy canvas_settings migration
    const legacy = localStorage.getItem('canvas_settings');
    if (legacy) {
      try {
        const parsedLegacy = JSON.parse(legacy);
        return [{
          ...defaultTemplate,
          ...parsedLegacy,
          title: { ...defaultTemplate.title, ...parsedLegacy.title },
          date: { ...defaultTemplate.date, ...parsedLegacy.date },
          qr: { ...defaultTemplate.qr, ...parsedLegacy.qr }
        }];
      } catch (e) {}
    }

    return [defaultTemplate];
  });

  const [activeTemplateId, setActiveTemplateId] = useState(() => {
    return templates[0]?.id || 'default';
  });
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState<'add' | 'rename'>('add');
  const [tempTemplateName, setTempTemplateName] = useState("");

  // Ad State
  const [ads, setAds] = useState<any[]>(() => {
    const saved = localStorage.getItem('global_ads');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAdId, setActiveAdId] = useState<string>(() => {
    return localStorage.getItem('global_active_ad_id') || "";
  });
  const [adsEnabled, setAdsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('global_ads_enabled') === 'true';
  });
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [newAdName, setNewAdName] = useState("");

  const canvasSettings = templates.find(t => t.id === activeTemplateId) || templates[0];

  const setCanvasSettings = (newSettings: any) => {
    setTemplates(prev => prev.map(t => t.id === activeTemplateId ? { ...t, ...newSettings } : t));
  };

  const [previewScenario, setPreviewScenario] = useState(0);
  const scenarios = [
    "এক লাইনের শিরোনাম",
    "এটি একটি দুই লাইনের শিরোনাম, যা এভাবে দেখাবে",
    "এটি একটু তিন লাইনের শিরোনাম। যা এরকম দেখাবে। এটি দুই লাইনের চেয়ে বড়।"
  ];

  // Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualQrUrl, setManualQrUrl] = useState("");

  useEffect(() => {
    localStorage.setItem('canvas_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('custom_sanitizer_mappings', JSON.stringify(customMappings));
  }, [customMappings]);

  useEffect(() => {
    const runPreview = async () => {
      if (!canvasRef.current) return;
      try {
        if (activeTab === "settings" || activeTab === "templates") {
          const censoredTitle = censorText(scenarios[previewScenario], canvasSettings.sanitizer?.enabled, customMappings);
          const url = await generatePhotoCardInternal(censoredTitle, "Example.png");
          setPreviewUrl(url);
        } else if (activeTab === "manual" && !manualTitle && !manualImage) {
          const censoredTitle = censorText(scenarios[previewScenario], canvasSettings.sanitizer?.enabled, customMappings);
          const url = await generatePhotoCardInternal(censoredTitle, "Example.png");
          setPreviewUrl(url);
        }
      } catch (e) {
        console.error("Preview generation failed:", e);
      }
    };

    runPreview();
  }, [canvasSettings, previewScenario, activeTab, manualTitle, manualImage]);

  useEffect(() => {
    if (activeTab !== "settings" && activeTab !== "templates") return;
    const interval = setInterval(() => {
      setPreviewScenario(prev => (prev + 1) % scenarios.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);
  const [semiAutoUrl, setSemiAutoUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adFileInputRef = useRef<HTMLInputElement>(null);

  // Automation State
  const [autoModeActive, setAutoModeActive] = useState(false);
  const [autoLogs, setAutoLogs] = useState<LogEntry[]>([]);
  const [autoRecords, setAutoRecords] = useState<AutoRecord[]>([]);
  const isAutoCheckingRef = useRef(false);
  const [processedUrls, setProcessedUrls] = useState<Set<string>>(new Set());
  const processedUrlsRef = useRef<Set<string>>(new Set());

  // Settings
  const [selectedAudio, setSelectedAudio] = useState(localStorage.getItem('bg_notification_audio') || '/Alert.mp3');

  useEffect(() => {
    processedUrlsRef.current = processedUrls;
  }, [processedUrls]);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session || session === "null") {
      toast.error("Please login first.");
      navigate("/");
      return;
    }

    let userData: any;
    try {
      userData = JSON.parse(session);
    } catch (e) {
      localStorage.removeItem("user_session");
      navigate("/");
      return;
    }

    if (!userData || !userData.portalUrl) {
      navigate("/");
      return;
    }

    // Check for ban and update session from Supabase
    const checkBanStatus = async () => {
      if (userData.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', userData.id)
          .single();

        if (!error && profile && profile.display_name) {
          try {
            const remoteData = JSON.parse(profile.display_name);
            if (remoteData.isBanned) {
              toast.error("Your account has been banned.");
              localStorage.removeItem("user_session");
              navigate("/");
              return;
            }
            // Update local session with remote data
            const updatedSession = { ...userData, ...remoteData };
            localStorage.setItem("user_session", JSON.stringify(updatedSession));
            setUser(updatedSession);

            // Merge assigned templates
            if (remoteData.assignedTemplates && Array.isArray(remoteData.assignedTemplates)) {
              setTemplates(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const newTemplates = remoteData.assignedTemplates.filter((t: any) => !existingIds.has(t.id));
                return [...prev, ...newTemplates];
              });
            }
          } catch (e) {
            setUser(userData);
          }
        } else {
          setUser(userData);
        }
      } else {
        setUser(userData);
      }
    };

    checkBanStatus();

    // Load from IndexedDB
    getAllRecords().then(records => {
      setAutoRecords(records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }).catch(e => console.error("DB Load failed:", e));

    // Load processed URLs
    try {
      const savedUrls = localStorage.getItem(`processed_urls_${userData.portalUrl}`);
      if (savedUrls) {
        const parsed = JSON.parse(savedUrls);
        if (Array.isArray(parsed)) {
          setProcessedUrls(new Set(parsed));
        }
      }
    } catch (e) {
      console.warn("Failed to load processed URLs:", e);
    }

    // Interval for Cache Clearing (6 hours)
    const clearCacheInterval = setInterval(() => {
        checkAndClearCache(userData.portalUrl);
    }, 60000); // Check every minute

    return () => clearInterval(clearCacheInterval);
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('global_ads', JSON.stringify(ads));
  }, [ads]);

  useEffect(() => {
    localStorage.setItem('global_active_ad_id', activeAdId);
  }, [activeAdId]);

  useEffect(() => {
    localStorage.setItem('global_ads_enabled', String(adsEnabled));
  }, [adsEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Esc to close any open modal or template editor
      if (e.key === 'Escape') {
        if (isSanitizerModalOpen) setIsSanitizerModalOpen(false);
        else if (isTemplateModalOpen) setIsTemplateModalOpen(false);
        else if (isEditingTemplate) setIsEditingTemplate(false);
        else if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }

      // Global Enter to trigger main action in the current tab
      if (e.key === 'Enter' && !e.shiftKey) {
        // Only trigger if no modal is open (modals have their own enter handlers)
        if (!isSanitizerModalOpen && !isTemplateModalOpen && !isEditingTemplate) {
           if (activeTab === 'manual') handleGenerateManual();
           else if (activeTab === 'semi-auto') handleSemiAutoFetch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSanitizerModalOpen, isTemplateModalOpen, isEditingTemplate, isMobileMenuOpen, activeTab, manualTitle, manualImage, semiAutoUrl]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`processed_urls_${user.portalUrl}`, JSON.stringify(Array.from(processedUrls)));
    }
  }, [processedUrls, user]);

  useEffect(() => {
    if (activeTab === "manual" && (manualTitle || manualImage)) {
      const censoredTitle = censorText(manualTitle || "শিরোনাম এখানে", canvasSettings.sanitizer?.enabled, customMappings);
      generatePhotoCardInternal(censoredTitle, manualImage || "https://images.unsplash.com/photo-1585829365234-78d2b85da94c?w=800", manualQrUrl)
        .then(url => setPreviewUrl(url))
        .catch(() => {});
    }
  }, [manualTitle, manualImage, manualQrUrl, canvasSettings, activeTab, customMappings]);

  const checkAndClearCache = (portalUrl: string) => {
    const lastClear = localStorage.getItem(`last_cache_clear_${portalUrl}`);
    const sixHours = 6 * 60 * 60 * 1000;
    if (!lastClear) {
        localStorage.setItem(`last_cache_clear_${portalUrl}`, Date.now().toString());
        return;
    }
    if (Date.now() - parseInt(lastClear) > sixHours) {
        setProcessedUrls(new Set());
        localStorage.setItem(`last_cache_clear_${portalUrl}`, Date.now().toString());
        addLog("URL cache cleared (6h cycle).", "info");
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

  const deleteRecord = async (id: string) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    setAutoRecords(prev => prev.filter(r => r.id !== id));
    toast.success("Photocard deleted.");
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

  const fetchImageWithProxy = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    if (url.startsWith('blob:')) return url;
    if (url.includes(window.location.host) || !url.startsWith('http')) return url;

    const proxies = [
      (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
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

  const generatePhotoCardInternal = async (targetTitle: string, targetImageUrl: string, qrUrl?: string): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas not found");

    let adImg: HTMLImageElement | null = null;
    let adHeight = 0;
    if (adsEnabled && activeAdId) {
      const activeAd = ads.find((a: any) => a.id === activeAdId);
      if (activeAd) {
        adImg = new Image();
        adImg.src = activeAd.dataUrl;
        await new Promise((resolve) => {
          adImg!.onload = resolve;
          adImg!.onerror = () => { adImg = null; resolve(null); };
        });
        if (adImg) {
          adHeight = (CANVAS_WIDTH / adImg.width) * adImg.height;
        }
      }
    }

    canvas.height = CANVAS_HEIGHT + adHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Context not found");

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT + adHeight);

    let userImgBlobUrl = '';
    try {
      const bg = new Image();
      bg.crossOrigin = "anonymous";
      bg.src = canvasSettings.backgroundImage || "/PhotocardTemplate.png";
      await new Promise((resolve) => { bg.onload = resolve; bg.onerror = resolve; });
      ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const drawText = (element: any, overrideText?: string) => {
        if (!element || element.enabled === false) return;
        ctx.save();
        ctx.font = `bold ${element.size}px "${element.font}"`;
        ctx.fillStyle = element.color;
        ctx.textAlign = element.align as CanvasTextAlign;
        ctx.textBaseline = 'middle';

        if (element.shadow?.enabled) {
          ctx.shadowColor = element.shadow.color;
          ctx.shadowBlur = element.shadow.blur;
          ctx.shadowOffsetX = element.shadow.offsetX;
          ctx.shadowOffsetY = element.shadow.offsetY;
        }

        const textToDraw = overrideText || element.text || "";
        if (overrideText) {
          // Wrapped title logic
          const maxW = 980;
          let currentFontSize = element.size;
          let lines: string[] = [];
          let attempts = 0;
          while (attempts < 10) {
            ctx.font = `bold ${currentFontSize}px "${element.font}"`;
            lines = wrapText(ctx, textToDraw, maxW);
            let maxLineW = 0;
            lines.forEach(l => { maxLineW = Math.max(maxLineW, ctx.measureText(l).width); });
            if (lines.length <= 3 && maxLineW <= maxW) break;
            if (lines.length > 3) currentFontSize *= 0.9;
            else if (maxLineW > maxW) currentFontSize *= (maxW / maxLineW);
            attempts++;
          }
          const lineHeight = currentFontSize * (element.lineSpacing || 1.1);
          const totalHeight = (lines.length - 1) * lineHeight;
          const startY = element.y - (totalHeight / 2);
          lines.forEach((line, index) => {
            ctx.fillText(line, element.x, startY + (index * lineHeight));
          });
        } else {
          ctx.fillText(textToDraw, element.x, element.y);
        }
        ctx.restore();
      };

      if (canvasSettings.subtitleAbove) drawText(canvasSettings.subtitleAbove);
      drawText(canvasSettings.title, targetTitle);
      if (canvasSettings.subtitleBelow) drawText(canvasSettings.subtitleBelow);
      drawText(canvasSettings.date, formatDate(new Date()));
      if (canvasSettings.extraTexts) canvasSettings.extraTexts.forEach((et: any) => drawText(et));

      const drawGraphic = async (element: any, isMainImage = false) => {
        if (!element || element.enabled === false) return;
        ctx.save();

        if (element.shadow?.enabled) {
          ctx.shadowColor = element.shadow.color;
          ctx.shadowBlur = element.shadow.blur;
          ctx.shadowOffsetX = element.shadow.offsetX;
          ctx.shadowOffsetY = element.shadow.offsetY;
        }

        if (isMainImage || element.type === 'logo') {
           const imgSrc = isMainImage ? targetImageUrl : element.src;
           if (imgSrc) {
             const imgBlob = await fetchImageWithProxy(imgSrc);
             const img = new Image();
             img.src = imgBlob;
             await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

             ctx.globalAlpha = element.opacity ?? 1;

             if (isMainImage) {
                // Handle main image scaling and clipping
                const baseScale = Math.max(element.w / img.width, element.h / img.height);
                const finalScale = baseScale * (element.scale || 1);
                const drawW = img.width * finalScale;
                const drawH = img.height * finalScale;
                const drawX = element.x + (element.w - drawW) / 2;
                const drawY = element.y + (element.h - drawH) / 2;

                if (element.cornerRoundness > 0) {
                   const r = element.cornerRoundness;
                   ctx.beginPath();
                   ctx.moveTo(element.x + r, element.y);
                   ctx.lineTo(element.x + element.w - r, element.y);
                   ctx.quadraticCurveTo(element.x + element.w, element.y, element.x + element.w, element.y + r);
                   ctx.lineTo(element.x + element.w, element.y + element.h - r);
                   ctx.quadraticCurveTo(element.x + element.w, element.y + element.h, element.x + element.w - r, element.y + element.h);
                   ctx.lineTo(element.x + r, element.y + element.h);
                   ctx.quadraticCurveTo(element.x, element.y + element.h, element.x, element.y + element.h - r);
                   ctx.lineTo(element.x, element.y + r);
                   ctx.quadraticCurveTo(element.x, element.y, element.x + r, element.y);
                   ctx.closePath();
                   ctx.clip();
                }
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
             } else {
                ctx.drawImage(img, element.x, element.y, element.w, element.h);
             }
           }
        } else if (element.type === 'qr' || (element.size && !element.w)) { // fallback for old qr
           const qrSize = element.w || element.size;
           const qrDataUrl = await QRCode.toDataURL(qrUrl || "https://drutopost.com", { margin: 1, width: qrSize });
           const qrImg = new Image();
           qrImg.src = qrDataUrl;
           await new Promise(r => qrImg.onload = r);
           ctx.drawImage(qrImg, element.x, element.y, qrSize, qrSize);
        }

        ctx.restore();

        if (element.border?.enabled) {
          ctx.strokeStyle = element.border.color;
          ctx.lineWidth = element.border.width;
          ctx.strokeRect(element.x, element.y, element.w || element.size, element.h || element.size);
        }
      };

      await drawGraphic(canvasSettings.image, true);
      await drawGraphic(canvasSettings.qr);
      if (canvasSettings.logos) {
        for (const logo of canvasSettings.logos) await drawGraphic(logo);
      }

      if (adImg) {
        ctx.drawImage(adImg, 0, CANVAS_HEIGHT, CANVAS_WIDTH, adHeight);
      }

      return canvas.toDataURL('image/png');
    } finally {
      if (userImgBlobUrl && userImgBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(userImgBlobUrl);
      }
    }
  };

  const incrementUsage = async () => {
    if (!user?.id) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (profile?.display_name) {
        const data = JSON.parse(profile.display_name);
        data.usageCount = (data.usageCount || 0) + 1;
        await supabase
          .from('profiles')
          .update({ display_name: JSON.stringify(data) })
          .eq('user_id', user.id);

        const updatedUser = { ...user, usageCount: data.usageCount };
        setUser(updatedUser);
        localStorage.setItem("user_session", JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Failed to increment usage:", e);
    }
  };

  const checkAutomation = async () => {
    if (isAutoCheckingRef.current || !user) return;
    isAutoCheckingRef.current = true;
    addLog("Scanning feed for new posts...", "process");

    try {
      const feedUrls = [`${user.portalUrl}/feed/`];
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
            const censoredTitle = censorText(title, canvasSettings.sanitizer?.enabled, customMappings);
            const dataUrl = await generatePhotoCardInternal(censoredTitle, imageUrl, link);

            const newRecord: AutoRecord = {
              id: Math.random().toString(36).substring(2, 11),
              url: link,
              title: censoredTitle,
              imageUrl: imageUrl,
              previewUrl: dataUrl,
              timestamp: new Date().toISOString(),
              type: 'automation'
            };

            await saveRecord(newRecord);
            setAutoRecords(prev => [newRecord, ...prev]);
            setProcessedUrls(prev => {
              const next = new Set(prev);
              next.add(link);
              return next;
            });

            await incrementUsage();
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
      const censoredTitle = censorText(manualTitle, canvasSettings.sanitizer?.enabled, customMappings);
      const dataUrl = await generatePhotoCardInternal(censoredTitle, manualImage, manualQrUrl);
      setPreviewUrl(dataUrl);

      const newRecord: AutoRecord = {
        id: Math.random().toString(36).substring(2, 11),
        url: "",
        title: censoredTitle,
        imageUrl: manualImage,
        previewUrl: dataUrl,
        timestamp: new Date().toISOString(),
        type: 'manual'
      };
      await saveRecord(newRecord);
      setAutoRecords(prev => [newRecord, ...prev]);

      await incrementUsage();
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

    let domain = "";
    let targetDomain = "";
    try {
      domain = new URL(user.portalUrl.startsWith('http') ? user.portalUrl : `https://${user.portalUrl}`).hostname.replace('www.', '');
      targetDomain = new URL(semiAutoUrl.startsWith('http') ? semiAutoUrl : `https://${semiAutoUrl}`).hostname.replace('www.', '');
    } catch (e) {
      toast.error("Invalid URL format");
      return;
    }

    if (domain && targetDomain && domain !== targetDomain) {
      toast.error(`You can only generate photocards for ${domain}`);
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
        const censoredTitle = censorText(title, canvasSettings.sanitizer?.enabled, customMappings);
        const dataUrl = await generatePhotoCardInternal(censoredTitle, image, semiAutoUrl);
        setPreviewUrl(dataUrl);

        const newRecord: AutoRecord = {
          id: Math.random().toString(36).substring(2, 11),
          url: semiAutoUrl,
          title: censoredTitle,
          imageUrl: image,
          previewUrl: dataUrl,
          timestamp: new Date().toISOString(),
          type: 'semi-auto'
        };
        await saveRecord(newRecord);
        setAutoRecords(prev => [newRecord, ...prev]);

        await incrementUsage();
        playNotification();
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
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-[60]">
         <div className="flex items-center gap-2">
            <Zap className="text-primary w-6 h-6 fill-current" />
            <span className="font-bold text-lg tracking-tight">দ্রুতপোস্ট</span>
         </div>
         <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </Button>
      </div>

      {/* Sidebar / Mobile Menu Overlay */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b flex items-center gap-2">
          <Zap className="text-primary w-6 h-6 fill-current" />
          <span className="font-bold text-lg tracking-tight">দ্রুতপোস্ট</span>
        </div>

        <nav className="flex-1 p-4 pt-8 md:pt-4 space-y-2">
          <button
            onClick={() => { setActiveTab("manual"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "manual" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Plus className="w-4 h-4" />
            Manual Post
          </button>
          <button
            onClick={() => { setActiveTab("semi-auto"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "semi-auto" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
            Semi Auto
          </button>
          <button
            onClick={() => { setActiveTab("automation"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "automation" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Zap className="w-4 h-4" />
            Automation
          </button>
          <button
            onClick={() => { setActiveTab("templates"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "templates" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Layers className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            Strings
          </button>
        </nav>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.portalUrl || ""}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight capitalize font-viga">
            {activeTab === "settings" ? "Strings" : activeTab === "semi-auto" ? "Semi Auto" : activeTab.replace("-", " ")}
          </h1>
          <p className="text-muted-foreground">Manage your news portal photocards.</p>
        </header>

        <div className={cn("grid gap-10", (activeTab === "manual" || activeTab === "settings" || activeTab === "templates") ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
          <div className="space-y-8">
            {activeTab === "manual" && (
              <div className="space-y-10 animate-fade-in-up">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Template</Label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border bg-card text-sm"
                      value={activeTemplateId}
                      onChange={(e) => setActiveTemplateId(e.target.value)}
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Ad</Label>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase font-bold text-primary" onClick={() => setIsAdModalOpen(true)}>Manage</Button>
                         <input type="checkbox" checked={adsEnabled} onChange={(e) => setAdsEnabled(e.target.checked)} className="accent-primary w-3 h-3" />
                      </div>
                    </div>
                    <select
                      className="w-full h-10 px-3 rounded-xl border bg-card text-sm disabled:opacity-50"
                      value={activeAdId}
                      onChange={(e) => setActiveAdId(e.target.value)}
                      disabled={!adsEnabled}
                    >
                      <option value="">No Ad Selected</option>
                      {ads.map(ad => (
                        <option key={ad.id} value={ad.id}>{ad.name}</option>
                      ))}
                    </select>
                  </div>

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

                  {canvasSettings.qr?.enabled && (
                    <div className="space-y-2 animate-fade-in-up">
                      <Label htmlFor="manualQrUrl">QR Code URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="manualQrUrl"
                          placeholder="https://yournews.com/post-link"
                          value={manualQrUrl}
                          onChange={(e) => setManualQrUrl(e.target.value)}
                        />
                        <Button variant="outline" size="icon" onClick={async () => {
                          const text = await navigator.clipboard.readText();
                          setManualQrUrl(text);
                        }}>
                          <ClipboardPaste className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button className="w-full h-12 text-base font-bold" onClick={handleGenerateManual} disabled={isGenerating}>
                    {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    Generate Photocard
                  </Button>
                </div>

                {autoRecords.some(r => r.type === 'manual') && (
                  <div className="space-y-4 pt-8">
                    <h3 className="font-bold flex items-center gap-2">
                      <List className="w-4 h-4 text-primary" />
                      Recent Manual
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {autoRecords.filter(r => r.type === 'manual').map(record => (
                        <div key={record.id} className="bg-card border rounded-xl overflow-hidden group">
                          <div className="aspect-square relative overflow-hidden bg-muted">
                            <img src={record.previewUrl} alt={record.title} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid grid-cols-2 gap-2 p-2 place-items-center">
                              <Button variant="default" size="icon" className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white shadow-lg" title="Download" onClick={() => {
                                const link = document.createElement('a');
                                link.download = `${record.title}.png`;
                                link.href = record.previewUrl;
                                link.click();
                              }}>
                                <Download className="w-5 h-5" />
                              </Button>
                              <Button variant="default" size="icon" className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white shadow-lg" title="Delete" onClick={() => deleteRecord(record.id)}>
                                <Trash2 className="w-5 h-5" />
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

            {activeTab === "semi-auto" && (
              <div className="space-y-10 animate-fade-in-up">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Template</Label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border bg-card text-sm"
                      value={activeTemplateId}
                      onChange={(e) => setActiveTemplateId(e.target.value)}
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Ad</Label>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase font-bold text-primary" onClick={() => setIsAdModalOpen(true)}>Manage</Button>
                         <input type="checkbox" checked={adsEnabled} onChange={(e) => setAdsEnabled(e.target.checked)} className="accent-primary w-3 h-3" />
                      </div>
                    </div>
                    <select
                      className="w-full h-10 px-3 rounded-xl border bg-card text-sm disabled:opacity-50"
                      value={activeAdId}
                      onChange={(e) => setActiveAdId(e.target.value)}
                      disabled={!adsEnabled}
                    >
                      <option value="">No Ad Selected</option>
                      {ads.map(ad => (
                        <option key={ad.id} value={ad.id}>{ad.name}</option>
                      ))}
                    </select>
                  </div>

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

                {autoRecords.some(r => r.type === 'semi-auto') && (
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <List className="w-4 h-4 text-primary" />
                      Recent Semi-Auto
                    </h3>
                  <div className="grid grid-cols-2 gap-4">
                      {autoRecords.filter(r => r.type === 'semi-auto').map(record => (
                        <div key={record.id} className="bg-card border rounded-xl overflow-hidden group">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                            <img src={record.previewUrl} alt={record.title} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid grid-cols-2 gap-2 p-2 place-items-center">
                            <Button variant="default" size="icon" className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white shadow-lg" title="Download" onClick={() => {
                                const link = document.createElement('a');
                                link.download = `${record.title}.png`;
                                link.href = record.previewUrl;
                                link.click();
                              }}>
                              <Download className="w-5 h-5" />
                              </Button>
                            <Button variant="secondary" size="icon" className="w-10 h-10 shadow-lg" title="Open URL" onClick={() => window.open(record.url, '_blank')}>
                              <ExternalLink className="w-5 h-5" />
                              </Button>
                            <Button variant="secondary" size="icon" className="w-10 h-10 shadow-lg" title="Copy URL" onClick={() => {
                                navigator.clipboard.writeText(record.url);
                                toast.success("URL copied!");
                              }}>
                              <Copy className="w-5 h-5" />
                              </Button>
                            <Button variant="default" size="icon" className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white shadow-lg" title="Delete" onClick={() => deleteRecord(record.id)}>
                              <Trash2 className="w-5 h-5" />
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

            {activeTab === "automation" && (
              <div className="space-y-10 animate-fade-in-up">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Template</Label>
                    <select
                      className="w-full h-10 px-3 rounded-xl border bg-card text-sm"
                      value={activeTemplateId}
                      onChange={(e) => setActiveTemplateId(e.target.value)}
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Ad</Label>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase font-bold text-primary" onClick={() => setIsAdModalOpen(true)}>Manage</Button>
                         <input type="checkbox" checked={adsEnabled} onChange={(e) => setAdsEnabled(e.target.checked)} className="accent-primary w-3 h-3" />
                      </div>
                    </div>
                    <select
                      className="w-full h-10 px-3 rounded-xl border bg-card text-sm disabled:opacity-50"
                      value={activeAdId}
                      onChange={(e) => setActiveAdId(e.target.value)}
                      disabled={!adsEnabled}
                    >
                      <option value="">No Ad Selected</option>
                      {ads.map(ad => (
                        <option key={ad.id} value={ad.id}>{ad.name}</option>
                      ))}
                    </select>
                  </div>

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
                      {autoRecords.filter(r => r.type === 'automation').map(record => (
                        <div key={record.id} className="bg-card border rounded-xl overflow-hidden group">
                          <div className="aspect-square relative overflow-hidden bg-muted">
                            <img src={record.previewUrl} alt={record.title} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid grid-cols-2 gap-2 p-2 place-items-center">
                              <Button variant="default" size="icon" className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white shadow-lg" title="Download" onClick={() => {
                                const link = document.createElement('a');
                                link.download = `${record.title}.png`;
                                link.href = record.previewUrl;
                                link.click();
                              }}>
                                <Download className="w-5 h-5" />
                              </Button>
                              <Button variant="secondary" size="icon" className="w-10 h-10 shadow-lg" title="Open URL" onClick={() => window.open(record.url, '_blank')}>
                                <ExternalLink className="w-5 h-5" />
                              </Button>
                              <Button variant="secondary" size="icon" className="w-10 h-10 shadow-lg" title="Copy URL" onClick={() => {
                                navigator.clipboard.writeText(record.url);
                                toast.success("URL copied!");
                              }}>
                                <Copy className="w-5 h-5" />
                              </Button>
                              <Button variant="default" size="icon" className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white shadow-lg" title="Delete" onClick={() => deleteRecord(record.id)}>
                                <Trash2 className="w-5 h-5" />
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

            {activeTab === "templates" && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        navigate(`/Edit-Template/${template.id}`);
                      }}
                      className={cn(
                        "relative aspect-square rounded-xl border-2 overflow-hidden transition-all group",
                        activeTemplateId === template.id ? "border-primary ring-2 ring-primary/20" : "border-muted hover:border-primary/50"
                      )}
                    >
                      <img src={template.backgroundImage} alt={template.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                        <span className="text-white font-bold text-[10px] sm:text-xs line-clamp-2">{template.name}</span>
                      </div>
                      {templates.length > 1 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete template?")) {
                              const next = templates.filter(t => t.id !== template.id);
                              setTemplates(next);
                              if (activeTemplateId === template.id) {
                                setActiveTemplateId(next[0].id);
                                setIsEditingTemplate(false);
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setTempTemplateName("");
                      setTemplateModalMode('add');
                      setIsTemplateModalOpen(true);
                    }}
                    className="aspect-square rounded-xl border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-all text-muted-foreground hover:text-primary"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="font-bold text-xs">New Template</span>
                  </button>
                </div>

              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-12 animate-fade-in-up">
                {/* Sanitizer Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Text Sanitizer
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsSanitizerModalOpen(true)}>
                        Manage Words
                      </Button>
                      <input
                        type="checkbox"
                        className="accent-primary w-5 h-5"
                        checked={canvasSettings.sanitizer?.enabled}
                        onChange={(e) => setCanvasSettings({
                          ...canvasSettings,
                          sanitizer: { enabled: e.target.checked }
                        })}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Automatically sanitize sensitive words in generated photocards.</p>
                </div>

                {/* Notification Settings */}
                <div className="space-y-6">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-primary" />
                    Notification Sound
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Alert (Default)', file: '/Alert.mp3' },
                      { name: 'Instant', file: '/Instant.mp3' },
                      { name: 'Loud', file: '/Loud.mp3' }
                    ].map((audio) => (
                      <div key={audio.file} className="flex flex-col gap-3 p-4 rounded-3xl bg-muted/20 border-2 border-transparent hover:border-primary/20 transition-all">
                        <span className="font-bold text-sm">{audio.name}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 bg-background rounded-full shadow-sm" onClick={() => playNotification(audio.file)}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedAudio === audio.file ? "default" : "outline"}
                            size="sm"
                            className="flex-1 rounded-full text-xs h-10"
                            onClick={() => saveAudioSetting(audio.file)}
                          >
                            {selectedAudio === audio.file ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {activeTab === "manual" && (
            <div className="space-y-6 lg:sticky lg:top-10 h-fit">
              {(manualTitle || manualImage) && (
                <div className="bg-card border-2 border-dashed rounded-3xl aspect-square flex items-center justify-center overflow-hidden shadow-inner relative group">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Button variant="secondary" size="sm" onClick={() => {
                          const link = document.createElement('a');
                          link.download = `${manualTitle || "photocard"}.png`;
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
              )}
            </div>
          )}
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="hidden" />
        </div>
      </main>

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                <h2 className="text-xl font-bold">{templateModalMode === 'add' ? 'Add New Template' : 'Rename Template'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsTemplateModalOpen(false)} className="rounded-full">
                   <X className="w-5 h-5" />
                </Button>
             </div>
             <div className="p-6 space-y-4">
                <div className="space-y-2">
                   <Label>Template Name</Label>
                   <Input
                     autoFocus
                     placeholder="e.g. Breaking News"
                     value={tempTemplateName}
                     onChange={(e) => setTempTemplateName(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const btn = document.getElementById('saveTemplateBtn');
                            if (btn) btn.click();
                        }
                     }}
                   />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                   <Button variant="ghost" onClick={() => setIsTemplateModalOpen(false)}>Cancel</Button>
                   <Button id="saveTemplateBtn" onClick={() => {
                      if (!tempTemplateName.trim()) {
                        toast.error("Name cannot be empty");
                        return;
                      }
                      const isDuplicate = templates.some(t => t.name.toLowerCase() === tempTemplateName.trim().toLowerCase() && (templateModalMode === 'add' || t.id !== activeTemplateId));
                      if (isDuplicate) {
                        toast.error("A template with this name already exists");
                        return;
                      }

                      if (templateModalMode === 'add') {
                        const newId = Math.random().toString(36).substring(2, 11);
                        const newTemplate = {
                          ...templates[0],
                          id: newId,
                          name: tempTemplateName.trim(),
                        };
                        setTemplates([...templates, newTemplate]);
                        setActiveTemplateId(newId);
                        setIsEditingTemplate(true);
                        toast.success("Template added");
                      } else {
                        setCanvasSettings({ ...canvasSettings, name: tempTemplateName.trim() });
                        toast.success("Template renamed");
                      }
                      setIsTemplateModalOpen(false);
                   }}>
                      {templateModalMode === 'add' ? 'Create Template' : 'Save Changes'}
                   </Button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Ad Management Modal */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                <h2 className="text-xl font-bold">Manage Ads</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsAdModalOpen(false)} className="rounded-full">
                   <X className="w-5 h-5" />
                </Button>
             </div>
             <div className="p-6 space-y-4">
                <div className="space-y-2">
                   <Label>Ad Name</Label>
                   <Input
                     placeholder="e.g. Summer Sale"
                     value={newAdName}
                     onChange={(e) => setNewAdName(e.target.value)}
                   />
                </div>
                <div className="space-y-2">
                   <Label>Ad Image</Label>
                   <div className="flex gap-2">
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={() => adFileInputRef.current?.click()}>
                        <Upload className="w-4 h-4" />
                        Upload Ad Image
                      </Button>
                      <input
                        type="file"
                        ref={adFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && newAdName.trim()) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const newAd = {
                                id: Math.random().toString(36).substring(2, 11),
                                name: newAdName.trim(),
                                dataUrl: reader.result as string
                              };
                              setAds([...ads, newAd]);
                              setNewAdName("");
                              if (e.target) e.target.value = '';
                              toast.success("Ad uploaded!");
                            };
                            reader.readAsDataURL(file);
                          } else if (!newAdName.trim()) {
                            if (e.target) e.target.value = '';
                            toast.error("Please enter ad name first");
                          }
                        }}
                      />
                   </div>
                </div>

                <div className="pt-4 border-t space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                   <Label className="text-[10px] uppercase font-bold text-muted-foreground">Existing Ads</Label>
                   {ads.length === 0 && <p className="text-xs text-muted-foreground italic">No ads uploaded yet.</p>}
                   {ads.map(ad => (
                     <div key={ad.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border">
                        <div className="flex items-center gap-3">
                           <img src={ad.dataUrl} className="w-10 h-10 object-cover rounded-lg border" alt="" />
                           <span className="text-sm font-medium">{ad.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => {
                          setAds(ads.filter(a => a.id !== ad.id));
                          if (activeAdId === ad.id) setActiveAdId("");
                          toast.success("Ad deleted");
                        }}>
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Sanitizer Modal */}
      {isSanitizerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Text Sanitizer Manager</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSanitizerModalOpen(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
              {/* Add New Word Form */}
              <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 space-y-2 w-full">
                  <Label className="text-[10px] uppercase font-bold">Base Word</Label>
                  <Input
                    placeholder="e.g. হত্যা"
                    className="h-10 rounded-xl"
                    value={newBaseWord}
                    onChange={(e) => setNewBaseWord(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <Label className="text-[10px] uppercase font-bold">Sanitized Version</Label>
                  <Input
                    placeholder="e.g. হ*ত্যা"
                    className="h-10 rounded-xl"
                    value={newSanitizedWord}
                    onChange={(e) => setNewSanitizedWord(e.target.value)}
                  />
                </div>
                <Button className="h-10 px-6 rounded-xl" onClick={() => {
                  if (!newBaseWord || !newSanitizedWord) {
                    toast.error("Both fields are required");
                    return;
                  }
                  setCustomMappings(prev => ({ ...prev, [newBaseWord]: newSanitizedWord }));
                  setNewBaseWord("");
                  setNewSanitizedWord("");
                  toast.success("Word added to sanitizer");
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Word
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search words..."
                  className="pl-10"
                  value={sanitizerSearch}
                  onChange={(e) => setSanitizerSearch(e.target.value)}
                />
              </div>

              {/* Word List */}
              <div className="space-y-2">
                {Object.entries({ ...baseMappings, ...customMappings })
                  .filter(([base, sanitized]) =>
                    base.toLowerCase().includes(sanitizerSearch.toLowerCase()) ||
                    sanitized.toLowerCase().includes(sanitizerSearch.toLowerCase())
                  )
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([base, sanitized]) => {
                    const isSystem = base in baseMappings && !(base in customMappings);
                    return (
                      <div key={base} className="flex items-center justify-between p-4 rounded-xl bg-card border hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">Base</p>
                              {isSystem && <span className="text-[8px] bg-muted px-1 rounded text-muted-foreground">SYSTEM</span>}
                            </div>
                            <p className="font-medium">{base}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30" />
                          <div className="flex-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Sanitized</p>
                            <p className="font-medium text-primary">{sanitized}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            setNewBaseWord(base);
                            setNewSanitizedWord(sanitized);
                            if (base in customMappings) {
                              setCustomMappings(prev => {
                                const next = { ...prev };
                                delete next[base];
                                return next;
                              });
                            }
                          }} title="Edit/Override">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={isSystem}
                            onClick={() => {
                              setCustomMappings(prev => {
                                const next = { ...prev };
                                delete next[base];
                                return next;
                              });
                              toast.success("Word removed");
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
