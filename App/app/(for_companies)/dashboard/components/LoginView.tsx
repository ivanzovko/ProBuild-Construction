"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn
} from "lucide-react";

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const userType = data.user?.user_metadata?.user_type;

        if (userType !== 'company') {
          await supabase.auth.signOut();
          setErrorMsg("This account is registered as a client.");
          setLoading(false);
          return; 
        }

        onLogin();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: 'company',
              full_name: email.split('@')[0],
            }
          }
        });
        
        if (error) throw error;
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="w-full min-h-[100dvh] flex items-center justify-center p-6 bg-slate-900 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-md w-full">
          <div className="bg-green-500 p-4 md:p-5 rounded-full mb-6 md:mb-8 shadow-lg shadow-green-500/20">
            <CheckCircle2 className="text-white w-10 h-10 md:w-14 md:h-14" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">Success!</h2>
          <p className="text-slate-200 mt-4 md:mt-6 text-sm md:text-lg font-medium leading-relaxed">
            Your company account has been created. <br className="hidden md:block" />
            You can now access your business dashboard.
          </p>
          <button 
            onClick={() => { setIsSuccess(false); setIsLogin(true); }}
            className="mt-8 md:mt-10 flex items-center justify-center gap-3 w-full py-4 md:py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all active:scale-[0.98] shadow-xl"
          >
            Go to Login <ArrowRight size={18} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] w-full">
      {/* LEFT SIDE: Marketing Info (Hidden on Mobile/Tablet) */}
      <section className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-24 flex-col justify-center relative overflow-hidden h-full">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl lg:text-7xl font-black uppercase italic leading-tight mb-8 text-white">
            Grow your <br /> <span className="text-yellow-400">Business.</span>
          </h1>
          <div className="space-y-8 max-w-md text-white">
            <div className="flex gap-6">
              <div className="w-12 h-12 shrink-0 bg-slate-800 rounded-2xl flex items-center justify-center text-yellow-400"><TrendingUp size={24} /></div>
              <div>
                <h3 className="font-black uppercase italic text-sm mb-1 tracking-widest">Higher Profit</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Access a database of active projects in Croatia every month.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 shrink-0 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400"><ShieldCheck size={24} /></div>
              <div>
                <h3 className="font-black uppercase italic text-sm mb-1 tracking-widest">Verified Clients</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Every inquiry goes through our verification system.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 shrink-0 bg-slate-800 rounded-2xl flex items-center justify-center text-green-400"><Briefcase size={24} /></div>
              <div>
                <h3 className="font-black uppercase italic text-sm mb-1 tracking-widest">Management</h3>
                <p className="text-slate-400 text-sm leading-relaxed">A simple system for sending quotes and tracking construction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE: Auth Form */}
      <section className="w-full lg:w-1/2 min-h-screen lg:min-h-full flex items-center justify-center p-4 sm:p-8 bg-slate-900 lg:bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 md:p-16 rounded-[32px] md:rounded-[48px] shadow-2xl border border-slate-100 my-auto">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex bg-yellow-100 text-yellow-700 p-3 md:p-4 rounded-2xl md:rounded-3xl mb-4">
              <Building2 className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
              {isLogin ? "Welcome back" : "Partner with us"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl animate-in shake duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  {errorMsg.includes("client") && (
                    <Link 
                      href="/login" 
                      className="w-full sm:w-auto text-center bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shrink-0"
                    >
                      Client Login
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
              <div className="relative flex items-center group">
                <Mail className="absolute left-6 text-slate-300 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com" 
                  className="w-full pl-14 md:pl-16 pr-6 py-4 md:py-5 bg-slate-50 border-2 border-transparent rounded-[20px] md:rounded-[24px] focus:border-yellow-400 focus:bg-white outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-300" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
              <div className="relative flex items-center group">
                <Lock className="absolute left-6 text-slate-300 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••" 
                  className="w-full pl-14 md:pl-16 pr-6 py-4 md:py-5 bg-slate-50 border-2 border-transparent rounded-[20px] md:rounded-[24px] focus:border-yellow-400 focus:bg-white outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-300" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-yellow-400 hover:text-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? "Log In" : "Create Account")}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="mt-6 md:mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 w-full">
                <div className="h-px flex-1 bg-slate-100"></div>
                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {isLogin ? "Join our network" : "Already registered?"}
                </p>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
                className="group flex items-center justify-center gap-2 w-full py-3 md:py-4 rounded-[16px] md:rounded-[20px] border-2 border-dashed border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all"
              >
                {isLogin ? (
                  <>
                    <UserPlus size={16} className="text-slate-400 group-hover:text-yellow-600" />
                    <span className="text-[9px] md:text-[10px] font-black text-slate-900 group-hover:text-yellow-700 uppercase tracking-widest">
                      Register company
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="text-slate-400 group-hover:text-yellow-600" />
                    <span className="text-[9px] md:text-[10px] font-black text-slate-900 group-hover:text-yellow-700 uppercase tracking-widest">
                      Back to login
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}