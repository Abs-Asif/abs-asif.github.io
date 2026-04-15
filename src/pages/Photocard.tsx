import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Upload, Loader2, Move, Maximize, Calendar, Type, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toBanglaDate, toBanglaNumber } from "@/lib/bangla-utils";
import { cn } from "@/lib/utils";

const REMOVE_BG_API_KEY = "5caof7A3FqdYDNBPsGJWVTqS";

const Photocard = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFileRef = useRef<File | null>(null);

  const [date, setDate] = useState(toBanglaDate(new Date()));
  const [quote, setQuote] = useState("");
  const [sayer, setSayer] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Image adjustments
  const [imgX, setImgX] = useState(50);
  const [imgY, setImgY] = useState(550);
  const [imgScale, setImgScale] = useState(1);
  const [imgWidth, setImgWidth] = useState(400);
  const [imgHeight, setImgHeight] = useState(400);

  // Text adjustments
  const [dateSize, setDateSize] = useState(28);
  const [dateX, setDateX] = useState(940); // Relative to 1000 width background
  const [dateY, setDateY] = useState(80);

  const [quoteSize, setQuoteSize] = useState(48);
  const [quoteX, setQuoteX] = useState(920);
  const [quoteY, setQuoteY] = useState(250);
  const [quoteLineHeight, setQuoteLineHeight] = useState(65);
  const [quoteMaxWidth, setQuoteMaxWidth] = useState(600);

  const [sayerSize, setSayerSize] = useState(42);
  const [sayerX, setSayerX] = useState(920);
  const [sayerYOffset, setSayerYOffset] = useState(40);

  const [descSize, setDescSize] = useState(24);
  const [descX, setDescX] = useState(920);
  const [descYOffset, setDescYOffset] = useState(30);

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [sayerImage, setSayerImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/Quo.png";
    img.onload = () => {
      setBgImage(img);
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
      }
    };

    // Ensure font is loaded
    if (document.fonts) {
      document.fonts.load("bold 42px Kalpurush").then(() => {
        drawCanvas();
      });
    }
  }, []);

  useEffect(() => {
    if (image) {
      setImageLoaded(false);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      img.onload = () => {
        setSayerImage(img);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error("Failed to load image:", image);
        setImageLoaded(false);
      };
    } else {
      setSayerImage(null);
      setImageLoaded(false);
    }

    // Cleanup blob URLs to prevent memory leaks
    return () => {
      if (image && image.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  useEffect(() => {
    drawCanvas();
  }, [
    bgImage, sayerImage, date, quote, sayer, details,
    imgX, imgY, imgScale, imgWidth, imgHeight,
    dateSize, dateX, dateY,
    quoteSize, quoteX, quoteY, quoteLineHeight, quoteMaxWidth,
    sayerSize, sayerX, sayerYOffset,
    descSize, descX, descYOffset
  ]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0);

    if (sayerImage) {
      const sw = imgWidth * imgScale;
      const sh = imgHeight * imgScale;
      ctx.drawImage(sayerImage, imgX, imgY, sw, sh);
    }

    ctx.fillStyle = "white";
    ctx.textAlign = "right";

    // Date
    ctx.font = `300 ${dateSize}px Kalpurush`;
    ctx.fillText(date, dateX, dateY);

    // Quote
    ctx.font = `400 ${quoteSize}px Kalpurush`;
    let currentY = quoteY;

    const lines = wrapText(ctx, quote, quoteMaxWidth);
    lines.forEach((line) => {
      ctx.fillText(line, quoteX, currentY);
      currentY += quoteLineHeight;
    });

    // Sayer Name
    currentY += sayerYOffset;
    ctx.font = `700 ${sayerSize}px Kalpurush`;
    ctx.fillText(sayer, sayerX, currentY);

    // Details
    currentY += descYOffset;
    ctx.font = `300 ${descSize}px Kalpurush`;
    ctx.fillText(details, descX, currentY);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    if (!text) return [];
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    lastFileRef.current = file;

    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    try {
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "image/png" });
        const imageUrl = URL.createObjectURL(blob);
        setImage(imageUrl);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("remove.bg error:", response.status, errorData);
        alert(`Background removal failed: ${errorData.errors?.[0]?.title || response.statusText}`);
      }
    } catch (error) {
      console.error("Processing error:", error);
      alert("An error occurred while processing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImage(file);
  };

  const reloadImage = () => {
    if (lastFileRef.current) {
      processImage(lastFileRef.current);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `photocard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-[4px_4px_0px_0px_#000]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold font-mono uppercase tracking-tighter italic">
            Quote.Photocard_Generator
          </h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-8">
          {/* Controls */}
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 scrollbar-hide">
            {/* Input Config */}
            <div className="p-6 border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_#000]">
              <h2 className="text-xl font-bold mb-4 font-mono uppercase border-b-2 border-foreground pb-2 flex items-center gap-2">
                <Calendar size={20} /> Config
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Date (Bangla)</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 border-2 border-foreground bg-background font-bangla focus:outline-none focus:bg-primary/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Sayer Name</label>
                    <input
                      type="text"
                      value={sayer}
                      onChange={(e) => setSayer(e.target.value)}
                      className="w-full p-2 border-2 border-foreground bg-background font-bangla focus:outline-none focus:bg-primary/10"
                      placeholder="বক্তার নাম..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Quote</label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows={3}
                    className="w-full p-2 border-2 border-foreground bg-background font-bangla focus:outline-none focus:bg-primary/10 resize-none"
                    placeholder="উক্তিটি লিখুন..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Sayer Description</label>
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full p-2 border-2 border-foreground bg-background font-bangla focus:outline-none focus:bg-primary/10"
                    placeholder="পরিচয়/স্লোগান..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase mb-1">Sayer Image</label>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className={cn(
                        "p-2 border-2 border-foreground bg-secondary transition-all flex items-center justify-center gap-2 font-mono uppercase text-sm",
                        isProcessing ? "opacity-50" : "hover:bg-primary hover:text-primary-foreground"
                      )}>
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        {image ? "Change Image" : "Upload Image"}
                      </div>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={isProcessing} />
                    </label>
                    {image && (
                      <button
                        onClick={reloadImage}
                        className="p-2 border-2 border-foreground bg-secondary hover:bg-accent transition-all"
                        title="Retry processing"
                      >
                        <RefreshCw size={18} className={cn(isProcessing && "animate-spin")} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Text Adjustments */}
            <div className="p-6 border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_#000]">
              <h2 className="text-xl font-bold mb-4 font-mono uppercase border-b-2 border-foreground pb-2 flex items-center gap-2">
                <Type size={20} /> Text Adjustments
              </h2>

              <div className="space-y-6">
                {/* Date Controls */}
                <div className="space-y-2 pb-4 border-b border-border">
                  <span className="text-[10px] font-mono text-primary font-bold">DATE_CONTROLS</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase">Size: {dateSize}</label>
                      <input type="range" min="10" max="100" value={dateSize} onChange={(e) => setDateSize(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">X: {dateX}</label>
                      <input type="range" min="0" max="1000" value={dateX} onChange={(e) => setDateX(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">Y: {dateY}</label>
                      <input type="range" min="0" max="1000" value={dateY} onChange={(e) => setDateY(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                  </div>
                </div>

                {/* Quote Controls */}
                <div className="space-y-2 pb-4 border-b border-border">
                  <span className="text-[10px] font-mono text-primary font-bold">QUOTE_CONTROLS</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase">Size: {quoteSize}</label>
                      <input type="range" min="10" max="150" value={quoteSize} onChange={(e) => setQuoteSize(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">X: {quoteX}</label>
                      <input type="range" min="0" max="1000" value={quoteX} onChange={(e) => setQuoteX(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">Y: {quoteY}</label>
                      <input type="range" min="0" max="1000" value={quoteY} onChange={(e) => setQuoteY(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">Line Height: {quoteLineHeight}</label>
                      <input type="range" min="10" max="200" value={quoteLineHeight} onChange={(e) => setQuoteLineHeight(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">Max Width: {quoteMaxWidth}</label>
                      <input type="range" min="100" max="1000" value={quoteMaxWidth} onChange={(e) => setQuoteMaxWidth(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                  </div>
                </div>

                {/* Sayer Controls */}
                <div className="space-y-2 pb-4 border-b border-border">
                  <span className="text-[10px] font-mono text-primary font-bold">SAYER_CONTROLS</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase">Size: {sayerSize}</label>
                      <input type="range" min="10" max="100" value={sayerSize} onChange={(e) => setSayerSize(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">X: {sayerX}</label>
                      <input type="range" min="0" max="1000" value={sayerX} onChange={(e) => setSayerX(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">Y Offset: {sayerYOffset}</label>
                      <input type="range" min="0" max="200" value={sayerYOffset} onChange={(e) => setSayerYOffset(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                  </div>
                </div>

                {/* Description Controls */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-primary font-bold">DESCRIPTION_CONTROLS</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase">Size: {descSize}</label>
                      <input type="range" min="10" max="100" value={descSize} onChange={(e) => setDescSize(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">X: {descX}</label>
                      <input type="range" min="0" max="1000" value={descX} onChange={(e) => setDescX(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase">Y Offset: {descYOffset}</label>
                      <input type="range" min="0" max="200" value={descYOffset} onChange={(e) => setDescYOffset(parseInt(e.target.value))} className="w-full accent-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Adjustments */}
            {image && (
              <div className="p-6 border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_#000]">
                <h2 className="text-xl font-bold mb-4 font-mono uppercase border-b-2 border-foreground pb-2 flex items-center gap-2">
                  <Move size={20} /> Image Adjustments
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">X Position: {imgX}</label>
                    <input
                      type="range"
                      min="-500"
                      max="1000"
                      value={imgX}
                      onChange={(e) => setImgX(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Y Position: {imgY}</label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={imgY}
                      onChange={(e) => setImgY(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Scale: {imgScale.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.01"
                      value={imgScale}
                      onChange={(e) => setImgScale(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase mb-1">Base Width: {imgWidth}</label>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      value={imgWidth}
                      onChange={(e) => setImgWidth(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={downloadImage}
              className="w-full p-4 border-2 border-foreground bg-primary text-primary-foreground font-bold font-mono uppercase text-xl shadow-[8px_8px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <Download size={24} />
              Export Photocard
            </button>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
            <div className="sticky top-8">
              <div className="p-2 border-2 border-foreground bg-white shadow-[12px_12px_0px_0px_#000] max-w-full">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto bg-slate-100"
                  style={{ width: "100%", height: "auto", aspectRatio: "1/1" }}
                />
              </div>
              <div className="mt-4 p-4 border-2 border-foreground bg-secondary/50 font-mono text-[10px] space-y-1">
                <p className={cn("flex items-center gap-2", imageLoaded ? "text-primary" : "text-muted-foreground")}>
                   <div className={cn("w-1.5 h-1.5 rounded-full", imageLoaded ? "bg-primary" : "bg-muted-foreground")} />
                   SAYER_IMAGE_LOADED: {imageLoaded ? "TRUE" : "FALSE"}
                </p>
                <p className="text-muted-foreground italic tracking-tight">
                  {"// Real-time Preview Engine Active"}
                </p>
                {isProcessing && (
                  <p className="text-accent flex items-center gap-2 animate-pulse">
                    <Loader2 size={10} className="animate-spin" /> AI_PROCESSING_BACKGROUND_REMOVAL...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photocard;
