"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  Search, MapPin, History, Ruler, 
  Briefcase, Activity, X, ChevronRight,
  Pin, ArrowUpAZ, ArrowDownZA, ChevronDown, Check
} from "lucide-react";
import { Tooltip } from "@components/Tooltip";

// --- UX HELPER: Disable tooltips on mobile ---
const SmartTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) return <>{children}</>;
  return <Tooltip content={content}>{children}</Tooltip>;
};

// --- SKELETON: Matches the 2-line title layout ---
const TrackerSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-[32px] border-2 border-slate-200 p-5 md:p-8 flex items-center gap-5 md:gap-8">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 rounded-[20px] md:rounded-[28px] shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 bg-slate-100 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 md:h-8 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-6 md:h-8 w-1/2 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-3 w-32 bg-slate-50 rounded" />
        </div>
        <div className="hidden lg:flex gap-10 pl-10 border-l border-slate-100">
          <div className="w-24 h-12 bg-slate-100 rounded-xl" />
          <div className="w-24 h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

function SortDropdown({ value, onChange, options, sortOrder, setSortOrder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <SmartTooltip content="Change sorting criteria">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 md:gap-3 bg-white border border-slate-300 hover:border-yellow-500 px-2.5 md:px-4 py-2.5 rounded-2xl transition-all duration-300 shadow-sm group hover:scale-105 active:scale-95 shrink-0"
        >
          <span className="hidden md:inline text-[10px] font-black uppercase italic text-slate-500 tracking-wider">Sort by:</span>
          <span className="text-[10px] font-black uppercase italic text-slate-900">{selectedOption?.label}</span>
          <span className="md:hidden ml-1">
             {sortOrder === "asc" ? <ArrowUpAZ size={12} /> : <ArrowDownZA size={12} />}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </SmartTooltip>

      {isOpen && (
        <div className="absolute left-0 md:right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-100 md:hidden">
             <p className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase italic">Order</p>
             <div className="flex gap-1 p-1">
                <button 
                  onClick={() => setSortOrder("asc")}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg border ${sortOrder === "asc" ? "bg-slate-900 text-yellow-400 border-slate-900" : "bg-white text-slate-400 border-slate-200"}`}
                >
                  <ArrowUpAZ size={16} />
                </button>
                <button 
                  onClick={() => setSortOrder("desc")}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg border ${sortOrder === "desc" ? "bg-slate-900 text-yellow-400 border-slate-900" : "bg-white text-slate-400 border-slate-200"}`}
                >
                  <ArrowDownZA size={16} />
                </button>
             </div>
          </div>
          <div className="p-2">
            {options.map((opt: any) => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all duration-300 hover:scale-[1.02] ${
                  value === opt.id ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : "hover:bg-slate-50 text-slate-600 border border-transparent"
                }`}
              >
                {opt.label}
                {value === opt.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-400/60 text-slate-900 px-0.5 rounded-sm">{part}</span>
        ) : ( part )
      )}
    </>
  );
};

export default function TrackerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date_modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const sortOptions = [
    { id: "date_modified", label: "Last Activity" },
    { id: "created_at", label: "Date Created" },
    { id: "sqm", label: "Surface (m²)" },
    { id: "title", label: "Project Name" },
  ];

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("jobs")
      .select(`*, client_profiles (full_name, phone)`)
      .eq("contractor_id", session.user.id)
      .eq("status", activeTab)
      .order("is_pinned_contractor", { ascending: false }) 
      .order(sortBy, { ascending: sortOrder === "asc" });

    if (error) console.error("Database Error:", error.message);
    else setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [activeTab, sortBy, sortOrder]);

  const togglePin = async (id: string, currentState: boolean) => {
    const newState = !currentState;
    setJobs(prev => {
      const updated = prev.map(j => j.id === id ? { ...j, is_pinned_contractor: newState } : j);
      return [...updated].sort((a, b) => {
        if (a.is_pinned_contractor !== b.is_pinned_contractor) return a.is_pinned_contractor ? -1 : 1;
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (sortOrder === "desc") return valA < valB ? 1 : -1;
        return valA > valB ? 1 : -1;
      });
    });

    const { error } = await supabase.from("jobs").update({ is_pinned_contractor: newState }).eq("id", id);
    if (error) fetchJobs();
  };

  return (
    <div className="min-h-full bg-[#F1F5F9] pb-20">
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-row items-center justify-start gap-2 md:gap-6">
          
          <div className="hidden lg:flex items-center gap-4 shrink-0 transition-transform duration-300 hover:scale-105 group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center rotate-3 shadow-xl border-2 border-slate-800 shadow-yellow-500/10 transition-transform group-hover:rotate-0">
              <Activity size={24} className="text-yellow-400 -rotate-3 transition-transform group-hover:rotate-0" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                Live <span className="text-yellow-500">Tracker</span>
              </h1>
              <ActivityBars />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-start gap-2 md:gap-3">
            <div className={`relative flex items-center transition-all duration-300 ${isSearchExpanded ? 'flex-1' : 'w-10 md:flex-1'}`}>
              <button 
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="md:hidden flex items-center justify-center p-2.5 bg-white border border-slate-300 rounded-xl active:scale-90 transition-transform"
              >
                <Search size={18} className="text-slate-400" />
              </button>
              
              <Search className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-transform group-focus-within:scale-110" />
              
              <input 
                type="text" placeholder="Search..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                className={`bg-white border border-slate-300 rounded-xl md:rounded-2xl py-2 md:py-3 md:pl-12 pr-10 text-[11px] md:text-sm font-bold outline-none shadow-sm transition-all focus:border-yellow-500 
                ${isSearchExpanded ? 'w-full pl-10 opacity-100' : 'w-0 md:w-full opacity-0 md:opacity-100'}`}
              />
              
              {searchQuery && (
                <button 
                  onClick={() => {setSearchQuery(""); setIsSearchExpanded(false);}}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={3} />
                </button>
              )}
            </div>
            
            {!isSearchExpanded && (
              <>
                <SortDropdown 
                  value={sortBy} 
                  onChange={setSortBy} 
                  options={sortOptions} 
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                />
                
                <button 
                  onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} 
                  className="hidden md:block p-3 bg-white border border-slate-300 rounded-2xl shrink-0 transition-all hover:scale-105 active:scale-90"
                >
                  {sortOrder === "asc" ? <ArrowUpAZ size={20} /> : <ArrowDownZA size={20} />}
                </button>
                
                <div className="flex p-1 bg-white rounded-xl md:rounded-[20px] border border-slate-300 shrink-0 shadow-sm">
                  {(['active', 'completed'] as const).map((t) => (
                    <button 
                      key={t} 
                      onClick={() => setActiveTab(t)} 
                      className={`
                        px-5 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-[16px] 
                        text-[11px] md:text-[10px] font-black uppercase transition-all 
                        hover:scale-[1.02] active:scale-95 
                        ${activeTab === t ? (t === 'active' ? "bg-slate-900 text-yellow-400" : "bg-emerald-600 text-white") : "text-slate-400"}
                      `}
                    >
                      {t === 'active' ? 'Live' : 'Done'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-10 max-w-6xl mx-auto">
        {loading ? <TrackerSkeleton /> : (
          <div className="space-y-6">
            {jobs.filter(j => {
                const client = Array.isArray(j.client_profiles) ? j.client_profiles[0] : j.client_profiles;
                return j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
            }).map((job, index) => (
              <JobCard 
                key={job.id} 
                job={job} 
                index={index + 1} 
                highlight={searchQuery} 
                onTogglePin={() => togglePin(job.id, job.is_pinned_contractor)} 
                onClick={() => router.push(`/dashboard/tracker/${job.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function JobCard({ job, index, highlight, onTogglePin, onClick }: any) {
  const client = Array.isArray(job.client_profiles) ? job.client_profiles[0] : job.client_profiles;
  
  const formatActivity = (dateStr: string) => {
    if (!dateStr) return "No activity";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-GB", { 
      day: "2-digit", 
      month: "short", 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: false 
    }).format(date);
  };

  const getProgressStyles = (val: number) => {
    if (val === 100) return "bg-emerald-400 shadow-emerald-200";
    if (val <= 25) return "bg-rose-400 shadow-rose-200";
    return "bg-amber-400 shadow-amber-200";
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white rounded-[32px] border-2 cursor-pointer transition-all duration-500 hover:scale-[1.02] ${job.is_pinned_contractor ? "border-yellow-400 bg-yellow-50/20 shadow-xl shadow-yellow-500/5" : "border-slate-200 shadow-sm"} hover:shadow-2xl hover:border-yellow-500`}
    >
      {/* Pin Button - e.stopPropagation sprječava otvaranje projekta pri kliku na pin */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 md:top-20 md:translate-y-0 z-20">
        <SmartTooltip content={job.is_pinned_contractor ? "Unpin" : "Pin"}>
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
            className={`p-2.5 rounded-xl transition-all duration-300 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-125 active:scale-90 ${
              job.is_pinned_contractor ? "bg-yellow-400 text-slate-900 scale-110" : "bg-white text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-yellow-400"
            }`}
          >
            <Pin size={16} strokeWidth={3} fill={job.is_pinned_contractor ? "black" : "none"} />
          </button>
        </SmartTooltip>
      </div>

      <div className="p-5 md:p-8 flex flex-row items-center gap-5 md:gap-8">
        {/* Progress Bar */}
        <div className="relative shrink-0 transition-transform duration-500 group-hover:scale-110">
          <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 bg-slate-900 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center italic border-2 md:border-4 border-white z-20 shadow-lg">
            #{index}
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-[20px] md:rounded-[28px] flex items-center justify-center shadow-2xl overflow-hidden relative border-4 border-slate-200">
            <span className="text-[11px] md:text-[13px] font-black text-white italic z-10">{job.progress}%</span>
            <div 
              className={`absolute bottom-0 w-full transition-all duration-1000 ${getProgressStyles(job.progress)}`} 
              style={{ height: `${job.progress}%`, opacity: 0.6 }} 
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0 flex flex-col items-start text-left justify-center">
          <div className="mb-1">
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 md:px-3 py-1 rounded-full border border-slate-200 inline-block">
              👤 <HighlightText text={client?.full_name || "N/A"} highlight={highlight} />
            </span>
          </div>

          <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight md:leading-none group-hover:text-yellow-600 transition-colors line-clamp-2 break-words w-full overflow-hidden">
            <HighlightText text={job.title} highlight={highlight} />
          </h3>

          <div className="mt-1 md:mt-2">
             <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase italic tracking-tight">
                <History size={12} className="text-yellow-500" /> 
                Activity: {formatActivity(job.date_modified)}
             </span>
          </div>
        </div>

        {/* Desktop Metrics */}
        <div className="flex gap-10 shrink-0 border-l border-slate-200 pl-10 hidden lg:flex">
          <Metric label="Location" icon={<MapPin size={16} className="text-yellow-500" />} value={job.location} highlight={highlight} />
          <Metric label="Surface" icon={<Ruler size={16} className="text-yellow-500" />} value={`${job.sqm}m²`} />
          <Metric label="Tier" icon={<Briefcase size={16} className="text-yellow-500" />} value={job.quality} uppercase />
        </div>

        {/* Action Arrow (Affordance) */}
        <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-300 group-hover:border-slate-900 group-hover:bg-yellow-500 transition-all duration-300 shadow-sm hover:scale-110 shrink-0">
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, icon, value, uppercase, highlight }: any) {
  return (
    <div className="text-right min-w-[120px] transition-transform duration-300 hover:scale-105">
      <p className="text-[10px] font-black text-slate-400 uppercase italic mb-2 tracking-widest">{label}</p>
      <div className="flex items-center justify-end gap-2 font-black text-slate-900 italic leading-tight">
        {icon}
        <div className={`text-base ${uppercase ? 'uppercase' : ''}`}>
          {highlight ? <HighlightText text={value} highlight={highlight} /> : value}
        </div>
      </div>
    </div>
  );
}

function ActivityBars() {
  return (
    <div className="flex gap-0.5 items-end h-3 mt-2">
      {[0.4, 0.2, 0].map((d, i) => (
        <div key={i} className="w-1 bg-yellow-500/40 animate-bounce h-full rounded-full" style={{ animationDelay: `-${d}s` }} />
      ))}
    </div>
  );
}