"use client";

import { ChevronDown, Search, Check } from "lucide-react";

interface Step2Props {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  isCountyOpen: boolean;
  setIsCountyOpen: (open: boolean) => void;
  countySearchQuery: string;
  setCountySearchQuery: (query: string) => void;
  filteredCounties: string[];
  countyRef: React.RefObject<HTMLDivElement | null>;
}

export default function Step2BusinessDetails({
  formData,
  setFormData,
  errors,
  isCountyOpen,
  setIsCountyOpen,
  countySearchQuery,
  setCountySearchQuery,
  filteredCounties,
  countyRef
}: Step2Props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Business Details</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Official company information.</p>
      </div>
      
      <div className="grid gap-3">
        <div className="group">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-1.5 block">Company Name</label>
          <input 
            className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.company_name ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600'}`} 
            placeholder="Enter company name" 
            value={formData.company_name} 
            onChange={e => setFormData({...formData, company_name: e.target.value})} 
          />
          {errors.company_name && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-3">{errors.company_name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="group">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-1.5 block">PIN</label>
            <input 
              className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.oib ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600'}`} 
              placeholder="11 digits" 
              maxLength={11} 
              value={formData.oib} 
              onChange={e => setFormData({...formData, oib: e.target.value.replace(/\D/g, '')})} 
            />
            {errors.oib && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-3">{errors.oib}</p>}
          </div>

          <div className="group">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-1.5 block">IBAN</label>
            <input 
              className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.iban ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600'}`} 
              placeholder="HR00 0000 0000 0000 0000 0" 
              maxLength={34}
              value={formData.iban} 
              onChange={e => {
                let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (val.length <= 2) {
                  val = val.replace(/[0-9]/g, '');
                } else {
                  const letters = val.substring(0, 2).replace(/[0-9]/g, '');
                  const numbers = val.substring(2).replace(/[^0-9]/g, '');
                  val = letters + numbers;
                }
                setFormData({...formData, iban: val});
              }} 
            />
            {errors.iban && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-3">{errors.iban}</p>}
          </div>
        </div>

        <div className="group">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-1.5 block">Business Address</label>
          <input 
            className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.address ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600'}`} 
            placeholder="Street and number" 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
          />
          {errors.address && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-3">{errors.address}</p>}
        </div>
        
        <div className="relative group" ref={countyRef}>
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-1.5 block">HQ County</label>
          <button 
            type="button"
            onClick={() => {
              setIsCountyOpen(!isCountyOpen);
              setCountySearchQuery("");
            }}
            className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all hover:bg-slate-100 ${errors.base_county ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600'}`}
          >
            <span className={formData.base_county ? 'text-slate-900' : 'text-slate-400'}>
              {formData.base_county || "Select County"}
            </span>
            <ChevronDown size={14} className={`transition-transform ${isCountyOpen ? 'rotate-180' : ''}`} />
          </button>
          {errors.base_county && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-3">{errors.base_county}</p>}
          
          {isCountyOpen && (
            <div className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] animate-in zoom-in-95 origin-bottom duration-200 overflow-hidden">
              <div className="px-3 pb-2 pt-1 border-b border-slate-50 mb-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input 
                    autoFocus
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:border-blue-100"
                    placeholder="Search county..."
                    value={countySearchQuery}
                    onChange={(e) => setCountySearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                {filteredCounties.length > 0 ? (
                  filteredCounties.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setFormData({...formData, base_county: c}); setIsCountyOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {c}
                      {formData.base_county === c && <Check size={12} className="text-blue-600" />}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase italic">No results</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}