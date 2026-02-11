"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, X, Check, MessageSquare, LucideIcon, ChevronRight } from "lucide-react";
import ProjectCardLayout from "./ProjectCardLayout";

interface ActiveProjectCardProps {
  job: any;
  config: { icon: LucideIcon };
  index: number;
  onOpenRating: (job: any) => void;
  onRejectFinish: (jobId: string) => void;
  onOpenChat: (job: any) => void;
  onOpenCompany: (company: any) => void; 
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

export default function ActiveProjectCard({ 
  job, 
  config, 
  index, 
  onOpenRating, 
  onRejectFinish, 
  onOpenChat,
  onOpenCompany,
  searchQuery = "" 
}: ActiveProjectCardProps) {
  const router = useRouter();
  const isFinished = job.progress === 100;

  const highlightedTitle = (
    <HighlightText text={job.title || ""} highlight={searchQuery} />
  );

  return (
    <ProjectCardLayout
      index={index}
      title={highlightedTitle}
      contractorName={job.contractor_name}
      onContractorClick={() => {
        if (job.contractor) {
          onOpenCompany(job.contractor);
        }
      }}
      projectType={job.project_type}
      progress={job.progress}
      icon={config.icon}
      onClick={() => router.push(`/project_tracking/${job.id}`)}
    >
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenChat(job);
        }}
        className="flex items-center justify-center w-11 h-11 md:w-10 md:h-10 bg-white border border-slate-200 text-slate-400 hover:text-yellow-600 hover:border-yellow-400 rounded-xl transition-all shadow-sm active:scale-90 flex-shrink-0"
      >
        <MessageSquare size={18} />
      </button>

      {isFinished ? (
        <div className="flex gap-2 flex-1 md:flex-none overflow-visible">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/project_tracking/${job.id}`);
            }}
            className="w-11 h-11 md:w-10 md:h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-95 shadow-sm flex-shrink-0"
          >
            <ChevronRight size={18} />
          </button>

          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRejectFinish(job.id);
            }} 
            className="w-11 h-11 md:w-10 md:h-10 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-all active:scale-95 shadow-sm flex-shrink-0"
          >
            <X size={16} strokeWidth={3} />
          </button>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenRating(job);
            }} 
            className="flex-1 md:flex-none px-4 h-11 md:h-10 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Check size={16} strokeWidth={3} /> Confirm
          </button>
        </div>
      ) : (
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/project_tracking/${job.id}`);
          }}
          className="h-11 md:h-10 flex-1 md:flex-none flex items-center justify-center gap-3 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-md active:scale-95 group/btn"
        >
          Details <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      )}
    </ProjectCardLayout>
  );
}