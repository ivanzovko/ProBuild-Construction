"use client";

import { Building2, MapPin, Star, ShieldCheck, Edit3, Image as ImageIcon } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 lg:p-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
          Public <span className="text-yellow-500">Profile</span>
        </h1>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all">
          <Edit3 size={16} /> Edit Profile
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lijeva strana - Osnovno */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 text-center shadow-sm">
            <div className="w-32 h-32 bg-slate-50 rounded-[40px] mx-auto mb-6 flex items-center justify-center border border-slate-100 relative group">
              <Building2 size={48} className="text-slate-300" />
              <div className="absolute inset-0 bg-black/40 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"><ImageIcon size={20}/></div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Bau-Invest d.o.o.</h2>
            <p className="flex items-center justify-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2"><MapPin size={12} /> Zagreb, Croatia</p>
            <div className="flex items-center justify-center gap-1 mt-4 text-yellow-500 font-black">
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} className="text-slate-200" fill="currentColor" />
              <span className="text-slate-900 text-xs ml-2">4.8</span>
            </div>
          </div>
          
          <div className="bg-slate-950 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
             <ShieldCheck className="absolute -right-4 -bottom-4 text-white/5" size={120} />
             <h4 className="font-black uppercase italic tracking-tight text-yellow-400 mb-2">Verified Partner</h4>
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">Your company is fully verified to take on public tenders.</p>
          </div>
        </div>

        {/* Desna strana - O nama / Portfolio */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">About Company</h3>
            <p className="text-slate-600 font-bold text-sm leading-relaxed">
              Specijalizirani smo za krovopokrivačke radove i renovacije starih kamenih kuća. S više od 15 godina iskustva na području Dalmacije, jamčimo vrhunsku kvalitetu i poštivanje rokova.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="aspect-square bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 border border-slate-100 border-dashed"><ImageIcon size={32} /></div>
             <div className="aspect-square bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 border border-slate-100 border-dashed"><ImageIcon size={32} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}