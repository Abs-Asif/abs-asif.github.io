import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export const CalendarWidget = () => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  return (
    <div className="brutalist-card">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Calendar</h2>
      <div className="flex justify-center bg-white p-2 border-2 border-black">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          className="m-0"
          modifiersStyles={{
            selected: {
              backgroundColor: 'hsl(142 76% 36%)',
              color: 'white',
              borderRadius: '0',
            },
            today: {
              fontWeight: 'bold',
              textDecoration: 'underline',
              color: 'hsl(142 76% 36%)',
            },
          }}
        />
      </div>
      {selected && (
        <div className="mt-4 p-2 border-2 border-black bg-secondary text-xs font-mono uppercase font-bold text-center">
          {selected.toDateString()}
        </div>
      )}
    </div>
  );
};
