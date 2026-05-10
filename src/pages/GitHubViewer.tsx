import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Github, Search, Loader2, Users, BookOpen, Star, MapPin, Link as LinkIcon } from "lucide-react";
import { Footer } from "@/components/Footer";

interface GithubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string;
  blog: string;
  html_url: string;
}

const GitHubViewer = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<GithubUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setUser(null);

    try {
      const response = await fetch(`https://api.github.com/users/${username.trim()}`);
      if (!response.ok) throw new Error("User not found");
      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12 flex items-center gap-6 animate-fade-in-up">
          <Link
            to="/tools"
            className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
            aria-label="Back to tools"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">GitHub Viewer</h1>
            <p className="text-muted-foreground">Lookup any GitHub profile.</p>
          </div>
        </div>

        <form onSubmit={fetchUser} className="mb-12 animate-fade-in-up">
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username..."
              className="w-full bg-secondary/20 border-2 border-transparent focus:border-primary/30 p-6 rounded-[2rem] outline-none text-xl font-medium transition-all pr-16 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 aspect-square bg-primary text-primary-foreground rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-destructive/10 text-destructive p-6 rounded-[2rem] border border-destructive/20 animate-fade-in-up text-center">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {user && (
          <div className="bg-card rounded-[3rem] border border-border p-8 md:p-12 shadow-xl animate-fade-in-up">
            <div className="flex flex-col items-center text-center gap-6">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-40 h-40 rounded-full border-4 border-primary/20 shadow-lg"
              />
              <div>
                <h2 className="text-4xl font-black">{user.name || user.login}</h2>
                <p className="text-xl text-muted-foreground">@{user.login}</p>
              </div>

              {user.bio && (
                <p className="text-lg leading-relaxed opacity-80 max-w-md">
                  {user.bio}
                </p>
              )}

              <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-border">
                <div className="flex flex-col items-center">
                  <BookOpen size={20} className="mb-2 opacity-40" />
                  <span className="text-2xl font-black">{user.public_repos}</span>
                  <span className="text-xs font-bold uppercase opacity-40">Repos</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users size={20} className="mb-2 opacity-40" />
                  <span className="text-2xl font-black">{user.followers}</span>
                  <span className="text-xs font-bold uppercase opacity-40">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star size={20} className="mb-2 opacity-40" />
                  <span className="text-2xl font-black">{user.following}</span>
                  <span className="text-xs font-bold uppercase opacity-40">Following</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                {user.location && (
                  <div className="flex items-center gap-2 text-sm opacity-60">
                    <MapPin size={16} />
                    {user.location}
                  </div>
                )}
                {user.blog && (
                  <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <LinkIcon size={16} />
                    Website
                  </a>
                )}
              </div>

              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:scale-105 transition-all"
              >
                <Github size={20} />
                View Full Profile
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GitHubViewer;
