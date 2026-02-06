"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Home, Building2, Hammer, Ruler, ArrowRight, Info, CheckCircle2, Sparkles, Loader2, Send, X, LayoutDashboard, LockKeyhole } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
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
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [jobDetails, setJobDetails] = useState({ title: "", location: "", description: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthNote, setShowAuthNote] = useState(false);

  useEffect(() => {
    const basePrice = projectType === "house" ? 1350 : projectType === "apartment" ? 750 : 450;
    const qualityMultiplier = quality === "luxury" ? 1.6 : quality === "budget" ? 0.85 : 1;
    setTotalEstimate(sqm * basePrice * qualityMultiplier);
  }, [sqm, projectType, quality]);

  const handleInitialClick = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setShowAuthNote(true);
        const params = new URLSearchParams({
          returnTo: "/estimates",
          type: projectType,
          sqm: sqm.toString(),
          qlt: quality
        });
        setTimeout(() => {
          router.push(`/login?${params.toString()}`);
        }, 3000);
        return;
      }

      setShowDetailsModal(true);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = (details: any) => {
    setJobDetails(details);
    setShowDetailsModal(false);
    setShowConfirm(true);
  };

  const submitJob = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('jobs')
        .insert([
          { 
            client_id: session.user.id,
            title: jobDetails.title,
            location: jobDetails.location,
            description: jobDetails.description,
            project_type: projectType,
            sqm: sqm,
            quality: quality,
            estimated_price: totalEstimate,
            status: 'pending'
          }
        ]);

      if (error) throw error;
      
      setShowConfirm(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 8000);
      
    } catch (error: any) {
      console.error("Error:", error.message);
      alert("Error sending inquiry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f4f4f5] py-4 pb-24 md:pb-4 relative font-sans">
      
      {showAuthNote && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center max-w-[280px] border-b-4 border-yellow-500 animate-in zoom-in-95">
            <div className="bg-yellow-50 text-yellow-600 p-4 rounded-3xl mb-4">
              <LockKeyhole className="w-8 h-8" />
            </div>
            <p className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900 mb-1">Prijavite se</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
              Morate biti prijavljeni kako biste poslali upit. Preusmjeravamo vas...
            </p>
            <Loader2 className="w-4 h-4 animate-spin mt-4 text-yellow-600" />
          </div>
        </div>
      )}

      {showDetailsModal && (
        <CreateJobDetails 
          onClose={() => setShowDetailsModal(false)} 
          onSubmit={handleDetailsSubmit} 
        />
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isLoading && setShowConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-slate-900">
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-50 text-yellow-600 p-4 rounded-3xl mb-4">
                <Send className="w-8 h-8" />
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Review Inquiry</p>
              <h3 className="text-lg font-black uppercase italic text-slate-900 tracking-tighter leading-tight mb-4">
                {jobDetails.title}
              </h3>
              
              <div className="w-full bg-slate-50 rounded-2xl p-4 space-y-2 mb-6 text-left border border-slate-100">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Estimate:</span>
                  <span className="text-slate-900">{totalEstimate.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-900">{jobDetails.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  disabled={isLoading}
                  onClick={() => setShowConfirm(false)} 
                  className="py-4 rounded-2xl border-2 border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Back
                </button>
                <button 
                  disabled={isLoading}
                  onClick={submitJob} 
                  className="py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-md animate-in slide-in-from-top duration-500">
          <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl border-2 border-yellow-500/50 flex items-center gap-4 backdrop-blur-xl hover:scale-[1.02] transition-transform">
            <div className="bg-yellow-500 text-slate-900 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-[11px] uppercase tracking-[0.15em] text-white leading-none mb-1">Inquiry Sent!</p>
              <p className="text-[9px] text-yellow-500 font-black uppercase tracking-widest">Check dashboard for offers</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/project_tracking')} className="bg-white/10 p-2 rounded-xl transition-all hover:bg-white/20 hover:scale-110 text-white">
                <LayoutDashboard size={18} />
              </button>
              <button onClick={() => setShowSuccess(false)} className="p-2 text-slate-500 hover:text-white transition-all hover:scale-110">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <header className="relative mb-2">
              <div className="hidden md:flex items-center gap-2 mb-1">
                <div className="h-[2px] w-8 bg-yellow-600 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">2026 Market Rates</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 uppercase tracking-tight leading-none">
                Project Cost <span className="text-yellow-600">Estimator</span>
              </h1>
              <p className="hidden md:block text-slate-600 font-medium uppercase text-[9px] tracking-[0.15em]">
                Accurate market estimates for construction in Croatia.
              </p>

              <div className="md:hidden mt-4 bg-slate-900 rounded-2xl p-4 shadow-lg border-b-4 border-yellow-500 hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-yellow-500 font-black uppercase tracking-widest block mb-1">Calculated Cost</span>
                    <div className="text-2xl font-black text-white tracking-tighter flex items-center gap-1">
                      <span className="text-sm text-yellow-500"> €</span>
                      {totalEstimate.toLocaleString()}
                    </div>
                  </div>
                  <button 
                    disabled={isLoading}
                    onClick={handleInitialClick}
                    className="bg-yellow-500 text-slate-900 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 active:scale-90 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Get Quotes <ArrowRight size={14} /></>}
                  </button>
                </div>
              </div>
            </header>

            <section>
              <h3 className="text-[11px] font-black mb-3 flex items-center gap-3 uppercase tracking-widest text-slate-900">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[9px]">01</span>
                Project Type
              </h3>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[
                  { id: "house", label: "House", icon: <Home size={18} /> },
                  { id: "apartment", label: "Apartment", icon: <Building2 size={18} /> },
                  { id: "renovation", label: "Renovation", icon: <Hammer size={18} /> },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setProjectType(type.id)}
                    className={`relative p-3 md:p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.05] active:scale-[0.95] ${
                      projectType === type.id 
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg" 
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    <div className={`mb-1 md:mb-2 ${projectType === type.id ? "text-yellow-400" : "text-slate-400"}`}>
                      {type.icon}
                    </div>
                    <span className="block font-black text-[8px] md:text-[10px] uppercase tracking-widest truncate">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-black mb-3 flex items-center gap-3 uppercase tracking-widest text-slate-900">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[9px]">02</span>
                Area Size
              </h3>
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm hover:scale-[1.01] transition-transform">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{sqm}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">m²</span>
                  </div>
                  <Ruler className="text-slate-300" size={20} />
                </div>
                <input
                  type="range" min="20" max="500" value={sqm}
                  onChange={(e) => setSqm(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                />
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-black mb-3 flex items-center gap-3 uppercase tracking-widest text-slate-900">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white text-[9px]">03</span>
                Build Quality
              </h3>
              <div className="flex p-1 bg-slate-200 rounded-lg gap-1">
                {["budget", "standard", "luxury"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`flex-1 py-2.5 rounded-md font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      quality === q ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-300/50"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-4">
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border-4 border-yellow-500/20 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <Sparkles size={12} className="text-yellow-400" />
                  <span className="text-yellow-400 font-black uppercase tracking-[0.3em] text-[9px]">Total Estimate</span>
                </div>
                <div className="mb-8">
                  <div className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">Calculated Cost</div>
                  <div className="text-4xl font-black tracking-tighter flex items-start gap-1">
                 
                    {totalEstimate.toLocaleString()}
                       <span className="text-xl mt-1 text-yellow-500 font-bold">€</span>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3 p-3 bg-white/[0.05] border border-white/10 rounded-xl items-center hover:bg-white/[0.08] transition-colors">
                    <Info size={16} className="shrink-0 text-yellow-500" />
                    <p className="text-slate-300 text-[10px] leading-relaxed font-bold italic">Includes 2026 VAT and standard materials.</p>
                  </div>
                </div>
                <button 
                  disabled={isLoading}
                  onClick={handleInitialClick}
                  className="w-full bg-yellow-500 text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:scale-[1.05] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Get Quotes <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}