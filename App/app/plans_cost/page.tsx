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
    // Logika: Šaljemo tip projekta (q) i kvadraturu (size) u URL
    const query = projectType === "house" ? "Gradnja kuće" : projectType === "apartment" ? "Adaptacija stana" : "Renovacija";
    router.push(`/find_service?q=${encodeURIComponent(query)}&size=${sqm}`);
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          Project Cost <span className="text-yellow-500">Estimator</span>
        </h1>
        <p className="text-slate-600">
          Get an instant rough estimate for your construction project. Based on current market prices in Croatia.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Select Project Type
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "house", label: "New House", icon: <Home /> },
                { id: "apartment", label: "Apartment", icon: <Building2 /> },
                { id: "reno", label: "Renovation", icon: <Hammer /> },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    projectType === type.id 
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  {type.icon}
                  <span className="font-bold text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Square Footage (m²)
            </h3>
            <div className="bg-white p-8 rounded-2xl border border-slate-100">
              <div className="flex justify-between mb-4">
                <span className="text-3xl font-black text-slate-900">{sqm} m²</span>
                <Ruler className="text-slate-300" />
              </div>
              <input
                type="range"
                min="20"
                max="500"
                value={sqm}
                onChange={(e) => setSqm(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-bold uppercase">
                <span>20 m²</span>
                <span>500 m²</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Build Quality
            </h3>
            <div className="flex gap-4">
              {["budget", "standard", "luxury"].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${
                    quality === q 
                      ? "bg-slate-900 text-white" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-3xl sticky top-28 shadow-2xl overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10" />
            
            <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-sm mb-6">Estimated Total</h3>
            <div className="text-5xl font-black mb-2">
              €{totalEstimate.toLocaleString()}
            </div>
            <p className="text-slate-400 text-sm mb-8 flex items-start gap-2 leading-relaxed">
              <Info size={16} className="shrink-0 mt-1 text-yellow-400" />
              This is a rough estimate. Final prices depend on your chosen contractor and materials.
            </p>

            {/* GUMB KOJI VODI NA FIND_SERVICE */}
            <button 
              onClick={handleGetQuotes}
              className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              GET ACCURATE QUOTES
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs text-slate-500 mt-6 font-medium italic">
              *Your project data will be pre-filled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}