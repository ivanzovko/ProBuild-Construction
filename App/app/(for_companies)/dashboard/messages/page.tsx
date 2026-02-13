"use client";

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Send, X, Search, ChevronLeft, Loader2, CheckCheck,
  Trash2, Paperclip, MessageSquare, SearchX, CheckCircle2, Lock,
  Smile, Mic
} from "lucide-react";

import EmojiPicker, { Theme } from "emoji-picker-react";

import { MessageSkeleton } from "./components/chatSkeletons";
import { MessageContent } from "./components/MessageContent";
import { ChatSidebar } from "./components/ChatSidebar";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { StartChatModal } from "./components/StartChatModal";
import { Tooltip } from "@components/Tooltip";

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const userIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        userIdRef.current = session.user.id;
      }
    };
    getUser();
    fetchChats();

    const globalChannel = supabase
      .channel('table-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_messages' }, () => { fetchChats(); })
      .subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setIsSearchVisible(false);
      setMessageSearchQuery("");
      return;
    }
    fetchMessages(selectedJobId);
    markAsRead(selectedJobId);
    const channel = supabase
      .channel(`chat-${selectedJobId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_messages', filter: `job_id=eq.${selectedJobId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new]);
          if (payload.new.sender_id !== userIdRef.current) markAsRead(selectedJobId);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedJobId]);

  useLayoutEffect(() => {
    if (selectedJobId) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [selectedJobId]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !selectedJobId || messagesLoading) return;

    const scrollToBottom = () => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "instant" });
    };

    const resizeObserver = new ResizeObserver(() => {
      scrollToBottom();
    });

    resizeObserver.observe(scrollContainer);

    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 50);
    const t2 = setTimeout(scrollToBottom, 150);
    const t3 = setTimeout(scrollToBottom, 300);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [selectedJobId, messagesLoading, messages.length]);

  useEffect(() => {
    if (scrollRef.current && !messageSearchQuery && messages.length > 0) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages.length]);

  const onEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-400 text-black px-0.5 rounded-sm">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const formatDividerDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatLastMessageTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  async function markAsRead(jobId: string) {
    if (!userIdRef.current) return;
    await supabase.from('job_messages').update({ is_read: true }).eq('job_id', jobId).neq('sender_id', userIdRef.current).eq('is_read', false);
  }

  async function fetchChats() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const [jobsRes, pinsRes] = await Promise.all([
      supabase.from('jobs').select(`id, title, project_type, status, client_id, contractor_id, client:client_profiles!client_id (full_name, email), job_messages (id, is_read, sender_id, created_at, text)`).eq('contractor_id', session.user.id),
      supabase.from('pinned_chats').select('job_id').eq('user_id', session.user.id)
    ]);
    if (!jobsRes.error) {
      setChats(jobsRes.data.map(chat => {
        const unreadCount = chat.job_messages?.filter((m: any) => !m.is_read && m.sender_id !== session.user.id).length || 0;
        const lastMessage = [...(chat.job_messages || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        return { ...chat, unreadCount, lastMessageAt: lastMessage?.created_at || null, lastMessageText: lastMessage?.text || "No messages yet" };
      }));
    }
    if (!pinsRes.error && pinsRes.data) setPinnedIds(pinsRes.data.map(p => p.job_id));
    setLoading(false);
  }

  async function fetchMessages(jobId: string) {
    setMessagesLoading(true);
    const { data } = await supabase.from('job_messages').select(`*`).eq('job_id', jobId).order('created_at', { ascending: true });
    setMessages(data || []);
    setMessagesLoading(false);
  }

  async function sendMessage(e?: React.FormEvent, forceText?: string) {
    if (activeChat?.status === 'completed') return;
    const textToSend = forceText || newMessage;
    if (!textToSend.trim() || !selectedJobId || (sending && !forceText)) return;
    if (!forceText) setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('job_messages').insert({ job_id: selectedJobId, sender_id: session?.user.id, text: textToSend.trim(), is_read: false });
    if (!forceText) { setNewMessage(""); setSending(false); setShowEmojiPicker(false); }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeChat?.status === 'completed') return;
    const file = e.target.files?.[0];
    if (!file || !selectedJobId) return;
    setUploading(true);
    const isImage = file.type.startsWith('image/');
    const bucket = isImage ? 'photos_client' : 'documents_client';
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const filePath = `${selectedJobId}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const column = isImage ? 'project_images' : 'documentation_urls';
      const { data: jobData } = await supabase.from('jobs').select('project_images, documentation_urls').eq('id', selectedJobId).single();
      const currentArray = (jobData as Record<string, any>)?.[column] || [];
      await supabase.from('jobs').update({ [column]: [...currentArray, publicUrl] }).eq('id', selectedJobId);
      await sendMessage(undefined, publicUrl);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const forceDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch { window.open(url, '_blank'); }
  };

const deleteMessage = async (messageId: string) => {
    // 1. Izvršavamo brisanje u Supabase bazi
    const { error } = await supabase
      .from('job_messages')
      .delete()
      .eq('id', messageId);

    // 2. Ako postoji greška, "bacamo" je da je modal može uhvatiti u catch bloku
    if (error) {
      console.error("Error deleting message:", error.message);
      throw error; 
    }

  };

  const togglePin = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    if (pinnedIds.includes(jobId)) {
      setPinnedIds(prev => prev.filter(id => id !== jobId));
      await supabase.from('pinned_chats').delete().eq('user_id', session.user.id).eq('job_id', jobId);
    } else {
      setPinnedIds(prev => [...prev, jobId]);
      await supabase.from('pinned_chats').insert({ user_id: session.user.id, job_id: jobId });
    }
  };

  const sortedAndSearchedChats = useMemo(() => {
    return chats
      .filter(chat => 
        chat.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aPinned = pinnedIds.includes(a.id), bPinned = pinnedIds.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;

        if (timeB !== timeA) {
          return timeB - timeA; 
        }

        const aCompleted = a.status === 'completed';
        const bCompleted = b.status === 'completed';
        
        if (!aCompleted && bCompleted) return -1;
        if (aCompleted && !bCompleted) return 1;

        return 0;
      });
  }, [chats, searchQuery, pinnedIds]);

  const activeChatsOnly = useMemo(() => {
    return sortedAndSearchedChats.filter(chat => chat.job_messages && chat.job_messages.length > 0);
  }, [sortedAndSearchedChats]);

  const displayedMessages = useMemo(() => messageSearchQuery ? messages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase())) : messages, [messages, messageSearchQuery]);
  const activeChat = chats.find(c => c.id === selectedJobId);

  if (loading) return <div className="flex-1 flex items-center justify-center bg-white h-screen"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>;

 return (
    <div className={`flex flex-1 h-[calc(100vh-128px)] lg:h-[calc(100vh-64px)] bg-gray-100 lg:bg-white overflow-hidden relative`}>
      {deleteConfirmId && (
        <DeleteConfirmModal 
          id={deleteConfirmId} 
          onCancel={() => setDeleteConfirmId(null)} 
          onConfirm={deleteMessage} 
        />
      )}
      
      <StartChatModal 
        isOpen={isStartChatOpen} 
        onClose={() => setIsStartChatOpen(false)} 
        projects={sortedAndSearchedChats} 
        onSelectProject={(id) => { setSelectedJobId(id); setIsStartChatOpen(false); }}
      />

      <ChatSidebar 
        loading={loading} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        filteredChats={activeChatsOnly} 
        selectedJobId={selectedJobId} 
        setSelectedJobId={setSelectedJobId} 
        highlightText={highlightText} 
        formatLastMessageTime={formatLastMessageTime} 
        pinnedIds={pinnedIds} 
        togglePin={togglePin} 
        onStartNewChat={() => setIsStartChatOpen(true)}
      />

      <div className={`
        ${!selectedJobId ? "hidden lg:flex" : "flex"} 
        flex-col flex-1 bg-white w-full 
        fixed lg:relative 
        top-[128px] lg:top-0 
        left-0 right-0 
        h-[calc(100vh-128px)] lg:h-full 
        z-[40] lg:z-10
        overflow-hidden
      `}>
        {activeChat ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0 w-full h-16 lg:h-20 border-b border-gray-100 px-4 lg:px-8 flex items-center justify-between bg-white z-[60] shadow-sm">
              <div className={`flex items-center gap-3 lg:gap-5 min-w-0 ${isSearchVisible ? "hidden lg:flex" : "flex flex-1"}`}>
                <div>
                  <Tooltip content="Back to list" side="bottom">
                    <button 
                      onClick={() => setSelectedJobId(null)} 
                      className="lg:hidden p-2 hover:bg-gray-100 hover:scale-110 active:scale-95 rounded-full transition-all flex-shrink-0"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  </Tooltip>
                </div>
                
                <div className="flex flex-col gap-0.5 min-w-0 flex-shrink-0">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <h2 className="font-black text-slate-900 uppercase text-sm lg:text-lg tracking-tight leading-tight truncate">
                      {activeChat.client?.full_name}
                    </h2>
                    {activeChat.status === 'completed' && (
                      <span className="bg-green-100 text-green-700 text-[8px] lg:text-[10px] font-black px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full border border-green-200 uppercase tracking-tighter flex items-center gap-1 flex-shrink-0 hover:scale-105 transition-transform">
                        <CheckCircle2 size={10} className="lg:w-3 lg:h-3" /> Comp.
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] lg:text-[11px] font-black text-yellow-500 uppercase tracking-[0.15em] flex items-center gap-1 lg:gap-2 truncate">
                    <span className="opacity-80 hidden lg:inline">PROJECT:</span>
                    <span className="bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-500 truncate hover:bg-yellow-100 transition-colors cursor-default">
                      {activeChat.title || activeChat.project_type}
                    </span>
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-1 lg:gap-3 flex-shrink-0 ${isSearchVisible ? "flex-1 ml-0" : "ml-2"}`}>
                {isSearchVisible ? (
                  <div className="flex items-center animate-in slide-in-from-right-4 duration-300 w-full">
                    <div className="relative group/search-input flex-1">
                      <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search-input:text-yellow-500 transition-colors" size={14} />
                      <input 
                        autoFocus 
                        type="text" 
                        placeholder="SEARCH MESSAGES.." 
                        value={messageSearchQuery} 
                        onChange={(e) => setMessageSearchQuery(e.target.value)} 
                        className="w-full pl-8 pr-8 py-2 bg-gray-100 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500 transition-all shadow-inner" 
                      />
                      {messageSearchQuery && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Tooltip content="Clear search" side="top">
                            <button onClick={() => setMessageSearchQuery("")} className="text-gray-400 hover:text-red-500 hover:scale-110 transition-all">
                              <X size={14} />
                            </button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                    <div>
                      <Tooltip content="Close search" side="bottom">
                        <button onClick={() => { setIsSearchVisible(false); setMessageSearchQuery(""); }} className="p-2 ml-1 text-gray-400 hover:text-black hover:scale-110 active:scale-90 transition-all">
                          <X size={20} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Tooltip content="Search in chat" side="bottom">
                        <button onClick={() => setIsSearchVisible(true)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 hover:scale-110 active:scale-95 rounded-xl transition-all">
                          <Search size={20} />
                        </button>
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip content="Close chat" side="bottom">
                        <button onClick={() => setSelectedJobId(null)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:scale-110 active:scale-95 rounded-xl transition-all">
                          <X size={20} />
                        </button>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative flex flex-col bg-[#F0F2F5]">
              {messagesLoading ? <MessageSkeleton /> : (
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
                  {displayedMessages.length > 0 ? (
                    displayedMessages.map((msg, index) => {
                      const isMe = msg.sender_id === currentUserId;
                      const showDateDivider = index === 0 || new Date(displayedMessages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
                      const isMedia = msg.text.startsWith('http');
                      return (
                        <div key={msg.id} className="space-y-4">
                          {showDateDivider && (
                            <div className="flex justify-center my-4">
                              <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-gray-100 hover:scale-105 transition-transform cursor-default">
                                {formatDividerDate(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={`flex group/msg ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className="flex items-center gap-2 max-w-[90%] sm:max-w-[70%]">
                              {isMe && (
                                <div>
                                  <Tooltip content="Delete message" side="top">
                                    <button onClick={() => setDeleteConfirmId(msg.id)} className="opacity-0 group-hover/msg:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:scale-125 active:scale-90 transition-all hidden lg:block">
                                      <Trash2 size={14} />
                                    </button>
                                  </Tooltip>
                                </div>
                              )}
                              <div className={`relative flex-1 transition-all duration-200 ${isMedia ? "bg-transparent hover:scale-[1.02]" : `p-3 rounded-2xl shadow-sm hover:shadow-md ${
                                isMe 
                                  ? "bg-slate-950 text-white rounded-tr-none hover:bg-slate-900" 
                                  : "bg-white text-slate-800 rounded-tl-none border border-[#E6E6E3] hover:border-gray-300"
                              }`}`}>
                                <div className={`leading-relaxed text-sm ${!isMedia && "pr-10"}`}>
                                  <MessageContent text={msg.text} messageSearchQuery={messageSearchQuery} highlightText={highlightText} forceDownload={forceDownload} />
                                </div>
                                <div className={`${isMedia ? "mt-2 justify-end" : "absolute bottom-1.5 right-2"} flex items-center gap-1`}>
                                  <span className={`text-[9px] font-bold ${isMe ? (isMedia ? "text-slate-500" : "text-yellow-500/80") : "text-gray-400"}`}>{formatTime(msg.created_at)}</span>
                                  {isMe && <CheckCheck size={12} className={`${msg.is_read ? "text-blue-400" : "text-gray-500"} transition-colors`} />}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : messageSearchQuery ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 hover:scale-110 hover:rotate-6 transition-transform">
                        <SearchX size={32} className="text-slate-300" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 uppercase">No messages found</h3>
                      <button onClick={() => setMessageSearchQuery("")} className="mt-4 text-[10px] font-black text-yellow-600 uppercase underline underline-offset-4 hover:text-yellow-700 transition-colors">Clear search</button>
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} className="h-px w-full clear-both" />
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-2 lg:p-2.5 bg-[#F0F2F5] border-t border-gray-200">
              {activeChat.status === 'completed' ? (
                <div className="w-full px-4 py-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center gap-3 text-slate-400 shadow-sm">
                    <Lock size={16} />
                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic text-center">Messaging is disabled because this project is completed</span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-6xl mx-auto flex items-end gap-2 px-1 lg:px-2 relative">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                  
                  <div className="flex-1 bg-white rounded-[24px] flex items-center p-1 shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-yellow-500 focus-within:shadow-md transition-all lg:hover:scale-[1.01]">
                    <div>
                      <Tooltip content="Attach File" side="top" disabled={uploading}>
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()} 
                          disabled={uploading} 
                          className="w-10 h-10 flex-shrink-0 self-end rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-100 hover:text-yellow-600 hover:scale-110 active:scale-90 transition-all"
                        >
                          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={20} className="rotate-45" />}
                        </button>
                      </Tooltip>
                    </div>

                    <textarea 
                      rows={1} 
                      placeholder="Type a message..." 
                      value={newMessage} 
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'inherit';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                      }} 
                      onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
                      className="flex-1 bg-transparent border-none outline-none px-2 lg:px-3 py-2.5 text-sm lg:text-sm resize-none min-h-[40px] max-h-[150px] overflow-y-auto" 
                    />

                    <div className="flex items-center gap-1 pr-1 self-center relative">
                      {showEmojiPicker && (
                        <div ref={emojiPickerRef} className="absolute bottom-14 right-0 z-50 shadow-2xl animate-in fade-in zoom-in duration-200 origin-bottom-right">
                          <EmojiPicker 
                            onEmojiClick={onEmojiClick} 
                            theme={Theme.LIGHT}
                            lazyLoadEmojis={true}
                            skinTonesDisabled
                            searchPlaceHolder="Search emoji..."
                            width={280}
                            height={350}
                          />
                        </div>
                      )}
                      
                      {newMessage ? (
                        <div>
                          <Tooltip content="Clear text" side="top">
                            <button type="button" onClick={() => setNewMessage("")} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 active:scale-90 transition-all"><X size={18} /></button>
                          </Tooltip>
                        </div>
                      ) : (
                        <div>
                          <Tooltip content="Add emoji" side="top" disabled={showEmojiPicker}>
                            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`w-10 h-10 flex items-center justify-center transition-all rounded-full hover:scale-110 active:scale-90 ${showEmojiPicker ? 'text-yellow-500 bg-yellow-50 scale-110' : 'text-slate-500 hover:bg-gray-100'}`}><Smile size={20} /></button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Tooltip content="Send Message" side="top" disabled={sending || uploading || !newMessage.trim()}>
                      <button 
                        onClick={(e) => { e.preventDefault(); sendMessage(); }}
                        disabled={sending || uploading || !newMessage.trim()} 
                        className="w-12 h-12 flex-shrink-0 bg-slate-950 text-white rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md"
                      >
                        {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="ml-0.5" />}
                      </button>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center p-8 bg-gray-50/30">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 transition-transform hover:rotate-6 hover:scale-110"><MessageSquare size={40} className="text-gray-200" /></div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Select a chat to start messaging</p>
            <div>
              <Tooltip content="Choose project and start chatting" side="top">
                <button 
                    onClick={() => setIsStartChatOpen(true)}
                    className="mt-6 px-8 py-4 bg-slate-950 text-yellow-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 hover:bg-yellow-500 hover:text-black hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-95"
                >
                    Start New Conversation
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}