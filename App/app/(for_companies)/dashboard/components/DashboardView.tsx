"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Plus, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Users,
  Loader2,
  Menu
} from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import { Tooltip } from "@components/Tooltip";

export default function DashboardView() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Company");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      setProjects(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
      fetchProjects();
    };
    initData();
  }, [supabase, fetchProjects]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative text-slate-900">
      
      <div className="lg:hidden bg-slate-950 text-white p-4 flex justify-between items-center z-50 shadow-lg border-b border-white/5">
        <h2 className="text-lg font-black italic tracking-tighter uppercase text-yellow-400">
          Overview
        </h2>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-900 rounded-xl text-yellow-400">
          <Menu size={24} />
        </button>
      </div>

      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto h-[calc(100vh-60px)] lg:h-screen">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic leading-tight">
              Welcome, <span className="text-yellow-500">{userName.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
              {loading ? "Syncing..." : `${projects.length} Active Inquiries`}
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Tooltip content="Find new business opportunities" side="bottom">
              <button 
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
              >
                Search Tenders <Plus size={18}/>
              </button>
            </Tooltip>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recent Activity</h3>
            <button 
              onClick={fetchProjects} 
              className="text-[9px] font-black uppercase text-slate-400 hover:text-yellow-500 tracking-widest transition-colors"
            >
              Refresh Feed
            </button>
          </div>
          
          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="font-bold uppercase text-[10px] tracking-widest">Loading Dashboard...</p>
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">
                No active items found.
              </div>
            )}
          </div>
        </section>
      </main>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[55] lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div 
      className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-yellow-400 transition-all cursor-pointer relative"
    >
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${project.status === "New Inquiry" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}>
          <Clock className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg italic truncate">{project.service}</h4>
          <div className="flex gap-x-4 mt-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {project.client}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {project.location}</span>
          </div>
        </div>
      </div>
      
      <div className="relative flex items-center">
        <Tooltip content="View details & respond" side="left">
          <button className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <ArrowRight size={18}/>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}