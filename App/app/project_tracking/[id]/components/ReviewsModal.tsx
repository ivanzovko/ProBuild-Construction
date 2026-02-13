"use client";

import { useState, useEffect } from "react";
import { 
  Star, Loader2, AlertTriangle, 
  MessageSquare, X, BadgeCheck, Briefcase,
  ShieldAlert
} from "lucide-react";
import { Tooltip } from "@components/Tooltip";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractorName: string;
  contractorId: string;
  supabase: any;
}

const ReviewSkeleton = () => (
  <div className="bg-white rounded-[20px] border border-slate-200/60 shadow-sm overflow-hidden animate-pulse">
    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-2 w-16 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 w-8 bg-slate-100 rounded ml-auto" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </div>
    </div>
    <div className="px-4 py-4 space-y-2">
      <div className="h-3 w-full bg-slate-100 rounded" />
      <div className="h-3 w-[80%] bg-slate-100 rounded" />
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
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contractorId) {
      const fetchReviewsAndStats = async () => {
        setLoading(true);
        setDebugError(null);
        
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('company_profiles')
            .select('jobs_completed_count, is_verified')
            .eq('id', contractorId)
            .single();

          if (profileError) throw profileError;
          setContractorStats(profileData);

          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('contractor_id', contractorId)
            .order('created_at', { ascending: false });

          if (reviewsError) throw reviewsError;

          if (reviewsData && reviewsData.length > 0) {
            const clientIds = [...new Set(reviewsData.map((r: any) => r.client_id))];
            const { data: profilesData, error: profilesError } = await supabase
              .from('client_profiles')
              .select('id, full_name')
              .in('id', clientIds);

            if (profilesError) {
              setReviews(reviewsData);
            } else {
              const joinedData = reviewsData.map((rev: any) => ({
                ...rev,
                client_profiles: profilesData?.find((p: any) => p.id === rev.client_id) || { full_name: "Verified Client" }
              }));
              setReviews(joinedData);
            }
          } else {
            setReviews([]);
          }
        } catch (err: any) {
          setDebugError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchReviewsAndStats();
    }
  }, [isOpen, contractorId, supabase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white rounded-t-[32px] sm:rounded-[24px] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
        
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between bg-white">
          <div className="flex-1 overflow-visible">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500 mb-2">
              Contractor Profile
            </h3>
            
            <div className="flex flex-col gap-3 overflow-visible">
              <div className="flex items-center gap-2 flex-wrap overflow-visible">
                <p className="text-[22px] font-black uppercase italic text-slate-950 tracking-tight leading-tight pr-4 w-fit">
                  {contractorName}
                </p>
                {contractorStats?.is_verified && (
                  <Tooltip content="Identity and business credentials verified">
                    <BadgeCheck size={24} className="text-blue-500 fill-blue-50 shrink-0 cursor-help" />
                  </Tooltip>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Tooltip content="Successful projects completed on this platform">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg shadow-md shrink-0 cursor-help">
                    <Briefcase size={12} className="text-yellow-400 shrink-0" />
                    <span className="text-[10px] font-bold uppercase italic text-white tracking-tight leading-none">
                      {loading ? "..." : contractorStats?.jobs_completed_count || 0} Jobs Completed
                    </span>
                  </div>
                </Tooltip>

                {!loading && !contractorStats?.is_verified && (
                  <Tooltip content="This contractor has not yet completed the verification process">
                    <div className="flex items-center gap-1 bg-red-50 px-2 py-1.5 rounded-lg border border-red-100 shrink-0 cursor-help">
                      <ShieldAlert size={12} className="text-red-500 shrink-0" />
                      <span className="text-[9px] font-bold uppercase text-red-600 tracking-tight leading-none">
                        Not Verified
                      </span>
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 -mr-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-950 shrink-0">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {loading ? (
            <>
              <ReviewSkeleton />
              <ReviewSkeleton />
              <ReviewSkeleton />
            </>
          ) : debugError ? (
            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-2" size={24} />
              <p className="text-[11px] font-bold uppercase text-red-600">Error fetching data</p>
              <p className="text-[11px] text-red-500 mt-1 italic leading-tight">{debugError}</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-[20px] border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold">
                      {rev.client_profiles?.full_name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase text-slate-950 leading-none mb-1">
                        {rev.client_profiles?.full_name || "Verified Client"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Tooltip content={`Rated ${rev.rating.toFixed(1)} out of 5 stars`}>
                          <div className="flex cursor-help">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={11} className={i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                            ))}
                          </div>
                        </Tooltip>
                        <span className="text-[10px] font-bold text-slate-950 bg-yellow-400/20 px-1.5 py-0.5 rounded ml-1">
                          {rev.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Posted</span>
                    <time className="text-[13px] font-bold text-slate-950 leading-none">
                      {new Date(rev.created_at).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </time>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-white">
                  <p className="text-[14px] font-medium text-slate-800 leading-snug italic">
                    "{rev.comment}"
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <MessageSquare size={44} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold uppercase italic text-[11px] tracking-widest">No reviews available yet</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 pb-8 sm:pb-4">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-slate-950 text-white text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-yellow-500 hover:text-slate-950 transition-all shadow-xl active:scale-[0.96]"
          >
            Close Reviews
          </button>
        </div>
      </div>
    </div>
  );
}