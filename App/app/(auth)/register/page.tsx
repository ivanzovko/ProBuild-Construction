"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  User, 
  AlertCircle, 
  Loader2,
  CheckCircle2 
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'client',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (data.user) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300 origin-center scale-90 md:scale-100">
        <div className="bg-green-500 p-5 rounded-full mb-8 shadow-lg shadow-green-500/20">
          <CheckCircle2 size={56} className="text-white" />
        </div>
        
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          Success!
        </h2>
        
        <p className="text-slate-200 mt-6 text-lg font-medium leading-relaxed max-w-sm">
          Your account has been created successfully. <br />
          You can now sign in to your dashboard.
        </p>

        <Link 
          href="/login" 
          className="mt-10 flex items-center justify-center gap-3 w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all active:scale-[0.98] shadow-xl"
        >
          Go to Login <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500 origin-center scale-90 md:scale-95 lg:scale-100">
      
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-lg border border-slate-100">
        <div className="text-center mb-6">
          <h2 className="text-lg font-black uppercase italic text-slate-900">Create Account</h2>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            Join as a client
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5" noValidate>
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <div className="relative flex items-center group">
              <User className="absolute left-4 text-slate-300 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-yellow-400 focus:bg-white outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative flex items-center group">
              <Mail className="absolute left-4 text-slate-300 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-yellow-400 focus:bg-white outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative flex items-center group">
              <Lock className="absolute left-4 text-slate-300 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-yellow-400 focus:bg-white outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all uppercase tracking-widest mt-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Register"} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 w-full">
            <div className="h-px flex-1 bg-slate-100"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Already a member?</p>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <Link 
            href="/login" 
            className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all"
          >
            <span className="text-[10px] font-black text-slate-900 group-hover:text-yellow-700 uppercase tracking-widest">
              Log In Here
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}