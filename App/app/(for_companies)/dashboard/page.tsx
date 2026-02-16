"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Folder, 
  Activity, 
  TrendingUp, 
  ChevronRight,
  ArrowUpRight,
  Timer,
  Loader2,
  AlertCircle,
  Target
} from "lucide-react";
import { Tooltip } from "@components/Tooltip";

export default function DashboardPage() {
  const router = useRouter();
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [urgentEstimates, setUrgentEstimates] = useState<any[]>([]);
  const [globalPendingCount, setGlobalPendingCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01T00:00:00Z`;
        const endOfYear = `${currentYear}-12-31T23:59:59Z`;

        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setGlobalPendingCount(count || 0);

        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('contractor_id', user.id)
          .order('date_modified', { ascending: false });
        setMyJobs(jobsData || []);

        const { data: completedJobs } = await supabase
          .from('jobs')
          .select('temporary_price')
          .eq('contractor_id', user.id)
          .eq('status', 'completed')
          .gte('date_modified', startOfYear)
          .lte('date_modified', endOfYear);

        const jobsSum = completedJobs?.reduce((acc, curr) => acc + (Number(curr.temporary_price) || 0), 0) || 0;

        const { data: estimatesData } = await supabase
          .from('estimates')
          .select(`
            price, 
            status, 
            deadline_date, 
            job_id,
            jobs (
              title
            )
          `)
          .eq('contractor_id', user.id);

        const estimatesSum = estimatesData
          ?.filter(e => e.status === 'accepted')
          .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) || 0;

        setTotalValue(jobsSum + estimatesSum);

        if (estimatesData && estimatesData.length > 0) {
          const acceptedCount = estimatesData.filter(e => e.status === 'accepted').length;
          setWinRate(Math.round((acceptedCount / estimatesData.length) * 100));
          
          const urgent = estimatesData.filter(est => {
            if (est.status !== 'accepted' || !est.deadline_date) return false;
            const daysLeft = Math.ceil((new Date(est.deadline_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysLeft >= 0 && daysLeft <= 7;
          });
          setUrgentEstimates(urgent);
        }
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const calculateTimeEfficiency = () => {
    const activeJobs = myJobs.filter(j => j.status === 'active');
    if (activeJobs.length === 0) return 0;
    const efficiencies = activeJobs.map(job => {
      const startTime = new Date(job.started_at || job.created_at).getTime();
      const endTime = new Date(job.date_modified).getTime();
      const now = new Date().getTime();
      const totalDuration = endTime - startTime;
      const elapsed = now - startTime;
      if (totalDuration <= 0) return 100;
      const timeElapsedPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
      const progress = Number(job.progress) || 0;
      return timeElapsedPercent === 0 ? 100 : (progress / timeElapsedPercent) * 100;
    });
    return Math.min(Math.round(efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length), 100);
  };

  const globalEfficiency = calculateTimeEfficiency();

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h[calc(100vh-64px)] bg-white">
      <div className="p-4 sm:p-8 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">
              Dashboard <span className="text-yellow-400 not-italic">Overview</span>
            </h1>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
              Revenue & Performance 2026
            </p>
          </div>
        </div>

       <div className="mb-8">
          <p className="max-w-2xl text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider text-justify">
            Welcome to your operational command center. Monitor critical performance metrics, 
            from your bid win rate to on-site execution efficiency. 
            Below you will find a real-time overview of active projects and urgent deadlines requiring immediate attention.
          </p>
        </div>

        <div className="order-1 md:order-none lg:hidden mb-8">
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border-t-4 border-red-500">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle size={20} className="text-red-500 animate-pulse" />
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Deadline Radar</h2>
            </div>
            <div className="space-y-4">
              {urgentEstimates.length > 0 ? urgentEstimates.map(est => {
                const daysLeft = Math.ceil((new Date(est.deadline_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const jobTitle = est.jobs?.title || "Unknown Project";

                return (
                  <div key={est.job_id} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-white uppercase truncate w-32">{jobTitle}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${daysLeft <= 2 ? 'bg-red-500' : 'bg-orange-500'} text-white`}>
                        {daysLeft}D LEFT
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                        Accepted Estimate Deadline
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No critical deadlines</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-2 md:order-none grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Tooltip content="View all pending tenders">
            <div 
              onClick={() => router.push('/dashboard/tenders')}
              className="bg-slate-900 p-4 md:p-6 rounded-2xl border-b-4 border-yellow-400 shadow-xl group cursor-pointer hover:scale-[1.03] hover:translate-y-[-4px] transition-all duration-200"
            >
              <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0">
                <div className="p-2 md:p-3 bg-white/10 rounded-xl text-yellow-400 mb-0 md:mb-6">
                  <Folder className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Pending</p>
                  <h3 className="text-xl md:text-4xl font-black text-white italic mt-1 md:mt-2 tracking-tighter">{globalPendingCount}</h3>
                </div>
              </div>
            </div>
          </Tooltip>

          <Tooltip content="Success rate of your submitted estimates">
            <div 
              onClick={() => router.push('/dashboard/tracker')}
              className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-100 shadow-sm group cursor-pointer hover:scale-[1.03] hover:border-yellow-400 transition-all duration-200 hover:translate-y-[-4px]"
            >
              <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0">
                <div className="p-2 md:p-3 bg-emerald-50 rounded-xl text-emerald-500 mb-0 md:mb-6">
                  <Activity className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Bid Win Rate</p>
                  <h3 className="text-xl md:text-4xl font-black text-slate-900 italic mt-1 md:mt-2 tracking-tighter">{winRate}%</h3>
                </div>
              </div>
            </div>
          </Tooltip>

          <Tooltip content="Total revenue from completed jobs and accepted estimates this year">
            <div className="bg-yellow-400 p-4 md:p-6 rounded-2xl border-b-4 border-slate-900 shadow-xl group hover:scale-[1.03] transition-transform duration-200">
              <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0">
                <div className="p-2 md:p-3 bg-slate-900 rounded-xl text-yellow-400 mb-0 md:mb-6">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">YTD Revenue</p>
                  <h3 className="text-xl md:text-4xl font-black text-slate-900 italic mt-1 md:mt-2 tracking-tighter">
                    {totalValue.toLocaleString()}<span className="text-sm md:text-xl not-italic ml-0.5">€</span>
                  </h3>
                </div>
              </div>
            </div>
          </Tooltip>

          <Tooltip content="Project progress relative to elapsed time">
            <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border-2 border-slate-100 shadow-sm group hover:scale-[1.03] transition-transform duration-200">
              <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-0">
                <div className="p-2 md:p-3 bg-white rounded-xl text-slate-400 border border-slate-100 mb-0 md:mb-6">
                  <Timer className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Efficiency</p>
                  <h3 className={`text-xl md:text-4xl font-black italic tracking-tighter mt-1 md:mt-2 ${globalEfficiency >= 70 ? 'text-slate-900' : 'text-red-500'}`}>
                    {globalEfficiency}%
                  </h3>
                </div>
              </div>
            </div>
          </Tooltip>
        </div>

        <div className="order-3 md:order-none grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 md:mt-12">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-6">Recent Work Progress</h2>
            <div className="space-y-3">
              {myJobs.filter(j => j.status === 'active').slice(0, 5).map((job) => (
                <Tooltip key={job.id} content={`Track progress for ${job.title || job.project_type}`} side="bottom">
                  <div 
                    onClick={() => router.push(`/dashboard/tracker/${job.id}`)}
                    className="flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-yellow-400 hover:scale-[1.01] transition-all duration-200 group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-yellow-400 font-black italic uppercase text-[10px]">
                        {job.project_type?.slice(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase text-sm leading-tight">{job.title || job.project_type}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          Loc: {job.location || 'Not set'} • {job.sqm}m²
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden md:block text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 italic">{job.progress}%</span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400" style={{ width: `${job.progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-yellow-400 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="hidden lg:block space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border-t-4 border-red-500">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle size={20} className="text-red-500 animate-pulse" />
                <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Deadline Radar</h2>
              </div>
              <div className="space-y-4">
                {urgentEstimates.length > 0 ? urgentEstimates.map(est => {
                  const daysLeft = Math.ceil((new Date(est.deadline_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const jobTitle = est.jobs?.title || "Unknown Project";

                  return (
                    <Tooltip key={est.job_id} content="Critical deadline for accepted offer" side="left">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:scale-[1.05] transition-transform duration-200 cursor-default">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-white uppercase truncate w-32">{jobTitle}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${daysLeft <= 2 ? 'bg-red-500' : 'bg-orange-500'} text-white`}>
                            {daysLeft}D LEFT
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                            Accepted Estimate Deadline
                          </p>
                        </div>
                      </div>
                    </Tooltip>
                  );
                }) : (
                  <div className="text-center py-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No critical deadlines</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}