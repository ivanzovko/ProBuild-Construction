"use client";

import { Briefcase, MapPin, ChevronDown, Search, Check } from "lucide-react";

interface Step3Props {
  formData: any;
  errors: any;
  activeGroup: string;
  setActiveGroup: (group: string) => void;
  CATEGORY_GROUPS: any[];
  toggleSelection: (id: string, field: "categories" | "service_counties") => void;
  isCountyOpen: boolean;
  setIsCountyOpen: (open: boolean) => void;
  countySearchQuery: string;
  setCountySearchQuery: (query: string) => void;
  filteredCounties: string[];
  COUNTIES: string[];
  countyRef: React.RefObject<HTMLDivElement | null>;
}

export default function Step3ServicesReach({
  formData,
  errors,
  activeGroup,
  setActiveGroup,
  CATEGORY_GROUPS,
  toggleSelection,
  isCountyOpen,
  setIsCountyOpen,
  countySearchQuery,
  setCountySearchQuery,
  filteredCounties,
  COUNTIES,
  countyRef
}: Step3Props) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tight">
          Services & <span className="text-yellow-500">Reach</span>
        </h2>
        <p className="text-slate-500 text-[11px] sm:text-sm font-medium">Select your expertise and work areas.</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3 ml-1">
            <div className="p-1.5 sm:p-2 bg-blue-50 rounded-xl shrink-0">
              <Briefcase className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">
              Service Categories
            </h3>
          </div>
          
          <div className="flex flex-nowrap gap-4 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100">
            {CATEGORY_GROUPS.map((group) => (
              <button
                key={group.group}
                type="button"
                onClick={() => setActiveGroup(group.group)}
                className={`pb-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 relative ${
                  activeGroup === group.group 
                    ? "text-slate-900" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {group.group}
                {activeGroup === group.group && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 animate-in fade-in slide-in-from-left-2 duration-300" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[350px] sm:max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {CATEGORY_GROUPS.find(g => g.group === activeGroup)?.items.map((cat: any) => {
              const isSelected = formData.categories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleSelection(cat.id, "categories")}
                  className={`flex items-center gap-2 sm:gap-3 transition-all text-left group/card
                    p-2 rounded-xl border-[1.5px] border-slate-300
                    sm:p-4 sm:rounded-2xl sm:border-2
                    ${isSelected 
                      ? "bg-slate-900 border-slate-900 text-white shadow-md sm:scale-[1.01]" 
                      : "bg-white text-slate-600 hover:border-yellow-400 sm:border-slate-100"
                    }`}
                >
                  <div className={`shrink-0 ${isSelected ? "text-yellow-400" : "text-slate-400 group-hover/card:text-yellow-500"} transition-colors`}>
                    <div className="sm:scale-100 scale-75">
                      {cat.icon}
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight truncate">
                    {cat.title}
                  </span>
                  {isSelected && <Check size={12} className="ml-auto text-yellow-400 shrink-0" strokeWidth={4} />}
                </button>
              );
            })}
          </div>
          {errors.categories && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{errors.categories}</p>}
        </div>

        {/* SECTION: Service Counties - Pomaknuto gore na mobitelu */}
        <div className="space-y-2 sm:space-y-4 -mt-2 sm:mt-0">
          <div className="flex items-center gap-3 ml-1 mb-0.5 sm:mb-1">
            <div className="p-1.5 sm:p-2 bg-purple-50 rounded-xl shrink-0">
              <MapPin className="text-purple-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">
              Service Counties
            </h3>
          </div>

          <div className="relative group" ref={countyRef}>
            <button 
              type="button"
              onClick={() => {
                setIsCountyOpen(!isCountyOpen);
                setCountySearchQuery("");
              }}
              className={`w-full p-3 sm:p-4 bg-slate-50 border-2 rounded-2xl text-[11px] sm:text-xs font-bold flex items-center justify-between transition-all hover:bg-slate-100 ${errors.service_counties ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-slate-900'}`}
            >
              <span className={`block truncate text-left flex-1 mr-2 ${formData.service_counties.length > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                {formData.service_counties.length > 0 
                  ? COUNTIES.filter(c => formData.service_counties.includes(c)).join(", ") 
                  : "Select work areas"}
              </span>
              <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${isCountyOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCountyOpen && (
              <div className="absolute left-0 bottom-full md:bottom-auto md:top-full mb-2 md:mb-0 md:mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-3 pb-2 pt-1 border-b border-slate-50 mb-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      autoFocus
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:border-yellow-200"
                      placeholder="Search counties..."
                      value={countySearchQuery}
                      onChange={(e) => setCountySearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredCounties.map(c => {
                    const isSelected = formData.service_counties.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleSelection(c, "service_counties")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-yellow-50 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}>
                          {isSelected && <Check size={10} className="text-yellow-400" strokeWidth={4} />}
                        </div>
                        <span className={isSelected ? 'text-slate-900 font-black' : ''}>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {errors.service_counties && <p className="text-[9px] text-red-500 font-bold uppercase mt-1 ml-1">{errors.service_counties}</p>}
        </div>
      </div>
    </div>
  );
}