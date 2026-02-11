"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Calculator, 
  Wallet, 
  Receipt, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

interface ProjectFinanceProps {
  estimatedPrice: number;
  totalWorkValue: number;
  paidSoFar: number;
  remainingToPay: number;
  payments: any[];
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
  estimatedPrice,
  totalWorkValue,
  paidSoFar,
  remainingToPay,
  payments,
  loading = false
}: ProjectFinanceProps) {
  const [isBudgetOpen, setIsBudgetOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  if (loading) return <FinanceSkeleton />;

  const getPercentage = (value: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
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
                  <div className="flex items-center gap-1 mb-1">
                    <Calculator size={10} className="text-slate-400 shrink-0" />
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter md:tracking-widest block">Est.</span>
                  </div>
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
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex justify-between items-center p-5 md:p-8 bg-white border-b border-slate-100 text-left"
        >
          <div className="flex items-center gap-3">
            <p className="text-[11px] md:text-[12px] font-black text-slate-900 uppercase tracking-widest italic border-b-2 border-emerald-400 w-fit">
              Payment History
            </p>
            <div className="hidden sm:flex bg-emerald-50 px-3 py-1 rounded-full items-center gap-2">
              <Wallet size={12} className="text-emerald-600" />
              <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Verified</span>
            </div>
          </div>
          {isHistoryOpen ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
        </button>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHistoryOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-5 md:p-8 space-y-3">
            {payments && payments.length > 0 ? (
              payments
                .slice()
                .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                .map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all group overflow-visible">
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