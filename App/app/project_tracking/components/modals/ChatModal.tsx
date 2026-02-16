"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare, Lock, CheckCheck, Trash2, Search, Paperclip, FileText, Download, Loader2, Smile } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import EmojiPicker, { Theme } from "emoji-picker-react";

function ChatSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`h-12 w-[70%] rounded-[20px] bg-slate-100 ${
            i % 2 === 0 ? 'rounded-tr-none bg-slate-200' : 'rounded-tl-none'
          }`} />
        </div>
      ))}
    </div>
  );
}

export default function ChatModal({ job, onClose, isReadOnly }: { job: any; onClose: () => void; isReadOnly?: boolean }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    if (scrollRef.current && !isSearching) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: behavior
      });
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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    fetchMessages();
    markAsRead();

    const channel = supabase
      .channel(`job-${job.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'job_messages', 
        filter: `job_id=eq.${job.id}` 
      }, 
      payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new]);
          if (payload.new.sender_id !== currentUserId) markAsRead();
          setTimeout(() => scrollToBottom("smooth"), 10);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [job.id, currentUserId]);

  useEffect(() => {
    if (!loading && messages.length > 0 && !isSearching) {
      scrollToBottom("auto");
    }
  }, [loading, messages.length, isSearching]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('job_messages')
      .select('*')
      .eq('job_id', job.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  const markAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('job_messages').update({ is_read: true }).eq('job_id', job.id).neq('sender_id', user.id).eq('is_read', false);
  };

  const sendMessage = async (e?: React.FormEvent, forceText?: string) => {
    e?.preventDefault();
    const textToSend = forceText || newMessage;
    if (!textToSend.trim() || isReadOnly) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('job_messages').insert({ 
      job_id: job.id, 
      sender_id: user.id, 
      text: textToSend,
      is_read: false 
    });
    if (!forceText) {
      setNewMessage("");
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isReadOnly) return;

    setUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      const bucket = isImage ? 'photos_client' : 'documents_client';
      
      const cleanFileName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');

      const fileName = `${Date.now()}_${cleanFileName}`;
      const filePath = `${job.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const column = isImage ? 'project_images' : 'documentation_urls';
      
      const { data: jobData } = await supabase
        .from('jobs')
        .select('project_images, documentation_urls')
        .eq('id', job.id)
        .single();

      const currentArray = (jobData as Record<string, any>)?.[column] || [];

      await supabase.from('jobs').update({
        [column]: [...currentArray, publicUrl]
      }).eq('id', job.id);

      await sendMessage(undefined, publicUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const forceDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const dummyBlob = await response.blob();
      const blobUrl = window.URL.createObjectURL(dummyBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const cleanName = fileName.split('/').pop()?.replace(/^\d+_/, '') || "file";
      
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await supabase.from('job_messages').delete().eq('id', deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const isUrl = (text: string) => text.startsWith('http');
  const isImageFile = (url: string) => /\.(jpg|jpeg|png|webp|gif|avif)/i.test(url);

  const MessageContent = ({ text }: { text: string }) => {
    if (isUrl(text)) {
      const displayName = text.split('/').pop()?.replace(/^\d+_/, '') || "Dokument";

      if (isImageFile(text)) {
        return (
          <div className="relative cursor-pointer" onClick={() => window.open(text, '_blank')}>
            <img src={text} alt="Attachment" className="rounded-2xl max-w-full h-auto max-h-[220px] object-cover transition-opacity hover:opacity-90" />
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-xl max-w-[180px] sm:max-w-[200px] shadow-sm">
          <div className="w-8 h-8 bg-slate-900 text-yellow-400 rounded-lg flex items-center justify-center shrink-0">
            <FileText size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase truncate leading-tight text-slate-700">{displayName}</p>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              forceDownload(text, displayName);
            }} 
            className="p-1.5 text-slate-400 hover:text-slate-900 transition-all"
          >
            <Download size={14} />
          </button>
        </div>
      );
    }
    return <HighlightedText text={text} highlight={isSearching ? searchQuery : ""} />;
  };

  const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-400 text-slate-900 rounded-sm px-0.5">{part}</mark>
          ) : part
        )}
      </span>
    );
  };

  const filteredMessages = isSearching 
    ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDividerDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      
      {deleteConfirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-[24px] shadow-2xl max-w-[280px] w-full text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={24} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-2">Delete Message?</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-6 leading-relaxed">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-200">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-[340px] sm:max-w-md h-[80dvh] sm:h-[600px] rounded-[24px] sm:rounded-[40px] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-10 duration-300 mx-auto">
        
        <div className="px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center bg-white border-b border-slate-50 shrink-0 relative">
          {!isSearching ? (
            <>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shadow-md rotate-2 shrink-0 transition-transform hover:rotate-0 ${isReadOnly ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-yellow-400'}`}>
                  {isReadOnly ? <Lock size={16} /> : <MessageSquare size={18} />}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="text-[13px] sm:text-[15px] font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                    {job.title || 'Chat'}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-slate-500 font-black uppercase tracking-wider">
                    Contractor: {job.contractor_name || job?.company_profiles?.company_name || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsSearching(true)} className="p-2 text-slate-400 hover:text-slate-900 hover:scale-110 active:scale-90 transition-all">
                  <Search size={18} />
                </button>
                <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 hover:scale-110 active:scale-90 rounded-full transition-all">
                  <X size={18}/>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center w-full gap-2 animate-in slide-in-from-right-5 duration-200">
              <div className="flex-1 relative">
                <input 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH MESSAGES..."
                  className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[10px] font-black uppercase focus:ring-0"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button 
                onClick={() => { setIsSearching(false); setSearchQuery(""); }}
                className="p-2 text-slate-900 hover:scale-110 active:scale-90 transition-all sm:px-2"
              >
                <span className="hidden sm:inline text-[10px] font-black uppercase">Close</span>
                <X size={18} className="sm:hidden" />
              </button>
            </div>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 bg-[#f8fafc] scrollbar-hide">
          {loading ? (
            <ChatSkeleton />
          ) : filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <MessageSquare size={32} />
              <p className="text-[8px] font-black uppercase tracking-widest mt-2">
                {isSearching ? "No results" : "Empty"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((m, index) => {
                const isMe = m.sender_id === currentUserId;
                const isMedia = isUrl(m.text);
                const showDateDivider = !isSearching && (index === 0 || 
                  new Date(filteredMessages[index - 1].created_at).toDateString() !== new Date(m.created_at).toDateString());

                return (
                  <div key={m.id} className="space-y-4">
                    {showDateDivider && (
                      <div className="flex justify-center my-2">
                        <span className="bg-white px-3 py-1 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm border border-slate-100">
                          {formatDividerDate(m.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg`}>
                      <div className={`relative transition-all hover:scale-[1.02] origin-bottom-${isMe ? 'right' : 'left'} ${
                        isMedia 
                          ? 'max-w-[85%]' 
                          : `min-w-[75px] max-w-[85%] p-3 pb-5 rounded-[14px] sm:rounded-[22px] text-[10px] sm:text-[12px] font-bold uppercase tracking-wide shadow-sm ${
                              isMe ? 'bg-slate-900 text-yellow-400 rounded-tr-none' : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                            }`
                      }`}>
                        {isMe && !isReadOnly && !isSearching && (
                          <button 
                            onClick={() => setDeleteConfirm(m.id)}
                            className={`absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 hover:scale-125 opacity-0 group-hover/msg:opacity-100 transition-all ${isMedia ? 'bg-white/80 backdrop-blur rounded-full -left-10 shadow-sm' : ''}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <div className={isMedia ? "" : "pr-2 leading-relaxed"}>
                          <MessageContent text={m.text} />
                        </div>
                        
                        <div className={`flex items-center gap-1 px-1 rounded-full ${
                          isMedia 
                            ? 'mt-1 justify-end' 
                            : 'absolute bottom-1 right-2.5 bg-inherit'
                        }`}>
                          <span className={`text-[6.5px] sm:text-[8px] font-black ${isMe ? (isMedia ? 'text-slate-400' : 'text-yellow-400/60') : 'text-slate-400'}`}>
                            {formatTime(m.created_at)}
                          </span>
                          {isMe && <CheckCheck size={11} className={`${m.is_read ? 'text-blue-400' : 'text-slate-500'} shrink-0`} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-3 py-3 sm:px-6 sm:py-6 bg-white border-t border-slate-50 shrink-0 pb-4 sm:pb-6 relative">
          {!isReadOnly ? (
            <>
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full right-4 mb-4 z-[140] shadow-2xl border-4 border-slate-900 rounded-[20px] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    theme={Theme.LIGHT}
                    searchDisabled
                    skinTonesDisabled
                    width={280}
                    height={350}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                
                <form onSubmit={sendMessage} className="flex-1 relative group transition-transform hover:scale-[1.01] active:scale-[0.99]">
                  {/* ATTACH IKONA - LIJEVO */}
                  <div className="absolute left-1 top-1 bottom-1 flex items-center">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={uploading}
                      className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={18} />}
                    </button>
                  </div>

                  <input 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onFocus={() => setShowEmojiPicker(false)}
                    placeholder="TYPE..." 
                    className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-2.5 pl-11 pr-24 text-[9px] sm:text-[11px] font-black uppercase placeholder:text-slate-400 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all shadow-sm"
                  />
                  
                  {/* EMOJI I SEND - DESNO */}
                  <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1 pr-1">
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all"
                    >
                      <Smile size={20} className={showEmojiPicker ? "text-yellow-500" : ""} />
                    </button>
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim() || uploading} 
                      className="w-7 h-6 bg-slate-900 text-yellow-400 rounded-lg flex items-center justify-center hover:scale-105 active:scale-90 disabled:opacity-20 transition-all shadow-md"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="w-full bg-slate-50 rounded-lg py-2 px-3 text-center border border-dashed border-slate-200 hover:scale-[1.01] transition-transform">
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Read only</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}