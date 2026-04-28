import { useState, useMemo } from "react";
import { Search, X, ChevronRight, MessageCircle, Facebook, Mail } from "lucide-react";
import calligraphyImg from "@/assets/calligraphy-header.png";
import gramroktiLogo from "@/assets/gramrokti-logo.png";
import greenhutLogo from "@/assets/greenhut-logo.png";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const islamicLinks = [
    {
      title: "Hadith Verification - الدرর السنية",
      url: "https://www.hdith.com/",
      summary: "রাসূলুল্লাহ (সা.)-এর হাদীসের বিশুদ্ধতা যাচাই করার জন্য সবচেয়ে দ্রুত এবং নির্ভরযোগ্য মাধ্যম।",
      tags: ["hadith", "verify", "authenticity", "হাদীস", "যাচাই"]
    },
    {
      title: "HadithBD - বৃহত্তম বাংলা হাদীস ডেটাবেজ",
      url: "https://www.hadithbd.com/",
      summary: "বাংলা হাদীস, কুরআন এবং বিভিন্ন ইসলামী বইয়ের একটি পূর্ণাঙ্গ অনলাইন প্ল্যাটফর্ম।",
      tags: ["hadith", "quran", "database", "বাংলা", "হাদীস"]
    },
    {
      title: "iHadis - বাংলা হাদীস কালেকশন",
      url: "https://ihadis.com/",
      summary: "সহীহ হাদীস পড়ার এবং সার্চ করার জন্য একটি আধুনিক ও চমৎকার ইন্টারফেস।",
      tags: ["hadith", "apps", "search", "হাদীস"]
    },
    {
      title: "HadithBN - হাদীস বিএন",
      url: "https://hadithbn.com/",
      summary: "হাদীস গ্রন্থসমূহের বিশাল লাইব্রেরি, সাথে শামেলা সার্চ এবং উলূমুল হাদীস।",
      tags: ["hadith", "library", "shamela", "হাদীস"]
    },
    {
      title: "Hadeeth Encyclopedia - অনুবাদকৃত হাদীস",
      url: "https://hadeethenc.com/",
      summary: "সহজ ব্যাখ্যাসহ নির্ভরযোগ্য হাদীসসমূহ, যা বিশ্বের বিভিন্ন ভাষায় অনুবাদকৃত।",
      tags: ["hadith", "encyclopedia", "translations", "হাদীস"]
    },
    {
      title: "IslamHouse - বাংলা ইসলামী লাইব্রেরি",
      url: "https://islamhouse.com/lite/index.php/?lang=bn",
      summary: "বই, অডিও এবং ভিডিওর একটি বিশাল ভাণ্ডার, যা সম্পূর্ণ বিনামূল্যে পাওয়া যায়।",
      tags: ["library", "books", "media", "লাইব্রেরি"]
    },
    {
      title: "IslamQA - নির্ভরযোগ্য ফতোয়া ও উত্তর",
      url: "https://islamqa.info/bn",
      summary: "কুরআন ও সুন্নাহর আলোকে ধর্মীয় বিভিন্ন প্রশ্নের নির্ভরযোগ্য সমাধান।",
      tags: ["fatwa", "qa", "scholarly", "ফতোয়া"]
    },
    {
      title: "Usul.ai - এআই চালিত ইসলামী গবেষণা",
      url: "https://usul.ai/",
      summary: "ইসলামী টেক্সট গবেষণার আধুনিক টুল, যা ১৫,০০০-এর বেশি কিতাব সার্চ করতে পারে।",
      tags: ["ai", "research", "books", "গবেষণা"]
    },
    {
      title: "Dar PDFs - বিশুদ্ধ ইসলামী বইয়ের ভাণ্ডার",
      url: "https://darpdfs.org",
      summary: "বিভিন্ন ভাষায় নির্ভরযোগ্য ইসলামী সাহিত্যের পিডিএফ সংকলন।",
      tags: ["pdf", "books", "authentic", "বই"]
    },
    {
      title: "মাসিক আত-তাহরীক - গবেষণা পত্রিকা",
      url: "https://at-tahreek.com/",
      summary: "বিশুদ্ধ তাওহীদ ও সহীহ সুন্নাহর আলোকে প্রকাশিত একটি অনন্য গবেষণা পত্রিকা।",
      tags: ["journal", "research", "tahreek", "পত্রিকা"]
    },
    {
      title: "মাসিক আল-ইতিছাম - ইসলামী ম্যাগাজিন",
      url: "https://al-itisam.com/",
      summary: "কুরআন ও সহীহ সুন্নাহর দাওয়াত প্রচারের লক্ষ্যে একটি গবেষণাভিত্তিক ম্যাগাজিন।",
      tags: ["magazine", "research", "itisam", "ম্যাগাজিন"]
    },
    {
      title: "Wafilife - ইসলামী অনলাইন বুকশপ",
      url: "https://www.wafilife.com/",
      summary: "বাংলাদেশে নির্ভরযোগ্য ইসলামী বই এবং লাইফস্টাইল পণ্যের অন্যতম গন্তব্য।",
      tags: ["books", "shop", "wafilife", "বই"]
    },
    {
      title: "হয়তোবা - Hoytoba.com আর্টিকেল",
      url: "https://hoytoba.com/",
      summary: "ইসলামী প্রবন্ধ, সিরিজ এবং আধুনিক প্যারেন্টিং টিপসের একটি অনন্য সংগ্রহ।",
      tags: ["articles", "parenting", "blog", "আর্টিকেল"]
    }
  ];

  const projects = [
    {
      title: "NikahGuard (Nikah.com.bd)",
      url: "https://nikah.com.bd",
      logo: greenhutLogo,
    },
    {
      title: "গ্রামরক্তি (GramRokti)",
      url: "https://Gramrokti.vercel.app",
      logo: gramroktiLogo,
    },
    {
      title: "Greenhutbd Inventory",
      url: "https://Inventory.greenhutbd.com",
      logo: greenhutLogo,
    },
  ];

  const filteredLinks = useMemo(() => {
    return islamicLinks.filter(link =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const getFavicon = (url: string) => {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Calligraphy Header */}
      <div className="w-full max-w-2xl flex justify-center mb-12">
        <img
          src={calligraphyImg}
          alt="Islamic Calligraphy"
          className="max-w-[300px] sm:max-w-[400px] h-auto drop-shadow-xl"
        />
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-12 relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="সার্চ করুন..."
          className="search-input pl-14 pr-14"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <span>মুছুন</span>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Islamic Links */}
      <div className="w-full max-w-2xl space-y-10 mb-20">
        {filteredLinks.length > 0 ? (
          filteredLinks.map((link, index) => (
            <div key={link.url} className="animate-fade-in-up" style={{ animationDelay: `${index * 30}ms` }}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center p-1 overflow-hidden border border-border/30">
                    <img src={getFavicon(link.url)} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate uppercase tracking-widest group-hover:text-primary transition-colors">
                    {new URL(link.url).hostname}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-primary group-hover:underline mb-1 transition-all">
                  {link.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {link.summary}
                </p>
              </a>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground animate-fade-in-up">
            দুঃখিত, কোনো ফলাফল পাওয়া যায়নি।
          </div>
        )}
      </div>

      {/* Projects Section (Minimized - Exactly 3 projects) */}
      <div className="w-full max-w-md space-y-3 mb-16 pt-8 border-t border-border/20">
        {projects.map((project, index) => (
          <a
            key={project.title}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="islamic-button animate-fade-in-up"
            style={{ animationDelay: `${(filteredLinks.length + index) * 30}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/50 border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                <img src={project.logo} alt="" className="w-5 h-5 object-contain" />
              </div>
              <h3 className="font-bold text-xs">
                {project.title}
              </h3>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>

      {/* Social Footer */}
      <footer className="mt-auto py-8 w-full border-t border-border/10 flex justify-center gap-6">
        <a
          href="https://wa.me/8801538310838"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-white/50 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-green-600 hover:border-green-300 transition-all shadow-sm"
          aria-label="WhatsApp"
        >
          <MessageCircle size={18} />
        </a>
        <a
          href="https://www.facebook.com/abdullahbariasif"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-white/50 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="mailto:abdullah.bari.2028@gmail.com"
          className="w-10 h-10 rounded-full bg-white/50 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm"
          aria-label="Email"
        >
          <Mail size={18} />
        </a>
      </footer>
    </div>
  );
};

export default Index;
