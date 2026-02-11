"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, UploadCloud, MapPin, CheckCircle2, User, Phone, Mail, CreditCard, X, ChevronDown } from "lucide-react";
import { COUNTIES } from "@/lib/onboarding-data";

export default function GeneralTab({ isEditing, formData, setFormData, company, userEmail, previewUrl, fileInputRef, setSelectedFile, setPreviewUrl, InfoField }: any) {
  const [countyOpen, setCountyOpen] = useState(false);
  const [countySearch, setCountySearch] = useState("");
  const countyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countyRef.current && !countyRef.current.contains(event.target as Node)) {
        setCountyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCounties = COUNTIES.filter((c: string) => 
    c.toLowerCase().includes(countySearch.toLowerCase())
  );

  const selectCounty = (county: string) => {
    setFormData({ ...formData, base_county: county });
    setCountySearch("");
    setCountyOpen(false);
  };

  // Pomoćna komponenta za inpute unutar Contact & Legal sekcije
  const EditableInput = ({ value, onChange, placeholder }: any) => (
    <input 
      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all shadow-sm"
      value={value || ""} 
      onChange={onChange}
      placeholder={placeholder}
    />
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Profile/Logo Card */}
      <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 md:mb-8">General Information</h3>
        
        <div className="flex flex-row items-center md:items-start gap-4 md:gap-8">
          <div
            onClick={() => isEditing && fileInputRef.current?.click()}
            className={`w-20 h-20 md:w-32 md:h-32 bg-slate-50 rounded-[24px] md:rounded-[32px] flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden group relative transition-all duration-300 ${isEditing ? 'cursor-pointer ring-2 ring-yellow-400/20 border-yellow-400 scale-105 shadow-lg' : 'hover:scale-105 shadow-inner'}`}
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Logo" />
            ) : (
              <Building2 className="text-slate-200 transition-transform group-hover:scale-110 w-8 h-8 md:w-10 md:h-10" />
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-100 transition-opacity backdrop-blur-[2px]">
                <UploadCloud size={20} className="animate-bounce" />
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setSelectedFile(file);
              setPreviewUrl(URL.createObjectURL(file));
            }} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="grid gap-3 md:gap-4 w-full">
                <input
                  className="w-full bg-white border-2 border-yellow-400/30 rounded-xl p-2.5 md:p-3 font-bold text-lg md:text-xl focus:outline-yellow-400 focus:border-yellow-400 transition-all shadow-sm"
                  value={formData?.company_name || ""}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Company Name"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <input className="w-full bg-white border border-slate-200 rounded-xl p-2.5 md:p-3 text-sm font-bold focus:outline-yellow-400 focus:border-yellow-400 transition-all shadow-sm" value={formData?.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address & Number" />
                  
                  <div className="relative" ref={countyRef}>
                    <div className="relative flex items-center">
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 md:p-3 pr-10 text-sm font-bold focus:outline-yellow-400 focus:border-yellow-400 transition-all shadow-sm placeholder:text-slate-400" 
                        value={countyOpen ? countySearch : (formData?.base_county || "")} 
                        onChange={(e) => {
                          setCountySearch(e.target.value);
                          if (!countyOpen) setCountyOpen(true);
                        }}
                        onFocus={() => setCountyOpen(true)}
                        placeholder="Search County..." 
                      />
                      <div className="absolute right-3 flex items-center gap-1.5">
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${countyOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {countyOpen && (
                      <div className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl max-h-[200px] overflow-y-auto p-2 animate-in zoom-in-95 duration-200">
                        {filteredCounties.length > 0 ? filteredCounties.map((county) => (
                          <button
                            key={county}
                            onClick={() => selectCounty(county)}
                            className="w-full px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-yellow-400 transition-all text-left"
                          >
                            {county}
                          </button>
                        )) : <p className="p-3 text-[10px] text-center text-slate-400 italic">No results found.</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="group space-y-1">
                <div className="flex items-center gap-2 md:gap-3 transition-transform duration-300 group-hover:translate-x-1">
                  <h2 className="text-lg md:text-3xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                    {company?.company_name || "Company Name"}
                  </h2>
                  {company?.is_verified && <CheckCircle2 className="text-blue-500 shrink-0" size={18} />}
                </div>
                
                <div className="space-y-0.5 md:space-y-1 transition-transform duration-300 group-hover:translate-x-2">
                  <p className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                    <MapPin size={12} className="text-yellow-500 shrink-0" /> 
                    <span className="truncate">{company?.address || "No address provided"}</span>
                  </p>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {company?.base_county || "No county specified"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Legal Card */}
      <div className={`bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border transition-all duration-300 ${isEditing ? 'border-yellow-400/50 shadow-md ring-1 ring-yellow-400/10' : 'border-slate-100 shadow-sm'}`}>
        <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 transition-colors ${isEditing ? 'text-yellow-600' : 'text-slate-400'}`}>Contact & Billing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4 md:space-y-5">
            <div className={`p-3 rounded-2xl border transition-all duration-300 ${isEditing ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}>
              <InfoField icon={<User size={18} />} label="Owner Full Name" value={isEditing ? <EditableInput value={formData?.owner_full_name} onChange={(e: any) => setFormData({ ...formData, owner_full_name: e.target.value })} /> : company?.owner_full_name} />
            </div>
            <div className={`p-3 rounded-2xl border transition-all duration-300 ${isEditing ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}>
              <InfoField icon={<Phone size={18} />} label="Phone Number" value={isEditing ? <EditableInput value={formData?.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} /> : company?.phone} />
            </div>
          </div>
          <div className="space-y-4 md:space-y-5">
            <div className={`p-3 rounded-2xl border transition-all duration-300 ${isEditing ? 'bg-slate-100 border-transparent opacity-70' : 'bg-slate-50 border-transparent'}`}>
              <InfoField icon={<Mail size={18} />} label="Account Email" value={<span className="text-slate-600 truncate block">{userEmail}</span>} />
            </div>
            <div className={`p-3 rounded-2xl border transition-all duration-300 ${isEditing ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}>
              <InfoField icon={<CreditCard size={18} />} label="IBAN" value={isEditing ? <EditableInput value={formData?.iban} onChange={(e: any) => setFormData({ ...formData, iban: e.target.value })} /> : <span className="break-all font-mono text-[11px]">{company?.iban || "Not set"}</span>} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}