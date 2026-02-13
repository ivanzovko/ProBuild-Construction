"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { 
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
import { Tooltip } from "@components/Tooltip";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setIsDirty(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (generalError) {
      setIsDirty(false);
    }
  }, [generalError]);

  const handleInputChange = (setter: (val: string) => void, value: string, errorSetter?: (val: string) => void) => {
    setter(value);
    setIsDirty(true);
    setGeneralError(null);
    if (errorSetter) errorSetter("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    }
    if (password.length < 6) {
      setPasswordError("Password too short");
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

      const userId = data.user?.id;
      const userType = data.user?.user_metadata?.user_type;

      const { data: adminCheck } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (adminCheck?.is_admin) {
        router.push("/admin");
        router.refresh();
        return;
      }

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
        redirectTo: `${window.location.origin}/callback`,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    });
  };

  const isButtonDisabled = isSubmitting || (!!generalError && !isDirty);

  return (
    <div className="w-full flex flex-col items-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white shadow-2xl border border-slate-100 transition-all shrink-0"
        style={{ 
          maxWidth: 'clamp(320px, 100%, 500px)',
          padding: 'clamp(1.5rem, 5vh, 3rem)',
          borderRadius: 'clamp(1.5rem, 4vh, 2.5rem)'
        }}
      >
        <div className="text-center mb-[4vh] flex flex-col items-center">
          <span className="bg-yellow-400 text-slate-900 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-3">
            Client Portal
          </span>
          <h2 className="text-[clamp(1.25rem, 3vh, 1.75rem)] font-black uppercase italic text-slate-900 tracking-tighter">
            Welcome Back
          </h2>
        </div>

        <form className="space-y-[2vh]" onSubmit={handleSubmit} noValidate>
          {generalError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-wider">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{generalError}</span>
                </div>
                {generalError.includes("company") && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link 
                      href={`/login_company?email=${encodeURIComponent(email)}`} 
                      className="w-full bg-red-600 text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <span>Go to Business Login</span>
                      <ArrowRight size={12} />
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
            <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
              <Mail className={`absolute left-5 transition-colors ${emailError ? 'text-red-500' : 'text-slate-400 group-focus-within:text-yellow-600'}`} size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value, setEmailError)}
                disabled={isSubmitting && !generalError}
                placeholder="e.g. name@email.com" 
                className={`w-full pl-12 lg:pl-14 pr-6 py-[1.5vh] bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-medium ${emailError ? 'border-red-200 bg-red-50/30' : 'border-slate-100 focus:border-yellow-400 focus:bg-white'}`}
              />
            </motion.div>
            {emailError && <p className="text-[9px] text-red-500 font-black uppercase pl-4 tracking-tighter">{emailError}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Password</label>
            <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
              <Lock className={`absolute left-5 transition-colors ${passwordError ? 'text-red-500' : 'text-slate-400 group-focus-within:text-yellow-600'}`} size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value, setPasswordError)}
                disabled={isSubmitting && !generalError}
                placeholder="Enter your password" 
                className={`w-full pl-12 lg:pl-14 pr-12 py-[1.5vh] bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-medium ${passwordError ? 'border-red-200 bg-red-50/30' : 'border-slate-100 focus:border-yellow-400 focus:bg-white'}`}
              />
              <div className="absolute right-4">
                <Tooltip content={showPassword ? "Hide password" : "Show password"}>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </Tooltip>
              </div>
            </motion.div>
            <div className="flex justify-between items-center px-4">
              {passwordError ? <p className="text-[9px] text-red-500 font-black uppercase tracking-tighter">{passwordError}</p> : <div />}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link 
                  href="/forgot_password" 
                  className="text-[9px] font-black uppercase text-slate-400 hover:text-yellow-600 transition-colors tracking-widest"
                >
                  Forgot password
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="relative">
            <Tooltip content="Access your dashboard">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isButtonDisabled}
                className="w-full bg-slate-900 text-white py-[1.8vh] rounded-2xl font-black text-[11px] flex items-center justify-center gap-3 hover:bg-yellow-400 hover:text-black transition-all uppercase tracking-[0.2em] mt-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Sign In"} 
                {!isSubmitting && <ArrowRight size={18} />}
              </motion.button>
            </Tooltip>
          </div>
        </form>

        <div className="relative my-[3vh] flex items-center justify-center">
          <div className="absolute w-full border-t border-slate-100"></div>
          <span className="relative bg-white px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure login with</span>
        </div>

        <div className="relative">
          <Tooltip content="Fast & Secure">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-[1.5vh] border-2 border-slate-100 rounded-2xl font-black text-[10px] text-slate-900 hover:bg-slate-50 hover:border-slate-200 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              <Chrome size={18} className="text-red-500" />
              Google Account
            </motion.button>
          </Tooltip>
        </div>

        <div className="mt-[4vh] flex flex-col items-center gap-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Don't have an account?</p>
          <div className="relative w-full">
            <Tooltip content="Create new account">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/register" 
                  className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                >
                  <UserPlus size={16} className="text-slate-400 group-hover:text-yellow-600" />
                  <span className="text-[10px] font-black text-slate-900 group-hover:text-yellow-700 uppercase tracking-widest">
                    Join as a Client
                  </span>
                </Link>
              </motion.div>
            </Tooltip>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-yellow-400" size={32} /></div>}>
      <LoginContent />
    </Suspense>
  );
}