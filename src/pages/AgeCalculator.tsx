import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { toBanglaNumber } from "@/lib/bangla-utils";
import {
  differenceInYears,
  differenceInMonths,
  differenceInWeeks,
  differenceInDays,
  differenceInMinutes,
  differenceInSeconds,
  addYears,
  isValid,
  startOfToday
} from "date-fns";

const AgeCalculator = () => {
  const [birthDay, setBirthDay] = useState<string>(new Date().getDate().toString());
  const [birthMonth, setBirthMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [birthYear, setBirthYear] = useState<string>(new Date().getFullYear().toString());

  const [targetDay, setTargetDay] = useState<string>(new Date().getDate().toString());
  const [targetMonth, setTargetMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [targetYear, setTargetYear] = useState<string>(new Date().getFullYear().toString());

  const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
  const targetDate = new Date(parseInt(targetYear), parseInt(targetMonth) - 1, parseInt(targetDay));

  const isReady = isValid(birthDate) && isValid(targetDate) &&
                  parseInt(birthYear) > 1900 && parseInt(targetYear) > 1900;

  const calculateAge = () => {
    if (!isReady) return null;

    const years = differenceInYears(targetDate, birthDate);
    const months = differenceInMonths(targetDate, birthDate);
    const weeks = differenceInWeeks(targetDate, birthDate);
    const days = differenceInDays(targetDate, birthDate);
    const minutes = differenceInMinutes(targetDate, birthDate);
    const seconds = differenceInSeconds(targetDate, birthDate);

    return { years, months, weeks, days, minutes, seconds };
  };

  const getMarriageEligibility = () => {
    if (!isReady) return null;

    const ageInYears = differenceInYears(targetDate, birthDate);

    const femaleTarget = addYears(birthDate, 18);
    const maleTarget = addYears(birthDate, 21);

    const femaleDaysLeft = differenceInDays(femaleTarget, targetDate);
    const maleDaysLeft = differenceInDays(maleTarget, targetDate);

    return {
      female: femaleDaysLeft > 0 ? femaleDaysLeft : 0,
      male: maleDaysLeft > 0 ? maleDaysLeft : 0,
    };
  };

  const age = calculateAge();
  const eligibility = getMarriageEligibility();

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
            <h1 className="text-4xl font-bold tracking-tight mb-1">Age Calculator</h1>
            <p className="text-muted-foreground">Calculate your age and eligibility.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <DateInputSection
            title="জন্ম তারিখ (Birth Date)"
            day={birthDay} setDay={setBirthDay}
            month={birthMonth} setMonth={setBirthMonth}
            year={birthYear} setYear={setBirthYear}
            icon="🎂"
          />
          <DateInputSection
            title="হিসাবের তারিখ (Target Date)"
            day={targetDay} setDay={setTargetDay}
            month={targetMonth} setMonth={setTargetMonth}
            year={targetYear} setYear={setTargetYear}
            icon="📅"
          />
        </div>

        {isReady && age && (
          <div className="mt-12 space-y-8 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AgeCard label="বছর (Years)" value={age.years} subLabel="Years old" color="bg-m3-primary-container text-m3-on-primary-container" />
              <AgeCard label="মাস (Months)" value={age.months} subLabel="Total months" color="bg-m3-secondary-container text-m3-on-secondary-container" />
              <AgeCard label="দিন (Days)" value={age.days} subLabel="Total days" color="bg-m3-tertiary-container text-m3-on-tertiary-container" />
              <AgeCard label="সপ্তাহ (Weeks)" value={age.weeks} subLabel="Total weeks" color="bg-secondary/50" />
              <AgeCard label="মিনিট (Minutes)" value={age.minutes} subLabel="Total minutes" color="bg-secondary/50" className="md:col-span-1" />
              <AgeCard label="সেকেন্ড (Seconds)" value={age.seconds} subLabel="Total seconds" color="bg-secondary/50" className="md:col-span-1" />
            </div>

            {eligibility && (
              <div className="p-8 bg-m3-secondary-container/30 rounded-[2.5rem] border border-m3-secondary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                   <Clock size={120} />
                </div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="bg-m3-secondary/20 p-2 rounded-xl text-m3-secondary"><Clock size={24} /></span>
                  বিয়ের যোগ্য হতে বাকি
                </h2>
                <div className="grid gap-4">
                  <EligibilityRow
                    label="নারী (১৮ বছর)"
                    daysLeft={eligibility.female}
                    targetDate={addYears(birthDate, 18)}
                  />
                  <EligibilityRow
                    label="পুরুষ (২১ বছর)"
                    daysLeft={eligibility.male}
                    targetDate={addYears(birthDate, 21)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const DateInputSection = ({ title, day, setDay, month, setMonth, year, setYear, icon }: any) => (
  <div className="bg-m3-primary-container/20 p-6 rounded-[2rem] border border-m3-primary/10 space-y-4">
    <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
      <span>{icon}</span> {title}
    </h3>
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Day</label>
        <input
          type="number" min="1" max="31" value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full bg-background p-3 rounded-xl border border-border/50 outline-none focus:ring-2 ring-m3-primary/20 transition-all text-center font-bold"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Month</label>
        <input
          type="number" min="1" max="12" value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full bg-background p-3 rounded-xl border border-border/50 outline-none focus:ring-2 ring-m3-primary/20 transition-all text-center font-bold"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Year</label>
        <input
          type="number" value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full bg-background p-3 rounded-xl border border-border/50 outline-none focus:ring-2 ring-m3-primary/20 transition-all text-center font-bold"
        />
      </div>
    </div>
  </div>
);

const AgeCard = ({ label, value, subLabel, color, className = "" }: { label: string; value: number; subLabel: string; color: string; className?: string }) => (
  <div className={`p-6 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-sm border border-black/5 ${color} ${className}`}>
    <span className="text-3xl font-black mb-1">{toBanglaNumber(value.toLocaleString())}</span>
    <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{label}</span>
    <span className="text-[10px] opacity-40 font-medium">{subLabel}</span>
  </div>
);

const EligibilityRow = ({ label, daysLeft, targetDate }: { label: string; daysLeft: number; targetDate: Date }) => (
  <div className="bg-background/40 p-5 rounded-2xl flex items-center justify-between group hover:bg-background/60 transition-colors">
    <div>
      <div className="text-sm font-bold opacity-60 mb-1">{label}</div>
      <div className="text-lg font-black">
        {daysLeft > 0 ? `${toBanglaNumber(daysLeft)} দিন বাকি` : "যোগ্য (Eligible)"}
      </div>
    </div>
    {daysLeft > 0 && (
      <div className="text-right">
        <div className="text-[10px] uppercase font-bold opacity-40 mb-1">Target Date</div>
        <div className="text-xs font-bold opacity-60 bg-m3-secondary/10 px-2 py-1 rounded-lg">
          {toBanglaNumber(targetDate.getDate())}/{toBanglaNumber(targetDate.getMonth() + 1)}/{toBanglaNumber(targetDate.getFullYear())}
        </div>
      </div>
    )}
    {daysLeft === 0 && (
      <div className="bg-green-500/20 p-2 rounded-full text-green-600">
        <ChevronRight size={20} />
      </div>
    )}
  </div>
);

export default AgeCalculator;
