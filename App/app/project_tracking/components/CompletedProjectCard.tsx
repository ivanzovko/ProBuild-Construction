"use client";

import { useRouter } from "next/navigation";
import { FileText, LucideIcon, CheckCircle2 } from "lucide-react";
import ProjectCardLayout from "./ProjectCardLayout";
import { Tooltip } from "@components/Tooltip";

interface CompletedProjectCardProps {
  job: any;
  config: {
    icon: LucideIcon;
  };
  index: number;
  onOpenCompany: (company: any) => void;
  searchQuery?: string;
}

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!text) return null;
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

export default function CompletedProjectCard({ 
  job, 
  config, 
  index,
  onOpenCompany,
  searchQuery = ""
}: CompletedProjectCardProps) {
  const router = useRouter();

  const handleNavigate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/project_tracking/${job.id}`);
  };

  const highlightedTitle = (
    <HighlightText text={job.title} highlight={searchQuery} />
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
      progress={100}
      icon={config.icon}
      onClick={handleNavigate}
      customProgress={
        <Tooltip content="This project is officially finished and archived">
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-1 animate-in fade-in slide-in-from-bottom-1 duration-500 cursor-help">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[13px] md:text-[15px] font-black uppercase italic tracking-[0.05em] text-emerald-500 leading-none">
                Completed
              </span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-8">
              Project Archived
            </span>
          </div>
        </Tooltip>
      }
    >
      <div className="flex flex-row items-center justify-between w-full md:hidden mb-4 px-1">
        <div className="flex flex-col items-start">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
            Status
          </span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={3} />
            <span className="text-[14px] font-black uppercase italic text-emerald-600">
              Completed
            </span>
          </div>
        </div>
      </div>

      <Tooltip content="View final reports and project history">
        <div 
          className="flex flex-col items-center gap-1 group/btn cursor-pointer" 
          onClick={handleNavigate}
        >
          <div className="w-11 h-11 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-white text-slate-900 border border-slate-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300 shadow-sm active:scale-90">
            <FileText size={18} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 group-hover/btn:text-emerald-600 transition-colors">
            Details
          </span>
        </div>
      </Tooltip>
    </ProjectCardLayout>
  );
}