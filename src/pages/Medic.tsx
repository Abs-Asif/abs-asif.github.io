import React, { useState, useEffect, useMemo } from "react";
import { Search, Pill, Building2, Beaker, BarChart2, ChevronDown, ChevronUp, ArrowLeft, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface Drug {
  b: string; // brand name
  p: string; // power
  g: string; // generic name
  m: string; // manufacturer
}

const Medic = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetch("/medic-data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load drug data");
        return res.json();
      })
      .then((data) => {
        setDrugs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const matches: Drug[] = [];
    for (const drug of drugs) {
      const brandPower = `${drug.b} ${drug.p}`.toLowerCase();
      if (brandPower.includes(q)) {
        matches.push(drug);
      }
      if (matches.length >= 8) break;
    }
    return matches;
  }, [searchQuery, drugs]);

  const handleSelectDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setSearchQuery(`${drug.b} ${drug.p}`);
    setShowSuggestions(false);
  };

  const alternatives = useMemo(() => {
    if (!selectedDrug) return [];

    return drugs
      .filter(d =>
        d.g === selectedDrug.g &&
        // Exclude the selected drug itself
        !(d.b === selectedDrug.b && d.p === selectedDrug.p && d.m === selectedDrug.m)
      )
      .sort((a, b) => {
        const aSamePower = a.p === selectedDrug.p;
        const bSamePower = b.p === selectedDrug.p;

        // Same power first
        if (aSamePower && !bSamePower) return -1;
        if (!aSamePower && bSamePower) return 1;

        // Then alphabetical by brand name
        return a.b.localeCompare(b.b);
      });
  }, [selectedDrug, drugs]);

  const combinedGenerics = useMemo(() => {
    if (!selectedDrug) return [];

    const currentG = selectedDrug.g;
    const related = new Set<string>();

    for (const drug of drugs) {
      if (drug.g !== currentG && drug.g.includes(currentG)) {
        related.add(drug.g);
      }
    }

    return Array.from(related).sort();
  }, [selectedDrug, drugs]);

  const handleGenericClick = (genericName: string) => {
    const firstMatch = drugs.find(d => d.g === genericName);
    if (firstMatch) {
      handleSelectDrug(firstMatch);
    }
  };

  const stats = useMemo(() => {
    if (drugs.length === 0) return {
      totalDrugs: 0,
      uniqueGenerics: 0,
      uniqueManufacturers: 0,
      topGenerics: [],
      topManufacturers: [],
    };

    const genericCounts: Record<string, number> = {};
    const manufacturerCounts: Record<string, number> = {};

    drugs.forEach(d => {
      genericCounts[d.g] = (genericCounts[d.g] || 0) + 1;
      manufacturerCounts[d.m] = (manufacturerCounts[d.m] || 0) + 1;
    });

    const sortedGenerics = Object.entries(genericCounts).sort((a, b) => b[1] - a[1]);
    const sortedManufacturers = Object.entries(manufacturerCounts).sort((a, b) => b[1] - a[1]);

    return {
      totalDrugs: drugs.length,
      uniqueGenerics: Object.keys(genericCounts).length,
      uniqueManufacturers: Object.keys(manufacturerCounts).length,
      topGenerics: sortedGenerics.slice(0, 10),
      topManufacturers: sortedManufacturers.slice(0, 10),
    };
  }, [drugs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-mixed">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-slate-500 animate-pulse">Loading Medicines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center bg-white font-mixed">
        <div>
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pill size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Error</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link to="/" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-mixed text-slate-900">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 md:px-16 lg:px-28">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500" title="Back">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
              <Pill size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Medic</h1>
          </div>
        </div>
      </div>

      <main className="px-5 py-8 md:px-16 lg:px-28">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="relative">
            <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (selectedDrug) setSelectedDrug(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search by brand name + power..."
                className="flex-1 bg-transparent border-none focus:outline-none text-lg placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDrug(null);
                  }}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in-0 zoom-in-95">
                {suggestions.map((drug, i) => (
                  <button
                    key={`${drug.b}-${drug.p}-${drug.m}-${i}`}
                    onClick={() => handleSelectDrug(drug)}
                    className="w-full text-left px-5 py-3.5 hover:bg-slate-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-none group transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold text-slate-900 group-hover:text-black">
                        {drug.b} <span className="text-slate-500 font-medium">{drug.p}</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                        {drug.m.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400 line-clamp-1">{drug.g}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!selectedDrug && (
             <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
                  <Search size={32} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">Find Alternatives</h2>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Search for a medicine to find its generic alternatives and comparisons.
                  </p>
                </div>
             </div>
          )}

          {selectedDrug && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-200">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold">{selectedDrug.b}</h2>
                      <p className="text-slate-400 font-medium text-lg">{selectedDrug.p}</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3">
                      <Pill size={24} className="text-white" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex items-start gap-3">
                      <Beaker size={18} className="text-slate-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Generic Name</p>
                        <p className="font-semibold text-slate-200">{selectedDrug.g}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 size={18} className="text-slate-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Manufacturer</p>
                        <p className="text-slate-300">{selectedDrug.m}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Alternatives
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-mono">
                      {alternatives.length}
                    </span>
                  </h3>
                </div>

                <div className="grid gap-4">
                  {alternatives.map((alt, i) => (
                    <div
                      key={`${alt.b}-${alt.p}-${alt.m}-${i}`}
                      className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-300 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-slate-900">{alt.b}</span>
                            {alt.p === selectedDrug.p && (
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star size={10} fill="currentColor" /> BEST MATCH
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 font-medium">{alt.p}</p>
                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <Building2 size={12} /> {alt.m}
                          </p>
                        </div>
                        <div className="bg-slate-50 group-hover:bg-slate-100 p-3 rounded-xl transition-colors">
                          <Pill size={18} className="text-slate-400 group-hover:text-slate-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {combinedGenerics.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Combined Formulations</h3>
                  <div className="flex flex-wrap gap-2">
                    {combinedGenerics.map(gen => (
                      <button
                        key={gen}
                        onClick={() => handleGenericClick(gen)}
                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 transition-colors"
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-10 border-t border-slate-100">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold uppercase tracking-widest"
            >
              <BarChart2 size={16} />
              {showStats ? "Hide Statistics" : "View Statistics"}
              {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showStats && (
              <div className="mt-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Drugs</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalDrugs.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Generics</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.uniqueGenerics.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Manufacturers</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.uniqueManufacturers.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Top Generics</h4>
                    <div className="space-y-2">
                      {stats.topGenerics.map(([name, count]) => (
                        <button
                          key={name}
                          onClick={() => handleGenericClick(name)}
                          className="w-full flex items-center justify-between group hover:bg-slate-50 p-2 rounded-lg transition-colors text-left"
                        >
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-1">{name}</span>
                          <span className="text-xs font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">{count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Top Manufacturers</h4>
                    <div className="space-y-2">
                      {stats.topManufacturers.map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between p-2">
                          <span className="text-sm text-slate-600 line-clamp-1">{name}</span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Medic;
