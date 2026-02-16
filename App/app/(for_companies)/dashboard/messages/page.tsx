"use client";

import { MessageSquare } from "lucide-react";
import { Tooltip } from "@components/Tooltip";
import { useState } from "react";
import { StartChatModal } from "./components/StartChatModal"; 

export default function MessagesEmptyPage() {
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] lg:h-[calc(100vh-64px)] w-full bg-white overflow-hidden relative">
      
      

      {/* DESNA STRANA (Empty State) - Sada zauzima sav preostali prostor */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center p-8 bg-gray-50/30 h-full">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 transition-transform hover:rotate-6 hover:scale-110">
          <MessageSquare size={40} className="text-gray-200" />
        </div>
        
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          Select a chat to start messaging
        </p>

        <div>
          <Tooltip content="Choose project and start chatting" side="top">
            <button 
              onClick={() => {
                const sidebarBtn = document.getElementById('start-new-chat-btn');
                if (sidebarBtn) sidebarBtn.click();
              }}
              className="mt-6 px-8 py-4 bg-slate-950 text-yellow-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 hover:bg-yellow-500 hover:text-black hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-95"
            >
              Start New Conversation
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}