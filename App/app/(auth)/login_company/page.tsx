"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import LoginView from "./components/LoginView";

export default function ForCompaniesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isClientAccount, setIsClientAccount] = useState(false);
  const isProcessing = useRef(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || isProcessing.current) {
        setLoading(false);
        return;
      }
      isProcessing.current = true;
      handleRedirects(session.user);
    };
    checkAuth();
  }, [supabase]);

  const handleRedirects = async (user: any) => {
    const userType = user.user_metadata?.user_type;
    const isAdmin = user.user_metadata?.is_admin === true || userType === 'admin';

    if (isAdmin) {
      router.replace('/admin');
      return;
    }

    if (userType === 'client') {
      await supabase.auth.signOut();
      setErrorMsg("This account is registered as a client.");
      setIsClientAccount(true);
      setAuthLoading(false);
      setLoading(false);
      isProcessing.current = false;
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("company_profiles")
        .select("is_onboarded")
        .eq("id", user.id)
        .single();

      if (!profile?.is_onboarded) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      setLoading(false);
    } finally {
      isProcessing.current = false;
    }
  };

  const handleInputChange = () => {
    if (errorMsg || isClientAccount) {
      setErrorMsg(null);
      setIsClientAccount(false);
    }
  };

  const handleAuth = async ({ isLogin, email, password, confirmPassword }: any) => {
    setAuthLoading(true);
    setErrorMsg(null);
    setIsClientAccount(false);

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) handleRedirects(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { user_role: 'company', full_name: email.split('@')[0] },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
        if (data.session) router.replace('/onboarding');
        else {
          setErrorMsg("Account created! Please check your email to confirm registration.");
          setAuthLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <LoginView 
      onSubmit={handleAuth} 
      onInputChange={handleInputChange}
      loading={authLoading} 
      errorMsg={errorMsg} 
      isClientAccount={isClientAccount} 
    />
  );
}