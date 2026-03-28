import React, { useEffect, useState } from 'react';
import { fetchIslamicPrayerTimes } from '@/lib/api-utils';
import { Moon, Compass, Clock, AlertTriangle, MapPin } from 'lucide-react';

interface IslamicData {
  times: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
  };
  date: {
    hijri: {
      date: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { en: string; ar: string };
      year: string;
    };
  };
  qibla: {
    direction: { degrees: number };
  };
  prohibited_times: {
    sunrise: { start: string; end: string };
    noon: { start: string; end: string };
    sunset: { start: string; end: string };
  };
  timezone: {
    name: string;
  };
}

export const IslamicHub = () => {
  const [data, setData] = useState<IslamicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => {
          // Default to Dhaka if geolocation fails/denied
          setLocation({ lat: 23.8103, lon: 90.4125 });
        }
      );
    } else {
      setLocation({ lat: 23.8103, lon: 90.4125 });
    }
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchIslamicPrayerTimes(location.lat, location.lon);
        if (res.status === 'success') {
          setData(res.data);
        } else {
          setError('API Error');
        }
      } catch (err) {
        setError('Failed to load Islamic data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  if (loading) return (
    <div className="brutalist-card flex items-center justify-center p-12">
      <Clock size={32} className="animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="brutalist-card border-destructive text-destructive font-mono text-sm uppercase font-bold text-center">
      <AlertTriangle size={32} className="mx-auto mb-2" />
      {error}
      <button
        onClick={() => setLocation({ lat: 23.8103, lon: 90.4125 })}
        className="mt-4 block w-full brutalist-button text-xs"
      >
        Use Default (Dhaka)
      </button>
    </div>
  );

  if (!data) return null;

  return (
    <div className="brutalist-card">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter flex items-center gap-2">
          Islamic Hub <Moon size={18} className="text-primary fill-primary" />
        </h2>
        <div className="flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-muted-foreground">
          <MapPin size={10} /> {data.timezone.name.split('/').pop()}
        </div>
      </div>

      <div className="mb-6 p-3 border-2 border-black bg-primary text-primary-foreground font-mono text-center">
        <div className="text-xs uppercase opacity-80">{data.date.hijri.weekday.en}</div>
        <div className="text-lg font-bold">
          {data.date.hijri.day} {data.date.hijri.month.en} {data.date.hijri.year} AH
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.entries(data.times).filter(([k]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(k)).map(([key, time]) => (
          <div key={key} className="border-2 border-black p-2 flex justify-between items-center bg-white">
            <span className="font-mono text-xs uppercase font-bold">{key}</span>
            <span className="font-bold text-sm text-primary">{time}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4 font-mono">
        <div className="p-3 border-2 border-black bg-secondary flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 font-bold uppercase">
            <Compass size={16} /> Qibla Direction
          </div>
          <div className="font-bold">{data.qibla.direction.degrees.toFixed(2)}°</div>
        </div>

        <div className="p-3 border-2 border-black bg-secondary text-xs">
          <div className="font-bold uppercase mb-2 flex items-center gap-2 text-destructive">
            <AlertTriangle size={16} /> Prohibited Times
          </div>
          <div className="grid grid-cols-1 gap-1 text-[10px] font-bold uppercase">
            <div className="flex justify-between border-b border-black/10">
              <span>Sunrise:</span> <span>{data.prohibited_times.sunrise.start} - {data.prohibited_times.sunrise.end}</span>
            </div>
            <div className="flex justify-between border-b border-black/10">
              <span>Noon:</span> <span>{data.prohibited_times.noon.start} - {data.prohibited_times.noon.end}</span>
            </div>
            <div className="flex justify-between">
              <span>Sunset:</span> <span>{data.prohibited_times.sunset.start} - {data.prohibited_times.sunset.end}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
