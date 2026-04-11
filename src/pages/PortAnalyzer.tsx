import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Play,
  Copy,
  Terminal,
  ShieldCheck,
  Settings,
  Cpu,
  Globe,
  Database,
  Search,
  Zap,
  Code2,
  FileCode,
  Activity,
  Lock,
  RefreshCcw,
  Hash,
  Link2,
  ExternalLink,
  Save,
  Trash2,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getProxyUrl, fetchWithProxyFallback } from "@/lib/api-utils";

interface Header {
  key: string;
  value: string;
}

const Unlock = ({ size, className }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const TOOLS = [
  // CATEGORY: ENCODERS
  { id: "b64-enc", name: "Base64 Encode", cat: "Encoder", icon: <Lock size={12} /> },
  { id: "b64-dec", name: "Base64 Decode", cat: "Encoder", icon: <Unlock size={12} /> },
  { id: "url-enc", name: "URL Encode", cat: "Encoder", icon: <Link2 size={12} /> },
  { id: "url-dec", name: "URL Decode", cat: "Encoder", icon: <Link2 size={12} /> },
  { id: "hex-enc", name: "Hex Encode", cat: "Encoder", icon: <Hash size={12} /> },
  { id: "hex-dec", name: "Hex Decode", cat: "Encoder", icon: <Hash size={12} /> },
  { id: "html-enc", name: "HTML Escape", cat: "Encoder", icon: <Code2 size={12} /> },
  { id: "html-dec", name: "HTML Unescape", cat: "Encoder", icon: <Code2 size={12} /> },
  { id: "bin-enc", name: "Binary Encode", cat: "Encoder", icon: <Cpu size={12} /> },
  { id: "bin-dec", name: "Binary Decode", cat: "Encoder", icon: <Cpu size={12} /> },

  // CATEGORY: FORMATTERS
  { id: "fmt-json", name: "Format JSON", cat: "Formatter", icon: <FileCode size={12} /> },
  { id: "fmt-xml", name: "Format XML", cat: "Formatter", icon: <FileCode size={12} /> },
  { id: "fmt-css", name: "Format CSS", cat: "Formatter", icon: <FileCode size={12} /> },
  { id: "fmt-js", name: "Format JS", cat: "Formatter", icon: <FileCode size={12} /> },
  { id: "fmt-sql", name: "Format SQL", cat: "Formatter", icon: <Database size={12} /> },
  { id: "jwt-dec", name: "JWT Decode", cat: "Security", icon: <ShieldCheck size={12} /> },
  { id: "morse-enc", name: "Morse Encode", cat: "Encoder", icon: <Activity size={12} /> },
  { id: "morse-dec", name: "Morse Decode", cat: "Encoder", icon: <Activity size={12} /> },
  { id: "rot13", name: "ROT13", cat: "Encoder", icon: <RefreshCcw size={12} /> },
  { id: "rev-str", name: "Reverse String", cat: "Encoder", icon: <RefreshCcw size={12} /> },

  // CATEGORY: SECURITY PAYLOADS
  { id: "sec-xss", name: "XSS Basic", cat: "Payload", icon: <ShieldCheck size={12} /> },
  { id: "sec-xss-img", name: "XSS Image", cat: "Payload", icon: <ShieldCheck size={12} /> },
  { id: "sec-sqli", name: "SQLi Auth Bypass", cat: "Payload", icon: <Database size={12} /> },
  { id: "sec-sqli-union", name: "SQLi Union", cat: "Payload", icon: <Database size={12} /> },
  { id: "sec-pt-linux", name: "Path Trav (Linux)", cat: "Payload", icon: <FileCode size={12} /> },
  { id: "sec-pt-win", name: "Path Trav (Win)", cat: "Payload", icon: <FileCode size={12} /> },
  { id: "sec-ssrf-local", name: "SSRF Localhost", cat: "Payload", icon: <Globe size={12} /> },
  { id: "sec-ssrf-aws", name: "SSRF AWS Meta", cat: "Payload", icon: <Globe size={12} /> },
  { id: "sec-cmd-inj", name: "Command Inj", cat: "Payload", icon: <Terminal size={12} /> },

  // CATEGORY: GENERATORS
  { id: "gen-uuid", name: "UUID v4", cat: "Generator", icon: <Plus size={12} /> },
  { id: "gen-pass", name: "Password (16)", cat: "Generator", icon: <Lock size={12} /> },
  { id: "gen-ts", name: "Timestamp (ms)", cat: "Generator", icon: <Activity size={12} /> },
  { id: "gen-hex-32", name: "Random Hex 32", cat: "Generator", icon: <Hash size={12} /> },
  { id: "gen-hash-md5", name: "MD5 Hash", cat: "Generator", icon: <Activity size={12} /> },
  { id: "gen-hash-sha256", name: "SHA-256 Hash", cat: "Generator", icon: <Activity size={12} /> },

  // CATEGORY: PRESETS
  { id: "pre-fast-api", name: "FAST API LLM", cat: "Preset", icon: <Cpu size={12} /> },
  { id: "pre-json-place", name: "JSONPlaceholder", cat: "Preset", icon: <Globe size={12} /> },
  { id: "pre-bin-http", name: "HTTPBin", cat: "Preset", icon: <Globe size={12} /> },

  // CATEGORY: NETWORK & UTILS
  { id: "net-status-200", name: "Status: 200 OK", cat: "Reference", icon: <Activity size={12} /> },
  { id: "net-status-404", name: "Status: 404 Not Found", cat: "Reference", icon: <Activity size={12} /> },
  { id: "net-status-500", name: "Status: 500 Error", cat: "Reference", icon: <Activity size={12} /> },
  { id: "net-port-ssh", name: "Port: 22 (SSH)", cat: "Reference", icon: <Terminal size={12} /> },
  { id: "net-port-http", name: "Port: 80 (HTTP)", cat: "Reference", icon: <Globe size={12} /> },
  { id: "net-port-https", name: "Port: 443 (HTTPS)", cat: "Reference", icon: <Lock size={12} /> },
  { id: "net-port-mysql", name: "Port: 3306 (DB)", cat: "Reference", icon: <Database size={12} /> },
  { id: "net-port-redis", name: "Port: 6379", cat: "Reference", icon: <Database size={12} /> },
  { id: "net-mime-json", name: "MIME: JSON", cat: "Reference", icon: <FileCode size={12} /> },
  { id: "net-mime-xml", name: "MIME: XML", cat: "Reference", icon: <FileCode size={12} /> },
  { id: "net-mime-html", name: "MIME: HTML", cat: "Reference", icon: <FileCode size={12} /> },
  { id: "net-agent-chrome", name: "UA: Chrome", cat: "Reference", icon: <Globe size={12} /> },
  { id: "net-agent-curl", name: "UA: cURL", cat: "Reference", icon: <Terminal size={12} /> },
  { id: "net-header-cors", name: "Header: CORS", cat: "Reference", icon: <ShieldCheck size={12} /> },
  { id: "net-header-auth", name: "Header: Bearer", cat: "Reference", icon: <Lock size={12} /> },
  { id: "sec-nosqli", name: "NoSQLi Bypass", cat: "Payload", icon: <Database size={12} /> },
  { id: "sec-xxe", name: "XXE Basic", cat: "Payload", icon: <FileCode size={12} /> },
  { id: "sec-graphql", name: "GraphQL Introspect", cat: "Payload", icon: <Globe size={12} /> },
  { id: "gen-email", name: "Random Email", cat: "Generator", icon: <Globe size={12} /> },
  { id: "gen-name", name: "Random Name", cat: "Generator", icon: <Terminal size={12} /> },
  { id: "gen-ipv4", name: "Random IPv4", cat: "Generator", icon: <Globe size={12} /> },
  { id: "net-ip-local", name: "Local IPs", cat: "Reference", icon: <Globe size={12} /> },
  { id: "net-port-ftp", name: "Port: 21 (FTP)", cat: "Reference", icon: <Terminal size={12} /> },
  { id: "net-port-dns", name: "Port: 53 (DNS)", cat: "Reference", icon: <Globe size={12} /> },
  { id: "gen-lorem", name: "Lorem Ipsum", cat: "Generator", icon: <FileCode size={12} /> },
  { id: "sec-lfi", name: "LFI Basic", cat: "Payload", icon: <FileCode size={12} /> },
];

const PortAnalyzer = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("http://103.174.50.235:9002/");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<Header[]>([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState("");
  const [proxyIndex, setProxyIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"response" | "headers" | "raw">("response");
  const [useProxy, setUseProxy] = useState(true);

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const runTool = (id: string) => {
    try {
      let result = "";
      const input = body || rawResponse || "";

      // Presets handle URL and Headers too
      if (id.startsWith("pre-")) {
        switch (id) {
          case "pre-fast-api":
            setUrl("http://103.174.50.235:9002/");
            setMethod("GET");
            setHeaders([{ key: "Content-Type", value: "application/json" }]);
            break;
          case "pre-json-place":
            setUrl("https://jsonplaceholder.typicode.com/posts/1");
            setMethod("GET");
            break;
          case "pre-bin-http":
            setUrl("https://httpbin.org/get");
            setMethod("GET");
            break;
        }
        toast.success(`Preset loaded: ${id}`);
        return;
      }

      switch (id) {
        case "b64-enc": result = btoa(input); break;
        case "b64-dec": result = atob(input); break;
        case "url-enc": result = encodeURIComponent(input); break;
        case "url-dec": result = decodeURIComponent(input); break;
        case "hex-enc":
          result = Array.from(new TextEncoder().encode(input))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');
          break;
        case "hex-dec":
          const hex = input.replace(/\s+/g, '');
          const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
          result = new TextDecoder().decode(bytes);
          break;
        case "html-enc":
          const div = document.createElement('div');
          div.textContent = input;
          result = div.innerHTML;
          break;
        case "html-dec":
          const div2 = document.createElement('div');
          div2.innerHTML = input;
          result = div2.textContent || "";
          break;
        case "bin-enc":
          result = Array.from(input).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
          break;
        case "bin-dec":
          result = input.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
          break;
        case "fmt-json":
          result = JSON.stringify(JSON.parse(input), null, 2);
          break;
        case "fmt-xml":
          const xmlP = new DOMParser().parseFromString(input, "text/xml");
          const xslt = new DOMParser().parseFromString(
            `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
              <xsl:output omit-xml-declaration="yes" indent="yes"/>
              <xsl:template match="node()|@*"><xsl:copy><xsl:apply-templates match="node()|@*"/></xsl:copy></xsl:template>
            </xsl:stylesheet>`, "text/xml");
          const processor = new XSLTProcessor();
          processor.importStylesheet(xslt);
          const resultDoc = processor.transformToDocument(xmlP);
          result = new XMLSerializer().serializeToString(resultDoc);
          break;
        case "fmt-css":
          result = input.replace(/\s*([\{\};,])\s*/g, '$1\n  ').replace(/\n\s*\}/g, '\n}');
          break;
        case "fmt-js":
          result = input.replace(/([\{\};])\s*/g, '$1\n  ');
          break;
        case "fmt-sql":
          result = input.replace(/\s+(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|GROUP|ORDER|LIMIT)\s+/gi, '\n$1 ');
          break;
        case "morse-enc":
          const charMap: any = { 'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
          result = input.toLowerCase().split('').map(c => charMap[c] || c).join(' ');
          break;
        case "morse-dec":
          const morseMap: any = { '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd', '.': 'e', '..-.': 'f', '--.': 'g', '....': 'h', '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l', '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p', '--.-': 'q', '.-.': 'r', '...': 's', '-': 't', '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x', '-.--': 'y', '--..': 'z', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9', '-----': '0', '/': ' ' };
          result = input.split(' ').map(c => morseMap[c] || c).join('');
          break;
        case "rot13":
          result = input.replace(/[a-zA-Z]/g, (c: any) => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
          break;
        case "rev-str":
          result = input.split('').reverse().join('');
          break;
        case "sec-xss": result = "<script>alert('XSS')</script>"; break;
        case "sec-xss-img": result = "<img src=x onerror=alert('XSS')>"; break;
        case "sec-sqli": result = "' OR '1'='1"; break;
        case "sec-sqli-union": result = "' UNION SELECT NULL,NULL,NULL--"; break;
        case "sec-pt-linux": result = "../../../../../etc/passwd"; break;
        case "sec-pt-win": result = "..\\..\\..\\..\\..\\windows\\win.ini"; break;
        case "sec-ssrf-local": result = "http://127.0.0.1:80"; break;
        case "sec-ssrf-aws": result = "http://169.254.169.254/latest/meta-data/"; break;
        case "sec-cmd-inj": result = "; cat /etc/passwd"; break;

        case "gen-uuid":
          result = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          });
          break;
        case "gen-pass":
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
          result = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
          break;
        case "gen-ts": result = Date.now().toString(); break;
        case "gen-hex-32":
          result = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case "gen-hash-md5":
          toast.info("MD5 requires external lib, returning stub");
          result = "HASH_PLACEHOLDER_MD5";
          break;

        case "net-status-200": result = "200 OK: Standard response for successful HTTP requests."; break;
        case "net-status-404": result = "404 Not Found: The requested resource could not be found but may be available in the future."; break;
        case "net-status-500": result = "500 Internal Server Error: A generic error message, given when an unexpected condition was encountered."; break;
        case "net-port-ssh": result = "22"; break;
        case "net-port-http": result = "80"; break;
        case "net-port-https": result = "443"; break;
        case "net-port-mysql": result = "3306"; break;
        case "net-port-redis": result = "6379"; break;
        case "net-mime-json": result = "application/json"; break;
        case "net-mime-xml": result = "application/xml"; break;
        case "net-mime-html": result = "text/html"; break;
        case "net-agent-chrome": result = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"; break;
        case "net-agent-curl": result = "curl/7.64.1"; break;
        case "net-header-cors":
          setHeaders([...headers, { key: "Access-Control-Allow-Origin", value: "*" }]);
          return;
        case "net-header-auth":
          setHeaders([...headers, { key: "Authorization", value: "Bearer [TOKEN]" }]);
          return;
        case "sec-nosqli": result = '{"$gt": ""}'; break;
        case "sec-xxe": result = '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>'; break;
        case "sec-graphql": result = '{ __schema { types { name fields { name } } } }'; break;
        case "gen-email": result = `user_${Math.floor(Math.random() * 1000)}@example.com`; break;
        case "gen-name":
          const names = ["Alice", "Bob", "Charlie", "Dave", "Eve"];
          result = names[Math.floor(Math.random() * names.length)];
          break;
        case "gen-ipv4":
          result = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
          break;
        case "net-ip-local":
          result = "127.0.0.1, 10.0.0.1, 192.168.1.1, 172.16.0.1, 0.0.0.0";
          break;
        case "net-port-ftp": result = "21"; break;
        case "net-port-dns": result = "53"; break;
        case "gen-lorem": result = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."; break;
        case "sec-lfi": result = "/etc/passwd\x00"; break;

        case "jwt-dec":
          const parts = input.split('.');
          if (parts.length !== 3) throw new Error("Invalid JWT");
          result = JSON.stringify({
            header: JSON.parse(atob(parts[0])),
            payload: JSON.parse(atob(parts[1])),
            signature: "[REDACTED]"
          }, null, 2);
          break;
        default:
          toast.info("Tool logic not implemented yet");
          return;
      }

      if (result) {
        setBody(result);
        toast.success(`Executed: ${id}`);
      }
    } catch (err: any) {
      toast.error("Tool Error: " + err.message);
    }
  };

  const executeRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    setRawResponse("");
    setProxyIndex(null);

    const headerObj: Record<string, string> = {};
    headers.forEach(h => {
      if (h.key) headerObj[h.key] = h.value;
    });

    try {
      let finalUrl = url;
      if (useProxy) {
        // Simple proxying
        const proxied = getProxyUrl(url);
        const res = await fetch(proxied, {
          method,
          headers: method !== "GET" ? headerObj : undefined,
          body: method !== "GET" && body ? body : undefined
        });
        const text = await res.text();
        setRawResponse(text);
        try {
          setResponse(JSON.parse(text));
        } catch {
          setResponse(text);
        }
        toast.success("Request executed via proxy");
      } else {
        const res = await fetch(url, {
          method,
          headers: headerObj,
          body: method !== "GET" && body ? body : undefined
        });
        const text = await res.text();
        setRawResponse(text);
        try {
          setResponse(JSON.parse(text));
        } catch {
          setResponse(text);
        }
        toast.success("Direct request executed");
      }
    } catch (err: any) {
      toast.error("Request failed: " + err.message);
      setRawResponse("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-black uppercase tracking-tighter">Port_Analyzer</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Automation & Interrogation Engine</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-center w-full lg:w-auto">
          <button
            onClick={executeRequest}
            disabled={isLoading}
            className="px-8 py-3 bg-primary text-white border-2 border-black shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase font-black flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            Execute_Probe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request Engine */}
        <div className="lg:col-span-5 space-y-6">
          <section className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Terminal size={20} /> Request_Config
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-24 border-2 border-black px-2 font-bold bg-white focus:bg-primary/5 outline-none h-12"
                >
                  {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://target:port/endpoint"
                  className="flex-1 border-2 border-black px-3 font-bold h-12"
                />
              </div>

              <div className="flex items-center gap-2">
                 <button
                   onClick={() => setUseProxy(!useProxy)}
                   className={cn("px-4 py-2 border-2 border-black text-[10px] font-black uppercase flex items-center gap-2 transition-all", useProxy ? "bg-black text-white" : "bg-white text-black")}
                 >
                   {useProxy ? <Lock size={12} /> : <Unlock size={12} />}
                   Proxy: {useProxy ? "ENABLED" : "DISABLED"}
                 </button>
                 <span className="text-[10px] font-bold text-slate-400 uppercase italic">CORS Bypass Active</span>
              </div>

              <div className="space-y-4 pt-4 border-t-2 border-black border-dashed">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase flex items-center gap-2"><Database size={14} /> Headers</label>
                  <button onClick={addHeader} className="p-1 border-2 border-black hover:bg-slate-100"><Plus size={14} /></button>
                </div>
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Key"
                      value={h.key}
                      onChange={(e) => updateHeader(i, "key", e.target.value)}
                      className="flex-1 border-2 border-black px-2 py-1 text-xs font-bold"
                    />
                    <input
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => updateHeader(i, "value", e.target.value)}
                      className="flex-1 border-2 border-black px-2 py-1 text-xs font-bold"
                    />
                    <button onClick={() => removeHeader(i)} className="p-1 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              {method !== "GET" && (
                <div className="space-y-2 pt-4 border-t-2 border-black border-dashed">
                  <label className="text-xs font-black uppercase flex items-center gap-2"><FileCode size={14} /> Payload_Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full h-32 border-2 border-black p-3 font-bold text-xs outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Cyber Toolkit */}
          <section className="border-4 border-black p-6 bg-slate-50 shadow-[6px_6px_0_0_#000]">
             <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <Zap size={20} /> Toolkit_V1.0
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic mb-4">Populates body or processes data</p>

            <div className="space-y-6">
              {["Preset", "Payload", "Generator", "Encoder", "Formatter", "Security", "Reference"].map(cat => (
                <div key={cat} className="space-y-2">
                  <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-0.5">{cat}_Modules</span>
                  <div className="grid grid-cols-2 gap-2">
                    {TOOLS.filter(t => t.cat === cat).map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => runTool(tool.id)}
                        className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase text-left group"
                      >
                        <span className="group-hover:scale-110 transition-transform">{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Results Engine */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_#000] min-h-[600px] flex flex-col">
            <div className="flex border-b-4 border-black bg-slate-900 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("response")}
                className={cn("flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap", activeTab === "response" ? "bg-primary text-white" : "bg-slate-900 text-slate-400 hover:text-white")}
              >
                Structured_Output
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={cn("flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-l-2 border-slate-800", activeTab === "raw" ? "bg-primary text-white" : "bg-slate-900 text-slate-400 hover:text-white")}
              >
                Raw_Stream
              </button>
              <button
                onClick={() => setActiveTab("headers")}
                className={cn("flex-1 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-l-2 border-slate-800", activeTab === "headers" ? "bg-primary text-white" : "bg-slate-900 text-slate-400 hover:text-white")}
              >
                Response_Headers
              </button>
            </div>

            <div className="flex-1 p-6 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-tighter">Interrogating_Host...</p>
                </div>
              )}

              {activeTab === "response" && (
                <div className="h-full">
                  {response ? (
                    <pre className="text-xs font-bold text-slate-800 overflow-auto max-h-[500px] p-4 bg-slate-50 border-2 border-black">
                      {typeof response === 'object' ? JSON.stringify(response, null, 2) : response}
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-40 border-2 border-black border-dashed">
                      <Activity size={48} className="text-slate-200 mb-4" />
                      <p className="text-[10px] font-black uppercase text-slate-300">Awaiting_Protocol_Execution</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "raw" && (
                <div className="h-full">
                  <div className="flex justify-between mb-2">
                    <span className="text-[9px] font-black uppercase text-slate-400">Buffer_Stream</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(rawResponse); toast.success("Copied"); }}
                      className="p-1 border-2 border-black hover:bg-slate-100"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <pre className="text-[10px] font-bold text-primary bg-slate-900 p-4 border-2 border-black overflow-auto max-h-[500px] h-full min-h-[400px]">
                    {rawResponse || "EMPTY_BUFFER"}
                  </pre>
                </div>
              )}

              {activeTab === "headers" && (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-black border-dashed">
                  <Lock size={48} className="text-slate-200 mb-4" />
                  <p className="text-[10px] font-black uppercase text-slate-300">Headers_Encapsulated_By_Proxy</p>
                </div>
              )}
            </div>

            <div className="border-t-4 border-black p-4 bg-slate-50 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", response ? "bg-green-500" : "bg-slate-300")} />
                  <span className="text-[9px] font-black uppercase">Status: {response ? "STABLE" : "IDLE"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={12} className="text-slate-400" />
                  <span className="text-[9px] font-black uppercase">Proxy: {useProxy ? "TUNNELED" : "DIRECT"}</span>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Protocol_V4.0_Alpha</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortAnalyzer;
