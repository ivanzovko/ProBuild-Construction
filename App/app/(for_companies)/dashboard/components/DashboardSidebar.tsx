// File: DashboardSidebar.tsx
// Folder: components/dashboard/

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Gavel, 
  MessageSquare, 
  Construction, 
  Building2,
  ChevronRight,
  X,
  Loader2,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null); // Promjena: null označava učitavanje
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("company_profiles")
          .select("company_name, is_verified")
          .eq("id", session.user.id)
          .single();
        
        setCompanyName(data?.company_name || "Company");
        setIsVerified(data?.is_verified ?? false); // Koristimo nullish coalescing
      }
      setLoading(false);
    };

    fetchCompanyData();
  }, [supabase]);

  useEffect(() => {
    const fetchUnreadInquiries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { count, error } = await supabase
          .from("inquiries")
          .select("*", { count: 'exact', head: true })
          .eq("company_id", session.user.id)
          .eq("is_read", false)
          .eq("is_answered", false);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      }
    };

    fetchUnreadInquiries();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inquiries'
        },
        () => {
          fetchUnreadInquiries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { 
      name: "Inquiries", 
      href: "/dashboard/inquiries", 
      icon: ClipboardList, 
      badge: unreadCount > 0 ? unreadCount.toString() : null 
    },
    { name: "Tender Market", href: "/dashboard/tenders", icon: Gavel },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: "New" },
    { name: "Project Tracker", href: "/dashboard/tracker", icon: Construction },
    { name: "Company Profile", href: "/dashboard/profile", icon: Building2 },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 sm:w-80 bg-slate-950 text-white flex flex-col p-6 sm:p-8 border-r border-white/5 
        transition-transform duration-300 lg:translate-x-0 lg:static
        top-14 lg:top-0 h-[calc(100dvh-56px)] lg:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        <div className="flex justify-between items-center mb-10 flex-shrink-0">
          {loading ? (
            <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase truncate pr-4">
              {companyName}
            </h2>
          )}
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-3 overflow-y-auto scrollbar-hide pr-2 -mr-2 mb-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.20em] sm:tracking-[0.25em] transition-all duration-300 group
                  hover:scale-[1.02] active:scale-95
                  ${isActive 
                    ? "bg-yellow-400 text-black shadow-[0_10px_20px_rgba(250,204,21,0.2)]" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <item.icon 
                    size={20} 
                    className={`transition-colors duration-300 ${isActive ? "text-black" : "text-slate-500 group-hover:text-yellow-400"}`} 
                  />
                  <span>{item.name}</span>
                </div>
                
                {item.badge ? (
                  <span className={`px-2.5 py-1 rounded-xl text-[8px] font-black transition-all duration-300 ${isActive ? 'bg-black text-white' : 'bg-yellow-400 text-black group-hover:scale-110'}`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight 
                    size={16} 
                    className={`transition-all duration-300 ${isActive ? 'text-black opacity-100 translate-x-1' : 'text-slate-700 opacity-0 group-hover:opacity-100 group-hover:text-yellow-400 group-hover:translate-x-1'}`} 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 mb-12 sm:mb-20 pt-6 border-t border-white/5">
          {isVerified === null ? (
            /* Skeleton dok se učitava */
            <div className="rounded-2xl p-4 bg-white/5 border border-white/5 animate-pulse">
              <div className="h-2 w-16 bg-white/10 rounded mb-2" />
              <div className="h-3 w-32 bg-white/10 rounded" />
            </div>
          ) : (
            <div className={`rounded-2xl p-4 border transition-all duration-500 ${isVerified ? 'bg-white/5 border-white/5' : 'bg-red-500/5 border-red-500/20'}`}>
              <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Account Status</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isVerified ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-[9px] font-black uppercase italic ${isVerified ? 'text-white' : 'text-red-400'}`}>
                    {isVerified ? 'Verified Partner' : 'Verification Pending'}
                  </span>
                </div>
                {isVerified ? (
                  <ShieldCheck size={14} className="text-green-500" />
                ) : (
                  <ShieldAlert size={14} className="text-red-500" />
                )}
              </div>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}