"use client";

import { ClipboardList, Search } from "lucide-react";

export default function InquiriesPage() {
  return (
    <div className="p-4 md:p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
          Direct <span className="text-yellow-500">Inquiries</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
          Requests sent specifically to your company
        </p>
      </header>

      <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">
        <ClipboardList className="mx-auto mb-4 opacity-20" size={40} />
        No direct inquiries yet.
      </div>
    </div>
  );
}