import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, ArrowRightLeft, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BDT");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
        if (!response.ok) throw new Error("Failed to fetch rates");
        const data = await response.json();
        setRates(data.rates);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchRates();
  }, [fromCurrency]);

  const convertedAmount = rates[toCurrency] ? (amount * rates[toCurrency]).toFixed(2) : "0.00";

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const commonCurrencies = ["USD", "BDT", "EUR", "GBP", "SAR", "AED", "INR", "CAD", "AUD", "JPY", "CNY", "TRY"];

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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Currency Converter</h1>
            <p className="text-muted-foreground">Real-time exchange rates.</p>
          </div>
        </div>

        <div className="bg-m3-secondary-container/20 border border-m3-secondary/10 rounded-[3rem] p-8 md:p-12 shadow-inner animate-fade-in-up">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider opacity-60 ml-4">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/50 border-2 border-transparent focus:border-m3-secondary/30 p-6 rounded-[2rem] outline-none text-3xl font-black transition-all"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-grow w-full space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider opacity-60 ml-4">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full bg-white/50 border-2 border-transparent focus:border-m3-secondary/30 p-6 rounded-[2rem] outline-none text-xl font-bold appearance-none cursor-pointer"
                >
                  {commonCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button
                onClick={swapCurrencies}
                className="mt-8 p-4 bg-m3-secondary text-m3-on-secondary rounded-full hover:rotate-180 transition-transform duration-500 shadow-lg"
              >
                <ArrowRightLeft size={24} />
              </button>

              <div className="flex-grow w-full space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider opacity-60 ml-4">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full bg-white/50 border-2 border-transparent focus:border-m3-secondary/30 p-6 rounded-[2rem] outline-none text-xl font-bold appearance-none cursor-pointer"
                >
                  {commonCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-m3-secondary/10 flex flex-col items-center gap-2">
              <p className="text-muted-foreground font-medium">Result</p>
              {loading ? (
                <Loader2 className="animate-spin text-m3-secondary" size={48} />
              ) : (
                <div className="text-center">
                  <h2 className="text-6xl font-black text-m3-secondary tracking-tighter">
                    {convertedAmount} <span className="text-2xl opacity-60">{toCurrency}</span>
                  </h2>
                  <p className="text-sm opacity-60 mt-2">
                    1 {fromCurrency} = {rates[toCurrency]?.toFixed(4)} {toCurrency}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CurrencyConverter;
