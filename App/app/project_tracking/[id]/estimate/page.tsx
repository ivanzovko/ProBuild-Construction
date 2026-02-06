"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  ArrowLeft, HardHat, Clock, 
  Star, CheckCircle2, XCircle, 
  Loader2, Gem, Construction, AlignLeft,
  TrendingUp, AlertTriangle, Check
} from "lucide-react";

function EstimatesSkeleton() {
  return (
    <div className="grid gap-4 md:gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-[24px] md:rounded-[32px] border-2 border-slate-100 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 md:gap-5 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-200 rounded-xl md:rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-16 bg-slate-50 rounded-xl md:rounded-2xl mb-4 md:mb-6" />
              <div className="flex gap-2 md:gap-3">
                <div className="h-14 bg-slate-100 rounded-xl md:rounded-2xl flex-1" />
                <div className="h-14 bg-slate-100 rounded-xl md:rounded-2xl flex-1" />
              </div>
            </div>
            <div className="flex lg:flex-col gap-2 md:gap-3 lg:w-32 mt-2 lg:mt-0">
              <div className="h-11 md:h-12 bg-slate-100 rounded-xl flex-1 lg:w-full" />
              <div className="h-11 md:h-12 bg-slate-100 rounded-xl flex-1 lg:w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectEstimatesListPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: projectId } = use(params);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [project, setProject] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const [modal, setModal] = useState<{
    show: boolean;
    type: 'accepted' | 'rejected' | null;
    estimateId: string | null;
  }>({ show: false, type: null, estimateId: null });

  const fetchData = async () => {
    try {
      const { data: pData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', projectId)
        .single();

      const { data: oData } = await supabase
        .from('estimates')
        .select(`*, company_profiles (*)`)
        .eq('job_id', projectId)
        .order('base_price_average', { ascending: true });

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

        const { error: updateJobError } = await supabase
          .from('jobs')
          .update({ 
            status: 'active',
            contractor_id: selectedOffer.contractor_id,
            accepted_offer_id: estimateId 
          })
          .eq('id', projectId);

        if (updateJobError) throw updateJobError;
        
        setShowToast(true);
        
        setTimeout(() => {
          router.push('/project_tracking');
        }, 2000);
        return; 
      }

      await fetchData();
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {showToast && (
        <div className="fixed top-6 md:top-10 left-1/2 -translate-x-1/2 z-[110] w-[90%] md:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">Success</p>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">Offer accepted & contractor assigned!</p>
            </div>
          </div>
        </div>
      )}

      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModal({ show: false, type: null, estimateId: null })} />
          <div className="bg-white rounded-[32px] p-6 md:p-8 max-w-sm w-full relative z-10 shadow-2xl border border-slate-100">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl mb-6 flex items-center justify-center ${modal.type === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {modal.type === 'accepted' ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase italic text-slate-900 mb-2">
              {modal.type === 'accepted' ? 'Accept Estimate?' : 'Decline Estimate?'}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm font-bold leading-relaxed mb-8">
              {modal.type === 'accepted' 
                ? 'By accepting this offer, this contractor will be assigned to your project and others will be declined.' 
                : 'Are you sure you want to decline this offer?'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setModal({ show: false, type: null, estimateId: null })}
                className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-500 font-black uppercase italic text-[10px] md:text-[11px] hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className={`flex-1 h-12 rounded-xl text-white font-black uppercase italic text-[10px] md:text-[11px] transition-all shadow-lg ${modal.type === 'accepted' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-slate-900 pt-6 pb-12 md:pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => router.back()} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-yellow-400 shrink-0">
                <ArrowLeft size={16} />
              </button>
              <div className="space-y-1">
                {loading ? (
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                ) : (
                  <span className="bg-yellow-400 text-slate-900 text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded uppercase italic">{project?.project_type}</span>
                )}
                {loading ? (
                   <div className="h-8 w-48 bg-white/10 rounded animate-pulse mt-2" />
                ) : (
                  <h1 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight md:leading-none">
                    {project?.title}
                  </h1>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6 bg-white/5 border border-white/10 rounded-2xl p-3 px-4 md:px-5 backdrop-blur-sm self-start md:self-center">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center text-yellow-400 shrink-0"><TrendingUp size={14} /></div>
                <div>
                  <p className="text-[6px] md:text-[7px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Budget</p>
                  {loading ? (
                    <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
                  ) : (
                    <p className="text-white font-black italic text-sm md:text-base leading-none">€{project?.estimated_price?.toLocaleString() || project?.estimated_budget?.toLocaleString() || "0"}</p>
                  )}
                </div>
              </div>
              <div className="h-6 md:h-8 w-[1px] bg-white/10" />
              <div>
                <p className="text-[6px] md:text-[7px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Size</p>
                {loading ? (
                   <div className="h-4 w-10 bg-white/10 rounded animate-pulse" />
                ) : (
                  <p className="text-white font-black italic text-sm md:text-base leading-none">{project?.sqm} m²</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 -mt-6 md:-mt-5 space-y-6 pb-20">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] italic flex items-center gap-2">
            <AlignLeft size={10} className="text-yellow-500" />
            Contractor Responses ({loading ? '...' : offers.length})
          </h2>
        </div>

        {loading ? (
          <EstimatesSkeleton />
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-[32px] md:rounded-[40px] p-12 md:p-20 text-center border-2 border-dashed border-slate-200">
            <Clock size={28} className="mx-auto text-slate-200 mb-4 animate-pulse" />
            <h3 className="font-black uppercase italic text-slate-400 text-base md:text-lg">No offers yet</h3>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className={`group bg-white rounded-[24px] md:rounded-[32px] border-2 transition-all duration-500 ${offer.status === 'accepted' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100'} hover:shadow-2xl overflow-hidden`}>
                <div className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 md:gap-5 mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-sm">
                          {offer.company_profiles?.logo_url ? <img src={offer.company_profiles.logo_url} className="w-full h-full object-cover" alt="logo" /> : <HardHat size={20} className="text-yellow-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 md:gap-3 mb-0.5">
                            <h3 className="font-black uppercase italic text-sm md:text-xl text-slate-900 tracking-tight">{offer.company_profiles?.company_name}</h3>
                            <div className="flex items-center gap-1 bg-slate-900 text-yellow-400 px-1.5 py-0.5 rounded-md text-[8px] md:text-[10px] font-black shrink-0"><Star size={8} className="fill-yellow-400" />{offer.company_profiles?.rating || 'NEW'}</div>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400"><Clock size={10} /><span className="text-[9px] font-bold uppercase tracking-tight">{offer.delivery_days} Days Delivery</span></div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/80 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-100 mb-4 md:mb-6">
                        <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contractor's Note</span>
                        <p className="text-[11px] md:text-xs font-bold italic text-slate-600 leading-relaxed line-clamp-3 md:line-clamp-none">{offer.description || "No additional notes provided."}</p>
                      </div>
                      
                      <div className="flex gap-2 md:gap-3">
                        <div className="bg-white rounded-xl md:rounded-2xl p-2.5 md:p-3 border border-slate-100 flex-1 min-w-0 shadow-sm">
                          <div className="flex items-center gap-1.5 mb-0.5"><Construction size={12} className="text-slate-400 shrink-0" /><span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase">Std</span></div>
                          <p className="font-black text-slate-900 text-sm md:text-lg">€{offer.base_price_average?.toLocaleString()}</p>
                        </div>
                        <div className="bg-yellow-400 rounded-xl md:rounded-2xl p-2.5 md:p-3 border border-yellow-500 flex-1 min-w-0 shadow-md shadow-yellow-400/20">
                          <div className="flex items-center gap-1.5 mb-0.5"><Gem size={12} className="text-slate-900 shrink-0" /><span className="text-[7px] md:text-[9px] font-black text-slate-900 uppercase">Prem</span></div>
                          <p className="font-black text-slate-900 text-sm md:text-lg">€{offer.base_price_premium?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 md:gap-3 bg-slate-50/50 md:p-6 p-2 rounded-xl md:rounded-[24px] border-t lg:border-t-0 lg:border-l border-slate-100 mt-2 lg:mt-0">
                      {offer.status === 'pending' ? (
                        <>
                          <button 
                            disabled={!!processingId}
                            onClick={() => setModal({ show: true, type: 'accepted', estimateId: offer.id })}
                            className="flex-1 lg:w-32 h-11 md:h-12 rounded-xl bg-emerald-500 text-white font-black uppercase italic text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            {processingId === offer.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                            Accept
                          </button>
                          <button 
                            disabled={!!processingId}
                            onClick={() => setModal({ show: true, type: 'rejected', estimateId: offer.id })}
                            className="flex-1 lg:w-32 h-11 md:h-12 rounded-xl bg-red-50 text-red-500 border border-red-100 font-black uppercase italic text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={14} />
                            Decline
                          </button>
                        </>
                      ) : (
                        <div className={`w-full py-3 md:py-4 rounded-xl font-black uppercase italic text-[10px] md:text-[11px] text-center flex items-center lg:flex-col justify-center gap-2 ${offer.status === 'accepted' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                          {offer.status === 'accepted' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                          {offer.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}