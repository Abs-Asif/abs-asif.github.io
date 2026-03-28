import { SearchBar } from "@/components/ecosystem/SearchBar";
import { WorldClock } from "@/components/ecosystem/WorldClock";
import { CalendarWidget } from "@/components/ecosystem/CalendarWidget";
import { TodoList } from "@/components/ecosystem/TodoList";
import { WebsiteChecker } from "@/components/ecosystem/WebsiteChecker";
import { IslamicHub } from "@/components/ecosystem/IslamicHub";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 selection:bg-primary selection:text-white">
      <header className="mb-12 border-b-4 border-black pb-4 dark:border-white">
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
          Ecosystem<span className="text-primary">.OS</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
          <p className="font-mono text-[10px] md:text-xs uppercase font-bold bg-black text-white px-2 py-1 dark:bg-white dark:text-black">
            v2.0.BRUTAL
          </p>
          <p className="font-mono text-[10px] md:text-xs uppercase font-bold">
            Minimalist Brutalist Web Environment // All-in-One Utility
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Row 1 */}
        <SearchBar />
        <WorldClock />
        <CalendarWidget />

        {/* Row 2 */}
        <div className="lg:col-span-2">
          <IslamicHub />
        </div>
        <TodoList />

        {/* Row 3 */}
        <div className="lg:col-span-3">
          <WebsiteChecker />
        </div>
      </main>

      <footer className="mt-24 pt-8 border-t-4 border-black dark:border-white font-mono text-[10px] uppercase font-bold flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <span>© 2024 ECOSYSTEM.OS</span>
          <span className="text-primary">NO TRACKING</span>
        </div>
        <div className="flex gap-4">
          <span>STATUS: OPERATIONAL</span>
          <span>LATENCY: 14ms</span>
          <span>RAM: 256MB</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
