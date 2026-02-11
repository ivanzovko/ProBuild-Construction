"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Plus, Clock, Users, MapPin, ArrowRight, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const isProcessing = useRef(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const checkAccess = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login_company");
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("company_profiles")
          .select("is_onboarded")
          .eq("id", session.user.id)
          .single();

        if (!profile?.is_onboarded) {
          router.replace("/onboarding");
        } else {
          // Dohvati projekte odmah ovdje
          const { data: projData } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
          
          setProjects(projData || []);
          setLoading(false);
        }
      } catch (err) {
        router.replace("/login_company");
      } finally {
        isProcessing.current = false;
      }
    };

    checkAccess();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic leading-tight">
            Dashboard <span className="text-yellow-500">Overview</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
            {projects.length} Active Items found
          </p>
        </div>
        <button className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center gap-2 shadow-xl">
          Search Tenders <Plus size={18}/>
        </button>
      </header>

      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recent Activity</h3>
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {projects.length === 0 && (
            <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">
              No recent activity.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Možeš ostaviti ProjectCard ovdje ili ga izvući u components
function ProjectCard({ project }: { project: any }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-yellow-400 transition-all cursor-pointer">
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-yellow-50 text-slate-400 group-hover:text-yellow-600 transition-colors">
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
      <button className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
        <ArrowRight size={18}/>
      </button>
    </div>
  );
}