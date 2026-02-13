"use client";

import { Trash2, Inbox, ArrowRight, Home, Building2, Hammer, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectCardLayout from "./ProjectCardLayout";
import { Tooltip } from "@components/Tooltip";

interface EstimateCardProps {
  job: {
    id: string;
    title: string;
    project_type: string;
    sqm: number;
    estimated_price?: number;
    estimates_count?: number;
  };
  index: number;
  onDelete: (id: string) => void;
  searchQuery?: string;
}

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="text-yellow-400 underline decoration-yellow-400/30 underline-offset-2">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default function EstimateCard({ job, index, onDelete, searchQuery = "" }: EstimateCardProps) {
  const router = useRouter();
  const isPending = !job.estimates_count || job.estimates_count === 0;

  const handleNavigate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/project_tracking/${job.id}/estimate`);
  };

  const getCategoryIcon = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("renov")) return Hammer;
    if (t.includes("apartman") || t.includes("stan") || t.includes("apartment")) return Building2;
    if (t.includes("kuca") || t.includes("kuća") || t.includes("house")) return Home;
    return MapPin;
  };

  return (
    <ProjectCardLayout
      index={index}
      title={<HighlightText text={job.title} highlight={searchQuery} />}
      projectType={job.project_type}
      icon={getCategoryIcon(job.project_type)}
      onClick={handleNavigate}
    >
      <div className="flex flex-col md:flex-row flex-1 w-full">
        
        <div className="flex flex-row items-center justify-between md:hidden mb-5 px-1">
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Starting Price
            </span>
            <span className="text-[16px] font-black text-slate-900 italic">
              {job.estimated_price?.toLocaleString() || 0} €
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Proposals
            </span>
            <Tooltip content={isPending ? "Waiting for contractors to send offers" : `You have ${job.estimates_count} active offers`}>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${isPending ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                <Inbox size={12} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase">
                  {job.estimates_count || 0} {job.estimates_count === 1 ? 'Offer' : 'Offers'}
                </span>
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="hidden md:flex w-[180px] flex-none flex flex-col justify-center border-l border-slate-100 pl-6">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
            Starting Price
          </span>
          <span className="text-[15px] font-black text-slate-900 italic">
            {job.estimated_price?.toLocaleString() || 0} €
          </span>
        </div>

        <div className="hidden md:flex w-[180px] flex-none border-l border-slate-100 pl-6 flex-col justify-center">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
            Proposals
          </span>
          <Tooltip content={isPending ? "Waiting for contractors to send offers" : `You have ${job.estimates_count} active offers`}>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md w-fit border ${isPending ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <Inbox size={12} strokeWidth={3} />
              <span className="text-[9px] font-black uppercase">
                {job.estimates_count || 0} {job.estimates_count === 1 ? 'Offer' : 'Offers'}
              </span>
            </div>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto md:ml-6 md:border-l md:border-slate-100 md:pl-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <Tooltip content="Permanently delete this project request">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(job.id);
              }} 
              className="group/delete p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl active:scale-90 border border-red-100 shadow-sm flex-shrink-0"
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>

          <Tooltip content={isPending ? "View project details" : "Review received offers"}>
            <button
              onClick={handleNavigate}
              className="h-11 flex-1 md:flex-none px-5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all flex items-center justify-center md:justify-start gap-2 shadow-md"
            >
              <span className="truncate">{isPending ? 'View' : 'Details'}</span>
              <ArrowRight size={14} className="flex-shrink-0" />
            </button>
          </Tooltip>
        </div>
      </div>
    </ProjectCardLayout>
  );
}