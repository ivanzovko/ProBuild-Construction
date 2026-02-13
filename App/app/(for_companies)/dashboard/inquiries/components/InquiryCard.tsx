"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Trash2, Pin, PinOff, Check, ArrowRight, ChevronDown } from 'lucide-react';
import { Tooltip } from "@components/Tooltip";

interface InquiryCardProps {
  inquiry: any;
  index: number;
  activeTab: 'unanswered' | 'answered';
  togglePin: (e: any, id: string, pinned: boolean) => void;
  setDeleteId: (id: string | null) => void;
  handleViewDetails: (inquiry: any) => void;
  searchQuery: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;

  const cleanHighlight = highlight.trim();
  const parts = text.split(new RegExp(`(${cleanHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === cleanHighlight.toLowerCase() ? (
          <mark key={i} className="bg-transparent text-yellow-500 font-bold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const InquiryCard = ({ 
  inquiry, 
  index, 
  activeTab, 
  togglePin, 
  setDeleteId, 
  handleViewDetails,
  searchQuery,
  isExpanded,
  onToggle
}: InquiryCardProps) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div className={`bg-white rounded-[24px] md:rounded-[32px] border transition-all duration-500 relative group ${
      inquiry.is_pinned 
        ? 'border-yellow-500/50 bg-yellow-50/10' 
        : 'border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
    } ${isExpanded ? 'shadow-xl ring-2 ring-slate-950/5 border-slate-200 scale-[1.01]' : 'active:scale-[0.99]'}`}>
      
      <div className="relative">
        <Tooltip content="Permanent Delete" side="top">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setDeleteId(inquiry.id); 
            }} 
            onMouseEnter={() => setHoveredAction('delete')}
            onMouseLeave={() => setHoveredAction(null)}
            className="hidden md:flex absolute -top-3 -right-3 p-3 bg-white text-slate-400 border-2 border-slate-100 rounded-2xl z-20 shadow-sm 
                       hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-110 hover:shadow-lg hover:shadow-red-200 
                       transition-all duration-300 active:scale-95 lg:opacity-0 lg:group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </Tooltip>
      </div>

      <div 
        onClick={onToggle}
        className="flex items-center p-4 md:p-5 gap-3 cursor-pointer active:bg-slate-50 transition-colors"
      >
        <span className="text-[10px] md:text-[11px] font-black text-slate-400 shrink-0">
          {String(index + 1).padStart(2, '0')}.
        </span>
        
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <h3 className="text-[14px] md:text-[17px] font-black text-slate-950 uppercase italic leading-none break-words group-hover:text-yellow-600 transition-colors">
            <HighlightedText text={inquiry.title || "New Project Inquiry"} highlight={searchQuery} />
          </h3>

          <div className="flex items-center shrink-0">
            {!inquiry.is_answered ? (
              !inquiry.is_read ? (
                <span className="bg-yellow-400 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">New</span>
              ) : (
                <span className="bg-green-100 text-green-600 text-[9px] font-black uppercase px-2 py-0.5 rounded">Read</span>
              )
            ) : (
              <div className="bg-green-500 text-white p-0.5 rounded">
                <Check size={10} strokeWidth={4} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Tooltip content={inquiry.is_pinned ? 'Unpin from top' : 'Pin to top'} side="top">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(e, inquiry.id, inquiry.is_pinned);
                }}
                onMouseEnter={() => setHoveredAction('pin')}
                onMouseLeave={() => setHoveredAction(null)}
                className={`p-2.5 rounded-xl border-2 transition-all duration-300 shadow-sm ${
                  inquiry.is_pinned 
                    ? 'text-yellow-700 bg-yellow-400 border-yellow-500 scale-105' 
                    : 'text-slate-400 bg-white border-slate-200 hover:border-yellow-400 hover:text-yellow-500 hover:scale-110'
                }`}
              >
                {inquiry.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
              </button>
            </Tooltip>
          </div>
          
          <ChevronDown size={20} className={`text-slate-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-slate-950' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-5 pt-0 md:pt-0">
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                <div className="flex-1 space-y-3 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50/50 p-3 rounded-xl md:rounded-2xl border border-slate-200 hover:border-yellow-400/50 hover:bg-white hover:shadow-sm transition-all duration-300 flex-1 min-h-[48px] md:min-h-[52px] group/item">
                        <Mail size={16} className="text-yellow-500 shrink-0 group-hover/item:scale-110 transition-transform" />
                        <span className="text-[12px] md:text-[13px] font-black break-all italic leading-tight">
                          {inquiry.sender_email}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-700 bg-slate-50/50 p-3 rounded-xl md:rounded-2xl border border-slate-200 hover:border-yellow-400/50 hover:bg-white hover:shadow-sm transition-all duration-300 flex-1 min-h-[48px] md:min-h-[52px] group/item">
                        <Phone size={16} className="text-yellow-500 shrink-0 group-hover/item:scale-110 transition-transform" />
                        <span className="text-[12px] md:text-[13px] font-black break-all italic leading-tight">{inquiry.sender_phone}</span>
                      </div>
                    </div>

                    <div className="flex flex-row items-stretch gap-1.5 bg-slate-100/80 p-1.5 rounded-[20px] md:rounded-[24px] border border-slate-200 transition-all h-full">
                      <div className="flex-1 flex flex-col items-start justify-center bg-white/80 rounded-xl py-2 px-4 w-full text-left border border-transparent">
                        <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-0.5 tracking-widest block">
                          Received
                        </span>
                        <div className="flex items-center justify-start gap-1.5 text-[12px] md:text-[13px] font-black text-slate-950 leading-none tracking-tighter">
                          <span>{new Date(inquiry.created_at).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-slate-500">{new Date(inquiry.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {activeTab === 'answered' && inquiry.answered_at && (
                        <div className="flex-1 flex flex-col items-start justify-center bg-yellow-400/10 rounded-xl py-2 px-4 w-full border border-yellow-500/5 text-left">
                          <span className="text-[10px] md:text-[11px] font-black uppercase text-yellow-700 mb-0.5 tracking-widest block">
                            Answered
                          </span>
                          <div className="flex items-center justify-start gap-1.5 text-[12px] md:text-[13px] font-black text-yellow-800 leading-none tracking-tighter">
                            <span>{new Date(inquiry.answered_at).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                            <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                            <span className="opacity-70">{new Date(inquiry.answered_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-1 py-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Sender: <span className="text-slate-900 italic">{inquiry.sender_name}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 w-full lg:w-auto flex gap-2 mt-4 lg:mt-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleViewDetails(inquiry); }} 
                    className="flex-1 lg:w-auto bg-slate-950 text-white px-8 py-4 rounded-2xl 
                               hover:bg-yellow-400 hover:text-black hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-200/50 
                               transition-all duration-300 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest active:scale-95"
                  >
                    {activeTab === 'unanswered' ? 'Answer' : 'Details'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteId(inquiry.id); }}
                    className="md:hidden p-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl active:bg-red-500 active:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};