"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Lock, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      await supabase.auth.signOut();
      
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-6">
      <div 
        className="w-full bg-white shadow-2xl border border-slate-100 transition-all shrink-0"
        style={{ 
          maxWidth: 'clamp(320px, 100%, 500px)',
          padding: 'clamp(1.5rem, 5vh, 3rem)',
          borderRadius: 'clamp(1.5rem, 4vh, 2.5rem)'
        }}
      >
        <div className="text-center mb-[4vh] flex flex-col items-center">
          <span className="bg-yellow-400 text-slate-900 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-3">
            Secure Update
          </span>
          <h2 className="text-[clamp(1.25rem, 3vh, 1.75rem)] font-black uppercase italic text-slate-900 tracking-tighter">
            Set New Password
          </h2>
        </div>

        {!success ? (
          <form onSubmit={handleUpdatePassword} className="space-y-[2.5vh]" noValidate>
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 font-bold text-[10px] uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">New Password</label>
              <div className="relative flex items-center group">
                <Lock className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 lg:pl-14 pr-6 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Confirm New Password</label>
              <div className="relative flex items-center group">
                <ShieldCheck className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 lg:pl-14 pr-6 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-[1.8vh] rounded-2xl font-black text-[11px] flex items-center justify-center gap-3 hover:bg-yellow-400 hover:text-black active:scale-[0.98] transition-all uppercase tracking-[0.2em] mt-2 disabled:opacity-70 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"} 
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase italic mb-2 tracking-tighter text-center">Security Updated</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed text-center">
              Your password has been successfully reset. <br />
              Returning to login portal...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}