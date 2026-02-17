"use client";

import { ChevronDown, Search, Check, Lock, Camera, X, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

interface Step1Props {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  isPrefixOpen: boolean;
  setIsPrefixOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredCountries: any[];
  prefixRef: any;
  getFlagUrl: (flag: string) => string;
  COUNTRY_CODES: any[];
}

export default function Step1PersonalInfo({
  formData,
  setFormData,
  errors,
  isPrefixOpen,
  setIsPrefixOpen,
  searchQuery,
  setSearchQuery,
  filteredCountries,
  prefixRef,
  getFlagUrl,
  COUNTRY_CODES
}: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Max size is 2MB.");
        return;
      }
      setFormData({ ...formData, logo_file: file });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Personal Info</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Owner's contact details.</p>
      </div>
      
      <div className="space-y-5">
        {/* LOGO UPLOAD SECTION */}
        <div className="group">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-2 block">
            Company Logo <span className="text-red-500">*</span>
          </label>
          <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border-2 border-dashed rounded-2xl transition-all ${errors.logo_file ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-400'}`}>
            <div className={`relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-sm border flex items-center justify-center overflow-hidden shrink-0 ${errors.logo_file ? 'border-red-200' : 'border-slate-100'}`}>
              {formData.logo_file ? (
                <>
                  <img 
                    src={URL.createObjectURL(formData.logo_file)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, logo_file: null})}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <ImageIcon className={`${errors.logo_file ? 'text-red-200' : 'text-slate-200'}`} size={32} />
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-2 w-full">
              <p className={`text-[10px] font-bold uppercase leading-tight ${errors.logo_file ? 'text-red-500' : 'text-slate-500'}`}>
                {errors.logo_file ? errors.logo_file : "Upload your business logo"}
                <br/>
                <span className="text-[8px] font-medium lowercase opacity-70">Max size 2MB (JPG, PNG)</span>
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full sm:w-auto px-4 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${errors.logo_file ? 'bg-red-100 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white'}`}
              >
                <Camera size={14} />
                {formData.logo_file ? "Change Logo" : "Select Logo"}
              </button>
            </div>
          </div>
          {errors.logo_file && <p className="text-[9px] text-red-500 font-bold uppercase mt-1.5 ml-3">Logo is required to continue</p>}
        </div>

        {/* FULL NAME */}
        <div className="group">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-1.5 block">OWNER Full Name</label>
          <input 
            className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.owner_full_name ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600 focus:bg-white'}`} 
            placeholder="Enter name" 
            value={formData.owner_full_name} 
            onChange={e => setFormData({...formData, owner_full_name: e.target.value})} 
          />
          {errors.owner_full_name && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-3">{errors.owner_full_name}</p>}
        </div>
        
        {/* PHONE NUMBER */}
        <div className="group">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-3 mb-1.5 block">Phone Number</label>
          <div className="flex gap-2 w-full overflow-hidden">
            <div className="relative w-[110px] md:w-44 shrink-0" ref={prefixRef}>
              <button 
                type="button"
                onClick={() => {
                  setIsPrefixOpen(!isPrefixOpen);
                  setSearchQuery("");
                }}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold flex items-center justify-between focus:border-blue-600 transition-all hover:bg-slate-100"
              >
                <span className="flex items-center gap-1.5 overflow-hidden">
                  <img 
                    src={getFlagUrl(COUNTRY_CODES.find(c => c.code === formData.phone_prefix)?.flag || "hr")} 
                    alt="flag" 
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  <span className="truncate">{formData.phone_prefix}</span>
                </span>
                <ChevronDown size={14} className={`shrink-0 transition-transform ${isPrefixOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isPrefixOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 md:w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in zoom-in-95 duration-200">
                  <div className="px-3 pb-2 pt-1 border-b border-slate-50 mb-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        autoFocus
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:border-blue-200"
                        placeholder="Search country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar">
                    {filteredCountries.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setFormData({...formData, phone_prefix: c.code}); setIsPrefixOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <img src={getFlagUrl(c.flag)} alt={c.label} className="w-5 h-5 object-contain" />
                          <span className="truncate">{c.label}</span>
                          <span className="text-slate-400 shrink-0">({c.code})</span>
                        </span>
                        {formData.phone_prefix === c.code && <Check size={12} className="text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <input 
              className={`flex-1 min-w-0 p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.phone_number ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-600'}`} 
              placeholder="91 234 5678" 
              value={formData.phone_number} 
              onChange={e => setFormData({...formData, phone_number: e.target.value.replace(/\D/g, '')})} 
            />
          </div>
          {errors.phone_number && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-3">{errors.phone_number}</p>}
        </div>
      </div>

     
    </div>
  );
}