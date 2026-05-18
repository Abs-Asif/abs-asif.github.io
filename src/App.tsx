import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Info from "./pages/Info";
import Letter from "./pages/Letter";
import LetterRaw from "./pages/LetterRaw";
import Tools from "./pages/Tools";
import AgeCalculator from "./pages/AgeCalculator";
import Calendar from "./pages/Calendar";
import PartsOfSpeech from "./pages/PartsOfSpeech";
import PartsOfSpeechAdvanced from "./pages/PartsOfSpeechAdvanced";
import WordFinder from "./pages/WordFinder";
import SynonymFinder from "./pages/SynonymFinder";
import VocabularyBuilder from "./pages/VocabularyBuilder";
import QRCodeGenerator from "./pages/QRCodeGenerator";
import CurrencyConverter from "./pages/CurrencyConverter";
import WeatherTool from "./pages/WeatherTool";
import JokeGenerator from "./pages/JokeGenerator";
import QuoteGenerator from "./pages/QuoteGenerator";
import GitHubViewer from "./pages/GitHubViewer";
import FactGenerator from "./pages/FactGenerator";
import CryptoTracker from "./pages/CryptoTracker";
import PasswordGenerator from "./pages/PasswordGenerator";
import UnitConverter from "./pages/UnitConverter";
import Coder from "./pages/Coder";
import NewsHighlighter from "./pages/NewsHighlighter";
import BanglishConverter from "./pages/BanglishConverter";
import NewsOriginIndex from "./pages/newsorigin/Index";
import NewsOriginV2 from "./pages/newsorigin/V2";
import NewsOriginJSON from "./pages/newsorigin/JSON";
import NewsOriginHentai from "./pages/newsorigin/Hentai";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/INFO" element={<Info />} />
          <Route path="/letter" element={<Letter />} />
          <Route path="/letter/raw" element={<LetterRaw />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/age-cal" element={<AgeCalculator />} />
          <Route path="/tools/calender" element={<Calendar />} />
          <Route path="/tools/parts-of-speech" element={<PartsOfSpeech />} />
          <Route path="/tools/parts-of-speech-advanced" element={<PartsOfSpeechAdvanced />} />
          <Route path="/tools/word-finder" element={<WordFinder />} />
          <Route path="/tools/synonym-finder" element={<SynonymFinder />} />
          <Route path="/tools/vocab-builder" element={<VocabularyBuilder />} />
          <Route path="/tools/qr-gen" element={<QRCodeGenerator />} />
          <Route path="/tools/currency-conv" element={<CurrencyConverter />} />
          <Route path="/tools/weather" element={<WeatherTool />} />
          <Route path="/tools/jokes" element={<JokeGenerator />} />
          <Route path="/tools/quotes" element={<QuoteGenerator />} />
          <Route path="/tools/github" element={<GitHubViewer />} />
          <Route path="/tools/facts" element={<FactGenerator />} />
          <Route path="/tools/crypto" element={<CryptoTracker />} />
          <Route path="/tools/password-gen" element={<PasswordGenerator />} />
          <Route path="/tools/unit-conv" element={<UnitConverter />} />
          <Route path="/tools/coder" element={<Coder />} />
          <Route path="/tools/news-highlighter" element={<NewsHighlighter />} />
          <Route path="/tools/banglish-conv" element={<BanglishConverter />} />
          <Route path="/tools/newsorigin" element={<NewsOriginIndex />} />
          <Route path="/tools/newsorigin/v2" element={<NewsOriginV2 />} />
          <Route path="/tools/newsorigin/json" element={<NewsOriginJSON />} />
          <Route path="/tools/newsorigin/hentai" element={<NewsOriginHentai />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
