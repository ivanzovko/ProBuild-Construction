"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, User, Menu, X } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm fixed top-0 z-50">
      {/* Smanjena visina sa h-20 na h-14 (mobilni) i h-16 (desktop) */}
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        
        {/* LOGO - Smanjen padding i ikona za uži bar */}
        <Link href="/" className="flex items-center gap-2 group relative z-[60]">
          <div className="bg-yellow-400 p-1.5 md:p-2 rounded-lg group-hover:bg-yellow-500 transition-colors">
            <Hammer size={18} className="text-black md:size-[22px]" />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tighter text-slate-900">
            PRO-BUILD<span className="text-yellow-500">.</span>
          </span>
        </Link>

        {/* MAIN NAVIGATION - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6">
            {pages.map((page, index) => {
              const isActive = currentPath === page.path;
              return (
                <li key={index}>
                  <Link
                    href={page.path}
                    className={`text-sm font-bold uppercase tracking-wide transition-all hover:text-yellow-500 ${
                      isActive 
                        ? "text-yellow-500 border-b-2 border-yellow-500 pb-1" 
                        : "text-slate-600"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="h-6 w-[1px] bg-gray-200" />

          <div className="flex items-center gap-6">
            <Link 
              href="/dashboard"
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              For Companies
            </Link>
            <Link
              href="/login"
              className={`flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95`}
            >
              <User size={16} />
              Sign In
            </Link>
          </div>
        </nav>

        {/* MOBILE MENU BUTTON - Smanjena veličina ikone */}
        <button 
          className="md:hidden p-2 text-slate-900 relative z-[60]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* MOBILE MENU OVERLAY */}
        <div className={`
          fixed inset-0 bg-white z-50 flex flex-col p-8 transition-all duration-300 ease-in-out md:hidden
          ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
        `}>
          <div className="mt-16 flex flex-col gap-8">
            <ul className="flex flex-col gap-6">
              {pages.map((page, index) => (
                <li key={index}>
                  <Link
                    href={page.path}
                    className={`text-2xl font-black uppercase tracking-tighter ${
                      currentPath === page.path ? "text-yellow-500" : "text-slate-900"
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="h-[1px] w-full bg-gray-100 my-4" />
            
            <div className="flex flex-col gap-6">
              <Link 
                href="/dashboard"
                className="text-lg font-black uppercase tracking-tighter text-slate-600"
              >
                For Companies
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl"
              >
                <User size={24} />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}