"use client";

import { useState } from "react";
import { X, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { Tooltip } from "@components/Tooltip";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isSubmitting: boolean;
}

export default function RejectionModal({ isOpen, onClose, onConfirm, isSubmitting }: RejectionModalProps) {
  const [note, setNote] = useState("");
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const isNoteEmpty = !note.trim();

  const handleConfirm = () => {
    if (isNoteEmpty) {
      setShowError(true);
      // Automatski sakrij poruku nakon 3 sekunde
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    onConfirm(note);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] w-full max-w-md overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 relative animate-in zoom-in-95 duration-300">
        
        <Tooltip content="Close without sending">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-10"
          >
            <X size={18} />
          </button>
        </Tooltip>

        <div className="pt-12 pb-6 text-center">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-red-400/20 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 bg-red-500 text-white rounded-[28px] flex items-center justify-center shadow-lg -rotate-3">
              <AlertCircle size={40} />
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight px-8">
            What's missing?
          </h3>
          <p className="text-[10px] text-slate-900 font-black uppercase tracking-[0.2em] mt-3">
            Explain to the contractor why the project isn't finished.
          </p>
        </div>

        <div className="px-10 pb-12">
          <div className="relative group mb-2">
            <div className={`absolute left-6 top-5 transition-colors ${showError ? "text-red-600" : "text-slate-400 group-focus-within:text-red-500"}`}>
              <MessageSquare size={16} />
            </div>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (showError) setShowError(false);
              }}
              placeholder="E.G. THE WALLS NEED ANOTHER COAT OF PAINT..."
              className={`w-full bg-slate-50 border-2 rounded-[32px] py-5 pl-14 pr-8 text-[11px] font-bold uppercase placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all min-h-[140px] resize-none shadow-sm ${
                showError ? "border-red-600 ring-4 ring-red-50" : "border-slate-900 focus:border-red-500"
              }`}
            />
          </div>

          <div className={`h-8 transition-all duration-300 flex items-center justify-center ${showError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
             <p className="text-[9px] bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 border border-red-100">
               <AlertCircle size={12} /> Write a reason to continue
             </p>
          </div>

          <div className="flex gap-3 mt-2">
            <Tooltip content="Go back to project">
              <button
                disabled={isSubmitting}
                onClick={onClose}
                className="flex-1 py-5 bg-white border-2 border-slate-900 rounded-[24px] text-[11px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
            </Tooltip>
            
            <Tooltip content="Submit feedback and keep project open">
              <button
                onClick={handleConfirm}
                className={`flex-1 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isSubmitting 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : isNoteEmpty 
                      ? "bg-red-300 text-white/80 cursor-pointer" 
                      : "bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Send Note"
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}