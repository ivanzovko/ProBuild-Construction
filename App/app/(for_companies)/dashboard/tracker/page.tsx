"use client";

import { Construction, CheckCircle2, Circle, ArrowRight } from "lucide-react";

export default function TrackerPage() {
  return (
    <div className="p-4 md:p-8 lg:p-12">
      <header className="mb-12 text-left">
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
          Project <span className="text-yellow-500">Tracker</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
          Live progress of your ugovoreni poslovi
        </p>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-yellow-400"><Construction size={24} /></div>
            <div>
              <h4 className="font-black text-slate-900 uppercase italic tracking-tight leading-none">Villa Mare - Facade Work</h4>
              <p className="text-slate-400 font-bold uppercase text-[9px] mt-2">Contractor ID: #PB-9921</p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="flex flex-col items-end px-4">
                <span className="text-[10px] font-black uppercase text-slate-900">Progress</span>
                <span className="text-xl font-black text-yellow-500 tracking-tighter italic">65%</span>
             </div>
          </div>
        </div>
        <div className="p-8 bg-slate-50/50 flex flex-wrap gap-8 justify-between">
           {/* Faze rada */}
           <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 size={16} /> Preparation</div>
           <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 size={16} /> Scaffolding</div>
           <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest border-b-2 border-yellow-400 pb-1">Painting</div>
           <div className="flex items-center gap-2 text-slate-300 font-black text-[10px] uppercase tracking-widest"><Circle size={16} /> Cleanup</div>
        </div>
      </div>
    </div>
  );
}