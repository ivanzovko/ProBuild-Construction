"use client";

import { useState, useRef, useEffect } from "react";
import { Briefcase, X, Globe, MapPin, ChevronDown, Info } from "lucide-react";
import { CATEGORY_GROUPS, COUNTIES } from "@/lib/onboarding-data";
import { Tooltip } from "@components/Tooltip";

export default function CategoriesTab({ 
  isEditing, 
  formData, 
  setFormData, 
  company 
}: any) {
  const [catOpen, setCatOpen] = useState(false);
  const [countyOpen, setCountyOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [countySearch, setCountySearch] = useState("");
  
  const [showAllCats, setShowAllCats] = useState(false);
  const [showAllCounties, setShowAllCounties] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const countyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setCatOpen(false);
        setCatSearch("");
      }
      if (countyRef.current && !countyRef.current.contains(event.target as Node)) {
        setCountyOpen(false);
        setCountySearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCategory = (title: string) => {
    if (formData.categories?.includes(title)) {
      setCatOpen(false);
      return;
    }
    setFormData({ ...formData, categories: [...(formData.categories || []), title] });
    setCatOpen(false);
    setCatSearch("");
  };

  const removeCategory = (indexToRemove: number) => {
    setFormData({ 
      ...formData, 
      categories: formData.categories.filter((_: any, i: number) => i !== indexToRemove) 
    });
  };

  const addCounty = (county: string) => {
    const current = Array.isArray(formData.service_counties) ? formData.service_counties : [];
    if (current.includes(county)) {
      setCountyOpen(false);
      return;
    }
    setFormData({ ...formData, service_counties: [...current, county] });
    setCountyOpen(false);
    setCountySearch("");
  };

  const removeCounty = (countyToRemove: string) => {
    const current = Array.isArray(formData.service_counties) ? formData.service_counties : [];
    setFormData({ ...formData, service_counties: current.filter((c: string) => c !== countyToRemove) });
  };

  const filteredCategories = CATEGORY_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => item.title.toLowerCase().includes(catSearch.toLowerCase()))
  })).filter(group => group.items.length > 0);

  const filteredCounties = COUNTIES.filter((c: string) => c.toLowerCase().includes(countySearch.toLowerCase()));

  const MobileExpandedView = ({ isOpen, onClose, title, items }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end md:hidden animate-in fade-in duration-200">
        <div className="bg-white w-full max-h-[70vh] rounded-t-[32px] p-6 pb-10 overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h4>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full text-[10px] font-black uppercase text-white">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Work Categories Card */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-6 h-fit transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Work Categories</h3>
            <Tooltip content="Services your company provides to customers">
              <span className="inline-flex"><Info size={12} className="text-slate-300" /></span>
            </Tooltip>
          </div>
          <Briefcase size={16} className="text-slate-300" />
        </div>

        {isEditing ? (
          <div className="space-y-4" ref={catRef}>
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto py-1">
              {(formData.categories || []).map((cat: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-white transition-all">
                  {cat} 
                  <button onClick={() => removeCategory(idx)} className="text-yellow-400 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  placeholder={catOpen ? "Type to search..." : "Add Category..."}
                  value={catSearch}
                  onFocus={() => setCatOpen(true)}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 pr-12 text-xs font-bold focus:outline-none focus:border-yellow-400 focus:bg-white transition-all placeholder:text-slate-500"
                />
                <div className="absolute right-4 pointer-events-none">
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {catOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-[24px] shadow-xl max-h-[280px] overflow-y-auto p-2 animate-in zoom-in-95 duration-200">
                  {filteredCategories.length > 0 ? filteredCategories.map((group) => (
                    <div key={group.group} className="mb-2 last:mb-0">
                      <div className="px-4 py-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">{group.group}</div>
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addCategory(item.title)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-yellow-400 transition-all text-left"
                        >
                          <span className="opacity-50 group-hover:opacity-100">{item.icon}</span>
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )) : <p className="p-4 text-[10px] text-center text-slate-400 font-bold italic">No categories found.</p>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {(company?.categories || []).map((cat: string, idx: number) => (
              <div key={idx} className={`${idx >= 2 ? 'hidden md:flex' : 'flex'} items-center gap-2 bg-yellow-400 px-4 md:px-5 py-2 md:py-2.5 rounded-full shadow-sm`}>
                <Briefcase size={12} className="text-black" />
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-black">{cat}</span>
              </div>
            ))}
            {company?.categories?.length > 2 && (
              <button onClick={() => setShowAllCats(true)} className="md:hidden text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                + {company.categories.length - 2} more
              </button>
            )}
            {!company?.categories?.length && <p className="text-xs font-bold text-slate-400 italic">No categories added yet.</p>}
          </div>
        )}
      </div>

      {/* Work Area Card */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-6 h-fit transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Work Area</h3>
            <Tooltip content="Geographical areas where you operate">
              <span className="inline-flex"><Info size={12} className="text-slate-300" /></span>
            </Tooltip>
          </div>
          <Globe size={16} className="text-slate-300" />
        </div>

        {isEditing ? (
          <div className="space-y-4" ref={countyRef}>
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto py-1">
              {(Array.isArray(formData.service_counties) ? formData.service_counties : []).map((county: string) => (
                <div key={county} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-700">
                  {county}
                  <button onClick={() => removeCounty(county)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  placeholder={countyOpen ? "Type county name..." : "Add County..."}
                  value={countySearch}
                  onFocus={() => setCountyOpen(true)}
                  onChange={(e) => setCountySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 pr-12 text-xs font-bold focus:outline-none focus:border-yellow-400 focus:bg-white transition-all placeholder:text-slate-500"
                />
                <div className="absolute right-4 pointer-events-none">
                  <MapPin size={16} className="text-slate-300" />
                </div>
              </div>

              {countyOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-[24px] shadow-xl max-h-[250px] overflow-y-auto p-2 animate-in zoom-in-95 duration-200">
                  {filteredCounties.length > 0 ? filteredCounties.map((county) => (
                    <button
                      key={county}
                      onClick={() => addCounty(county)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition-all text-left"
                    >
                      {county}
                    </button>
                  )) : <p className="p-4 text-[10px] text-center text-slate-400 font-bold italic">No counties found.</p>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 md:gap-3">
            {(Array.isArray(company?.service_counties) ? company.service_counties : []).map((county: string, idx: number) => (
              <div key={idx} className={`${idx >= 2 ? 'hidden md:flex' : 'flex'} items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl`}>
                <MapPin size={14} className="text-yellow-500" />
                <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-700">{county}</span>
              </div>
            ))}
            {company?.service_counties?.length > 2 && (
              <button onClick={() => setShowAllCounties(true)} className="md:hidden text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                + {company.service_counties.length - 2} more
              </button>
            )}
            {!company?.service_counties?.length && <p className="text-xs font-bold text-slate-400 italic">No counties specified.</p>}
          </div>
        )}
      </div>

      {!isEditing && (
        <>
          <MobileExpandedView 
            isOpen={showAllCats} 
            onClose={() => setShowAllCats(false)} 
            title="All Categories" 
            items={company?.categories} 
          />
          <MobileExpandedView 
            isOpen={showAllCounties} 
            onClose={() => setShowAllCounties(false)} 
            title="All work areas" 
            items={company?.service_counties} 
          />
        </>
      )}
    </div>
  );
}