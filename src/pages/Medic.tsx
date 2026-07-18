import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Pill,
  Building2,
  Beaker,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ShieldCheck,
  Activity,
  Award
} from "lucide-react";

interface Drug {
  b: string; // brand name
  p: string; // power
  g: string; // generic name
  m: string; // manufacturer
}

interface Rule {
  id: number;
  original: string;
  pattern: RegExp;
  description: string;
}

// Exactly 73 Medical Assistant Medicine Allowance Rules
const ALLOWED_RULES: Rule[] = [
  { id: 1, original: "Aspirin", pattern: /aspirin/i, description: "Antiplatelet & analgesic agent" },
  { id: 2, original: "Paracetamol", pattern: /paracetamol/i, description: "First-line antipyretic & analgesic" },
  { id: 3, original: "Diclofenac", pattern: /diclofenac/i, description: "Non-steroidal anti-inflammatory drug" },
  { id: 4, original: "Ibuprofen", pattern: /ibuprofen|dexibuprofen/i, description: "NSAID for pain and inflammation" },
  { id: 5, original: "Methyl salicylate", pattern: /methyl salicylate|methylsalicylate|salicylate/i, description: "Topical analgesic for muscle/joint pain" },
  { id: 6, original: "Albendazole", pattern: /albendazole/i, description: "Broad-spectrum anthelmintic" },
  { id: 7, original: "Amoxicillin", pattern: /amoxicillin/i, description: "Broad-spectrum penicillin antibiotic" },
  { id: 8, original: "Ampicillin", pattern: /ampicillin/i, description: "Beta-lactam penicillin antibiotic" },
  { id: 9, original: "Chloroquine phosphate", pattern: /chloroquine/i, description: "Antimalarial agent" },
  { id: 10, original: "Cloxacillin", pattern: /cloxacillin|flucloxacillin/i, description: "Penicillinase-resistant antibiotic" },
  { id: 11, original: "Co-trimoxazole", pattern: /trimethoprim|sulfamethoxazole|sulphamethoxazole|co-trimoxazole/i, description: "Combination sulfonamide antibiotic" },
  { id: 12, original: "Doxycycline", pattern: /doxycycline/i, description: "Tetracycline-class broad antibiotic" },
  { id: 13, original: "Griseofulvin", pattern: /griseofulvin/i, description: "Antifungal for dermatophyte infections" },
  { id: 14, original: "Phenoxymethylpenicillin", pattern: /phenoxymethyl|penicillin v/i, description: "Oral penicillin antibiotic" },
  { id: 15, original: "Procaine penicillin", pattern: /procaine penicillin|benzathine penicillin|penicillin/i, description: "Injectable/long-acting penicillin" },
  { id: 16, original: "Pyrantel pamoate", pattern: /pyrantel/i, description: "Anthelmintic for roundworms/pinworms" },
  { id: 17, original: "Quinine", pattern: /quinine/i, description: "Antimalarial for severe cases" },
  { id: 18, original: "Pyrimethamine with sulfadoxine", pattern: /pyrimethamine|sulphadoxine|sulfadoxine/i, description: "Antimalarial combination therapy" },
  { id: 19, original: "Tetracycline/Oxytetracycline", pattern: /tetracycline|oxytetracycline/i, description: "Broad-spectrum tetracycline antibiotics" },
  { id: 20, original: "Glyceryl trinitrate", pattern: /nitroglycerin|glyceryl trinitrate|trinitrate/i, description: "Vasodilator for angina pectoris" },
  { id: 21, original: "Methyldopa", pattern: /methyldopa/i, description: "Centrally-acting antihypertensive (pregnancy safe)" },
  { id: 22, original: "Propranolol", pattern: /propranolol/i, description: "Non-selective beta-blocker" },
  { id: 23, original: "Antacid chewable", pattern: /aluminium hydroxide|magnesium hydroxide|magnesium trisilicate|simethicone|antacid/i, description: "Antacid formulations for hyperacidity" },
  { id: 24, original: "Glycerin", pattern: /glycerin|glycerine/i, description: "Laxative suppository & humectant" },
  { id: 25, original: "Hyoscine N-butylbromide", pattern: /hyoscine/i, description: "Antispasmodic for GI tract" },
  { id: 26, original: "Milk of magnesia", pattern: /magnesium hydroxide/i, description: "Osmotic laxative & antacid" },
  { id: 27, original: "Omeprazole", pattern: /omeprazole|esomeprazole|pantoprazole|rabeprazole|lansoprazole/i, description: "Proton Pump Inhibitors (PPIs)" },
  { id: 28, original: "Oral rehydration salts (ORS)", pattern: /oral rehydration|ors/i, description: "Fluid & electrolyte replacement therapy" },
  { id: 29, original: "Ranitidine", pattern: /ranitidine|famotidine/i, description: "H2-receptor antagonist (Famotidine as safe database alternative)" },
  { id: 30, original: "Potassium permanganate", pattern: /permanganate/i, description: "Antiseptic & astringent disinfectant" },
  { id: 31, original: "Atropine", pattern: /atropine/i, description: "Anticholinergic agent / emergency antidote" },
  { id: 32, original: "Benzoic acid and salicylic acid", pattern: /benzoic acid|salicylic acid/i, description: "Whitfield's ointment for fungal infections" },
  { id: 33, original: "Benzyl benzoate", pattern: /benzyl benzoate/i, description: "Scabicide & pediculicide" },
  { id: 34, original: "Chlorhexidine", pattern: /chlorhexidine/i, description: "Broad-spectrum antiseptic disinfectant" },
  { id: 35, original: "Chlorhexidine plus cetrimide", pattern: /cetrimide/i, description: "Antiseptic cleaning solution" },
  { id: 36, original: "Chloroxylenol", pattern: /chloroxylenol/i, description: "Antiseptic wound cleanser" },
  { id: 37, original: "Gentian violet", pattern: /gentian violet/i, description: "Topical antifungal dye" },
  { id: 38, original: "Neomycin/Gentamicin/Bacitracin combination", pattern: /neomycin|gentamicin|bacitracin/i, description: "Topical triple antibiotic formulations" },
  { id: 39, original: "Permethrin", pattern: /permethrin/i, description: "First-line scabies & lice treatment" },
  { id: 40, original: "Povidone iodine", pattern: /povidone/i, description: "Pre- & post-operative topical antiseptic" },
  { id: 41, original: "Silver sulfadiazine", pattern: /silver sulfadiazine|sulfadiazine/i, description: "Topical antibacterial for burn wounds" },
  { id: 42, original: "Calcium", pattern: /calcium/i, description: "Calcium mineral supplement" },
  { id: 43, original: "Ferrous sulfate/gluconate/fumarate", pattern: /ferrous|iron/i, description: "Iron deficiency anemia therapy" },
  { id: 44, original: "Folic acid", pattern: /folic acid|folate/i, description: "Folate supplement for red blood cells & pregnancy" },
  { id: 45, original: "Multivitamin", pattern: /multivitamin|multi-vitamin|multimineral/i, description: "Nutritional multivitamin support" },
  { id: 46, original: "Riboflavin", pattern: /riboflavin/i, description: "Vitamin B2 supplement" },
  { id: 47, original: "Vitamin A", pattern: /vitamin a|retinol/i, description: "Essential fat-soluble vitamin for vision/immunity" },
  { id: 48, original: "Vitamin B complex", pattern: /vitamin b|thiamine|pyridoxine|cyanocobalamin/i, description: "Vitamin B1, B6, B12 complex" },
  { id: 49, original: "Vitamin C (ascorbic acid)", pattern: /ascorbic|vitamin c/i, description: "Antioxidant & immunity vitamin" },
  { id: 50, original: "Zinc", pattern: /zinc/i, description: "Essential trace mineral for immune & GI health" },
  { id: 51, original: "Chloramphenicol", pattern: /chloramphenicol/i, description: "Broad-spectrum ophthalmic & systemic antibiotic" },
  { id: 52, original: "Chlorpheniramine maleate", pattern: /chlorpheniramine/i, description: "First-generation sedating antihistamine" },
  { id: 53, original: "Dextromethorphan", pattern: /dextromethorphan/i, description: "Non-narcotic cough suppressant" },
  { id: 54, original: "Promethazine theoclate", pattern: /promethazine/i, description: "Antihistamine, antiemetic & sedative" },
  { id: 55, original: "Salbutamol", pattern: /salbutamol|levosalbutamol/i, description: "Short-acting beta2-agonist bronchodilator" },
  { id: 56, original: "Xylometazoline 0.1%", pattern: /xylometazoline/i, description: "Topical nasal decongestant" },
  { id: 57, original: "Contraceptive low dose", pattern: /desogestrel|ethinyl estradiol|levonorgestrel|norgestrel|gestodene|lynestrenol|contraceptive/i, description: "Daily oral contraceptive pills" },
  { id: 58, original: "Emergency contraceptive", pattern: /levonorgestrel|ulipristal/i, description: "Post-coital emergency contraception" },
  { id: 59, original: "Cholera fluid", pattern: /cholera saline/i, description: "IV fluid for cholera & severe diarrhea dehydrations" },
  { id: 60, original: "Dextrose in water (5%, 25%, 50%)", pattern: /dextrose/i, description: "IV calorie/hydration fluid" },
  { id: 61, original: "I.V. saline of various strengths (0.9%, 0.25%, 0.18%) with 4% dextrose / 0.9% saline without dextrose", pattern: /sodium chloride|saline/i, description: "IV hydration saline therapies" },
  { id: 62, original: "Redistilled water (pyrogen free)", pattern: /water for injection/i, description: "Sterile diluent for injections" },
  { id: 63, original: "Diazepam", pattern: /diazepam/i, description: "Benzodiazepine anxiolytic & anticonvulsant" },
  { id: 64, original: "Phenobarbitone", pattern: /phenobarbital|phenobarbitone/i, description: "Barbiturate anticonvulsant for epilepsy" },
  { id: 65, original: "Ergometrine/Methylergometrine maleate", pattern: /ergometrine|methylergometrine/i, description: "Uterotonic for postpartum hemorrhage" },
  { id: 66, original: "Misoprostol", pattern: /misoprostol/i, description: "Prostaglandin analogue for ulcers & labor induction" },
  { id: 67, original: "Oxytocin", pattern: /oxytocin/i, description: "Uterine stimulant for labor & bleeding" },
  { id: 68, original: "Hydrochlorothiazide", pattern: /hydrochlorothiazide/i, description: "Thiazide diuretic for hypertension & edema" },
  { id: 69, original: "Lidocaine 1%, 2% without adrenaline", pattern: /lidocaine|lignocaine/i, description: "Local anesthetic" },
  { id: 70, original: "BCG/DPT/TT/Polio/Measles/Hepatitis B/Influenza vaccines", pattern: /vaccine|tetanus|hepatitis b|measles|influenza|polio|dpt|bcg/i, description: "EPI immunizations" },
  { id: 71, original: "DT/DPT/Polio/Tetanus/Diphtheria vaccine", pattern: /vaccine|tetanus|diphtheria/i, description: "EPI booster immunizations" },
  { id: 72, original: "Hepatitis B vaccine", pattern: /hepatitis b/i, description: "Recombinant Hepatitis B immunization" },
  { id: 73, original: "Tetanus Ig", pattern: /tetanus immunoglobulin|human tetanus|tetanus antitoxin/i, description: "Passive immunization for tetanus exposure" }
];

// Helper to check a sub-part of generic name against rules
const getMatchingRule = (genericPart: string): Rule | null => {
  const p = genericPart.trim();
  if (!p) return null;
  for (const rule of ALLOWED_RULES) {
    if (rule.pattern.test(p)) {
      return rule;
    }
  }
  return null;
};

// Split compound generic name into components
const splitGenericComponents = (genericName: string): string[] => {
  return genericName
    .split(/[+&,]| or | with /i)
    .map(part => part.trim())
    .filter(part => part.length > 0);
};

// Check full allowance status of a generic name
const evaluateGenericAllowance = (genericName: string) => {
  const parts = splitGenericComponents(genericName);
  const checkedComponents = parts.map(part => {
    const matched = getMatchingRule(part);
    return {
      name: part,
      allowed: matched !== null,
      rule: matched
    };
  });

  const total = checkedComponents.length;
  const allowedCount = checkedComponents.filter(c => c.allowed).length;

  let status: "allowed" | "partially" | "not_allowed" = "not_allowed";
  if (total > 0) {
    if (allowedCount === total) {
      status = "allowed";
    } else if (allowedCount > 0) {
      status = "partially";
    }
  }

  return {
    status,
    components: checkedComponents,
    total,
    allowedCount
  };
};

const Medic = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  // Stats view states
  const [showStats, setShowStats] = useState(false);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [tileSearchTerm, setTileSearchTerm] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load drugs dataset with basic in-memory caching
  useEffect(() => {
    const cached = sessionStorage.getItem("medic_drugs_cache");
    if (cached) {
      try {
        setDrugs(JSON.parse(cached));
        setLoading(false);
        return;
      } catch (e) {
        // Fallback to fetch
      }
    }

    fetch("/medic-data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load drug database");
        return res.json();
      })
      .then((data) => {
        setDrugs(data);
        try {
          sessionStorage.setItem("medic_drugs_cache", JSON.stringify(data));
        } catch (e) {
          // Ignore storage quota errors
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Compute search suggestions based on brand or generic name
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const matches: Drug[] = [];
    const seen = new Set<string>();

    for (const drug of drugs) {
      const brandPower = `${drug.b} ${drug.p}`.toLowerCase();
      const generic = drug.g.toLowerCase();

      if (brandPower.includes(q) || generic.includes(q)) {
        const key = `${drug.b}-${drug.p}-${drug.g}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push(drug);
        }
      }
      if (matches.length >= 10) break;
    }
    return matches;
  }, [searchQuery, drugs]);

  const handleSelectDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setSearchQuery(`${drug.b} ${drug.p}`);
    setIsFocused(false);
  };

  // Same-generic alternatives (sorted by: same power first, then alphabetical brand)
  const alternatives = useMemo(() => {
    if (!selectedDrug) return [];

    return drugs
      .filter(d =>
        d.g.toLowerCase() === selectedDrug.g.toLowerCase() &&
        !(d.b.toLowerCase() === selectedDrug.b.toLowerCase() && d.p === selectedDrug.p && d.m === selectedDrug.m)
      )
      .sort((a, b) => {
        const aSamePower = a.p === selectedDrug.p;
        const bSamePower = b.p === selectedDrug.p;
        if (aSamePower && !bSamePower) return -1;
        if (!aSamePower && bSamePower) return 1;
        return a.b.localeCompare(b.b);
      });
  }, [selectedDrug, drugs]);

  // Combined formulations (generics in DB that contain the current selected generic as a substring)
  const combinedFormulations = useMemo(() => {
    if (!selectedDrug) return [];
    const currentG = selectedDrug.g.toLowerCase();
    const related = new Set<string>();

    for (const drug of drugs) {
      const dg = drug.g.toLowerCase();
      if (dg !== currentG && dg.includes(currentG)) {
        related.add(drug.g);
      }
    }
    return Array.from(related).sort();
  }, [selectedDrug, drugs]);

  // Pre-calculate full statistics
  const stats = useMemo(() => {
    if (drugs.length === 0) return {
      totalMedicines: 0,
      uniqueGenerics: [],
      uniqueManufacturers: [],
      allowedMedicinesCount: 0,
      allowedGenerics: [],
      percentageAllowed: 0
    };

    const genericsMap = new Map<string, number>();
    const manufacturersMap = new Map<string, number>();
    let allowedMeds = 0;
    const allowedGenericsSet = new Set<string>();

    drugs.forEach(d => {
      // Counts
      genericsMap.set(d.g, (genericsMap.get(d.g) || 0) + 1);
      manufacturersMap.set(d.m, (manufacturersMap.get(d.m) || 0) + 1);

      // Check allowance
      const evalRes = evaluateGenericAllowance(d.g);
      if (evalRes.status === "allowed") {
        allowedMeds++;
        allowedGenericsSet.add(d.g);
      }
    });

    const uniqueGenericsList = Array.from(genericsMap.entries()).sort((a, b) => b[1] - a[1]);
    const uniqueManufacturersList = Array.from(manufacturersMap.entries()).sort((a, b) => b[1] - a[1]);
    const allowedGenericsList = Array.from(allowedGenericsSet).sort();

    return {
      totalMedicines: drugs.length,
      uniqueGenerics: uniqueGenericsList,
      uniqueManufacturers: uniqueManufacturersList,
      allowedMedicinesCount: allowedMeds,
      allowedGenerics: allowedGenericsList,
      percentageAllowed: parseFloat(((allowedMeds / drugs.length) * 100).toFixed(1))
    };
  }, [drugs]);

  // Filter lists inside tiles if user searches inside the details viewer
  const filteredTileList = useMemo(() => {
    if (!activeTile) return [];
    const q = tileSearchTerm.trim().toLowerCase();

    if (activeTile === "generics") {
      return stats.uniqueGenerics.filter(([name]) => name.toLowerCase().includes(q));
    }
    if (activeTile === "manufacturers") {
      return stats.uniqueManufacturers.filter(([name]) => name.toLowerCase().includes(q));
    }
    if (activeTile === "allowed_generics") {
      return stats.allowedGenerics.filter(name => name.toLowerCase().includes(q));
    }
    return [];
  }, [activeTile, tileSearchTerm, stats]);

  // Clean-up and focus helpers
  const clearSearch = () => {
    setSearchQuery("");
    setSelectedDrug(null);
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Determine if the search bar should move to the top
  const isSearchActive = isFocused || searchQuery.trim().length > 0 || selectedDrug !== null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafdfb] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-20"></div>
            <Pill size={36} className="text-emerald-600 animate-spin" />
          </div>
          <p className="text-slate-600 font-medium text-sm">Synchronizing clinical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/50 p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 shadow-xl shadow-rose-100/10 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Sync Error</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold transition-colors shadow-sm"
          >
            Retry Synchronization
          </button>
        </div>
      </div>
    );
  }

  // Selected drug evaluation
  const drugAllowance = selectedDrug ? evaluateGenericAllowance(selectedDrug.g) : null;

  return (
    <div className="min-h-screen bg-[#fafdfb] text-slate-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-6 flex flex-col min-h-screen">

        {/* Animated Container: holds Title and Search bar */}
        <div className={`transition-all duration-500 ease-in-out ${isSearchActive ? "pt-2 pb-6" : "pt-24 pb-8 flex flex-col justify-center items-center flex-1"}`}>

          {/* Logo / Header block */}
          <div className={`text-center transition-all duration-500 mb-8 ${isSearchActive ? "scale-90 opacity-0 h-0 overflow-hidden pointer-events-none mb-0" : "scale-100 opacity-100"}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-[2rem] border border-emerald-100/50 shadow-md shadow-emerald-50/20 mb-4">
              <Pill size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Medical Assistant
            </h1>
            <p className="text-emerald-600 font-bold tracking-wider text-[11px] uppercase mt-1.5 flex items-center justify-center gap-1.5 bg-emerald-50/70 py-1 px-3 rounded-full w-fit mx-auto border border-emerald-100/20">
              <ShieldCheck size={13} /> Medicine Allowance Checker
            </p>
            <p className="text-slate-400 text-xs mt-3 max-w-xs mx-auto leading-relaxed">
              Verify legal prescription permissions under the MATS (DMF) Practitioner formulary.
            </p>
          </div>

          {/* Minimalist Search Bar */}
          <div className="w-full relative group">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white border border-slate-200/80 rounded-2xl md:rounded-[1.5rem] px-5 py-4 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all shadow-sm">
              <Search size={20} className="text-slate-400 shrink-0 mr-3.5 group-focus-within:text-emerald-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedDrug) setSelectedDrug(null);
                }}
                onFocus={handleFocus}
                placeholder="Search Brand or Generic name..."
                className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-medium text-slate-800 placeholder:text-slate-400/85"
              />
              {isSearchActive && (
                <button
                  onClick={clearSearch}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Suggestions Overlay */}
            {isFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[380px] overflow-y-auto">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Matches</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">{suggestions.length}</span>
                </div>
                {suggestions.map((drug, i) => (
                  <button
                    key={`${drug.b}-${drug.p}-${drug.g}-${i}`}
                    onMouseDown={() => handleSelectDrug(drug)}
                    className="w-full text-left px-5 py-3.5 hover:bg-emerald-50/40 flex flex-col border-b border-slate-50 last:border-none transition-colors group"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {drug.b} <span className="text-slate-500 font-medium text-xs">{drug.p}</span>
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono shrink-0">
                        {drug.m.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-medium italic">{drug.g}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Drug Information & Allowance Checker */}
        {selectedDrug && drugAllowance && (
          <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Medicine details block */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{selectedDrug.b}</h2>
                  <p className="text-slate-500 font-semibold text-sm mt-1">{selectedDrug.p}</p>
                </div>
                <div className="w-11 h-11 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                  <Pill size={20} />
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="flex gap-3">
                  <Beaker size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Generic Combination</span>
                    <p className="font-semibold text-slate-800 text-[14px] leading-relaxed mt-0.5">{selectedDrug.g}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Building2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Pharmaceutical Manufacturer</span>
                    <p className="font-medium text-slate-600 text-sm mt-0.5">{selectedDrug.m}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allowance Checker Remarks Highlight Block */}
            <div className={`rounded-3xl p-6 border transition-all ${
              drugAllowance.status === "allowed"
                ? "bg-emerald-50/60 border-emerald-100 text-emerald-900"
                : drugAllowance.status === "partially"
                ? "bg-amber-50/70 border-amber-100 text-amber-900"
                : "bg-rose-50/60 border-rose-100 text-rose-900"
            }`}>
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  {drugAllowance.status === "allowed" && <CheckCircle2 size={24} className="text-emerald-600" />}
                  {drugAllowance.status === "partially" && <AlertTriangle size={24} className="text-amber-600" />}
                  {drugAllowance.status === "not_allowed" && <XCircle size={24} className="text-rose-600" />}
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="text-base font-bold tracking-tight">
                    {drugAllowance.status === "allowed" && "✅ Prescribable Medicine"}
                    {drugAllowance.status === "partially" && "⚠️ Partially Approved Formulation"}
                    {drugAllowance.status === "not_allowed" && "❌ Prohibited Formulation"}
                  </h3>

                  <p className="text-xs leading-relaxed opacity-90">
                    {drugAllowance.status === "allowed" && "This formulation is fully permitted. The MATS (DMF) Practitioner can legally prescribe and dispense this generic medicine under standard allowance regulations."}
                    {drugAllowance.status === "partially" && "This combination contains both approved and non-approved compounds. Please see the clinical breakdown below."}
                    {drugAllowance.status === "not_allowed" && "This chemical compound lies outside the MATS (DMF) limited scope of practice. Strictly prohibited from standard allowance list."}
                  </p>

                  {/* Components breakdown */}
                  <div className="pt-3 space-y-2.5">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-75">Breakdown Analysis</span>
                    <div className="space-y-1.5">
                      {drugAllowance.components.map((comp, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between text-xs p-2.5 rounded-xl border ${
                            comp.allowed
                              ? "bg-white/90 border-emerald-200/50 text-emerald-950"
                              : "bg-white/90 border-rose-200/50 text-rose-950"
                          }`}
                        >
                          <span className="font-semibold line-clamp-1 flex-1">{comp.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-3">
                            {comp.allowed ? (
                              <>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                                  Rule #{comp.rule?.id} Mapped
                                </span>
                                <CheckCircle2 size={14} className="text-emerald-600" />
                              </>
                            ) : (
                              <>
                                <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                                  No Rule Match
                                </span>
                                <XCircle size={14} className="text-rose-600" />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternatives block */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Alternative Brands (Same Generic)
              </h3>
              {alternatives.length === 0 ? (
                <div className="bg-white border border-slate-100 p-6 rounded-3xl text-center text-slate-400 text-xs">
                  No generic alternatives found in the current database.
                </div>
              ) : (
                <div className="grid gap-3.5">
                  {alternatives.slice(0, 5).map((alt, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-100/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">{alt.b}</span>
                          {alt.p === selectedDrug.p && (
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-emerald-100/50">
                              <Star size={8} fill="currentColor" /> BEST MATCH
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 font-semibold text-xs">{alt.p}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Building2 size={10} /> {alt.m}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 text-slate-400 transition-colors">
                        <Pill size={16} />
                      </div>
                    </div>
                  ))}
                  {alternatives.length > 5 && (
                    <p className="text-center text-[11px] text-slate-400 font-semibold pt-1">
                      And {alternatives.length - 5} more alternatives in database.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Combined formulations if any */}
            {combinedFormulations.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  Related Multi-Ingredient Formulations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {combinedFormulations.slice(0, 10).map((gen, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const matched = drugs.find(d => d.g.toLowerCase() === gen.toLowerCase());
                        if (matched) {
                          handleSelectDrug(matched);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-slate-600 hover:text-emerald-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Home Screen Stats Expand Button & Section */}
        {!isSearchActive && (
          <div className="w-full mt-auto pt-8 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setShowStats(!showStats);
                setActiveTile(null);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-500/30 rounded-2xl text-slate-500 hover:text-emerald-700 transition-all text-[11px] font-bold uppercase tracking-widest shadow-sm"
            >
              <BarChart2 size={14} className="text-emerald-600" />
              {showStats ? "Collapse Clinical Stats" : "Expand Database Statistics"}
              {showStats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showStats && (
              <div className="mt-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 text-left">

                {/* Grid of clinical stats */}
                <div className="grid grid-cols-2 gap-4">

                  {/* Total drugs */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Medicines in DB</p>
                    <p className="text-2xl font-extrabold text-slate-900">{stats.totalMedicines.toLocaleString()}</p>
                    <div className="absolute right-3 bottom-3 text-slate-100">
                      <Pill size={24} />
                    </div>
                  </div>

                  {/* Total unique generics */}
                  <button
                    onClick={() => {
                      setActiveTile(activeTile === "generics" ? null : "generics");
                      setTileSearchTerm("");
                    }}
                    className={`p-5 rounded-3xl border text-left shadow-sm relative overflow-hidden transition-all ${
                      activeTile === "generics" ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/10" : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Unique Generics</p>
                    <p className="text-2xl font-extrabold text-slate-900">{stats.uniqueGenerics.length.toLocaleString()}</p>
                    <div className="absolute right-3 bottom-3 text-emerald-100/70">
                      <Beaker size={24} />
                    </div>
                  </button>

                  {/* Total unique manufacturers */}
                  <button
                    onClick={() => {
                      setActiveTile(activeTile === "manufacturers" ? null : "manufacturers");
                      setTileSearchTerm("");
                    }}
                    className={`p-5 rounded-3xl border text-left shadow-sm relative overflow-hidden transition-all ${
                      activeTile === "manufacturers" ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/10" : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Manufacturers</p>
                    <p className="text-2xl font-extrabold text-slate-900">{stats.uniqueManufacturers.length.toLocaleString()}</p>
                    <div className="absolute right-3 bottom-3 text-emerald-100/70">
                      <Building2 size={24} />
                    </div>
                  </button>

                  {/* Total medicines allowed */}
                  <button
                    onClick={() => {
                      setActiveTile(activeTile === "allowed_rules" ? null : "allowed_rules");
                      setTileSearchTerm("");
                    }}
                    className={`p-5 rounded-3xl border text-left shadow-sm relative overflow-hidden transition-all ${
                      activeTile === "allowed_rules" ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/10" : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Allowed Medicines</p>
                    <p className="text-2xl font-extrabold text-emerald-700">
                      {stats.allowedMedicinesCount.toLocaleString()}
                    </p>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold">
                      {stats.percentageAllowed}%
                    </span>
                    <div className="absolute right-3 bottom-3 text-emerald-200/50">
                      <ShieldCheck size={24} />
                    </div>
                  </button>

                  {/* Total generics allowed */}
                  <button
                    onClick={() => {
                      setActiveTile(activeTile === "allowed_generics" ? null : "allowed_generics");
                      setTileSearchTerm("");
                    }}
                    className={`col-span-2 p-5 rounded-3xl border text-left shadow-sm relative overflow-hidden transition-all ${
                      activeTile === "allowed_generics" ? "bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/10" : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Unique Allowed Generics</p>
                    <p className="text-2xl font-extrabold text-emerald-700">{stats.allowedGenerics.length.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Unique single/combined formulation segments allowed.</p>
                    <div className="absolute right-4 bottom-4 text-emerald-200/50">
                      <Award size={28} />
                    </div>
                  </button>

                </div>

                {/* Sub-lists under clinical tiles */}
                {activeTile && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-inner mt-4 animate-in fade-in slide-in-from-top-3 duration-300 space-y-4">

                    {/* Header inside display list */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                          {activeTile === "generics" && "Clinical Generics Registry"}
                          {activeTile === "manufacturers" && "Pharmaceutical Corporations"}
                          {activeTile === "allowed_rules" && "73 Allowance Regulations"}
                          {activeTile === "allowed_generics" && "Approved DMF Generics in DB"}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {activeTile === "generics" && `Registry of all ${stats.uniqueGenerics.length} unique generic formulations.`}
                          {activeTile === "manufacturers" && `List of all ${stats.uniqueManufacturers.length} pharmaceutical companies.`}
                          {activeTile === "allowed_rules" && "Side-by-side view of DMF rules & database matches."}
                          {activeTile === "allowed_generics" && `Total of ${stats.allowedGenerics.length} fully allowed generics.`}
                        </p>
                      </div>
                    </div>

                    {/* Quick filter box (for long lists) */}
                    {activeTile !== "allowed_rules" && (
                      <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={tileSearchTerm}
                          onChange={(e) => setTileSearchTerm(e.target.value)}
                          placeholder="Quick search list..."
                          className="w-full text-xs bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    )}

                    {/* Scrollable list viewer */}
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 text-xs">

                      {/* Generics list */}
                      {activeTile === "generics" && filteredTileList.map(([name, count], idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                          <span className="font-semibold text-slate-700 line-clamp-1">{name as string}</span>
                          <span className="bg-white border border-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-400 text-[10px] shrink-0">
                            {count as number} meds
                          </span>
                        </div>
                      ))}

                      {/* Manufacturers list */}
                      {activeTile === "manufacturers" && filteredTileList.map(([name, count], idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                          <span className="font-semibold text-slate-700 line-clamp-1">{name as string}</span>
                          <span className="bg-white border border-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-400 text-[10px] shrink-0">
                            {count as number} brands
                          </span>
                        </div>
                      ))}

                      {/* Unique Allowed Generics list */}
                      {activeTile === "allowed_generics" && filteredTileList.map((name, idx) => {
                        const checkRes = evaluateGenericAllowance(name as string);
                        return (
                          <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-emerald-50/20 rounded-xl transition-colors">
                            <span className="font-semibold text-slate-700 line-clamp-1">{name as string}</span>
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                              Approved
                            </span>
                          </div>
                        );
                      })}

                      {/* Allowed Rules Detailed Table */}
                      {activeTile === "allowed_rules" && (
                        <div className="space-y-3.5">
                          {ALLOWED_RULES.map((rule) => {
                            // Find some generic strings in the database that match this rule
                            const matchedGenerics = stats.allowedGenerics.filter(g => rule.pattern.test(g)).slice(0, 3);
                            return (
                              <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                                    #{rule.id}
                                  </span>
                                  <span className="font-bold text-slate-900 text-xs">{rule.original}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 italic font-medium leading-relaxed">
                                  {rule.description}
                                </p>
                                <div className="pt-1">
                                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Database Matches</span>
                                  {matchedGenerics.length === 0 ? (
                                    <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                                      {rule.original === "Ranitidine"
                                        ? "⚠️ Ranitidine suspended (Famotidine allowed instead)"
                                        : "No matching generic found in this DB."}
                                    </p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {matchedGenerics.map((g, idx) => (
                                        <span key={idx} className="bg-white border border-slate-200/50 text-[10px] text-slate-600 px-1.5 py-0.5 rounded">
                                          {g}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {filteredTileList.length === 0 && activeTile !== "allowed_rules" && (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No matching items found for "{tileSearchTerm}".
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Medic;
