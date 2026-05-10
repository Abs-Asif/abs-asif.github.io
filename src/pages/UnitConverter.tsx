import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Ruler, Weight, Thermometer, Repeat } from "lucide-react";
import { Footer } from "@/components/Footer";

type UnitType = 'length' | 'weight' | 'temp';

const UnitConverter = () => {
  const [type, setType] = useState<UnitType>('length');
  const [value, setValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");

  const units = {
    length: {
      m: 1,
      km: 0.001,
      cm: 100,
      mm: 1000,
      inch: 39.3701,
      ft: 3.28084,
      mile: 0.000621371
    },
    weight: {
      kg: 1,
      g: 1000,
      mg: 1000000,
      lb: 2.20462,
      oz: 35.274
    },
    temp: {
      C: 'C',
      F: 'F',
      K: 'K'
    }
  };

  const convert = () => {
    if (type === 'temp') {
      let celsius = value;
      if (fromUnit === 'F') celsius = (value - 32) * 5/9;
      if (fromUnit === 'K') celsius = value - 273.15;

      if (toUnit === 'C') return celsius.toFixed(2);
      if (toUnit === 'F') return (celsius * 9/5 + 32).toFixed(2);
      if (toUnit === 'K') return (celsius + 273.15).toFixed(2);
      return value;
    }

    const baseValue = value / (units[type] as any)[fromUnit];
    const result = baseValue * (units[type] as any)[toUnit];
    return result.toLocaleString(undefined, { maximumFractionDigits: 5 });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mixed">
      <main className="flex-grow container max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12 flex items-center gap-6 animate-fade-in-up">
          <Link
            to="/tools"
            className="p-3 rounded-2xl hover:bg-secondary transition-all active:scale-95 bg-secondary/30"
            aria-label="Back to tools"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Unit Converter</h1>
            <p className="text-muted-foreground">Quick and easy unit conversions.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 animate-fade-in-up">
          {(['length', 'weight', 'temp'] as UnitType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                const firstUnit = Object.keys(units[t])[0];
                const secondUnit = Object.keys(units[t])[1];
                setFromUnit(firstUnit);
                setToUnit(secondUnit);
              }}
              className={`flex-1 py-4 rounded-2xl font-bold capitalize transition-all flex items-center justify-center gap-2 border-2 ${
                type === t ? 'bg-m3-primary text-m3-on-primary border-m3-primary' : 'bg-white border-transparent opacity-60'
              }`}
            >
              {t === 'length' && <Ruler size={18} />}
              {t === 'weight' && <Weight size={18} />}
              {t === 'temp' && <Thermometer size={18} />}
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white border border-border rounded-[3rem] p-8 md:p-12 shadow-inner space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest opacity-40 ml-4">Input Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-secondary/10 border-2 border-transparent focus:border-m3-primary/30 p-6 rounded-[2rem] outline-none text-3xl font-black transition-all"
            />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">From</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-secondary/10 p-4 rounded-2xl font-bold outline-none appearance-none cursor-pointer"
              >
                {Object.keys(units[type]).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="mt-6 text-m3-primary">
              <Repeat size={24} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-secondary/10 p-4 rounded-2xl font-bold outline-none appearance-none cursor-pointer"
              >
                {Object.keys(units[type]).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-border text-center">
            <p className="text-muted-foreground font-medium mb-2">Converted Value</p>
            <h2 className="text-5xl font-black text-m3-primary tracking-tighter">
              {convert()} <span className="text-xl opacity-40">{toUnit}</span>
            </h2>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UnitConverter;
