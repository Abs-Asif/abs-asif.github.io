import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw, Clock, Loader2 } from "lucide-react";
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
  differenceInDays,
  parseISO
} from "date-fns";

type CalendarMode = 'gregorian' | 'bengali' | 'hijri';

interface Holiday {
  date: string;
  name: string;
  bangla: string;
}

const RELIGIOUS_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-02-14', name: 'Shab-e-Barat', bangla: 'শবে বরাত' },
  { date: '2025-03-27', name: 'Lailatul Qadr', bangla: 'লাইলাতুল কদর' },
  { date: '2025-03-31', name: 'Eid-ul-Fitr', bangla: 'ঈদুল ফিতর' },
  { date: '2025-04-01', name: 'Eid-ul-Fitr', bangla: 'ঈদুল ফিতর' },
  { date: '2025-04-02', name: 'Eid-ul-Fitr', bangla: 'ঈদুল ফিতর' },
  { date: '2025-05-14', name: 'Buddha Purnima', bangla: 'বুদ্ধ পূর্ণিমা' },
  { date: '2025-06-07', name: 'Eid-ul-Adha', bangla: 'ঈদুল আযহা' },
  { date: '2025-06-08', name: 'Eid-ul-Adha', bangla: 'ঈদুল আযহা' },
  { date: '2025-06-09', name: 'Eid-ul-Adha', bangla: 'ঈদুল আযহা' },
  { date: '2025-07-06', name: 'Ashura', bangla: 'আশুরা' },
  { date: '2025-08-16', name: 'Janmashtami', bangla: 'জন্মাষ্টমী' },
  { date: '2025-09-05', name: 'Eid-e-Miladunnabi', bangla: 'ঈদে মিলাদুন্নবী' },
  { date: '2025-10-01', name: 'Durga Puja', bangla: 'দুর্গাপূজা' },
  { date: '2025-10-02', name: 'Durga Puja', bangla: 'দুর্গাপূজা' },
];

const BENGALI_MONTHS = [
  { name: "Boishakh", bangla: "বৈশাখ", startMonth: 3, startDate: 14, days: 31 },
  { name: "Jyaistha", bangla: "জ্যৈষ্ঠ", startMonth: 4, startDate: 15, days: 31 },
  { name: "Ashadha", bangla: "আষাঢ়", startMonth: 5, startDate: 15, days: 31 },
  { name: "Shraban", bangla: "শ্রাবণ", startMonth: 6, startDate: 16, days: 31 },
  { name: "Bhadra", bangla: "ভাদ্র", startMonth: 7, startDate: 16, days: 31 },
  { name: "Ashwin", bangla: "আশ্বিন", startMonth: 8, startDate: 16, days: 31 },
  { name: "Kartik", bangla: "কার্তিক", startMonth: 9, startDate: 17, days: 30 },
  { name: "Agrahayan", bangla: "অগ্রহায়ণ", startMonth: 10, startDate: 16, days: 30 },
  { name: "Poush", bangla: "পৌষ", startMonth: 11, startDate: 16, days: 30 },
  { name: "Magh", bangla: "মাঘ", startMonth: 0, startDate: 15, days: 30 },
  { name: "Falgun", bangla: "ফাল্গুন", startMonth: 1, startDate: 14, days: 29 },
  { name: "Chaitra", bangla: "চৈত্র", startMonth: 2, startDate: 15, days: 30 },
];

const Calendar = () => {
  const [mode, setMode] = useState<CalendarMode>('gregorian');
  const [viewDate, setViewDate] = useState(new Date());
  const [isJumping, setIsJumping] = useState(false);
  const [jumpMonth, setJumpMonth] = useState(new Date().getMonth());
  const [jumpYear, setJumpYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);

  const today = new Date();

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoadingHolidays(true);
      try {
        const year = viewDate.getFullYear();
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BD`);
        if (!response.ok) throw new Error("Failed to fetch holidays");
        const data = await response.json();
        const apiHolidays = data.map((h: any) => ({
          date: h.date,
          name: h.name,
          bangla: h.localName
        }));

        // Merge with religious holidays if it's 2025, or just keep unique dates
        const combined = [...apiHolidays];
        if (year === 2025) {
          RELIGIOUS_HOLIDAYS_2025.forEach(rh => {
            if (!combined.some(h => h.date === rh.date)) {
              combined.push(rh);
            }
          });
        }
        setHolidays(combined.sort((a, b) => a.date.localeCompare(b.date)));
      } catch (error) {
        console.error("Holiday fetch error:", error);
        if (viewDate.getFullYear() === 2025) {
          setHolidays(RELIGIOUS_HOLIDAYS_2025);
        }
      } finally {
        setLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, [viewDate.getFullYear()]);

  const getCalendarData = () => {
    if (mode === 'gregorian') {
      const start = startOfMonth(viewDate);
      const end = endOfMonth(start);
      const days = eachDayOfInterval({
        start: startOfWeek(start),
        end: endOfWeek(end),
      });
      return {
        title: format(viewDate, "MMMM yyyy"),
        days,
        isCurrent: isSameMonth(viewDate, today)
      };
    } else if (mode === 'bengali') {
      const currentMonthInfo = BENGALI_MONTHS.find(m => m.startMonth === viewDate.getMonth());
      let start: Date;
      let monthInfo;

      if (currentMonthInfo && viewDate.getDate() >= currentMonthInfo.startDate) {
        start = new Date(viewDate.getFullYear(), currentMonthInfo.startMonth, currentMonthInfo.startDate);
        monthInfo = currentMonthInfo;
      } else {
        const prevIdx = (BENGALI_MONTHS.findIndex(m => m.startMonth === viewDate.getMonth()) - 1 + 12) % 12;
        monthInfo = BENGALI_MONTHS[prevIdx];
        let prevYear = viewDate.getFullYear();
        if (viewDate.getMonth() < monthInfo.startMonth) prevYear--;
        start = new Date(prevYear, monthInfo.startMonth, monthInfo.startDate);
      }

      let duration = monthInfo.days;
      if (monthInfo.name === "Falgun" && (start.getFullYear() % 4 === 0)) {
        duration = 30;
      }
      const end = new Date(start);
      end.setDate(start.getDate() + duration - 1);

      const days = eachDayOfInterval({
        start: startOfWeek(start),
        end: endOfWeek(end),
      });

      const bengaliYear = start.getFullYear() - (start.getMonth() < 3 || (start.getMonth() === 3 && start.getDate() < 14) ? 594 : 593);

      return {
        title: `${monthInfo.bangla} ${toBanglaNumber(bengaliYear)}`,
        days,
        isCurrent: today >= start && today <= end
      };
    } else {
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-tbla-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).formatToParts(viewDate);

      const hijriDay = parseInt(parts.find(p => p.type === 'day')!.value);
      const hijriMonth = new Intl.DateTimeFormat('en-u-ca-islamic-tbla-nu-latn', { month: 'long' }).format(viewDate);
      const hijriYear = parts.find(p => p.type === 'year')!.value;

      const start = new Date(viewDate);
      start.setDate(viewDate.getDate() - (hijriDay - 1));

      const end = new Date(start);
      end.setDate(start.getDate() + 28);
      const nextDay = new Date(end);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextParts = new Intl.DateTimeFormat('en-u-ca-islamic-tbla-nu-latn', { day: 'numeric' }).formatToParts(nextDay);
      if (parseInt(nextParts.find(p => p.type === 'day')!.value) !== 1) {
        end.setDate(end.getDate() + 1);
      }

      const days = eachDayOfInterval({
        start: startOfWeek(start),
        end: endOfWeek(end),
      });

      return {
        title: `${hijriMonth} ${hijriYear}`,
        days,
        isCurrent: today >= start && today <= end,
      };
    }
  };

  const { title, days, isCurrent } = getCalendarData();

  const handlePrev = () => setViewDate(subMonths(viewDate, 1));
  const handleNext = () => setViewDate(addMonths(viewDate, 1));
  const goToday = () => setViewDate(new Date());

  const handleJump = () => {
    setViewDate(new Date(jumpYear, jumpMonth, 1));
    setIsJumping(false);
  };

  const holidayList = useMemo(() => {
    return holidays
      .map(h => ({ ...h, dateObj: parseISO(h.date) }))
      .filter(h => h.dateObj >= today || isSameDay(h.dateObj, today))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(0, 5);
  }, [holidays, today]);

  const getHoliday = (date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    return holidays.find(h => h.date === dStr);
  };

  const formatDayNumber = (date: Date) => {
    if (mode === 'bengali') {
      const currentMonthInfo = BENGALI_MONTHS.find(m => m.startMonth === date.getMonth());
      let bDay;
      if (currentMonthInfo && date.getDate() >= currentMonthInfo.startDate) {
        bDay = date.getDate() - currentMonthInfo.startDate + 1;
      } else {
        const prevIdx = (BENGALI_MONTHS.findIndex(m => m.startMonth === date.getMonth()) - 1 + 12) % 12;
        const pm = BENGALI_MONTHS[prevIdx];
        let py = date.getFullYear();
        if (date.getMonth() < pm.startMonth) py--;
        const start = new Date(py, pm.startMonth, pm.startDate);
        bDay = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      return toBanglaNumber(bDay);
    }
    if (mode === 'hijri') {
      return new Intl.DateTimeFormat('en-u-ca-islamic-tbla-nu-latn', { day: 'numeric' }).format(date);
    }
    return date.getDate().toString();
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col font-mixed`}>
      <main className="flex-grow container max-w-md mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Link
              to="/tools"
              className="p-2 rounded-full hover:bg-secondary transition-colors bg-secondary/20"
              aria-label="Back to tools"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          </div>

          <div className="flex bg-secondary/30 p-1 rounded-2xl text-xs">
            {(['gregorian', 'bengali', 'hijri'] as CalendarMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setIsJumping(false); }}
                className={`px-3 py-2 rounded-xl transition-all ${mode === m ? 'bg-background shadow-sm font-bold' : 'opacity-60 hover:opacity-100'}`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-m3-primary-container/20 rounded-[2.5rem] p-6 shadow-sm border border-m3-primary/10 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          {loadingHolidays && (
            <div className="absolute top-4 right-4 animate-spin opacity-40">
              <Loader2 size={16} />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrev} className="p-2 hover:bg-m3-primary/10 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="text-center">
              <h2 className={`text-xl font-bold ${mode === 'hijri' ? 'font-serif' : mode === 'bengali' ? 'font-bangla text-2xl' : ''}`}>
                {title}
              </h2>
            </div>
            <button onClick={handleNext} className="p-2 hover:bg-m3-primary/10 rounded-full transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] uppercase tracking-wider opacity-40 font-black py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const holiday = getHoliday(day);
              const isTodayDay = isToday(day);
              const isCurrentMonth = mode === 'gregorian' ? isSameMonth(day, viewDate) : true;

              return (
                <div
                  key={day.toString()}
                  className={`
                    aspect-square flex items-center justify-center rounded-2xl text-sm relative transition-all
                    ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                    ${isTodayDay ? 'bg-m3-primary text-primary-foreground font-bold z-10' : 'hover:bg-m3-primary/5'}
                    ${holiday && !isTodayDay ? 'bg-m3-tertiary-container/50 text-m3-on-tertiary-container font-medium' : ''}
                  `}
                  title={holiday?.name}
                >
                  {isTodayDay && (
                    <span className="absolute inset-0 rounded-2xl bg-m3-primary animate-ping opacity-20 -z-10"></span>
                  )}
                  <span className={mode === 'hijri' ? 'font-serif text-base' : mode === 'bengali' ? 'font-bangla text-lg' : ''}>
                    {formatDayNumber(day)}
                  </span>
                  {holiday && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-50"></span>
                  )}
                </div>
              );
            })}
          </div>

          {!isCurrent && (
            <button
              onClick={goToday}
              className="mt-6 w-full py-3 bg-secondary/50 hover:bg-secondary transition-colors rounded-2xl flex items-center justify-center gap-2 text-sm font-medium"
            >
              <RotateCcw size={16} /> Back to Today
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          <button
            onClick={() => setIsJumping(!isJumping)}
            className="w-full bg-secondary/30 p-4 rounded-3xl flex items-center justify-between hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <CalendarIcon size={20} className="opacity-60" />
              <span className="text-sm font-medium">Month Jump</span>
            </div>
            <ChevronLeft size={20} className={`opacity-40 transition-transform ${isJumping ? '-rotate-90' : ''}`} />
          </button>

          {isJumping && (
            <div className="bg-secondary/20 p-6 rounded-[2rem] space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest opacity-50 ml-1">Month</label>
                  <select
                    value={jumpMonth}
                    onChange={(e) => setJumpMonth(parseInt(e.target.value))}
                    className="w-full bg-background p-3 rounded-xl outline-none text-sm border border-border/50"
                  >
                    {Array.from({length: 12}).map((_, i) => (
                      <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest opacity-50 ml-1">Year</label>
                  <input
                    type="number"
                    value={jumpYear}
                    onChange={(e) => setJumpYear(parseInt(e.target.value))}
                    className="w-full bg-background p-3 rounded-xl outline-none text-sm border border-border/50"
                  />
                </div>
              </div>
              <button
                onClick={handleJump}
                className="w-full bg-m3-primary text-primary-foreground py-3 rounded-xl font-bold text-sm shadow-lg shadow-m3-primary/20 active:scale-95 transition-all"
              >
                Go to Date
              </button>
            </div>
          )}

          <div className="pt-4">
            <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4 ml-2">Upcoming Holidays</h3>
            <div className="space-y-3">
              {holidayList.length > 0 ? holidayList.map((h, i) => {
                const daysLeft = differenceInDays(h.dateObj, today);
                return (
                  <div key={i} className="bg-m3-tertiary-container/30 p-4 rounded-3xl flex items-center gap-4 border border-m3-tertiary/10">
                    <div className="bg-m3-tertiary/20 p-3 rounded-2xl text-m3-on-tertiary-container">
                      <Clock size={20} />
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold text-sm">{h.name}</div>
                      <div className="text-xs opacity-60 font-bangla">{h.bangla} • {format(h.dateObj, 'dd MMM yyyy')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-m3-tertiary uppercase tracking-tighter">
                        {daysLeft === 0 ? "Today" : `${daysLeft} Day${daysLeft > 1 ? 's' : ''}`}
                      </div>
                      <div className="text-[10px] opacity-40 uppercase font-bold">Left</div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-center text-sm opacity-40 py-8">No upcoming holidays found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calendar;
