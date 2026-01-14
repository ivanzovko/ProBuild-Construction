"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Home, Building2, Hammer, Ruler, ArrowRight, Info } from "lucide-react";

export default function EstimatesPage() {
  const router = useRouter();
  
  const [sqm, setSqm] = useState(100);
  const [projectType, setProjectType] = useState("house");
  const [quality, setQuality] = useState("standard");
  const [totalEstimate, setTotalEstimate] = useState(0);

  useEffect(() => {
    const basePrice = projectType === "house" ? 1000 : projectType === "apartment" ? 800 : 500;
    const qualityMultiplier = quality === "luxury" ? 1.5 : quality === "budget" ? 0.8 : 1;
    setTotalEstimate(sqm * basePrice * qualityMultiplier);
  }, [sqm, projectType, quality]);

  const handleGetQuotes = () => {
    const query = projectType === "house" ? "Gradnja kuće" : projectType === "apartment" ? "Adaptacija stana" : "Renovacija";
    router.push(`/find_service?q=${encodeURIComponent(query)}&size=${sqm}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          Project Cost <span className="text-yellow-500">Estimator</span>
        </h1>
        <p className="text-sm md:text-base text-slate-600">
          Get an instant rough estimate for your construction project. Based on current market prices in Croatia.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          
          {/* STEP 1 - Responzivni Grid */}
          <section>
            <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs">1</span>
              Select Project Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {[
                { id: "house", label: "New House", icon: <Home size={20} /> },
                { id: "apartment", label: "Apartment", icon: <Building2 size={20} /> },
                { id: "reno", label: "Renovation", icon: <Hammer size={20} /> },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex sm:flex-col items-center gap-3 ${
                    projectType === type.id 
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <span className={projectType === type.id ? "text-yellow-600" : "text-slate-400"}>
                    {type.icon}
                  </span>
                  <span className="font-bold text-xs md:text-sm uppercase tracking-wider">{type.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* STEP 2 - Slider */}
          <section>
            <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs">2</span>
              Square Footage (m²)
            </h3>
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
                  {sqm} <span className="text-lg text-slate-400 font-bold uppercase">m²</span>
                </span>
                <Ruler className="text-slate-200 mb-1" size={28} />
              </div>
              <input
                type="range"
                min="20"
                max="500"
                value={sqm}
                onChange={(e) => setSqm(parseInt(e.target.value))}
                className="w-full h-2 md:h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-4 font-black uppercase tracking-widest">
                <span>Min: 20</span>
                <span>Max: 500</span>
              </div>
            </div>
          </section>

          {/* STEP 3 - Quality Buttons */}
          <section>
            <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs">3</span>
              Build Quality
            </h3>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {["budget", "standard", "luxury"].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`py-3 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                    quality === q 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ESTIMATE CARD - Desna strana na desktopu, dno na mobitelu */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[32px] sticky top-24 shadow-2xl border border-slate-800">
            <h3 className="text-yellow-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6">Estimated Total</h3>
            <div className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">
              €{totalEstimate.toLocaleString()}
            </div>
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl mb-8">
              <Info size={18} className="shrink-0 text-yellow-400" />
              <p className="text-slate-400 text-[11px] md:text-xs leading-relaxed font-medium">
                This is a rough estimate. Final prices depend on your chosen contractor and materials.
              </p>
            </div>

            <button 
              onClick={handleGetQuotes}
              className="w-full bg-yellow-400 text-black py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.15em] hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] shadow-xl shadow-yellow-400/10"
            >
              GET QUOTES
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-[9px] text-slate-500 mt-6 font-black uppercase tracking-widest">
              *Your project data will be pre-filled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}