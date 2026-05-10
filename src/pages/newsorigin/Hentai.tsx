import { useEffect, useState } from "react";
import { NewsOriginLoader } from "@/components/NewsOriginLoader";
import { Link } from "react-router-dom";
import { getApiUrl } from "@/lib/newsorigin-utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ListBulletIcon, DocumentIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Footer } from "@/components/Footer";

const defaultUrl = "";

export const baseStyle = { transitionDuration: "650ms", transitionTimingFunction: "ease-out" };
export const hiddenStyle = { opacity: 0, transform: "translateY(3em)", filter: "blur(4px)" };

interface MangaMetadata {
  title?: string;
  image?: string;
  numPages: number;
}

export default function NewsOriginHentai() {
  const [url, setUrl] = useState(defaultUrl);
  const [metadata, setMetadata] = useState<MangaMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [fetchTime, setFetchTime] = useState<number | null>(null);
  const [host, setHost] = useState("");
  const [protocol, setProtocol] = useState("https:");
  const [readerMode, setReaderMode] = useState<"vertical" | "horizontal">("vertical");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = "HentaiOrigin | Manga Reader";
    if (typeof window !== "undefined") {
      setHost(window.location.host);
      setProtocol(window.location.protocol);
    }
  }, []);

  const fetchData = async () => {
    setError(null);
    setFetchTime(null);
    const start = Date.now();
    try {
      if (!url) throw new Error("URL is required");
      const validUrl = new URL(!url.includes("http://") && !url.includes("https://") ? `https://${url}` : url);
      setLoading(true);
      const response = await fetch(getApiUrl(`/api/get?url=${encodeURIComponent(validUrl.toString())}`));

      if (!response.ok) {
        let errorMessage = `Fetch failed with status ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMetadata(data);
      setCurrentPage(1);
      setReaderMode("vertical");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
      setMetadata(null);
    } finally {
      const end = Date.now();
      const duration = end - start;
      setFetchTime(duration);
      if (duration < 1000) await new Promise((resolve) => setTimeout(resolve, 1000 - duration));
      setLoading(false);
    }
  };

  const getImageUrl = (pageNumber: number) => {
    if (!metadata || !metadata.image) return "";

    let originalUrl = "";
    try {
        const proxiedUrl = new URL(metadata.image, `${protocol}//${host}`);
        originalUrl = proxiedUrl.searchParams.get("url") || metadata.image;
    } catch (e) {
        originalUrl = metadata.image;
    }

    if (!originalUrl) return "";

    const lastSlashIndex = originalUrl.lastIndexOf("/");
    const base = originalUrl.substring(0, lastSlashIndex);
    const imageBase = base.replace("://t", "://i");

    let ext = ".webp";
    const lowerUrl = originalUrl.toLowerCase();
    if (lowerUrl.includes(".jpg")) ext = ".jpg";
    else if (lowerUrl.includes(".png")) ext = ".png";

    const transformed = `${imageBase}/${pageNumber}${ext}`;
    return getApiUrl(`/api/get?url=${encodeURIComponent(transformed)}`);
  };

  return (
    <div className="min-h-screen bg-background text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      <ToastContainer position="bottom-right" theme="dark" />
      <main className="flex-grow flex flex-col items-center gap-6 p-4 pt-10 sm:gap-12 sm:p-12 md:p-24">

        <div className="w-full max-w-4xl flex justify-between items-center">
            <Link
                to="/tools"
                className="flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Tools
            </Link>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest opacity-50">
                <Link to="/tools/newsorigin" className="hover:text-blue-600">News</Link>
                <Link to="/tools/newsorigin/v2" className="hover:text-blue-600">Article</Link>
                <Link to="/tools/newsorigin/json" className="hover:text-blue-600">JSON</Link>
                <Link to="/tools/newsorigin/hentai" className="text-blue-600 dark:text-blue-400">Manga</Link>
            </div>
        </div>

        <div className="relative m-auto flex flex-col items-center after:absolute after:top-0 after:-z-20 after:h-[180px] after:w-[180px] after:animate-pulse after:bg-gradient-to-r after:from-pink-200 after:via-purple-200 after:blur-2xl after:content-[''] after:sm:w-[360px] before:lg:h-[360px] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-purple-700/10 after:dark:from-pink-900 after:dark:via-[#ff01ea]/40">
            <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-6xl" style={{ overflowWrap: "anywhere" }}>
            HentaiOrigin
            </h1>
            <h2 className="mt-2 text-center text-lg font-medium opacity-80 sm:text-2xl md:text-3xl">
            Minimalist Manga Reader
            </h2>
        </div>

        {!metadata && (
            <div className="w-full max-w-4xl font-sans">
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <div className="p-4 sm:p-6">
                    <h3 className="mb-4 text-base font-semibold sm:text-lg">Enter gallery URL</h3>
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                    <div className="group flex flex-grow items-center overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 dark:border-neutral-700 dark:bg-neutral-800">
                        <input
                        type="text"
                        className="w-full bg-transparent px-4 py-2 font-mono text-sm outline-none placeholder:text-neutral-400"
                        placeholder="https://nhentai.net/g/645120/"
                        value={url}
                        onChange={(e) => setUrl(e.target.value.trim())}
                        onKeyDown={async (e) => {
                            if (e.key === "Enter") await fetchData();
                        }}
                        />
                        {url && (
                        <button
                            className="mr-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                            onClick={() => setUrl("")}
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                        )}
                    </div>
                    <button
                        className="rounded-lg bg-purple-600 px-6 py-2 font-bold text-white transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        {loading ? "Fetching..." : "Read"}
                    </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Tip: Paste the gallery URL to start reading.
                    </p>
                    {fetchTime && (
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Time: {fetchTime >= 1000 ? `${(fetchTime / 1000).toFixed(2)}s` : `${fetchTime}ms`}
                        </p>
                    )}
                    </div>
                </div>
                </div>
            </div>
        )}

        {loading && <NewsOriginLoader className="m-4" />}

        {error && !loading && <p className="p-4 text-red-500">Error: {error.message}</p>}

        {metadata && !loading && (
            <div className="w-full max-w-5xl">
                <div className="mb-8 flex flex-col items-center gap-4">
                    <h3 className="text-center text-xl font-bold px-4">{metadata.title}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setReaderMode("vertical")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${readerMode === 'vertical' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'}`}
                        >
                            <ListBulletIcon className="h-4 w-4" />
                            Scroll
                        </button>
                        <button
                            onClick={() => setReaderMode("horizontal")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${readerMode === 'horizontal' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'}`}
                        >
                            <DocumentIcon className="h-4 w-4" />
                            Single
                        </button>
                        <button
                            onClick={() => setMetadata(null)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            Close
                        </button>
                    </div>
                </div>

                {metadata.numPages > 0 ? (
                    <div className="flex flex-col items-center">
                        {readerMode === "vertical" ? (
                        <div className="flex w-full flex-col gap-0 bg-black">
                            {Array.from({ length: metadata.numPages }, (_, i) => i + 1).map((page) => (
                            <img
                                key={page}
                                src={getImageUrl(page)}
                                alt={`Page ${page}`}
                                className="w-full"
                                loading="lazy"
                                onClick={() => {
                                    setCurrentPage(page);
                                    setReaderMode("horizontal");
                                    window.scrollTo({ top: 0, behavior: 'auto' });
                                }}
                            />
                            ))}
                        </div>
                        ) : (
                        <div className="relative flex w-full flex-col items-center bg-black">
                            <div className="group relative w-full flex justify-center overflow-hidden">
                                <img
                                    src={getImageUrl(currentPage)}
                                    alt={`Page ${currentPage}`}
                                    className="max-w-full h-auto"
                                />
                                <div
                                    className="absolute inset-y-0 left-0 w-1/2 cursor-pointer z-10"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 w-1/2 cursor-pointer z-10"
                                    onClick={() => {
                                        if (currentPage === metadata.numPages) {
                                            setReaderMode("vertical");
                                        } else {
                                            setCurrentPage(prev => Math.min(metadata.numPages, prev + 1));
                                        }
                                    }}
                                />

                                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-black/70 px-6 py-2 text-white backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-20">
                                    <span className="text-sm font-bold">
                                        {currentPage} / {metadata.numPages}
                                    </span>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-12 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                        <p className="text-lg opacity-50">Could not extract pages. Make sure the URL is a valid gallery.</p>
                    </div>
                )}
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
