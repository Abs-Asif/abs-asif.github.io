import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

const isStandalone = import.meta.env.VITE_STANDALONE_SECRET === 'true';

const Index = isStandalone ? null : lazy(() => import("./pages/Index"));
const Secret = lazy(() => import("./pages/Secret"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const Router = isStandalone ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <Routes>
              {isStandalone ? (
                <>
                  <Route path="/" element={<Secret />} />
                  <Route path="/secret" element={<Secret />} />
                  <Route path="*" element={<NotFound />} />
                </>
              ) : (
                <>
                  <Route path="/" element={Index ? <Index /> : null} />
                  <Route path="/secret" element={<Secret />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </Suspense>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
