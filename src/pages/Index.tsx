import { HeroSection } from "@/components/HeroSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <div className="flex justify-center pb-6 px-4">
          <Link to="/book" className="linktree-button m3-primary">
            <BookOpen size={20} />
            <span>Write a Book</span>
          </Link>
        </div>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
