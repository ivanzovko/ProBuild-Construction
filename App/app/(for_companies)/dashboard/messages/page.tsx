"use client";

import { MessageSquare, Send, User } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-80px)] lg:h-screen p-4 md:p-8 lg:p-12 flex flex-col">
      <header className="mb-8 shrink-0">
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
          Inbox <span className="text-yellow-500">Messages</span>
        </h1>
      </header>

      <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar s listom razgovora */}
        <div className="w-full md:w-80 border-r border-slate-50 flex flex-col">
          <div className="p-6 border-b border-slate-50">
            <input type="text" placeholder="Search chats..." className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 flex items-center gap-4 cursor-pointer">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase">MP</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-slate-900 truncate">Marko Perić</p>
                <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">Možete li poslati ponudu?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat prozor (Prazno stanje) */}
        <div className="flex-1 bg-slate-50/50 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-white rounded-[30px] shadow-sm flex items-center justify-center text-slate-200 mb-6">
            <MessageSquare size={40} />
          </div>
          <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Select a conversation</h3>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">Pick a client from the list to start messaging</p>
        </div>
      </div>
    </div>
  );
}