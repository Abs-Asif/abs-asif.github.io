import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  Terminal,
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
  BookOpen
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
  create_date: string;
  updated_date: string | null;
}

interface ApiResponse {
  archive_data: BGArchiveItem[];
  category_name?: string[]; // Error message if category_name is not an integer
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
      setError("Failed to fetch data from the Bangladesh Guardian API. This might be due to CORS restrictions if not handled by a proxy.");
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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <div className="max-w-7xl mx-auto pt-6 md:pt-12 px-4">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 rounded-xl bg-surface-1 border border-border hover:border-primary transition-all active:scale-95 group shrink-0"
            >
              <ArrowLeft size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl font-bold font-mono truncate gradient-text">
                BG_Archive_Inspector
              </h1>
              <p className="text-muted-foreground font-mono text-[10px] md:text-sm truncate">
                {"// Advanced API Testing Ground & Audit Tool"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-mono text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  API_STATUS::OPERATIONAL
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Endpoint: /api-en/archive</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <aside className="lg:col-span-4 space-y-6">
            <section className="terminal-window p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 size={16} className="text-primary" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">Configuration</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                    <Layers size={14} /> CATEGORY_ID
                  </label>
                  <div className="grid grid-cols-2 gap-2">
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
                      className="col-span-2 h-10 rounded-lg border border-border bg-surface-2 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">All Categories</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.id})</option>
                      ))}
                      <option value="999">Custom ID...</option>
                    </select>
                    {showCustomCategory && (
                       <input
                        type="number"
                        placeholder="Enter ID..."
                        value={params.category_name}
                        onChange={(e) => setParams({ ...params, category_name: e.target.value ? parseInt(e.target.value) : "" })}
                        className="col-span-2 h-10 rounded-lg border border-border bg-surface-2 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                       />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                      <Hash size={14} /> LIMIT
                    </label>
                    <input
                      type="number"
                      value={params.limit}
                      onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) || 0 })}
                      className="w-full h-10 rounded-lg border border-border bg-surface-2 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                      <Hash size={14} /> OFFSET
                    </label>
                    <input
                      type="number"
                      value={params.offset}
                      onChange={(e) => setParams({ ...params, offset: parseInt(e.target.value) || 0 })}
                      className="w-full h-10 rounded-lg border border-border bg-surface-2 px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                    <Calendar size={14} /> DATE_RANGE
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={params.start_date}
                      onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                      className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={params.end_date}
                      onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                      className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => fetchData()}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-mono font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                EXECUTE_QUERY
              </button>
            </section>

            <section className="terminal-window p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database size={16} className="text-accent" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-accent">Presets</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-2 border border-border hover:border-accent transition-all group text-left"
                  >
                    <span className="text-xs font-mono">{preset.name}</span>
                    <ExternalLink size={12} className="text-muted-foreground group-hover:text-accent" />
                  </button>
                ))}
              </div>
            </section>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-8 space-y-6">
            <div className="terminal-window min-h-[500px] flex flex-col">
              <div className="terminal-header flex items-center justify-between border-b border-border bg-secondary/30">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("results")}
                    className={cn(
                      "px-6 py-3 text-xs font-mono border-r border-border transition-colors",
                      activeTab === "results" ? "bg-surface-1 text-primary border-b-2 border-b-primary" : "text-muted-foreground hover:bg-surface-2"
                    )}
                  >
                    RESULTS
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={cn(
                      "px-6 py-3 text-xs font-mono border-r border-border transition-colors",
                      activeTab === "json" ? "bg-surface-1 text-primary border-b-2 border-b-primary" : "text-muted-foreground hover:bg-surface-2"
                    )}
                  >
                    RAW_RESPONSE
                  </button>
                </div>
                <div className="px-4 hidden sm:block">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {results ? `FOUND::${results.length}_ITEMS` : "READY_FOR_COMMAND"}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-6">
                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center py-20 animate-pulse">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="font-mono text-muted-foreground">Communicating with Bangladesh Guardian API...</p>
                  </div>
                )}

                {error && !isLoading && (
                  <div className="p-6 rounded-xl border border-destructive/50 bg-destructive/10 flex items-start gap-4">
                    <AlertCircle size={24} className="text-destructive shrink-0" />
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-destructive font-mono">CONNECTION_FAILURE</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                {!isLoading && activeTab === "results" && results && (
                  <div className="space-y-4">
                    {results.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                        <Search size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                        <p className="font-mono text-muted-foreground uppercase tracking-widest">No articles found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((item) => (
                          <div key={item.ContentID} className="group p-4 rounded-xl border border-border bg-surface-2 hover:border-primary transition-all">
                             <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-muted relative">
                                <img
                                  src={`https://backoffice.bangladeshguardian.com/media/imgAll/${item.ImageBgPath}`}
                                  alt={item.ContentHeading}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Image+Not+Found";
                                  }}
                                />
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/20">
                                   <span className="text-[9px] font-mono text-white font-bold">{item.CategoryName}</span>
                                </div>
                             </div>
                             <h4 className="text-sm font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{item.ContentHeading}</h4>
                             <div className="flex items-center justify-between mt-auto">
                                <span className="text-[10px] font-mono text-muted-foreground">{item.create_date}</span>
                                <a
                                  href={`https://bangladeshguardian.com/${item.Slug}/${item.ContentID}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
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
                  <div className="relative h-full">
                    <div className="absolute top-2 right-2 flex gap-2">
                       <button
                         onClick={() => copyToClipboard(JSON.stringify(rawResponse, null, 2))}
                         className="p-2 rounded-lg bg-surface-3 border border-border hover:border-primary text-muted-foreground hover:text-primary transition-all"
                         title="Copy JSON"
                       >
                         <Copy size={14} />
                       </button>
                    </div>
                    <pre className="font-mono text-xs p-6 bg-surface-2 rounded-xl border border-border overflow-auto max-h-[600px] scrollbar-hide text-green-500/90">
                      {rawResponse ? JSON.stringify(rawResponse, null, 2) : "// No data fetched yet"}
                    </pre>
                  </div>
                )}

                {!isLoading && !results && !error && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-surface-1 border border-border flex items-center justify-center relative">
                       <Terminal size={48} className="text-muted-foreground/20" />
                       <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
                    </div>
                    <div>
                       <h3 className="text-xl font-mono text-muted-foreground mb-2">SYSTEM_IDLE</h3>
                       <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
                         Configure parameters and execute query to begin API inspection.
                       </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Documentation Section */}
        <section className="mt-20 border-t border-border pt-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                 <BookOpen size={14} />
                 <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Documentation</span>
               </div>
               <h2 className="text-4xl font-bold font-mono">Archive API Handbook</h2>
               <p className="text-muted-foreground">Everything you need to know about the Bangladesh Guardian Archive API.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="terminal-window p-8 bg-surface-1">
                 <h3 className="text-xl font-bold font-mono mb-4 flex items-center gap-2 text-primary">
                   <Info size={20} /> Base Specifications
                 </h3>
                 <div className="space-y-4 font-mono text-sm">
                    <div className="p-3 rounded bg-surface-2 border border-border">
                       <span className="text-primary-foreground bg-primary px-1 mr-2 text-[10px] font-bold">POST</span>
                       <span className="text-muted-foreground">https://backoffice.bangladeshguardian.com/api-en/archive</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      The Archive API is a POST-only endpoint that serves paginated content from the Bangladesh Guardian's English database. It supports filtering by category, date range, and pagination.
                    </p>
                 </div>
               </div>

               <div className="terminal-window p-8 bg-surface-1">
                 <h3 className="text-xl font-bold font-mono mb-4 flex items-center gap-2 text-accent">
                   <FileJson size={20} /> Request Payload
                 </h3>
                 <pre className="text-xs p-4 bg-surface-2 rounded-lg border border-border text-accent/80 font-mono">
{`{
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "category_name": integer_id,
  "limit": integer,
  "offset": integer
}`}
                 </pre>
               </div>
            </div>

            <div className="terminal-window p-8 bg-surface-1">
               <h3 className="text-xl font-bold font-mono mb-6 flex items-center gap-2 text-primary">
                 <Code2 size={20} /> Implementation Blueprint
               </h3>

               <div className="space-y-8">
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">JavaScript (Fetch API)</span>
                     <button onClick={() => copyToClipboard(`const fetchArticles = async () => {
  const res = await fetch("https://backoffice.bangladeshguardian.com/api-en/archive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start_date: "",
      end_date: "",
      category_name: 1, // National
      limit: 10,
      offset: 0
    })
  });
  const data = await res.json();
  return data.archive_data;
};`)} className="p-1.5 rounded hover:bg-white/10 transition-colors"><Copy size={14} /></button>
                   </div>
                   <pre className="text-[11px] md:text-xs p-5 bg-surface-2 rounded-lg border border-border text-foreground/90 font-mono overflow-auto">
{`const fetchArticles = async () => {
  const res = await fetch("https://backoffice.bangladeshguardian.com/api-en/archive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start_date: "",
      end_date: "",
      category_name: 1, // National
      limit: 10,
      offset: 0
    })
  });
  const data = await res.json();
  return data.archive_data;
};`}
                   </pre>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-mono font-bold text-muted-foreground">Expert Tips:</h4>
                      <ul className="space-y-2">
                        {[
                          "Category ID must be an integer, not a string.",
                          "Dates should be formatted as YYYY-MM-DD.",
                          "Use empty strings for optional parameters.",
                          "Images are hosted at /media/imgAll/ prefix."
                        ].map((tip, i) => (
                          <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                            <CheckCircle2 size={14} className="text-primary mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-mono font-bold text-muted-foreground">Advanced Formulas:</h4>
                      <div className="space-y-2">
                         <div className="p-3 rounded border border-border bg-surface-2 text-[10px] font-mono">
                            <span className="text-accent">PAGINATION:</span> <span className="text-muted-foreground">offset = (page - 1) * limit</span>
                         </div>
                         <div className="p-3 rounded border border-border bg-surface-2 text-[10px] font-mono">
                            <span className="text-accent">FULL_IMG_URL:</span> <span className="text-muted-foreground">base + "/media/imgAll/" + ImageBgPath</span>
                         </div>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-4">
               <h3 className="text-2xl font-bold font-mono">Ready to Build?</h3>
               <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                 The Bangladesh Guardian Archive API provides high-quality news metadata. Use this inspector to fine-tune your queries and integrate them into your next project.
               </p>
               <button
                 onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                 className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-mono font-bold hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
               >
                 _back_to_top()
               </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inspector;
