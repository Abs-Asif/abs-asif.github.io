import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Copy, Check, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = () => {
    const charset = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    };

    let characters = "";
    if (options.uppercase) characters += charset.uppercase;
    if (options.lowercase) characters += charset.lowercase;
    if (options.numbers) characters += charset.numbers;
    if (options.symbols) characters += charset.symbols;

    if (!characters) {
      toast.error("Please select at least one character type");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setPassword(result);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const getStrength = () => {
    if (length < 8) return { label: "Weak", color: "text-red-500", icon: ShieldAlert };
    if (length < 12) return { label: "Medium", color: "text-yellow-500", icon: Shield };
    return { label: "Strong", color: "text-green-500", icon: ShieldCheck };
  };

  const strength = getStrength();

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-4xl mx-auto px-6 py-6">
        <div className="mb-8 flex items-center gap-6 animate-fade-in-up">
          <Link
            to="/tools"
            className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
            aria-label="Back to tools"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Password Gen</h1>
            <p className="text-muted-foreground">Generate secure, random passwords.</p>
          </div>
        </div>

        <div className="space-y-8 animate-fade-in-up">
          <div className="relative group">
            <div className="w-full bg-m3-primary-container/20 border-2 border-transparent p-8 rounded-[2.5rem] text-2xl font-black break-all min-h-[100px] flex items-center justify-center text-center shadow-inner">
              {password || <span className="opacity-20">Click generate...</span>}
            </div>
            {password && (
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 p-3 bg-white/50 hover:bg-white rounded-2xl transition-all shadow-sm"
              >
                <Copy size={20} />
              </button>
            )}
          </div>

          {password && (
            <div className={`flex items-center justify-center gap-2 font-bold ${strength.color}`}>
              <strength.icon size={20} />
              Password Strength: {strength.label}
            </div>
          )}

          <div className="bg-white border border-border p-8 rounded-[3rem] shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold">Password Length</label>
                <span className="bg-m3-primary/10 text-m3-primary px-4 py-1 rounded-full font-black">{length}</span>
              </div>
              <input
                type="range"
                min="4"
                max="50"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full accent-m3-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setOptions({ ...options, [key]: !value })}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    value ? 'bg-m3-primary/5 border-m3-primary/30' : 'bg-transparent border-transparent opacity-40'
                  }`}
                >
                  <span className="capitalize font-bold">{key}</span>
                  {value && <Check size={18} className="text-m3-primary" />}
                </button>
              ))}
            </div>

            <button
              onClick={generatePassword}
              className="w-full bg-m3-primary text-m3-on-primary p-6 rounded-[2rem] font-black text-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <RefreshCw size={24} />
              Generate Password
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PasswordGenerator;
