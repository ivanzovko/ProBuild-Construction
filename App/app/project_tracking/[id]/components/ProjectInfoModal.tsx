"use client";

import { X, HardHat, MapPin, Star, Building2, Ruler } from "lucide-react";
import { Tooltip } from "@components/Tooltip";

interface ProjectInfoModalProps {
  job: any;
  loading?: boolean;
  onClose: () => void;
  onViewReviews?: () => void;
}

const InfoSkeleton = () => (
  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
    <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-20 bg-slate-200 rounded" />
      <div className="h-2 w-24 bg-slate-100 rounded" />
    </div>
  </div>
);

export default function ProjectInfoModal({ job, loading, onClose, onViewReviews }: ProjectInfoModalProps) {
  if (!job && !loading) return null;

  const infoItems = job ? [
    {
      label: "Project Type",
      value: job.project_type || "N/A",
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-50",
      tooltip: "The category of construction work"
    },
    {
      label: "Location",
      value: job.location || "Not specified",
      icon: MapPin,
      color: "text-red-500",
      bg: "bg-red-50",
      tooltip: "Physical address of the project"
    },
    {
      label: "Square Footage",
      value: job.sqm ? `${job.sqm} m²` : "N/A",
      icon: Ruler,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      tooltip: "Total area size in square meters"
    },
    {
      label: "Quality Level",
      value: job.quality || "Standard",
      icon: Star,
      color: "text-orange-500",
      bg: "bg-orange-50",
      tooltip: "The selected grade of materials and finish"
    }
  ] : [];

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-t-[40px] sm:rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl border-t sm:border border-white animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative">
        
        <Tooltip content="Close details">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10"
          >
            <X size={20} />
          </button>
        </Tooltip>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${loading ? 'bg-slate-200 animate-pulse' : 'bg-yellow-400'} rounded-2xl flex items-center justify-center shadow-lg shrink-0`}>
              {!loading && <HardHat size={24} className="text-slate-900 sm:w-[28px] sm:h-[28px]" />}
            </div>
            <div className="flex-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-2 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase italic leading-tight tracking-tighter pr-4">
                    Project Details&nbsp;
                  </h3>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                    Technical specifications
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            {loading ? (
              <>
                <InfoSkeleton />
                <InfoSkeleton />
                <InfoSkeleton />
                <InfoSkeleton />
              </>
            ) : (
              infoItems.map((item, i) => (
                <Tooltip key={i} content={item.tooltip}>
                  <div 
                    className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all duration-300 cursor-help"
                  >
                    <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                      <item.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-slate-900 uppercase italic leading-tight mb-0.5 tracking-tight pr-4">
                        {item.label}&nbsp;
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase truncate tracking-wider">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </Tooltip>
              ))
            )}

            <div className="sm:hidden mt-2 pt-4 border-t border-slate-100">
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-3 px-1">Contractor Info</p>
              {loading ? (
                <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <HardHat size={18} className="text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black text-white uppercase italic leading-tight pr-4 break-words">
                        {job?.company_profiles?.company_name || job?.company_name || "Official Contractor"}&nbsp;
                      </p>
                    </div>
                  </div>
                  {(job?.contractor_id || job?.company_id) && (
                    <Tooltip content="View contractor reviews and rating">
                      <button 
                        onClick={() => {
                          onClose(); 
                          if (onViewReviews) onViewReviews(); 
                        }}
                        className="flex items-center gap-2 bg-yellow-400 p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-yellow-400/20"
                      >
                        <Star size={14} className="fill-slate-950 text-slate-950" />
                        <span className="text-[10px] font-black uppercase text-slate-950 pr-1">Reviews</span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 pb-8 sm:pb-5">
          <button 
            onClick={onClose} 
            className="w-full py-4 bg-slate-900 text-yellow-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
          >
            Close Information
          </button>
        </div>
      </div>
    </div>
  );
}