"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Star, MessageSquare, BadgeCheck } from "lucide-react";

const DATA = [
  { id: 1, name: "Gradnja d.o.o.", category: "Strojna Žbuka", rating: 4.9, reviews: 124, location: "Zagreb", desc: "Specijalizirani za strojnu žbuku i fasade s preko 15 godina iskustva." },
  { id: 2, name: "Elektro Jurić", category: "Struja", rating: 4.7, reviews: 85, location: "Split", desc: "Kompletne elektroinstalacije za novogradnju i adaptacije." },
  { id: 3, name: "Voda & Plin Horvat", category: "Vodoinstalater", rating: 5.0, reviews: 42, location: "Zagreb", desc: "Hitne intervencije i kompletne instalacije kupaonica." },
  { id: 4, name: "Interijeri Split", category: "Soboslikar", rating: 4.8, reviews: 67, location: "Split", desc: "Vrhunska obrada zidova i dekorativne tehnike." },
];

function FindServiceContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  
  const [selectedLocation, setSelectedLocation] = useState("Cijela Hrvatska");

  const filteredPros = DATA.filter((pro) => {
    const matchesSearch = pro.name.toLowerCase().includes(query) || pro.category.toLowerCase().includes(query);
    const matchesLocation = selectedLocation === "Cijela Hrvatska" || pro.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* RESPONZIVNI HEADER */}
      <header className="bg-white border-b border-slate-200 py-6 md:py-10 px-4 md:px-6">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-3xl font-black text-slate-900 uppercase italic leading-tight">
            Rezultati za: <span className="text-yellow-500">{query || "Sve kategorije"}</span>
          </h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mt-2">
            Pronađeno: {filteredPros.length} provjerenih izvođača
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-6 md:gap-10">
        
        {/* SIDEBAR - Na mobitelu ide prvi, smanjen razmak */}
        <aside className="w-full lg:w-64 space-y-4 md:space-y-8">
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-3 md:mb-4 text-slate-400">Lokacija</h3>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-3 md:p-4 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl font-bold outline-none focus:border-yellow-400 focus:bg-white transition-all text-xs md:text-sm appearance-none cursor-pointer"
            >
              <option>Cijela Hrvatska</option>
              <option>Zagreb</option>
              <option>Split</option>
            </select>
          </div>

          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl text-white">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">Trebate pomoć?</h3>
            <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed mb-4">Naš tim vam može pomoći odabrati najboljeg izvođača.</p>
            <button className="w-full py-3 bg-yellow-400 text-black rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-colors">
              Savjetovanje
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 space-y-4 md:space-y-6">
          {filteredPros.length > 0 ? (
            filteredPros.map((pro) => (
              <div 
                key={pro.id} 
                className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center group hover:shadow-xl hover:border-yellow-400/50 transition-all duration-300"
              >
                {/* LOGO - Smanjen na mobitelu */}
                <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                  <span className="text-slate-300 font-black italic text-[8px] md:text-xs tracking-tighter uppercase group-hover:text-yellow-500 transition-colors text-center p-2">
                    Partner Logo
                  </span>
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between md:justify-start gap-2 mb-1">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">{pro.name}</h2>
                    <BadgeCheck className="text-blue-500 fill-blue-50 shrink-0" size={18} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-[11px] text-slate-500 mb-3 md:mb-4 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Star className="text-yellow-400 fill-yellow-400" size={12}/> {pro.rating} <span className="text-slate-300 hidden sm:inline">({pro.reviews})</span></span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-300"/> {pro.location}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900 text-[9px]">{pro.category}</span>
                  </div>
                  
                  <p className="text-slate-500 text-xs md:text-sm line-clamp-2 md:line-clamp-none leading-relaxed font-medium">
                    {pro.desc}
                  </p>
                </div>

                {/* GUMB - Full width na mobitelu */}
                <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0">
                  <button className="w-full md:w-auto bg-slate-900 text-white px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all active:scale-[0.95] flex items-center justify-center gap-3 shadow-lg shadow-slate-200 md:shadow-none">
                    Upit <MessageSquare size={14}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-10 md:p-20 rounded-[30px] md:rounded-[40px] text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={20} className="text-slate-300" />
              </div>
              <p className="font-black uppercase text-slate-400 tracking-widest text-xs md:text-base">Nema rezultata</p>
              <button 
                onClick={() => setSelectedLocation("Cijela Hrvatska")}
                className="mt-4 text-yellow-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:underline"
              >
                Poništi filtre
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function FindServicePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse">Učitavanje...</div>}>
      <FindServiceContent />
    </Suspense>
  );
}