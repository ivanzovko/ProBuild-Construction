"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import InquiryModal from "./components/InquiryModal";
import ReviewsModal from "./components/reviewsModal";
import DescriptionModal from "../_components/CompanyInfoModal"
import { Tooltip } from "@components/Tooltip";;
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, Star, BadgeCheck, HelpCircle, ChevronDown, Check, Search, X,
  Home, ArrowUpRight, ArrowUpDown, SortAsc, SortDesc, MessageSquare,
  ArrowUp, Info, ListFilter
} from "lucide-react";
import { CATEGORY_GROUPS, COUNTIES } from "@/lib/onboarding-data";

const SORT_OPTIONS = [
  { id: "name", label: "Name" },
  { id: "rating", label: "Rating" }
];

function CompanyCategories({ categories }: { categories: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <div className="hidden lg:flex flex-wrap gap-2">
        {categories?.map((catId: string) => {
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

      <div className="flex lg:hidden flex-wrap gap-2 items-center">
        {categories?.slice(0, 2).map((catId: string) => {
          const catData = CATEGORY_GROUPS.flatMap(g => g.items).find(c => c.id === catId);
          if (!catData) return null;
          return (
            <div key={catId} className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-tighter">
              {catData.icon}
              <span>{catData.title}</span>
            </div>
          );
        })}
        
        {categories?.length > 2 && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className={`inline-flex items-center gap-1 transition-all px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-tighter ${
                isOpen ? "bg-yellow-400 text-black" : "bg-slate-800 text-yellow-400 border border-yellow-400/20"
              }`}
            >
              +{categories.length - 2} More
              <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
              <div className="absolute bottom-full left-0 mb-2 min-w-[160px] max-w-[200px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto no-scrollbar">
                  {categories.slice(2).map((catId: string) => {
                    const catData = CATEGORY_GROUPS.flatMap(g => g.items).find(c => c.id === catId);
                    if (!catData) return null;
                    return (
                      <div key={catId} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left">
                        <span className="text-yellow-400 shrink-0 scale-75">{catData.icon}</span>
                        <span className="text-white text-[9px] font-black uppercase whitespace-nowrap">{catData.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyCovers({ counties }: { counties: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!counties || counties.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">Covers:</span>
      
      <div className="hidden lg:flex flex-wrap gap-1 items-center">
        {counties.map((c: string) => (
          <span key={c} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md italic whitespace-nowrap">
            {c}
          </span>
        ))}
      </div>

      <div className="flex lg:hidden flex-wrap gap-1 items-center">
        {counties.slice(0, 2).map((c: string) => (
          <span key={c} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md italic">
            {c}
          </span>
        ))}
        
        {counties.length > 2 && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                isOpen ? "bg-slate-900 text-white" : "text-slate-400 bg-slate-50 hover:bg-slate-200"
              }`}
            >
              +{counties.length - 2} more
            </button>

            {isOpen && (
              <div className="absolute bottom-full left-0 mb-2 min-w-[140px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto no-scrollbar">
                  {counties.slice(2).map((county) => (
                    <div key={county} className="px-3 py-1.5 text-white text-[9px] font-black uppercase whitespace-nowrap hover:bg-white/5 rounded-lg transition-colors">
                      {county}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inquiryCompany, setInquiryCompany] = useState<any>(null);
  const [descriptionCompany, setDescriptionCompany] = useState<any>(null);
  const [reviewModalData, setReviewModalData] = useState<{id: string, name: string} | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const mobileSortRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const group = searchParams.get("group") || "all";
    const category = searchParams.get("category") || "all";
    const location = searchParams.get("location") || "All Regions";
    const query = searchParams.get("q") || "";

    setActiveGroup(group);
    setSelectedCategory(category);
    setSelectedLocation(location);
    setSearchValue(query);
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
      if (mobileSortRef.current && !mobileSortRef.current.contains(event.target as Node)) setIsMobileSortOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (searchValue === "") setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchValue]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const updateUrl = (group: string, category: string, location: string, search: string) => {
    const params = new URLSearchParams();
    if (group !== "all") params.set("group", group);
    if (category !== "all") params.set("category", category);
    if (location !== "All Regions") params.set("location", location);
    if (search.trim() !== "") params.set("q", search);
    
    const queryString = params.toString();
    router.replace(queryString ? `/find_service?${queryString}` : "/find_service", { scroll: false });
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-yellow-500 underline decoration-2 underline-offset-2">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
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
      let comparison = 0;
      if (sortBy === "name") {
        comparison = (a.company_name || "").localeCompare(b.company_name || "");
      } else if (sortBy === "rating") {
        comparison = (a.average_rating || 0) - (b.average_rating || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

 return (
    <div className={`bg-slate-50 min-h-screen flex flex-col ${(inquiryCompany || reviewModalData || descriptionCompany) ? 'overflow-hidden h-screen' : ''}`}>
      <header className="bg-white border-b border-slate-200 pt-6 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className={`shrink-0 transition-opacity duration-300 ${isSearchExpanded ? 'opacity-0 w-0 overflow-hidden sm:opacity-100 sm:w-auto' : 'opacity-100'}`}>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic leading-none">
                Find a <span className="text-yellow-500">Company</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <div 
                ref={searchRef}
                className={`relative flex items-center transition-all duration-300 ease-in-out
                  ${isSearchExpanded 
                    ? 'w-full sm:max-w-[300px]' 
                    : 'w-10 sm:w-full sm:max-w-[300px]'}`}
              >
                <Tooltip content="Search by company name">
                  <button
                    onClick={() => {
                      setIsSearchExpanded(true);
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }}
                    className={`absolute left-0 sm:left-4 z-10 p-2.5 sm:p-0 bg-slate-100 sm:bg-transparent rounded-xl sm:rounded-none transition-colors
                      ${isSearchExpanded ? 'text-yellow-500' : 'text-slate-400'}`}
                  >
                    <Search size={18} />
                  </button>
                </Tooltip>
                
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search company name"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    updateUrl(activeGroup, selectedCategory, selectedLocation, e.target.value);
                  }}
                  className={`w-full bg-slate-100 border-2 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-yellow-400 focus:ring-0 outline-none transition-all
                    ${isSearchExpanded 
                      ? 'pl-11 pr-11 py-3 opacity-100' 
                      : 'pl-0 pr-0 py-3 opacity-0 sm:opacity-100 sm:pl-11 sm:pr-11'}`}
                />
                
                {searchValue && isSearchExpanded && (
                  <button 
                    onClick={() => {
                      setSearchValue("");
                      updateUrl(activeGroup, selectedCategory, selectedLocation, "");
                    }}
                    className="absolute right-3 p-1.5 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <X size={14} className="text-slate-500" />
                  </button>
                )}
              </div>

              {/* Mobile Sort Button */}
              <div className="lg:hidden relative" ref={mobileSortRef}>
                <Tooltip content="Sort companies">
                  <button 
                    onClick={() => setIsMobileSortOpen(!isMobileSortOpen)}
                    className={`p-3 rounded-2xl transition-all shadow-sm active:scale-95 ${isMobileSortOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <ArrowUpDown size={20} />
                  </button>
                </Tooltip>
                {isMobileSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Sort Options</p>
                    </div>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsMobileSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {opt.label}
                        {sortBy === opt.id && <Check size={14} className="text-yellow-500" />}
                      </button>
                    ))}
                    <div className="border-t border-slate-50 mt-1 pt-1">
                       <button
                        onClick={() => {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          setIsMobileSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                        {sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Tooltip content="Help & Support">
                <Link 
                  href="/support" 
                  className={`p-3 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 rounded-2xl transition-all shadow-sm hover:scale-110 active:scale-95
                    ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}
                >
                  <HelpCircle size={20} />
                </Link>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-nowrap gap-6 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x pb-0">
            <button 
              onClick={() => {
                setActiveGroup("all");
                setSelectedCategory("all");
                updateUrl("all", "all", selectedLocation, searchValue);
              }}
              className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 hover:scale-110 origin-bottom ${activeGroup === "all" ? "text-yellow-500 border-b-4 border-yellow-500" : "text-slate-400"}`}
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
                className={`pb-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 hover:scale-110 origin-bottom ${activeGroup === group.group ? "text-slate-900 border-b-4 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}
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
                  <Tooltip key={cat.id} content={`Filter by ${cat.title}`}>
                    <button
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
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col lg:flex-row gap-6 md:gap-8">
          
          <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-4">
            <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm" ref={locationRef}>
              <div className="flex items-center gap-2 mb-4 text-slate-900">
                <MapPin size={16} className="text-yellow-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Client Location</h3>
              </div>
              <div className="relative">
                <Tooltip content="Select your county">
                  <button 
                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="w-full flex items-center justify-between p-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 border border-transparent focus:border-yellow-400 transition-all hover:scale-[1.02]"
                  >
                    <span className="truncate">{selectedLocation}</span>
                    <div className={`transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={14} />
                    </div>
                  </button>
                </Tooltip>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <ArrowUpDown size={16} className="text-yellow-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Sort By</h3>
                </div>
                <Tooltip content={sortOrder === "asc" ? "Change to Descending" : "Change to Ascending"}>
                  <button 
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="p-2 bg-slate-100 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                  >
                    {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </button>
                </Tooltip>
              </div>
              <div className="relative">
                <Tooltip content="Choose sorting criteria">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full flex items-center justify-between p-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 border border-transparent focus:border-yellow-400 transition-all hover:scale-[1.02]"
                  >
                    <span className="truncate">{SORT_OPTIONS.find(o => o.id === sortBy)?.label}</span>
                    <div className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={14} />
                    </div>
                  </button>
                </Tooltip>
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
  {/* OPTIMIZIRANA INTRO SEKCIJA */}
<div className="w-full bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm">
  <div className="max-w-3xl space-y-2">
    <Tooltip content="Need help finding something?">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="p-1.5 bg-yellow-400 rounded-lg text-black shadow-sm shrink-0">
          <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
        <h2 className="text-[12px] md:text-xl font-black uppercase italic tracking-tighter text-slate-900 whitespace-nowrap md:whitespace-normal">
          Find Exactly <span className="text-yellow-500">What You’re Looking For</span>
        </h2>
      </div>
    </Tooltip>
    
    <p className="text-slate-700 font-bold leading-relaxed text-[11px] md:text-[13px] tracking-tight font-sans">
      Why waste time searching when you can browse the best? Explore our 
      <span className="font-black text-slate-900"> categorized directory of verified companies</span> and 
      connect with experts tailored to your specific needs. Your next successful collaboration starts here.
    </p>
  </div>
</div>

  <div className="mb-2 px-2">
    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
      {isLoading ? "Loading companies..." : `${filteredAndSortedPros.length} companies found`}
    </p>
  </div>

  {isLoading ? (
    Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
  ) : filteredAndSortedPros.length > 0 ? (
    filteredAndSortedPros.map((company) => (
      <div key={company.id} className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-yellow-400/50 transition-all duration-300 group hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          
          <Tooltip content="View company details">
            <button 
              onClick={() => setDescriptionCompany(company)}
              className="hidden sm:flex w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-2xl shrink-0 items-center justify-center border border-slate-100 group-hover:bg-yellow-50 transition-all duration-300 overflow-hidden cursor-pointer hover:scale-110 active:scale-95"
            >
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Home className="text-slate-200 group-hover:text-yellow-500 transition-colors" size={28} />
              )}
            </button>
          </Tooltip>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Tooltip content="Click for more info">
                <button 
                  onClick={() => setDescriptionCompany(company)}
                  className="hover:text-yellow-500 transition-all text-left cursor-pointer hover:scale-105 active:scale-95 origin-left"
                >
                  <h2 className="text-base md:text-lg font-black text-slate-900 uppercase truncate">
                    {highlightText(company.company_name, searchValue)}
                  </h2>
                </button>
              </Tooltip>
              <div className="flex items-center gap-1.5 shrink-0">
                <Tooltip content={company.is_verified ? "Verified Professional" : "Unverified"}>
                  <BadgeCheck className={`${company.is_verified ? "text-green-500" : "text-red-500"}`} size={18} />
                </Tooltip>
                <Tooltip content="Full details">
                  <button 
                    onClick={() => setDescriptionCompany(company)}
                    className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer p-1 hover:scale-110 active:scale-90"
                  >
                    <span className="sr-only">Info</span>
                    <Info size={20} />
                  </button>
                </Tooltip>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 items-center">
              <Tooltip content="Read reviews">
                <button 
                  onClick={() => setReviewModalData({ id: company.id, name: company.company_name })}
                  className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 -ml-2 rounded-lg transition-colors group/reviews cursor-pointer"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={14} 
                        className={`${star <= Math.round(company.average_rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-slate-200 fill-slate-100"}`} 
                      />
                    ))}
                  </div>
                  <span className="text-slate-900 ml-1">{company.average_rating ? company.average_rating.toFixed(1) : "0.0"}</span>
                  <span className="text-slate-600 ml-0.5">({company.jobs_completed_count || 0})</span>
                  <span className="ml-1 text-slate-400 group-hover/reviews:text-yellow-600 flex items-center gap-1 border-l border-slate-200 pl-2">
                    Review <MessageSquare size={10} />
                  </span>
                </button>
              </Tooltip>
              <span className="flex items-center gap-1"><MapPin size={12} /> Base: {company.base_county}</span>
            </div>

            <CompanyCategories categories={company.categories || []} />
            
            <CompanyCovers counties={company.service_counties || []} />

          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Tooltip content="Send direct inquiry">
              <button 
                onClick={() => setInquiryCompany(company)}
                className="flex-1 sm:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 group/btn cursor-pointer"
              >
                Inquiry
                <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </Tooltip>
          </div>
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

      <Tooltip content="Back to top">
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 p-4 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 z-50 transition-all duration-500 hover:scale-110 active:scale-95 hover:bg-yellow-400 group
            ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      </Tooltip>

      {inquiryCompany && (
        <InquiryModal 
          company={inquiryCompany} 
          onClose={() => setInquiryCompany(null)} 
        />
      )}

      {descriptionCompany && (
        <DescriptionModal 
          isOpen={!!descriptionCompany} 
          company={descriptionCompany} 
          onClose={() => setDescriptionCompany(null)} 
        />
      )}

      {reviewModalData && (
        <ReviewsModal 
          isOpen={!!reviewModalData}
          onClose={() => setReviewModalData(null)}
          contractorId={reviewModalData.id}
          contractorName={reviewModalData.name}
          supabase={supabase}
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