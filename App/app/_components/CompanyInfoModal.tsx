"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, ShieldCheck, Info, Phone, Hash, Clock, Star, User, CreditCard, ChevronRight, ShieldAlert, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import ReviewsModal from "../find_service/components/reviewsModal";

interface CompanyInfoModalProps {
  company: any;
  isOpen: boolean;
  onClose: () => void;
}

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <header className="relative bg-slate-900 p-5 md:p-6 pt-10 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
        <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-800 rounded-xl md:rounded-2xl shrink-0" />
        <div className="flex-1 w-full space-y-3">
          <div className="h-8 bg-slate-800 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-800 rounded-lg w-1/2" />
          <div className="flex gap-2">
            <div className="h-8 bg-slate-800 rounded-lg w-20" />
            <div className="h-8 bg-slate-800 rounded-lg w-20" />
          </div>
        </div>
      </div>
    </header>
    <div className="p-5 md:p-6 space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-20 bg-slate-50 rounded-[24px]" />
        </div>
      ))}
      <div className="h-14 bg-slate-100 rounded-[18px] w-full" />
    </div>
  </div>
);

export default function CompanyInfoModal({ isOpen, company, onClose }: CompanyInfoModalProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [openSections, setOpenSections] = useState({
    general: true,
    hours: false,
    about: false,
    coverage: false
  });

  if (!isOpen) return null;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const displayedCounties = company?.service_counties || [];

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar"
        >
          {!company ? (
            <SkeletonLoader />
          ) : (
            <>
              <header className="relative bg-slate-900 p-5 md:p-6 pt-10 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500 hover:text-white text-white rounded-xl transition-all z-20 active:scale-90"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                  <div className="flex items-center gap-4 md:block shrink-0">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-xl md:rounded-2xl border-2 md:border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase size={24} className="text-slate-200 md:hidden" />
                      )}
                      {(!company.logo_url) && <Briefcase size={36} className="text-slate-200 hidden md:block" />}
                    </div>

                    <div className="md:hidden min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-xl font-black uppercase italic tracking-tight leading-tight text-white">
                          {company.company_name}
                        </h2>
                        {company.is_verified ? (
                          <div className="relative">
                            <ShieldCheck 
                              className="text-green-400 shrink-0 cursor-help" 
                              size={18} 
                              onMouseEnter={() => setShowTooltip(true)}
                              onMouseLeave={() => setShowTooltip(false)}
                            />
                            <AnimatePresence>
                              {showTooltip && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded shadow-xl whitespace-nowrap z-50"
                                >
                                  Verified Professional
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-red-400 border border-red-500/30">
                            <ShieldAlert size={8} /> Not Verified
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-1 space-y-0.5">
                        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                          <MapPin size={10} className="text-yellow-400 shrink-0" />
                          <span className="truncate">{company.address}</span>
                        </p>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.15em] ml-3.5 italic">
                          {company.base_county}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => setShowReviews(true)}
                          className="flex items-center gap-1.5 bg-white/5 border border-white/10 py-1 px-2 rounded-lg"
                        >
                          <Star size={10} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] font-black">{company.average_rating?.toFixed(1) || "0.0"}</span>
                        </button>
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 py-1 px-2 rounded-lg">
                          <Briefcase size={10} className="text-white" />
                          <span className="text-[10px] font-black">{company.jobs_completed_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 w-full text-white">
                    <div className="hidden md:flex items-center gap-2 mb-1">
                      <h2 className="text-3xl font-black uppercase italic tracking-tight leading-none">
                        {company.company_name}
                      </h2>
                      {company.is_verified ? (
                        <div className="relative">
                          <ShieldCheck 
                            className="text-green-400 shrink-0 cursor-help" 
                            size={24} 
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          />
                          <AnimatePresence>
                            {showTooltip && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl whitespace-nowrap z-50"
                              >
                                Verified Professional
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-400 border border-red-500/30">
                          <ShieldAlert size={12} /> Not Verified
                        </div>
                      )}
                    </div>

                    <p className="hidden md:flex text-slate-400 text-xs font-bold uppercase tracking-widest items-center gap-1.5 mb-4">
                      <MapPin size={12} className="text-yellow-400 shrink-0" /> 
                      <span className="truncate">{company.address}, {company.base_county}</span>
                    </p>

                    <div className="hidden md:flex gap-3">
                      <button 
                        onClick={() => setShowReviews(true)}
                        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 p-2 pr-4 rounded-xl transition-all group"
                      >
                        <div className="bg-yellow-400 p-1.5 rounded-lg shadow-lg shadow-yellow-400/20">
                          <Star size={14} className="fill-black text-black" />
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1 group-hover:text-yellow-400">Rating</p>
                          <p className="text-sm font-black text-white leading-none">{company.average_rating?.toFixed(1) || "0.0"}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors ml-auto" />
                      </button>

                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 pr-4 rounded-xl">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                          <Briefcase size={14} className="text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Jobs</p>
                          <p className="text-sm font-black text-white leading-none">{company.jobs_completed_count || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="p-5 md:p-6">
                <div className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <button 
                      onClick={() => toggleSection('general')}
                      className="w-full flex items-center justify-between md:cursor-default"
                    >
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 text-left">
                        <span className="md:hidden text-yellow-500">1.</span> General Information <User size={14} className="text-yellow-500" />
                      </h4>
                      <motion.div animate={{ rotate: openSections.general ? 180 : 0 }} className="md:hidden">
                        <ChevronDown size={16} className="text-slate-400" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {(openSections.general || window.innerWidth >= 768) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden md:!h-auto md:!opacity-100"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-50 rounded-[24px] border border-slate-100 overflow-hidden">
                            <div className="flex items-center gap-4 p-3.5 border-b md:border-r border-slate-200/60">
                              <User size={18} className="text-yellow-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Owner</p>
                                <p className="text-sm md:text-base font-bold text-slate-900 break-words leading-tight">{company.owner_full_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 p-3.5 border-b border-slate-200/60">
                              <Phone size={18} className="text-yellow-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Phone</p>
                                <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">{company.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 p-3.5 md:border-r border-b md:border-b-0 border-slate-200/60">
                              <Hash size={18} className="text-yellow-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">PIN</p>
                                <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">{company.oib}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 p-3.5">
                              <CreditCard size={18} className="text-yellow-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">IBAN</p>
                                <p className="text-sm md:text-base font-bold text-slate-900 break-all leading-tight">{company.iban || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {company.working_hours && (
                    <div className="space-y-2.5 px-1">
                      <button 
                        onClick={() => toggleSection('hours')}
                        className="w-full flex items-center justify-between md:cursor-default"
                      >
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 text-left">
                          <span className="md:hidden text-yellow-500">2.</span> Working Hours <Clock size={14} className="text-yellow-500" />
                        </h4>
                        <motion.div animate={{ rotate: openSections.hours ? 180 : 0 }} className="md:hidden">
                          <ChevronDown size={16} className="text-slate-400" />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {(openSections.hours || window.innerWidth >= 768) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden md:!h-auto md:!opacity-100"
                          >
                            <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
                              {(Array.isArray(company.working_hours) ? company.working_hours : Object.entries(company.working_hours)).map((item: any, idx: number) => {
                                const day = (item.day || item[0]).substring(0, 3);
                                const info = item.day ? item : item[1];
                                return (
                                  <div key={idx} className="flex flex-col py-2 px-1 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center text-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase mb-0.5">{day}</span>
                                    {info.closed ? (
                                      <span className="text-[10px] font-black text-red-500 uppercase">OFF</span>
                                    ) : (
                                      <div className="flex flex-col text-[10px] font-black text-slate-900 leading-tight">
                                        <span>{info.open}</span>
                                        <span className="text-[8px] text-slate-300 -my-0.5">|</span>
                                        <span>{info.close}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="space-y-1.5 px-1">
                    <button 
                      onClick={() => toggleSection('about')}
                      className="w-full flex items-center justify-between md:cursor-default"
                    >
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 text-left">
                        <span className="md:hidden text-yellow-500">3.</span> About <Info size={14} className="text-yellow-500" />
                      </h4>
                      <motion.div animate={{ rotate: openSections.about ? 180 : 0 }} className="md:hidden">
                        <ChevronDown size={16} className="text-slate-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {(openSections.about || window.innerWidth >= 768) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden md:!h-auto md:!opacity-100"
                        >
                          <p className="text-slate-700 text-sm md:text-base leading-snug italic pt-1">
                            "{company.company_description || "No description provided."}"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2 px-1">
                    <button 
                      onClick={() => toggleSection('coverage')}
                      className="w-full flex items-center justify-between md:cursor-default"
                    >
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 text-left">
                        <span className="md:hidden text-yellow-500">4.</span> Service Coverage <MapPin size={14} className="text-yellow-500" />
                      </h4>
                      <motion.div animate={{ rotate: openSections.coverage ? 180 : 0 }} className="md:hidden">
                        <ChevronDown size={16} className="text-slate-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {(openSections.coverage || window.innerWidth >= 768) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden md:!h-auto md:!opacity-100"
                        >
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {displayedCounties.map((county: string) => (
                              <span key={county} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase italic border border-slate-200/50">
                                {county}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="mt-6 w-full bg-slate-900 text-white py-4 rounded-[18px] font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-xl"
                >
                  Close Profile
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <ReviewsModal 
        isOpen={showReviews} 
        onClose={() => setShowReviews(false)} 
        contractorId={company?.id}
        contractorName={company?.company_name}
        supabase={supabase}
      />
    </>
  );
}