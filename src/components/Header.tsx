import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";

const navItems = [
  { label: "Projects", href: "/#projects" },
  { label: "AI Chat", href: "/ai" },
  { label: "Inspector", href: "/Inspector" },
  { label: "Newsroom", href: "/news" },
  { label: "Port", href: "/port" },
  { label: "Somoy", href: "/somoy" },
  { label: "Contact", href: "/#contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border py-2"
          : "bg-transparent py-4"
      )}
    >
      <nav className="container flex items-center justify-between h-12">
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center transition-all group-hover:bg-primary/30 group-hover:border-primary/50">
            <Terminal size={18} className="text-primary" />
          </div>
          <span className="font-mono font-bold text-lg tracking-tighter text-foreground group-hover:text-primary transition-colors">
            AB<span className="text-primary">_</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.href.startsWith("/#") ? (
                <a
                  href={item.href}
                  className="px-4 py-1.5 rounded-md text-xs font-mono font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-primary/10"
                >
                  <span className="text-primary/50 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">./</span>
                  {item.label}
                </a>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-mono font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-primary/10",
                    location.pathname === item.href && "text-primary bg-primary/10"
                  )}
                >
                  <span className="text-primary/50 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">./</span>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <a
          href="/#contact"
          className="inline-flex items-center px-4 py-2 rounded-md text-xs font-mono font-bold bg-primary text-primary-foreground transition-all duration-200 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-[0.98]"
        >
          _connect()
        </a>
      </nav>
    </header>
  );
};
