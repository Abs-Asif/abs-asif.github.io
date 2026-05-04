import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Footer } from "@/components/Footer";

const Tools = () => {
  const tools = [
    {
      name: "Age Calculator",
      banglaName: "বয়স ক্যালকুলেটর",
      path: "/tools/age-cal",
      icon: Clock,
      style: "m3-tonal",
    },
    {
      name: "Calendar",
      banglaName: "ক্যালেন্ডার",
      path: "/tools/calender",
      icon: Calendar,
      style: "m3-secondary-tonal",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow container max-w-md mx-auto px-4 py-12">
        <div className="mb-12 flex items-center gap-4 animate-fade-in-up">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
        </div>

        <div className="space-y-4">
          {tools.map((tool, index) => (
            <div
              key={tool.path}
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <Link
                to={tool.path}
                className={`linktree-button ${tool.style} !justify-start gap-4`}
              >
                <div className="bg-background/20 p-2 rounded-xl">
                  <tool.icon size={24} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wider opacity-70 leading-none mb-1">Tool</span>
                  <span className="text-sm font-semibold">{tool.name}</span>
                  <span className="text-xs font-bangla opacity-80">{tool.banglaName}</span>
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
