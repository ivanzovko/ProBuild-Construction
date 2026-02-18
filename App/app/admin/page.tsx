"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Tooltip } from "@components/Tooltip";
import { 
  User, 
  Building2, 
  Files,
  X,
  Eye,
  ChevronDown,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronUp
} from "lucide-react";

type TabType = 'companies' | 'clients' | 'tickets';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('companies');
  const [clients, setClients] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDocsId, setOpenDocsId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  async function fetchAllData() {
    try {
      setLoading(true);
      setError(null);
      
      const [clientsRes, companiesRes, ticketsRes] = await Promise.all([
        supabase.from('client_profiles').select('*'),
        supabase.from('company_profiles').select('*'),
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (companiesRes.error) throw companiesRes.error;
      if (ticketsRes.error) throw ticketsRes.error;

      const sortedClients = (clientsRes.data || []).sort((a, b) => 
        (a.full_name || "").localeCompare(b.full_name || "")
      );

      const sortedCompanies = (companiesRes.data || []).sort((a, b) => 
        (a.company_name || "").localeCompare(b.company_name || "")
      );

      setClients(sortedClients);
      setCompanies(sortedCompanies);
      setTickets(ticketsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateTicketStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus.toUpperCase() })
        .eq('id', id);
      
      if (error) throw error;
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus.toUpperCase() } : t));
    } catch (err: any) {
      alert("Error updating ticket: " + err.message);
    }
  }

  async function toggleVerification(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, is_verified: newStatus } : c));
    
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({ is_verified: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err: any) {
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, is_verified: currentStatus } : c));
      alert("Database error: " + err.message);
    }
  }

  const getFileName = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      let fileName = parts[parts.length - 1].split('?')[0];
      if (fileName.includes('---')) {
        fileName = fileName.split('---')[1];
      } else {
        fileName = fileName.replace(/^[a-f0-9-]{36}-/i, '').replace(/^[0-9]{10,}-/, '');
      }
      return fileName;
    } catch {
      return "Doc";
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-red-500 text-white';
      case 'MEDIUM': return 'bg-orange-500 text-white';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return <AlertCircle size={14} className="text-red-500" />;
      case 'CLOSED': return <CheckCircle2 size={14} className="text-green-500" />;
      default: return <Clock size={14} className="text-blue-500" />;
    }
  };

  const getCurrentData = () => {
    const data = activeTab === 'tickets' ? tickets : activeTab === 'clients' ? clients : companies;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil((activeTab === 'tickets' ? tickets.length : activeTab === 'clients' ? clients.length : companies.length) / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 py-3 px-4 md:py-6 md:px-8 border-b border-slate-800 sticky top-0 z-[99]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <h1 className="text-lg md:text-3xl font-black uppercase italic tracking-tighter text-white leading-tight transition-transform hover:scale-105">
              Admin <span className="text-yellow-500">Control</span>
            </h1>
          </div>
          
          <div className="hidden md:flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {(['companies', 'clients', 'tickets'] as TabType[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${activeTab === tab ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                {tab} ({tab === 'companies' ? companies.length : tab === 'clients' ? clients.length : tickets.length})
              </button>
            ))}
          </div>

          <div className="relative min-w-[140px] md:hidden flex items-center gap-2">
            <Link href="/studio" className="p-2 bg-slate-800 text-white rounded-xl border border-slate-700 hover:bg-yellow-500 hover:text-slate-900 transition-all active:scale-90">
              <Settings size={16} />
            </Link>

            <div className="relative flex-1">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-slate-800 text-white flex items-center justify-between pl-4 pr-3 py-2 rounded-xl border border-slate-700 font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all active:scale-95">
                <span className="capitalize">{activeTab} ({activeTab === 'companies' ? companies.length : activeTab === 'clients' ? clients.length : tickets.length})</span>
                <ChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-[120] animate-in fade-in slide-in-from-top-2">
                  {(['companies', 'clients', 'tickets'] as TabType[]).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => { setActiveTab(tab); setIsDropdownOpen(false); }} 
                      className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === tab ? 'bg-yellow-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tab} ({tab === 'companies' ? companies.length : tab === 'clients' ? clients.length : tickets.length})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
  <div className="relative w-full h-0 z-[99] flex justify-center">
        <div className="absolute -top-4 md:-top-5">
            <Tooltip content={isIntroVisible ? "Hide intro" : "Show intro"}>
                <button 
                    onClick={() => setIsIntroVisible(!isIntroVisible)}
                    className="bg-white border-2 border-slate-100 text-slate-400 hover:text-yellow-500 hover:border-yellow-500 p-1.5 md:p-2 rounded-full shadow-xl transition-all hover:scale-125 active:scale-90 flex items-center justify-center"
                >
                    {isIntroVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </Tooltip>
        </div>
      </div>
      <div className="w-full bg-white border-b-2 border-slate-100 shadow-sm relative z-[10]">
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isIntroVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="w-full p-5 md:py-6 md:px-10 group/hero">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center max-w-7xl mx-auto">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-xl text-slate-900 group-hover/hero:rotate-12 transition-transform shadow-lg shadow-yellow-500/20">
                    <Info size={18} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                    System <span className="text-yellow-500">Administration</span>
                  </h2>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-xs md:text-sm text-justify">
                  Welcome to the central management hub. This interface provides a comprehensive overview of all 
                  <span className="font-black text-slate-900"> registered companies and clients</span>. 
                  As an administrator, you are responsible for the regular verification of company profiles.
                </p>
              </div>

              <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200 hover:border-yellow-500 transition-all duration-300 shadow-sm">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Core Controls</h4>
                <p className="text-[10px] text-slate-500 mb-4 leading-relaxed font-bold text-justify">
                  Access the Sanity CMS to manage advanced platform settings,
                  <strong> adjust calculator pricing</strong> or <strong>toggle page visibility</strong>.
                </p>
                <Tooltip content="Open Sanity CMS structure">
                  <Link 
                    href="/studio/structure" 
                    className="w-full md:w-fit inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-yellow-500 text-white hover:text-slate-900 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all group shadow-lg active:scale-95 hover:scale-105"
                  >
                    <Settings size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                    Open CMS Control Panel
                  </Link>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

    
      </div>

      <main className="p-2 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <div className="bg-white border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="text-left border-collapse table-auto w-full min-w-[600px] md:min-w-0">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-2 md:px-6 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center w-8">#</th>
                    <th className="px-3 md:px-8 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center">
                      {activeTab === 'tickets' ? 'Sender' : 'Identity'}
                    </th>
                    <th className="px-3 md:px-8 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center">
                      {activeTab === 'tickets' ? 'Message & Priority' : 'Info'}
                    </th>
                    <th className="px-3 md:px-8 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center">Verificate company/Status ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="py-20 text-center font-black uppercase text-slate-300 tracking-widest animate-pulse">Loading Data...</td></tr>
                  ) : getCurrentData().map((item, index) => (
                    <tr key={item.id} className="group transition-all duration-300 hover:bg-slate-900 hover:scale-[1.01] hover:shadow-2xl hover:z-50 relative cursor-default">
                      <td className="px-2 md:px-6 py-3 md:py-6 text-center">
                        <span className="text-[9px] md:text-xs font-black text-slate-300 group-hover:text-yellow-500/50">
                          {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      
                      <td className="px-3 md:px-8 py-3 md:py-6 text-left">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className="shrink-0 w-8 h-8 md:w-14 md:h-14 bg-slate-100 rounded-lg md:rounded-2xl flex items-center justify-center text-slate-400 transition-all overflow-hidden border border-slate-200 shadow-sm group-hover:border-yellow-500">
                            {activeTab === 'companies' && item.logo_url ? (
                              <img src={item.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="transition-transform duration-500 group-hover:scale-110 group-hover:text-yellow-500">
                                {activeTab === 'clients' ? <User size={18} /> : activeTab === 'tickets' ? <Ticket size={18} /> : <Building2 size={18} />}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 text-[10px] md:text-sm block truncate leading-tight uppercase transition-colors group-hover:text-yellow-500">
                              {activeTab === 'tickets' ? item.name : activeTab === 'companies' ? (item.company_name || 'N/A') : (item.full_name || 'N/A')}
                            </span>
                            <span className="text-[8px] md:text-[11px] text-slate-400 font-bold lowercase truncate block group-hover:text-yellow-500/70">
                              {item.email || (activeTab === 'companies' ? 'Company Account' : '')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 md:px-8 py-3 md:py-6 text-center">
                        {activeTab === 'tickets' ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-[7px] md:text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tighter ${getPriorityStyle(item.priority)}`}>
                                    {item.priority}
                                </span>
                                <span className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-tight group-hover:text-yellow-500/50">
                                    {new Date(item.created_at).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                            <p className="text-[9px] md:text-xs font-bold text-slate-600 group-hover:text-slate-300 line-clamp-1 italic max-w-[200px] md:max-w-xs">
                              "{item.message}"
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5 items-center">
                            {activeTab === 'companies' && item.oib && (
                              <span className="text-[9px] md:text-sm font-black text-slate-900 font-mono bg-slate-100 px-1 rounded w-fit border border-slate-200 group-hover:bg-yellow-500 group-hover:border-yellow-600 transition-colors">
                                {item.oib}
                              </span>
                            )}
                            <span className="text-[9px] md:text-sm font-black text-slate-400 uppercase tracking-tight group-hover:text-yellow-500/50">
                              {new Date(item.created_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-3 md:px-8 py-3 md:py-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 md:gap-3">
                          {activeTab === 'tickets' ? (
                            <div className="flex items-center gap-2">
                                <select 
                                    value={item.status}
                                    onChange={(e) => updateTicketStatus(item.id, e.target.value)}
                                    className={`text-[9px] md:text-[10px] font-black uppercase rounded-lg px-2 py-1 border-2 border-slate-100 bg-white cursor-pointer focus:outline-none focus:border-yellow-500 transition-all hover:scale-105 ${
                                        item.status === 'OPEN' ? 'text-red-500' : item.status === 'CLOSED' ? 'text-green-500' : 'text-blue-500'
                                    }`}
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <Tooltip content={`Status: ${item.status}`}>
                                  {getStatusIcon(item.status)}
                                </Tooltip>
                            </div>
                          ) : activeTab === 'companies' ? (
                            <>
                              <Tooltip content={item.is_verified ? "Revoke Verification" : "Verify Company"}>
                                <button onClick={(e) => { e.stopPropagation(); toggleVerification(item.id, !!item.is_verified); }} className={`relative w-8 h-4.5 md:w-14 md:h-7 flex items-center rounded-full p-0.5 transition-all hover:scale-110 active:scale-95 ${item.is_verified ? 'bg-green-500' : 'bg-slate-700 group-hover:bg-slate-800'}`}>
                                  <div className={`bg-white w-3.5 h-3.5 md:w-5 md:h-5 rounded-full shadow-sm transition-transform ${item.is_verified ? 'translate-x-[16px] md:translate-x-[28px]' : 'translate-x-0'}`} />
                                </button>
                              </Tooltip>
                              {item.document_urls && item.document_urls.length > 0 && (
                                <Tooltip content="View Documents">
                                  <button onClick={(e) => { e.stopPropagation(); setOpenDocsId(item.id); }} className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-yellow-500 hover:text-white transition-all shadow-sm border border-slate-200 group-hover:border-yellow-600 hover:scale-110 active:scale-95">
                                    <Files size={14} />
                                  </button>
                                </Tooltip>
                              )}
                            </>
                          ) : (
                            <Tooltip content="Active User Account">
                              <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-wider shadow-sm shadow-green-200 transition-transform hover:scale-105">Active</span>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && totalPages > 1 && (
              <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-4">
                <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">
                  Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-yellow-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all active:scale-90"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-[12px] font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-yellow-500 scale-110 shadow-lg' : 'bg-white text-slate-400 hover:text-slate-900'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-yellow-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all active:scale-90"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {openDocsId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 md:p-8" onClick={() => setOpenDocsId(null)}>
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 p-6 md:p-8 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-4 text-white">
                <Files size={28} className="text-yellow-500" />
                <h3 className="font-black uppercase italic text-sm md:text-3xl tracking-tighter">Verification Documents</h3>
              </div>
              <button onClick={() => setOpenDocsId(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all hover:rotate-90 active:scale-90">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-6 md:p-10 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide bg-slate-50">
              {(() => {
                const company = companies.find(c => c.id === openDocsId);
                const docs = company?.document_urls;
                if (!docs || docs.length === 0) return <p className="text-center text-sm font-black text-slate-400 py-10 uppercase tracking-widest">No documents found</p>;
                
                return (Array.isArray(docs) ? docs : [docs]).map((url: string, i: number) => (
                  <Tooltip key={i} content="Click to view full document">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between bg-white p-5 md:p-7 rounded-[1.5rem] border-2 border-slate-100 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10 active:scale-[0.99] transition-all group/doc hover:scale-[1.02]"
                    >
                      <div className="flex flex-col min-w-0 pr-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Document {i + 1}</span>
                        <span className="font-bold text-[9px] md:text-lg text-slate-800 break-all leading-snug">
                          {getFileName(url)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="p-3 md:p-4 bg-slate-900 text-white rounded-2xl group-hover/doc:bg-yellow-500 group-hover/doc:text-slate-900 transition-colors shadow-lg">
                          <Eye size={15} />
                        </div>
                      </div>
                    </a>
                  </Tooltip>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}