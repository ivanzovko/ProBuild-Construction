import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange 
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ako ima 10 ili manje elemenata, ne prikazuj paginaciju
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2 pb-8 animate-in fade-in duration-500">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-yellow-400 active:scale-95 shadow-sm"
      >
        <ChevronLeft size={18} strokeWidth={3} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-xl font-black text-[11px] uppercase transition-all border-2 shadow-sm ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-yellow-400'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-yellow-400'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-yellow-400 active:scale-95 shadow-sm"
      >
        <ChevronRight size={18} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Pagination;