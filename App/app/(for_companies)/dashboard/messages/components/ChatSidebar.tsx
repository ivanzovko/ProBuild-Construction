import { MessageSquare, Search, X, User, Pin, Plus, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { ChatSkeleton } from "./chatSkeletons";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@components/Tooltip";

interface ChatSidebarProps {
  loading: boolean; searchQuery: string; setSearchQuery: (val: string) => void;
  filteredChats: any[]; selectedJobId: string | null; setSelectedJobId: (id: string | null) => void;
  highlightText: (text: string, query: string) => React.ReactNode; formatLastMessageTime: (date: string | undefined) => string;
  pinnedIds: string[]; togglePin: (e: React.MouseEvent, id: string) => void; onStartNewChat: () => void;
}

export const ChatSidebar = ({
  loading, searchQuery, setSearchQuery, filteredChats, selectedJobId, 
  setSelectedJobId, highlightText, formatLastMessageTime, pinnedIds, togglePin, onStartNewChat
}: ChatSidebarProps) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const displayChats = useMemo(() => {
    if (activeFilter === 'all') return filteredChats;
    return filteredChats.filter(chat => chat.status === activeFilter);
  }, [filteredChats, activeFilter]);

  const counts = {
    all: filteredChats.length,
    active: filteredChats.filter(c => c.status === 'active').length,
    completed: filteredChats.filter(c => c.status === 'completed').length
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setShowScrollTop(scrollContainerRef.current.scrollTop > 300);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            className="lg:hidden fixed top-14 left-0 w-full bg-white p-4 z-[99] border-b border-black shadow-2xl h-[80px] flex items-center"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-11 pr-12 py-4 bg-slate-100 border border-black rounded-[15px] text-[16px] font-bold outline-none text-black" 
              />
              <button 
                onClick={() => { 
                  setIsMobileSearchOpen(false); 
                  setSearchQuery(""); 
                }} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-900 p-2"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`
        ${selectedJobId ? "hidden lg:flex" : "flex"} 
        flex-col w-full lg:w-[380px] border-r border-gray-200 bg-gray-100 lg:bg-gray-600/30 
        relative h-[calc(100dvh-128px)] lg:h-full lg:overflow-hidden
        fixed lg:relative inset-0 z-[30] overscroll-none
      `}>
        
        <div className="lg:hidden bg-gray-100 border-b border-gray-200 p-4">
          <div className="flex bg-slate-200/50 p-1 rounded-[15px] gap-1">
            {(['all', 'active', 'completed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-[11px] transition-all flex items-center justify-center gap-1 hover:scale-105 active:scale-95 ${
                  activeFilter === filter 
                    ? "bg-yellow-400 text-slate-950 shadow-sm border border-black/10" 
                    : "text-slate-500"
                }`}
              >
                {filter}
                <span className={`text-[8px] ${activeFilter === filter ? "text-slate-800/60" : "opacity-60"}`}>({counts[filter]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block bg-gray-100 border-b border-gray-200 flex-shrink-0 w-full z-20">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
                  <MessageSquare className="text-yellow-500" size={24} /> INBOX
                </h1>
              </div>
              <Tooltip content="New message" side="bottom">
                <button onClick={onStartNewChat} className="p-3 bg-slate-950 text-yellow-500 rounded-[24px] hover:scale-110 active:scale-90 transition-all shadow-xl shadow-slate-200 group flex-shrink-0">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                </button>
              </Tooltip>
            </div>
            
            <div className="space-y-3">
              <div className="relative group/search hover:scale-[1.02] transition-transform duration-200">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-yellow-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search projects or clients..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-11 pr-10 py-3 bg-slate-100 border border-black rounded-[20px] text-[12px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-yellow-500 transition-all" 
                />
                {searchQuery && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Tooltip content="Clear search" side="top">
                      <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>

              <div className="flex bg-slate-200/50 p-1 rounded-[15px] gap-1">
                {(['all', 'active', 'completed'] as const).map((filter) => (
                  <div key={filter} className="flex-1">
                    <Tooltip content={`Filter by ${filter}`} side="bottom">
                      <button
                        onClick={() => setActiveFilter(filter)}
                        className={`w-full py-2 text-[10px] font-black uppercase tracking-wider rounded-[11px] transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 ${
                          activeFilter === filter 
                            ? "bg-yellow-400 text-slate-950 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {filter}
                        <span className={`text-[9px] ${activeFilter === filter ? "text-slate-800/60" : "opacity-60"}`}>
                          ({counts[filter]})
                        </span>
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef} 
          onScroll={handleScroll} 
          className="flex-1 overflow-y-auto p-3 lg:p-3 pt-6 lg:pt-3 space-y-2 scroll-smooth bg-gray-100 touch-pan-y"
        >
          {loading ? <ChatSkeleton /> : displayChats.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {displayChats.map((chat, index) => {
                const isSel = selectedJobId === chat.id;
                const isPinned = pinnedIds.includes(chat.id);
                const isComp = chat.status === 'completed';
                const unreadCount = chat.unreadCount || 0;

                return (
                  <motion.div 
                    key={chat.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    onClick={() => setSelectedJobId(chat.id)} 
                    className={`group/chat-item relative p-4 rounded-[30px] cursor-pointer transition-all duration-200 ${isSel ? "bg-slate-950 shadow-2xl scale-[1.03] z-10" : "bg-white hover:bg-yellow-400 hover:scale-[1.02] hover:shadow-xl active:scale-[0.97] border border-gray-100"}`}
                  >
                    {!isSel && (
                      <Tooltip content="Open chat" side="right">
                         <div className="absolute inset-0 z-0" />
                      </Tooltip>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-[18px] flex-shrink-0 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 relative ${isSel ? "bg-yellow-500 text-slate-950" : "bg-slate-100 text-slate-500 group-hover:bg-slate-950 group-hover:text-yellow-400 shadow-inner"}`}>
                        <User size={22} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 truncate">
                            <h3 className={`font-black text-[14px] truncate ${isSel ? "text-white" : "text-slate-900 group-hover:text-black"}`}>{highlightText(chat.client?.full_name || "", searchQuery)}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[10px] text-[10px] font-black tracking-tighter ${isSel ? (isComp ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-500") : (isComp ? "bg-green-50 text-green-600 group-hover:bg-black/10 group-hover:text-black" : "bg-yellow-50 text-yellow-600 group-hover:bg-black/10 group-hover:text-black")}`}>
                              {isComp ? <CheckCircle2 size={11} /> : <Circle size={8} fill="currentColor" className="animate-pulse" />} {isComp ? 'COMPLETED' : 'ACTIVE'}
                            </span>
                          </div>
                          <span className={`text-[12px] font-bold flex-shrink-0 ${isSel ? "text-slate-500" : "text-slate-400 group-hover:text-black"}`}>{formatLastMessageTime(chat.lastMessageAt)}</span>
                        </div>
                        <p className={`text-[11px] font-bold uppercase tracking-wider break-words ${isSel ? "text-yellow-500/90" : "text-slate-500 group-hover:text-black"}`}>
                          <span className="opacity-50 mr-1">PROJECT:</span>
                          {highlightText(chat.title || chat.project_type || "", searchQuery)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-between min-h-[55px] self-stretch">
                        <div className="relative">
                          <Tooltip content={isPinned ? 'Unpin chat' : 'Pin chat'} side="left">
                            <motion.button 
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              onClick={(e) => { e.stopPropagation(); togglePin(e, chat.id); }} 
                              className={`p-1.5 transition-all rounded-[10px] relative z-10 ${isPinned ? "text-yellow-500 scale-110 group-hover:text-black" : isSel ? "text-slate-500 hover:text-yellow-500" : "text-slate-400 hover:scale-125 group-hover:text-black"}`}
                            >
                              <motion.div
                                key={isPinned ? 'pinned' : 'unpinned'}
                                initial={{ rotate: -45, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                              >
                                <Pin size={20} className={isPinned ? "fill-current" : ""} />
                              </motion.div>
                            </motion.button>
                          </Tooltip>
                        </div>
                        {unreadCount > 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center min-w-[24px] h-[24px] bg-green-500 text-white text-[11px] font-black rounded-full shadow-sm"
                          >
                            {unreadCount}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                No {activeFilter !== 'all' ? activeFilter : ''} conversations
              </p>
            </div>
          )}
        </div>

        <div className="lg:hidden fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <AnimatePresence>
            {showScrollTop && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                onClick={scrollToTop} 
                className="p-4 bg-white text-slate-900 border border-black rounded-full shadow-2xl active:scale-90 transition-all"
              >
                <ChevronUp size={24} />
              </motion.button>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsMobileSearchOpen(true)}
            className="p-5 bg-white text-slate-950 border-2 border-slate-950 rounded-full shadow-2xl active:scale-90 transition-all"
          >
            <Search size={14} />
          </button>

          <button 
            onClick={onStartNewChat}
            className="p-5 bg-slate-950 text-yellow-500 rounded-full shadow-2xl active:scale-90 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <AnimatePresence>
          {showScrollTop && (
            <div className="hidden lg:block absolute bottom-6 right-6 z-50">
              <Tooltip content="Scroll to top" side="top">
                <motion.button 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={scrollToTop} 
                  className="p-4 bg-slate-950 text-yellow-500 rounded-[20px] shadow-2xl hover:scale-110 active:scale-90 transition-all group"
                >
                  <ChevronUp size={20} className="group-hover:animate-bounce" />
                </motion.button>
              </Tooltip>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};