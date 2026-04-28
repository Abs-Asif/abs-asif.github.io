import { MessageCircle, Facebook, Mail, Globe, Smartphone, ExternalLink, ChevronRight } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.png";
import gramroktiLogo from "@/assets/atitilogo.png";
import greenhutLogo from "@/assets/greenhut-logo.png";
import dictionaryLogo from "@/assets/dictionary.png";

const Index = () => {
  const links = [
    {
      title: "গ্রামরক্তি (GramRokti)",
      subtitle: "Android Application for Blood Donation",
      url: "https://Gramrokti.vercel.app",
      icon: Smartphone,
      logo: gramroktiLogo,
      isProject: true,
    },
    {
      title: "Greenhutbd Inventory",
      subtitle: "Business Inventory Management System",
      url: "https://Inventory.greenhutbd.com",
      icon: Globe,
      logo: greenhutLogo,
      isProject: true,
    },
    {
      title: "My Dictionary",
      subtitle: "Personal English Dictionary",
      url: "#",
      icon: Globe,
      logo: dictionaryLogo,
      isProject: true,
    },
    {
      title: "WhatsApp Me",
      subtitle: "Direct Chat for Collaboration",
      url: "https://wa.me/8801538310838",
      icon: MessageCircle,
      color: "hover:border-green-500/50",
    },
    {
      title: "Facebook Profile",
      subtitle: "Md. Abdullah Bari Asif",
      url: "https://www.facebook.com/abdullahbariasif",
      icon: Facebook,
      color: "hover:border-blue-500/50",
    },
    {
      title: "Email Me",
      subtitle: "abdullah.bari.2028@gmail.com",
      url: "mailto:abdullah.bari.2028@gmail.com",
      icon: Mail,
      color: "hover:border-accent/50",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-16 sm:py-24">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-12 animate-fade-in-up">
        <div className="relative mb-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-accent/20 p-1 bg-secondary/30 backdrop-blur-sm shadow-2xl">
            <img
              src={profilePhoto}
              alt="Md. Abdullah Bari"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-full border-4 border-background text-primary-foreground shadow-lg">
            <Smartphone size={20} />
          </div>
        </div>

        <div className="text-center">
          <p className="font-arabic text-2xl text-accent mb-2 tracking-widest">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Md. Abdullah Bari</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-[0.2em]">Software Developer & Medical Student</p>
        </div>
      </div>

      {/* Links Section */}
      <div className="w-full max-w-md space-y-4 mb-16">
        {links.map((link, index) => (
          <a
            key={link.title}
            href={link.url}
            target={link.url.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`islamic-button animate-fade-in-up ${link.color || ""}`}
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-1 border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
                {link.logo ? (
                  <img src={link.logo} alt="" className="w-8 h-8 object-contain" />
                ) : (
                  <link.icon size={20} className="text-primary" />
                )}
              </div>
              <div className="text-left">
                <h3 className={`font-bold text-sm ${link.title.includes("গ্রামরক্তি") ? "font-bangla" : ""}`}>
                  {link.title}
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {link.subtitle}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
          </a>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-auto text-center space-y-4 animate-fade-in-up" style={{ animationDelay: "800ms" }}>
        <div className="flex justify-center gap-6 text-muted-foreground">
           {/* Add any other small icons if needed */}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} • Fi Sabilillah
        </p>
      </footer>
    </div>
  );
};

export default Index;
