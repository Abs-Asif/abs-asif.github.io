import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, QrCode } from "lucide-react";
import { Footer } from "@/components/Footer";

const QRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const generateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text.trim())}`;
    setQrUrl(url);
  };

  const downloadQR = async () => {
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-4xl mx-auto px-6 py-6">
        <div className="mb-8 flex items-center gap-6 animate-fade-in-up">
          <Link
            to="/tools"
            className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
            aria-label="Back to tools"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">QR Code Generator</h1>
            <p className="text-muted-foreground">Create QR codes for URLs or text.</p>
          </div>
        </div>

        <form onSubmit={generateQR} className="mb-8 animate-fade-in-up">
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL here..."
              className="w-full bg-m3-primary-container/20 border-2 border-transparent focus:border-m3-primary/30 p-6 rounded-[2rem] outline-none text-lg min-h-[150px] transition-all shadow-inner resize-none"
            />
            <button
              type="submit"
              className="w-full bg-m3-primary text-m3-on-primary p-6 rounded-[2rem] font-bold text-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg"
            >
              Generate QR Code
            </button>
          </div>
        </form>

        {qrUrl && (
          <div className="flex flex-col items-center gap-8 animate-fade-in-up bg-white p-12 rounded-[3rem] shadow-xl border border-border">
            <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold hover:bg-secondary/80 transition-all"
            >
              <Download size={20} />
              Download PNG
            </button>
          </div>
        )}

        {!qrUrl && (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <QrCode size={120} />
            <p className="text-xl font-bold mt-4">Your QR code will appear here</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QRCodeGenerator;
