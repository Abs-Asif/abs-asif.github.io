import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Cloud, Sun, CloudRain, Wind, Thermometer, MapPin, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

const WeatherTool = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Dhaka");
  const [coords, setCoords] = useState({ lat: 23.8103, lon: 90.4125 }); // Dhaka

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await response.json();
      setWeather(data.current_weather);
    } catch (error) {
      console.error("Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(coords.lat, coords.lon);
  }, [coords]);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun size={80} className="text-yellow-500" />;
    if (code <= 3) return <Cloud size={80} className="text-gray-400" />;
    return <CloudRain size={80} className="text-blue-500" />;
  };

  const getWeatherDesc = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    return "Stormy";
  };

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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Weather</h1>
            <p className="text-muted-foreground">Current conditions in your city.</p>
          </div>
        </div>

        <div className="bg-m3-primary-container/20 rounded-[3rem] p-10 relative overflow-hidden animate-fade-in-up">
          <div className="flex flex-col items-center gap-8 text-center relative z-10">
            <div className="flex items-center gap-2 bg-m3-primary/10 px-6 py-2 rounded-full text-m3-primary font-bold">
              <MapPin size={18} />
              {city}
            </div>

            {loading ? (
              <div className="py-20">
                <Loader2 size={48} className="animate-spin text-m3-primary" />
              </div>
            ) : weather ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  {getWeatherIcon(weather.weathercode)}
                  <h2 className="text-8xl font-black tracking-tighter text-m3-primary">
                    {Math.round(weather.temperature)}°C
                  </h2>
                  <p className="text-2xl font-bold opacity-60 uppercase tracking-widest">
                    {getWeatherDesc(weather.weathercode)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-8 border-t border-m3-primary/10">
                  <div className="bg-white/40 p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                      <Wind size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase opacity-40">Wind Speed</p>
                      <p className="text-xl font-black">{weather.windspeed} km/h</p>
                    </div>
                  </div>
                  <div className="bg-white/40 p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                      <Thermometer size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase opacity-40">Feels Like</p>
                      <p className="text-xl font-black">{Math.round(weather.temperature - 2)}°C</p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WeatherTool;
