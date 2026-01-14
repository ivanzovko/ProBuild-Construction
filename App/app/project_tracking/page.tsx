"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Camera, 
  Lock, 
  UserCheck, 
  LayoutDashboard, 
  ArrowRight, 
  LogOut, 
  X, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Calendar,
  MapPin
} from "lucide-react";

export default function LiveTrackingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Sigurnosna provjera: Ako je firma zalutala ovdje, šalji ih na njihov dashboard
      if (user.user_metadata?.user_type === 'company') {
        router.push("/dashboard");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.refresh();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-yellow-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading your project...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <LayoutDashboard size={200} />
          </div>

          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock size={32} className="text-yellow-600" />
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight italic">
            Track Your <span className="text-yellow-500">Construction</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
            Personalized dashboard is available for registered clients only. <br />
            Monitor progress, view daily logs, and see live photos of your site.
          </p>

          <div className="flex flex-col gap-4 relative z-10">
            <button 
              onClick={() => router.push("/login")}
              className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-base uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
            >
              Sign in to view dashboard
              <ArrowRight size={20} />
            </button>
            
            <p className="text-sm text-slate-400 flex items-center justify-center gap-2 font-bold uppercase tracking-tighter">
              <UserCheck size={14} /> 
              Not a client yet? <Link href="/find_service" className="text-yellow-600 font-black hover:underline">Find a contractor</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !isLoggingOut && setShowLogoutConfirm(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="bg-slate-50 text-slate-900 p-5 rounded-3xl mb-6"><LogOut size={40} /></div>
              <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">Sign Out?</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3 mb-10">You are about to end your tracking session.</p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button disabled={isLoggingOut} onClick={() => setShowLogoutConfirm(false)} className="flex items-center justify-center py-4 rounded-2xl border-2 border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                  <X size={16} className="mr-2" /> Cancel
                </button>
                <button disabled={isLoggingOut} onClick={handleLogout} className="flex items-center justify-center py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-xl">
                  {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <><LogOut size={16} className="mr-2" /> Log Out</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <CheckCircle2 size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Project Active</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none">
              Hello, <span className="text-yellow-500">{user.user_metadata?.full_name || 'Client'}</span>
            </h1>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {/* Status Card */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Total Progress</h3>
                  <span className="text-4xl font-black italic text-slate-900">65%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 w-[65%] rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-6 mt-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><Calendar size={20} /></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Estimated Finish</p>
                      <p className="font-bold text-slate-900">Oct 24, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Site Location</p>
                      <p className="font-bold text-slate-900">Zagreb, HR</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Logs Placeholder */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white">
              <h3 className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-8 flex items-center gap-2">
                <Clock size={18} /> Daily Site Logs
              </h3>
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-6 border-l-2 border-slate-800 pl-6 pb-6 last:pb-0 relative">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Today, 09:30 AM</p>
                      <h4 className="font-bold text-lg mb-2 italic">Foundations Completed</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">Concrete pouring for the main building foundation is successfully finished. Curing process started.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group cursor-pointer hover:border-yellow-400 transition-all">
                <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                  <Camera size={24} />
                </div>
                <h4 className="font-black uppercase italic text-slate-900 mb-2 tracking-tight">Live Cam Feed</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Access real-time video stream from the construction site cameras.</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-600">
                  Open Stream <ArrowRight size={12} />
                </div>
             </div>

             <div className="bg-yellow-400 p-8 rounded-[32px] shadow-lg shadow-yellow-400/10">
                <h4 className="font-black uppercase italic text-black mb-2 tracking-tight">Need Help?</h4>
                <p className="text-xs text-yellow-900 font-bold leading-relaxed mb-6">Contact your project manager directly for any questions.</p>
                <button className="w-full bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                  Send Message
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}