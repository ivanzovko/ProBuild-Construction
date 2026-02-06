"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Hammer, 
  User, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown,
  CheckCircle2,
  Loader2,
  ShieldAlert
} from "lucide-react";

type Page = {
  title: string;
  path: string;
};

const pages: Page[] = [
  { title: "Home", path: "/" },
  { title: "Services", path: "/find_service" },
  { title: "Estimates", path: "/plans_cost" },
  { title: "Live Tracking", path: "/project_tracking" },
];

export function Navigation() {
  const currentPath = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  // LOGIKA ZA AKTIVAN LINK
  const isCompanySection = 
    currentPath.startsWith("/dashboard") || 
    currentPath.startsWith("/onboarding") || 
    currentPath.startsWith("/login_company");

  const isAdmin = user?.email === 'admin@localhost.com';

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
      
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        const protectedPaths = ['/project_tracking', '/onboarding',  '/admin'];
        const pathname = window.location.pathname;
        const isProtected = protectedPaths.some(p => pathname.startsWith(p));
        if (isProtected && pathname !== '/dashboard') {
          router.push('/');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [currentPath]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      localStorage.clear();
      await new Promise(resolve => setTimeout(resolve, 300));
      setShowLogoutToast(true);
      setTimeout(() => setShowLogoutToast(false), 2000);
    } catch (error) {
      console.error("Logout error:", error);
      window.location.reload();
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
      setIsOpen(false);
    }
  };

  const showCompanyLink = !user || user?.user_metadata?.user_type === 'company';
  const isLoginActive = currentPath === "/login";

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm fixed top-0 z-[100]">
      {showLogoutToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-md animate-in slide-in-from-top duration-500">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-yellow-500 flex items-center gap-4 backdrop-blur-xl">
            <div className="bg-yellow-500 text-slate-900 p-2 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-[11px] uppercase tracking-[0.15em] text-white leading-none mb-1">Logout Successful</p>
              <p className="text-[9px] text-yellow-500 font-black uppercase tracking-widest">See you again soon!</p>
            </div>
            <button onClick={() => setShowLogoutToast(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 h-14 lg:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group relative z-[60] hover:scale-105 transition-transform duration-200">
          <div className="bg-yellow-400 p-1.5 lg:p-2 rounded-lg group-hover:bg-yellow-500 transition-colors">
            <Hammer size={18} className="text-black lg:size-[22px]" />
          </div>
          <span className="text-lg lg:text-xl font-black tracking-tighter text-slate-900">
            PRO-BUILD<span className="text-yellow-500">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <ul className="flex gap-6">
            {pages.map((page, index) => {
              const isActive = currentPath === page.path;
              return (
                <li key={index}>
                  <Link
                    href={page.path}
                    className={`relative text-sm font-bold uppercase tracking-wide transition-all py-1.5 hover:scale-110 inline-block
                      after:content-[''] after:absolute after:left-0 after:bottom-0 after:transition-all after:duration-300
                      ${isActive 
                        ? "text-slate-900 after:w-full after:h-[3px] after:bg-yellow-500" 
                        : "text-slate-500 hover:text-yellow-600 after:w-0 hover:after:w-full after:h-[2px] after:bg-yellow-400/60"
                      }`}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="h-6 w-[1px] bg-gray-200" />

          <div className="flex items-center gap-6 min-w-[120px] justify-end">
            {isAdmin && (
              <Link 
                href="/admin"
                className={`relative text-sm font-black transition-all py-1.5 flex items-center gap-2 hover:scale-105 text-red-600
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:transition-all after:duration-300
                  ${currentPath === "/admin" 
                    ? "after:w-full after:h-[3px] after:bg-red-600" 
                    : "after:w-0 hover:after:w-full after:h-[2px] after:bg-red-600/30"
                  }`}
              >
                <ShieldAlert size={14} />
                Admin
              </Link>
            )}

            {showCompanyLink && !isAdmin && (
              <Link 
                href={user ? "/dashboard" : "/login_company"}
                className={`relative text-sm font-bold transition-all py-1.5 flex items-center gap-2 hover:scale-105
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:transition-all after:duration-300
                  ${isCompanySection 
                    ? "text-slate-900 after:w-full after:h-[3px] after:bg-slate-900" 
                    : "text-slate-500 hover:text-slate-900 after:w-0 hover:after:w-full after:h-[2px] after:bg-slate-900/30"
                  }`}
              >
                For Companies
              </Link>
            )}

            {isLoading ? (
              <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-full" />
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                    <User size={12} />
                  </div>
                  <span className="max-w-[100px] truncate italic">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all shadow-md hover:scale-105 active:scale-95 
                  ${isLoginActive 
                    ? "bg-yellow-500 text-black" 
                    : "bg-slate-900 text-white hover:bg-slate-800"}`}
              >
                <User size={16} />
                Sign In
              </Link>
            )}
          </div>
        </nav>

        {/* MOBILE TRIGGER */}
        <button 
          className="lg:hidden p-2 text-slate-900 relative z-[60] hover:scale-110 transition-transform"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* MOBILE MENU */}
        <div className={`
          fixed inset-0 bg-white z-30 flex flex-col p-8 transition-all duration-300 ease-in-out lg:hidden
          ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
        `}>
          <div className="mt-16 flex flex-col gap-8 overflow-y-auto">
            <ul className="flex flex-col gap-6">
              {pages.map((page, index) => (
                <li key={index}>
                  <Link
                    href={page.path}
                    className={`text-2xl font-black uppercase tracking-tighter transition-all hover:translate-x-2 inline-block ${
                      currentPath === page.path ? "text-yellow-500" : "text-slate-900"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="h-[1px] w-full bg-gray-100 my-4" />
            
            <div className="flex flex-col gap-6 pb-10">
              {isAdmin && (
                <Link 
                  href="/admin"
                  className={`text-lg font-black uppercase tracking-tighter transition-all hover:translate-x-2 flex items-center gap-2 ${
                    currentPath === "/admin" ? "text-red-600" : "text-red-500/70"
                  }`}
                >
                  <ShieldAlert size={20} />
                  Admin Panel
                </Link>
              )}

              {showCompanyLink && !isAdmin && (
                <Link 
                  href={user ? "/dashboard" : "/login_company"}
                  className={`text-lg font-black uppercase tracking-tighter transition-all hover:translate-x-2 inline-block ${
                    isCompanySection ? "text-yellow-500" : "text-slate-600"
                  }`}
                >
                  For Companies
                </Link>
              )}

              {isLoading ? (
                <div className="h-14 w-full bg-slate-100 animate-pulse rounded-2xl" />
              ) : user ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                          <User size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 uppercase text-xs italic">{user.user_metadata?.full_name || "User"}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{user.email}</span>
                        </div>
                    </div>
                    <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl active:scale-95 hover:scale-[1.02] transition-all"
                >
                  <User size={24} />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}