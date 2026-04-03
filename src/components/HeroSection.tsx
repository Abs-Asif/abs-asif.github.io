import { ChevronRight } from "lucide-react";
import { VisitorCounter } from "./VisitorCounter";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center pt-24 pb-0 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10" />

      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-primary text-xs font-mono mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Available for strategic collaborations
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight animate-fade-in-up opacity-0 leading-[1.1]" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              Bridging <span className="gradient-text">Healthcare</span> <br />
              <span className="font-mono italic font-light">&amp; Technology</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up opacity-0" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
              I'm <span className="text-foreground font-semibold">Md. Abdullah Bari</span>, a full-stack developer and medical student dedicated to building robust digital ecosystems that solve real-world problems.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg text-sm font-mono font-bold bg-primary text-primary-foreground transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-[0.98]"
              >
                explore_projects()
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="https://wa.me/8801538310838"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-sm font-mono font-bold border border-border bg-background/50 backdrop-blur-sm text-foreground transition-all duration-300 hover:bg-secondary active:scale-[0.98]"
              >
                contact_me
              </a>
            </div>

            <div className="flex justify-center lg:justify-start mb-8">
              <VisitorCounter />
            </div>

          </div>

          {/* Developer Status Terminal */}
          <div className="flex-1 order-1 lg:order-2 animate-fade-in-up opacity-0 w-full" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <div className="terminal-window max-w-md mx-auto relative group">
              <div className="terminal-header">
                <div className="terminal-dot bg-destructive/50" />
                <div className="terminal-dot bg-yellow-500/50" />
                <div className="terminal-dot bg-primary/50" />
                <div className="ml-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">status.sh</div>
              </div>
              <div className="p-6 bg-surface-1 font-mono text-xs md:text-sm leading-relaxed min-h-[300px]">
                <div className="flex gap-2 mb-2">
                  <span className="text-primary">{">"}</span>
                  <span className="text-foreground">whoami</span>
                </div>
                <div className="text-muted-foreground mb-4">
                  [name: "Md. Abdullah Bari", roles: ["Medical Student", "Software Developer"], focus: "Health-Tech"]
                </div>

                <div className="flex gap-2 mb-2">
                  <span className="text-primary">{">"}</span>
                  <span className="text-foreground">current_stack</span>
                </div>
                <div className="text-muted-foreground mb-4">
                  ["React", "TypeScript", "Node.js", "Supabase", "Capacitor"]
                </div>

                <div className="flex gap-2 mb-2">
                  <span className="text-primary">{">"}</span>
                  <span className="text-foreground">location</span>
                </div>
                <div className="text-muted-foreground mb-4">
                  "Dhaka, Bangladesh"
                </div>

                <div className="flex gap-2 mb-2">
                  <span className="text-primary">{">"}</span>
                  <span className="text-foreground">interests</span>
                </div>
                <div className="text-muted-foreground mb-6">
                  ["Open Source", "Medical AI", "Digital Health Accessibility"]
                </div>

                <div className="flex items-center gap-2">
                  <span className="animate-pulse inline-block w-2 h-4 bg-primary" />
                  <span className="text-primary/50 text-[10px]">_listening_for_commands...</span>
                </div>
              </div>
              <div className="p-4 bg-secondary/30 border-t border-border flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="h-1.5 w-12 bg-primary/30 rounded-full" />
                  <div className="h-1.5 w-8 bg-accent/30 rounded-full" />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">v2.0.24</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
