"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tooltip } from "@components/Tooltip";
import { 
  Gavel, Zap, CalendarDays, ArrowLeft,
  CreditCard, Calendar, MessageSquare,
  Hammer, Banknote, Landmark,
  Check, Euro, Coins, Send, Lock,
  AlertTriangle, Info
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface TenderOfferFormProps {
  selectedTender: any;
  onClose: () => void;
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function TenderOfferForm({ selectedTender, onClose, onSuccess, onDirtyChange }: TenderOfferFormProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    price: "",
    deadline: null as Date | null,
    quality: "",
    payment: "",
    advancePayment: false,
    delayNotice: false
  });

  const isDirty = formData.price !== "" || formData.deadline !== null || formData.quality !== "" || formData.payment !== "" || note !== "";

  useEffect(() => {
    if (!isReadOnly) {
      if (onDirtyChange) onDirtyChange(isDirty);
      window.dispatchEvent(new CustomEvent('formDirtyStatus', { detail: isDirty }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('formDirtyStatus', { detail: false }));
    };
  }, [isDirty, isReadOnly, onDirtyChange]);

  const handleSafeClose = useCallback(() => {
    if (isDirty && !isReadOnly) {
      setShowExitWarning(true);
    } else {
      onClose();
    }
  }, [isDirty, isReadOnly, onClose]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isReadOnly) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isReadOnly]);

  useEffect(() => {
    const fetchOffer = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('estimates')
        .select('*')
        .eq('job_id', selectedTender.id)
        .eq('contractor_id', user.id)
        .maybeSingle();

      if (data) {
        setFormData({
          price: data.price.toString(),
          deadline: data.deadline_date ? new Date(data.deadline_date) : null,
          quality: data.quality_level,
          payment: data.payment_method,
          advancePayment: data.advance_payment_required,
          delayNotice: data.potential_delay_acknowledged
        });
        setNote(data.technical_notes || "");
        setIsReadOnly(true);
      } else {
        const savedData = localStorage.getItem(`draft_offer_${selectedTender.id}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFormData({
            price: parsed.price || "",
            deadline: parsed.deadline ? new Date(parsed.deadline) : null,
            quality: parsed.quality || "",
            payment: parsed.payment || "",
            advancePayment: !!parsed.advancePayment,
            delayNotice: !!parsed.delayNotice
          });
          setNote(parsed.note || "");
        }
      }
      setIsLoading(false);
    };

    fetchOffer();
  }, [selectedTender.id]);

  useEffect(() => {
    if (isReadOnly || isLoading) return;
    const dataToSave = { ...formData, note };
    localStorage.setItem(`draft_offer_${selectedTender.id}`, JSON.stringify(dataToSave));
  }, [formData, note, selectedTender.id, isReadOnly, isLoading]);

  const validateAndShowConfirm = () => {
    if (isReadOnly) return;
    const newErrors: string[] = [];
    if (!formData.price) newErrors.push("Total Price");
    if (!formData.deadline) newErrors.push("Deadline");
    if (!formData.quality) newErrors.push("Material Quality");
    if (!formData.payment) newErrors.push("Payment Method");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 4000);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('estimates')
        .insert([{
          job_id: selectedTender.id,
          contractor_id: user.id,
          price: parseFloat(formData.price),
          deadline_date: formData.deadline?.toISOString().split('T')[0],
          quality_level: formData.quality,
          payment_method: formData.payment,
          technical_notes: note,
          advance_payment_required: formData.advancePayment,
          potential_delay_acknowledged: formData.delayNotice,
          status: 'pending'
        }]);

      if (error) throw error;
      localStorage.removeItem(`draft_offer_${selectedTender.id}`);
      onSuccess();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'bank', label: 'Bank Transfer', icon: Landmark },
    { id: 'any', label: 'Any / Either', icon: Coins }
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="sticky top-0 mt-[50px] sm:mt-0 z-30 w-full bg-[#0a192f] px-6 py-4 flex items-center gap-4 border-b border-yellow-500/20">
          <div className="w-10 h-10 bg-white/10 rounded-xl animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/20 rounded-md w-1/3 animate-pulse" />
            <div className="h-2 bg-yellow-400/20 rounded-md w-1/4 animate-pulse" />
          </div>
        </div>
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-slate-50 rounded-[1.5rem] animate-pulse border border-slate-100" />
            <div className="h-32 bg-slate-50 rounded-[1.5rem] animate-pulse border border-slate-100" />
            <div className="h-32 bg-slate-50 rounded-[1.5rem] animate-pulse border border-slate-100" />
          </div>
          <div className="h-40 bg-slate-50 rounded-[1.5rem] animate-pulse border border-slate-100" />
          <div className="h-24 bg-yellow-400/5 rounded-[1.5rem] border-2 border-dashed border-yellow-400/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col bg-white relative"
    >
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .custom-date-input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 0;
          font-weight: 900;
          color: #0a192f;
          text-transform: uppercase;
          font-style: italic;
          outline: none;
          cursor: pointer;
          text-align: left;
        }
        .custom-date-input:disabled { cursor: default; }
        .react-datepicker {
          font-family: inherit;
          border-radius: 1.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }
      `}</style>

      <AnimatePresence>
        {showExitWarning && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowExitWarning(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">Unsaved Changes</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Your offer hasn't been submitted. If you leave now, all entered data will be lost.
                </p>
              </div>
              <div className="flex border-t border-slate-100">
                <button 
                  onClick={() => setShowExitWarning(false)}
                  className="flex-1 px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Stay here
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 px-6 py-5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-l border-slate-100"
                >
                  Discard & Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Send size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">Ready to Send?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  You are about to submit an offer of <span className="text-slate-900 font-bold">{formData.price}€</span>.
                </p>
              </div>
              <div className="flex border-t border-slate-100">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Go Back
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex-1 px-6 py-5 text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors border-l border-slate-100 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="sticky top-0 mt-[50px] sm:mt-0 z-30 w-full bg-[#0a192f] px-6 py-4 flex items-center gap-4 border-b border-yellow-500/20">
        <Tooltip content="Cancel and return">
          <button onClick={handleSafeClose} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-yellow-400 hover:text-[#0a192f] transition-all shrink-0 flex items-center justify-center">
            <ArrowLeft strokeWidth={3} className="w-5 h-5" />
          </button>
        </Tooltip>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
            {isReadOnly ? (
              <Tooltip content="Offer is submitted and locked">
                <Lock className="w-4 h-4 text-yellow-400" />
              </Tooltip>
            ) : null}
            {isReadOnly ? "Review Proposal" : "Submit Proposal"}
          </h2>
          <p className="text-yellow-400/60 text-[9px] uppercase tracking-[0.2em] font-bold">{selectedTender.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-4 max-w-7xl mx-auto">
          {isReadOnly && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 mb-2">
              <Check className="text-emerald-500 w-4 h-4" />
              <span className="text-[10px] font-black uppercase text-emerald-600 italic">This offer has been submitted and is currently locked.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                <div className={`bg-slate-50 p-4 rounded-[1.5rem] border ${errors.includes("Total Price") ? "border-red-500 bg-red-50" : "border-slate-100"}`}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 whitespace-nowrap">
                    <CreditCard className="w-3 h-3 shrink-0" /> 
                    <span>Total Price</span>
                    <Tooltip content="Enter total price for the project (excluding VAT)">
                      <Info size={10} className="text-slate-300 ml-1 cursor-help" />
                    </Tooltip>
                  </label>
                  <div className="flex items-center gap-2 w-full">
                    <input 
                      disabled={isReadOnly}
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="bg-transparent border-none p-0 focus:ring-0 text-2xl font-black text-[#0a192f] italic tracking-tighter w-full outline-none disabled:opacity-70" 
                      placeholder="0.00" 
                    />
                    <div className="bg-yellow-400 text-[#0a192f] p-1 rounded-lg shrink-0"><Euro strokeWidth={3} className="w-4 h-4" /></div>
                  </div>
                </div>

                <div className={`bg-slate-50 p-4 rounded-[1.5rem] border ${errors.includes("Deadline") ? "border-red-500 bg-red-50" : "border-slate-100"}`}>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Calendar className="text-yellow-500 w-3.5 h-3.5" /> Deadline
                  </label>
                  <div className="flex items-center gap-2 w-full">
                    <DatePicker
                      disabled={isReadOnly}
                      selected={formData.deadline}
                      onChange={(date: Date | null) => setFormData({...formData, deadline: date})}
                      dateFormat="dd MMM yyyy"
                      minDate={new Date()}
                      className="custom-date-input text-sm"
                      placeholderText="SELECT DATE"
                    />
                    <CalendarDays className="text-slate-400 w-4 h-4 shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-slate-50 p-4 rounded-[1.5rem] border ${errors.includes("Material Quality") ? "border-red-500" : "border-slate-100"}`}>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Hammer className="text-yellow-500 w-3.5 h-3.5" /> Material Quality
              </label>
              <div className="flex flex-col gap-1.5">
                {['Basic', 'Standard', 'Premium'].map((q) => (
                  <label key={q} className={`flex items-center justify-between p-2.5 bg-white rounded-xl border border-transparent transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        disabled={isReadOnly} 
                        type="radio" 
                        checked={formData.quality === q} 
                        onChange={() => setFormData({...formData, quality: q})} 
                        className="peer h-4 w-4 border-2 border-slate-200 rounded-full checked:border-yellow-500" 
                      />
                      <span className="text-[11px] font-black uppercase italic text-slate-600">{q}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={`bg-slate-50 p-4 rounded-[1.5rem] border ${errors.includes("Payment Method") ? "border-red-500" : "border-slate-100"}`}>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Zap className="text-yellow-500 w-3.5 h-3.5" /> Payment Method
              </label>
              <div className="flex flex-col gap-1.5">
                {paymentMethods.map((method) => (
                  <label key={method.id} className={`flex items-center justify-between p-2.5 bg-white rounded-xl border border-transparent transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        disabled={isReadOnly} 
                        type="radio" 
                        checked={formData.payment === method.label} 
                        onChange={() => setFormData({...formData, payment: method.label})} 
                        className="peer h-4 w-4 border-2 border-slate-200 rounded-full checked:border-yellow-500" 
                      />
                      <span className="text-[11px] font-black uppercase italic text-slate-600">{method.label}</span>
                    </div>
                    <method.icon className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
            <label className="flex items-center gap-2 mb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <MessageSquare className="text-yellow-500 w-3.5 h-3.5" /> Technical Notes
            </label>
            <textarea 
              disabled={isReadOnly}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white border border-transparent rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-slate-700 text-base min-h-[100px] disabled:opacity-70" 
              placeholder="Describe your workflow..."
            ></textarea>
          </div>

          <div className="p-4 bg-yellow-400/5 rounded-[1.5rem] border-2 border-dashed border-yellow-400/20 space-y-3">
            {[
              { field: 'advancePayment', label: 'Advance Payment Required', tooltip: 'Check if you require payment before starting work' },
              { field: 'delayNotice', label: 'Potential Delay Notice', tooltip: 'Notify client that start date might be subject to change' }
            ].map((opt) => (
              <Tooltip key={opt.field} content={opt.tooltip}>
                <label className={`flex items-center gap-3 w-fit ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                  <input 
                    disabled={isReadOnly}
                    type="checkbox" 
                    checked={(formData as any)[opt.field]} 
                    onChange={(e) => setFormData({...formData, [opt.field]: e.target.checked})} 
                    className="h-5 w-5 border-2 border-slate-300 rounded text-yellow-400 focus:ring-0 disabled:opacity-50" 
                  />
                  <span className="text-[12px] font-black text-[#0a192f] uppercase italic leading-none">{opt.label}</span>
                </label>
              </Tooltip>
            ))}
          </div>

          {!isReadOnly && (
            <button onClick={validateAndShowConfirm} className="w-full bg-[#0a192f] text-yellow-400 font-black uppercase py-4 rounded-2xl shadow-2xl active:scale-95 flex items-center justify-center gap-3 mt-2 mb-10 transition-all">
              <Gavel className="w-5 h-5" /> Finalize & Send Offer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}