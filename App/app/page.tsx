"use client";

import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Video, Calculator, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("searchQuery");
    
    if (query) {
      router.push(`/find_service?q=${encodeURIComponent(query.toString())}`);
    } else {
      router.push(`/find_service`);
    }
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white pt-24 md:pt-32 pb-16 md:pb-24 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.1] animate-in fade-in slide-in-from-top-4 duration-700 italic uppercase tracking-tighter">
            Build with <span className="text-yellow-400">Confidence.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Connect with verified construction companies in Croatia. 
            Real-time tracking and zero scams.
          </p>

          <div className="max-w-2xl mx-auto">
            <form className="space-y-3 md:space-y-4" onSubmit={handleSearch}>
              <div className="relative flex items-center group">
                <Search className="absolute left-5 md:left-6 text-slate-400 group-focus-within:text-yellow-400 transition-colors" size={20} />
                <input 
                  name="searchQuery"
                  type="text" 
                  placeholder="What are you building?" 
                  className="w-full pl-14 md:pl-16 pr-6 py-4 md:py-6 bg-white border-none rounded-2xl outline-none text-slate-900 font-bold text-base md:text-lg shadow-2xl focus:ring-4 focus:ring-yellow-400/20 transition-all placeholder:text-slate-300"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-yellow-400 text-black py-4 md:py-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-[0.2em] hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-xl shadow-yellow-400/10 flex items-center justify-center gap-3"
              >
                Search Companies <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS - Sada se bolje slažu na mobitelu */}
      <section className="py-10 bg-yellow-400 text-black border-y border-yellow-500/20">
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col">
            <span className="text-4xl font-black italic leading-none tracking-tighter">250+</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2">Verified Companies</span>
          </div>
          <div className="flex flex-col border-y sm:border-y-0 sm:border-x border-black/10 py-6 sm:py-0">
            <span className="text-4xl font-black italic leading-none tracking-tighter">1.2k</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2">Active Projects</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black italic leading-none tracking-tighter">0%</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-2">Fraud Rate</span>
          </div>
        </div>
      </section>

      {/* CORE VALUES - Grid: 1 col mobitel, 3 cols desktop */}
      <section className="py-20 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="p-8 md:p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:border-yellow-400 transition-all group">
            <div className="w-14 h-14 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-black mb-3 text-slate-900 uppercase tracking-tight italic">Fraud Protection</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Every company is manually verified with official court records (OIB) before joining. No more scams.
            </p>
          </div>

          <div className="p-8 md:p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:border-yellow-400 transition-all group">
            <div className="w-14 h-14 bg-slate-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-yellow-400 transition-colors">
              <Video size={28} />
            </div>
            <h3 className="text-xl font-black mb-3 text-slate-900 uppercase tracking-tight italic">Live Tracking</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Track progress from abroad. Daily photo updates and milestone reports directly to your phone.
            </p>
          </div>

          <div className="p-8 md:p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:border-yellow-400 transition-all group md:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 bg-slate-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-green-400 transition-colors">
              <Calculator size={28} />
            </div>
            <h3 className="text-xl font-black mb-3 text-slate-900 uppercase tracking-tight italic">Price Certainty</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Get instant cost estimates based on real market data. Compare offers without hidden fees.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}