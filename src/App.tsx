import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Info from "./pages/Info";
import Book from "./pages/Book";
import Quran from "./pages/Quran";
import Medic from "./pages/Medic";
import Secret from "./pages/Secret";
import Law from "./pages/Law";
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
          <Route path="/book" element={<Book />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/medic" element={<Medic />} />
          <Route path="/secret" element={<Secret />} />
          <Route path="/law" element={<Law />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
