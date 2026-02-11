"use client";

import Link from "next/link";
import { HardHat, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-50 px-6 overflow-hidden">
      <div className="flex flex-col items-center max-w-xs w-full">
        
        <div className="bg-yellow-400 p-6 rounded-[28px] mb-6 shadow-xl shadow-yellow-500/10">
          <HardHat size={48} className="text-slate-900 animate-bounce" />
        </div>

        <h1 className="text-7xl font-black text-slate-900 leading-none uppercase italic tracking-tighter">
          404
        </h1>
        
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-600 mb-4 bg-yellow-100 px-3 py-1 rounded-full">
          Off the grid
        </p>

        <p className="text-slate-400 text-center font-bold text-[10px] uppercase tracking-widest leading-loose mb-8">
          This page is either under renovation or it never existed in our blueprints.
        </p>

        <div className="flex flex-col w-full gap-2">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all active:scale-95"
          >
            <Home size={14} />
            Back Home
          </Link>
          
          <Link 
            href="/find_service" 
            className="flex items-center justify-center gap-3 bg-transparent border border-slate-200 text-slate-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            Services
          </Link>
        </div>

        <div className="mt-8 opacity-20">
          <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-900 italic">
            PRO-BUILD SYSTEM
          </p>
        </div>
      </div>
    </main>
  );
}