import { useState, useEffect } from "react";
import { intervalToDuration } from "date-fns";
import { toBanglaNumber } from "@/lib/bangla-utils";
import profileTransparent from "@/assets/profile-transparent.png";

const RealtimeAge = () => {
  const [age, setAge] = useState<{ years?: number; months?: number; days?: number }>({});

  useEffect(() => {
    const calculate = () => {
      const birthDate = new Date(2023, 1, 18); // 18 Feb 2023
      const now = new Date();
      const duration = intervalToDuration({ start: birthDate, end: now });
      setAge({
        years: duration.years,
        months: duration.months,
        days: duration.days,
      });
    };

    calculate();
    const timer = setInterval(calculate, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (age.years === undefined) return null;

  return (
    <div className="text-xl font-bangla text-muted-foreground animate-fade-in-up opacity-0" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
      {toBanglaNumber(age.years)} বছর, {toBanglaNumber(age.months || 0)} মাস, {toBanglaNumber(age.days || 0)}
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="pt-6 pb-2 flex flex-col items-center justify-center text-center px-4 relative">
      <div className="w-64 h-64 mb-2 animate-fade-in-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <img
          src={profileTransparent}
          alt="Md. Abdullah Bari"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      <div className="max-w-2xl animate-fade-in-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Md. Abdullah Bari
        </h1>
        <RealtimeAge />
      </div>
    </section>
  );
};
