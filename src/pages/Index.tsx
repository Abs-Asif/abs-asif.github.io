import { MessageCircle, Facebook, Mail, ExternalLink, Globe, Smartphone, ChevronRight } from "lucide-react";
import calligraphyImg from "@/assets/profile-photo.png";
import gramroktiLogo from "@/assets/gramrokti-logo.png";
import greenhutLogo from "@/assets/greenhut-logo.png";

const Index = () => {
  const islamicLinks = [
    {
      title: "iHadis - Bangla Hadith Collection",
      url: "https://ihadis.com/",
      summary: "A modern, beautifully designed interface for reading and searching authentic Bangla Hadith collections.",
    },
    {
      title: "HadithBN - হাদীস বিএন",
      url: "https://hadithbn.com/",
      summary: "Extensive library of Hadith books with Bangla translation, including Shamela search and Ulumul Hadith.",
    },
    {
      title: "Hadeeth Encyclopedia - Translated Hadiths",
      url: "https://hadeethenc.com/",
      summary: "Authentic Prophetic Hadiths with simplified explanations, translated into dozens of world languages.",
    },
    {
      title: "IslamHouse - Bangla Islamic Library",
      url: "https://islamhouse.com/lite/index.php/?lang=bn",
      summary: "A massive free repository of Islamic books, audios, and videos in Bangla and many other languages.",
    },
    {
      title: "IslamQA - Authentic Scholarly Answers",
      url: "https://islamqa.info/bn",
      summary: "Reliable answers to religious questions based on Quran and Sunnah, available in Bangla.",
    },
    {
      title: "Usul.ai - AI-Powered Islamic Research",
      url: "https://usul.ai/",
      summary: "Next-generation research tool for Islamic texts, using AI to search and analyze over 15,000 classical works.",
    },
    {
      title: "Dar PDFs - Authentic Islamic Book Treasury",
      url: "https://darpdfs.org",
      summary: "A huge collection of authentic Islamic literature in PDF format across various languages and categories.",
    },
    {
      title: "মাসিক আত-তাহরীক - Monthly At-Tahreek",
      url: "https://at-tahreek.com/",
      summary: "An extra-ordinary Islamic research journal from Bangladesh based on pure Tawheed and Saheeh Sunnah.",
    },
    {
      title: "মাসিক আল-ইতিছাম - Monthly Al-Itisam",
      url: "https://al-itisam.com/",
      summary: "A research-based Islamic magazine focusing on spreading the message of Quran and authentic Sunnah.",
    },
    {
      title: "Wafilife - Leading Islamic Bookstore",
      url: "https://www.wafilife.com/",
      summary: "Premium online destination for authentic Islamic books and lifestyle products in Bangladesh.",
    },
    {
      title: "হয়তোবা - Hoytoba.com Articles",
      url: "https://hoytoba.com/",
      summary: "A unique collection of Islamic articles, series, and practical parenting advice for the modern Muslim.",
    },
    {
      title: "الدرر السنية - Hadith Verification",
      url: "https://www.hdith.com/",
      summary: "The fastest and most reliable way to verify the authenticity of Prophetic Hadiths using the Dorar collection.",
    },
    {
      title: "HadithBD - Largest Bangla Hadith Database",
      url: "https://www.hadithbd.com/",
      summary: "Comprehensive online platform for Bangla Hadith, Quran, and diverse Islamic books with search functionality.",
    },
  ];

  const projects = [
    {
      title: "গ্রামরক্তি (GramRokti)",
      subtitle: "Android Application for Blood Donation",
      url: "https://Gramrokti.vercel.app",
      icon: Smartphone,
      logo: gramroktiLogo,
    },
    {
      title: "Greenhutbd Inventory",
      subtitle: "Business Inventory Management System",
      url: "https://Inventory.greenhutbd.com",
      icon: Globe,
      logo: greenhutLogo,
    },
  ];

  const getFavicon = (url: string) => {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Calligraphy Header */}
      <div className="w-full max-w-2xl flex justify-center mb-12">
        <img
          src={calligraphyImg}
          alt="Calligraphy"
          className="max-w-[280px] sm:max-w-[350px] h-auto"
        />
      </div>

      {/* Islamic Links (Search Result Style) */}
      <div className="w-full max-w-2xl space-y-10 mb-16">
        {islamicLinks.map((link, index) => (
          <div key={link.url} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center p-1 overflow-hidden border border-border/50">
                  <img src={getFavicon(link.url)} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs text-muted-foreground truncate opacity-80 group-hover:text-accent transition-colors">
                  {new URL(link.url).hostname}
                </div>
              </div>
              <h3 className="text-xl font-medium text-accent group-hover:underline mb-1 transition-all">
                {link.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {link.summary}
              </p>
            </a>
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <div className="w-full max-w-md space-y-4 mb-16 pt-8 border-t border-border/30">
        <h2 className="text-center text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-6">Development Projects</h2>
        {projects.map((project, index) => (
          <a
            key={project.title}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="islamic-button animate-fade-in-up"
            style={{ animationDelay: `${(islamicLinks.length + index) * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-1 border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
                <img src={project.logo} alt="" className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <div className="text-left">
                <h3 className={`font-bold text-xs ${project.title.includes("গ্রামরক্তি") ? "font-bangla" : ""}`}>
                  {project.title}
                </h3>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                  {project.subtitle}
                </p>
              </div>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:text-accent transition-colors" />
          </a>
        ))}
      </div>

      {/* Footer Social Icons */}
      <footer className="mt-auto flex flex-col items-center gap-6 py-8 w-full border-t border-border/20">
        <div className="flex justify-center gap-4">
          <a
            href="https://wa.me/8801538310838"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-green-500 hover:border-green-500/50 transition-all"
            aria-label="WhatsApp"
          >
            <MessageCircle size={18} />
          </a>
          <a
            href="https://www.facebook.com/abdullahbariasif"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:border-blue-500/50 transition-all"
            aria-label="Facebook"
          >
            <Facebook size={18} />
          </a>
          <a
            href="mailto:abdullah.bari.2028@gmail.com"
            className="w-10 h-10 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 transition-all"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} • Fi Sabilillah
        </p>
      </footer>
    </div>
  );
};

export default Index;
