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
      <header className="bg-white border-b border-slate-200 py-10 px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-black text-slate-900 uppercase italic">
            Rezultati za: <span className="text-yellow-500">{query || "Sve kategorije"}</span>
          </h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">
            Pronađeno: {filteredPros.length} provjerenih izvođača
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Lokacija</h3>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-yellow-400 focus:bg-white transition-all text-sm"
            >
              <option>Cijela Hrvatska</option>
              <option>Zagreb</option>
              <option>Split</option>
            </select>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white">
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Trebate pomoć?</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">Naš tim vam može pomoći odabrati najboljeg izvođača za vaš projekt.</p>
            <button className="w-full py-3 bg-yellow-400 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-colors">
              Besplatno savjetovanje
            </button>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {filteredPros.length > 0 ? (
            filteredPros.map((pro) => (
              <div 
                key={pro.id} 
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center group hover:shadow-xl hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className="w-32 h-32 bg-slate-50 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                  <span className="text-slate-300 font-black italic text-xs tracking-tighter uppercase group-hover:text-yellow-500 transition-colors">Partner Logo</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{pro.name}</h2>
                    <BadgeCheck className="text-blue-500 fill-blue-50" size={20} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mb-4 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Star className="text-yellow-400 fill-yellow-400" size={14}/> {pro.rating} ({pro.reviews})</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-300"/> {pro.location}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">{pro.category}</span>
                  </div>
                  
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                    {pro.desc}
                  </p>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <button className="w-full md:w-auto bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all active:scale-[0.95] flex items-center justify-center gap-3">
                    Pošalji upit <MessageSquare size={16}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="font-black uppercase text-slate-400 tracking-widest">Nema rezultata za vašu pretragu</p>
              <button 
                onClick={() => setSelectedLocation("Cijela Hrvatska")}
                className="mt-4 text-yellow-600 font-black text-[10px] uppercase tracking-widest hover:underline"
              >
                Poništi lokaciju
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
    <Suspense fallback={<div className="p-20 text-center font-black uppercase">Učitavanje...</div>}>
      <FindServiceContent />
    </Suspense>
  );
}