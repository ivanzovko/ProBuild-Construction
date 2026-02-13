"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Calculator, 
  Wallet, 
  Receipt, 
  ChevronDown, 
  ChevronUp,
  Plus,
  X,
  Loader2
} from "lucide-react";
import { Tooltip } from "@components/Tooltip";
import { createBrowserClient } from "@supabase/ssr";

// Interface usklađen s roditeljskom komponentom
interface ProjectFinanceProps {
  jobId: string; // Obavezno jer ga koristimo za insert
  estimatedPrice: number;
  totalWorkValue: number;
  paidSoFar: number;
  remainingToPay: number;
  payments: any[];
  canManage: boolean;
  onPaymentAdded?: () => void; // Funkcija za osvježavanje podataka bez reloada
  loading?: boolean;
}

function FinanceSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse items-start">
      <div className="bg-white rounded-[32px] border-2 border-slate-100 h-[400px]" />
      <div className="bg-white rounded-[32px] border-2 border-slate-100 h-[400px]" />
    </div>
  );
}

export default function ProjectFinance({
  jobId,
  estimatedPrice = 0,
  totalWorkValue = 0,
  paidSoFar = 0,
  remainingToPay = 0,
  payments = [],
  canManage = false,
  onPaymentAdded,
  loading = false,
}: ProjectFinanceProps) {
  const [isBudgetOpen, setIsBudgetOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  
  // State za novu uplatu
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (loading) return <FinanceSkeleton />;

  const getPercentage = (value: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const handleSavePayment = async () => {
    if (!amount || !jobId) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          job_id: jobId,
          amount: Number(amount),
          description: description || "Payment Received",
          payment_date: new Date().toISOString()
        }]);

      if (error) throw error;
      
      // Pozivamo funkciju iz roditelja umjesto window.location.reload()
      if (onPaymentAdded) {
        onPaymentAdded();
      }

      // Reset forme
      setIsAddingPayment(false);
      setAmount("");
      setDescription("");
      
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Error saving payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatePercentage = getPercentage(totalWorkValue, estimatedPrice);
  const paidPercentage = getPercentage(paidSoFar, totalWorkValue);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 items-start">
      
      {/* Budget Analysis Card */}
      <div className="bg-white rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden">
        <button 
          onClick={() => setIsBudgetOpen(!isBudgetOpen)}
          className="w-full flex items-center justify-between p-5 md:p-8 bg-slate-900 text-left"
        >
          <p className="text-[10px] md:text-[12px] font-black text-yellow-400 uppercase tracking-widest italic">
            Budget Analysis
          </p>
          {isBudgetOpen ? <ChevronUp className="text-yellow-400" size={20} /> : <ChevronDown className="text-yellow-400" size={20} />}
        </button>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isBudgetOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-slate-900 px-5 md:px-8 pb-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform hidden md:block">
              <TrendingUp size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="grid grid-cols-3 gap-2 md:gap-6">
                <div>
                  <Tooltip content="Original budget estimation">
                    <div className="flex items-center gap-1 mb-1 cursor-help">
                      <Calculator size={10} className="text-slate-400 shrink-0" />
                      <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter md:tracking-widest block">Est.</span>
                    </div>
                  </Tooltip>
                  <p className="text-sm md:text-2xl font-black italic text-white/70">{estimatedPrice.toLocaleString()} €</p>
                </div>
                <div>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter md:tracking-widest block mb-1">Total Works</span>
                  <p className="text-sm md:text-2xl font-black italic text-white">{totalWorkValue.toLocaleString()} €</p>
                </div>
                <div>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter md:tracking-widest block mb-1">Paid</span>
                  <p className="text-sm md:text-2xl font-black italic text-emerald-400">{paidSoFar.toLocaleString()} €</p>
                </div>
              </div>

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">Remaining to pay</p>
                  <p className="text-3xl md:text-5xl font-black text-yellow-400 italic tracking-tighter leading-none pr-4">{remainingToPay.toLocaleString()} €&nbsp;</p>
                </div>
                <div className="text-right">
                  <span className="text-xl md:text-3xl font-black italic text-emerald-500">{paidPercentage}% <span className="hidden md:inline">Paid</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5 md:p-8 space-y-6 bg-white border-t border-slate-100">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase">
                <span className="text-slate-500">Value vs original estimate</span>
                <span className={totalWorkValue > estimatedPrice ? "text-red-600" : "text-emerald-600"}>
                  {estimatePercentage}% OF ESTIMATE
                </span>
              </div>
              <div className="h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${totalWorkValue > estimatedPrice ? "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(estimatePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <div className="bg-white rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="w-full flex justify-between items-center p-5 md:p-8 bg-white border-b border-slate-100">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center gap-3 text-left"
          >
            <p className="text-[11px] md:text-[12px] font-black text-slate-900 uppercase tracking-widest italic border-b-2 border-emerald-400 w-fit">
              Payment History
            </p>
            {isHistoryOpen ? <ChevronUp className="text-slate-400" size={16} /> : <ChevronDown className="text-slate-400" size={16} />}
          </button>

          {canManage && (
            <button 
              onClick={() => setIsAddingPayment(!isAddingPayment)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 shadow-lg ${
                isAddingPayment 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : "bg-slate-900 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900"
              }`}
            >
              {isAddingPayment ? <X size={14} /> : <Plus size={14} />}
              {isAddingPayment ? "Cancel" : "Add Payment"}
            </button>
          )}
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHistoryOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
          
          {/* Form za unos nove uplate */}
          {isAddingPayment && (
            <div className="p-5 md:p-8 bg-slate-50 border-b-2 border-emerald-400/20 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Amount (€)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Description</label>
                    <input 
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Second installment"
                      className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm transition-colors"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSavePayment}
                  disabled={isSubmitting || !amount}
                  className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
                  Confirm Payment Received
                </button>
              </div>
            </div>
          )}

          <div className="p-5 md:p-8 space-y-3">
            {payments && payments.length > 0 ? (
              payments
                .slice()
                .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                .map((payment, idx) => (
                <Tooltip key={idx} content={`Transaction confirmed on ${payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}`}>
                  <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all group overflow-visible cursor-default">
                    <div className="flex items-center gap-3 md:gap-4 overflow-visible">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <Receipt size={16} />
                      </div>
                      <div className="flex flex-col min-w-0 overflow-visible">
                        <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-800 tracking-tight leading-tight mb-0.5 break-words pr-2">
                          {payment.description || "Payment Received"}&nbsp;
                        </span>
                        <span className="text-[11px] md:text-[12px] font-bold text-slate-500 uppercase">
                          {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs md:text-[14px] font-black text-emerald-600 shrink-0 ml-2 italic">
                      + {Number(payment.amount).toLocaleString()} €&nbsp;
                    </span>
                  </div>
                </Tooltip>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-[9px] font-black uppercase text-slate-400">No payments recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}