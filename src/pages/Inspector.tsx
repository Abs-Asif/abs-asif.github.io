import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Settings2,
  Database,
  FileJson,
  Play,
  Calendar,
  Layers,
  Hash,
  Copy,
  CheckCircle2,
  Info,
  Code2,
  BookOpen,
  Filter,
  Globe,
  Layout,
  Smartphone,
  Eye,
  Images,
  Zap,
  Terminal,
  FileCode,
  ArrowRightLeft,
  Settings,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BGArchiveItem {
  ContentID: number;
  CategoryID: number;
  CategoryName: string;
  Slug: string;
  ContentHeading: string;
  ContentBrief: string;
  ImageThumbPath: string;
  ImageSmPath: string;
  ImageBgPath: string;
  URLAlies: string;
  VideoID: string | null;
  VideoPath: string | null;
  VideoType: string | null;
  VideoSource: string | null;
  create_date: string;
  updated_date: string | null;
}

interface QueryParams {
  start_date: string;
  end_date: string;
  category_name: number | "";
  limit: number;
  offset: number;
  // Experimental/Audited params
  ContentID?: number | "";
  q?: string;
}

const SOURCES = [
  {
    id: "bg",
    name: "Bangladesh Guardian",
    api: "https://backoffice.bangladeshguardian.com/api-en/archive",
    site: "https://bangladeshguardian.com",
    media: "https://backoffice.bangladeshguardian.com/media/imgAll/"
  },
  {
    id: "db",
    name: "Daily Bangladesh",
    api: "https://backoffice.daily-bangladesh.com/api-en/archive",
    site: "https://daily-bangladesh.com",
    media: "https://backoffice.daily-bangladesh.com/media/imgAll/"
  }
];

const CATEGORIES = [
  { id: 1, name: "National" },
  { id: 2, name: "Country" },
  { id: 3, name: "Politics" },
  { id: 4, name: "Law & Court" },
  { id: 5, name: "International" },
  { id: 6, name: "Economy" },
  { id: 7, name: "Sports" },
  { id: 8, name: "Education" },
  { id: 9, name: "Entertainment" },
  { id: 10, name: "Health & Lifestyle" },
  { id: 11, name: "Science & IT" },
  { id: 12, name: "Religion" },
  { id: 13, name: "Cyber Space" },
  { id: 14, name: "Feature" },
  { id: 15, name: "Special Report" },
  { id: 17, name: "Coronavirus" },
  { id: 18, name: "ICC World Cup" },
];

const FIELD_DEFS: { field: keyof BGArchiveItem; type: string; desc: string }[] = [
  { field: "ContentID", type: "Int", desc: "Unique global identifier for the article." },
  { field: "CategoryID", type: "Int", desc: "Internal ID for news classification." },
  { field: "CategoryName", type: "String", desc: "Human-readable category label." },
  { field: "Slug", type: "String", desc: "Category URL slug." },
  { field: "ContentHeading", type: "String", desc: "Primary title of the news content." },
  { field: "ContentBrief", type: "String", desc: "Short summary or lead paragraph text." },
  { field: "ImageThumbPath", type: "String", desc: "Path to smallest thumbnail image." },
  { field: "ImageSmPath", type: "String", desc: "Path to medium-sized thumbnail." },
  { field: "ImageBgPath", type: "String", desc: "Path to full-sized hero image." },
  { field: "URLAlies", type: "String", desc: "SEO-optimized article URL slug." },
  { field: "VideoID", type: "String?", desc: "External video ID (e.g. YouTube ID)." },
  { field: "VideoPath", type: "String?", desc: "Relative path to local video file." },
  { field: "VideoType", type: "String?", desc: "Type of video provider/format." },
  { field: "VideoSource", type: "String?", desc: "Original source of the video content." },
  { field: "create_date", type: "String", desc: "Creation timestamp (human readable)." },
  { field: "updated_date", type: "String?", desc: "Last modification timestamp." },
];

const PRESETS = [
  {
    name: "Latest Headlines",
    params: { start_date: "", end_date: "", category_name: "", limit: 10, offset: 0 }
  },
  {
    name: "National News",
    params: { start_date: "", end_date: "", category_name: 1, limit: 12, offset: 0 }
  },
  {
    name: "Sports Highlights",
    params: { start_date: "", end_date: "", category_name: 7, limit: 8, offset: 0 }
  },
  {
    name: "Tech & Science",
    params: { start_date: "", end_date: "", category_name: 11, limit: 6, offset: 0 }
  }
];

const Inspector = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState(SOURCES[0]);
  const [params, setParams] = useState<QueryParams>({
    start_date: "",
    end_date: "",
    category_name: "",
    limit: 10,
    offset: 0,
    ContentID: "",
    q: ""
  });

  // UI States
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [results, setResults] = useState<BGArchiveItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "json">("results");
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.field]: true }), {})
  );

  const toggleField = (field: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Advanced Settings
  const [compareImages, setCompareImages] = useState(false);
  const [showPayload, setShowPayload] = useState(true);
  const [autoFetch, setAutoFetch] = useState(false);
  const [jsonIndent, setJsonIndent] = useState(2);
  const [experimentalMode, setExperimentalMode] = useState(false);

  const fetchData = async (overrideParams?: QueryParams) => {
    const queryParams = overrideParams || params;

    // Clean payload for API (remove empty experimental params if not used)
    const payload: any = {
      start_date: queryParams.start_date,
      end_date: queryParams.end_date,
      category_name: queryParams.category_name,
      limit: queryParams.limit,
      offset: queryParams.offset,
    };

    if (queryParams.ContentID) payload.ContentID = queryParams.ContentID;
    if (queryParams.q) payload.q = queryParams.q;

    setIsLoading(true);
    setError(null);
    setRawResponse(null);

    try {
      const response = await fetch(source.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setRawResponse(data);

      if (response.ok) {
        if (data.archive_data) {
          setResults(data.archive_data);
          toast.success(`Fetched ${data.archive_data.length} items from ${source.name}`);
        } else if (data.category_name) {
          setError(`API Error: ${data.category_name[0]}`);
          setResults(null);
        } else {
          setResults([]);
        }
      } else {
        setError(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError("Failed to connect to backend. Check CORS or network status.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      const timer = setTimeout(() => fetchData(), 1000);
      return () => clearTimeout(timer);
    }
  }, [params, source, autoFetch]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getPayloadString = () => {
    const p: any = { ...params };
    if (!p.ContentID) delete p.ContentID;
    if (!p.q) delete p.q;
    return JSON.stringify(p, null, jsonIndent);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-primary/20 select-text">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 rounded-xl hover:bg-slate-100 transition-all text-slate-500 hover:text-primary active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Terminal size={20} className="text-primary" />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Inspector <span className="text-primary font-normal lowercase opacity-40">/ engine</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6 px-4 py-2 bg-slate-100 rounded-full border border-slate-200/50">
               <div className="flex items-center gap-2">
                 <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-amber-500" : "bg-emerald-500")} />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isLoading ? "Processing" : "Idle_Online"}</span>
               </div>
               <div className="h-4 w-px bg-slate-300/50" />
               <div className="flex items-center gap-2">
                 <ShieldCheck size={12} className="text-primary" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v2.0_Stable</span>
               </div>
            </div>

            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              <span>Execute</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Source Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           {SOURCES.map(s => (
             <button
               key={s.id}
               onClick={() => {
                 setSource(s);
                 setResults(null);
               }}
               className={cn(
                 "relative overflow-hidden group p-5 rounded-2xl border-2 transition-all text-left",
                 source.id === s.id
                   ? "bg-white border-primary shadow-xl shadow-primary/5"
                   : "bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white"
               )}
             >
               <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                     source.id === s.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                   )}>
                     <Globe size={24} />
                   </div>
                   <div>
                     <h3 className={cn("font-bold text-sm uppercase tracking-tight", source.id === s.id ? "text-slate-900" : "text-slate-500")}>{s.name}</h3>
                     <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[200px]">{s.api}</p>
                   </div>
                 </div>
                 {source.id === s.id && <CheckCircle2 className="text-primary" size={24} />}
               </div>
               {source.id === s.id && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />}
             </button>
           ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Controls Sidebar */}
          <aside className="lg:w-[380px] space-y-6 shrink-0">
            {/* Main Config */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Settings size={14} /> Basic Params
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Category Focus</label>
                  <select
                    value={showCustomCategory ? "999" : params.category_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "999") {
                        setShowCustomCategory(true);
                      } else {
                        setShowCustomCategory(false);
                        setParams({ ...params, category_name: val ? parseInt(val) : "" });
                      }
                    }}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Fetch All Content</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="999">Manually defined ID...</option>
                  </select>
                  {showCustomCategory && (
                    <input
                      type="number"
                      placeholder="Input custom CategoryID..."
                      value={params.category_name}
                      onChange={(e) => setParams({ ...params, category_name: e.target.value ? parseInt(e.target.value) : "" })}
                      className="w-full mt-2 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Buffer Limit</label>
                    <input
                      type="number"
                      value={params.limit}
                      onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) || 0 })}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Data Offset</label>
                    <input
                      type="number"
                      value={params.offset}
                      onChange={(e) => setParams({ ...params, offset: parseInt(e.target.value) || 0 })}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Start Window</label>
                    <input
                      type="date"
                      value={params.start_date}
                      onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">End Window</label>
                    <input
                      type="date"
                      value={params.end_date}
                      onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Experimental/Audit Params */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
               <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Cpu size={14} className="text-amber-500" /> Experimental Logic
                  </h3>
                  <div
                    onClick={() => setExperimentalMode(!experimentalMode)}
                    className={cn(
                      "w-8 h-4 rounded-full relative transition-colors cursor-pointer",
                      experimentalMode ? "bg-amber-500" : "bg-slate-700"
                    )}
                  >
                    <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", experimentalMode ? "left-4.5" : "left-0.5")} />
                  </div>
               </div>
               <div className={cn("p-6 space-y-5 transition-all", !experimentalMode && "opacity-20 pointer-events-none grayscale")}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Pull by Content ID</label>
                    <div className="relative">
                      <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input
                        type="number"
                        placeholder="Search specific ID..."
                        value={params.ContentID}
                        onChange={(e) => setParams({ ...params, ContentID: e.target.value ? parseInt(e.target.value) : "" })}
                        className="w-full h-11 rounded-xl border border-slate-800 bg-slate-950 px-10 text-sm font-mono text-amber-500 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Experimental Query (q)</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input
                        type="text"
                        placeholder="Global search..."
                        value={params.q}
                        onChange={(e) => setParams({ ...params, q: e.target.value })}
                        className="w-full h-11 rounded-xl border border-slate-800 bg-slate-950 px-10 text-sm font-mono text-amber-500 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* Settings Toggles */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
               <button
                 onClick={() => setCompareImages(!compareImages)}
                 className={cn(
                   "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                   compareImages ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-600"
                 )}
               >
                 <div className="flex items-center gap-3">
                   <Images size={16} />
                   <span className="text-xs font-bold uppercase tracking-tight">Image Comparison Mode</span>
                 </div>
                 {compareImages && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
               </button>

               <button
                 onClick={() => setAutoFetch(!autoFetch)}
                 className={cn(
                   "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                   autoFetch ? "bg-amber-100 text-amber-700" : "hover:bg-slate-50 text-slate-600"
                 )}
               >
                 <div className="flex items-center gap-3">
                   <Zap size={16} />
                   <span className="text-xs font-bold uppercase tracking-tight">Auto-Execute on Change</span>
                 </div>
                 {autoFetch && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
               </button>

               <button
                 onClick={() => setShowPayload(!showPayload)}
                 className={cn(
                   "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                   showPayload ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-600"
                 )}
               >
                 <div className="flex items-center gap-3">
                   <FileCode size={16} />
                   <span className="text-xs font-bold uppercase tracking-tight">Show Payload Preview</span>
                 </div>
                 <Eye size={16} className={showPayload ? "opacity-100" : "opacity-20"} />
               </button>

               <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Layer</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FIELD_DEFS.map(f => (
                      <button
                        key={f.field}
                        onClick={() => toggleField(f.field)}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold border transition-all rounded-md",
                          visibleFields[f.field]
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-slate-400 border-slate-200 line-through opacity-60"
                        )}
                      >
                        {f.field}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3">
               {PRESETS.map((preset, idx) => (
                 <button
                   key={idx}
                   onClick={() => {
                     setParams({ ...params, ...preset.params });
                     setShowCustomCategory(false);
                     fetchData({ ...params, ...preset.params });
                   }}
                   className="p-3 rounded-xl bg-white border border-slate-200 text-left hover:border-primary hover:shadow-md transition-all group"
                 >
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-primary mb-1">Preset {idx + 1}</p>
                   <p className="text-[11px] font-bold text-slate-700 line-clamp-1">{preset.name}</p>
                 </button>
               ))}
            </div>
          </aside>

          {/* Main Workspace */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Payload Preview */}
            {showPayload && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative group">
                <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <FileJson size={14} className="text-emerald-500" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Request_Payload_Manifest</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <select
                        value={jsonIndent}
                        onChange={(e) => setJsonIndent(parseInt(e.target.value))}
                        className="bg-transparent text-[10px] font-bold text-slate-500 outline-none cursor-pointer"
                      >
                        <option value={0}>Minified</option>
                        <option value={2}>Standard</option>
                        <option value={4}>Expanded</option>
                      </select>
                      <button
                        onClick={() => copyToClipboard(getPayloadString())}
                        className="p-1 text-slate-500 hover:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                   </div>
                </div>
                <pre className="p-6 text-emerald-400 text-xs font-mono leading-relaxed overflow-x-auto max-h-48 scrollbar-hide">
                  {getPayloadString()}
                </pre>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col min-h-[700px] overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                <button
                  onClick={() => setActiveTab("results")}
                  className={cn(
                    "px-8 py-5 text-xs font-black uppercase tracking-widest transition-all relative",
                    activeTab === "results" ? "text-primary bg-white shadow-[inset_0_-2px_0_0_#22c55e]" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Layout size={14} />
                    Engine View
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={cn(
                    "px-8 py-5 text-xs font-black uppercase tracking-widest transition-all relative",
                    activeTab === "json" ? "text-primary bg-white shadow-[inset_0_-2px_0_0_#22c55e]" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileCode size={14} />
                    Raw JSON
                  </div>
                </button>
              </div>

              <div className="flex-1 p-8">
                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center py-32">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-100 rounded-full" />
                      <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin absolute top-0" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-8">Interrogating Database...</p>
                  </div>
                )}

                {error && !isLoading && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                      <AlertCircle className="text-red-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-red-900 uppercase tracking-tight">Operational Failure</h4>
                      <p className="text-sm text-red-700/80 mt-1 font-medium leading-relaxed">{error}</p>
                      <button
                        onClick={() => fetchData()}
                        className="mt-4 text-xs font-bold text-red-700 underline underline-offset-4 hover:text-red-900 transition-colors"
                      >
                        Attempt reconnection_
                      </button>
                    </div>
                  </div>
                )}

                {!isLoading && activeTab === "results" && results && (
                  <div className="space-y-8">
                    {results.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                        <Database size={64} className="mb-6 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">Zero entries detected for this segment</p>
                      </div>
                    ) : (
                      <div className={cn("grid gap-8", compareImages ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                        {results.map((item) => (
                          <div key={item.ContentID} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group flex flex-col">
                            {compareImages ? (
                               <div className="p-6 bg-slate-50 border-b border-slate-200">
                                  <div className="flex items-center justify-between mb-6">
                                     <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate max-w-[400px]">{item.ContentHeading}</h4>
                                     <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500">ID: {item.ContentID}</span>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                     {[
                                       { label: "THUMB_PATH", path: item.ImageThumbPath },
                                       { label: "SM_PATH", path: item.ImageSmPath },
                                       { label: "BG_PATH", path: item.ImageBgPath }
                                     ].map((img, i) => (
                                       <div key={i} className="space-y-3">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{img.label}</span>
                                            <button onClick={() => copyToClipboard(img.path)} className="p-1 hover:text-primary transition-colors"><Copy size={12} /></button>
                                          </div>
                                          <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group/img">
                                            <img
                                              src={`${source.media}${img.path}`}
                                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                                              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x225?text=Invalid+Asset")}
                                            />
                                          </div>
                                          <p className="text-[10px] font-mono text-slate-500 truncate">{img.path}</p>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            ) : (
                              <>
                                <div className="aspect-video bg-slate-100 relative overflow-hidden group">
                                  <img
                                    src={`${source.media}${item.ImageBgPath}`}
                                    alt={item.ContentHeading}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x225?text=Image+Not+Found")}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                  <div className="absolute top-4 left-4 flex gap-2">
                                     <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                                       {item.CategoryName}
                                     </div>
                                  </div>
                                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                     <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight">
                                       {item.ContentHeading}
                                     </h4>
                                  </div>
                                </div>

                                <div className="p-6 flex-1 space-y-6">
                                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                                    {item.ContentBrief}
                                  </p>

                                  <div className="pt-6 border-t border-slate-100 grid grid-cols-1 gap-2.5">
                                    {FIELD_DEFS.filter(f => !["ImageBgPath", "ContentHeading", "ContentBrief", "CategoryName", "ImageThumbPath", "ImageSmPath"].includes(f.field) && visibleFields[f.field]).map(f => (
                                      <div key={f.field} className="flex items-center justify-between gap-4 py-1 group/field">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter shrink-0 transition-colors group-hover/field:text-primary">{f.field}</span>
                                        <span className="text-[10px] font-mono text-slate-600 truncate max-w-[200px] text-right bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                          {item[f.field] === null ? "null" : String(item[f.field])}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                              <div className="flex items-center gap-3">
                                 <Calendar size={14} className="text-slate-400" />
                                 <span className="text-[10px] font-bold text-slate-400 tracking-tight">{item.create_date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`${source.site}/${item.Slug}/${item.ContentID}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-primary/20 transition-all shadow-sm active:scale-90"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isLoading && activeTab === "json" && (
                  <div className="relative group">
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button
                         onClick={() => setJsonIndent(jsonIndent === 2 ? 0 : 2)}
                         className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                       >
                         {jsonIndent === 2 ? "Minify" : "Expand"}
                       </button>
                       <button
                         onClick={() => copyToClipboard(JSON.stringify(rawResponse, null, jsonIndent))}
                         className="p-2 bg-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                       >
                         <Copy size={14} />
                         Copy_Manifest
                       </button>
                    </div>
                    <pre className="bg-slate-900 text-emerald-400 p-8 rounded-2xl overflow-auto max-h-[750px] text-[11px] font-mono leading-relaxed border border-slate-800 shadow-2xl">
                      {rawResponse ? JSON.stringify(rawResponse, null, jsonIndent) : "// No data available in stream"}
                    </pre>
                  </div>
                )}

                {!isLoading && !results && !error && (
                  <div className="h-full flex flex-col items-center justify-center py-40 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                      <Cpu size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System_Ready</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-3 font-medium leading-relaxed italic">
                      "Adjust parameters in the left command console and initiate the sequence to fetch live archives."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Optimized Documentation Section */}
        <section className="mt-20 pt-20 border-t border-slate-200">
          <div className="max-w-[1200px] mx-auto space-y-16">
            <div className="text-center">
               <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                 <ShieldCheck size={16} /> Technical Documentation
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Protocol Engineering Handbook</h2>
               <p className="text-slate-500 mt-4 text-lg font-medium">Standard Operating Procedures for Interacting with News Archives.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
               {/* Left Column: Specs */}
               <div className="lg:col-span-7 space-y-12">
                  <div className="space-y-6">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Database size={18} className="text-primary" /> Response Schema Definition
                     </h3>
                     <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-200">
                                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Field_Key</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data_Type</th>
                                 <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {FIELD_DEFS.map(f => (
                                 <tr key={f.field} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-[11px] font-mono font-bold text-slate-900">{f.field}</td>
                                    <td className="px-6 py-4">
                                       <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">{f.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-slate-500 font-medium leading-relaxed">{f.desc}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>

               {/* Right Column: Implementation */}
               <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-6">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Code2 size={18} className="text-primary" /> Node_Fetch Pattern
                     </h3>
                     <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                        <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                           <span className="text-[10px] font-bold text-slate-500">fetch_v1.js</span>
                           <Copy size={12} className="text-slate-500" />
                        </div>
                        <pre className="p-6 text-emerald-400 text-[11px] font-mono leading-relaxed">
{`const syncArchive = async () => {
  const req = await fetch('ARCHIVE_API', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      limit: 10,
      offset: 0,
      category_name: 1
    })
  });

  const { archive_data } = await req.json();
  return archive_data.map(item => ({
    id: item.ContentID,
    img: MEDIA_BASE + item.ImageBgPath
  }));
};`}
                        </pre>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-6">
                     <h4 className="text-xs font-black text-white uppercase tracking-widest">Infrastructure Notes</h4>
                     <ul className="space-y-4">
                        {[
                          "Both BG and DB share identical JSON schemas.",
                          "Experimental 'q' param handles keyword scanning.",
                          "Images must be prefixed with media server URL.",
                          "Categories are strictly integer-based.",
                          "Timestamps are pre-formatted for display."
                        ].map((note, i) => (
                           <li key={i} className="flex gap-4 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span className="text-xs text-slate-400 font-medium leading-relaxed">{note}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-3xl p-12 border-2 border-slate-900 shadow-[8px_8px_0_0_#0f172a] text-center">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Audit Protocol Terminated</h3>
               <p className="text-slate-500 max-w-lg mx-auto mt-4 font-medium leading-relaxed">
                 Operational capability confirmed for multiple news segments. Engine is optimized for rapid forensic inspection and data extraction.
               </p>
               <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary transition-all active:scale-95">Restart_Sequence</button>
                  <button onClick={() => navigate('/')} className="px-8 py-3 bg-white border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all active:scale-95">Exit_Module</button>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inspector;
