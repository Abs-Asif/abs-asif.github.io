import { HeroSection } from "@/components/HeroSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { BookOpen, Pill, Scale, Languages, Newspaper } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <div className="flex flex-col items-center gap-3 pb-6 px-4">
          <Link to="/book" className="linktree-button m3-primary w-full max-w-[280px]">
            <BookOpen size={20} />
            <span>Write a Book</span>
          </Link>
          <Link to="/quran" className="linktree-button m3-tonal w-full max-w-[280px]">
            <Languages size={20} />
            <span>Quran Translator</span>
          </Link>
          <Link to="/medic" className="linktree-button m3-secondary w-full max-w-[280px]">
            <Pill size={20} />
            <span>Drug Finder</span>
          </Link>
          <Link to="/law" className="linktree-button m3-tertiary-tonal w-full max-w-[280px]">
            <Scale size={20} />
            <span>BD Law Wiki</span>
          </Link>
          <Link to="/news" className="linktree-button m3-primary-tonal w-full max-w-[280px]">
            <Newspaper size={20} />
            <span>Newspaper Crawler</span>
          </Link>
        </div>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
