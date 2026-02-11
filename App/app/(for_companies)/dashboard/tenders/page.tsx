"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import TenderDetails from "./components/TenderDetails";
import { 
  Gavel, Search, Loader2, ChevronRight, X, ArrowUp, AlertTriangle
} from "lucide-react";

export default function TendersPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<any>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const fetchTenders = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .or('status.eq.pending,status.eq.estimated')
        .order("created_at", { ascending: false });
      
      if (!error && data) setTenders(data);
      setLoading(false);
    };
    fetchTenders();

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFormDirty) {
          setPendingSelection(null);
        } else {
          setSelectedTender(null);
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [supabase, isFormDirty]);

  const handleTenderSelection = (tender: any) => {
    if (isFormDirty && tender?.id !== selectedTender?.id) {
      setPendingSelection(tender);
      return;
    }
    setSelectedTender(tender);
  };

  const confirmNavigation = () => {
    setSelectedTender(pendingSelection);
    setPendingSelection(null);
    setIsFormDirty(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrolled = e.currentTarget.scrollTop;
    setShowScrollTop(scrolled > 50);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getBadgeColor = (type: string, isSelected: boolean) => {
    if (isSelected) return "bg-white/20 text-white border-transparent";
    switch (type?.toLowerCase()) {
      case 'house': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'renovation': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'apartment': return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getFilterColors = (type: string, isActive: boolean) => {
    if (!isActive) return "bg-white border-slate-200 text-slate-500 hover:border-slate-300";
    switch (type.toLowerCase()) {
      case 'house': return "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200";
      case 'renovation': return "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200";
      case 'apartment': return "bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-200";
      case 'all': return "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-300";
      default: return "bg-yellow-400 border-yellow-400 text-slate-900 shadow-md shadow-yellow-200";
    }
  };

  const filteredTenders = tenders.filter(t => {
    const matchesSearch = (t.title?.toLowerCase() || t.project_type?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                          (t.location?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || t.project_type?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const projectTypes = ["all", "house", "renovation", "apartment"];

  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="text-yellow-500">{part}</span> : <span key={i}>{part}</span>
        )}
      </>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
      <AnimatePresence>
        {pendingSelection !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPendingSelection(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">Unsaved Changes</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Your offer hasn't been submitted. If you leave now, all entered data will be lost.
                </p>
              </div>
              <div className="flex border-t border-slate-100">
                <button 
                  onClick={() => setPendingSelection(null)}
                  className="flex-1 px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Stay here
                </button>
                <button 
                  onClick={confirmNavigation}
                  className="flex-1 px-6 py-5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-l border-slate-100"
                >
                  Discard & Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-white z-30 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => handleTenderSelection(null)}>
            <div className="bg-slate-900 p-1.5 rounded-lg text-white">
              <Gavel size={18} />
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter uppercase italic">
              Market<span className="text-yellow-500">place</span>
            </h1>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">Available Tenders</h2>
            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-[10px] font-black italic">
              {filteredTenders.length}
            </span>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className={`absolute inset-y-0 right-0 flex items-center bg-white px-4 transition-all duration-300 ease-in-out ${isSearchExpanded ? 'left-0 z-40' : 'left-[100%] md:static md:bg-transparent md:px-0'}`}>
            <div className="relative w-full flex items-center">
              <div className={`relative items-center w-full ${isSearchExpanded ? 'flex' : 'hidden md:flex md:w-40 sm:md:w-64 lg:md:w-96'}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text"
                  autoFocus={isSearchExpanded}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="w-full pl-9 pr-10 py-2 bg-slate-100 border border-transparent rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-yellow-400 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
                {isSearchExpanded && !searchQuery && (
                   <button onClick={() => setIsSearchExpanded(false)} className="md:hidden ml-2 p-2 text-slate-400"><X size={20} /></button>
                )}
              </div>
            </div>
          </div>
          {!isSearchExpanded && (
            <button onClick={() => setIsSearchExpanded(true)} className="md:hidden p-2 text-slate-900 hover:text-yellow-500 transition-colors">
              <Search size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside 
          className={`relative transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col z-10 flex-shrink-0 h-full
            ${selectedTender 
              ? "w-0 md:w-[400px] overflow-hidden opacity-0 md:opacity-100 bg-white border-r border-slate-200 shadow-xl" 
              : "w-full md:w-1/2 bg-white border-r border-slate-100"}`}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin text-yellow-500" size={24} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</span>
            </div>
          ) : (
            <div className="relative flex-1 flex flex-col min-h-0">
              <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 p-4 md:p-6 z-20">
                <div className="hidden md:flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <h2 className="font-black text-slate-900 uppercase tracking-tight text-xl md:text-2xl leading-none">Available Tenders</h2>
                    <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-[0.2em] mt-1">Live Marketplace</span>
                  </div>
                  <span className="bg-slate-900 text-white px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black italic">
                    {filteredTenders.length}
                  </span>
                </div>
                
                <div className="flex md:flex-wrap gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
                  {projectTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`rounded-full font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap border shrink-0
                        ${selectedTender ? "px-3 py-1 text-[8px] md:px-4 md:py-1.5 md:text-[9px]" : "px-4 py-2 text-[10px] md:px-6 md:py-2.5 md:text-[12px]"}
                        ${getFilterColors(type, activeFilter === type)}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-3 pb-24 md:pb-6">
                {filteredTenders.map((tender, index) => {
                  const isSelected = selectedTender?.id === tender.id;
                  return (
                    <motion.div 
                      layout
                      key={tender.id}
                      onClick={() => handleTenderSelection(tender)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group cursor-pointer border rounded-2xl w-full p-4 md:p-5 flex items-center justify-between gap-4 transition-colors duration-200
                        ${isSelected ? "bg-slate-900 border-slate-900 shadow-xl" : "bg-white border-slate-200 hover:bg-[#fefce8] hover:border-yellow-400 shadow-sm"}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`text-[9px] md:text-[10px] font-black italic w-4 md:w-5 flex-shrink-0 ${isSelected ? "text-yellow-400" : "text-slate-300"}`}>
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 min-w-0 flex-1">
                          <h3 className={`font-black uppercase leading-tight truncate tracking-tight transition-all duration-300 ${selectedTender ? 'text-[12px] md:text-sm' : 'text-sm md:text-base'} ${isSelected ? "text-white" : "text-slate-800"}`}>
                            <HighlightText text={tender.title || `Project #${tender.id.slice(0, 5)}`} highlight={searchQuery} />
                          </h3>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest w-fit border transition-colors ${getBadgeColor(tender.project_type, isSelected)}`}>
                            {tender.project_type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className={`font-black italic tracking-tighter transition-all duration-300 ${selectedTender ? 'text-sm md:text-lg' : 'text-base md:text-xl'} ${isSelected ? "text-yellow-400" : "text-slate-900"}`}>
                          {tender.estimated_price?.toLocaleString()} €
                        </p>
                        <ChevronRight size={14} strokeWidth={3} className={`transition-all ${isSelected ? "text-yellow-400 translate-x-1" : "text-slate-300 group-hover:text-yellow-500"}`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <AnimatePresence>
                {showScrollTop && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className="absolute bottom-20 md:bottom-6 right-6 z-50 bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 transition-all hover:bg-yellow-400 hover:text-slate-950 active:scale-95 group"
                  >
                    <div className="relative">
                      <ArrowUp size={22} strokeWidth={3} className="group-hover:animate-bounce" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </aside>

        <main className={`flex-1 bg-[#F8FAFC] h-full overflow-hidden transition-all duration-300
          ${selectedTender ? 'fixed inset-0 z-50 md:relative md:inset-auto' : 'hidden md:block'}`}>
          <AnimatePresence mode="wait">
            {selectedTender && (
              <TenderDetails 
                selectedTender={selectedTender} 
                setSelectedTender={handleTenderSelection}
                onFormStatusChange={setIsFormDirty} 
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}