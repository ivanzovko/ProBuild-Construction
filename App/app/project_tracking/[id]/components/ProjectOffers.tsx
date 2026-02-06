"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  HardHat, Clock, Star, Construction, 
  Gem, AlignLeft, Loader2
} from "lucide-react";

interface ProjectOffersProps {
  jobId: string;
}

function OffersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[24px] border-2 border-slate-100 p-4 pt-8 relative">
          <div className="absolute top-0 left-0 w-12 h-6 bg-slate-100 rounded-br-xl" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-2 bg-slate-100 rounded w-1/4" />
            </div>
          </div>
          <div className="h-12 bg-slate-50 rounded-xl mb-4" />
          <div className="flex gap-2 mb-4">
            <div className="h-10 bg-slate-100 rounded-xl flex-1" />
            <div className="h-10 bg-slate-100 rounded-xl flex-1" />
          </div>
          <div className="h-8 bg-slate-50 rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
}

export default function ProjectOffers({ jobId }: ProjectOffersProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('estimates')
          .select(`*, company_profiles (*)`)
          .eq('job_id', jobId)
          .order('base_price_average', { ascending: true });

        if (error) throw error;
        setOffers(data || []);
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [jobId, supabase]);

  if (loading) return <OffersSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
          <AlignLeft size={10} className="text-yellow-500" />
          Contractor Responses ({offers.length})
        </h2>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
          <Clock size={24} className="mx-auto text-slate-200 mb-3 animate-pulse" />
          <h3 className="font-black uppercase italic text-slate-400 text-sm">No offers yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer, index) => (
            <div key={offer.id} className={`group relative bg-white rounded-[24px] border-2 transition-all duration-500 ${offer.status === 'accepted' ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100'} hover:shadow-xl overflow-hidden`}>
              
              <div className="absolute top-0 left-0 bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-br-xl z-10 italic">
                #{String(index + 1).padStart(2, '0')}
              </div>

              <div className="p-3 pt-7 md:p-4 md:pt-8">
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                        {offer.company_profiles?.logo_url ? (
                          <img src={offer.company_profiles.logo_url} className="w-full h-full object-cover" alt="logo" />
                        ) : (
                          <HardHat className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-black uppercase italic text-xs md:text-sm text-slate-900 tracking-tight truncate">
                            {offer.company_profiles?.company_name}
                          </h3>
                          <div className="flex items-center gap-1 bg-slate-900 text-yellow-400 px-1.5 py-0.5 rounded text-[7px] font-black shrink-0">
                            <Star size={7} className="fill-yellow-400" />
                            {offer.company_profiles?.rating || 'NEW'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-2.5 h-2.5" />
                          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-tight">
                            {offer.delivery_days} Days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-2 md:p-3 border border-slate-100 mb-3 md:mb-4 h-auto md:h-14 min-h-[3rem] md:min-h-0 flex items-center">
                      <p className="text-[9px] md:text-[10px] font-bold italic text-slate-600 leading-tight md:leading-snug line-clamp-2">
                        {offer.description || "No additional notes provided."}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-white rounded-xl p-2 border border-slate-100 flex-1 shadow-sm">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Construction size={10} className="text-slate-400" />
                          <span className="text-[7px] font-black text-slate-400 uppercase">Std</span>
                        </div>
                        <p className="font-black text-slate-900 text-xs md:text-sm">€{offer.base_price_average?.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-400 rounded-xl p-2 border border-yellow-500 flex-1 shadow-md shadow-yellow-400/10">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Gem size={10} className="text-slate-900" />
                          <span className="text-[7px] font-black text-slate-900 uppercase">Prem</span>
                        </div>
                        <p className="font-black text-slate-900 text-xs md:text-sm">€{offer.base_price_premium?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`w-full py-2 rounded-lg font-black uppercase italic text-[8px] md:text-[9px] text-center flex items-center justify-center gap-2 ${
                    offer.status === 'accepted' ? 'bg-emerald-500 text-white shadow-md' : 
                    offer.status === 'rejected' ? 'bg-red-50 text-red-400 border border-red-100' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    <span className="tracking-widest">{offer.status || 'Pending Response'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}