"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";

interface ProjectOffersProps {
  jobId: string;
  isContractor?: boolean; // DODANO: Sada TS više neće javljati grešku
}

// SKELETON FUNKCIJA (Tvoje pravilo: Uvijek dodaj skeleton)
function OffersSkeleton() {
  return (
    <div className="w-full min-h-[300px] bg-white border-2 border-slate-100 rounded-[32px] flex items-center justify-center p-6 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
        <div className="h-4 w-32 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

export default function ProjectOffers({ jobId, isContractor }: ProjectOffersProps) {
  const router = useRouter();

  useEffect(() => {
    // Mentalni model: Automatski prebacujemo korisnika na detaljnu procjenu/ponudu
    router.push(`./${jobId}/estimate`);
  }, [jobId, router]);

  return (
    <div className="w-full min-h-[200px] md:min-h-[300px] bg-white md:bg-slate-50 border border-slate-100 md:border-slate-200 rounded-[24px] md:rounded-[32px] flex items-center justify-center p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-slate-100 md:bg-white rounded-2xl shadow-inner md:shadow-sm">
          {/* UX: Loader2 sa spin animacijom daje bolji feedback od statične ikone */}
          <Loader2 className="text-yellow-400 animate-spin" size={24} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase italic tracking-widest text-center">
            {isContractor ? "Opening Contractor Panel..." : "Redirecting to offers..."}
          </span>
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}