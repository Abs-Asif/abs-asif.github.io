import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Globe,
  Zap,
  Clock,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Layout,
  Smartphone,
  BarChart3,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompatible, setIsCompatible] = useState(false);
  const [detectedCMS, setDetectedCMS] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  // Signup Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Portal Owner"
  });

  const cleanUrl = (input: string) => {
    let formatted = input.trim();
    if (!formatted) return "";
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = "https://" + formatted;
    }
    return formatted.replace(/\/+$/, "");
  };

  const fetchWithProxy = async (target: string) => {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}&timestamp=${Date.now()}`);
      const data = await response.json();
      if (data && data.contents) return data.contents;
    } catch (e) {}
    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(target)}`);
      if (response.ok) return await response.text();
    } catch (e) {}
    return null;
  };

  const checkCompatibility = async () => {
    const formattedUrl = cleanUrl(url);
    if (!formattedUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setIsCompatible(false);
    setShowSignup(false);

    try {
      const html = await fetchWithProxy(formattedUrl);
      if (!html) throw new Error("Could not reach the website.");

      const lowerHtml = html.toLowerCase();
      const cmsIndicators = [
        { name: "WordPress", signatures: ["wp-content", "wp-includes", "wordpress"] },
        { name: "Blogger", signatures: ["blogger.com", "blogspot.com"] },
        { name: "Ghost", signatures: ["ghost.org"] },
      ];

      let detected = "Unknown";
      for (const cms of cmsIndicators) {
        if (cms.signatures.some(sig => lowerHtml.includes(sig))) {
          detected = cms.name;
          break;
        }
      }

      setDetectedCMS(detected);
      setIsCompatible(true);
      toast.success(`${detected} portal detected! Your site is compatible.`);
    } catch (err: any) {
      toast.error(err.message || "Compatibility check failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.endsWith("@gmail.com")) {
      toast.error("Only @gmail.com emails are accepted.");
      return;
    }

    // Save to localStorage to simulate "account"
    const userData = {
      ...formData,
      portalUrl: cleanUrl(url),
      cms: detectedCMS
    };
    localStorage.setItem("user_session", JSON.stringify(userData));
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">NewsCard AI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">Pricing</a>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>Login</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center space-y-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Instant Photocards for Your <span className="text-primary">News Portal</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Generate stunning photocards for your news posts in seconds. Fully automated, client-side, and lightning fast.
          </p>
        </div>

        {/* Compatibility Form */}
        {!showSignup && (
          <div className="max-w-md mx-auto p-6 bg-card rounded-2xl border shadow-xl space-y-4 animate-fade-in-up">
            <div className="text-left space-y-2">
              <Label htmlFor="portal-url">Check Your News Portal URL</Label>
              <div className="flex gap-2">
                <Input
                  id="portal-url"
                  placeholder="https://yournews.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={checkCompatibility} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                </Button>
              </div>
            </div>

            {isCompatible && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3 text-left">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <div>
                  <p className="text-sm font-bold text-primary">{detectedCMS} Compatible!</p>
                  <button
                    onClick={() => setShowSignup(true)}
                    className="text-xs underline hover:text-primary/80 transition-colors"
                  >
                    Click here to Signup and Start
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signup Form */}
        {showSignup && (
          <div className="max-w-md mx-auto p-8 bg-card rounded-2xl border shadow-2xl space-y-6 text-left animate-fade-in-up">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Create your account</h2>
              <p className="text-sm text-muted-foreground">Join the elite news portals using NewsCard AI.</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@gmail.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <p className="text-[10px] text-muted-foreground">Only @gmail.com accepted.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-url">Portal URL</Label>
                <Input id="signup-url" value={url} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option>Journalist</option>
                  <option>Social Media Manager</option>
                  <option>Portal Owner</option>
                  <option>Editor</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Create Account & Start Generating</Button>
            </form>
          </div>
        )}
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Better than the rest</h2>
            <p className="text-muted-foreground">Why NewsCard AI is the superior choice for news portals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-3xl border space-y-6">
              <h3 className="text-xl font-bold text-center">Others</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="text-destructive w-5 h-5" />
                  <span>Updates every 15 minutes</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="text-destructive w-5 h-5" />
                  <span>Slow generation process</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="text-destructive w-5 h-5" />
                  <span>Manual adjustments required</span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/5 p-8 rounded-3xl border-2 border-primary space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-bl-xl">Our Edge</div>
              <h3 className="text-xl font-bold text-center">NewsCard AI</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-5 h-5" />
                  <span className="font-medium">Updates every 2 minutes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-5 h-5" />
                  <span className="font-medium">Generation in under 1 minute</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-5 h-5" />
                  <span className="font-medium">Fully client-side & secure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose NewsCard AI?</h2>
            <p className="text-muted-foreground">Everything you need to boost your social media engagement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground">Generate photocards in under 60 seconds. No more waiting for designers.</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">2-Minute Updates</h3>
              <p className="text-muted-foreground">Our automation fetches your latest posts every 120 seconds, ensuring you never miss a beat.</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Fully Automated</h3>
              <p className="text-muted-foreground">Connect your RSS feed and let our system handle the rest. Hands-free content creation.</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">100% Client-Side</h3>
              <p className="text-muted-foreground">Your images and data never leave your browser. Fast, secure, and private.</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Mobile Ready</h3>
              <p className="text-muted-foreground">Optimized for all devices. Manage your news portal on the go.</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Engagement Boost</h3>
              <p className="text-muted-foreground">Photocards are proven to increase CTR on Facebook and Twitter by up to 3x.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Simple Pricing</h2>
            <p className="text-muted-foreground">Choose the plan that fits your news portal size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-2xl border space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Basic</h3>
                <p className="text-muted-foreground text-sm">For small news portals.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$19</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> 1 News Portal</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> Manual Generations</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> Standard Updates</li>
              </ul>
              <Button variant="outline" className="w-full">Get Started</Button>
            </div>

            <div className="p-8 bg-card rounded-2xl border-2 border-primary space-y-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-full">Most Popular</div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Pro</h3>
                <p className="text-muted-foreground text-sm">For growing newsrooms.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$49</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> 3 News Portals</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> Full Automation (2m)</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> Priority Generation</li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>

            <div className="p-8 bg-card rounded-2xl border space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Enterprise</h3>
                <p className="text-muted-foreground text-sm">For large media houses.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$99</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> Unlimited Portals</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> Custom Templates</li>
              </ul>
              <Button variant="outline" className="w-full">Contact Us</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NewsCard AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
