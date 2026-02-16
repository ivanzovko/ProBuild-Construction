"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Send, X, Search, ChevronLeft, Loader2, CheckCheck,
  Trash2, Paperclip, CheckCircle2, Lock,
  Smile
} from "lucide-react";

import EmojiPicker, { Theme } from "emoji-picker-react";

import { MessageSkeleton } from "../components/chatSkeletons";
import { MessageContent } from "../components/MessageContent";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { Tooltip } from "@components/Tooltip";

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedJobId = params.id as string;

  if (!params) return null;

  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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

  const handleGoBack = () => {
    const previousUrl = document.referrer;
    if (previousUrl.includes('/dashboard/tracker')) {
      router.back();
    } else {
      const currentFilter = searchParams.get('filter');
      const targetUrl = currentFilter 
        ? `/dashboard/messages?filter=${currentFilter}` 
        : "/dashboard/messages";
      router.push(targetUrl);
    }
  };

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
    const initChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        userIdRef.current = session.user.id;
        // Odmah označavamo pročitano čim imamo potvrđen ID
        markAsRead(selectedJobId);
      }
      
      const { data: job } = await supabase
        .from('jobs')
        .select(`id, title, project_type, status, client:client_profiles!client_id (full_name)`)
        .eq('id', selectedJobId)
        .single();
      
      setActiveChat(job);
    };

    if (selectedJobId) {
      initChat();
      fetchMessages(selectedJobId);

      const channel = supabase
        .channel(`chat-${selectedJobId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'job_messages', 
          filter: `job_id=eq.${selectedJobId}` 
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new]);
            if (payload.new.sender_id !== userIdRef.current) {
              setTimeout(() => {
                markAsRead(selectedJobId);
              }, 500);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }).subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedJobId]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || messagesLoading) return;

    const scrollToBottom = () => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "instant" });
    };

    const resizeObserver = new ResizeObserver(() => {
      scrollToBottom();
    });

    resizeObserver.observe(scrollContainer);
    scrollToBottom();

    return () => resizeObserver.disconnect();
  }, [selectedJobId, messagesLoading, messages.length]);

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

  // ISPRAVLJENA FUNKCIJA markAsRead
  async function markAsRead(jobId: string) {
    let currentId = userIdRef.current;
    
    // Ako ref još nije spreman, uzmi session direktno (zbog RLS-a)
    if (!currentId) {
      const { data: { session } } = await supabase.auth.getSession();
      currentId = session?.user?.id || null;
    }

    if (!currentId) return;

    await supabase
      .from('job_messages')
      .update({ is_read: true })
      .eq('job_id', jobId)
      .neq('sender_id', currentId)
      .eq('is_read', false);
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
    if (!textToSend.trim() || (sending && !forceText)) return;
    if (!forceText) setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('job_messages').insert({ job_id: selectedJobId, sender_id: session?.user.id, text: textToSend.trim(), is_read: false });
    if (!forceText) { setNewMessage(""); setSending(false); setShowEmojiPicker(false); }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeChat?.status === 'completed') return;
    const file = e.target.files?.[0];
    if (!file) return;
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
    const { error } = await supabase.from('job_messages').delete().eq('id', messageId);
    if (error) throw error; 
  };

  const displayedMessages = useMemo(() => messageSearchQuery ? messages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase())) : messages, [messages, messageSearchQuery]);

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {deleteConfirmId && (
        <DeleteConfirmModal 
          id={deleteConfirmId} 
          onCancel={() => setDeleteConfirmId(null)} 
          onConfirm={deleteMessage} 
        />
      )}

      {/* HEADER */}
      <div className="flex-shrink-0 w-full h-16 lg:h-20 border-b border-gray-100 px-4 lg:px-8 flex items-center justify-between bg-white z-[40] shadow-sm sticky top-0">
        <div className={`flex items-center gap-3 min-w-0 ${isSearchVisible ? "hidden lg:flex" : "flex flex-1"}`}>
          <button onClick={handleGoBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0 text-slate-900">
            <ChevronLeft size={28} />
          </button>
          
          <div className="flex flex-col gap-0.5 min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 uppercase text-sm lg:text-lg tracking-tight leading-tight truncate">
                {activeChat?.client?.full_name}
              </h2>
              {activeChat?.status === 'completed' && (
                <span className="bg-green-100 text-green-700 text-[8px] lg:text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-tighter flex items-center gap-1">
                  <CheckCircle2 size={10} /> Completed
                </span>
              )}
            </div>
            <p className="text-[9px] lg:text-[11px] font-black text-black-500 uppercase tracking-[0.15em] flex items-center gap-1 truncate">
              <span className="opacity-80 hidden lg:inline">PROJECT:</span>
              <span className=" px-1.5 py-0.5 rounded text-black-500 truncate">
                {activeChat?.title || activeChat?.project_type}
              </span>
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-1 lg:gap-3 ${isSearchVisible ? "flex-1 ml-0" : "ml-2 flex-shrink-0"}`}>
          {isSearchVisible ? (
            <div className="flex items-center w-full animate-in slide-in-from-right-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input autoFocus type="text" placeholder="Search messages..." value={messageSearchQuery} onChange={(e) => setMessageSearchQuery(e.target.value)} className="w-full pl-9 pr-8 py-2 bg-gray-100 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500 transition-all" />
              </div>
              <button onClick={() => { setIsSearchVisible(false); setMessageSearchQuery(""); }} className="p-2 ml-1 text-gray-400 hover:text-black transition-all">
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => setIsSearchVisible(true)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all">
                <Search size={20} />
              </button>
              <button onClick={handleGoBack} className="p-2 text-gray-400 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-[#F0F2F5]">
        {messagesLoading ? <MessageSkeleton /> : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {displayedMessages.map((msg, index) => {
              const isMe = msg.sender_id === currentUserId;
              const isUrl = msg.text.startsWith('http');
              const showDateDivider = index === 0 || new Date(displayedMessages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
              
              return (
                <div key={msg.id} className="space-y-4">
                  {showDateDivider && (
                    <div className="flex justify-center my-4">
                      <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-gray-100">
                        {formatDividerDate(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`flex group/msg ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-center gap-2 max-w-[85%] lg:max-w-[70%]">
                      {isMe && (
                        <button onClick={() => setDeleteConfirmId(msg.id)} className="opacity-0 group-hover/msg:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all hidden lg:block">
                          <Trash2 size={14} />
                        </button>
                      )}
                      
                      <div className={`relative ${isUrl ? "" : "p-3 rounded-2xl shadow-sm"} ${
                        isMe 
                          ? (isUrl ? "" : "bg-slate-950 text-white rounded-tr-none") 
                          : (isUrl ? "" : "bg-white text-slate-800 rounded-tl-none border border-gray-100")
                      }`}>
                        <div className={`leading-relaxed text-sm ${isUrl ? "" : "pr-10"}`}>
                          <MessageContent text={msg.text} messageSearchQuery={messageSearchQuery} highlightText={highlightText} forceDownload={forceDownload} />
                        </div>
                        
                        {!isUrl && (
                          <div className="absolute bottom-1.5 right-2 flex items-center gap-1">
                            <span className={`text-[9px] font-bold ${isMe ? "text-yellow-500/80" : "text-gray-400"}`}>{formatTime(msg.created_at)}</span>
                            {isMe && <CheckCheck size={12} className={msg.is_read ? "text-blue-400" : "text-gray-500"} />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-px w-full" />
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="flex-shrink-0 p-3 bg-[#F0F2F5] border-t border-gray-200">
        {activeChat?.status === 'completed' ? (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center gap-3 text-slate-400 shadow-sm">
            <Lock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Project is completed</span>
          </div>
        ) : (
          <div className="flex items-end gap-2 max-w-6xl mx-auto relative">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
            
            <div className="flex-1 bg-white rounded-[24px] flex items-center p-1 shadow-sm border border-gray-200 focus-within:ring-1 focus-within:ring-yellow-500 transition-all">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-slate-500 hover:text-yellow-600 transition-all">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={20} className="rotate-45" />}
              </button>

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
                className="flex-1 bg-transparent border-none outline-none px-2 py-2.5 text-sm resize-none min-h-[40px] max-h-[150px]" 
              />

              <div className="relative flex items-center pr-1">
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-14 right-0 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={280} height={350} />
                  </div>
                )}
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-yellow-500 transition-all">
                  <Smile size={20} />
                </button>
              </div>
            </div>

            <button 
              onClick={(e) => { e.preventDefault(); sendMessage(); }}
              disabled={sending || uploading || !newMessage.trim()} 
              className="w-12 h-12 flex-shrink-0 bg-slate-950 text-white rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-50"
            >
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}