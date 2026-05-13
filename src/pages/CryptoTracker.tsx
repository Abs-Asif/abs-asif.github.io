import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { Footer } from "@/components/Footer";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const CryptoTracker = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false");
      const data = await response.json();
      setCoins(data);
    } catch (error) {
      console.error("Failed to fetch crypto prices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Crypto Tracker</h1>
            <p className="text-muted-foreground">Live prices of top 10 cryptos.</p>
          </div>
        </div>

        <div className="space-y-4 animate-fade-in-up">
          {loading && coins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={48} className="animate-spin text-m3-primary" />
              <p className="font-bold opacity-40">Fetching market data...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={fetchPrices}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm font-bold text-m3-primary px-4 py-2 rounded-full bg-m3-primary/10 hover:bg-m3-primary/20 transition-all"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
              <div className="grid gap-3">
                {coins.map((coin) => (
                  <div key={coin.id} className="bg-white border border-border p-5 rounded-[2rem] flex items-center justify-between hover:scale-[1.02] transition-transform shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={coin.image} alt={coin.name} className="w-10 h-10" />
                      <div>
                        <h3 className="font-bold text-lg leading-none">{coin.name}</h3>
                        <span className="text-sm opacity-40 uppercase font-black">{coin.symbol}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black">${coin.current_price.toLocaleString()}</p>
                      <div className={`flex items-center justify-end gap-1 text-sm font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CryptoTracker;
