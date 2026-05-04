import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Footer } from "@/components/Footer";
import { toBanglaNumber } from "@/lib/bangla-utils";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  setMonth,
  setYear
} from "date-fns";

type CalendarMode = 'regular' | 'bangla' | 'arabic';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('regular');
  const [jumpDate, setJumpDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setJumpDate(e.target.value);
      setCurrentDate(date);
    }
  };

  const getDayName = (day: number) => {
    const days = {
      regular: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      bangla: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"],
      arabic: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    };
    return days[mode][day];
  };

  const formatMonthYear = (date: Date) => {
    if (mode === 'bangla') {
      const months = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
      ];
      return `${months[date.getMonth()]} ${toBanglaNumber(date.getFullYear())}`;
    }
    if (mode === 'arabic') {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', { month: 'long', year: 'numeric' }).format(date);
    }
    return format(date, "MMMM yyyy");
  };

  const formatDayNumber = (date: Date) => {
    if (mode === 'bangla') {
      return toBanglaNumber(date.getDate());
    }
    if (mode === 'arabic') {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', { day: 'numeric' }).format(date);
    }
    return date.getDate().toString();
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${mode === 'bangla' ? 'font-bangla' : mode === 'arabic' ? 'font-arabic' : ''}`}>
      <main className="flex-grow container max-w-md mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Link
              to="/tools"
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Back to tools"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className={`text-2xl font-bold tracking-tight ${mode === 'regular' ? '' : 'font-sans'}`}>Calendar</h1>
          </div>

          <div className="flex bg-secondary/50 p-1 rounded-full text-xs font-sans">
            {(['regular', 'bangla', 'arabic'] as CalendarMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-full transition-all ${mode === m ? 'bg-background shadow-sm font-semibold' : 'opacity-60 hover:opacity-100'}`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-m3-primary-container/20 rounded-3xl p-6 shadow-sm border border-m3-primary/10 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-8">
            <button onClick={prevMonth} className="p-2 hover:bg-m3-primary/10 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h2 className={`text-xl font-bold ${mode === 'arabic' ? 'text-2xl' : ''}`}>
              {formatMonthYear(currentDate)}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-m3-primary/10 rounded-full transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <div key={d} className="text-center text-[10px] uppercase tracking-wider opacity-50 font-bold py-2">
                {getDayName(d)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentToday = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={`
                    aspect-square flex items-center justify-center rounded-2xl text-sm relative
                    ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                    ${isCurrentToday ? 'bg-m3-primary text-primary-foreground font-bold' : 'hover:bg-m3-primary/5'}
                  `}
                >
                  {isCurrentToday && (
                    <span className="absolute inset-0 rounded-2xl bg-m3-primary animate-ping opacity-20"></span>
                  )}
                  <span className={mode === 'arabic' ? 'text-lg' : ''}>
                    {formatDayNumber(day)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          <div className="bg-secondary/30 p-4 rounded-3xl flex items-center gap-4">
            <CalendarIcon size={20} className="opacity-60" />
            <div className="flex-grow">
              <label className="text-[10px] uppercase tracking-wider opacity-60 block font-sans">Jump to Date</label>
              <input
                type="date"
                value={jumpDate}
                onChange={handleJump}
                className="bg-transparent w-full outline-none font-sans text-sm"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calendar;
