"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ProjectTimelineProps {
  job: any;
  loading?: boolean;
}

function TimelineSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start animate-pulse">
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-100 p-5 sm:p-8 h-64" />
      </div>
      <div className="lg:col-span-8 xl:col-span-7">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-100 h-96" />
      </div>
    </div>
  );
}

export default function ProjectTimeline({ job, loading }: ProjectTimelineProps) {
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(true);

  if (loading) {
    return (
      <div className="max-w-[1400px] ml-0 mr-auto px-0 sm:px-4">
        <TimelineSkeleton />
      </div>
    );
  }

  const calculatedTotalValue = job?.project_items?.reduce((acc: number, item: any) => {
    return acc + (Number(item.price) || 0);
  }, 0) || 0;

  return (
    <div className="max-w-[1400px] ml-0 mr-auto animate-in fade-in slide-in-from-left-4 duration-500 px-0 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Sidebar / Overall Completion */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className="w-full flex items-center justify-between p-5 sm:p-8 text-left group"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Overall Completion</p>
              {isStatsOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isStatsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-5 sm:px-8 pb-5 sm:pb-8">
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4 mb-4 sm:mb-6">
                  <div className="flex flex-col">
                    <span className="text-4xl sm:text-6xl font-black text-slate-900 italic tracking-tighter leading-none">
                      {job?.progress || 0}%&nbsp;
                    </span>
                    <span className="text-[9px] sm:text-[11px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-100 w-fit mt-1 sm:mt-2">
                      Live Status
                    </span>
                  </div>

                  <div className="flex flex-col items-end sm:items-start sm:pt-6 sm:border-t sm:border-slate-100 w-fit sm:w-full">
                    <div className="flex items-center gap-2 sm:gap-4 sm:bg-slate-50 sm:p-4 sm:rounded-2xl sm:border sm:border-slate-100">
                      <div className="hidden sm:block p-2.5 bg-yellow-400 rounded-xl text-slate-900 shadow-sm">
                        <TrendingUp size={22} />
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Value</p>
                        <p className="text-lg sm:text-xl font-black text-slate-900 italic leading-none">
                          {calculatedTotalValue.toLocaleString()} €&nbsp;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-4 sm:h-6 bg-slate-100 rounded-full overflow-hidden p-0.5 sm:p-1 border border-slate-200 relative">
                  <div 
                    className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(15,23,42,0.2)] relative z-10"
                    style={{ width: `${job?.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content / Construction Log */}
        <div className="lg:col-span-8 xl:col-span-7">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => setIsLogOpen(!isLogOpen)}
              className="w-full p-5 sm:p-8 flex justify-between items-center bg-white text-left"
            >
              <p className="text-[10px] sm:text-[12px] font-black text-slate-900 uppercase tracking-widest italic border-b-2 pb-1 sm:pb-2 border-yellow-400 w-fit">
                Construction Log
              </p>
              {isLogOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isLogOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-4 sm:p-8 pt-0 space-y-2 sm:space-y-3">
                {job?.project_items && job.project_items.length > 0 ? (
                  job.project_items
                    .slice()
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between p-3 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl group hover:bg-white transition-all gap-3 overflow-visible">
                        <div className="flex items-start gap-3 sm:gap-5 min-w-0">
                          <span className="hidden sm:block text-[11px] font-black text-slate-300 group-hover:text-yellow-500 transition-colors w-4 text-center mt-2">
                            {idx + 1}
                          </span>
                          
                          <div className="flex items-start gap-2 sm:gap-4 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm mt-0.5">
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                            </div>
                            <div className="flex flex-col min-w-0 py-0.5">
                              <span className="text-[11px] sm:text-[13px] font-black uppercase text-slate-800 tracking-tight leading-snug mb-1 break-words pr-2">
                                {item.title}&nbsp;
                              </span>
                              {item.date && (
                                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">
                                  {new Date(item.date).toLocaleDateString('en-GB')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <span className="text-[11px] sm:text-[14px] font-black text-slate-900 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-slate-100 shadow-sm shrink-0 self-start italic">
                          {Number(item.price).toLocaleString()} €&nbsp;
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12 sm:py-20 bg-slate-50 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 mb-8">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">No project items added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}