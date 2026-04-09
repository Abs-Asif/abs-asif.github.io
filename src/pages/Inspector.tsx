import { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
  Filter,
  Globe,
  Layout,
  Smartphone
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
}

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

const PRESETS = [
  {
    name: "Latest National",
    params: { start_date: "", end_date: "", category_name: 1, limit: 10, offset: 0 }
  },
  {
    name: "Sports Highlights",
    params: { start_date: "", end_date: "", category_name: 7, limit: 5, offset: 0 }
  },
  {
    name: "Global Affairs",
    params: { start_date: "", end_date: "", category_name: 5, limit: 8, offset: 0 }
  },
  {
    name: "Tech & Science",
    params: { start_date: "", end_date: "", category_name: 11, limit: 6, offset: 0 }
  },
  {
    name: "Recent All",
    params: { start_date: "", end_date: "", category_name: "", limit: 12, offset: 0 }
  }
];

const ALL_FIELDS: (keyof BGArchiveItem)[] = [
  "ContentID", "CategoryID", "CategoryName", "Slug", "ContentHeading",
  "ContentBrief", "ImageThumbPath", "ImageSmPath", "ImageBgPath",
  "URLAlies", "VideoID", "VideoPath", "VideoType", "VideoSource",
  "create_date", "updated_date"
];

const Inspector = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState<QueryParams>({
    start_date: "",
    end_date: "",
    category_name: "",
    limit: 10,
    offset: 0
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [results, setResults] = useState<BGArchiveItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "json">("results");
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    ALL_FIELDS.reduce((acc, field) => ({ ...acc, [field]: true }), {})
  );

  const fetchData = async (overrideParams?: QueryParams) => {
    const queryParams = overrideParams || params;
    setIsLoading(true);
    setError(null);
    setRawResponse(null);

    try {
      const response = await fetch("https://backoffice.bangladeshguardian.com/api-en/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryParams)
      });

      const data = await response.json();
      setRawResponse(data);

      if (response.ok) {
        if (data.archive_data) {
          setResults(data.archive_data);
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
      setError("Failed to fetch data. Ensure your connection is active and CORS is handled.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setParams(preset.params as QueryParams);
    setShowCustomCategory(false);
    fetchData(preset.params as QueryParams);
    toast.success(`Applied preset: ${preset.name}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleField = (field: string) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/10">
      {/* Refined Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database size={20} className="text-primary" />
                BG Archive Inspector
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
               API_ONLINE
            </div>
            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              <span className="hidden sm:inline">Fetch Data</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Controls Sidebar */}
          <aside className="lg:w-80 space-y-6 shrink-0">
            {/* Configuration */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Settings2 size={16} className="text-slate-400" />
                  Query Config
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
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
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="999">Custom ID...</option>
                  </select>
                  {showCustomCategory && (
                    <input
                      type="number"
                      placeholder="Enter ID..."
                      value={params.category_name}
                      onChange={(e) => setParams({ ...params, category_name: e.target.value ? parseInt(e.target.value) : "" })}
                      className="w-full mt-2 h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Limit</label>
                    <input
                      type="number"
                      value={params.limit}
                      onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) || 0 })}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Offset</label>
                    <input
                      type="number"
                      value={params.offset}
                      onChange={(e) => setParams({ ...params, offset: parseInt(e.target.value) || 0 })}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={params.start_date}
                    onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={params.end_date}
                    onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Visibility Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <h3 className="text-sm font-bold">Field Visibility</h3>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto scrollbar-hide">
                <div className="space-y-2">
                  {ALL_FIELDS.map(field => (
                    <label key={field} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleField(field)}
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          visibleFields[field] ? "bg-primary border-primary" : "border-slate-300"
                        )}
                      >
                        {visibleFields[field] && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">{field}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <Layout size={16} className="text-slate-400" />
                <h3 className="text-sm font-bold">Presets</h3>
              </div>
              <div className="p-2 grid grid-cols-1 gap-1">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                  >
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">{preset.name}</span>
                    <ExternalLink size={12} className="text-slate-300 group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <main className="flex-1 min-w-0 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("results")}
                  className={cn(
                    "px-6 py-4 text-sm font-semibold transition-all relative",
                    activeTab === "results" ? "text-primary" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Visual Results
                  {activeTab === "results" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button
                  onClick={() => setActiveTab("json")}
                  className={cn(
                    "px-6 py-4 text-sm font-semibold transition-all relative",
                    activeTab === "json" ? "text-primary" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Raw Response
                  {activeTab === "json" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              </div>

              <div className="flex-1 p-6">
                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-sm font-medium text-slate-500">Querying archive database...</p>
                  </div>
                )}

                {error && !isLoading && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex gap-4 items-start">
                    <AlertCircle className="text-red-500 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-red-800">API Connection Issue</h4>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {!isLoading && activeTab === "results" && results && (
                  <div className="space-y-6">
                    {results.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">No results found for current query</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {results.map((item) => (
                          <div key={item.ContentID} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                            {visibleFields.ImageBgPath && (
                              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                <img
                                  src={`https://backoffice.bangladeshguardian.com/media/imgAll/${item.ImageBgPath}`}
                                  alt={item.ContentHeading}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=No+Image";
                                  }}
                                />
                                {visibleFields.CategoryName && (
                                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                                    {item.CategoryName}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="p-4 flex-1 space-y-4">
                              <div>
                                {visibleFields.ContentHeading && (
                                  <h4 className="font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                    {item.ContentHeading}
                                  </h4>
                                )}
                                {visibleFields.ContentBrief && (
                                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                                    {item.ContentBrief}
                                  </p>
                                )}
                              </div>

                              {/* Dynamic Field Display */}
                              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-2">
                                {ALL_FIELDS.filter(f => !["ImageBgPath", "ContentHeading", "ContentBrief", "CategoryName"].includes(f) && visibleFields[f]).map(field => (
                                  <div key={field} className="flex items-start justify-between gap-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{field}</span>
                                    <span className="text-[10px] text-slate-600 truncate max-w-[200px] text-right">
                                      {item[field] === null ? "null" : String(item[field])}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-medium text-slate-400">{item.create_date}</span>
                              <a
                                href={`https://bangladeshguardian.com/${item.Slug}/${item.ContentID}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-primary transition-colors"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isLoading && activeTab === "json" && (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(rawResponse, null, 2))}
                      className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors flex items-center gap-2 text-xs"
                    >
                      <Copy size={14} />
                      Copy JSON
                    </button>
                    <pre className="bg-slate-900 text-emerald-400 p-6 rounded-xl overflow-auto max-h-[700px] text-xs font-mono leading-relaxed">
                      {rawResponse ? JSON.stringify(rawResponse, null, 2) : "// Awaiting data fetch..."}
                    </pre>
                  </div>
                )}

                {!isLoading && !results && !error && (
                  <div className="h-full flex flex-col items-center justify-center py-32 text-slate-400 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <Smartphone size={32} className="opacity-20" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Ready to Inspect</h3>
                    <p className="text-sm max-w-xs mx-auto mt-2">Adjust your parameters in the sidebar and click "Fetch Data" to start the audit.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Professional Documentation Section */}
        <section className="mt-20 pt-20 border-t border-slate-200">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-6">
                 <BookOpen size={14} /> Documentation
               </div>
               <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">API Engineering Handbook</h2>
               <p className="text-slate-500 mt-4 text-lg">A comprehensive guide to mastering the Bangladesh Guardian Archive API.</p>
            </div>

            <div className="space-y-12">
              {/* Endpoint Specs */}
              <div className="grid md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Globe size={20} className="text-primary" /> Core Endpoint
                  </h3>
                  <p className="text-slate-500 mt-3 text-sm leading-relaxed">
                    The Archive API facilitates robust data retrieval from the central news repository. It supports high-performance querying with native pagination and filtering.
                  </p>
                </div>
                <div className="md:col-span-3 bg-slate-900 rounded-xl p-5 shadow-lg border border-slate-800">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">POST URL</span>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/20" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                        <div className="w-2 h-2 rounded-full bg-green-500/20" />
                      </div>
                   </div>
                   <code className="text-emerald-400 text-xs md:text-sm font-mono break-all">
                     https://backoffice.bangladeshguardian.com/api-en/archive
                   </code>
                </div>
              </div>

              {/* Data Schema */}
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileJson size={20} className="text-primary" /> Schema Definitions
                 </h3>
                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { field: "ContentID", type: "Integer", desc: "Unique global identifier for the article." },
                      { field: "CategoryID", type: "Integer", desc: "Internal ID for news classification." },
                      { field: "CategoryName", type: "String", desc: "Human-readable category label (e.g. National)." },
                      { field: "ContentHeading", type: "String", desc: "Primary title of the news content." },
                      { field: "ContentBrief", type: "String", desc: "Short summary or lead paragraph text." },
                      { field: "Slug", type: "String", desc: "URL-friendly version of the category." },
                      { field: "URLAlies", type: "String", desc: "SEO-optimized URL slug for the article." },
                      { field: "ImageBgPath", type: "String", desc: "Relative path to the high-resolution image." },
                      { field: "create_date", type: "String", desc: "Formatted timestamp of article creation." },
                    ].map(item => (
                      <div key={item.field} className="p-4 bg-white border border-slate-200 rounded-lg hover:border-primary transition-colors group">
                         <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{item.field}</span>
                            <span className="text-[9px] font-medium text-slate-400 uppercase">{item.type}</span>
                         </div>
                         <p className="text-[11px] text-slate-500 group-hover:text-slate-600 leading-normal">{item.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Implementation Patterns */}
              <div className="space-y-6">
                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Code2 size={20} className="text-primary" /> Implementation Patterns
                 </h3>

                 <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                   <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">PRO_PATTERN</div>
                        <span className="text-xs font-bold text-slate-700">Standard Fetch Hook (React)</span>
                      </div>
                      <button onClick={() => copyToClipboard(`const useArchive = (params) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://backoffice.bangladeshguardian.com/api-en/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(json => setData(json.archive_data));
  }, [params]);

  return data;
};`)} className="text-slate-400 hover:text-primary transition-colors"><Copy size={16} /></button>
                   </div>
                   <div className="p-5 overflow-x-auto bg-slate-900">
                     <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
{`const useArchive = (params) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://backoffice.bangladeshguardian.com/api-en/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    .then(res => res.json())
    .then(json => setData(json.archive_data));
  }, [params]);

  return data;
};`}
                     </pre>
                   </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-slate-900 mb-4">Query Optimization</h4>
                       <ul className="space-y-3">
                          {[
                            "Implement debounce for date filters to prevent API flood.",
                            "Cache category lists locally (they change infrequently).",
                            "Handle 422 errors specifically for 'Category must be integer'.",
                            "Use ImageSmPath for thumbnails to save bandwidth."
                          ].map((tip, i) => (
                            <li key={i} className="text-sm text-slate-600 flex gap-3">
                               <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                               {tip}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-slate-900 mb-4">Common Pitfalls</h4>
                       <ul className="space-y-3">
                          {[
                            "Passing Category Name instead of Category ID.",
                            "Incorrect date format (Always use YYYY-MM-DD).",
                            "Missing 'Content-Type: application/json' header.",
                            "Neglecting to prefix image paths with the media server URL."
                          ].map((pitfall, i) => (
                            <li key={i} className="text-sm text-slate-600 flex gap-3">
                               <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                               {pitfall}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-10 text-center relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-0" />
               <div className="relative z-10">
                 <h3 className="text-3xl font-bold text-white mb-4">System Verification Complete</h3>
                 <p className="text-slate-400 max-w-lg mx-auto mb-8">
                   You have successfully audited the Bangladesh Guardian API. This testing ground is now fully optimized for professional integration.
                 </p>
                 <button
                   onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                   className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95"
                 >
                   Back to Control Panel
                 </button>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inspector;
