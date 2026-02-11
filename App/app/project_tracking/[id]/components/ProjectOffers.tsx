"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

interface ProjectOffersProps {
  jobId: string;
}

export default function ProjectOffers({ jobId }: ProjectOffersProps) {
  const router = useRouter();

  useEffect(() => {
    router.push(`./${jobId}/estimate`);
  }, [jobId, router]);

  return (
    <div className="w-full min-h-[200px] md:min-h-[300px] bg-white md:bg-slate-50 border border-slate-100 md:border-slate-200 rounded-[24px] md:rounded-[32px] flex items-center justify-center p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-slate-100 md:bg-white rounded-2xl shadow-inner md:shadow-sm">
          <Clock className="text-slate-400 animate-spin" size={24} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase italic tracking-widest text-center">
            Redirecting to offers
          </span>
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}