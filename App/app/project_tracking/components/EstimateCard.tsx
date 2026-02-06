"use client";

import { Trash2, LucideIcon, ArrowRight, Ruler, Home, Building2, Hammer, MapPin } from "lucide-react";
import Link from "next/link";

interface EstimateCardProps {
  job: {
    id: string;
    title: string; // Dodano
    project_type: string;
    sqm: number;
    estimated_price?: number;
  };
  config: {
    img: string;
    icon: LucideIcon;
  };
  onDelete: (id: string) => void;
}

export default function EstimateCard({ job, config, onDelete }: EstimateCardProps) {
  const Icon = config.icon;

  const getCategoryIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'house': return <Home size={10} />;
      case 'apartment': return <Building2 size={10} />;
      case 'renovation': return <Hammer size={10} />;
      default: return <MapPin size={10} />;
    }
  };
  
  return (
    <div className="group bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
      <div className="h-40 relative">
        <img src={config.img} className="w-full h-full object-cover" alt="Estimate" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
            <Icon size={18} className="text-slate-900" />
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onDelete(job.id);
            }} 
            className="p-2 bg-white/90 backdrop-blur text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 text-white rounded-md">
              {getCategoryIcon(job.project_type)}
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                {job.project_type}
              </span>
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending Proposal</span>
          </div>
          
          <h4 className="text-base font-black text-slate-900 uppercase italic leading-tight">
            {job.title}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-5">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <Ruler size={8} /> Size
            </p>
            <p className="text-xs font-bold text-slate-900">{job.sqm} m²</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Starting From</p>
            <p className="text-xs font-bold text-slate-900">{job.estimated_price?.toLocaleString()} €</p>
          </div>
        </div>

        <Link 
          href={`/project_tracking/${job.id}/estimate`}
          className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
        >
          View Detailed Offer <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}