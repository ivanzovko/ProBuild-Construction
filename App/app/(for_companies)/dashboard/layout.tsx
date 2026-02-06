"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Loader2 } from "lucide-react";
import DashboardSidebar from "./components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login_company");
      }
    });

    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login_company");
        return;
      }

      const { data: profile } = await supabase
        .from("company_profiles")
        .select("is_onboarded")
        .eq("id", session.user.id)
        .single();

      if (!profile?.is_onboarded && pathname !== "/onboarding") {
        router.replace("/onboarding");
      } else {
        setLoading(false);
      }
    };

    checkAccess();

    return () => subscription.unsubscribe();
  }, [supabase, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative text-slate-900">
      <div className="lg:hidden bg-slate-950 text-white p-4 flex justify-between items-center z-50 shadow-lg shrink-0">
        <h2 className="text-xl font-black italic tracking-tighter uppercase">PRO<span className="text-yellow-400">-BUILD</span></h2>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-900 rounded-xl text-yellow-400">
          <Menu size={24} />
        </button>
      </div>

      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 overflow-y-auto h-screen">
        {children}
      </main>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[55] lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
    </div>
  );
}