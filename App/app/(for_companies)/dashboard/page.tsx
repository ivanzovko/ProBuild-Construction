"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardView from "./components/DashboardView";
import LoginView from "./components/LoginView";
import { Loader2 } from "lucide-react";

export default function ForCompaniesPage() {
  const router = useRouter();
  const [isLoggedInAsCompany, setIsLoggedInAsCompany] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userType = session.user?.user_metadata?.user_type;
        if (userType === 'company') {
          setIsLoggedInAsCompany(true);
        } else {
          setIsLoggedInAsCompany(false);
        }
      }
      setCheckingAuth(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const userType = session.user?.user_metadata?.user_type;
        if (userType === 'company') {
          setIsLoggedInAsCompany(true);
        } else {
          setIsLoggedInAsCompany(false);
        }
      } else {
        setIsLoggedInAsCompany(false);
      }
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedInAsCompany(true);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center p-6">
        <Loader2 className="text-yellow-400 animate-spin mb-4 w-10 h-10 md:w-12 md:h-12" />
        <p className="text-white font-black uppercase text-[10px] md:text-xs tracking-[0.3em] text-center">
          Authenticating...
        </p>
      </div>
    );
  }

  if (isLoggedInAsCompany) {
    return <DashboardView />;
  }

  return (
    /* UMJESTO fixed inset-0 top-20, koristimo min-h. 
       To omogućuje mobitelu da skrola ako je tipkovnica otvorena ili je ekran mali.
    */
    <div className="min-h-[calc(100dvh-5rem)] bg-slate-900 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <LoginView onLogin={handleLoginSuccess} />
      </div>
    </div>
  );
}