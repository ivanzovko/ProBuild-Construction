"use client";

import { ClipboardList, Search, Filter, ArrowRight, Clock, User } from "lucide-react";

export default function InquiriesPage() {
  return (
    <div className="p-4 md:p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
          Direct <span className="text-yellow-500">Inquiries</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
          Private requests from clients specifically for you
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search inquiries..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-yellow-400 transition-all"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="space-y-4">
        {/* Primjer jednog upita */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-yellow-400 transition-all cursor-pointer">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shrink-0">
              <User size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase rounded-md tracking-tighter">New Request</span>
                <span className="text-slate-400 font-black text-[9px] uppercase flex items-center gap-1"><Clock size={10} /> 2h ago</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Apartment Renovation - 60m2</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Client: Marko Perić • Split, Croatia</p>
            </div>
          </div>
          <button className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-yellow-400 group-hover:text-black transition-all flex items-center justify-center gap-2">
            View Details <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}