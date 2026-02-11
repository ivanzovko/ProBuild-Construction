/* components/auth/LoginView.tsx */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, Lock, Mail, ArrowRight, ShieldCheck, 
  TrendingUp, Briefcase, 
  AlertCircle, UserPlus, LogIn, Eye, EyeOff 
} from "lucide-react";

interface LoginViewProps {
  onSubmit: (data: any) => void;
  onInputChange: () => void;
  loading: boolean;
  errorMsg: string | null;
  isClientAccount?: boolean;
  initialEmail?: string;
}

function LoginViewContent({ 
  onSubmit, 
  onInputChange, 
  loading, 
  errorMsg, 
  isClientAccount,
  initialEmail = ""
}: LoginViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setIsDirty(true);
    } else if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail, searchParams]);

  useEffect(() => {
    if (errorMsg) {
      setIsDirty(false);
    }
  }, [errorMsg]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty && errorMsg) return;
    onSubmit({ isLogin, email, password, confirmPassword });
  };

  const handleChange = (type: string, value: string) => {
    setIsDirty(true);
    onInputChange(); 
    if (type === "email") setEmail(value);
    if (type === "password") setPassword(value);
    if (type === "confirm") setConfirmPassword(value);
  };

  const handleClientRedirect = () => {
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    router.push(`/login?${params.toString()}`);
  };

  const isButtonDisabled = loading || (!!errorMsg && !isDirty);

  return (
    <div className="relative flex flex-col w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-slate-900">
      <div className="flex flex-col-reverse lg:flex-row h-full w-full">
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .animate-shake { animation: shake 0.3s ease-in-out; }
        `}</style>

        <section className="flex-1 p-6 sm:p-10 xl:p-20 flex flex-col justify-center relative overflow-hidden border-t lg:border-t-0 lg:border-r border-white/10 bg-slate-950 shrink-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-800 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl whitespace-nowrap lg:whitespace-normal sm:text-4xl xl:text-6xl font-black uppercase italic leading-tight mb-8 lg:mb-12 text-white tracking-tighter text-center lg:text-left">
              Grow your <span className="text-yellow-400">Business</span>
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 max-w-2xl lg:max-w-md mx-auto lg:mx-0">
              <FeatureItem icon={<TrendingUp size={20} />} title="Higher Profit" desc="Access active projects in Croatia." color="yellow" />
              <FeatureItem icon={<ShieldCheck size={20} />} title="Verified Clients" desc="Secure inquiries only." color="blue" />
              <FeatureItem icon={<Briefcase size={20} />} title="Management" desc="Simple quoting and tracking." color="green" />
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 overflow-y-auto">
          <div 
            className="w-full bg-white rounded-[32px] lg:rounded-[40px] shadow-xl border border-slate-100 my-auto shrink-0"
            style={{ 
              maxWidth: 'clamp(320px, 30vw, 420px)',
              padding: 'clamp(1.5rem, 4vh, 2.5rem)' 
            }}
          >
            <div className="text-center mb-[3vh]">
              <div className="inline-flex bg-yellow-100 text-yellow-700 p-3 rounded-2xl mb-4">
                <Building2 size={24} className="lg:w-8 lg:h-8" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                {isLogin ? "Company Login" : "Partner with us"}
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-[2vh]">
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl animate-shake">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-wider">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    {isClientAccount && (
                      <button 
                        type="button"
                        onClick={handleClientRedirect}
                        className="flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors w-full"
                      >
                        Client Login <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Business Email</label>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={loading && !errorMsg && !isClientAccount}
                    placeholder="e.g. info@yourcompany.com" 
                    className="w-full pl-12 lg:pl-14 pr-6 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-medium disabled:opacity-50" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-4 mr-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                  {isLogin && (
                    <Link 
                      href="/forgot_password" 
                      className="text-[9px] font-black uppercase text-slate-400 hover:text-yellow-600 transition-colors tracking-widest"
                    >
                      Forgot password
                    </Link>
                  )}
                </div>
                <div className="relative flex items-center group">
                  <Lock className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    disabled={loading && !errorMsg && !isClientAccount}
                    placeholder="Enter your password" 
                    className="w-full pl-12 lg:pl-14 pr-12 py-[1.5vh] bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-medium disabled:opacity-50" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-yellow-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Confirm Password</label>
                  <div className="relative flex items-center group">
                    <Lock className="absolute left-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" size={18} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => handleChange("confirm", e.target.value)}
                      required
                      disabled={loading && !errorMsg && !isClientAccount}
                      placeholder="Repeat your password" 
                      className={`w-full pl-12 lg:pl-14 pr-12 py-[1.5vh] bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none font-bold transition-all text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-medium disabled:opacity-50 ${confirmPassword && password !== confirmPassword ? 'border-red-200' : 'border-slate-100 focus:border-yellow-400'}`} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-slate-400 hover:text-yellow-600 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isButtonDisabled}
                className="w-full bg-slate-900 text-white py-[1.8vh] rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] lg:text-xs hover:bg-yellow-400 hover:text-black transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] mt-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {loading ? "Checking..." : (isLogin ? "Sign In Now" : "Create Account")}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {isLogin ? "New to the platform?" : "Already have a company account?"}
                </p>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={() => { setIsLogin(!isLogin); setIsDirty(true); onInputChange(); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group disabled:opacity-50"
                >
                  {isLogin ? (
                    <>
                      <UserPlus size={16} className="text-slate-400 group-hover:text-yellow-600" />
                      <span className="text-[10px] font-black text-slate-900 uppercase">Register your Company</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={16} className="text-slate-400 group-hover:text-yellow-600" />
                      <span className="text-[10px] font-black text-slate-900 uppercase">Return to Login</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc, color }: any) {
  const colors: any = { 
    yellow: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30", 
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    green: "bg-green-400/20 text-green-400 border-green-400/30" 
  };
  return (
    <div className="flex items-center lg:items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
      <div className={`w-10 h-10 lg:w-12 lg:h-12 shrink-0 border rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-black uppercase italic text-[10px] lg:text-sm mb-0.5 tracking-widest text-white">{title}</h3>
        <p className="text-slate-400 text-[10px] lg:text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function LoginView(props: LoginViewProps) {
  return (
    <Suspense fallback={null}>
      <LoginViewContent {...props} />
    </Suspense>
  );
}