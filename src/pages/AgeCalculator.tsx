import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
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
  isValid
} from "date-fns";

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  const isReady = birthDate && targetDate && isValid(birth) && isValid(target);

  const calculateAge = () => {
    if (!isReady) return null;

    const years = differenceInYears(target, birth);
    const months = differenceInMonths(target, birth);
    const weeks = differenceInWeeks(target, birth);
    const days = differenceInDays(target, birth);
    const minutes = differenceInMinutes(target, birth);
    const seconds = differenceInSeconds(target, birth);

    return { years, months, weeks, days, minutes, seconds };
  };

  const getMarriageEligibility = () => {
    if (!isReady) return null;

    const ageInYears = differenceInYears(target, birth);
    if (ageInYears >= 21) return null;

    const femaleTarget = addYears(birth, 18);
    const maleTarget = addYears(birth, 21);

    const femaleDaysLeft = differenceInDays(femaleTarget, target);
    const maleDaysLeft = differenceInDays(maleTarget, target);

    return {
      female: femaleDaysLeft > 0 ? femaleDaysLeft : 0,
      male: maleDaysLeft > 0 ? maleDaysLeft : 0,
    };
  };

  const age = calculateAge();
  const eligibility = getMarriageEligibility();

  return (
    <div className="min-h-screen bg-background flex flex-col font-bangla">
      <main className="flex-grow container max-w-md mx-auto px-4 py-12">
        <div className="mb-12 flex items-center gap-4 animate-fade-in-up">
          <Link
            to="/tools"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Back to tools"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight font-sans">Age Calculator</h1>
        </div>

        <div className="space-y-6 bg-m3-primary-container/30 p-6 rounded-3xl shadow-sm border border-m3-primary/10 animate-fade-in-up">
          <div className="space-y-2">
            <label className="text-sm font-medium opacity-70">জন্ম তারিখ</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-4 rounded-2xl bg-background border-2 border-m3-primary/20 focus:border-m3-primary outline-none transition-all font-sans"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium opacity-70">আজকের তারিখ (বা অন্য কোনো তারিখ)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-4 rounded-2xl bg-background border-2 border-m3-primary/20 focus:border-m3-primary outline-none transition-all font-sans"
            />
          </div>
        </div>

        {age && (
          <div className="mt-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <div className="grid grid-cols-2 gap-4">
              <AgeCard label="বছর" value={age.years} />
              <AgeCard label="মাস" value={age.months} />
              <AgeCard label="সপ্তাহ" value={age.weeks} />
              <AgeCard label="দিন" value={age.days} />
              <AgeCard label="মিনিট" value={age.minutes} className="col-span-2" />
              <AgeCard label="সেকেন্ড" value={age.seconds} className="col-span-2" />
            </div>

            {eligibility && (
              <div className="mt-8 p-6 bg-m3-secondary-container/50 rounded-3xl border border-m3-secondary/20">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock size={20} /> বিয়ের যোগ্য হতে বাকি
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>নারী (১৮ বছর)</span>
                    <span className="font-bold">
                      {eligibility.female > 0
                        ? `${toBanglaNumber(eligibility.female)} দিন`
                        : "যোগ্য"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>পুরুষ (২১ বছর)</span>
                    <span className="font-bold">
                      {eligibility.male > 0
                        ? `${toBanglaNumber(eligibility.male)} দিন`
                        : "যোগ্য"}
                    </span>
                  </div>
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

const AgeCard = ({ label, value, className = "" }: { label: string; value: number; className?: string }) => (
  <div className={`p-4 rounded-2xl bg-m3-primary-container text-m3-on-primary-container flex flex-col items-center justify-center text-center ${className}`}>
    <span className="text-2xl font-bold">{toBanglaNumber(value.toLocaleString())}</span>
    <span className="text-xs opacity-70 uppercase tracking-wider">{label}</span>
  </div>
);

export default AgeCalculator;
