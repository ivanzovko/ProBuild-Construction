"use client";

import Link from "next/link";
import { HardHat, Home, Search, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center bg-slate-50">
      {/* Vizualni element - Veći i upečatljiviji */}
      <div className="relative mb-10 animate-bounce duration-[2000ms]">
        <div className="bg-white p-10 md:p-12 rounded-[40px] shadow-xl border border-slate-100">
          <HardHat size={80} className="text-yellow-500 md:w-24 md:h-24" />
        </div>
        <div className="absolute -top-3 -right-3 bg-slate-900 text-yellow-400 p-3 rounded-2xl border-4 border-slate-50 shadow-lg">
          <AlertTriangle size={24} strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">
        404 <span className="text-yellow-500">Error.</span>
      </h1>
      
      <p className="text-sm md:text-base text-slate-400 max-w-sm mx-auto mb-12 leading-relaxed font-black uppercase tracking-widest">
        The site is under construction, but this page isn't. It seems you've wandered off the grid.
      </p>

      {/* Akcije - Stacked na mobitelu, Row na desktopu */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
        <Link 
          href="/" 
          className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-2xl shadow-slate-900/20"
        >
          <Home size={18} />
          Back Home
        </Link>
        
        <Link 
          href="/find_service" 
          className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 px-8 py-5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:border-yellow-400 transition-all active:scale-95"
        >
          <Search size={18} />
          Services
        </Link>
      </div>

      {/* Donji detalj */}
      <div className="mt-20 pt-8 border-t border-slate-200 w-full max-w-[200px]">
        <p className="text-[10px] text-slate-300 uppercase tracking-[0.4em] font-black italic">
          PRO-BUILD SYSTEM
        </p>
      </div>
    </main>
  );
}