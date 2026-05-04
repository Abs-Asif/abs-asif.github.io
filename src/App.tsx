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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
