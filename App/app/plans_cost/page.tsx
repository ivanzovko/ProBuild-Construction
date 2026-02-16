"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Home, Building2, Hammer, Ruler, ArrowRight, Info, CheckCircle2, Sparkles, Loader2, Send, X, LockKeyhole, ChevronDown, ChevronUp, HelpCircle, ShieldCheck } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { getSiteSettings } from "@/lib/cms";
import CreateJobDetails from "./components/CreateJobDetails";

export default function EstimatesPage() {
  const router = useRouter();
  
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [sqm, setSqm] = useState(100);
  const [projectType, setProjectType] = useState("house");
  const [quality, setQuality] = useState("standard");
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [cmsPrices, setCmsPrices] = useState<any>(null);
  const [cmsMultipliers, setCmsMultipliers] = useState<any>(null);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [jobDetails, setJobDetails] = useState({ title: "", location: "", description: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthNote, setShowAuthNote] = useState(false);

  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSiteSettings();
      if (settings) {
        if (settings.prices) setCmsPrices(settings.prices);
        if (settings.multipliers) setCmsMultipliers(settings.multipliers);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const prices = {
      house: cmsPrices?.house || 1650,
      apartment: cmsPrices?.apartment || 950,
      renovation: cmsPrices?.renovation || 600
    };

    const multipliers = {
      budget: cmsMultipliers?.budget || 0.85,
      standard: cmsMultipliers?.standard || 1,
      luxury: cmsMultipliers?.luxury || 1.7
    };

    const basePrice = prices[projectType as keyof typeof prices];
    const qualityMultiplier = multipliers[quality as keyof typeof multipliers];
    
    setTotalEstimate(sqm * basePrice * qualityMultiplier);
  }, [sqm, projectType, quality, cmsPrices, cmsMultipliers]);

  const toggleStep = (step: number) => {
    if (window.innerWidth < 1024) {
      setExpandedStep(expandedStep === step ? null : step);
    }
  };

  const handleInitialClick = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setShowAuthNote(true);
        const params = new URLSearchParams({ returnTo: "/estimates", type: projectType, sqm: sqm.toString(), qlt: quality });
        setTimeout(() => router.push(`/login?${params.toString()}`), 3000);
        return;
      }
      setShowDetailsModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = (details: any) => {
    setJobDetails(details);
    setShowDetailsModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const priceBreakdown = [
    { label: "Materials", percent: 52, color: "bg-yellow-500" },
    { label: "Labor Force", percent: 38, color: "bg-slate-700" },
    { label: "Permits & Other", percent: 10, color: "bg-slate-300" },
  ];

  const faqs = [
    { q: "How accurate is this estimate?", a: "This estimate uses real-time 2026 market data for Croatia. Final prices depend on specific location, terrain, and chosen finishing materials." },
    { q: "Is VAT included in the price?", a: "Yes, all estimated prices include the standard 25% VAT (PDV) and average material costs on the Croatian market." },
    { q: "How do I get official quotes?", a: "After calculating, click 'Get Offers'. Your project will be visible to verified contractors who will send you specific quotes." },
    { 
      q: "What is the difference between quality levels?", 
      a: "BUDGET focuses on essential functionality and cost-effective materials. STANDARD offers a balanced mix of durability and modern aesthetics with mid-range finishes. LUXURY includes premium materials, advanced technology, and high-end craftsmanship for a superior finish." 
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa] py-4 pb-32 md:pb-12 relative font-sans text-slate-900">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      {showAuthNote && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center max-w-[280px] border-b-4 border-yellow-500">
            <div className="bg-yellow-50 text-yellow-600 p-4 rounded-2xl mb-4"><LockKeyhole size={32} /></div>
            <p className="font-black text-[10px] uppercase tracking-widest mb-1">Sign In Required</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Redirecting to login...</p>
            <Loader2 className="w-4 h-4 animate-spin mt-4 text-yellow-600" />
          </div>
        </div>
      )}

      {showDetailsModal && (
        <CreateJobDetails 
          onClose={() => setShowDetailsModal(false)} 
          onSubmit={handleDetailsSubmit}
          projectData={{
            project_type: projectType,
            sqm: sqm,
            quality: quality,
            estimated_price: totalEstimate
          }}
        />
      )}

      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm animate-in slide-in-from-top">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-yellow-500/50 flex items-center gap-3">
            <div className="bg-yellow-500 text-slate-900 p-2 rounded-lg"><CheckCircle2 size={18} /></div>
            <div className="flex-1 text-left"><p className="font-black text-[10px] uppercase tracking-widest">Inquiry Sent!</p></div>
            <button onClick={() => setShowSuccess(false)} className="text-slate-500"><X size={16} /></button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] w-8 bg-yellow-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Croatia 2026</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">
            Project <span className="text-yellow-600">Cost</span> Estimator
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest leading-relaxed max-w-sm">Current rates for materials and labor.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6 order-last lg:order-none">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700"><HelpCircle size={22} /></div>
              <div>
                <h4 className="text-[14px] font-black uppercase tracking-widest text-slate-900">FAQ</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Quick help</p>
              </div>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-4 flex items-center justify-between text-left">
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 pr-4">{faq.q}</span>
                    <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-[11px] text-slate-500 leading-relaxed font-medium uppercase border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleStep(1)} 
                className="w-full flex items-center justify-between p-5 lg:cursor-default"
              >
                <h3 className="text-[12px] font-black flex items-center gap-4 uppercase tracking-widest text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-[11px]">01</span>
                  Project Type
                </h3>
                <div className="text-slate-400 lg:hidden">
                  {expandedStep === 1 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              <div className={`p-5 pt-0 lg:!block ${expandedStep === 1 ? "block" : "hidden"}`}>
                <div className="grid grid-cols-3 gap-3">
                  {[{ id: "house", label: "House", icon: <Home size={22} /> }, { id: "apartment", label: "Apartment", icon: <Building2 size={22} /> }, { id: "renovation", label: "Renov.", icon: <Hammer size={22} /> }].map((type) => (
                    <button key={type.id} onClick={() => {setProjectType(type.id); setExpandedStep(2);}}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${projectType === type.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 bg-white text-slate-400"}`}>
                      <div className={`mb-2 ${projectType === type.id ? "text-yellow-400" : "text-slate-200"}`}>{type.icon}</div>
                      <span className="block font-black text-[9px] uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleStep(2)} 
                className="w-full flex items-center justify-between p-5 lg:cursor-default"
              >
                <h3 className="text-[12px] font-black flex items-center gap-4 uppercase tracking-widest text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-[11px]">02</span>
                  Area Size
                </h3>
                <div className="text-slate-400 lg:hidden">
                  {expandedStep === 2 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              <div className={`p-5 pt-0 lg:!block ${expandedStep === 2 ? "block" : "hidden"}`}>
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-baseline gap-2"><span className="text-5xl font-black tracking-tighter">{sqm}</span><span className="text-[12px] font-black text-slate-400 uppercase">m²</span></div>
                  <Ruler className="text-slate-100" size={30} />
                </div>
                <input type="range" min="20" max="500" step="5" value={sqm} onChange={(e) => setSqm(parseInt(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-yellow-600 mb-4" />
                <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest"><span>20m²</span><span>500m²</span></div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleStep(3)} 
                className="w-full flex items-center justify-between p-5 lg:cursor-default"
              >
                <h3 className="text-[12px] font-black flex items-center gap-4 uppercase tracking-widest text-slate-900">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-[11px]">03</span>
                  Build Quality
                </h3>
                <div className="text-slate-400 lg:hidden">
                  {expandedStep === 3 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              <div className={`p-5 pt-0 lg:!block ${expandedStep === 3 ? "block" : "hidden"}`}>
                <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                  {["budget", "standard", "luxury"].map((q) => (
                    <button key={q} onClick={() => setQuality(q)} className={`flex-1 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${quality === q ? "bg-slate-900 text-white shadow-md" : "text-slate-500"}`}>{q}</button>
                  ))}
                </div>
              </div>
            </section>

            <div className="lg:hidden p-6 bg-slate-900 rounded-3xl text-white shadow-xl border-2 border-white/5">
                <div className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-4 flex items-center gap-2">
                   <span className="w-1 h-3 bg-yellow-500 rounded-full" />
                   Allocation Breakdown
                </div>
                <div className="space-y-4">
                  {priceBreakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[9px] font-black uppercase mb-1.5 tracking-tight">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-white">{item.percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-10">
            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border-2 border-white/5 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-yellow-400" />
                    <span className="text-yellow-400 font-black uppercase tracking-[0.3em] text-[8px]">Live Estimate</span>
                  </div>
                  <ShieldCheck size={18} className="text-white/20" />
                </div>
                
                <div className="mb-8">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-[0.2em]">Total Investment</div>
                  <div className="text-4xl font-black tracking-tighter flex items-start gap-1">
                    {totalEstimate.toLocaleString()}
                    <span className="text-xl mt-1 text-yellow-500 font-bold">€</span>
                  </div>
                </div>

                <div className="mb-8 space-y-5 border-t border-white/10 pt-6">
                  <div className="text-[10px] font-black uppercase text-white tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-yellow-500 rounded-full" />
                    Allocation
                  </div>
                  <div className="space-y-4">
                    {priceBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between items-end text-[9px] font-black uppercase mb-1.5 tracking-tight">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-white text-[10px]">{item.percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl mb-8 flex items-start gap-3 border border-white/5">
                  <Info size={16} className="shrink-0 text-yellow-500" />
                  <p className="text-slate-400 text-[9px] leading-snug font-bold uppercase tracking-wide">
                    Includes materials, labor force, and local VAT.
                  </p>
                </div>

                <button disabled={isLoading} onClick={handleInitialClick}
                  className="w-full bg-yellow-500 text-slate-900 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-yellow-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Get Offers <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 pb-6 z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Estimated Total</span>
            <div className="text-2xl font-black tracking-tighter text-slate-900 italic">
              € {totalEstimate.toLocaleString()}
            </div>
          </div>
          <button onClick={handleInitialClick} disabled={isLoading}
            className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 shadow-lg">
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Get Offers <ArrowRight size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}