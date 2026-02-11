

"use client";

import { useState, useEffect } from 'react';
import { ClipboardList, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InquiryCard } from './InquiryCard';

interface InquiryListProps {
  inquiries: any[];
  activeTab: 'unanswered' | 'answered';
  togglePin: (e: any, id: string, pinned: boolean) => void;
  setDeleteId: (id: string | null) => void;
  handleViewDetails: (inquiry: any) => void;
  searchQuery: string;
}

export const InquiryList = ({ 
  inquiries, 
  activeTab, 
  togglePin, 
  setDeleteId, 
  handleViewDetails,
  searchQuery 
}: InquiryListProps) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (expandedId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`card-${expandedId}`);
        if (element) {
          const offset = 100; 
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 150); 

      return () => clearTimeout(timer);
    }
  }, [expandedId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (inquiries.length === 0) {
    return (
      <div className="bg-white py-12 md:py-32 rounded-[32px] md:rounded-[40px] border-2 border-dashed border-slate-200 text-center shadow-sm px-6">
        <div className="bg-slate-50 w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[30px] flex items-center justify-center mx-auto mb-4 md:mb-6 border border-slate-100 rotate-3 transition-transform">
          <ClipboardList className="text-slate-300" size={28} />
        </div>
        <h4 className="text-slate-900 font-black uppercase text-lg md:text-xl tracking-tight mb-2 italic">
          No {activeTab} inquiries
        </h4>
        <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] max-w-[180px] md:max-w-[200px] mx-auto leading-relaxed">
          {activeTab === 'unanswered' 
            ? "Great job! You've cleared all pending messages." 
            : "You haven't answered any inquiries yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative grid gap-4 md:gap-6">
      <AnimatePresence mode="popLayout">
        {inquiries.map((inquiry, index) => (
          <motion.div 
            key={inquiry.id} 
            id={`card-${inquiry.id}`}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              layout: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="scroll-mt-24"
          >
            <InquiryCard
              inquiry={inquiry}
              index={index}
              activeTab={activeTab}
              togglePin={togglePin}
              setDeleteId={setDeleteId}
              handleViewDetails={handleViewDetails}
              searchQuery={searchQuery}
              isExpanded={expandedId === inquiry.id}
              onToggle={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[999] p-4 bg-slate-950 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800 transition-all duration-500 ease-in-out hover:bg-yellow-400 hover:text-slate-950 hover:-translate-y-2 active:scale-95 group ${
          showScrollTop 
            ? "opacity-100 translate-y-0 scale-100 visible" 
            : "opacity-0 translate-y-10 scale-50 invisible pointer-events-none"
        }`}
      >
        <div className="relative">
          <ArrowUp size={24} className="group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        </div>
      </button>
    </div>
  );
};