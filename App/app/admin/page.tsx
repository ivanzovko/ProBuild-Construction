"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  User, 
  Building2, 
  Files,
  X,
  Eye,
  ChevronDown
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'companies' | 'clients'>('companies');
  const [clients, setClients] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDocsId, setOpenDocsId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      setError(null);
      const [clientsRes, companiesRes, profilesRes] = await Promise.all([
        supabase.from('client_profiles').select('*'),
        supabase.from('companies').select('*'),
        supabase.from('company_profiles').select('id, logo_url')
      ]);
      if (clientsRes.error) throw clientsRes.error;
      if (companiesRes.error) throw companiesRes.error;
      const sortedClients = (clientsRes.data || []).sort((a, b) => 
        (a.full_name || "").localeCompare(b.full_name || "")
      );
      const combinedCompanies = (companiesRes.data || []).map(company => {
        const profile = (profilesRes.data || []).find(p => p.id === company.id);
        return { ...company, logo_url: profile?.logo_url || null };
      });
      const sortedCompanies = combinedCompanies.sort((a, b) => 
        (a.company_name || "").localeCompare(b.company_name || "")
      );
      setClients(sortedClients);
      setCompanies(sortedCompanies);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleVerification(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, is_verified: newStatus } : c));
    try {
      const { error } = await supabase.from('companies').update({ is_verified: newStatus }).eq('id', id);
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

  const currentData = activeTab === 'clients' ? clients : companies;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 py-3 px-4 md:py-6 md:px-8 border-b border-slate-800 sticky top-0 z-[40]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-lg md:text-3xl font-black uppercase italic tracking-tighter text-white leading-tight">
              Admin <span className="text-yellow-500">Control</span>
            </h1>
          </div>
          <div className="hidden md:flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button onClick={() => setActiveTab('companies')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'companies' ? 'bg-yellow-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
              Companies ({companies.length})
            </button>
            <button onClick={() => setActiveTab('clients')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'clients' ? 'bg-yellow-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
              Clients ({clients.length})
            </button>
          </div>
          <div className="relative min-w-[140px] md:hidden">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-slate-800 text-white flex items-center justify-between pl-4 pr-3 py-2 rounded-xl border border-slate-700 font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all">
              <span>{activeTab === 'companies' ? `Companies (${companies.length})` : `Clients (${clients.length})`}</span>
              <ChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { setActiveTab('companies'); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'companies' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}>
                  Companies ({companies.length})
                </button>
                <button onClick={() => { setActiveTab('clients'); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'clients' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}>
                  Clients ({clients.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-2 md:p-8 flex justify-center">
        <div className="w-full md:w-fit max-w-7xl">
          <div className="bg-white border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="text-left border-collapse table-auto w-full min-w-[500px] md:min-w-0">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-2 md:px-6 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center w-8">#</th>
                    <th className="px-3 md:px-8 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center">Identity</th>
                    <th className="px-3 md:px-8 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center">Info</th>
                    <th className="px-3 md:px-8 py-3 md:py-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-center">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentData.map((item, index) => (
                    <tr key={item.id} className="group transition-all duration-300 hover:bg-slate-900 hover:scale-[1.02] hover:shadow-2xl hover:z-50 relative cursor-default">
                      <td className="px-2 md:px-6 py-3 md:py-6 text-center">
                        <span className="text-[9px] md:text-xs font-black text-slate-300 group-hover:text-yellow-500/50">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-3 md:px-8 py-3 md:py-6 text-left">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className="shrink-0 w-8 h-8 md:w-14 md:h-14 bg-slate-100 rounded-lg md:rounded-2xl flex items-center justify-center text-slate-400 transition-all overflow-hidden border border-slate-200 shadow-sm group-hover:border-yellow-500">
                            {activeTab === 'companies' && item.logo_url ? (
                              <img src={item.logo_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
                            ) : (
                              <div className="transition-transform duration-500 group-hover:scale-110 group-hover:text-yellow-500">
                                {activeTab === 'clients' ? <User size={18} /> : <Building2 size={18} />}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 text-[10px] md:text-base block truncate leading-tight uppercase transition-colors group-hover:text-yellow-500">
                              {activeTab === 'companies' ? (item.company_name || 'N/A') : (item.full_name || 'N/A')}
                            </span>
                            <span className="text-[8px] md:text-[11px] text-slate-400 font-bold lowercase truncate block group-hover:text-yellow-500/70">{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-8 py-3 md:py-6 text-center">
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
                      </td>
                      <td className="px-3 md:px-8 py-3 md:py-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 md:gap-3">
                          {activeTab === 'companies' ? (
                            <>
                              <span className={`hidden md:block text-[10px] font-black uppercase transition-colors ${!item.is_verified ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-500'}`}>Not</span>
                              <button onClick={(e) => { e.stopPropagation(); toggleVerification(item.id, !!item.is_verified); }} className={`relative w-8 h-4.5 md:w-14 md:h-7 flex items-center rounded-full p-0.5 transition-colors ${item.is_verified ? 'bg-green-500' : 'bg-slate-700 group-hover:bg-slate-800'}`}>
                                <div className="bg-white w-3.5 h-3.5 md:w-5 md:h-5 rounded-full shadow-sm transition-transform" style={{ transform: item.is_verified ? (window.innerWidth < 768 ? 'translateX(14px)' : 'translateX(28px)') : 'translateX(0px)' }} />
                              </button>
                              <span className={`hidden md:block text-[10px] font-black uppercase transition-colors ${item.is_verified ? 'text-green-500' : 'text-slate-400 group-hover:text-slate-500'}`}>Verified</span>
                              {item.verification_document_url && (
                                <button onClick={(e) => { e.stopPropagation(); setOpenDocsId(item.id); }} className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-yellow-500 hover:text-white transition-all shadow-sm border border-slate-200 group-hover:border-yellow-600">
                                  <Files size={14} />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-wider shadow-sm shadow-green-200">Active</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              <button onClick={() => setOpenDocsId(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all hover:rotate-90">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-6 md:p-10 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide bg-slate-50">
              {(() => {
                const company = companies.find(c => c.id === openDocsId);
                const docs = company?.verification_document_url;
                if (!docs) return <p className="text-center text-sm font-black text-slate-400 py-10 uppercase tracking-widest">No documents found</p>;
                
                return (Array.isArray(docs) ? docs : [docs]).map((url: string, i: number) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between bg-white p-5 md:p-7 rounded-[1.5rem] border-2 border-slate-100 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/10 active:scale-[0.99] transition-all group/doc"
                  >
                    <div className="flex flex-col min-w-0 pr-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Document {i + 1}</span>
                      <span className="font-bold text-[9px] md:text-lg text-slate-800 break-all leading-snug">
                        {getFileName(url)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black uppercase text-yellow-600 opacity-0 group-hover/doc:opacity-100 transition-opacity">View PDF</span>
                      </div>
                      <div className="p-3 md:p-4 bg-slate-900 text-white rounded-2xl group-hover/doc:bg-yellow-500 group-hover/doc:text-slate-900 transition-colors shadow-lg">
                        <Eye size={15} />
                      </div>
                    </div>
                  </a>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}