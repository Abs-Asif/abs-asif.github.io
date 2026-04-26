import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
        <Link to="/" className="w-full mb-4">
          <img
            src="/assets/header.png"
            alt="Abdullah Bari Asif Header"
            className="w-full h-auto object-cover rounded-sm border border-border shadow-sm"
          />
        </Link>
        <div className="flex w-full justify-between items-end">
          <div className="flex flex-col">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              Abdullah Bari Asif
            </Link>
            <p className="text-sm text-muted-foreground italic">
              Researcher | Truth Seeker | Muslim
            </p>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link to="/2026" className="text-sm font-medium hover:underline underline-offset-4">
              Archive
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
