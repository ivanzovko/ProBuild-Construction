"use client";

import { LucideIcon, HardHat, ChevronDown, ChevronUp, Info } from "lucide-react";
import { ReactNode, useState } from "react";

interface ProjectCardLayoutProps {
  index: number;
  title: ReactNode;
  contractorName?: string;
  onContractorClick?: () => void; // Dodano
  projectType: string;
  progress?: number;
  icon: LucideIcon;
  onClick?: () => void;
  children: React.ReactNode;
  customProgress?: React.ReactNode;
}

export default function ProjectCardLayout({
  index,
  title,
  contractorName,
  onContractorClick, // Dodano
  projectType,
  progress,
  icon: Icon,
  onClick,
  children,
  customProgress
}: ProjectCardLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFinished = progress === 100;

  const handleMobileHeaderClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`group bg-white rounded-xl border border-slate-200 hover:border-yellow-400 shadow-sm transition-all duration-300 w-full relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={(e) => {
        if (window.innerWidth >= 768 && onClick) {
          onClick();
        }
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
      
      <div className="flex flex-col md:flex-row md:items-center min-h-[85px] py-3 md:py-4 px-3 md:px-6">
        
        <div 
          className="flex items-center flex-1 cursor-pointer md:cursor-default"
          onClick={handleMobileHeaderClick}
        >
          <div className="w-[32px] md:w-[45px] flex-none flex items-center">
            <span className="text-[10px] md:text-[11px] font-black text-slate-500 italic group-hover:text-yellow-500 transition-colors">
              {index < 10 ? `0${index}` : index}
            </span>
          </div>

          <div className="flex-1 min-w-0 md:min-w-[250px] flex items-center gap-2 md:gap-4 md:pr-8">
            <div className="flex-none w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-white transition-all shadow-sm">
              <Icon size={18} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div className="flex flex-1 items-center justify-between gap-2">
              <h3 className="text-[13px] md:text-[15px] font-black text-slate-900 uppercase italic tracking-tight leading-tight group-hover:text-yellow-600 transition-colors py-1">
                {title}
              </h3>
              
              <div className="md:hidden p-1.5 text-slate-400">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
          </div>
        </div>

        <div className={`${isExpanded ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:items-center flex-none mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3 md:gap-0 animate-in fade-in slide-in-from-top-2 duration-300`}>
          
          <div className="flex flex-row items-center justify-between md:justify-start">
            <div className="hidden md:flex w-[130px] flex-none flex-col items-center justify-center border-l border-slate-100 px-4">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                Type
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase italic border border-slate-200/50">
                {projectType}
              </span>
            </div>

            {contractorName && (
              <div 
                className="w-auto md:w-[190px] flex-none flex flex-col md:flex-row items-start justify-center md:justify-start gap-1 md:gap-3 md:border-l md:border-slate-100 md:pl-6 cursor-pointer group/contractor"
                onClick={(e) => {
                  e.stopPropagation();
                  onContractorClick?.();
                }}
              >
                <HardHat size={16} className="shrink-0 hidden md:block text-yellow-600 group-hover/contractor:text-yellow-500 transition-colors" />
                <div className="flex flex-col justify-center items-start text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Contractor
                    </span>
                    <Info size={10} className="text-slate-300 mb-1" />
                  </div>
                  <span className="text-[14px] md:text-[13px] font-black text-slate-900 uppercase italic leading-tight group-hover/contractor:text-yellow-600 transition-colors underline decoration-slate-200 underline-offset-4">
                    {contractorName}
                  </span>
                </div>
              </div>
            )}

            {typeof progress !== 'undefined' && (
              <div className="md:hidden flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  Progress
                </span>
                <span className={`text-[14px] font-black italic ${isFinished ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {progress}%
                </span>
              </div>
            )}
          </div>

          {(typeof progress !== 'undefined' || customProgress) && (
            <div className="hidden md:block w-[260px] flex-none border-l border-slate-100 pl-6">
              {customProgress ? (
                <div className="h-full flex items-center">{customProgress}</div>
              ) : (
                <div className="w-full flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      Progress Status
                    </span>
                    <span className={`text-[12px] font-black italic ${isFinished ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                    <div 
                      className={`h-full transition-all duration-1000 ${isFinished ? 'bg-emerald-500' : 'bg-yellow-400'}`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative z-50 flex-none flex items-center justify-center md:justify-end gap-2 md:gap-3 md:ml-6 md:border-l md:border-slate-100 md:pl-6 pt-1 md:pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}