"use client";

import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Video, Calculator, 
  Construction, Zap, Paintbrush, LayoutGrid,
  ArrowUpRight
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const NAV_CARDS = [
    { 
      id: "Construction", 
      title: "Construction", 
      icon: <Construction className="w-5 h-5 sm:w-6 sm:h-6" />, 
      bgIcon: <Construction className="w-24 h-24 sm:w-32 sm:h-32" />,
      stats: "85 Pros",
      color: "hover:bg-slate-900"
    },
    { 
      id: "Installations", 
      title: "Installations", 
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, 
      bgIcon: <Zap className="w-24 h-24 sm:w-32 sm:h-32" />,
      stats: "120 Pros",
      color: "hover:bg-yellow-500"
    },
    { 
      id: "Finishing", 
      title: "Finishing", 
      icon: <Paintbrush className="w-5 h-5 sm:w-6 sm:h-6" />, 
      bgIcon: <Paintbrush className="w-24 h-24 sm:w-32 sm:h-32" />,
      stats: "45 Pros",
      color: "hover:bg-blue-600"
    },
    { 
      id: "all", 
      title: "All Services", 
      icon: <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />, 
      bgIcon: <LayoutGrid className="w-24 h-24 sm:w-32 sm:h-32" />,
      stats: "250+ Total",
      color: "hover:bg-slate-800"
    }
  ];

  const navigateTo = (id: string) => {
    const url = id === "all" ? "/find_service" : `/find_service?group=${id}`;
    router.push(url);
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-slate-900">
      <div className="flex flex-col-reverse lg:flex-row h-full w-full">
        
        {/* SECTION 1: DARK BRANDING */}
        <section className="w-full lg:w-[35%] lg:flex-none p-8 sm:p-10 xl:p-20 flex flex-col justify-center relative overflow-hidden border-t lg:border-t-0 lg:border-r border-white/10 bg-slate-950 shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-800 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl whitespace-nowrap lg:whitespace-normal sm:text-4xl xl:text-6xl font-black uppercase italic leading-tight mb-8 lg:mb-12 text-white tracking-tighter text-center lg:text-left transition-transform hover:scale-105 duration-300 cursor-default">
              Build with <span className="text-yellow-400">Confidence</span>
            </h1>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-2xl lg:max-w-md mx-auto lg:mx-0">
              <div className="flex items-center lg:items-start gap-4 p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                <div className="w-10 h-10 shrink-0 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-[10px] lg:text-sm mb-0.5 tracking-widest text-white">Fraud Protection</h3>
                  <p className="text-slate-400 text-[10px] lg:text-xs leading-relaxed">Verified companies only.</p>
                </div>
              </div>

              <div className="flex items-center lg:items-start gap-4 p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                <div className="w-10 h-10 shrink-0 bg-yellow-400/20 border border-yellow-400/30 rounded-xl flex items-center justify-center text-yellow-400">
                  <Video size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-[10px] lg:text-sm mb-0.5 tracking-widest text-white">Live Tracking</h3>
                  <p className="text-slate-400 text-[10px] lg:text-xs leading-relaxed">Daily progress updates.</p>
                </div>
              </div>

              <div className="flex items-center lg:items-start gap-4 p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                <div className="w-10 h-10 shrink-0 bg-green-400/20 border border-green-400/30 rounded-xl flex items-center justify-center text-green-400">
                  <Calculator size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-[10px] lg:text-sm mb-0.5 tracking-widest text-white">Price Certainty</h3>
                  <p className="text-slate-400 text-[10px] lg:text-xs leading-relaxed">No hidden costs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CATEGORIES - CENTRIRANO */}
        <section className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 relative lg:min-h-0 lg:overflow-y-auto">
          <div className="w-full max-w-md lg:max-w-3xl relative z-10 py-8 lg:py-0">
            
            <div className="mb-6 sm:mb-10 flex justify-start">
              <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] border-l-2 border-yellow-400 pl-4 leading-relaxed max-w-[240px] sm:max-w-xs text-left">
                Select your project phase to find verified local experts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {NAV_CARDS.map((card) => (
                <button
                  key={card.id}
                  onClick={() => navigateTo(card.id)}
                  className={`group relative flex flex-col justify-between p-4 sm:p-6 h-40 sm:h-52 bg-white border border-slate-200 rounded-[24px] sm:rounded-[40px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] ${card.color} hover:border-transparent overflow-hidden`}
                >
                  <div className="absolute -right-4 -bottom-4 text-slate-100 group-hover:text-white/10 transition-all duration-500 rotate-12 group-hover:rotate-0">
                    {card.bgIcon}
                  </div>

                  <div className="relative z-10 flex justify-between items-start">
                    <div className="p-2.5 sm:p-3 bg-slate-900 text-white rounded-xl group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                      {card.icon}
                    </div>
                    <ArrowUpRight className="text-slate-300 group-hover:text-white/50 transition-colors" size={20} />
                  </div>

                  <div className="relative z-10 text-left">
                    <span className="text-[7px] sm:text-[9px] font-black text-yellow-600 group-hover:text-yellow-200 transition-colors uppercase tracking-widest block mb-1">
                      {card.stats}
                    </span>
                    <h3 className="text-sm sm:text-xl font-black uppercase italic text-slate-900 group-hover:text-white transition-colors leading-none tracking-tight">
                      {card.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* BACKGROUND TEXT */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] hidden lg:flex">
            <h1 className="text-[20vw] font-black italic uppercase text-slate-900 leading-none">CORE</h1>
          </div>
        </section>

      </div>
    </div>
  );
}