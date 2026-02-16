"use client";
import { useState,useEffect } from "react";
import { 
  TrendingUp, 
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  HelpCircle,
  Calculator,
  History,
  Eye,
  Search,
  Filter,
  RefreshCcw
} from "lucide-react";
import { Tooltip } from "@components/Tooltip";
import { createBrowserClient } from "@supabase/ssr";
import Pagination from "@components/Pagination"; // Provjeri je li putanja točna ovisno o tome gdje ti je datoteka

interface ProjectTimelineProps {
  job: any;
  loading?: boolean;
  isAdmin?: boolean; 
  onUpdate?: () => Promise<void> | void;
  onDeleteItem?: (itemIndex: number) => void; 
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-white rounded-[32px] border-2 border-slate-100" />
      <div className="h-96 bg-white rounded-[32px] border-2 border-slate-100" />
    </div>
  );
}

export default function ProjectTimeline({ 
  job, 
  loading, 
  isAdmin = false,
  onUpdate,
  onDeleteItem 
}: ProjectTimelineProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingDescription, setViewingDescription] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);  
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newBasePrice, setNewBasePrice] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [statusToChange, setStatusToChange] = useState<string | null>(null);;
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isProjectCompleted = job?.status === 'completed';

  const handleUpdateStatus = async () => {
    if (!job?.id || !statusToChange) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: statusToChange })
        .eq('id', job.id);
      
      if (error) throw error;
      if (onUpdate) await onUpdate();
      setStatusToChange(null);
    } catch (err) {
      console.error("Status Update Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

const highlightText = (text: string, highlight: string, className = "text-yellow-500") => {
  if (!highlight.trim()) return text;
  
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cleanHighlight = escapeRegExp(highlight.replace(/[.,\s]/g, ""));
  const pattern = cleanHighlight.split('').join('[.,\\s]?');
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className={className}>{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

  if (loading) return <TimelineSkeleton />;

  const calculatedTotalValue = job?.project_items?.reduce((acc: number, item: any) => {
    return acc + (Number(item.price) || 0);
  }, 0) || (job?.temporary_price || 0);

  const getProgressColor = (progress: number) => {
    if (progress <= 25) return "bg-red-500";
    if (progress >= 100) return "bg-emerald-500";
    return "bg-yellow-400";
  };

  const resetForm = () => {
    setNewLabel("");
    setNewDescription("");
    setNewQuantity("1");
    setNewBasePrice("");
    setNewExtraPrice("");
    setIsAddingItem(false);
    setEditingId(null);
  };

  const handleEditClick = (item: any) => {
    if (isProjectCompleted) return;
    setEditingId(item.id);
    setNewLabel(item.label);
    setNewDescription(item.description || "");
    setNewQuantity(item.quantity?.toString() || "1");
    setNewBasePrice(item.base_price?.toString() || "");
    setNewExtraPrice(item.extra_price?.toString() || "");
    setIsAddingItem(true);
  };
useEffect(() => {
  if (typeof setCurrentPage === 'function') {
    setCurrentPage(1);
  }
}, [searchTerm]);
  const handleDeleteItem = async () => {
    if (!itemToDelete || isProjectCompleted) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('project_items').delete().eq('id', itemToDelete);
      if (error) throw error;
      if (onUpdate) await onUpdate();
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async () => {
    if (!newLabel || !newBasePrice || !job?.id || isProjectCompleted) return;
    setIsSubmitting(true);
    const payload = {
      job_id: job.id,
      label: newLabel,
      description: newDescription,
      quantity: Number(newQuantity) || 1,
      base_price: Number(newBasePrice),
      extra_price: Number(newExtraPrice) || 0,
    };
    try {
      let result;
      if (editingId) {
        result = await supabase.from('project_items').update(payload).eq('id', editingId);
      } else {
        result = await supabase.from('project_items').insert([{
          ...payload,
          is_completed: true,
          execution_date: new Date().toISOString()
        }]);
      }
      if (result.error) throw result.error;
      if (onUpdate) await onUpdate();
      resetForm();
      setToastMessage(editingId ? "Item updated successfully!" : "Item added successfully!");
setShowSuccessToast(true);
setTimeout(() => setShowSuccessToast(false), 2000);
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

 return (
   <div className="max-w-[1400px] ml-0 mr-auto animate-in fade-in slide-in-from-left-4 duration-500 px-0 sm:px-4 relative">
      
      {/* STATUS CHANGE MODAL */}
      {statusToChange && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border-2 border-slate-100">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
        <RefreshCcw size={32} />
      </div>
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Change Status?</h3>
      <p className="text-slate-500 text-sm font-medium mb-8">
        Are you sure you want to set the project status to <span className="font-bold text-slate-900">{statusToChange.toUpperCase()}</span>?
      </p>
      <div className="flex gap-3">
        <button 
          onClick={() => setStatusToChange(null)} 
          className="flex-1 px-6 py-4 rounded-2xl font-black uppercase text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 hover:scale-110 active:scale-95 transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={handleUpdateStatus} 
          disabled={isSubmitting} 
          className="flex-1 px-6 py-4 rounded-2xl font-black uppercase text-xs text-white bg-emerald-500 hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Confirm"}
        </button>
      </div>
    </div>
  </div>
)}

{viewingDescription && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-[32px] max-w-lg w-full shadow-2xl border-2 border-slate-200 overflow-hidden">
      
      {/* HEADER: Prilagođen za mobitel da sve stane u red */}
      <div className="bg-slate-900 p-6 sm:p-8 flex justify-between items-start sm:items-center gap-2 sm:gap-4 relative">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Work Item</p>
          <h3 className="text-base sm:text-xl font-black text-white uppercase tracking-tight leading-tight break-words sm:break-normal">
            {viewingDescription.label}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right shrink-0">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Price</p>
            <p className="text-yellow-400 font-black text-lg sm:text-xl italic leading-none mt-1">
              {Number(viewingDescription.price).toLocaleString()} €
            </p>
          </div>
          <button 
            onClick={() => setViewingDescription(null)} 
            className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-125 active:scale-90"
          >
            <X size={20} className="text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* SADRŽAJ MODALA */}
      <div className="p-6 sm:p-8">
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:scale-110 hover:bg-white hover:shadow-md transition-all">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Quantity</p>
            <p className="text-sm font-black text-slate-900">{viewingDescription.quantity || 1}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:scale-110 hover:bg-white hover:shadow-md transition-all">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Base Price</p>
            <p className="text-sm font-black text-slate-900">{viewingDescription.base_price} €</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 hover:scale-110 hover:bg-white hover:shadow-md transition-all">
            <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Variation</p>
            <p className="text-sm font-black text-emerald-700">+{viewingDescription.extra_price || 0} €</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 hover:scale-[1.02] transition-all">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Detailed Description</p>
          <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">
            {viewingDescription.description || "No additional description provided."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-500 mb-6 ml-1 group">
          <History size={14} className="text-blue-500 group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Execution Date: {new Date(viewingDescription.execution_date || viewingDescription.created_at).toLocaleDateString('en-GB')}
          </span>
        </div>

        <button 
          onClick={() => setViewingDescription(null)} 
          className="w-full px-6 py-4 rounded-2xl font-black uppercase text-xs text-white bg-slate-900 hover:bg-yellow-400 hover:text-slate-900 hover:scale-105 transition-all duration-200 active:scale-95 shadow-xl"
        >
          Close Details
        </button>
      </div>
      
    </div>
  </div>
)}

{showFormulaInfo && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-slate-100">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 hover:scale-110 transition-transform">
          <Calculator size={24} />
        </div>
        <button onClick={() => setShowFormulaInfo(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all hover:scale-125 active:scale-90">
          <X size={20} className="text-slate-400" />
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Project Overview</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          On this site, you can find all work items and activities tracked for this project.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-105 hover:bg-white hover:border-blue-200 transition-all">
          <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Total Item Price</p>
          <p className="text-sm font-bold text-slate-700 italic">(Quantity × Base Price) + Extra Costs</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-105 hover:bg-white hover:border-emerald-200 transition-all">
          <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Project Progress (%)</p>
          <p className="text-sm font-bold text-slate-700 italic leading-relaxed">
            Sum of all realized "Base Prices" divided by the total Contracted Budget.
          </p>
        </div>
      </div>
      
      <button 
        onClick={() => setShowFormulaInfo(false)} 
        className="w-full mt-8 px-6 py-4 rounded-2xl font-black uppercase text-xs text-white bg-slate-900 transition-all duration-300 hover:bg-yellow-400 hover:text-slate-900 hover:scale-105 active:scale-95 shadow-lg"
      >
        Understood
      </button>
    </div>
  </div>
)}

      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-sm-w-full shadow-2xl border-2 border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Delete Work Item?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">This action is permanent.</p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 px-6 py-4 rounded-2xl font-black uppercase text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 hover:scale-110 active:scale-95 transition-all">Cancel</button>
              <button onClick={handleDeleteItem} disabled={isSubmitting} className="flex-1 px-6 py-4 rounded-2xl font-black uppercase text-xs text-white bg-red-500 hover:bg-red-600 hover:scale-110 active:scale-95 transition-all shadow-lg flex items-center justify-center">
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

<div className="w-full">
  <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden">    

{/* HEDER */}
<div className="w-full bg-white border-b border-slate-100">
  
  <div className="px-4 py-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    
    {/* MOBILNI RED 1: LIVE DATE + INFO + TOTAL PRICE */}
    <div className="flex lg:hidden items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="bg-slate-900 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:scale-110 transition-transform">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-yellow-400 font-black uppercase text-[10px] tracking-tighter">Live Project Data</span>
        </div>
        <button onClick={() => setShowFormulaInfo(true)} className="p-1 text-slate-300 hover:scale-125 transition-all">
          <HelpCircle size={18} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 bg-yellow-400 pl-1.5 pr-3 py-1.5 rounded-xl border border-slate-800 shadow-sm hover:scale-110 transition-all">
        <div className={`p-1 rounded-md text-white ${getProgressColor(job?.progress || 0)}`}>
          <TrendingUp size={12} />
        </div>
        <div>
          <p className="text-[6px] font-black text-slate-900 uppercase leading-none">Total price</p>
          <p className="text-[13px] font-black text-slate-900 italic leading-none mt-0.5">
            {calculatedTotalValue.toLocaleString()} €
          </p>
        </div>
      </div>
    </div>

    {/* MOBILNI RED 2: Kompaktni Progress & Search/Sort */}
    <div className="lg:hidden flex items-center gap-2 w-full h-10 relative">
      {isSearchOpen ? (
        <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" size={14} strokeWidth={3} />
            <input 
              autoFocus
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-yellow-400 rounded-xl pl-9 pr-8 py-2 text-[11px] font-bold outline-none shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:scale-125 transition-all">
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}
            className="p-2 bg-slate-900 text-yellow-400 rounded-xl border-2 border-slate-900 shadow-md hover:scale-110 active:scale-90 transition-all"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 flex items-center gap-3 bg-slate-900 px-3 py-2 rounded-xl border-b-2 border-yellow-400 h-full hover:scale-[1.02] transition-all">
            <span className="text-xs font-black text-yellow-400 italic shrink-0">{job?.progress || 0}%</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getProgressColor(job?.progress || 0)}`} style={{ width: `${job?.progress || 0}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 h-full">
            <button onClick={() => setIsSearchOpen(true)} className="h-full px-3 bg-slate-50 text-slate-400 rounded-xl border-2 border-slate-200 hover:scale-110 active:scale-90 transition-all">
              <Search size={14} strokeWidth={3} />
            </button>
            <div className="relative h-full">
              <button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="h-full px-3 bg-slate-50 text-slate-400 rounded-xl border-2 border-slate-200 hover:scale-110 active:scale-90 transition-all">
                <Filter size={14} strokeWidth={3} />
              </button>
              {isSortMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 rounded-xl shadow-2xl z-[100] p-1 border border-slate-800">
                  <button onClick={() => { setSortOrder('desc'); setIsSortMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-all ${sortOrder === 'desc' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400'}`}>Newest {sortOrder === 'desc' && <Check size={12} strokeWidth={4} />}</button>
                  <button onClick={() => { setSortOrder('asc'); setIsSortMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-all ${sortOrder === 'asc' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400'}`}>Oldest {sortOrder === 'asc' && <Check size={12} strokeWidth={4} />}</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
    {/* --- DESKTOP ORIGINAL (Samo na Desktopu) --- */}

    {/* DESKTOP ORIGINAL 1. LIJEVO */}
    <div className="hidden lg:flex items-center gap-3 shrink-0">
      <div className="bg-slate-900 px-4 py-2 rounded-xl flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-yellow-400 font-black uppercase text-xs tracking-tighter">Live Project Data</span>
      </div>
      <button onClick={() => setShowFormulaInfo(true)} className="p-1 text-slate-300 hover:text-blue-500 transition-colors">
        <HelpCircle size={18} />
      </button>
    </div>

    {/* DESKTOP ORIGINAL SREDINA: Progress Bar & Percentage */}
    <div className="hidden lg:block flex-1 min-w-0">
      {isSearchOpen ? (
        <div className="w-full flex items-center gap-2 animate-in slide-in-from-top-1 duration-300">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={16} strokeWidth={3} />
            <input 
              autoFocus
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-yellow-400 rounded-xl pl-10 pr-10 py-2 text-xs font-bold outline-none shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}
            className="p-2 bg-slate-900 text-yellow-400 rounded-xl hover:bg-slate-800 transition-all border-2 border-slate-900"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full animate-in fade-in duration-500">
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border-b-4 border-yellow-400 shadow-lg shrink-0">
            <span className="text-xl sm:text-2xl font-black text-yellow-400 italic tracking-tighter leading-none">
              {job?.progress || 0}%
            </span>
          </div>

          <div className="h-2.5 flex-1 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(job?.progress || 0)}`}
              style={{ width: `${job?.progress || 0}%` }}
            />
          </div>

          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-widest shrink-0 ${
            job?.status === 'completed' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            {job?.status === 'completed' ? '● Completed' : '○ Active'}
          </span>
        </div>
      )}
    </div>

    {/* DESKTOP ORIGINAL DESNO: Search, Sort & Total Price */}
    <div className="hidden lg:flex items-center justify-end gap-2 shrink-0">
      <div className="flex items-center gap-2">
        {!isSearchOpen && (
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 bg-slate-50 hover:bg-yellow-400 text-slate-400 hover:text-slate-900 rounded-xl border-2 border-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <Search size={18} strokeWidth={3} />
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className="flex items-center bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-yellow-400 transition-all group overflow-hidden shadow-sm"
          >
            <div className="pl-3 pr-2 text-slate-400 group-hover:text-yellow-500 transition-colors border-r border-slate-200 my-2">
              <Filter size={14} strokeWidth={3} />
            </div>
            <div className="pl-3 pr-9 py-2.5 text-[10px] font-black uppercase text-slate-600 min-w-[110px] text-left">
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown 
                size={14} 
                strokeWidth={3} 
                className={`transition-transform duration-300 ${isSortMenuOpen ? 'rotate-180 text-yellow-500' : ''}`} 
              />
            </div>
          </button>

          {isSortMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-[18px] shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                <div className="p-1.5 flex flex-col gap-1">
                  <button
                    onClick={() => { setSortOrder('desc'); setIsSortMenuOpen(false); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      sortOrder === 'desc' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Newest First
                    {sortOrder === 'desc' && <Check size={12} strokeWidth={4} />}
                  </button>
                  <button
                    onClick={() => { setSortOrder('asc'); setIsSortMenuOpen(false); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      sortOrder === 'asc' ? 'bg-yellow-400 text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Oldest First
                    {sortOrder === 'asc' && <Check size={12} strokeWidth={4} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-yellow-400 pl-1.5 pr-4 py-1.5 rounded-2xl border border-slate-800 shadow-lg">
        <div className={`p-1.5 rounded-lg text-white ${getProgressColor(job?.progress || 0)}`}>
          <TrendingUp size={14} />
        </div>
        <div>
          <p className="text-[7px] font-black text-slate-900 uppercase tracking-tight leading-none">Total price</p>
          <p className="text-[16px] font-black text-slate-900 italic leading-none mt-0.5">
            {calculatedTotalValue.toLocaleString()} €
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* DRUGI RED (SAMO ZA FIRMU / ADMINA) */}
{isAdmin && (
  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 overflow-visible">
    {/* LIJEVO: Project Status */}
    <div className="flex items-center justify-between lg:justify-start gap-3">
      <span className="text-[10px] lg:text-[11px] font-black uppercase text-slate-600 tracking-widest">
        Project Status:
      </span>
      <button
        disabled={isSubmitting}
        onClick={() => setStatusToChange(job?.status === 'completed' ? 'active' : 'completed')}
        className="relative flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-[150px] lg:w-[180px] h-[32px] lg:h-[36px] overflow-hidden transition-all active:scale-95"
      >
        <div className={`absolute top-1 bottom-1 transition-all duration-300 ease-out rounded-lg ${job?.status === 'completed' ? 'left-[50%] right-1 bg-emerald-500 shadow-md' : 'left-1 right-[50%] bg-yellow-400 shadow-md'}`} />
        <div className="relative z-10 flex w-full h-full text-[8px] lg:text-[9px] font-black uppercase">
          <span className={`flex-1 flex items-center justify-center transition-colors duration-300 ${job?.status !== 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>Active</span>
          <span className={`flex-1 flex items-center justify-center transition-colors duration-300 ${job?.status === 'completed' ? 'text-white' : 'text-slate-400'}`}>Completed</span>
        </div>
      </button>
    </div>

    {/* DESNO: Show Items + Add Work */}
    <div className="flex items-center justify-between w-full lg:w-auto gap-3 overflow-visible">
      <div className="flex items-center gap-2">
        {/* Labela vidljiva i na mobitelu */}
        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Show items:</span>
        <div className="relative">
          <button onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)} className="flex items-center gap-2 bg-white rounded-xl border-2 border-slate-200 px-3 py-2 hover:border-yellow-400 transition-all shadow-sm active:scale-95 group min-w-[65px] justify-between">
            <span className="text-[10px] font-black uppercase text-slate-900">{itemsPerPage}</span>
            <ChevronDown size={12} strokeWidth={3} className="text-slate-400" />
          </button>
          {isItemsPerPageOpen && (
             <div className="absolute top-full mt-2 left-0 w-full min-w-[80px] bg-white border-2 border-slate-900 rounded-2xl shadow-xl z-[110] overflow-hidden">
                {[5, 10, 15, 20].map((num) => (
                  <button key={num} onClick={() => { setItemsPerPage(num); setIsItemsPerPageOpen(false); }} className={`w-full px-4 py-2.5 text-[10px] font-black uppercase ${itemsPerPage === num ? 'bg-yellow-400 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>{num}</button>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Smanjen gumb na mobitelu (manji px i širina), originalan na desktopu */}
      <button 
        disabled={isProjectCompleted} 
        onClick={() => { resetForm(); setIsAddingItem(!isAddingItem); }} 
        className={`flex-none lg:flex-none flex items-center justify-center gap-2 px-3 lg:px-5 py-2.5 rounded-xl font-black uppercase text-[10px] transition-all shadow-md active:scale-95 min-w-[90px] lg:min-w-0 ${
          isProjectCompleted ? 'bg-slate-300 text-slate-500' : 'bg-[#0f172a] text-white hover:bg-yellow-400 hover:text-slate-900'
        }`}
      >
        {isAddingItem ? <><X size={14} strokeWidth={4} /> Close</> : <><Plus size={14} strokeWidth={4} /> Add work item</>}
      </button>
    </div>
  </div>
)}
</div>
<div className="p-4 sm:p-8">
  {/* SELECT ZA BROJ STAVKI - Postavljen na početak */}
{!isAdmin && (
  <div className="mb-6 flex items-center justify-between gap-3">
    {/* NOVO: Tekst s lijeve strane */}
 <div className="hidden sm:flex items-center gap-3">
  {/* Mali žuti vertikalni marker da privuče oko */}
  <div className="w-1 h-4 bg-yellow-400 rounded-full" />
 <div className="flex flex-col space-y-1 py-1"> 
  {/* space-y-1 dodaje razmak između redova, a py-1 dodaje padding iznad i ispod cijelog bloka */}
  <p className="text-[12px] font-black uppercase text-slate-900 tracking-wider italic">
    Work History
  </p>
  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">
    List of completed items so far
  </p>
</div>
</div>

    {/* Desni dio: Show items i dropdown - ostaje netaknut u drugom divu radi poravnanja */}
    <div className="flex items-center gap-3 ml-auto">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
        Show items:
      </span>
      <div className="relative">
        {/* Glavni Gumb / Trigger */}
        <button
          onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}
          className="flex items-center gap-2 bg-white rounded-xl border-2 border-slate-200 px-3 py-2 hover:border-yellow-400 transition-all shadow-sm active:scale-95 group min-w-[70px] justify-between"
        >
          <span className="text-[11px] font-black uppercase text-slate-700">
            {itemsPerPage}
          </span>
          <ChevronDown 
            size={14} 
            strokeWidth={3} 
            className={`text-slate-400 transition-transform duration-300 ${isItemsPerPageOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu - Custom stil identičan onom za admina */}
        {isItemsPerPageOpen && (
          <>
            {/* Overlay koji zatvara menu na klik izvan njega */}
            <div 
              className="fixed inset-0 z-[100]" 
              onClick={() => setIsItemsPerPageOpen(false)} 
            />
            
            <div className="absolute top-full mt-2 right-0 w-full min-w-[80px] bg-white border-2 border-slate-900 rounded-2xl shadow-[0_8px_0_0_rgba(15,23,42,0.1)] z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setItemsPerPage(num);
                    setCurrentPage(1);
                    setIsItemsPerPageOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-[11px] font-black uppercase transition-all flex items-center justify-between
                    ${itemsPerPage === num 
                      ? 'bg-yellow-400 text-slate-900' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {num}
                  {itemsPerPage === num && <Check size={12} strokeWidth={4} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}

{isAdmin && isAddingItem && !isProjectCompleted && (
  <>
    {/* FORMA ZA UNOS */}
    <div className="relative mb-8 p-6 bg-slate-50 rounded-[24px] border-2 border-yellow-400/30 animate-in zoom-in-95 duration-300">
      
      {/* MALI X GUMB ZA RESET I ZATVARANJE */}
      <button 
        onClick={() => {
          resetForm();
          setIsAddingItem(false);
        }}
        className="absolute top-2 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        title="Discard and close"
      >
        <X size={18} strokeWidth={3} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Work Label */}
        <div className="md:col-span-3">
          <label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-1">
            Work Label <span className="text-slate-400 font-bold">*</span>
          </label>
          <input 
            type="text" 
            placeholder="e.g. Living room wall painting"
            value={newLabel} 
            onChange={(e) => { setNewLabel(e.target.value); setShowErrors(false); setAttemptedSubmit(false); }} 
            className={`w-full bg-white border-2 rounded-2xl p-4 text-sm font-bold outline-none transition-all ${
              (showErrors || attemptedSubmit) && !newLabel ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-200 focus:border-yellow-400'
            }`} 
          />
        </div>

        {/* Detailed Description */}
        <div className="md:col-span-3">
          <label className="text-[9px] font-black uppercase text-slate-500 ml-1 flex items-center gap-1">
            Detailed Description <span className="text-slate-400 font-bold">*</span>
          </label>
          <textarea 
            value={newDescription} 
            onChange={(e) => { setNewDescription(e.target.value); setShowErrors(false); setAttemptedSubmit(false); }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
            placeholder="Add details about this work item..."
            className={`w-full bg-white border-2 rounded-2xl p-4 text-sm font-bold outline-none transition-all min-h-[56px] max-h-[200px] overflow-y-auto resize-none block ${
              (showErrors || attemptedSubmit) && !newDescription ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-200 focus:border-yellow-400'
            }`}
            rows={1}
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[9px] font-black uppercase text-slate-600 ml-1 flex items-center gap-1">
            Quantity <span className="text-slate-400 font-bold">*</span>
          </label>
          <input 
            type="number" 
            step="0.01" 
            value={newQuantity} 
            onChange={(e) => { setNewQuantity(e.target.value); setShowErrors(false); setAttemptedSubmit(false); }} 
            className={`w-full bg-white border-2 rounded-2xl p-4 text-sm font-bold outline-none transition-all ${
              (showErrors || attemptedSubmit) && !newQuantity ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-200 focus:border-yellow-400'
            }`} 
          />
        </div>

        {/* BASE Price */}
        <div>
          <label className="text-[9px] font-black uppercase text-slate-600 ml-1 flex items-center gap-1">
            BASE Price (€) <span className="text-slate-400 font-bold">*</span>
          </label>
          <input 
            type="number" 
            value={newBasePrice} 
            onChange={(e) => { setNewBasePrice(e.target.value); setShowErrors(false); setAttemptedSubmit(false); }} 
            className={`w-full bg-white border-2 rounded-2xl p-4 text-sm font-bold outline-none transition-all ${
              (showErrors || attemptedSubmit) && !newBasePrice ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-200 focus:border-yellow-400'
            }`} 
          />
        </div>

        {/* Variation Works */}
        <div>
          <label className="text-[9px] font-black uppercase text-slate-600 ml-1">
            Cost of Variation Works (€)
          </label>
          <input 
            type="number" 
            value={newExtraPrice} 
            onChange={(e) => setNewExtraPrice(e.target.value)} 
            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-emerald-400 transition-all" 
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-3">
          <button 
            type="button"
            onClick={() => {
              if (!newLabel || !newDescription || !newQuantity || !newBasePrice) {
                setShowErrors(true);
                setAttemptedSubmit(true);
                return;
              }
              setShowConfirmModal(true);
            }}
            className={`w-full p-4 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] ${
              (showErrors || attemptedSubmit) && (!newLabel || !newDescription || !newQuantity || !newBasePrice)
              ? 'bg-red-500 text-white animate-shake' 
              : 'bg-slate-900 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900'
            }`}
          >
            {(showErrors || attemptedSubmit) && (!newLabel || !newDescription || !newQuantity || !newBasePrice) ? (
              <>Fill Required Fields!</>
            ) : (
              <>
                <Plus size={18} strokeWidth={3} />
                {editingId ? "Review Changes" : "Add work item"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* CUSTOM CONFIRMATION DIALOG (MODAL) */}
    {showConfirmModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setShowConfirmModal(false)} 
        />
        
        <div className="relative bg-white w-full max-w-md rounded-[32px] border-2 border-slate-900 p-8 shadow-[0_20px_0_0_rgba(15,23,42,0.1)] animate-in zoom-in-95 duration-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-slate-900 rotate-3">
              <Check size={32} className="text-slate-900" strokeWidth={3} />
            </div>
            
            <h3 className="text-xl font-black uppercase text-slate-900 mb-2">
              {editingId ? "Confirm Update" : "Confirm Execution"}
            </h3>
            
            <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-tight">
              Review details for <span className="text-slate-900 underline">"{newLabel}"</span>
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-100 mb-8 space-y-3">
               <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                 <span>Base Work:</span>
                 <span className="text-slate-900 font-bold">{newQuantity} x {newBasePrice} €</span>
               </div>
               
               {Number(newExtraPrice) > 0 && (
                 <div className="flex justify-between text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                   <span>Variation Works:</span>
                   <span>+ {Number(newExtraPrice).toFixed(2)} €</span>
                 </div>
               )}

               <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-slate-200">
                 <span className="text-[10px] font-black uppercase text-slate-600">Total Amount:</span>
                 <span className="text-xl font-black text-slate-900 italic">
                   {(Number(newQuantity) * Number(newBasePrice) + Number(newExtraPrice)).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                 </span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-4 rounded-xl border-2 border-slate-200 text-slate-600 font-black uppercase text-[10px] hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  await handleAddItem();
                  setShowConfirmModal(false);
                  setShowErrors(false);
                  setAttemptedSubmit(false);
                }}
                className="p-4 rounded-xl bg-slate-900 text-yellow-400 font-black uppercase text-[10px] hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Yes, Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
)}
  <div className="space-y-4">
    {job?.project_items && job.project_items.length > 0 ? (
      (() => {
        const filteredAndSorted = job.project_items
          .filter((item: any) => {
            const search = searchTerm.toLowerCase().replace(/[.,\s]/g, "");
            const labelMatch = item.label.toLowerCase().includes(search);
            const rawPrice = Math.round(Number(item.price)).toString(); 
            const priceMatch = rawPrice.includes(search);
            return labelMatch || priceMatch;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
          });

        const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredAndSorted.slice(indexOfFirstItem, indexOfLastItem);

        if (filteredAndSorted.length === 0) {
          return (
            <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                No results matching your search
              </p>
            </div>
          );
        }

        return (
          <>
            {currentItems.map((item: any, index: number) => {
              const absoluteIndex = indexOfFirstItem + index;
              const displayId = sortOrder === "desc" 
                ? filteredAndSorted.length - absoluteIndex 
                : absoluteIndex + 1;

             return (
  <div 
    key={item.id} 
    onClick={() => setViewingDescription(item)}
    className="flex flex-col p-5 bg-slate-50 border-2 border-slate-300 rounded-[24px] hover:bg-white hover:shadow-xl hover:border-slate-400 transition-all group relative cursor-pointer"
  >
    <div className="absolute -left-3 top-6 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-sm z-10">
      <span className="text-[10px] font-black text-slate-400 italic">
        #{displayId}
      </span>
    </div>

    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div className="flex items-start gap-4 w-full">
        {/* DESKTOP KVACICA - DIRAJ NE */}
        <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-2xl items-center justify-center border bg-emerald-50 text-emerald-500 border-emerald-100 shadow-sm">
          <Check className="w-5 h-5" strokeWidth={3} />
        </div>
        
        <div className="flex flex-col w-full">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {/* MOBILNA KVACICA */}
            <div className="sm:hidden w-5 h-5 shrink-0 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 border border-emerald-100">
              <Check size={12} strokeWidth={4} />
            </div>

            <span className="text-[14px] sm:text-[16px] font-black uppercase text-slate-900 tracking-tight leading-tight">
              {highlightText(item.label, searchTerm)}
            </span>
            
            {/* VIEW DETAILS */}
            {item.description && (
              <div className="hidden sm:flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-blue-600 shadow-sm">
                <Eye size={10} />
                <span className="text-[9px] font-black uppercase">View Details</span>
              </div>
            )}
          </div>

          {/* RED 2: PODACI */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3.5">
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
              <span className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase">Qty:</span>
              <span className="text-[9px] sm:text-[11px] text-slate-900 font-black uppercase">{item.quantity || 1}</span>
              <div className="w-px h-2 bg-slate-200 mx-1" />
              <span className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase">Base:</span>
              <span className="text-[9px] sm:text-[11px] text-slate-900 font-black uppercase">{item.base_price} €</span>
            </div>
            
            {/* ADDITIONAL COSTS */}
            {item.extra_price > 0 && (
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 shadow-sm">
                <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase">Additional Costs:</span>
                <span className="text-[9px] sm:text-[11px] text-emerald-700 font-black uppercase">
                  + {item.extra_price} €
                </span>
              </div>
            )}

            {/* DESKTOP GUMBI - OSTAVLJENI KAKO SU BILI */}
            {isAdmin && !isProjectCompleted && (
              <div className="hidden sm:flex items-center gap-2 ml-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} 
                  className="group/edit flex items-center gap-2 px-3 py-2 hover:bg-slate-900 bg-white rounded-xl text-slate-600 hover:text-yellow-400 transition-all border border-slate-100 shadow-sm"
                >
                  <Pencil size={16} />
                  <span className="text-[12px] font-black uppercase tracking-tight">Edit</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }} 
                  className="group/del flex items-center gap-2 px-3 py-2 hover:bg-red-500 bg-white rounded-xl text-slate-600 hover:text-white transition-all border border-slate-100 shadow-sm"
                >
                  <Trash2 size={16} />
                  <span className="text-[12px] font-black uppercase tracking-tight">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP DESNA STRANA - DIRAJ NE */}
      <div className="hidden sm:flex flex-col items-end shrink-0 gap-2">
        <div className="flex items-center gap-1 text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-lg shadow-sm">
          <History size={10} className="text-blue-400" />
          <span className="text-[10px] font-bold text-slate-600">
            {new Date(item.updated_at || item.execution_date || item.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-[16px] font-black text-slate-900 bg-yellow-400 px-4 py-2 rounded-2xl border-2 border-slate-100 italic shadow-sm">
          {highlightText(Number(item.price).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }), searchTerm, "bg-slate-900 text-white px-1 rounded-md not-italic")} €
        </span>
      </div>

      {/* MOBILNI RED 3: EDIT, DELETE, LAST UPDATE, CIJENA */}
      <div className="sm:hidden flex items-center justify-between w-full mt-3 pt-3 border-t border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          {isAdmin && !isProjectCompleted && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} 
                className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600"
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }} 
                className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-slate-500">
            <History size={10} />
            <span className="text-[9px] font-black">
              {new Date(item.updated_at || item.execution_date || item.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <span className="text-[14px] font-black text-slate-900 bg-yellow-400 px-3 py-1 rounded-xl border border-slate-100 italic">
          {Number(item.price).toLocaleString('de-DE')} €
        </span>
      </div>
    </div>
  </div>
);
            })}

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 pt-4 border-t border-slate-100">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={filteredAndSorted.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        );
      })()
    ) : (
      <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          No project items recorded yet
        </p>
      </div>
    )}
  </div>
</div>
    
  </div>
</div>
{/* SUCCESS TOAST */}
{showSuccessToast && (
  <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top duration-300">
    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl border-2 border-emerald-500 shadow-2xl flex items-center gap-3">
      <div className="bg-emerald-500 p-1 rounded-lg">
        <Check size={16} className="text-slate-900" strokeWidth={4} />
      </div>
      <span className="text-xs font-black uppercase tracking-wider">
        {toastMessage}
      </span>
    </div>
  </div>
)}
    </div>
    
  
  );
}