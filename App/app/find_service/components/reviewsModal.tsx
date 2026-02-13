"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Star, AlertTriangle, MessageSquare, X, 
  BadgeCheck, Briefcase, ShieldAlert, Info
} from "lucide-react";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorName: string;
  contractorId: string;
  supabase: any;
}

const ReviewSkeleton = () => (
  <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-slate-100 shadow-sm overflow-hidden animate-pulse">
    <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100" />
        <div className="space-y-1.5">
          <div className="h-2.5 w-20 bg-slate-100 rounded" />
          <div className="h-2 w-12 bg-slate-50 rounded" />
        </div>
      </div>
      <div className="h-3 w-10 bg-slate-100 rounded" />
    </div>
    <div className="p-4 sm:p-5 space-y-2">
      <div className="h-2.5 w-full bg-slate-50 rounded" />
      <div className="h-2.5 w-[70%] bg-slate-50 rounded" />
    </div>
  </div>
);

export default function ReviewsModal({ 
  isOpen, 
  onClose, 
  contractorName, 
  contractorId, 
  supabase 
}: ReviewsModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [contractorStats, setContractorStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contractorId) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data: profile, error: pError } = await supabase
            .from('company_profiles')
            .select('jobs_completed_count, is_verified, average_rating')
            .eq('id', contractorId)
            .single();

          if (pError) throw pError;
          setContractorStats(profile);

          const { data: revs, error: rError } = await supabase
            .from('reviews')
            .select('*')
            .eq('contractor_id', contractorId)
            .order('created_at', { ascending: false });

          if (rError) throw rError;

          if (revs && revs.length > 0) {
            const clientIds = [...new Set(revs.map((r: any) => r.client_id))];
            const { data: clients } = await supabase
              .from('client_profiles')
              .select('id, full_name')
              .in('id', clientIds);

            const joined = revs.map((rev: any) => ({
              ...rev,
              client: clients?.find((c: any) => c.id === rev.client_id) || { full_name: "Verified Client" }
            }));
            setReviews(joined);
          } else {
            setReviews([]);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, contractorId, supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white rounded-t-[28px] sm:rounded-[40px] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-10 duration-500">
        
        <div className="px-5 py-5 sm:px-8 sm:pt-8 sm:pb-6 border-b border-slate-100 bg-white">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-yellow-500 mb-1 sm:mb-2">
                Company Reviews
              </h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-black uppercase italic text-slate-900 tracking-tight">
                  {contractorName}
                </h2>
                {contractorStats?.is_verified && (
                  <BadgeCheck size={20} className="text-green-500 fill-green-50 shrink-0 sm:w-6 sm:h-6" />
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-3 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-all text-slate-400 hover:text-slate-900">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-lg shadow-slate-900/10">
              <Briefcase size={12} className="text-yellow-400 sm:w-[14px] sm:h-[14px]" />
              <span className="text-[9px] sm:text-[11px] font-black uppercase italic text-white tracking-widest">
                {loading ? "..." : contractorStats?.jobs_completed_count || 0} Jobs Done
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 bg-yellow-400 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-lg shadow-yellow-400/20">
              <Star size={12} className="text-black fill-black sm:w-[14px] sm:h-[14px]" />
              <span className="text-[9px] sm:text-[11px] font-black uppercase italic text-black tracking-widest">
                {loading ? "..." : (contractorStats?.average_rating?.toFixed(1) || "0.0")} Rating
              </span>
            </div>

            {!loading && !contractorStats?.is_verified && (
              <div className="relative" ref={tooltipRef}>
                <button 
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-red-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-red-100 transition-colors hover:bg-red-100 group"
                >
                  <ShieldAlert size={12} className="text-red-500 sm:w-[14px] sm:h-[14px]" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-red-600 tracking-widest">
                    Not Verified
                  </span>
                  <Info size={10} className="text-red-300 group-hover:text-red-500 transition-colors" />
                </button>

                {showTooltip && (
                  <div className="absolute bottom-full left-0 mb-3 w-48 sm:w-56 p-3 bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl z-[160] animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/10">
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-1">Verification Status</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-relaxed italic">
                      This company has not yet completed our identity and business documentation verification process.
                    </p>
                    <div className="absolute -bottom-1 left-6 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50/30">
          {loading ? (
            <>
              <ReviewSkeleton />
              <ReviewSkeleton />
              <ReviewSkeleton />
            </>
          ) : error ? (
            <div className="p-6 sm:p-8 bg-red-50 border-2 border-dashed border-red-100 rounded-[24px] sm:rounded-[32px] text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-2 sm:mb-3" size={28} />
              <p className="text-[10px] sm:text-xs font-black uppercase text-red-600 tracking-widest">Connection Error</p>
              <p className="text-[10px] sm:text-[11px] text-red-400 mt-1 sm:mt-2 italic">{error}</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-4 sm:p-5 rounded-[20px] sm:rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center text-yellow-400 text-xs sm:text-sm font-black italic shadow-inner">
                      {rev.client?.full_name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-[13px] font-black uppercase text-slate-900 leading-none mb-1 sm:mb-1.5">
                        {rev.client?.full_name || "Verified Client"}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-100 fill-slate-50"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Date</span>
                    <time className="text-[10px] sm:text-[11px] font-bold text-slate-500 tabular-nums">
                      {new Date(rev.created_at).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </time>
                  </div>
                </div>
                
                <div className="relative pl-1">
                  <span className="absolute -left-1 sm:-left-2 -top-1 sm:-top-2 text-2xl sm:text-4xl text-slate-50 font-serif opacity-50">"</span>
                  <p className="text-[12px] sm:text-[14px] font-medium text-slate-700 leading-relaxed italic relative z-10 pl-2">
                    {rev.comment}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 sm:py-24 bg-white rounded-[24px] sm:rounded-[32px] border-2 border-dashed border-slate-100">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageSquare size={24} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase italic text-[9px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em]">No reviews yet</p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 pb-8 sm:pb-6">
          <button 
            onClick={onClose}
            className="w-full py-4 sm:py-5 rounded-xl sm:rounded-[24px] bg-slate-900 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-yellow-400 hover:text-black transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
}