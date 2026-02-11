"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Maximize2, Layers, 
  Gavel, TrendingUp, Info,
  CalendarDays, ArrowLeft,
  Clock, CheckCircle2, XCircle, Eye
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import TenderOfferForm from "./TenderOfferForm";

interface TenderDetailsProps {
  selectedTender: any;
  setSelectedTender: (tender: any) => void;
  onFormStatusChange?: (isDirty: boolean) => void; // NOVO: Callback za status forme
}

export default function TenderDetails({ selectedTender, setSelectedTender, onFormStatusChange }: TenderDetailsProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [isViewingOffer, setIsViewingOffer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingOffer, setExistingOffer] = useState<any>(null);

  // NOVO: Svaki put kad se promijeni isCreatingOffer, javi roditelju
  useEffect(() => {
    if (onFormStatusChange) {
      onFormStatusChange(isCreatingOffer);
    }
  }, [isCreatingOffer, onFormStatusChange]);

  useEffect(() => {
    setIsCreatingOffer(false);
    setIsViewingOffer(false);
  }, [selectedTender?.id]);

  useEffect(() => {
    if (!selectedTender?.id) return;
    
    const initFetch = async () => {
      setIsLoading(true);
      await checkExistingOffer();
      setIsLoading(false);
    };

    initFetch();
  }, [selectedTender?.id]);

  const checkExistingOffer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('estimates')
      .select('*')
      .eq('job_id', selectedTender.id)
      .eq('contractor_id', user.id)
      .maybeSingle();

    setExistingOffer(data || null);
  };

  if (!selectedTender) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300">
        <Gavel className="mb-4 opacity-20 w-16 h-16" />
        <p className="uppercase text-[12px] font-black tracking-[0.5em]">Select project</p>
      </div>
    );
  }

  if (isCreatingOffer || isViewingOffer) {
    return (
      <TenderOfferForm 
        selectedTender={selectedTender} 
        onClose={() => {
          setIsCreatingOffer(false);
          setIsViewingOffer(false);
        }}
        onSuccess={async () => {
          setIsCreatingOffer(false);
          setIsViewingOffer(false);
          await checkExistingOffer();
        }}
      />
    );
  }

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col bg-white"
    >
      <div className="sticky top-[50px] md:top-0 z-30 w-full bg-[#0a192f] px-6 py-4 flex justify-between items-center shadow-xl border-b border-yellow-500/20">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => setSelectedTender(null)}
            className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-yellow-400 hover:text-[#0a192f] transition-all border border-white/20 shadow-lg shrink-0"
          >
            <ArrowLeft strokeWidth={3} className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="shrink-0 bg-yellow-400 text-[#0a192f] text-[10px] font-black px-2 py-1 rounded uppercase italic tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.3)]">
              {selectedTender.project_type}
            </span>
            <h2 className="text-lg md:text-3xl font-black text-yellow-400 uppercase italic tracking-tighter leading-tight">
              {selectedTender.title || "Untitled Project"}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 pt-[60px] md:pt-6 space-y-5">
          {isLoading ? (
            <div className="w-full h-24 bg-slate-100 rounded-[2rem] animate-pulse" />
          ) : existingOffer && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className={`${
                existingOffer.status === 'rejected' ? 'bg-red-50 border-red-500/20' : 'bg-emerald-50 border-emerald-500/20'
              } border-2 p-4 md:p-5 rounded-[2rem] flex flex-wrap sm:flex-nowrap items-center gap-4`}
            >
              <div className={`${existingOffer.status === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'} text-white p-3 rounded-2xl shadow-lg shrink-0`}>
                {existingOffer.status === 'rejected' ? <XCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${existingOffer.status === 'rejected' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {existingOffer.status === 'rejected' ? 'Offer Status' : 'Active Proposal'}
                  </span>
                </div>
                <h4 className="text-sm md:text-lg font-black text-[#0a192f] uppercase italic leading-tight tracking-tight">
                  {existingOffer.status === 'rejected' ? 'Your offer was not selected' : `Submitted: `}
                  <span className={`${existingOffer.status === 'rejected' ? 'text-red-600' : 'text-emerald-600'} font-black ml-1 whitespace-nowrap`}>
                    {existingOffer.price}€
                  </span>
                </h4>
              </div>

              <button 
                onClick={() => setIsViewingOffer(true)}
                className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 ${
                  existingOffer.status === 'rejected' 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                } shadow-md`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Offer</span>
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex flex-col relative overflow-hidden group">
              <div className="flex-1 flex flex-col justify-center relative z-20">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Budget Range</span>
                <div className="text-4xl md:text-5xl font-black text-[#0a192f] italic tracking-tighter leading-none">
                  {selectedTender.estimated_price?.toLocaleString()} €
                </div>
              </div>
              <TrendingUp className="absolute right-0 bottom-0 text-slate-200/40 w-20 h-20 md:w-24 md:h-24 -rotate-12 translate-x-2 translate-y-2 z-10" />
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-3">
              {[
                { icon: MapPin, label: "Location", value: selectedTender.location },
                { icon: Maximize2, label: "Area", value: `${selectedTender.sqm} m²` },
                { icon: Layers, label: "Quality", value: selectedTender.quality },
                { icon: CalendarDays, label: "Published", value: new Date(selectedTender.created_at).toLocaleDateString('en-GB') }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#0a192f] shadow-sm shrink-0">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</span>
                    <span className="text-[11px] md:text-[14px] font-black text-slate-800 uppercase italic leading-tight break-words">
                      {stat.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 h-auto">
            <div className="flex items-center gap-2 mb-3">
               <Info className="text-[#0a192f] w-4 h-4" />
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Technical Specifications</h4>
            </div>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              {selectedTender.description || "No description provided."}
            </p>
          </div>

          {!isLoading && !existingOffer && (
            <div className="flex justify-center w-full px-4 mt-4 pb-10">
              <div className="relative group w-full max-w-xs transition-transform duration-300 hover:scale-105">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <button 
                  onClick={() => setIsCreatingOffer(true)}
                  className="relative w-full bg-[#0a192f] text-white p-1 rounded-full flex items-center justify-between overflow-hidden border border-white/10 shadow-xl active:scale-95 transition-all"
                >
                  <div className="pl-6 py-2 text-left relative z-10">
                    <h4 className="text-base font-black uppercase italic leading-none tracking-tight">
                      Create your <span className="text-yellow-400">offer</span>
                    </h4>
                  </div>
                  <div className="relative flex items-center justify-center mr-1">
                    <div className="bg-yellow-400 text-[#0a192f] h-10 w-10 rounded-full flex items-center justify-center shadow-inner relative z-10 transition-transform duration-300 group-hover:rotate-12">
                      <Gavel strokeWidth={2.5} className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}