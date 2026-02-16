"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  X, 
  Receipt, 
  Calendar, 
  Wallet, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  Loader2, 
  Tag 
} from "lucide-react";

export default function OfferModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchOffer() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('estimates')
        .select('*')
        .eq('job_id', jobId)
        .eq('contractor_id', session.user.id)
        .maybeSingle();

      setEstimate(data);
      setLoading(false);
    }
    fetchOffer();
  }, [jobId, supabase]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[24px] md:rounded-[32px] w-full max-w-xl shadow-2xl border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 md:p-5 bg-slate-950 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 md:gap-4 group cursor-default">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
              <Receipt className="w-[18px] h-[18px] md:w-5 md:h-5 text-slate-900 -rotate-3 group-hover:rotate-0 transition-all" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black uppercase italic tracking-tighter leading-none group-hover:translate-x-1 transition-transform text-white">Your Offer</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${estimate?.status === 'accepted' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                  {estimate?.status || 'Pending'}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 hover:rotate-90 transition-all duration-300 active:scale-90"
          >
            <X className="w-[18px] h-[18px] md:w-5 md:h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="animate-spin text-yellow-400" size={32} />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Loading...</p>
            </div>
          ) : estimate ? (
            <div className="animate-in slide-in-from-bottom-2 duration-400 space-y-4 md:space-y-6">
              
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="bg-slate-950 p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-slate-800 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                  <Tag className="absolute -right-2 -top-2 text-white/5 w-12 h-12 md:w-16 md:h-16 -rotate-12 group-hover:rotate-0 group-hover:text-yellow-400/10 transition-all duration-500" />
                  <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest block mb-1">Total Price</span>
                  <p className="text-xl md:text-2xl font-black text-yellow-400 italic leading-none">{Number(estimate.price).toLocaleString()} €</p>
                </div>
                
                <div className="bg-slate-900 p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-slate-800 hover:scale-[1.02] transition-all duration-300 group">
                  <span className="text-[8px] md:text-[9px] font-black text-white/60 uppercase tracking-widest block mb-1">Deadline</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs md:text-sm font-black text-white italic uppercase">
                      {estimate.deadline_date ? new Date(estimate.deadline_date).toLocaleDateString('en-GB') : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black flex items-center gap-3">
                  Details <div className="h-px bg-slate-200 flex-1" />
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-100 rounded-xl border border-slate-200 hover:scale-[1.05] hover:bg-slate-200 transition-all duration-300 group">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-black rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-600 transition-colors">
                      <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[7px] md:text-[8px] font-black uppercase text-black">Quality material level</p>
                      <p className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase italic leading-none">{estimate.quality_level || "Standard"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-100 rounded-xl border border-slate-200 hover:scale-[1.05] hover:bg-slate-200 transition-all duration-300 group">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-black rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                      <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[7px] md:text-[8px] font-black uppercase text-black">Payment method</p>
                      <p className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase italic leading-none">{estimate.payment_method || "Completion"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-slate-800 hover:scale-[1.01] transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-400" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white">Technical Notes</span>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed italic uppercase group-hover:text-white transition-colors">
                    {estimate.technical_notes || "No additional notes provided."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 flex flex-col items-center">
              <AlertCircle size={40} className="text-slate-200 mb-3" />
              <p className="text-black font-black uppercase tracking-widest text-[10px] italic">Offer not found.</p>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 pt-2 bg-white shrink-0">
          <button 
            onClick={onClose}
            className="group w-full py-3.5 md:py-4 bg-slate-950 text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-yellow-400 hover:text-slate-900 hover:scale-[1.03] active:scale-95 shadow-xl shadow-slate-950/20"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}