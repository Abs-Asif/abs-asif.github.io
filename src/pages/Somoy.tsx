import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Settings,
  Search,
  Copy,
  Calendar,
  ExternalLink,
  Zap,
  Grid,
  List,
  Clock,
  Database,
  Download,
  Filter,
  RefreshCw,
  Layout,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getProxyUrl } from "@/lib/api-utils";

interface SomoyArticle {
  ContentID: number;
  CategoryID: number;
  CategoryName: string;
  ContentSlug: string;
  ContentHeading: string | null;
  DetailsHeading: string;
  ContentBrief: string;
  ImageThumbPath: string;
  ImageSmPath: string;
  ImageBgPath: string;
  CategorySlug: string;
  created_at: string;
  ShowVideo?: number;
}

interface SomoyResponse {
  data: SomoyArticle[];
}

interface QueryParams {
  start_date: string;
  end_date: string;
  category_name: string | number;
  limit: number;
  offset: number;
}

const Somoy = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<SomoyArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [params, setParams] = useState<QueryParams>({
    start_date: "",
    end_date: "",
    category_name: "",
    limit: 12,
    offset: 0,
  });

  const BASE_URL = "http://103.209.42.203";
  const API_ENDPOINT = `${BASE_URL}/api/archive`;

  const fetchNews = async (overrideParams?: QueryParams) => {
    const q = overrideParams || params;
    setIsLoading(true);

    try {
      // Use AllOrigins proxy (index 1) to handle CORS and Mixed Content (HTTP API on HTTPS site)
      const proxiedUrl = getProxyUrl(API_ENDPOINT, 1);

      const response = await fetch(proxiedUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date: q.start_date,
          end_date: q.end_date,
          category_name: q.category_name,
          limit: q.limit,
          offset: q.offset,
        }),
      });

      if (!response.ok) throw new Error("API call failed");

      const result: SomoyResponse = await response.json();
      // Note: Somoy API returns { data: [...] } based on live inspection,
      // whereas the user's provided example for BG was { archive_data: [...] }
      setArticles(result.data || []);
      toast.success(`Synchronized ${result.data?.length || 0} articles`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch news from Somoy Archive");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(params, null, 2));
    toast.success("Payload copied to clipboard");
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(articles, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `somoy_archive_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Archive exported as JSON");
  };

  const setLast24H = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newParams = { ...params, start_date: yesterday, end_date: today };
    setParams(newParams);
    fetchNews(newParams);
  };

  const filteredArticles = articles.filter(article =>
    (article.DetailsHeading || article.ContentHeading || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.ContentBrief || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-black font-mono selection:bg-primary selection:text-white p-3 md:p-8">
      {/* Brutalist Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 border-4 border-black p-4 md:p-6 bg-white shadow-[8px_8px_0_0_#000]">
        <div className="flex items-center gap-4 self-stretch lg:self-auto">
          <button onClick={() => navigate("/")} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0_0_#000]">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">Somoy_Engine</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol: Direct Archive Access</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-center w-full lg:w-auto">
          <div className="relative w-full md:w-64">
             <input
              type="text"
              placeholder="Filter results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 border-2 border-black px-3 pl-10 font-bold text-xs outline-none focus:bg-primary/5"
             />
             <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <div className="flex border-2 border-black">
             <button onClick={() => setViewMode("grid")} className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-black text-white" : "hover:bg-slate-100")}>
               <Grid size={20} />
             </button>
             <button onClick={() => setViewMode("list")} className={cn("p-2 transition-colors border-l-2 border-black", viewMode === "list" ? "bg-black text-white" : "hover:bg-slate-100")}>
               <List size={20} />
             </button>
          </div>
          <button
            onClick={() => fetchNews()}
            disabled={isLoading}
            className="px-8 py-3 bg-primary text-white border-2 border-black shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase font-black flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            Execute_Fetch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
            <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2">
              <Settings size={18} /> Parameters
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                  <Filter size={10} /> Post Limit
                </label>
                <input
                  type="number"
                  value={params.limit}
                  onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 border-2 border-black px-3 font-bold text-sm outline-none focus:bg-primary/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                  <Layout size={10} /> Category ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1"
                  value={params.category_name}
                  onChange={(e) => setParams({ ...params, category_name: e.target.value })}
                  className="w-full h-10 border-2 border-black px-3 font-bold text-sm outline-none focus:bg-primary/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                  <RefreshCw size={10} /> Offset
                </label>
                <input
                  type="number"
                  value={params.offset}
                  onChange={(e) => setParams({ ...params, offset: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 border-2 border-black px-3 font-bold text-sm outline-none focus:bg-primary/5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={params.start_date}
                    onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                    className="w-full h-10 border-2 border-black px-2 font-bold text-[10px] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">End Date</label>
                  <input
                    type="date"
                    value={params.end_date}
                    onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                    className="w-full h-10 border-2 border-black px-2 font-bold text-[10px] outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <button onClick={setLast24H} className="w-full py-2 border-2 border-black text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                  <Clock size={14} /> Filter: Last 24H
                </button>
                <button onClick={downloadJSON} className="w-full py-2 border-2 border-black text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors">
                  <Download size={14} /> Export Data
                </button>
                <button onClick={copyPayload} className="w-full py-2 border-2 border-black text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                  <Copy size={14} /> Copy Payload
                </button>
              </div>
            </div>
          </div>

          <div className="border-4 border-black p-4 bg-slate-900 text-primary shadow-[6px_6px_0_0_#000]">
            <h3 className="text-xs font-black uppercase mb-3 flex items-center gap-2 text-white">
              <Database size={14} /> Active_Payload
            </h3>
            <pre className="text-[9px] font-bold overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(params, null, 2)}
            </pre>
          </div>
        </aside>

        {/* Article Grid */}
        <main className="lg:col-span-9">
          {isLoading ? (
            <div className="h-[60vh] border-4 border-black flex flex-col items-center justify-center bg-white shadow-[8px_8px_0_0_#000]">
               <Loader2 size={48} className="animate-spin text-primary mb-4" />
               <p className="font-black uppercase tracking-widest text-sm">Synchronizing_Archives...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="h-[60vh] border-4 border-black flex flex-col items-center justify-center bg-white shadow-[8px_8px_0_0_#000]">
               <Database size={48} className="text-slate-200 mb-4" />
               <p className="font-black uppercase tracking-widest text-sm text-slate-400">Null_Result_Return</p>
               <button onClick={() => { setSearchQuery(""); fetchNews(); }} className="mt-4 px-6 py-2 border-2 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-all">Reset_Fetch</button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}>
              {filteredArticles.map((article) => (
                <div key={article.ContentID} className={cn(
                  "border-4 border-black bg-white shadow-[4px_4px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all group overflow-hidden",
                  viewMode === "list" && "flex flex-col md:flex-row"
                )}>
                  <div className={cn(
                    "aspect-video bg-slate-100 border-b-4 border-black relative overflow-hidden",
                    viewMode === "list" ? "md:w-72 md:aspect-square md:border-b-0 md:border-r-4" : "w-full"
                  )}>
                    <img
                      src={`${BASE_URL}/${article.ImageBgPath}`}
                      alt={article.DetailsHeading}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1585829365234-781fcd50c819?w=800&auto=format&fit=crop&q=60";
                      }}
                    />
                    <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-[8px] font-black uppercase">
                      {article.CategoryName}
                    </div>
                    {article.ShowVideo === 1 && (
                      <div className="absolute top-0 left-0 bg-red-600 text-white p-1 shadow-[2px_2px_0_0_#000]">
                        <Video size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-sm font-black uppercase leading-tight mb-2 line-clamp-2">
                        {article.DetailsHeading || article.ContentHeading}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-600 line-clamp-3 mb-4">
                        {article.ContentBrief}
                      </p>
                    </div>

                    <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                        <Calendar size={12} />
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${BASE_URL}/${article.ContentSlug}/${article.ContentID}`);
                            toast.success("Article link copied");
                          }}
                          className="p-1.5 border-2 border-black hover:bg-slate-100 transition-colors"
                        >
                          <Copy size={12} />
                        </button>
                        <a
                          href={`${BASE_URL}/${article.ContentSlug}/${article.ContentID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Engineering Footer */}
      <footer className="mt-16 border-t-8 border-black pt-12 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
           <h2 className="text-2xl font-black uppercase italic bg-black text-white inline-block px-4 py-1">Engine_Protocol_v1.0</h2>
           <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Forensic Archive Extraction & News Processing Unit</p>
           <div className="flex justify-center gap-4 mt-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-primary mb-2" />
                <span className="text-[9px] font-black uppercase">Data_Stream_Stable</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-black mb-2" />
                <span className="text-[9px] font-black uppercase">JSON_Interface_Ready</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-slate-200 mb-2" />
                <span className="text-[9px] font-black uppercase">Audit_Logs_Clean</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Somoy;
