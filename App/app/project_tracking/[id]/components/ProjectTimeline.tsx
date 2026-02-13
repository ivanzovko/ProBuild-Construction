"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Loader2,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
  Calendar,
  HelpCircle,
  Calculator,
  Info
} from "lucide-react";
import { Tooltip } from "@components/Tooltip";
import { createBrowserClient } from "@supabase/ssr";

interface ProjectTimelineProps {
  job: any;
  loading?: boolean;
  isAdmin?: boolean; 
  onUpdate?: () => Promise<void> | void;
}

function TimelineSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start animate-pulse">
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-100 p-5 sm:p-8 h-64" />
      </div>
      <div className="lg:col-span-8 xl:col-span-7">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-100 h-96" />
      </div>
    </div>
  );
}

export default function ProjectTimeline({ 
  job, 
  loading, 
  isAdmin = false,
  onUpdate 
}: ProjectTimelineProps) {
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newBasePrice, setNewBasePrice] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  
  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (loading) return <TimelineSkeleton />;

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
    setEditingId(item.id);
    setNewLabel(item.label);
    setNewDescription(item.description || "");
    setNewQuantity(item.quantity?.toString() || "1");
    setNewBasePrice(item.base_price?.toString() || "");
    setNewExtraPrice(item.extra_price?.toString() || "");
    setIsAddingItem(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('project_items').delete().eq('id', itemToDelete);
      if (error) throw error;
      if (onUpdate) await onUpdate();
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async () => {
    if (!newLabel || !newBasePrice || !job?.id) return;
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
      else window.location.reload(); 
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error saving item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] ml-0 mr-auto animate-in fade-in slide-in-from-left-4 duration-500 px-0 sm:px-4 relative">
      
      {/* --- FORMULA INFO MODAL --- */}
      {showFormulaInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border-2 border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                <Calculator size={24} />
              </div>
              <button onClick={() => setShowFormulaInfo(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Calculation Logic</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Total Item Price</p>
                <p className="text-sm font-bold text-slate-700 italic">
                  (Quantity × Unit Price) + Extra Costs
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Project Progress (%)</p>
                <p className="text-sm font-bold text-slate-700 italic leading-relaxed">
                  Sum of all realized "Base Prices" divided by the total Contracted Budget.
                </p>
                <p className="text-[9px] text-slate-400 mt-2">Note: Extra costs do not increase progress percentage, only the final payment amount.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowFormulaInfo(false)}
              className="w-full mt-8 px-6 py-4 rounded-2xl font-black uppercase text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border-2 border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Delete Work Item?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">This action is permanent and will affect the total project progress and costs.</p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 px-6 py-4 rounded-2xl font-black uppercase text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleDeleteItem} disabled={isSubmitting} className="flex-1 px-6 py-4 rounded-2xl font-black uppercase text-xs text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center">
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Sidebar / Progress */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className="w-full flex items-center justify-between p-5 sm:p-8 text-left group"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Realized Progress</p>
              {isStatsOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isStatsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-5 sm:px-8 pb-5 sm:pb-8">
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4 mb-4 sm:mb-6">
                  <div className="flex flex-col">
                    <Tooltip content={`Progress based on ${job?.temporary_based_sum || 0} € of base contracted work`}>
                      <span className="text-4xl sm:text-6xl font-black text-slate-900 italic tracking-tighter leading-none cursor-help">
                        {job?.progress || 0}%&nbsp;
                      </span>
                    </Tooltip>
                    <span className="text-[9px] sm:text-[11px] font-black text-emerald-500 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit mt-2">
                      Verified Progress
                    </span>
                  </div>

                  <div className="flex flex-col items-end sm:items-start sm:pt-6 sm:border-t sm:border-slate-100 w-fit sm:w-full space-y-3">
                    <div className="flex items-center gap-2 sm:gap-4 sm:bg-slate-50 sm:p-4 sm:rounded-2xl sm:border sm:border-slate-100 w-full">
                      <div className="hidden sm:block p-2.5 bg-yellow-400 rounded-xl text-slate-900">
                        <TrendingUp size={22} />
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tight">Total  price work</p>
                        <p className="text-lg sm:text-xl font-black text-slate-900 italic leading-none">
                          {(job?.temporary_price || 0).toLocaleString()} €&nbsp;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-4 sm:h-6 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200 shadow-inner">
                  <div 
                    className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                    style={{ width: `${job?.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content / Project Items Log */}
        <div className="lg:col-span-8 xl:col-span-7">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="w-full p-5 sm:p-8 flex justify-between items-center bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <p className="text-[10px] sm:text-[12px] font-black text-slate-900 uppercase tracking-widest italic border-b-2 pb-1 border-yellow-400 w-fit">
                  Construction Log
                </p>
                <button 
                  onClick={() => setShowFormulaInfo(true)}
                  className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                  title="How is this calculated?"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => isAddingItem ? resetForm() : setIsAddingItem(true)}
                  className="flex items-center gap-2 bg-slate-900 text-yellow-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-400 hover:text-slate-900 transition-all shadow-lg active:scale-95"
                >
                  {isAddingItem ? <X size={14} /> : <Plus size={14} />}
                  {isAddingItem ? "Cancel" : "Add Work Item"}
                </button>
              )}
            </div>

            <div className="p-4 sm:p-8">
              {isAddingItem && (
                <div className="mb-8 p-6 bg-slate-50 rounded-[24px] border-2 border-yellow-400/30 animate-in zoom-in-95 duration-300 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Work Label / Title</label>
                      <input 
                        type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="e.g. Concrete Works - Ground Floor"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-yellow-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Quantity</label>
                      <input 
                        type="number" step="0.01" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)}
                        placeholder="1.00"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-yellow-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Unit Price (€)</label>
                      <input 
                        type="number" value={newBasePrice} onChange={(e) => setNewBasePrice(e.target.value)}
                        placeholder="Price per unit"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-yellow-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Extra / Increase (€)</label>
                      <input 
                        type="number" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)}
                        placeholder="Fixed extra amount"
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-emerald-400 transition-all"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Description (Optional)</label>
                      <textarea 
                        value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-yellow-400 transition-all h-20 resize-none"
                      />
                    </div>
                    <div className="md:col-span-3 flex items-end">
                      <button 
                        onClick={handleAddItem}
                        disabled={isSubmitting || !newLabel || !newBasePrice}
                        className="w-full bg-slate-900 text-yellow-400 p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                        {editingId ? "Save Changes" : "Confirm Execution"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {job?.project_items && job.project_items.length > 0 ? (
                  job.project_items
                    .slice()
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((item: any) => (
                      <div key={item.id} className="flex flex-col p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-md hover:border-slate-300 transition-all group gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center shadow-sm mt-0.5 border bg-emerald-50 text-emerald-500 border-emerald-100">
                              <Check className="w-4 h-4" strokeWidth={3} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] sm:text-[13px] font-black uppercase text-slate-800 tracking-tight leading-snug">
                                {item.label}
                              </span>
                              
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                  {item.quantity || 1} × {item.base_price} € <span className="text-[8px] opacity-60 ml-0.5">/ unit</span>
                                </span>
                                {item.extra_price > 0 && (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle size={10} className="text-emerald-500" />
                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
                                      + {item.extra_price} € Extra
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[12px] sm:text-[14px] font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border-2 border-slate-100 italic block">
                              {Number(item.price).toLocaleString()} €
                            </span>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-[10px] text-slate-500 font-medium px-1">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100/60">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar size={10} />
                              <span className="text-[9px] font-bold uppercase">
                                {new Date(item.execution_date || item.created_at).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                            {item.updated_at && new Date(item.updated_at).getTime() > new Date(item.created_at).getTime() + 1000 && (
                              <div className="flex items-center gap-1 text-emerald-500/80">
                                <Clock size={10} />
                                <span className="text-[9px] font-black uppercase italic">
                                  Last Updated: {new Date(item.updated_at).toLocaleDateString('en-GB')} {new Date(item.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => handleEditClick(item)} 
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => setItemToDelete(item.id)} 
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No project items recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}