"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import ReviewsModal from "../components/ReviewsModal";
import CompanyDescriptionModal from "../../../_components/CompanyInfoModal";
import { 
  ArrowLeft, HardHat, 
  Star, CheckCircle2, XCircle, 
  Loader2, AlignLeft,
  AlertTriangle, Check, Calendar, CreditCard,
  ShieldCheck, ChevronDown,
  Search, SlidersHorizontal, X, BadgeCheck, Info
} from "lucide-react";
import ProjectInfoModal from "../components/ProjectInfoModal";

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!text) return null;
  if (!highlight.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function EstimatesSkeleton() {
  return (
    <div className="grid gap-3 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-slate-100 p-5 h-24 animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-10 w-10 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function ProjectEstimatesListPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [project, setProject] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating'>('price_asc');
  
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [mobileSortVisible, setMobileSortVisible] = useState(false);

  const [reviewsModal, setReviewsModal] = useState({ show: false, name: '', id: '' });
  const [companyModal, setCompanyModal] = useState({ show: false, company: null as any });
  const [modal, setModal] = useState<{
    show: boolean;
    type: 'accepted' | 'rejected' | null;
    estimateId: string | null;
  }>({ show: false, type: null, estimateId: null });

  const fetchData = async () => {
    try {
      setLoading(true);
     const { data: pData } = await supabase.from('jobs').select('*').eq('id', projectId).single();
    
    const { data: oData, error: oError } = await supabase
      .from('estimates')
      .select(`
        *, 
        company_profiles (
          *
        )
      `)
      .eq('job_id', projectId);

      if (oError) console.error(oError.message);
      setProject(pData);
      setOffers(oData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const filteredAndSortedOffers = useMemo(() => {
    let result = [...offers];

    if (searchQuery) {
      result = result.filter(o => 
        o.company_profiles?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.company_profiles?.average_rating || 0) - (a.company_profiles?.average_rating || 0);
      return 0;
    });

    return result;
  }, [offers, searchQuery, sortBy]);

  const toggleOffer = (id: string) => {
    setExpandedOffers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBack = () => {
    if (!project) return  router.push('/project_tracking');;
    if (project.status === 'pending')  return router.push('/project_tracking?tab=estimates');
    if (project.status === 'completed') return  router.push('/project_tracking?tab=completed');;
    return router.push('/project_tracking?tab=active');
   
    
  };

  const confirmAction = async () => {
    if (!modal.estimateId || !modal.type) return;
    const { estimateId, type } = modal;
    setProcessingId(estimateId);
    setModal({ show: false, type: null, estimateId: null });

    try {
      const selectedOffer = offers.find(o => o.id === estimateId);
      
      const { error: updateOfferError } = await supabase
        .from('estimates')
        .update({ status: type })
        .eq('id', estimateId);

      if (updateOfferError) throw updateOfferError;
      
      if (type === 'accepted' && selectedOffer) {
        await supabase
          .from('estimates')
          .update({ status: 'rejected' })
          .eq('job_id', projectId)
          .neq('id', estimateId);

        await supabase
          .from('jobs')
          .update({ 
            status: 'active',
            contractor_id: selectedOffer.contractor_id,
            accepted_offer_id: estimateId 
          })
          .eq('id', projectId);

        setShowToast(true);
        setTimeout(() => router.push('/project_tracking'), 2000);
        return; 
      }
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
      <ReviewsModal 
        isOpen={reviewsModal.show} 
        onClose={() => setReviewsModal({ show: false, name: '', id: '' })}
        contractorName={reviewsModal.name}
        contractorId={reviewsModal.id}
        supabase={supabase}
      />

      {companyModal.show && (
        <CompanyDescriptionModal 
          isOpen={companyModal.show}
          onClose={() => setCompanyModal({ show: false, company: null })}
          company={companyModal.company}
        />
      )}

      {isInfoModalOpen && (
        <ProjectInfoModal 
          job={project} 
          onClose={() => setIsInfoModalOpen(false)} 
        />
      )}
  
      {showToast && (
        <div className="fixed top-6 left-6 z-[110] w-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 border border-white/10">
            <Check size={18} className="text-emerald-500" />
            <p className="text-[11px] font-black uppercase italic tracking-wider">Offer accepted!</p>
          </div>
        </div>
      )}

      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModal({ show: false, type: null, estimateId: null })} />
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full relative z-10 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black uppercase italic text-slate-900 mb-4 text-left">
              {modal.type === 'accepted' ? 'Confirm Acceptance?' : 'Decline Offer?'}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setModal({ show: false, type: null, estimateId: null })} className="flex-1 h-10 rounded-lg bg-slate-100 text-slate-500 font-black uppercase italic text-[10px]">No</button>
              <button onClick={confirmAction} className={`flex-1 h-10 rounded-lg text-white font-black uppercase italic text-[10px] ${modal.type === 'accepted' ? 'bg-emerald-500' : 'bg-red-500'}`}>Yes</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-slate-900 py-4 md:py-6 px-4 md:px-6 sticky top-0 z-50 border-b border-white/5 shadow-xl">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
            <button 
              onClick={handleBack} 
              className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-white/5 text-white rounded-xl lg:rounded-2xl hover:bg-yellow-400 hover:text-slate-900 transition-all border border-white/5 shrink-0 hover:scale-110"
            >
              <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
              
            </button>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <h1 className="text-base md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight break-words">
                  {project?.title}
                </h1>
                <button 
                  onClick={() => setIsInfoModalOpen(true)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-yellow-500 border border-white/5 active:scale-90 shrink-0 cursor-help"
                >
                  <Info size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
              <div className="px-5 py-2.5 rounded-xl bg-white/5 text-left border border-white/5">
                <p className="text-[10px] font-black text-yellow-400 uppercase italic leading-none mb-1.5 opacity-80">Budget</p>
                <p className="text-white font-black italic text-xl leading-none">{project?.estimated_price?.toLocaleString()} €</p>
              </div>
              <div className="px-5 py-2.5 text-left">
                <p className="text-[10px] font-black text-white/40 uppercase italic leading-none mb-1.5">Size</p>
                <p className="text-white font-black italic text-xl leading-none">{project?.sqm} m²</p>
              </div>
          </div>

          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button 
              onClick={() => { setMobileSearchVisible(!mobileSearchVisible); setMobileSortVisible(false); }}
              className={`p-3 rounded-xl border transition-all ${mobileSearchVisible ? 'bg-yellow-500 border-yellow-500 text-slate-900' : 'bg-white/10 border-white/10 text-white'}`}
            >
              <Search size={20} />
            </button>
            <button 
              onClick={() => { setMobileSortVisible(!mobileSortVisible); setMobileSearchVisible(false); }}
              className={`p-3 rounded-xl border transition-all ${mobileSortVisible ? 'bg-yellow-500 border-yellow-500 text-slate-900' : 'bg-white/10 border-white/10 text-white'}`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {(mobileSearchVisible || mobileSortVisible) && (
          <>
            <div 
              className="fixed inset-0 z-40 md:hidden" 
              onClick={() => { setMobileSearchVisible(false); setMobileSortVisible(false); }}
            />
            <div className="md:hidden mt-4 p-4 bg-white rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-200 relative z-50">
              {mobileSearchVisible && (
                <div className="relative">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search contractors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold italic text-slate-900 outline-none focus:border-yellow-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400">
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
              {mobileSortVisible && (
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'price_asc', label: 'Price: Low-High' },
                    { id: 'price_desc', label: 'Price: High-Low' },
                    { id: 'rating', label: 'Top Rated' }
                  ].map((option) => (
                    <button 
                      key={option.id}
                      onClick={() => { setSortBy(option.id as any); setMobileSortVisible(false); }}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase italic text-left border-2 ${sortBy === option.id ? 'bg-yellow-500 border-yellow-500 text-slate-900' : 'bg-slate-50 border-transparent text-slate-500'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </header>

      <main className="max-w-[1400px] mx-auto px-6 mt-8 md:mt-12 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 justify-center">
          <aside className="hidden lg:block w-[280px] shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8 sticky top-[120px]">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest mb-4 flex items-center gap-2">
                  <Search size={14} className="text-yellow-500" /> Search
                </h3>
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Contractor name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:border-yellow-500 outline-none transition-all italic text-slate-900"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-yellow-500" /> Sort
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'price_asc', label: 'Price: Low-High' },
                    { id: 'price_desc', label: 'Price: High-Low' },
                    { id: 'rating', label: 'Top Rated' }
                  ].map((option) => (
                    <button 
                      key={option.id}
                      onClick={() => setSortBy(option.id as any)}
                      className={`w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase italic transition-all text-left border-2 ${
                        sortBy === option.id 
                        ? 'bg-yellow-500 border-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20 translate-x-2' 
                        : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Offers</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-4xl font-black text-slate-900 italic tracking-tighter">{filteredAndSortedOffers.length}</span>
                  <div className="h-8 w-[2px] bg-yellow-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase italic leading-tight">Contractors<br/>Found</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="w-full max-w-3xl space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2">
                <AlignLeft size={18} className="text-yellow-500" />
                Available Offers
              </h2>
            </div>

            {loading ? (
              <EstimatesSkeleton />
            ) : (
              <div className="space-y-4">
                {filteredAndSortedOffers.map((offer, index) => {
                  const isExpanded = expandedOffers[offer.id];
                  const rating = Number(offer.company_profiles?.average_rating || 0);
                  
                  return (
                    <div 
                      key={offer.id} 
                      className={`bg-white rounded-3xl border-2 overflow-hidden transition-all duration-300 transform-gpu cursor-pointer active:scale-[0.99] ${
                        offer.status === 'accepted' 
                        ? 'border-emerald-500 ring-4 ring-emerald-500/5' 
                        : offer.status === 'rejected' 
                        ? 'border-slate-100 opacity-75 grayscale-[0.5]' 
                        : 'border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:scale-[1.01]'
                      }`}
                    >
                      <div 
                        onClick={() => toggleOffer(offer.id)}
                        className="p-4 md:p-5 flex items-center justify-between bg-slate-900 group"
                      >
                        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                          <div className="flex flex-col items-center shrink-0">
                            <span className="text-[11px] md:text-[10px] font-black text-white/40 italic mb-1">#{index + 1}</span>
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-yellow-500/50 transition-colors">
                              {offer.company_profiles?.logo_url ? (
                                <img src={offer.company_profiles.logo_url} className="w-full h-full object-cover" alt="logo" />
                              ) : (
                                <HardHat size={20} className="text-yellow-400 md:w-[24px] md:h-[24px]" />
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 mb-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompanyModal({ show: true, company: offer.company_profiles });
                                }}
                                className="group/name flex items-center gap-1.5 text-left cursor-pointer"
                              >
                                <h3 className="font-black uppercase italic text-sm md:text-lg text-white tracking-tight group-hover/name:text-yellow-400 transition-colors">
                                  <HighlightText 
                                    text={offer.company_profiles?.company_name || "Contractor"} 
                                    highlight={searchQuery} 
                                  />
                                </h3>
                                {offer.company_profiles?.is_verified && (
                                  <BadgeCheck size={16} className="text-emerald-400 shrink-0" strokeWidth={3} />
                                )}
                                <div className="p-1 rounded-md bg-white/5 group-hover/name:bg-yellow-400/20 transition-all cursor-help">
                                  <Info size={12} className="text-white/40 group-hover/name:text-yellow-400" />
                                </div>
                              </button>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReviewsModal({ 
                                    show: true, 
                                    name: offer.company_profiles?.company_name || 'Contractor',
                                    id: offer.contractor_id 
                                  });
                                }}
                                className="flex items-center gap-1 bg-yellow-500 px-2.5 py-1 md:px-2.5 md:py-1 rounded-lg text-[10px] md:text-[10px] font-black text-white shadow-lg shadow-yellow-500/10 hover:bg-yellow-400 hover:scale-105 transition-all cursor-pointer active:scale-95"
                              >
                                <Star size={12} className="fill-white md:w-[12px] md:h-[12px]" />
                                {rating > 0 ? rating.toFixed(1) : 'NEW'}
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="text-lg md:text-2xl font-black text-yellow-400 italic tracking-tighter">
                                {Number(offer.price).toLocaleString()} €
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`p-1.5 md:p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-yellow-500 text-slate-900' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                          <ChevronDown size={20} className={`md:w-[24px] md:h-[24px] transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <div className="p-5 md:p-8 cursor-default" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-8">
                              <div className="space-y-4 md:border-r md:border-slate-100 md:pr-4">
                                <div className="flex items-center gap-3">
                                  <Calendar size={18} className="text-yellow-500" />
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Deadline</p>
                                    <p className="text-[13px] font-black text-slate-900 uppercase italic">{new Date(offer.deadline_date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <CreditCard size={18} className="text-slate-400" /> 
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Payment</p>
                                    <p className="text-[13px] font-black text-slate-900 uppercase italic">{offer.payment_method}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <ShieldCheck size={18} className="text-slate-400" />
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Quality</p>
                                    <p className="text-[13px] font-black text-slate-900 uppercase italic">{offer.quality_level}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <AlertTriangle size={18} className={offer.potential_delay_acknowledged ? 'text-red-500' : 'text-emerald-500'} />
                                  <span className={`text-[12px] font-black uppercase italic ${offer.potential_delay_acknowledged ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {offer.potential_delay_acknowledged ? 'Potential delay' : 'it will be on time'}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-200 relative">
                                <span className="absolute -top-3 left-6 bg-white px-3 py-1 text-[10px] font-black text-slate-500 uppercase italic border border-slate-200 rounded-lg shadow-sm">Technical Notes</span>
                                <p className="text-[13px] md:text-[14px] font-bold italic text-slate-800 leading-relaxed">
                                  {offer.technical_notes || "No additional technical notes provided."}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                              <div className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex flex-row md:flex-col items-center justify-between md:items-start">
                                <p className="text-[10px] font-black text-yellow-500 uppercase italic tracking-widest md:mb-1">Total Quote</p>
                                <p className="text-xl md:text-3xl font-black italic tracking-tighter">{Number(offer.price).toLocaleString()} €</p>
                              </div>

                              <div className="flex items-center gap-3 w-full md:w-auto">
                                {offer.status === 'pending' ? (
                                  <>
                                    <button 
                                      disabled={!!processingId}
                                      onClick={(e) => { e.stopPropagation(); setModal({ show: true, type: 'rejected', estimateId: offer.id }); }}
                                      className="flex-1 md:w-32 h-14 rounded-2xl bg-white text-slate-400 border-2 border-slate-100 font-black uppercase italic text-[11px] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                    >
                                      <XCircle size={18} /> Decline
                                    </button>
                                    <button 
                                      disabled={!!processingId}
                                      onClick={(e) => { e.stopPropagation(); setModal({ show: true, type: 'accepted', estimateId: offer.id }); }}
                                      className="flex-[2] md:px-10 h-14 rounded-2xl bg-emerald-500 text-white font-black uppercase italic text-[11px] md:text-[12px] hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95"
                                    >
                                      {processingId === offer.id ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={22} /> Accept Offer</>}
                                    </button>
                                  </>
                                ) : (
                                  <div className={`w-full md:w-auto flex items-center gap-3 md:gap-6 bg-slate-50 border border-slate-200 rounded-2xl transition-all ${offer.status === 'rejected' ? 'px-4 py-3 md:px-10 md:py-6' : 'px-8 py-4 md:px-12 md:py-8'}`}>
                                    <div className={`shrink-0 rounded-full flex items-center justify-center ${offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-600 w-10 h-10 md:w-14 md:h-14' : 'bg-slate-200 text-slate-500 w-8 h-8 md:w-12 md:h-12'}`}>
                                      {offer.status === 'accepted' ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <XCircle className="w-5 h-5 md:w-7 md:h-7" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
                                      <span className={`font-black uppercase italic leading-none ${offer.status === 'accepted' ? 'text-xl md:text-3xl text-emerald-600' : 'text-base md:text-2xl text-slate-700'}`}>
                                        {offer.status}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredAndSortedOffers.length === 0 && !loading && (
                  <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase italic tracking-widest text-sm">No offers match your criteria</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}