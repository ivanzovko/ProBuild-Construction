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
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Trash2 
} from "lucide-react";

interface ProjectFinanceProps {
  originalQuote: number;  
  jobId: string;
  estimatedPrice: number;
  totalWorkValue: number;
  paidSoFar: number;
  remainingToPay: number;
  payments: any[];
  companyIban?: string;
  loading?: boolean;
  isAdmin?: boolean;
  onAddPayment?: (data: any) => void;
  onVoidPayment?: (paymentId: string) => void;
}

const FinanceSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 bg-slate-200 rounded-[20px] border-l-4 border-slate-300" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-[400px] bg-slate-100 rounded-[32px]" />
      <div className="h-[400px] bg-slate-100 rounded-[32px]" />
    </div>
  </div>
);

export default function ProjectFinance({
  originalQuote = 0,
  estimatedPrice,
  totalWorkValue,
  paidSoFar,
  companyIban = "N/A",
  remainingToPay,
  payments = [],
  loading = false,
  isAdmin = false,
  onAddPayment,
  onVoidPayment 
}: ProjectFinanceProps) {
  const [isBudgetOpen, setIsBudgetOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'payment_date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isAvans, setIsAvans] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (loading) return <FinanceSkeleton />;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (onAddPayment && newAmount) {
      const numericAmount = Number(newAmount) / 100;
      
      onAddPayment({
        amount: numericAmount,
        description: newDesc || "Payment Received",
        is_avans: isAvans,
        payment_date: new Date().toISOString(),
        status: 'active'
      });

      setShowAddForm(false);
      setShowConfirmModal(false);
      setNewAmount("");
      setNewDesc("");
      setIsAvans(false);
    }
  };

  const handleVoidClick = (id: string) => {
    if (onVoidPayment) onVoidPayment(id);
  };

  const sortedPayments = [...payments].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (sortConfig.key === 'payment_date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = sortedPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrencyInput = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    return (parseInt(cleanValue) / 100).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 transition-all ${
      isAdmin ? 'scale-[0.9] origin-top' : 'scale-100'
    }`}>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Contractor Offer", val: originalQuote, icon: <Receipt size={14}/>, iconDesk: <Receipt size={18}/>, color: "sky", id: "01" },
          { label: "Revised Value", val: estimatedPrice, icon: <Calculator size={14}/>, iconDesk: <Calculator size={18}/>, color: "yellow", id: "02", dark: true },
          { label: "Work Value", val: totalWorkValue, icon: <TrendingUp size={14}/>, iconDesk: <TrendingUp size={18}/>, color: "sky", id: "03" },
          { label: "Total Paid", val: paidSoFar, icon: <Wallet size={14}/>, iconDesk: <Wallet size={18}/>, color: "emerald", id: "04" },
          { 
            label: isAdmin ? "Client Balance Due" : "Balance Due", 
            val: remainingToPay, 
            icon: <AlertCircle size={14}/>, 
            iconDesk: <AlertCircle size={18}/>,
            color: "rose", 
            id: "05", 
            full: true 
          }
        ].map((card, i) => (
          <div key={i} className={`relative group transition-all duration-300 hover:-translate-y-1 active:scale-95 bg-white border border-slate-200 p-4 lg:p-5 rounded-[20px] lg:rounded-[20px] shadow-sm hover:shadow-md border-l-4 ${card.dark ? 'bg-slate-900 border-slate-800' : `border-l-${card.color}-500`} ${card.full ? 'col-span-2 lg:col-span-1' : ''}`}>
            {/* Mobile Layout: Icon and Label in same line */}
            <div className="flex lg:hidden items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-md ${card.dark ? 'bg-yellow-400/10' : `bg-${card.color}-50`}`}>
                <span className={card.dark ? 'text-yellow-400' : `text-${card.color}-600`}>{card.icon}</span>
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-tight ${card.dark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
            </div>

            {/* Desktop Layout: Icon at top left, ID at top right */}
            <div className="hidden lg:flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${card.dark ? 'bg-yellow-400/10' : `bg-${card.color}-50`}`}>
                <span className={card.dark ? 'text-yellow-400' : `text-${card.color}-600`}>{card.iconDesk}</span>
              </div>
              <span className={`text-[10px] font-black tracking-tighter ${card.dark ? 'text-slate-700' : 'text-slate-300'}`}>{card.id}</span>
            </div>

            <p className={`hidden lg:block text-[10px] font-bold uppercase tracking-widest ${card.dark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
            
            <div className="flex items-baseline gap-1 mt-0 lg:mt-1">
              <p className={`text-lg lg:text-2xl font-black ${card.dark ? 'text-yellow-400' : 'text-slate-900'} ${card.color === 'emerald' && !card.dark ? 'text-emerald-600' : ''} ${card.color === 'rose' && !card.dark ? 'text-rose-600' : ''}`}>
                {card.val.toLocaleString()}
              </p>
              <span className={`text-[10px] lg:text-xs font-bold ${card.dark ? 'text-yellow-600' : 'text-slate-400'}`}>€</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <button 
            onClick={() => setIsBudgetOpen(!isBudgetOpen)} 
            className="w-full flex items-center justify-between p-6 md:p-8 bg-slate-900 text-left group active:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-yellow-400/10 rounded-xl border border-yellow-400/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-yellow-400" size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[14px] font-black text-yellow-400 uppercase tracking-widest italic">Budget Analysis</p>
                <p className="text-[12px] font-bold text-slate-500 uppercase mt-0.5">Financial performance</p>
              </div>
            </div>
            <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors">
              {isBudgetOpen ? <ChevronUp className="text-yellow-400" size={20} /> : <ChevronDown className="text-yellow-400" size={20} />}
            </div>
          </button>
          
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isBudgetOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Total Paid So Far</span>
                  <p className="text-3xl font-black italic text-emerald-500">{paidSoFar.toLocaleString()} €</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Paid Coverage</span>
                  <p className="text-xl font-black italic text-slate-900">{Math.round((paidSoFar/totalWorkValue)*100 || 0)}%</p>
                </div>
              </div>
              
              <div className="h-4 bg-slate-100 rounded-full p-1 border border-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                  style={{ width: `${Math.min((paidSoFar/totalWorkValue)*100, 100)}%` }} 
                />
              </div>

              <div className={`mt-10 p-6 rounded-[24px] border-2 animate-in fade-in slide-in-from-bottom duration-500 shadow-sm transition-all hover:shadow-md ${
                remainingToPay > 0 ? 'bg-rose-50 border-rose-100' : remainingToPay < 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
              }`}>
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-2xl shrink-0 shadow-sm transition-transform hover:rotate-12 ${
                    remainingToPay > 0 ? 'bg-rose-500 text-white' : remainingToPay < 0 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {remainingToPay > 0 ? <Wallet size={20} strokeWidth={2.5} /> : remainingToPay < 0 ? <AlertCircle size={20} strokeWidth={2.5} /> : <CheckCircle2 size={20} strokeWidth={2.5} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <p className={`text-[14px] font-black uppercase tracking-tight ${remainingToPay > 0 ? 'text-rose-900' : remainingToPay < 0 ? 'text-amber-900' : 'text-emerald-900'}`}>
                        {remainingToPay > 0 
                          ? (isAdmin ? 'Attention: Client has outstanding balance' : 'Action Required: Payment Pending') 
                          : remainingToPay < 0 
                          ? (isAdmin ? 'Budget Alert: Excess Funds Received' : 'Budget Notice: Overpayment')
                          : 'Account Status: Fully Paid'}
                      </p>
                      <span className={`text-[12px] font-black px-5 py-1 rounded-full shadow-sm whitespace-nowrap ${remainingToPay > 0 ? 'bg-white text-rose-600 border border-rose-100' : remainingToPay < 0 ? 'bg-white text-amber-600 border border-amber-100' : 'bg-white text-emerald-600 border border-emerald-100'}`}>
                        {remainingToPay > 0 ? 'UNPAID' : remainingToPay < 0 ? 'OVER' : 'PAID'}: {Math.abs(remainingToPay).toLocaleString()} €
                      </span>
                    </div>

                    <div className="text-[12px] font-medium text-slate-600 mt-3 leading-relaxed">
                      {remainingToPay > 0 ? (
                        <div className="space-y-4">
                          {isAdmin ? (
                            <p className="font-bold">Contact the client regarding the <span className="text-rose-600 underline">outstanding balance</span> of {remainingToPay.toLocaleString()} € to ensure project funding.</p>
                          ) : (
                            <>
                              <p>Please settle the outstanding balance to ensure project continuity.</p>
                              <div onClick={() => handleCopy(companyIban)} className="bg-white/80 backdrop-blur-sm border border-rose-200 rounded-2xl p-4 shadow-sm group transition-all hover:border-rose-400 hover:scale-[1.02] cursor-pointer active:scale-[0.97]">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company IBAN</span>
                                  <span className={`text-[8px] font-black uppercase italic transition-all ${copied ? 'text-emerald-500' : 'text-rose-400'}`}>
                                    {copied ? '✓ Copied to clipboard!' : 'Click to copy'}
                                  </span>
                                </div>
                                <span className="text-[13px] font-black text-slate-900 select-all tracking-wider font-mono block group-hover:text-rose-600 transition-colors">{companyIban}</span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : remainingToPay < 0 ? (
                        isAdmin ? (
                          <p className="font-bold italic text-amber-800 underline decoration-amber-500/30">The client has paid more than the current work value. Continue with the planned works and prioritize project delivery.</p>
                        ) : (
                          <p>An overpayment of <span className="font-black text-amber-600">{Math.abs(remainingToPay).toLocaleString()} €</span> has been detected. Please contact the contractor.</p>
                        )
                      ) : (
                        <p className="text-emerald-700 font-bold italic">{isAdmin ? 'Project accounts are settled. No outstanding invoices for current works.' : 'Your budget is perfectly balanced. All works are fully paid.'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       <div className="bg-white rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
  <div 
    onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
    className="p-6 md:p-8 bg-emerald-600 flex justify-between items-center group cursor-pointer"
  >
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-white/10 rounded-xl group-hover:rotate-6 transition-transform">
        <Receipt className="text-white" size={24} />
      </div>
      
      <div className="flex flex-col text-white">
        <p className="text-[12px] md:text-[14px] font-black uppercase tracking-widest italic opacity-80">Payment History</p>
        <p className="text-[12px] font-bold uppercase mt-1 opacity-60">Transactions log</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      {/* DESKTOP VIEW: Gumb lijevo od strelice */}
      {isAdmin && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowAddForm(!showAddForm);
          }} 
          className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[10px] transition-all shadow-md hover:-translate-y-1 hover:scale-105 active:scale-90 ${showAddForm ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-slate-900 text-yellow-400 hover:bg-slate-800'}`}
        >
          {showAddForm ? <X size={14} strokeWidth={4} /> : <Plus size={14} strokeWidth={4} />}
          <span>{showAddForm ? "Cancel" : "Add Payment"}</span>
        </button>
      )}

      {/* MOBILE CONTAINER: Strelica i gumb ispod nje */}
      <div className="flex flex-col items-center gap-2">
        <button className="text-white hover:bg-white/10 p-2 rounded-full transition-all hover:scale-110 active:scale-90">
          {isHistoryOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {isAdmin && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm(!showAddForm);
            }} 
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-md active:scale-90 ${showAddForm ? 'bg-rose-500 text-white' : 'bg-slate-900 text-yellow-400'}`}
          >
            {showAddForm ? <X size={18} strokeWidth={4} /> : <Plus size={18} strokeWidth={4} />}
          </button>
        )}
      </div>
    </div>
  </div>

  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isHistoryOpen ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0"}`}>
    {isAdmin && showAddForm && (
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmModal(true); 
        }} 
        className="p-6 bg-slate-50 border-b-2 border-slate-100 animate-in slide-in-from-top duration-300"
      >
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="relative group">
            <input 
              required 
              type="text" 
              placeholder="0,00" 
              value={newAmount ? formatCurrencyInput(newAmount) : ""} 
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setNewAmount(val);
              }}
              className="w-full bg-white border-2 border-slate-400 rounded-xl pl-4 pr-10 py-3 text-sm font-black outline-none focus:border-emerald-500 focus:shadow-md transition-all text-right" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 group-focus-within:text-emerald-500 transition-colors">€</span>
          </div>
          
          <input 
            required 
            type="text" 
            placeholder="DESC" 
            value={newDesc} 
            onChange={(e) => setNewDesc(e.target.value)}
            className="bg-white border-2 border-slate-400 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-500 focus:shadow-md transition-all uppercase" 
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div onClick={() => setIsAvans(!isAvans)} className={`w-10 h-6 rounded-full transition-all relative hover:scale-105 active:scale-95 ${isAvans ? 'bg-yellow-400' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isAvans ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-600 group-hover:text-slate-900 transition-colors">Advance</span>
          </label>
          <button type="submit" className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-emerald-600 hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95 transition-all">Confirm</button>
        </div>
      </form>
    )}

    {showConfirmModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border-2 border-slate-100 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-900">Confirm Entry?</h3>
            <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-tight">
              Record payment of <span className="text-emerald-600">{newAmount ? formatCurrencyInput(newAmount) : "0,00"} €</span>?
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full mt-8">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-3 rounded-2xl font-black uppercase text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 hover:-translate-y-1 hover:scale-105 transition-all active:scale-95"
              >
                Back
              </button>
              <button 
                type="button"
                onClick={() => handleAddSubmit()}
                className="px-6 py-3 rounded-2xl font-black uppercase text-[10px] bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:-translate-y-1 hover:scale-105 transition-all active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="p-4 md:p-6 overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="hidden lg:table-row text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            <th className="px-4 py-2 w-12 text-center">#</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2 cursor-pointer hover:text-emerald-600 transition-colors group" onClick={() => requestSort('payment_date')}>
              <div className="flex items-center gap-1">Date <ArrowUpDown size={12} className="group-hover:scale-125 transition-transform"/></div>
            </th>
            <th className="px-4 py-2 text-right cursor-pointer hover:text-emerald-600 transition-colors group" onClick={() => requestSort('amount')}>
              <div className="flex items-center justify-end gap-1">Amount <ArrowUpDown size={12} className="group-hover:scale-125 transition-transform"/></div>
            </th>
          </tr>
        </thead>
        <tbody className="w-full">
          {currentPayments.length > 0 ? (
            <>
              {currentPayments.map((payment, idx) => {
                const actualIdx = payments.length - (indexOfFirstItem + idx);
                const isAv = payment.is_avans;
                const isVoided = payment.status === 'voided';

                return (
                  <tr 
                    key={`desktop-${idx}`} 
                    className={`hidden lg:table-row group transition-all duration-300 rounded-2xl border-l-4 ${
                      isVoided 
                        ? 'bg-slate-50 opacity-40 grayscale border-l-slate-300 cursor-not-allowed' 
                        : isAv ? 'bg-amber-50/40 border-l-amber-400 hover:bg-amber-50 hover:scale-[1.01] hover:shadow-md' 
                               : 'bg-slate-50 border-l-emerald-500 hover:bg-white hover:scale-[1.01] hover:shadow-md'
                    }`}
                  >
                    <td className="px-4 py-4 text-[10px] font-black text-slate-300 group-hover:text-slate-900 text-center italic border-y border-slate-400 rounded-l-2xl">
                      {String(actualIdx).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-4 border-y border-slate-400">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:rotate-12 ${
                          isVoided ? 'bg-slate-200 text-slate-400' : isAv ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {isVoided ? <X size={16} strokeWidth={3} /> : isAv ? <AlertCircle size={16} strokeWidth={3} /> : <CheckCircle2 size={16} strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-tight ${isVoided ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {payment.description || "Payment Received"}
                            </span>
                            {isVoided && <span className="bg-slate-200 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Voided</span>}
                            {!isVoided && isAv && <span className="bg-amber-200 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Advance</span>}
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{isVoided ? 'Cancelled transaction' : 'Regular payment'}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-[13px] font-bold uppercase tracking-tighter border-y border-slate-400 ${isVoided ? 'text-slate-300 line-through' : 'text-slate-600'}`}>
                      {new Date(payment.payment_date).toLocaleString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-4 py-4 rounded-r-2xl text-right border-y border-r border-slate-400">
                      <div className="flex items-center justify-end gap-3">
                        {isAdmin && !isVoided && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleVoidClick(payment.id || payment._id); }}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:scale-110 rounded-lg transition-all active:scale-90"
                            title="Void transaction"
                          >
                            <Trash2 size={14} strokeWidth={3} />
                          </button>
                        )}
                        <div className="flex flex-col items-end">
                          <span className={`text-[12px] font-black italic transition-all group-hover:scale-110 origin-right ${
                            isVoided ? 'text-slate-300 line-through' : isAv ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {isVoided ? '' : '+'} {Number(payment.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </span>
                          <span className={`text-[9px] font-black uppercase italic ${isVoided ? 'text-rose-400' : 'text-slate-500'}`}>{isVoided ? 'Voided' : 'Confirmed'}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {currentPayments.map((payment, idx) => {
                const actualIdx = payments.length - (indexOfFirstItem + idx);
                const isAv = payment.is_avans;
                const isVoided = payment.status === 'voided';
                
                return (
                  <tr key={`mobile-${idx}`} className="lg:hidden">
                    <td colSpan={4} className="p-0 border-none">
                      <div className={`mb-3 p-4 rounded-2xl border-l-4 shadow-sm flex flex-col gap-3 ${
                        isVoided ? 'bg-slate-50 opacity-60 border-l-slate-300' : isAv ? 'bg-amber-50/50 border-l-amber-400' : 'bg-slate-50 border-l-emerald-500'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-[10px] font-black text-slate-300 italic shrink-0">
                              #{String(actualIdx).padStart(2, '0')}
                            </span>
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-black uppercase truncate tracking-tight ${isVoided ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {payment.description || "Payment"}
                              </span>
                              {isAv && !isVoided && <span className="text-[7px] font-black text-amber-600 uppercase">Advance Payment</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-[15px] font-black italic tracking-tighter ${isVoided ? 'text-slate-300' : isAv ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {Number(payment.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                          <span className="text-[9px] font-bold text-slate-400 uppercase italic">
                            {new Date(payment.payment_date).toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })}
                          </span>
                          
                          {isAdmin && !isVoided && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleVoidClick(payment.id || payment._id); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-100 text-rose-500 rounded-xl active:scale-90 shadow-sm transition-all"
                            >
                              <span className="text-[8px] font-black uppercase">Void</span>
                              <Trash2 size={12} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </>
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-400 italic font-black text-slate-400 uppercase text-[10px]">No transactions recorded yet</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-[9px] font-black text-slate-400 uppercase italic">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            {[ {label: "Prev", action: () => setCurrentPage(prev => prev - 1), dis: currentPage === 1}, 
                {label: "Next", action: () => setCurrentPage(prev => prev + 1), dis: currentPage === totalPages}
            ].map((btn, i) => (
              <button key={i} disabled={btn.dis} onClick={(e) => { e.stopPropagation(); btn.action(); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all active:scale-90 ${btn.dis ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-yellow-400 hover:bg-slate-800 hover:-translate-y-1 hover:scale-105 shadow-md'}`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>
      </div>
    </div>
  );
}