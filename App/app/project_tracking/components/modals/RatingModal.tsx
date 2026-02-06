"use client";

import { useState } from "react";
import { Star, X, Loader2, CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface RatingModalProps {
  job: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RatingModal({ job, onClose, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const finalContractorId = job.contractor_id || job.contractor?.id;

      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          client_rating: rating 
        })
        .eq('id', job.id);

      if (updateError) throw updateError;

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          job_id: job.id,
          client_id: user.id,
          contractor_id: finalContractorId,
          rating: rating,
          comment: comment
        });

      if (reviewError) throw reviewError;

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error.message || error);
      alert("Error: " + (error.message || "Failed to finalize project"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] md:rounded-[48px] w-full max-w-md overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 relative animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 md:top-8 md:right-8 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-10"
        >
          <X className="w-4 h-4 md:w-[18px] md:h-[18px]" />
        </button>

        {/* Header: Smanjen padding na mobitelu */}
        <div className="pt-10 pb-4 md:pt-12 md:pb-6 text-center">
          <div className="relative inline-flex mb-4 md:mb-6">
            <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full" />
            <div className="relative w-16 h-16 md:w-20 md:h-20 bg-emerald-500 text-white rounded-[24px] md:rounded-[28px] flex items-center justify-center shadow-lg rotate-3">
              <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tight px-6 md:px-8">
            Job Well Done!
          </h3>
          <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 md:mt-3">
            Rate your experience
          </p>
        </div>

        <div className="px-6 pb-8 md:px-10 md:pb-12">
          {/* Zvjezdice: size 32 na mobitelu, 38 na desktopu */}
          <div className="flex justify-center gap-2 md:gap-3 mb-6 md:mb-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)} 
                className="transition-all hover:scale-125 active:scale-90"
              >
                <Star 
                  className={`w-8 h-8 md:w-[38px] md:h-[38px] transition-colors duration-200 ${
                    star <= (hoverRating || rating) 
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_4px_10px_rgba(250,204,21,0.4)]" 
                      : "text-slate-100 fill-slate-100"
                  }`} 
                />
              </button>
            ))}
          </div>

          <div className="relative group mb-6 md:mb-8">
            <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors">
              <MessageSquare size={16} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about the service..."
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-[24px] md:rounded-[32px] py-4 md:py-5 pl-12 md:pl-14 pr-6 md:pr-8 text-[10px] md:text-[11px] font-bold uppercase placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 transition-all min-h-[100px] md:min-h-[140px] resize-none shadow-sm"
            />
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`w-full bg-slate-900 text-white px-6 py-4 md:px-8 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 group/btn ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 md:w-[18px] md:h-[18px] animate-spin" />
            ) : (
              <>
                Complete & Close Project
                <ArrowRight className="w-4 h-4 md:w-[18px] md:h-[18px] group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <p className="text-center mt-4 md:mt-6 text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            This will finalize payment and close the job
          </p>
        </div>
      </div>
    </div>
  );
}