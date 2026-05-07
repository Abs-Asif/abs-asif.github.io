import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Type } from "lucide-react";
import { Footer } from "@/components/Footer";

const Tools = () => {
  const tools = [
    {
      name: "Age Calculator",
      banglaName: "বয়স ক্যালকুলেটর",
      path: "/tools/age-cal",
      icon: Clock,
      style: "m3-tonal",
      description: "Calculate your exact age and check marriage eligibility."
    },
    {
      name: "Calendar",
      banglaName: "ক্যালেন্ডার",
      path: "/tools/calender",
      icon: Calendar,
      style: "m3-secondary-tonal",
      description: "Gregorian, Bengali, and Hijri calendars with holidays."
    },
    {
      name: "Parts of Speech",
      banglaName: "পার্টস অফ স্পিচ",
      path: "/tools/parts-of-speech",
      icon: Type,
      style: "m3-tertiary-tonal",
      description: "Find parts of speech, definitions, and examples for any word."
    },
    {
      name: "POS Advanced",
      banglaName: "পার্টস অফ স্পিচ অ্যাডভান্সড",
      path: "/tools/parts-of-speech-advanced",
      icon: Type,
      style: "m3-tonal",
      description: "Real-time sentence analyzer with visual parts of speech mapping."
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12 flex items-center gap-6 animate-fade-in-up">
          <Link
            to="/"
            className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
            aria-label="Back to home"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Tools</h1>
            <p className="text-muted-foreground">Useful utilities for daily life.</p>
          </div>
        </div>

        <div className="grid gap-4">
          {tools.map((tool, index) => (
            <div
              key={tool.path}
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <Link
                to={tool.path}
                className={`flex items-start gap-5 p-6 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-border/50 ${
                  tool.style === 'm3-tonal' ? 'bg-m3-primary-container text-m3-on-primary-container' :
                  tool.style === 'm3-secondary-tonal' ? 'bg-m3-secondary-container text-m3-on-secondary-container' :
                  'bg-m3-tertiary-container text-m3-on-tertiary-container'
                }`}
              >
                <div className="bg-white/20 p-4 rounded-2xl shadow-inner">
                  <tool.icon size={28} />
                </div>
                <div className="flex flex-col items-start mt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold">{tool.name}</span>
                    <span className="text-sm opacity-80 font-bangla">• {tool.banglaName}</span>
                  </div>
                  <p className="text-sm opacity-70 leading-relaxed max-w-[240px]">
                    {tool.description}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tools;
