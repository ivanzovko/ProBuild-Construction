"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Gavel, 
  MessageSquare, 
  Construction, 
  Building2,
  LogOut,
  ChevronRight,
  X
} from "lucide-react";

// 1. DEFINIRAJ INTERFACE ZA PROPSE
interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 2. PRIMIJENI PROPSE U KOMPONENTI
export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inquiries", href: "/dashboard/inquiries", icon: ClipboardList, badge: "3" },
    { name: "Tender Market", href: "/dashboard/tenders", icon: Gavel },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: "New" },
    { name: "Project Tracker", href: "/dashboard/tracker", icon: Construction },
    { name: "Company Profile", href: "/dashboard/profile", icon: Building2 },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-[60] w-72 bg-slate-950 text-white flex flex-col p-6 border-r border-white/5 
      transition-transform duration-300 lg:translate-x-0 lg:static
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
          PRO<span className="text-yellow-400">-BUILD</span>
        </h2>
        {/* Gumb za zatvaranje na mobitelu */}
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name}
              href={item.href}
              onClick={onClose} // Zatvori sidebar na mobitelu nakon klika
              className={`
                w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all group
                ${isActive 
                  ? "bg-yellow-400 text-black shadow-[0_10px_20px_rgba(250,204,21,0.2)]" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} className={isActive ? "text-black" : "text-slate-500 group-hover:text-yellow-400"} />
                {item.name}
              </div>
              
              {item.badge ? (
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${isActive ? 'bg-black text-white' : 'bg-yellow-400/20 text-yellow-400'}`}>
                  {item.badge}
                </span>
              ) : (
                <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-black' : 'text-slate-600'}`} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button className="flex items-center gap-4 w-full px-5 py-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}