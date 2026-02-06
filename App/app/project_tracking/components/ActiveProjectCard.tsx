"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, LucideIcon, MapPin, X, Check, MessageSquare, ExternalLink, Ruler } from "lucide-react";

interface ActiveProjectCardProps {
  job: {
    id: string;
    title: string;
    sqm: number;
    project_type: string;
    progress: number;
    contractor_name?: string;
    contractor_id?: string;
    documentation_urls?: string[];
    project_images?: string[];
  };
  config: {
    img: string;
    icon: LucideIcon;
  };
  onOpenRating: (job: any) => void;
  onRejectFinish: (jobId: string) => void;
  onOpenChat: (job: any) => void;
}

export default function ActiveProjectCard({ 
  job, 
  config, 
  onOpenRating,
  onRejectFinish,
  onOpenChat 
}: ActiveProjectCardProps) {
  const router = useRouter();
  const Icon = config.icon;
  const houseImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop";
  
  const isFinished = job.progress === 100;

  const handleNavigate = () => {
    router.push(`/project_tracking/${job.id}`);
  };

  return (
    <div className="group relative bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden max-w-4xl">
      <div className="flex flex-col sm:flex-row">
        
        <div 
          className="relative w-full sm:w-48 h-32 sm:h-auto overflow-hidden shrink-0 cursor-pointer"
          onClick={handleNavigate}
        >
          <img 
            src={houseImage} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            alt="Real Estate" 
          />
          <div className="absolute inset-0 bg-slate-900/10" />
          <div className="absolute top-3 left-3">
            <div className="w-8 h-11 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center shadow-md border border-white/20">
              <Icon size={18} className="text-slate-900" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div className="cursor-pointer flex-1" onClick={handleNavigate}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <MapPin size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">{job.project_type}</span>
              </div>
              
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                {job.title}
              </h3>

              {/* DODANO POLJE ZA KVADRATE */}
              <div className="flex items-center gap-1.5 mt-1.5 mb-2">
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                  <Ruler size={10} className="text-slate-500" />
                  <span className="text-[10px] font-black text-slate-600 uppercase italic">{job.sqm} m²</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Contractor:</span>
                  <span className="text-[10px] font-black text-yellow-600 uppercase italic">
                    {job.contractor_name || "Assigning..."}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={handleNavigate}
                className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm"
                title="View Details"
              >
                <ExternalLink size={16} />
              </button>
              <button 
                onClick={() => onOpenChat(job)}
                className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-yellow-400 rounded-xl transition-all shadow-sm"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:block">
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2 font-black uppercase italic tracking-tighter">
                <span className="text-[9px] tracking-widest text-slate-400">
                  {isFinished ? "Ready for review" : "Progress"}
                </span>
                <span className={`text-xs ${isFinished ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {job.progress}%
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isFinished ? 'bg-emerald-500' : 'bg-yellow-400'}`} 
                  style={{ width: `${job.progress}%` }} 
                />
              </div>
            </div>

            <div className="sm:hidden flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => onOpenChat(job)}
                  className="w-14 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl active:scale-95 transition-all"
                >
                  <MessageSquare size={18} />
                </button>
                <button 
                  onClick={handleNavigate}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase border border-slate-200 active:scale-95 transition-all"
                >
                  View Details
                  <ArrowRight size={16} />
                </button>
              </div>
              
              {isFinished && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => onRejectFinish(job.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase border border-red-100 active:scale-95 transition-all"
                  >
                    <X size={14} strokeWidth={3} />
                    Not Finished
                  </button>
                  <button 
                    onClick={() => onOpenRating(job)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95 transition-all"
                  >
                    <Check size={14} strokeWidth={3} />
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex p-5 sm:w-32 items-center justify-center border-l border-slate-50 bg-slate-50/30 group-hover:bg-slate-50 transition-colors duration-300">
          {isFinished ? (
            <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={() => onRejectFinish(job.id)}
                className="flex flex-col items-center gap-1 group/reject"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100 group-hover/reject:bg-red-500 group-hover/reject:text-white transition-all">
                  <X size={18} strokeWidth={3} />
                </div>
                <span className="text-[7px] font-black uppercase text-slate-400">Not Finished</span>
              </button>
              
              <button 
                onClick={() => onOpenRating(job)}
                className="flex flex-col items-center gap-1 group/rate"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md group-hover/rate:scale-110 transition-transform">
                  <Check size={18} strokeWidth={3} />
                </div>
                <span className="text-[7px] font-black uppercase text-slate-400">Confirm</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleNavigate}
              className="flex flex-col items-center gap-1 group/info"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-900 group-hover:bg-slate-900 group-hover:text-yellow-400 transition-all duration-300 shadow-md border border-slate-100 group-hover:border-slate-900">
                <ArrowRight size={20} strokeWidth={3} />
              </div>
              <span className="text-[8px] font-black uppercase text-slate-400 group-hover:text-slate-900 transition-colors">Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}