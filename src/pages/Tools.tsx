import { Link } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, Type, Search,
  BookOpen, QrCode, ArrowRightLeft, Cloud,
  Laugh, Quote, Github, Lightbulb, Coins,
  Shield, Ruler, Code
} from "lucide-react";
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
      name: "Synonym Finder",
      banglaName: "সিনোনিম ফাইন্ডার",
      path: "/tools/synonym-finder",
      icon: Search,
      style: "m3-tonal",
      description: "Quickly find synonyms and antonyms for any English word."
    },
    {
      name: "Vocabulary Builder",
      banglaName: "ভোকাবুলারি বিল্ডার",
      path: "/tools/vocab-builder",
      icon: BookOpen,
      style: "m3-secondary-tonal",
      description: "Learn new English words with definitions and pronunciation."
    },
    {
      name: "QR Code Generator",
      banglaName: "কিউআর কোড জেনারেটর",
      path: "/tools/qr-gen",
      icon: QrCode,
      style: "m3-tertiary-tonal",
      description: "Create custom QR codes for any text or website link instantly."
    },
    {
      name: "Currency Converter",
      banglaName: "কারেন্সি কনভার্টার",
      path: "/tools/currency-conv",
      icon: ArrowRightLeft,
      style: "m3-tonal",
      description: "Convert between global currencies with real-time exchange rates."
    },
    {
      name: "Weather Tool",
      banglaName: "আবহাওয়া টুল",
      path: "/tools/weather",
      icon: Cloud,
      style: "m3-secondary-tonal",
      description: "Get real-time weather updates and forecasts for your city."
    },
    {
      name: "Joke Generator",
      banglaName: "জোক জেনারেটর",
      path: "/tools/jokes",
      icon: Laugh,
      style: "m3-tertiary-tonal",
      description: "Get a random joke to lighten up your day and have a laugh."
    },
    {
      name: "Quote Generator",
      banglaName: "উক্তি জেনারেটর",
      path: "/tools/quotes",
      icon: Quote,
      style: "m3-tonal",
      description: "Daily dose of inspiration with famous quotes from great minds."
    },
    {
      name: "GitHub Viewer",
      banglaName: "গিটহাব ভিউয়ার",
      path: "/tools/github",
      icon: Github,
      style: "m3-secondary-tonal",
      description: "Look up any GitHub user profile and see their public statistics."
    },
    {
      name: "Fact Generator",
      banglaName: "ফ্যাক্ট জেনারেটর",
      path: "/tools/facts",
      icon: Lightbulb,
      style: "m3-tertiary-tonal",
      description: "Discover interesting and random facts you probably didn't know."
    },
    {
      name: "Crypto Tracker",
      banglaName: "ক্রিপ্টো ট্র্যাকার",
      path: "/tools/crypto",
      icon: Coins,
      style: "m3-tonal",
      description: "Track live prices and 24h changes for top cryptocurrencies."
    },
    {
      name: "Password Gen",
      banglaName: "পাসওয়ার্ড জেন",
      path: "/tools/password-gen",
      icon: Shield,
      style: "m3-secondary-tonal",
      description: "Generate highly secure and random passwords for your accounts."
    },
    {
      name: "Unit Converter",
      banglaName: "ইউনিট কনভার্টার",
      path: "/tools/unit-conv",
      icon: Ruler,
      style: "m3-tertiary-tonal",
      description: "Universal converter for length, weight, and temperature units."
    },
    {
      name: "POS Advanced",
      banglaName: "পার্টস অফ স্পিচ অ্যাডভান্সড",
      path: "/tools/parts-of-speech-advanced",
      icon: Type,
      style: "m3-tonal",
      description: "Real-time sentence analyzer with visual parts of speech mapping."
    },
    {
      name: "Word Finder",
      banglaName: "ওয়ার্ড ফাইন্ডার",
      path: "/tools/word-finder",
      icon: Type,
      style: "m3-secondary-tonal",
      description: "Discover all possible valid words by adding prefixes and suffixes."
    },
    {
      name: "Coder",
      banglaName: "কোডার",
      path: "/tools/coder",
      icon: Code,
      style: "m3-secondary-tonal",
      description: "Binary, HTML, CSS & JS coding environment with AI assistant."
    },
    {
      name: "NEWSOrigin",
      banglaName: "নিউজ অরিজিন",
      path: "/tools/newsorigin",
      icon: Search,
      style: "m3-tonal",
      description: "Free CORS proxy for news articles and metadata extraction."
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
              style={{ animationDelay: `${(index + 1) * 50}ms`, animationFillMode: 'forwards' }}
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
