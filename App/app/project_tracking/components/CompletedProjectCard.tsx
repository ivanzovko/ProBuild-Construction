"use client";

import { FileText, CheckCircle2, Ruler, Home, Building2, Hammer, MapPin } from "lucide-react";
import Link from "next/link";

interface CompletedProjectCardProps {
  job: {
    id: string;
    title: string;
    sqm: number;
    project_type: string;
    created_at: string;
  };
  config: {
    img: string;
  };
}

export default function CompletedProjectCard({ job, config }: CompletedProjectCardProps) {
  const houseImage = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop";

  const getCategoryIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'house': return <Home size={10} />;
      case 'apartment': return <Building2 size={10} />;
      case 'renovation': return <Hammer size={10} />;
      default: return <MapPin size={10} />;
    }
  };

  return (
    <Link 
      href={`/project_tracking/${job.id}`}
      className="group relative block bg-slate-50/50 rounded-[20px] sm:rounded-[24px] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden max-w-4xl"
    >
      <div className="flex flex-col sm:flex-row">
        
        <div className="relative w-full sm:w-48 h-28 sm:h-auto overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700">
          <img 
            src={houseImage} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            alt="Completed Project" 
          />
          <div className="absolute inset-0 bg-slate-900/20" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <CheckCircle2 className="text-white" size={24} />
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-7 flex flex-col justify-center bg-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500 text-white rounded-md">
                  {getCategoryIcon(job.project_type)}
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                    {job.project_type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <CheckCircle2 size={10} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Archive</span>
                </div>
              </div>

              <h3 className="text-sm sm:text-lg font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                {job.title}
              </h3>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  <Ruler size={10} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase italic">{job.sqm} m²</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  Completed: {new Date(job.created_at).toLocaleDateString('hr-HR')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 sm:mt-4 flex items-center gap-2 sm:gap-3">
            <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-100 rounded-full shrink-0">
              <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tighter">Certified Finish</span>
            </div>
            
            <div className="sm:hidden flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full">
              <FileText size={12} />
              <span className="text-[10px] font-black uppercase tracking-tight">View Archive</span>
            </div>

            <div className="h-px flex-1 bg-slate-100" />
          </div>
        </div>

        <div className="hidden sm:flex p-5 sm:w-24 items-center justify-center border-l border-slate-50 bg-slate-50/30 group-hover:bg-emerald-500 transition-colors duration-300">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-900 group-hover:text-emerald-600 transition-all duration-300 shadow-md">
              <FileText size={20} strokeWidth={2} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white transition-colors">Details</span>
          </div>
        </div>
      </div>
    </Link>
  );
}