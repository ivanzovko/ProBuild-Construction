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
  AlertCircle,
  X
} from "lucide-react";

export default function DashboardView() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Company");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className="fixed inset-0 top-20 bg-slate-50 flex overflow-hidden">
      
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="bg-slate-50 text-slate-900 p-5 rounded-3xl mb-6">
                <LogOut size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">
                Sign Out?
              </h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3 mb-10 leading-relaxed">
                You are about to end your current session.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex items-center justify-center py-4 rounded-2xl border-2 border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  <X size={16} className="mr-2" /> Cancel
                </button>
                <button
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="flex items-center justify-center py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <LogOut size={16} className="mr-2" /> Log Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 h-full">
        <div className="mb-12 px-4">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
            PRO<span className="text-yellow-400">-BUILD</span>
          </h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest bg-yellow-400 text-black shadow-lg shadow-yellow-400/10 transition-transform active:scale-95">
            <LayoutDashboard size={20}/> Overview
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-colors">
            <Briefcase size={20}/> My Projects
          </button>
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-colors">
            <MessageSquare size={20}/> Messages
          </button>
        </nav>

        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-4 px-6 py-4 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors mt-auto"
        >
          <LogOut size={20}/> Log Out
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto h-full pb-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic">
              Welcome back, <span className="text-yellow-500">{userName}</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1 italic">
              {loading ? "Syncing with database..." : `You have ${projects.length} total projects.`}
            </p>
          </div>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-slate-900/10">
            Create Project <Plus size={18}/>
          </button>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Recent Projects</h3>
            <button 
              onClick={fetchProjects}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-yellow-500 transition-colors tracking-widest"
            >
              Refresh Data
            </button>
          </div>
          
          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold uppercase text-xs tracking-widest">Loading projects...</p>
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-yellow-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      project.status === "New Inquiry" 
                        ? "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-400 group-hover:text-black" 
                        : "bg-blue-100 text-blue-600 group-hover:bg-slate-900 group-hover:text-white"
                    }`}>
                      <Clock />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg italic">{project.service}</h4>
                      <div className="flex gap-4 mt-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-slate-300"/> {project.client}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-300"/> {project.location}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={20}/>
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No active projects found.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}