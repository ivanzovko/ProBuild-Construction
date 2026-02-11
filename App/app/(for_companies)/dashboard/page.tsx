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
          // Ako je korisnik klijent, NE odjavljujemo ga (signOut).
          // Samo ga ne puštamo u Dashboard i ostavljamo isLoggedInAsCompany na false.
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
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="text-yellow-400 animate-spin mb-4" size={48} />
        <p className="text-white font-black uppercase text-xs tracking-[0.3em]">
          Authenticating...
        </p>
      </div>
    );
  }

  // Ako je prijavljen kao firma, prikaži dashboard
  if (isLoggedInAsCompany) {
    return <DashboardView />;
  }

  // Ako nije prijavljen KAO FIRMA (možda je klijent ili nitko), prikaži LoginView.
  // LoginView će sam prepoznati ako je klijent pokušao login i ispisati mu error.
  return (
    <div className="fixed inset-0 top-20 bg-slate-900 overflow-hidden">
      <LoginView onLogin={handleLoginSuccess} />
    </div>
  );
}
