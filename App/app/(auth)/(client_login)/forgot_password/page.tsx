"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailError(false);

    if (!validateEmail(email)) {
      setEmailError(true);
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset_password`,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      <div 
        className="w-full bg-white shadow-2xl border border-slate-100 transition-all shrink-0 sm:mx-auto"
        style={{ 
          maxWidth: 'clamp(320px, 100%, 500px)',
          padding: 'clamp(1.25rem, 5vw, 3rem)',
          borderRadius: 'clamp(1.5rem, 4vh, 2.5rem)'
        }}
      >
        <div className="text-center mb-6 sm:mb-[4vh] flex flex-col items-center">
          <span className="bg-yellow-400 text-slate-900 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-3">
            Security Portal
          </span>
          <h2 className="text-[clamp(1.15rem, 3vh, 1.75rem)] font-black uppercase italic text-slate-900 tracking-tighter">
            Reset Password
          </h2>
        </div>

        {!submitted ? (
          <form className="space-y-6 sm:space-y-[3vh]" onSubmit={handleResetPassword} noValidate>
            <p className="text-[9px] sm:text-[10px] text-center font-bold text-slate-500 uppercase tracking-wider leading-relaxed px-2">
              Enter your email address and we'll send you a recovery link.
            </p>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 p-3 sm:p-4 rounded-xl flex items-center gap-3 text-red-600 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} className="shrink-0" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email</label>
              <div className="relative flex items-center group">
                <Mail className={`absolute left-4 sm:left-5 transition-colors ${emailError ? 'text-red-500' : 'text-slate-400 group-focus-within:text-yellow-600'}`} size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if(emailError) setEmailError(false);
                  }}
                  required
                  placeholder="e.g. name@gmail.com" 
                  className={`w-full pl-11 sm:pl-14 pr-4 py-4 sm:py-[1.5vh] bg-slate-50 border-2 outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-300 placeholder:font-medium rounded-xl sm:rounded-2xl ${emailError ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-yellow-400 focus:bg-white'}`}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 sm:py-[1.8vh] rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-3 hover:bg-yellow-400 hover:text-black active:scale-[0.98] transition-all uppercase tracking-[0.2em] mt-2 disabled:opacity-70 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Reset Link"} 
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase italic mb-2 tracking-tighter">Check your Inbox</h3>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-6">
              We have sent a secure recovery link to <br />
              <span className="text-slate-900 underline decoration-yellow-400 decoration-2 break-all px-2">{email}</span>
            </p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                Link expires in 60 minutes
              </span>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}