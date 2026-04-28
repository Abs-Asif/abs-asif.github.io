import { useState } from "react";
import { Copy, Download, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import nidFront from "@/assets/nid-front.png";
import nidBack from "@/assets/nid-back.png";

const NID = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const personalInfo = [
    { label: "নাম (বাংলা)", value: "আব্দুল্লাহ বারী আসিফ" },
    { label: "Name (English)", value: "ABDULLAH BARI ASIF" },
    { label: "পিতার নাম", value: "আব্দুল্লাহ আল মাসুম" },
    { label: "মাতার নাম", value: "ববি আক্তার" },
    { label: "জন্ম তারিখ", value: "৩০ ডিসেম্বর ১৯৯৮" },
    { label: "NID নম্বর", value: "৫১১৯৪৬৫৪৩০" },
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={18} />
          <span>ফিরে যান</span>
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-primary">জাতীয় পরিচয়পত্র (NID)</h1>

        <div className="space-y-8">
          {/* Information Section */}
          <section className="islamic-card">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-border/50">প্রয়োজনীয় তথ্য</h2>
            <div className="grid gap-4">
              {personalInfo.map((info) => (
                <div key={info.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/20 group">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{info.label}</p>
                    <p className="font-medium">{info.value}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(info.value, info.label)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                    title="কপি করুন"
                  >
                    {copied === info.label ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Documents Section (Download Only, No Preview) */}
          <section className="islamic-card">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-border/50">ডাউনলোড</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href={nidFront}
                download="NID_Front_Asif.png"
                className="w-full py-4 rounded-xl bg-primary text-white flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-md font-bold"
              >
                <Download size={20} />
                <span>NID সামনের দিক</span>
              </a>

              <a
                href={nidBack}
                download="NID_Back_Asif.png"
                className="w-full py-4 rounded-xl bg-primary text-white flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-md font-bold"
              >
                <Download size={20} />
                <span>NID পেছনের দিক</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NID;
