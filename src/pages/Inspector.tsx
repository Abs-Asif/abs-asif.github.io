import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Database,
  FileJson,
  Play,
  Calendar,
  Layers,
  Hash,
  Copy,
  CheckCircle2,
  Code2,
  Globe,
  Layout,
  Eye,
  Images,
  Zap,
  Terminal,
  FileCode,
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
  ContentID?: number | "";
  q?: string;
}

const SOURCES = [
  {
    id: "bg",
    name: "BG English",
    api: "https://backoffice.bangladeshguardian.com/api-en/archive",
    site: "https://bangladeshguardian.com",
    media: "https://backoffice.bangladeshguardian.com/media/imgAll/"
  },
  {
    id: "bg-bn",
    name: "BG Bangla",
    api: "https://backoffice.bangladeshguardian.com/api/archive",
    site: "https://bangladeshguardian.com",
    media: "https://backoffice.bangladeshguardian.com/media/imgAll/"
  },
  {
    id: "db",
    name: "Daily Bangladesh",
    api: "https://backoffice.daily-bangladesh.com/api/archive",
    site: "https://daily-bangladesh.com",
    media: "https://backoffice.daily-bangladesh.com/media/imgAll/"
  },
  {
    id: "c24",
    name: "Channel24",
    api: "https://backoffice.channel24bd.tv/api/archive",
    site: "https://www.channel24bd.tv",
    media: "https://backoffice.channel24bd.tv/media/imgAll/"
  }
];

const CATEGORIES = [
  { id: 1, name: "National" }, { id: 2, name: "Country" }, { id: 3, name: "Politics" },
  { id: 4, name: "Law & Court" }, { id: 5, name: "International" }, { id: 6, name: "Economy" },
  { id: 7, name: "Sports" }, { id: 8, name: "Education" }, { id: 9, name: "Entertainment" },
  { id: 10, name: "Health & Lifestyle" }, { id: 11, name: "Science & IT" }, { id: 12, name: "Religion" },
  { id: 13, name: "Cyber Space" }, { id: 14, name: "Feature" }, { id: 15, name: "Special Report" },
  { id: 17, name: "Coronavirus" }, { id: 18, name: "ICC World Cup" },
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
  { name: "Headlines", params: { start_date: "", end_date: "", category_name: "", limit: 10, offset: 0 } },
  { name: "National", params: { start_date: "", end_date: "", category_name: 1, limit: 12, offset: 0 } },
  { name: "Sports", params: { start_date: "", end_date: "", category_name: 7, limit: 8, offset: 0 } },
  { name: "Tech", params: { start_date: "", end_date: "", category_name: 11, limit: 6, offset: 0 } },
  { name: "Deep_Archive", params: { start_date: "2020-01-01", end_date: "", category_name: "", limit: 50, offset: 500 } },
  { name: "Flash_Fetch", params: { start_date: "", end_date: "", category_name: "", limit: 1, offset: 0 } }
];

const Inspector = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState(SOURCES[0]);
  const [params, setParams] = useState<QueryParams>({
    start_date: "", end_date: "", category_name: "", limit: 10, offset: 0, ContentID: "", q: ""
  });

  const [results, setResults] = useState<BGArchiveItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "json">("results");
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.field]: true }), {})
  );

  const [compareImages, setCompareImages] = useState(false);
  const [showPayload, setShowPayload] = useState(true);
  const [autoFetch, setAutoFetch] = useState(false);
  const [experimentalMode, setExperimentalMode] = useState(false);

  const setRecentFormula = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    setParams({ ...params, start_date: yesterday, end_date: today });
    toast.info("Formula: 24H_WINDOW Applied");
  };

  const fetchData = async (overrideParams?: QueryParams) => {
    const q = overrideParams || params;
    const payload: any = {
      start_date: q.start_date, end_date: q.end_date, category_name: q.category_name,
      limit: q.limit, offset: q.offset,
    };
    if (q.ContentID) payload.ContentID = q.ContentID;
    if (q.q) payload.q = q.q;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(source.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setRawResponse(data);
      if (res.ok) {
        setResults(data.archive_data || []);
        toast.success(`Fetched ${data.archive_data?.length || 0} items`);
      } else {
        setError(`Error: ${res.status}`);
      }
    } catch (err) {
      setError("Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      const timer = setTimeout(() => fetchData(), 800);
      return () => clearTimeout(timer);
    }
  }, [params, source, autoFetch]);

  return (
    <div className="min-h-screen bg-white text-black font-mono selection:bg-primary selection:text-white p-3 sm:p-4 md:p-8">
      {/* Brutalist Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 md:mb-12 border-4 border-black p-4 md:p-6 bg-white shadow-[6px_6px_0_0_#000] md:shadow-[8px_8px_0_0_#000]">
        <div className="flex items-center gap-4 self-stretch lg:self-auto">
          <button onClick={() => navigate("/")} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0_0_#000]">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter truncate">Archive_Inspector</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-center w-full lg:w-auto">
          <div className="flex flex-wrap border-2 border-black">
            {SOURCES.map(s => (
              <button
                key={s.id}
                onClick={() => setSource(s)}
                className={cn("px-4 py-2 text-xs font-black uppercase transition-colors", source.id === s.id ? "bg-primary text-white" : "hover:bg-slate-100")}
              >
                {s.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData()}
            disabled={isLoading}
            className="px-8 py-3 bg-primary text-white border-2 border-black shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase font-black flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            Execute
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Main Controls */}
          <section className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Settings size={20} /> Parameters
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase">Category ID</label>
                <div className="flex gap-2">
                  <select
                    value={params.category_name}
                    onChange={(e) => setParams({ ...params, category_name: e.target.value ? parseInt(e.target.value) : "" })}
                    className="flex-1 h-12 border-2 border-black px-3 font-bold bg-white focus:bg-primary/5 outline-none"
                  >
                    <option value="">ALL_CATEGORIES</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="ID"
                    value={params.category_name}
                    onChange={(e) => setParams({ ...params, category_name: e.target.value ? parseInt(e.target.value) : "" })}
                    className="w-20 border-2 border-black px-2 font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Limit</label>
                  <input type="number" value={params.limit} onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) || 0 })} className="w-full h-12 border-2 border-black px-3 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Offset</label>
                  <input type="number" value={params.offset} onChange={(e) => setParams({ ...params, offset: parseInt(e.target.value) || 0 })} className="w-full h-12 border-2 border-black px-3 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Start</label>
                  <input type="date" value={params.start_date} onChange={(e) => setParams({ ...params, start_date: e.target.value })} className="w-full h-12 border-2 border-black px-2 font-bold text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">End</label>
                  <input type="date" value={params.end_date} onChange={(e) => setParams({ ...params, end_date: e.target.value })} className="w-full h-12 border-2 border-black px-2 font-bold text-xs" />
                </div>
              </div>

              {experimentalMode && (
                <div className="pt-4 border-t-2 border-black border-dashed space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-red-500">Search Query (Experimental)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={params.q}
                        onChange={(e) => setParams({ ...params, q: e.target.value })}
                        placeholder="Keyword..."
                        className="w-full h-12 border-2 border-black px-3 pl-10 font-bold"
                      />
                      <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-red-500">Content ID Direct</label>
                    <input
                      type="number"
                      value={params.ContentID}
                      onChange={(e) => setParams({ ...params, ContentID: e.target.value ? parseInt(e.target.value) : "" })}
                      placeholder="e.g. 10452"
                      className="w-full h-12 border-2 border-black px-3 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Presets & Logic Toggles */}
          <section className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Zap size={20} /> Logic_Core
            </h2>
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-2">
                 {PRESETS.map((p, i) => (
                   <button key={i} onClick={() => { setParams({ ...params, ...p.params }); fetchData({ ...params, ...p.params }); }} className="p-2 border-2 border-black text-[10px] font-black uppercase hover:bg-black hover:text-white transition-colors">
                     {p.name}
                   </button>
                 ))}
               </div>
               <div className="h-px bg-black my-4" />
               <div className="flex flex-col gap-3">
                  <button onClick={() => setCompareImages(!compareImages)} className={cn("w-full py-2 border-2 border-black text-xs font-black uppercase flex items-center justify-center gap-2", compareImages ? "bg-black text-white" : "bg-white")}>
                    <Images size={14} /> Image Comparison {compareImages ? "ON" : "OFF"}
                  </button>
                  <button onClick={() => setAutoFetch(!autoFetch)} className={cn("w-full py-2 border-2 border-black text-xs font-black uppercase flex items-center justify-center gap-2", autoFetch ? "bg-primary text-white" : "bg-white")}>
                    <Zap size={14} /> Auto-Execute {autoFetch ? "ACTIVE" : "IDLE"}
                  </button>
                  <button onClick={() => setShowPayload(!showPayload)} className={cn("w-full py-2 border-2 border-black text-xs font-black uppercase flex items-center justify-center gap-2", showPayload ? "bg-slate-100" : "bg-white")}>
                    <FileCode size={14} /> Payload Manifest {showPayload ? "VISIBLE" : "HIDDEN"}
                  </button>
                  <button onClick={setRecentFormula} className="w-full py-2 border-2 border-black text-xs font-black uppercase flex items-center justify-center gap-2 bg-white hover:bg-slate-50">
                    <Calendar size={14} /> Formula: Last 24H
                  </button>
                  <button onClick={() => setExperimentalMode(!experimentalMode)} className={cn("w-full py-2 border-2 border-black text-xs font-black uppercase flex items-center justify-center gap-2", experimentalMode ? "bg-red-500 text-white" : "bg-white")}>
                    <Cpu size={14} /> Mode: Experimental {experimentalMode ? "ON" : "OFF"}
                  </button>
               </div>
            </div>
          </section>

          {/* Visibility Layer */}
          <section className="border-4 border-black p-4 md:p-6 bg-white shadow-[6px_6px_0_0_#000]">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Layers size={20} /> Field_Mask
            </h2>
            <div className="flex flex-wrap gap-2">
              {FIELD_DEFS.map(f => (
                <button
                  key={f.field}
                  onClick={() => setVisibleFields({ ...visibleFields, [f.field]: !visibleFields[f.field] })}
                  className={cn("px-2.5 py-1.5 text-[10px] md:text-[9px] font-black border-2 border-black transition-all active:translate-y-[1px]", visibleFields[f.field] ? "bg-primary text-white" : "bg-white text-slate-400 opacity-50")}
                >
                  {f.field}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-8">
          {showPayload && (
            <div className="border-4 border-black bg-slate-900 shadow-[6px_6px_0_0_#000] overflow-hidden">
               <div className="bg-white border-b-4 border-black px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">Request_Payload</span>
                  <Copy size={14} className="cursor-pointer hover:text-primary" onClick={() => { navigator.clipboard.writeText(JSON.stringify(params, null, 2)); toast.success("Copied"); }} />
               </div>
               <pre className="p-6 text-primary text-xs font-bold overflow-x-auto scrollbar-hide">
                 {JSON.stringify(params, null, 2)}
               </pre>
            </div>
          )}

          <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000] min-h-[600px] flex flex-col">
             <div className="flex border-b-4 border-black">
                <button onClick={() => setActiveTab("results")} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest border-r-4 border-black", activeTab === "results" ? "bg-primary text-white" : "bg-white")}>Visual_Grid</button>
                <button onClick={() => setActiveTab("json")} className={cn("flex-1 py-4 text-xs font-black uppercase tracking-widest", activeTab === "json" ? "bg-primary text-white" : "bg-white")}>Raw_Data</button>
             </div>

             <div className="flex-1 p-6">
                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center py-24">
                    <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                    <p className="text-xs font-black uppercase">Synchronizing_Archives...</p>
                  </div>
                )}

                {!isLoading && activeTab === "results" && results && (
                  <div className={cn("grid gap-8", compareImages ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                    {results.length === 0 ? (
                      <div className="col-span-full py-40 text-center uppercase font-black text-slate-300">Null_Result_Return</div>
                    ) : (
                      results.map(item => (
                        <div key={item.ContentID} className="border-4 border-black p-4 flex flex-col gap-4 group hover:shadow-[4px_4px_0_0_#000] transition-all">
                          {compareImages ? (
                             <div className="space-y-4">
                               <div className="flex justify-between items-center border-b-2 border-black pb-2">
                                  <h4 className="font-black uppercase text-sm">{item.ContentHeading}</h4>
                                  <span className="bg-black text-white px-2 py-0.5 text-[10px]">ID: {item.ContentID}</span>
                               </div>
                               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {["ImageThumbPath", "ImageSmPath", "ImageBgPath"].map((f) => (
                                    <div key={f} className="space-y-2">
                                      <span className="text-[9px] font-black uppercase text-slate-400">{f}</span>
                                      <div className="aspect-video border-2 border-black bg-slate-100 overflow-hidden">
                                        <img src={`${source.media}${item[f as keyof BGArchiveItem]}`} className="w-full h-full object-cover" />
                                      </div>
                                    </div>
                                  ))}
                               </div>
                             </div>
                          ) : (
                            <>
                              <div className="aspect-video border-4 border-black overflow-hidden relative">
                                <img src={`${source.media}${item.ImageBgPath}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[10px] font-black uppercase">{item.CategoryName}</div>
                              </div>
                              <div className="flex-1 space-y-4">
                                <h4 className="text-base font-black uppercase leading-tight">{item.ContentHeading}</h4>
                                <p className="text-[11px] font-bold text-slate-600 line-clamp-3">{item.ContentBrief}</p>
                                <div className="space-y-1.5 pt-4 border-t-2 border-slate-100">
                                  {FIELD_DEFS.filter(f => !["ImageBgPath", "ContentHeading", "ContentBrief", "CategoryName", "ImageThumbPath", "ImageSmPath"].includes(f.field) && visibleFields[f.field]).map(f => (
                                    <div key={f.field} className="flex justify-between items-center text-[9px] gap-2">
                                      <span className="font-black uppercase text-slate-400">{f.field}</span>
                                      <span className="font-bold truncate max-w-[150px]">{String(item[f.field])}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                          <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.create_date}</span>
                             <a href={`${source.site}/${item.Slug}/${item.ContentID}`} target="_blank" className="p-2 border-2 border-black hover:bg-primary hover:text-white transition-colors">
                               <ExternalLink size={14} />
                             </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {!isLoading && activeTab === "json" && (
                   <div className="relative h-full">
                     <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2)); toast.success("Copied"); }} className="absolute top-4 right-4 bg-primary text-white p-2 border-2 border-black shadow-[2px_2px_0_0_#000] active:shadow-none transition-all">
                       <Copy size={14} />
                     </button>
                     <pre className="bg-slate-900 text-primary p-6 border-4 border-black h-full overflow-auto font-bold text-xs">
                       {JSON.stringify(rawResponse, null, 2)}
                     </pre>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Brutalist Docs */}
      <section className="mt-16 md:mt-24 border-t-8 border-black pt-12 md:pt-16 space-y-12 md:space-y-16">
         <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic bg-black text-white inline-block px-4 py-2">Engineering_Protocol</h2>
            <p className="text-lg md:text-xl font-bold uppercase tracking-tight">Manual for Forensic Data Extraction and API Interrogation</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1400px] mx-auto px-2">
            <div className="border-4 border-black p-4 md:p-8 shadow-[12px_12px_0_0_#000] bg-white">
               <h3 className="text-2xl font-black uppercase mb-8 border-b-4 border-black pb-4 flex items-center gap-3">
                 <Database size={24} /> Schema_Map
               </h3>
               <div className="space-y-4">
                  {FIELD_DEFS.map(f => (
                    <div key={f.field} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start border-b border-slate-200 pb-4">
                       <span className="font-black text-[11px] sm:text-xs uppercase w-full sm:w-32 shrink-0">{f.field}</span>
                       <div className="space-y-1">
                          <span className="bg-slate-100 text-[10px] font-black px-2 py-0.5 border border-black uppercase">{f.type}</span>
                          <p className="text-[11px] font-bold text-slate-500 leading-tight">{f.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-12">
               <div className="border-4 border-black p-8 shadow-[12px_12px_0_0_#000] bg-slate-900 text-white">
                  <h3 className="text-2xl font-black uppercase mb-8 border-b-4 border-white/20 pb-4 flex items-center gap-3">
                    <Code2 size={24} className="text-primary" /> Implementation
                  </h3>
                  <pre className="text-xs text-primary font-bold leading-relaxed whitespace-pre-wrap">
{`// ARCHIVE FETCH PATTERN
const req = await fetch('ARCHIVE_API', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    limit: 10, offset: 0,
    category_name: 1
  })
});

const { archive_data } = await req.json();
// Map paths to base: media/imgAll/`}
                  </pre>
               </div>

               <div className="border-4 border-black p-8 shadow-[12px_12px_0_0_#000] bg-primary text-white">
                  <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                    <ShieldCheck size={24} /> Audit_Notes
                  </h3>
                  <ul className="space-y-4 font-black uppercase text-xs italic tracking-tight">
                    <li className="flex gap-3"><div className="w-4 h-4 bg-white shrink-0" /> POST method required for all archive queries</li>
                    <li className="flex gap-3"><div className="w-4 h-4 bg-white shrink-0" /> Unified schema across BG and DB domains</li>
                    <li className="flex gap-3"><div className="w-4 h-4 bg-white shrink-0" /> Image paths require manual prefixing</li>
                    <li className="flex gap-3"><div className="w-4 h-4 bg-white shrink-0" /> Categories are integer-mapped</li>
                  </ul>
               </div>
            </div>
         </div>

         <div className="max-w-4xl mx-auto border-8 border-black p-6 md:p-12 bg-white text-center shadow-[12px_12px_0_0_#000] md:shadow-[16px_16px_0_0_#000]">
            <h3 className="text-2xl md:text-3xl font-black uppercase mb-4">Inspection Complete</h3>
            <p className="font-bold text-slate-500 mb-8 italic text-sm md:text-base">ENGINE STABILIZED. DATA STREAM VERIFIED. AUDIT LOGS CLOSED.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
               <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-10 py-4 bg-black text-white font-black uppercase border-4 border-black hover:bg-white hover:text-black transition-all">Re-Scan</button>
               <button onClick={() => navigate("/")} className="px-10 py-4 bg-white text-black font-black uppercase border-4 border-black hover:bg-black hover:text-white transition-all">Close_Engine</button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Inspector;
