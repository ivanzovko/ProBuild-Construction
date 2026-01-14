"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Hammer, 
  Mail, 
  Lock, 
  ArrowRight, 
  Chrome, 
  UserPlus, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email");
      isValid = false;
    }
    if (password.length < 6) {
      setPasswordError("Too short");
      isValid = false;
    }
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userType = data.user?.user_metadata?.user_type;

      if (userType === 'company') {
        await supabase.auth.signOut();
        setGeneralError("This account is registered as a company.");
        setIsSubmitting(false);
        return;
      }

      router.push("/project_tracking");
      router.refresh();
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    /* Dodana transformacija scale na malim visinama ekrana (laptopi) da spriječi scroll */
    <div className="flex flex-col items-center animate-in fade-in duration-500 origin-center tall:scale-100 scale-90 md:scale-95 lg:scale-100">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-yellow-400 p-3 rounded-2xl shadow-md mb-3 text-black">
          <Hammer size={24} />
        </div>
        <h1 className="text-xl font-black italic uppercase tracking-tighter text-white drop-shadow-sm">
          PRO-BUILD
        </h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-lg border border-slate-100">
        <div className="text-center mb-6">
          <h2 className="text-lg font-black uppercase italic text-slate-900">Sign In</h2>
        </div>

        <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
          {generalError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl animate-in shake duration-300">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-wider">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{generalError}</span>
                </div>
                
                {generalError.includes("company") && (
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shrink-0"
                  >
                    For Companies <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="relative flex items-center group">
              <Mail className={`absolute left-4 transition-colors ${emailError ? 'text-red-500' : 'text-slate-300 group-focus-within:text-yellow-500'}`} size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                placeholder="Email Address" 
                className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl outline-none transition-all font-bold text-sm text-slate-900 ${emailError ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-yellow-400 focus:bg-white'}`}
              />
            </div>
            {emailError && <p className="text-[9px] text-red-500 font-black uppercase pl-2">{emailError}</p>}
          </div>
          
          <div className="space-y-1">
            <div className="relative flex items-center group">
              <Lock className={`absolute left-4 transition-colors ${passwordError ? 'text-red-500' : 'text-slate-300 group-focus-within:text-yellow-500'}`} size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                placeholder="Password" 
                className={`w-full pl-11 pr-11 py-3.5 bg-slate-50 border-2 rounded-xl outline-none transition-all font-bold text-sm text-slate-900 ${passwordError ? 'border-red-200 bg-red-50/30' : 'border-transparent focus:border-yellow-400 focus:bg-white'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-slate-300 hover:text-slate-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-between items-center px-2 text-right">
              <Link 
                href="/forgot-password" 
                className="text-[9px] font-black uppercase text-slate-400 hover:text-yellow-600 transition-colors tracking-widest ml-auto"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all uppercase tracking-widest mt-2 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Login"} 
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full border-t border-slate-100"></div>
          <span className="relative bg-white px-3 text-xs font-black text-black uppercase tracking-widest">Or</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-slate-100 rounded-xl font-black text-[10px] text-slate-900 hover:bg-slate-50 active:scale-[0.98] transition-all uppercase tracking-widest"
        >
          <Chrome size={18} className="text-red-500" />
          Google Account
        </button>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 w-full">
            <div className="h-px flex-1 bg-slate-100"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">New here?</p>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <Link 
            href="/register" 
            className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all"
          >
            <UserPlus size={16} className="text-slate-400 group-hover:text-yellow-600" />
            <span className="text-[10px] font-black text-slate-900 group-hover:text-yellow-700 uppercase tracking-widest">
              Create Account
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}