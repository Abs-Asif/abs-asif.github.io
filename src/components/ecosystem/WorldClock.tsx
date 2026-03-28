import React, { useEffect, useState } from 'react';

const CITIES = [
  { name: 'UTC', timezone: 'UTC' },
  { name: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { name: 'Mecca', timezone: 'Asia/Riyadh' },
  { name: 'Dhaka', timezone: 'Asia/Dhaka' },
  { name: 'London', timezone: 'Europe/London' },
  { name: 'New York', timezone: 'America/New_York' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo' },
];

export const WorldClock = () => {
  const [times, setTimes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const updatedTimes = CITIES.reduce((acc, city) => {
        acc[city.name] = now.toLocaleTimeString('en-GB', {
          timeZone: city.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        return acc;
      }, {} as { [key: string]: string });
      setTimes(updatedTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="brutalist-card">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">World Clock</h2>
      <div className="grid grid-cols-2 gap-4 font-mono">
        {CITIES.map((city) => (
          <div key={city.name} className="border-b-2 border-border pb-1">
            <div className="text-[10px] text-muted-foreground uppercase">{city.name}</div>
            <div className="text-lg font-bold">{times[city.name] || '--:--:--'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
