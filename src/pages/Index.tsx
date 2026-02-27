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
import { fetchWithProxy } from "@/lib/proxy";

const Index = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompatible, setIsCompatible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
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

  const checkCompatibility = async () => {
    const formattedUrl = cleanUrl(url);
    if (!formattedUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setIsCompatible(false);
    setShowSignup(false);

    const messages = [
      "ওয়েবসাইট যাচাই করা হচ্ছে...",
      "সার্ভার সংযোগ স্থাপন করা হচ্ছে...",
      "নিরাপত্তা স্তর পরীক্ষা করা হচ্ছে...",
      "সিস্টেমের সামঞ্জস্যতা নিশ্চিত করা হচ্ছে...",
      "নিউজ পোর্টাল শনাক্ত করা হচ্ছে..."
    ];
    let msgIndex = 0;
    setStatusMessage(messages[0]);

    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setStatusMessage(messages[msgIndex]);
    }, 1500);

    try {
      const html = await fetchWithProxy(formattedUrl);
      if (!html) throw new Error("সিস্টেম সংযোগ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");

      const lowerHtml = html.toLowerCase();
      const isWordPress = ["wp-content", "wp-includes", "wordpress", "wp-json"].some(sig => lowerHtml.includes(sig));

      if (!isWordPress) {
        throw new Error("দুঃখিত, এই নিউজ পোর্টালটি বর্তমানে আমাদের সিস্টেমের সাথে সামঞ্জস্যপূর্ণ নয়।");
      }

      setIsCompatible(true);
      toast.success(`অভিনন্দন! আপনার নিউজ পোর্টালটি সামঞ্জস্যপূর্ণ।`);
    } catch (err: any) {
      toast.error(err.message || "Compatibility check failed.");
    } finally {
      clearInterval(msgInterval);
      setIsLoading(false);
      setStatusMessage("");
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
      portalUrl: cleanUrl(url)
    };
    localStorage.setItem("user_session", JSON.stringify(userData));
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background font-bangla">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">দ্রুতপোস্ট</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">বৈশিষ্ট্যসমূহ</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">মূল্য তালিকা</a>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>লগইন</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center space-y-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            আপনার নিউজ পোর্টালের জন্য <span className="text-primary">ইনস্ট্যান্ট ফটোকার্ড</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            সেকেন্ডের মধ্যে আপনার নিউজ পোস্টের জন্য চমৎকার ফটোকার্ড তৈরি করুন। সম্পূর্ণ স্বয়ংক্রিয় এবং সুপার ফাস্ট।
          </p>
        </div>

        {/* Compatibility Form */}
        {!showSignup && (
          <div className="max-w-md mx-auto p-6 bg-card rounded-2xl border shadow-xl space-y-4 animate-fade-in-up">
            <div className="text-left space-y-2">
              <Label htmlFor="portal-url">আপনার নিউজ পোর্টাল ইউআরএল চেক করুন</Label>
              <div className="flex gap-2">
                <Input
                  id="portal-url"
                  placeholder="https://yournews.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={checkCompatibility} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "চেক করুন"}
                </Button>
              </div>
              {isLoading && (
                <p className="text-xs text-primary animate-pulse font-medium text-center">{statusMessage}</p>
              )}
            </div>

            {isCompatible && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3 text-left">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <div>
                  <p className="text-sm font-bold text-primary">আপনার সাইটটি সামঞ্জস্যপূর্ণ!</p>
                  <button
                    onClick={() => setShowSignup(true)}
                    className="text-xs underline hover:text-primary/80 transition-colors"
                  >
                    অ্যাকাউন্ট তৈরি করতে এখানে ক্লিক করুন
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
              <h2 className="text-2xl font-bold">অ্যাকাউন্ট তৈরি করুন</h2>
              <p className="text-sm text-muted-foreground">সেরা নিউজ পোর্টালগুলোর সাথে যুক্ত হোন।</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">পুরো নাম</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">ফোন নম্বর</Label>
                <Input id="phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ইমেল ঠিকানা</Label>
                <Input id="email" type="email" placeholder="you@gmail.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <p className="text-[10px] text-muted-foreground">শুধুমাত্র @gmail.com গ্রহণযোগ্য।</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-url">পোর্টাল ইউআরএল</Label>
                <Input id="signup-url" value={url} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">আপনার ভূমিকা</Label>
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
              <Button type="submit" className="w-full">অ্যাকাউন্ট তৈরি করুন এবং শুরু করুন</Button>
            </form>
          </div>
        )}
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold">ম্যানুয়াল সিস্টেম বনাম দ্রুতপোস্ট</h2>
            <p className="text-muted-foreground">কেন আপনার নিউজ পোর্টালের জন্য দ্রুতপোস্ট অপরিহার্য।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-3xl border space-y-6">
              <h3 className="text-xl font-bold text-center">ম্যানুয়াল সিস্টেম</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="text-destructive w-5 h-5" />
                  <span>পোস্ট হওয়ার অনেক পর ফটোকার্ড তৈরি হয়</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="text-destructive w-5 h-5" />
                  <span>গ্রাফিক্স ডিজাইনারের জন্য অপেক্ষা করতে হয়</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="text-destructive w-5 h-5" />
                  <span>সোশ্যাল মিডিয়া শেয়ারে বিলম্ব ঘটে</span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/5 p-8 rounded-3xl border-2 border-primary space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-bl-xl">Our Edge</div>
              <h3 className="text-xl font-bold text-center">দ্রুতপোস্ট</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-5 h-5" />
                  <span className="font-medium">প্রতি ২ মিনিটে আপডেট</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-5 h-5" />
                  <span className="font-medium">১ মিনিটের মধ্যে জেনারেশন</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-primary w-5 h-5" />
                  <span className="font-medium">সম্পূর্ণ ক্লায়েন্ট-সাইড এবং নিরাপদ</span>
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
            <h2 className="text-3xl font-bold tracking-tight">কেন দ্রুতপোস্ট বেছে নেবেন?</h2>
            <p className="text-muted-foreground">আপনার সোশ্যাল মিডিয়া এনগেজমেন্ট বাড়াতে যা যা প্রয়োজন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">বিদ্যুৎ গতি</h3>
              <p className="text-muted-foreground">৬০ সেকেন্ডের কম সময়ে ফটোকার্ড তৈরি করুন। ডিজাইনারের জন্য আর অপেক্ষা নয়।</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">২ মিনিটের আপডেট</h3>
              <p className="text-muted-foreground">আমাদের অটোমেশন প্রতি ১২০ সেকেন্ডে আপনার লেটেস্ট পোস্ট চেক করে।</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">সম্পূর্ণ স্বয়ংক্রিয়</h3>
              <p className="text-muted-foreground">আপনার আরএসএস ফিড কানেক্ট করুন এবং বাকিটা আমাদের সিস্টেমের ওপর ছেড়ে দিন।</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">১০০% ক্লায়েন্ট-সাইড</h3>
              <p className="text-muted-foreground">আপনার ছবি এবং তথ্য ব্রাউজারেই থাকে। দ্রুত, নিরাপদ এবং ব্যক্তিগত।</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">মোবাইল ফ্রেন্ডলি</h3>
              <p className="text-muted-foreground">সব ডিভাইসের জন্য অপ্টিমাইজ করা। যেকোনো জায়গা থেকে আপনার পোর্টাল ম্যানেজ করুন।</p>
            </div>

            <div className="p-8 bg-card rounded-2xl border hover:shadow-lg transition-shadow space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">এনগেজমেন্ট বৃদ্ধি</h3>
              <p className="text-muted-foreground">ফটোকার্ড ফেসবুক এবং টুইটারে ৩ গুণ পর্যন্ত ক্লিক থ্রু রেট (CTR) বৃদ্ধি করতে পারে।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">সহজ মূল্য তালিকা</h2>
            <p className="text-muted-foreground">আপনার নিউজ পোর্টালের জন্য সঠিক প্ল্যানটি বেছে নিন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-2xl border space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">বেসিক</h3>
                <p className="text-muted-foreground text-sm">ছোট নিউজ পোর্টালের জন্য।</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">৳৫০০</span>
                <span className="text-muted-foreground">/মাস</span>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> ১টি নিউজ পোর্টাল</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> ম্যানুয়াল জেনারেশন</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> স্ট্যান্ডার্ড আপডেট</li>
              </ul>
              <Button variant="outline" className="w-full">শুরু করুন</Button>
            </div>

            <div className="p-8 bg-card rounded-2xl border-2 border-primary space-y-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-full">জনপ্রিয়</div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl">প্রো</h3>
                <p className="text-muted-foreground text-sm">ক্রমবর্ধমান পোর্টালগুলোর জন্য।</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">৳১৫০০</span>
                <span className="text-muted-foreground">/মাস</span>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> ৩টি নিউজ পোর্টাল</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> সম্পূর্ণ অটোমেশন (২মি)</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> প্রায়োরিটি জেনারেশন</li>
              </ul>
              <Button className="w-full">শুরু করুন</Button>
            </div>

            <div className="p-8 bg-card rounded-2xl border space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">এন্টারপ্রাইজ</h3>
                <p className="text-muted-foreground text-sm">বড় মিডিয়া হাউসের জন্য।</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">৳৩০০০</span>
                <span className="text-muted-foreground">/মাস</span>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> আনলিমিটেড পোর্টাল</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার</li>
                <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4" /> কাস্টম টেম্পলেট</li>
              </ul>
              <Button variant="outline" className="w-full">যোগাযোগ করুন</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} দ্রুতপোস্ট। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
