"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react"; // Dodan Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Construction, Clock, ListFilter, ChevronDown, Home, Building2, Hammer, 
  X, CheckCircle2, LifeBuoy, Search, AlertTriangle, Loader2, Check
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import ActiveProjectCard from "./components/ActiveProjectCard";
import EstimateCard from "./components/EstimateCard";
import CompletedProjectCard from "./components/CompletedProjectCard";
import RatingModal from "./components/modals/RatingModal";
import RejectionModal from "./components/modals/RejectionModal";
import ChatModal from "./components/modals/ChatModal";
import CompanyInfoModal from "../_components/CompanyInfoModal";

// Forsiranje dinamičkog renderiranja kako bi build na Vercelu prošao
export const dynamic = 'force-dynamic';

// Unutarnja komponenta koja koristi useSearchParams
function ProjectTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [activeTab, setActiveTab] = useState<'active' | 'estimates' | 'completed'>('active');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_desc' | 'price_asc' | 'sqm_desc'>('newest');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [ratingJob, setRatingJob] = useState<any | null>(null);
  const [rejectionJobId, setRejectionJobId] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [chatJob, setChatJob] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'active' || tab === 'estimates' || tab === 'completed') {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: 'active' | 'estimates' | 'completed') => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'sqm_desc', label: 'Size (m²)' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select(`
          *, 
          contractor:company_profiles!jobs_contractor_id_fkey(*),
          estimates_count:estimates(count) 
        `)
        .eq('client_id', user.id);

      if (error) throw error;
      setJobs(jobsData?.map(job => ({
        ...job,
        contractor_name: job.contractor?.company_name,
        estimates_count: job.estimates_count?.[0]?.count || 0 
      })) || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router, supabase]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', deleteId);
      if (error) throw error;
      setJobs(prev => prev.filter(job => job.id !== deleteId));
      setDeleteId(null);
      triggerSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRejectFinish = async (note: string) => {
    if (!rejectionJobId) return;
    setIsRejecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from('jobs')
        .update({ progress: 99 })
        .eq('id', rejectionJobId);

      if (updateError) throw updateError;

      await supabase.from('job_messages').insert({
        job_id: rejectionJobId,
        sender_id: user.id,
        text: `🚨 NIJE GOTOVO: ${note}`
      });

      setJobs(prev => prev.map(job => 
        job.id === rejectionJobId ? { ...job, progress: 99 } : job
      ));

      setRejectionJobId(null);
      triggerSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    let data = jobs.filter(job => {
      const searchStr = `${job.title} ${job.project_type} ${job.contractor_name || ""}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
    switch (sortBy) {
      case 'newest': data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'oldest': data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case 'price_desc': data.sort((a, b) => (b.estimated_price || 0) - (a.estimated_price || 0)); break;
      case 'price_asc': data.sort((a, b) => (a.estimated_price || 0) - (b.estimated_price || 0)); break;
      case 'sqm_desc': data.sort((a, b) => b.sqm - a.sqm); break;
    }
    return data;
  }, [jobs, sortBy, searchQuery]);

  const activeProjects = filteredAndSortedJobs.filter(j => ['active', 'in-progress', 'in_progress'].includes(j.status));
  const myEstimates = filteredAndSortedJobs.filter(j => j.status === 'pending');
  const completedProjects = filteredAndSortedJobs.filter(j => j.status === 'completed');

  return (
    <div className="h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto bg-slate-50 pb-20 no-scrollbar">
      {/* ... (ostatak tvog JSX-a je identičan) ... */}
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Check size={14} className="text-slate-900" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 italic">Action Successful</span>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl border border-white animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setDeleteId(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={36} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-3 tracking-tighter">Delete Project?</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto opacity-70">
                This action is irreversible. All associated data will be removed.
              </p>
            </div>
            <div className="flex p-6 gap-3 bg-slate-50/80 border-t border-slate-100">
              <button 
                disabled={isDeleting} 
                onClick={() => setDeleteId(null)} 
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                disabled={isDeleting} 
                onClick={confirmDelete} 
                className="flex-1 py-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95 disabled:bg-red-400"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Delete Project"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {ratingJob && (
        <RatingModal 
          job={ratingJob} 
          onClose={() => setRatingJob(null)}
          onSuccess={() => { fetchData(); setRatingJob(null); triggerSuccess(); }}
        />
      )}

      {rejectionJobId && (
        <RejectionModal 
          isOpen={!!rejectionJobId}
          onClose={() => setRejectionJobId(null)}
          onConfirm={handleRejectFinish}
          isSubmitting={isRejecting}
        />
      )}

      {chatJob && <ChatModal job={chatJob} onClose={() => setChatJob(null)} />}

     {selectedCompany && (
        <CompanyInfoModal 
          isOpen={!!selectedCompany}
          company={selectedCompany} 
          onClose={() => setSelectedCompany(null)} 
        />
      )}

      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="py-5 flex flex-row items-center justify-between gap-2 md:gap-4">
            <div className="min-w-0 flex-1 pt-1 md:pt-0">
              <h1 className="text-base sm:text-2xl md:text-3xl font-black text-white uppercase italic leading-tight md:leading-none tracking-tighter whitespace-normal md:whitespace-nowrap overflow-hidden line-clamp-2 md:line-clamp-none py-1">
                Project Tracking System
              </h1>
            </div>

            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="relative transition-all duration-300 group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none z-10" />
                <input 
                  type="text" 
                  placeholder="Search by project title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-10 md:w-74 bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 md:pr-10 text-[11px] font-bold text-white placeholder:text-slate-300 focus:outline-none focus:border-yellow-400/50 transition-all uppercase tracking-widest focus:w-44 md:focus:w-64 cursor-pointer focus:cursor-text"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md transition-colors group/clear"
                  >
                    <X size={14} className="text-slate-400 group-hover/clear:text-yellow-400 transition-colors" />
                  </button>
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)} 
                  className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-yellow-400 rounded-xl text-[11px] font-black uppercase text-slate-900 hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/10"
                >
                  <ListFilter size={16} />
                  <ChevronDown size={14} className={`hidden md:block transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 mt-3 w-48 md:w-52 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl p-1.5 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">Sort By</div>
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { setSortBy(option.id as any); setIsSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          sortBy === option.id 
                          ? 'bg-yellow-400 text-slate-900' 
                          : 'text-slate-300 hover:bg-white/5 hover:translate-x-1'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => router.push("/support")}
                className="flex items-center justify-center md:gap-2.5 px-3 md:px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl hover:text-yellow-400 hover:border-yellow-400/50 transition-all hover:scale-105 active:scale-95 group shadow-lg"
              >
                <LifeBuoy size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden md:block text-[11px] font-black uppercase italic tracking-widest">
                  Support
                </span>
              </button>
            </div>
          </div>

          <div className="flex border-t border-white/5">
            {[
              { id: 'active', label: 'Active', desktopLabel: ' Projects', icon: Construction },
              { id: 'estimates', label: 'Estimates', desktopLabel: ' Projects', icon: Clock },
              { id: 'completed', label: 'History', desktopLabel: ' Archive', icon: CheckCircle2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border-b-2 group hover:bg-white/5 ${
                  activeTab === tab.id
                  ? "border-yellow-400 text-yellow-400 bg-white/5" 
                  : "border-transparent text-slate-500 hover:text-slate-200"
                }`}
              >
                <tab.icon size={14} className="shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="truncate group-hover:tracking-[0.12em] transition-all duration-300">
                  {tab.label}
                  <span className="hidden md:inline">{tab.desktopLabel}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {loading ? (
          <div className="grid gap-6">
            <SkeletonCard type={activeTab === 'estimates' ? 'grid' : 'list'} />
            <SkeletonCard type={activeTab === 'estimates' ? 'grid' : 'list'} />
          </div>
        ) : (
          <div className="grid gap-6">
            {activeTab === 'active' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeProjects.map((job, i) => (
                  <div key={job.id} className="hover:scale-[1.01] transition-transform duration-300">
                    <ActiveProjectCard 
                      job={job} 
                      index={i + 1}
                      config={getCategoryData(job.project_type)}
                      onOpenRating={setRatingJob}
                      onRejectFinish={setRejectionJobId}
                      onOpenChat={setChatJob}
                      onOpenCompany={() => setSelectedCompany(job.contractor)}
                      searchQuery={searchQuery}
                    />
                  </div>
                ))}
                {activeProjects.length === 0 && (
                  <EmptyState 
                    icon={<Construction size={24}/>} 
                    title={searchQuery ? "No results found" : "No Active Projects"} 
                    description={searchQuery ? "Try searching for something else." : "Construction progress appears here."} 
                  />
                )}
              </div>
            )}

            {activeTab === 'estimates' && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {myEstimates.map((job, i) => (
                  <div key={job.id} className="hover:scale-[1.01] transition-transform duration-300">
                    <EstimateCard 
                      job={job} 
                      index={i + 1} 
                      onDelete={setDeleteId} 
                      searchQuery={searchQuery}
                    />
                  </div>
                ))}
                {myEstimates.length === 0 && (
                  <EmptyState 
                    icon={<Clock size={24}/>} 
                    title={searchQuery ? "No results found" : "No Estimates"} 
                    description={searchQuery ? "Try searching for something else." : "Saved quotes appear here."} 
                  />
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {completedProjects.map((job, i) => (
                  <div key={job.id} className="hover:scale-[1.01] transition-transform duration-300">
                    <CompletedProjectCard 
                      job={job} 
                      index={i + 1}
                      config={getCategoryData(job.project_type)} 
                      onOpenCompany={() => setSelectedCompany(job.contractor)}
                      searchQuery={searchQuery}
                    />
                  </div>
                ))}
                {completedProjects.length === 0 && (
                  <EmptyState 
                    icon={<CheckCircle2 size={24}/>} 
                    title={searchQuery ? "No results found" : "History Empty"} 
                    description={searchQuery ? "Try searching for something else." : "Archived projects appear here."} 
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Glavna funkcija koja umotava sadržaj u Suspense
export default function EstimatesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
      </div>
    }>
      <ProjectTrackingContent />
    </Suspense>
  );
}

// ... (Pomoćne funkcije getCategoryData i komponente SkeletonCard/EmptyState ostaju iste)
const CATEGORY_CONFIG: Record<string, { img: string; icon: any; color: string }> = {
  renovation: {
    img: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=600&auto=format&fit=crop",
    icon: Hammer,
    color: "from-orange-500/20 to-orange-500/5"
  },
  apartment: {
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop",
    icon: Building2,
    color: "from-blue-500/20 to-blue-500/5"
  },
  house: {
    img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=600&auto=format&fit=crop",
    icon: Home,
    color: "from-green-500/20 to-green-500/5"
  },
  default: {
    img: "https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=600&auto=format&fit=crop",
    icon: Construction,
    color: "from-slate-500/20 to-slate-500/5"
  }
};

const getCategoryData = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("renov")) return CATEGORY_CONFIG.renovation;
  if (t.includes("apartman") || t.includes("stan") || t.includes("apartment")) return CATEGORY_CONFIG.apartment;
  if (t.includes("kuca") || t.includes("kuća") || t.includes("house")) return CATEGORY_CONFIG.house;
  return CATEGORY_CONFIG.default;
};

function SkeletonCard({ type }: { type: 'list' | 'grid' }) {
  return (
    <div className={`bg-white rounded-[24px] border border-slate-100 p-5 animate-pulse ${type === 'list' ? 'flex flex-col sm:flex-row gap-5' : 'space-y-4'}`}>
      <div className={`${type === 'list' ? 'w-full sm:w-48 h-32' : 'h-40 w-full'} bg-slate-100 rounded-xl`} />
      <div className="flex-1 space-y-4 py-2">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-2 w-full bg-slate-100 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white py-12 px-6 rounded-[32px] text-center border border-slate-100 flex flex-col items-center hover:scale-105 transition-transform duration-500 group">
      <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-yellow-50 group-hover:text-yellow-500 transition-colors duration-300">{icon}</div>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-2 italic">{title}</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed max-w-[200px] tracking-wide">{description}</p>
    </div>
  );
}