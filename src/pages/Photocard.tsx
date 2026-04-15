import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Upload, Loader2, Move, Maximize, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toBanglaDate, toBanglaNumber } from "@/lib/bangla-utils";
import { cn } from "@/lib/utils";

const Photocard = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [date, setDate] = useState(toBanglaDate(new Date()));
  const [quote, setQuote] = useState("");
  const [sayer, setSayer] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Image adjustments
  const [imgX, setImgX] = useState(0);
  const [imgY, setImgY] = useState(600); // Start near the bottom red corner
  const [imgScale, setImgScale] = useState(1);
  const [imgWidth, setImgWidth] = useState(400);
  const [imgHeight, setImgHeight] = useState(400);

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [sayerImage, setSayerImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/Quo.png";
    img.onload = () => {
      setBgImage(img);
      // Once background is loaded, set canvas size to match background
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
      }
    };
  }, []);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      img.onload = () => {
        setSayerImage(img);
      };
    } else {
      setSayerImage(null);
    }
  }, [image]);

  useEffect(() => {
    drawCanvas();
  }, [bgImage, sayerImage, date, quote, sayer, details, imgX, imgY, imgScale, imgWidth, imgHeight]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(bgImage, 0, 0);

    // Draw Sayer image
    if (sayerImage) {
      const sw = imgWidth * imgScale;
      const sh = imgHeight * imgScale;
      ctx.drawImage(sayerImage, imgX, imgY, sw, sh);
    }

    // Set font style
    ctx.fillStyle = "white";
    ctx.textAlign = "right";

    // Draw Date (Top right)
    ctx.font = "300 28px Kalpurush";
    ctx.fillText(date, canvas.width - 60, 80);

    // Draw Quote (Left blank spot, right oriented)
    // The blank spot is roughly on the left half.
    // We'll use a specific margin from right to center it in the black area.
    ctx.font = "400 48px Kalpurush";
    const xMarginRight = 80;
    const maxWidth = canvas.width * 0.55;
    const x = canvas.width - xMarginRight;
    let y = 250;

    const lines = wrapText(ctx, quote, maxWidth);
    lines.forEach((line) => {
      ctx.fillText(line, x, y);
      y += 65;
    });

    // Draw Sayer Name (Bold)
    y += 40;
    ctx.font = "700 42px Kalpurush";
    ctx.fillText(sayer, x, y);

    // Draw Details (Thin/Small)
    y += 55;
    ctx.font = "300 24px Kalpurush";
    ctx.fillText(details, x, y);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const cloudName = "dgj9dzyyo";
    const uploadPreset = "ml_default"; // Attempting standard default preset

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Construct URL with background removal
        // Cloudinary background removal transformation: e_background_removal
        // We use the version and public_id to get the processed image
        const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
        const processedUrl = `${baseUrl}/e_background_removal/v${data.version}/${data.public_id}.png`;

        // Test if the image is ready (it's async, might return 423)
        // For simplicity in this UI, we'll just set it and let the browser retry if it supports it,
        // or we could poll. Let's set it.
        setImage(processedUrl);
      } else {
        const errorData = await response.json();
        console.error("Cloudinary upload failed:", errorData);
        // Fallback to local image if upload fails (e.g. no preset)
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
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
      <div className="max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="p-6 border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_#000]">
              <h2 className="text-xl font-bold mb-4 font-mono uppercase border-b-2 border-foreground pb-2">Config</h2>

              <div className="space-y-4">
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
                  <label className="block text-xs font-mono uppercase mb-1">Quote</label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows={4}
                    className="w-full p-2 border-2 border-foreground bg-background font-bangla focus:outline-none focus:bg-primary/10 resize-none"
                    placeholder="উক্তিটি লিখুন..."
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
                      <div className="p-2 border-2 border-foreground bg-secondary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2 font-mono uppercase text-sm">
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                        {image ? "Change Image" : "Upload Image"}
                      </div>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustments */}
            {image && (
              <div className="p-6 border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_#000]">
                <h2 className="text-xl font-bold mb-4 font-mono uppercase border-b-2 border-foreground pb-2">Image Adjustments</h2>
                <div className="grid grid-cols-2 gap-4">
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
                      max="3"
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
                      max="1000"
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
            <div className="p-2 border-2 border-foreground bg-white shadow-[12px_12px_0px_0px_#000] max-w-full overflow-auto">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto bg-slate-100"
                style={{ width: "100%", height: "auto", aspectRatio: "1/1" }}
              />
            </div>
            <p className="mt-4 text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
              {"// Real-time Preview Engine Active"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photocard;
