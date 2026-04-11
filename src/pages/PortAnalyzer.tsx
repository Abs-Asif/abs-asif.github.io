import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Play,
  Globe,
  Activity,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Link2,
  Terminal,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getProxyUrl } from "@/lib/api-utils";

interface PortResult {
  port: number;
  protocol: "http" | "https";
  status: "open" | "closed" | "checking";
  url: string;
}

const PortAnalyzer = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState("103.174.50.235");
  const [startPort, setStartPort] = useState(9000);
  const [endPort, setEndPort] = useState(9010);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const [progress, setProgress] = useState(0);

  const cleanTarget = (val: string) => {
    return val.replace(/^https?:\/\//, "").split(":")[0].split("/")[0];
  };

  const checkPort = async (host: string, port: number, protocol: "http" | "https"): Promise<PortResult> => {
    const url = `${protocol}://${host}:${port}/`;
    // Use AllOrigins (proxy index 1) as it's the most reliable for raw data
    const proxyIndex = 1;

    try {
      const proxied = getProxyUrl(url, proxyIndex);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(proxied, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        // If AllOrigins returns content, the port is open.
        // Even if it's an error page from the target, the port accepted the connection.
        // We just want to filter out AllOrigins' own error messages if possible.
        const allOriginsErrors = ["Error: Connection refused", "Too Many Requests", "Oops... Request Timeout."];
        const isInternalError = allOriginsErrors.some(msg => text.includes(msg));

        if (text && !isInternalError) {
            return { port, protocol, status: "open", url };
        }
      }
    } catch (err) {
      // connection failed or timeout
    }

    return { port, protocol, status: "closed", url };
  };

  const startScan = async () => {
    const host = cleanTarget(target);
    if (!host) {
      toast.error("Invalid Target Host");
      return;
    }

    if (startPort > endPort) {
      toast.error("Start port must be less than end port");
      return;
    }

    if (endPort - startPort > 100) {
      toast.warning("Scanning more than 100 ports may be slow and trigger proxy limits.");
    }

    setIsScanning(true);
    setResults([]);
    setProgress(0);

    const total = (endPort - startPort + 1) * 2;
    let completed = 0;
    const newResults: PortResult[] = [];

    // Create all check tasks
    const tasks: { port: number; protocol: "http" | "https" }[] = [];
    for (let p = startPort; p <= endPort; p++) {
      tasks.push({ port: p, protocol: "http" });
      tasks.push({ port: p, protocol: "https" });
    }

    // Run in parallel with concurrency limit
    const concurrency = 3;
    const executeTask = async (task: typeof tasks[0]) => {
      const result = await checkPort(host, task.port, task.protocol);
      if (result.status === "open") {
        newResults.push(result);
        setResults(prev => {
          const updated = [...prev, result];
          updated.sort((a, b) => a.port - b.port);
          return updated;
        });
      }
      completed++;
      setProgress(Math.round((completed / total) * 100));
    };

    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      await Promise.all(batch.map(executeTask));
    }

    setIsScanning(false);
    toast.success(`Scan Complete. Found ${newResults.length} open protocols.`);
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono p-4 md:p-8">
      {/* Brutalist Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 border-4 border-black p-4 bg-white shadow-[8px_8px_0_0_#000]">
        <div className="flex items-center gap-4 self-stretch lg:self-auto">
          <button onClick={() => navigate("/")} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0_0_#000]">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Port_Scanner</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase italic">Network Vulnerability & Service Audit</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-center w-full lg:w-auto">
          <button
            onClick={startScan}
            disabled={isScanning}
            className="px-8 py-3 bg-primary text-white border-2 border-black shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase font-black flex items-center gap-2"
          >
            {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Execute_Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <section className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2">
              <Terminal size={20} /> Parameters
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase">Target Host/IP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 103.174.50.235"
                    className="w-full h-12 border-2 border-black px-4 font-bold focus:bg-primary/5 outline-none"
                  />
                  <Globe className="absolute right-3 top-3 text-slate-300" size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Start Port</label>
                  <input
                    type="number"
                    value={startPort}
                    onChange={(e) => setStartPort(parseInt(e.target.value) || 0)}
                    className="w-full h-12 border-2 border-black px-4 font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">End Port</label>
                  <input
                    type="number"
                    value={endPort}
                    onChange={(e) => setEndPort(parseInt(e.target.value) || 0)}
                    className="w-full h-12 border-2 border-black px-4 font-bold outline-none"
                  />
                </div>
              </div>

              {isScanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span>Scan_Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-4 border-2 border-black bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="border-4 border-black p-6 bg-slate-900 text-white shadow-[6px_6px_0_0_#000]">
             <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 text-primary">
              <ShieldCheck size={20} /> Security_Notice
            </h2>
            <ul className="text-[10px] font-bold space-y-3 uppercase italic text-slate-400">
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-primary mt-1 shrink-0" /> Requests are tunneled through AllOrigins/EveryOrigin proxies.</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-primary mt-1 shrink-0" /> Accuracy depends on proxy capabilities for non-standard ports.</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-primary mt-1 shrink-0" /> Browsers may restrict certain ports (bypassed via proxy).</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-primary mt-1 shrink-0" /> Use this tool responsibly for authorized auditing only.</li>
            </ul>
          </section>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000] min-h-[500px] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b-4 border-black">
              <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Discovery_Matrix
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Hits: {results.length}</span>
            </div>

            <div className="flex-1 p-6">
              {results.length === 0 && !isScanning && (
                <div className="h-full flex flex-col items-center justify-center py-32 border-2 border-black border-dashed bg-slate-50">
                   <Globe size={48} className="text-slate-200 mb-4" />
                   <p className="text-[10px] font-black uppercase text-slate-400">No active services detected in range.</p>
                </div>
              )}

              {isScanning && results.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-32 border-2 border-black border-dashed bg-slate-50">
                   <Loader2 size={48} className="text-primary animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase animate-pulse">Probing_Neural_Network...</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((res, i) => (
                  <div key={i} className="border-4 border-black p-4 bg-white flex flex-col gap-4 group hover:shadow-[4px_4px_0_0_#000] transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase",
                            res.protocol === "https" ? "bg-primary text-white" : "bg-yellow-400 text-black"
                          )}>
                            {res.protocol}
                          </span>
                          <span className="text-lg font-black tracking-tighter">PORT: {res.port}</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 truncate max-w-[200px] uppercase">
                          {res.url}
                        </p>
                      </div>
                      <div className="bg-green-100 text-green-600 p-1 border-2 border-green-600">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                       <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1">
                         <Zap size={10} className="text-primary" /> Active_Listener
                       </span>
                       <a
                         href={res.url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[9px] font-black uppercase border-2 border-black hover:bg-white hover:text-black transition-all shadow-[2px_2px_0_0_#000] hover:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                       >
                         Launch <ExternalLink size={10} />
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-4 border-black p-4 bg-slate-50 flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
              <div className="flex gap-4">
                <span>Protocol: TCP/IP</span>
                <span>Gate: Multi-Proxy</span>
              </div>
              <span className="tracking-widest italic">Node_Interrogation_Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortAnalyzer;
