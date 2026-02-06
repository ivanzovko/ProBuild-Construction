"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import InquiryModal from "./InquiryModal";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, Star, BadgeCheck, HelpCircle, ChevronDown, Check, Search, X,
  Home, ArrowUpRight, ArrowUpDown
} from "lucide-react";
import { CATEGORY_GROUPS, COUNTIES, SORT_OPTIONS } from "@/lib/onboarding-data";

function SkeletonCard() {
  return (
    <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-2xl shrink-0" />
        <div className="flex-1 w-full">
          <div className="h-4 bg-slate-100 rounded-full w-1/3 mb-3" />
          <div className="flex gap-3 mb-4">
            <div className="h-3 bg-slate-100 rounded-full w-12" />
            <div className="h-3 bg-slate-100 rounded-full w-24" />
          </div>
          <div className="h-8 bg-slate-100 rounded-full w-28 mb-3" />
        </div>
      </div>
    </div>
  );
}

function FindServiceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeGroup, setActiveGroup] = useState(searchParams.get("group") || "all");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "All Regions");
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [isSearchOpen, setIsSearchOpen] = useState(!!searchParams.get("q"));
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [mobileDrawerType, setMobileDrawerType] = useState<"location" | "sort" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inquiryCompany, setInquiryCompany] = useState<any>(null);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const group = searchParams.get("group") || "all";
    const category = searchParams.get("category") || "all";
    const location = searchParams.get("location") || "All Regions";
    const query = searchParams.get("q") || "";

    setActiveGroup(group);
    setSelectedCategory(category);
    setSelectedLocation(location);
    setSearchValue(query);
    if (query) setIsSearchOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('is_onboarded', true);

        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.log("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) setIsLocationOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateUrl = (group: string, category: string, location: string, search: string) => {
    const params = new URLSearchParams();
    if (group !== "all") params.set("group", group);
    if (category !== "all") params.set("category", category);
    if (location !== "All Regions") params.set("location", location);
    if (search.trim() !== "") params.set("q", search);
    
    const queryString = params.toString();
    router.replace(queryString ? `/find_service?${queryString}` : "/find_service", { scroll: false });
  };

  const filteredAndSortedPros = companies
    .filter((company) => {
      const matchesSearch = company.company_name?.toLowerCase().includes(searchValue.toLowerCase());
      if (searchValue.trim() !== "") return matchesSearch;

      let matchesCategory = true;
      if (selectedCategory !== "all") {
        matchesCategory = company.categories?.includes(selectedCategory);
      } else if (activeGroup !== "all") {
        const groupItems = CATEGORY_GROUPS.find(g => g.group === activeGroup)?.items.map(i => i.id) || [];
        matchesCategory = company.categories?.some((cat: string) => groupItems.includes(cat));
      }

      const matchesLocation = selectedLocation === "All Regions" || 
                               company.service_counties?.includes(selectedLocation);
      
      return matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return (a.company_name || "").localeCompare(b.company_name || "");
        case "name-desc": return (b.company_name || "").localeCompare(a.company_name || "");
        case "rating-desc": return (b.average_rating || 0) - (a.average_rating || 0);
        case "rating-asc": return (a.average_rating || 0) - (b.average_rating || 0);
        default: return 0;
      }
    });

  return (
    <div className={`bg-slate-50 min-h-screen flex flex-col ${(mobileDrawerType || inquiryCompany) ? 'overflow-hidden h-screen' : ''}`}>
      <header className="bg-white border-b border-slate-200 pt-6 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className={isSearchOpen ? "hidden md:block" : "block"}>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic leading-none">
                Find a <span className="text-yellow-500">Company</span>
              </h1>
              <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                {isLoading ? "..." : filteredAndSortedPros.length} companies
              </p>
            </div>

            <div className={`relative flex items-center gap-2 ${isSearchOpen ? "w-full" : "w-auto"}`}>
              {isSearchOpen ? (
                <div className="relative w-full flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
                  <Search className="absolute left-4 text-slate-400" size={16} />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search company..."
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      updateUrl(activeGroup, selectedCategory, selectedLocation, e.target.value);
                    }}
                    className="w-full pl-11 pr-12 py-3 bg-slate-100 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                  <button 
                    onClick={() => {
                      setIsSearchOpen(false); 
                      setSearchValue("");
                      updateUrl(activeGroup, selectedCategory, selectedLocation, "");
                    }}
                    className="absolute right-4 p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsSearchOpen(true)} className="p-3 bg-slate-100 hover:bg-yellow-400 hover:text-black text-slate-600 rounded-2xl transition-all shadow-sm">
                    <Search size={20} />
                  </button>
                  <Link href="/support" className="p-3 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 rounded-2xl transition-all shadow-sm">
                    <HelpCircle size={20} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-nowrap gap-6 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x pb-0">
            <button 
              onClick={() => {
                setActiveGroup("all");
                setSelectedCategory("all");
                updateUrl("all", "all", selectedLocation, searchValue);
              }}
              className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${activeGroup === "all" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-slate-400"}`}
            >
              All Services
            </button>
            {CATEGORY_GROUPS.map(group => (
              <button 
                key={group.group}
                onClick={() => {
                  setActiveGroup(group.group);
                  setSelectedCategory("all");
                  updateUrl(group.group, "all", selectedLocation, searchValue);
                }}
                className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${activeGroup === group.group ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                {group.group}
              </button>
            ))}
          </div>
        </div>

        {activeGroup !== "all" && (
          <div className="bg-slate-50/80 backdrop-blur-md border-t border-slate-100">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-nowrap gap-2 overflow-x-auto py-4 no-scrollbar touch-pan-x animate-in slide-in-from-top-2 duration-300">
                {CATEGORY_GROUPS.find(g => g.group === activeGroup)?.items.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const newCat = cat.id === selectedCategory ? "all" : cat.id;
                      setSelectedCategory(newCat);
                      updateUrl(activeGroup, newCat, selectedLocation, searchValue);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 whitespace-nowrap transition-all font-black text-[10px] uppercase tracking-wider shrink-0 hover:scale-105
                      ${selectedCategory === cat.id 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md scale-105" 
                        : "bg-white border-slate-100 text-slate-500 hover:border-yellow-400"}`}
                  >
                    <span className={selectedCategory === cat.id ? "text-yellow-400" : "text-slate-400"}>{cat.icon}</span>
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col lg:flex-row gap-6 md:gap-8">
          
          <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-4">
            <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm" ref={locationRef}>
              <div className="flex items-center gap-2 mb-4 text-slate-900">
                <MapPin size={16} className="text-yellow-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Client Location</h3>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 border border-transparent focus:border-yellow-400 transition-all hover:scale-[1.02]"
                >
                  <span className="truncate">{selectedLocation}</span>
                  <ChevronDown size={14} className={`transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLocationOpen && (
                  <div className="absolute left-0 top-full mt-2 w-full max-h-60 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                    {COUNTIES.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsLocationOpen(false);
                          updateUrl(activeGroup, selectedCategory, loc, searchValue);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors text-left"
                      >
                        {loc}
                        {selectedLocation === loc && <Check size={14} className="text-yellow-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm" ref={sortRef}>
              <div className="flex items-center gap-2 mb-4 text-slate-900">
                <ArrowUpDown size={16} className="text-yellow-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Sort By</h3>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 border border-transparent focus:border-yellow-400 transition-all hover:scale-[1.02]"
                >
                  <span className="truncate">{SORT_OPTIONS.find(o => o.id === sortBy)?.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortOpen && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors text-left"
                      >
                        {opt.label}
                        {sortBy === opt.id && <Check size={14} className="text-yellow-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="flex-1 space-y-4 pb-32 lg:pb-24">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredAndSortedPros.length > 0 ? (
              filteredAndSortedPros.map((company) => (
                <div key={company.id} className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-yellow-400/50 transition-all duration-300 group hover:scale-[1.02]">
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    
                    {/* LOGO SEKCIJA */}
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-2xl shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-yellow-50 transition-colors overflow-hidden">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={`${company.company_name} logo`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Home className="text-slate-200 group-hover:text-yellow-500 transition-colors" size={28} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h2 className="text-base md:text-lg font-black text-slate-900 uppercase truncate">{company.company_name}</h2>
                        <BadgeCheck 
                          className={`shrink-0 ${company.is_verified ? "text-green-500" : "text-red-500"}`} 
                          size={18} 
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={12} /> 
                          {company.average_rating ? company.average_rating.toFixed(1) : "0.0"}
                          <span className="text-slate-300 ml-0.5">({company.jobs_completed_count || 0})</span>
                        </span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> Base: {company.base_county}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {company.categories?.map((catId: string) => {
                          const catData = CATEGORY_GROUPS.flatMap(g => g.items).find(c => c.id === catId);
                          if (!catData) return null;
                          return (
                            <div key={catId} className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-sm">
                              {catData.icon}
                              <span>{catData.title}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Covers:</span>
                         <div className="flex flex-wrap gap-1">
                            {company.service_counties?.slice(0, 3).map((c: string) => (
                               <span key={c} className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md italic">{c}</span>
                            ))}
                            {company.service_counties?.length > 3 && <span className="text-[9px] font-bold text-slate-400">+{company.service_counties.length - 3} more</span>}
                         </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setInquiryCompany(company)}
                      className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 group/btn"
                    >
                      Inquiry
                      <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100">
                <p className="font-black uppercase text-slate-300 text-xs tracking-widest">No matching results</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {inquiryCompany && (
        <InquiryModal 
          company={inquiryCompany} 
          onClose={() => setInquiryCompany(null)} 
        />
      )}
    </div>
  );
}

export default function FindServicePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-50 font-black uppercase text-slate-400 animate-pulse tracking-[0.3em]">Loading...</div>}>
      <FindServiceContent />
    </Suspense>
  );
}