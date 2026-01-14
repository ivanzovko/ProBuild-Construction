"use client";

import React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  className = "",
}) => {
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const handlePrev = () => {
    if (!isFirstPage) {
      setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      setPage(currentPage + 1);
    }
  };

  // Ako ima samo jedna stranica, ne prikazuj paginaciju
  if (totalPages <= 1) return null;

  return (
    <div className={`w-full max-w-2xl mx-auto mb-10 ${className}`}>
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-3 md:p-4 flex justify-between items-center">
        <button
          onClick={handlePrev}
          className={`flex items-center gap-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${
            isFirstPage
              ? "bg-slate-50 text-slate-300 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-yellow-400 hover:text-black active:scale-95 shadow-lg shadow-slate-900/10"
          }`}
          disabled={isFirstPage}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic text-center">
          Page <span className="text-slate-900 mx-1">{currentPage}</span> 
          <span className="mx-1 opacity-30">/</span> 
          <span className="text-slate-900">{totalPages}</span>
        </p>

        <button
          onClick={handleNext}
          className={`flex items-center gap-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${
            isLastPage
              ? "bg-slate-50 text-slate-300 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-yellow-400 hover:text-black active:scale-95 shadow-lg shadow-slate-900/10"
          }`}
          disabled={isLastPage}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};