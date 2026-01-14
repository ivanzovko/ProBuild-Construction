"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Plus, 
  Clock, 
  MapPin, 
  LogOut, 
  ArrowRight, 
  Users,
  Loader2,
  Menu,
  X
} from "lucide-react";

export default function DashboardView() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Company");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
    };
    getUser();
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/dashboard"); 
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative">
      
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isLoggingOut && setShowLogoutConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="bg-slate-50 text-slate-900 p-4 rounded-3xl mb-6">
                <LogOut className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase italic text-slate-900 tracking-tighter">Sign Out?</h3>
              <div className="grid grid-cols-2 gap-3 w-full mt-8">
                <button onClick={() => setShowLogoutConfirm(false)} className="py-4 rounded-2xl border-2 border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">Cancel</button>
                <button onClick={handleLogout} className="py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-colors">
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Log Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <h2 className="text-xl font-black italic tracking-tighter uppercase">PRO<span className="text-yellow-400">-BUILD</span></h2>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-800 rounded-xl text-yellow-400 active:scale-95 transition-transform">
          <Menu size={24} />
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-slate-900 text-white flex flex-col p-6 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:h-screen
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex justify-between items-center mb-12 px-4 lg:px-0">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">PRO<span className="text-yellow-400">-BUILD</span></h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest bg-yellow-400 text-black shadow-lg shadow-yellow-400/10 active:scale-[0.98] transition-all">
            <LayoutDashboard size={20}/> Overview
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-colors">
            <Briefcase size={20}/> My Projects
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-colors">
            <MessageSquare size={20}/> Messages
          </button>
        </nav>

        <button onClick={() => { setShowLogoutConfirm(true); setIsSidebarOpen(false); }} className="flex items-center gap-4 px-6 py-4 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white mt-auto transition-colors">
          <LogOut size={20}/> Log Out
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic leading-tight">
              Welcome, <span className="text-yellow-500">{userName.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
              {loading ? "Syncing..." : `${projects.length} Active Projects`}
            </p>
          </div>
          <button className="w-full sm:w-auto bg-slate-900 text-white px-6 md:px-8 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95">
            Create Project <Plus size={18}/>
          </button>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400">Recent Activity</h3>
            <button onClick={fetchProjects} className="text-[9px] font-black uppercase text-slate-400 hover:text-yellow-500 tracking-widest transition-colors">Refresh</button>
          </div>
          
          <div className="grid gap-3 md:gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 md:p-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="font-bold uppercase text-[10px] tracking-widest">Loading...</p>
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-yellow-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      project.status === "New Inquiry" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      <Clock className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-base md:text-lg italic truncate">{project.service}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3 md:w-3.5 md:h-3.5" /> {project.client}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" /> {project.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end">
                    <button className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      <ArrowRight size={18}/>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 md:p-20 rounded-[32px] md:rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No projects found.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}