"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  User, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  ShieldCheck,
  X,
  Phone,
  Eye,
  EyeOff
} from "lucide-react";
import { Tooltip } from "@components/Tooltip";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showToast, setShowToast] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/(?!^\+)[^\d]/g, "");
    setPhone(cleanedValue);
  };

  const validateForm = () => {
    if (fullName.trim().split(" ").length < 2) {
      setErrorMsg("Please enter your full name (First and Last name)");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address");
      return false;
    }
    if (phone.length < 9) {
      setErrorMsg("Phone number must have at least 9 digits");
      return false;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            user_type: 'client',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (data.user) {
        setShowToast(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-full">
                <CheckCircle2 size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest">Success</p>
                <p className="text-xs text-slate-400 font-bold">Account created! Redirecting...</p>
              </div>
            </div>
            <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white shadow-2xl border border-slate-100 transition-all mx-auto shrink-0 my-auto"
        style={{ 
          maxWidth: '420px',
          padding: 'clamp(1.5rem, 5vh, 3rem)', 
          borderRadius: 'clamp(1.5rem, 4vh, 2.5rem)' 
        }}
      >
        <div className="text-center mb-[4vh] flex flex-col items-center">
          <span className="bg-yellow-400 text-slate-900 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-3">
            Join as a Client
          </span>
          <h2 className="text-[clamp(1.25rem, 3vh, 1.75rem)] font-black uppercase italic text-slate-900 tracking-tighter">
            Create Account
          </h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-[2vh]" noValidate>
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-wider animate-in shake duration-300">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
              Full Name <span className="text-red-500">*</span>
            </label>
            <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
              <User className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full pl-12 lg:pl-14 pr-6 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
              />
            </motion.div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
              Email Address <span className="text-red-500">*</span>
            </label>
            <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
              <Mail className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 lg:pl-14 pr-6 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
              />
            </motion.div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
              <Phone className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+385 9x xxx xxxx"
                className="w-full pl-12 lg:pl-14 pr-6 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
              />
            </motion.div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
              Secure Password <span className="text-red-500">*</span>
            </label>
            <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
              <Lock className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full pl-12 lg:pl-14 pr-12 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
              />
              <div className="absolute right-4">
                <Tooltip content={showPassword ? "Hide password" : "Show password"}>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-slate-400 hover:text-yellow-600 transition-colors rounded-full hover:bg-slate-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </Tooltip>
              </div>
            </motion.div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center group">
              <ShieldCheck className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={`w-full pl-12 lg:pl-14 pr-12 py-[1.5vh] bg-slate-50 border-2 rounded-2xl outline-none text-sm font-bold transition-all text-slate-900 placeholder:text-slate-400 placeholder:font-medium ${
                  confirmPassword && password !== confirmPassword 
                  ? "border-red-300 focus:border-red-500" 
                  : "border-slate-100 focus:border-yellow-400 focus:bg-white"
                }`}
              />
              <div className="absolute right-4">
                <Tooltip content={showConfirmPassword ? "Hide password" : "Show password"}>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-2 text-slate-400 hover:text-yellow-600 transition-colors rounded-full hover:bg-slate-100"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </Tooltip>
              </div>
            </motion.div>
          </div>

          <div className="relative">
            <Tooltip content="Start your journey">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || showToast}
                className="w-full bg-slate-900 text-white py-[1.8vh] rounded-2xl font-black text-[11px] flex items-center justify-center gap-3 hover:bg-yellow-400 hover:text-black transition-all uppercase tracking-[0.2em] mt-2 disabled:opacity-70 shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"} 
                {!loading && <ArrowRight size={18} />}
              </motion.button>
            </Tooltip>
          </div>
        </form>

        <div className="mt-[4vh] flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 w-full">
            <div className="h-px flex-1 bg-slate-100"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Already a member?</p>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div className="relative w-full">
            <Tooltip content="Go to Login">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/login" 
                  className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                >
                  <span className="text-[10px] font-black text-slate-900 group-hover:text-yellow-700 uppercase tracking-widest">
                    Back to Sign In
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