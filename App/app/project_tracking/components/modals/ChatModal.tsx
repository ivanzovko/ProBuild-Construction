"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare, Briefcase, Lock, CheckCircle2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

function ChatSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`h-10 w-[60%] rounded-xl bg-slate-100 ${
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
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
    fetchMessages();

    const channel = supabase
      .channel(`job-${job.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'job_messages', 
        filter: `job_id=eq.${job.id}` 
      }, 
      payload => setMessages(prev => [...prev, payload.new]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [job.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('job_messages')
      .select('*')
      .eq('job_id', job.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || isReadOnly) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('job_messages').insert({ 
      job_id: job.id, 
      sender_id: user.id, 
      text: newMessage 
    });
    setNewMessage("");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[340px] sm:max-w-md h-[80dvh] sm:h-[600px] rounded-[24px] sm:rounded-[40px] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-10 duration-300 mx-auto mt-4 sm:mt-0">
        
        <div className="px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center bg-white border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shadow-md rotate-2 transition-colors shrink-0 ${isReadOnly ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-yellow-400'}`}>
              {isReadOnly ? <Lock size={16} /> : <MessageSquare size={18} />}
            </div>
            
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] sm:text-lg font-black text-slate-900 uppercase italic tracking-tight leading-none whitespace-nowrap">
                  {isReadOnly ? 'Archive' : 'Chat'}
                </h3>
                {job.status === 'completed' && (
                  <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-md shrink-0">
                    <CheckCircle2 size={8} strokeWidth={3} />
                    <span className="text-[7px] font-black uppercase tracking-tighter">Completed</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 min-w-0">
                 <Briefcase size={8} className="text-slate-400 shrink-0" />
                 <p className="text-[8px] sm:text-[9px] text-slate-500 font-black uppercase tracking-wider truncate">
                  {job.title || 'Project'}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all ml-2 shrink-0"
          >
            <X size={18}/>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 bg-white scrollbar-hide">
          {loading ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <MessageSquare size={32} />
              <p className="text-[8px] font-black uppercase tracking-widest mt-2">Empty</p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-4">
              {messages.map((m) => {
                const isMe = m.sender_id === currentUserId;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-[14px] sm:rounded-[22px] text-[9px] sm:text-[11px] font-bold uppercase tracking-wide shadow-sm relative ${
                      isMe 
                        ? 'bg-slate-900 text-yellow-400 rounded-tr-none' 
                        : 'bg-slate-50 text-slate-600 border border-slate-100 rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-3 py-3 sm:px-6 sm:py-6 bg-white border-t border-slate-50 shrink-0 pb-4 sm:pb-6">
          {!isReadOnly ? (
            <form onSubmit={sendMessage} className="relative group">
              <input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type..." 
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-2.5 pl-4 pr-12 text-[9px] sm:text-[11px] font-black uppercase placeholder:text-slate-400 focus:outline-none focus:border-yellow-400 transition-all"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="absolute right-1 top-1 bottom-1 w-9 bg-slate-900 text-yellow-400 rounded-lg flex items-center justify-center active:scale-90 disabled:opacity-20 transition-all"
              >
                <Send size={14} />
              </button>
            </form>
          ) : (
            <div className="w-full bg-slate-50 rounded-lg py-2 px-3 text-center border border-dashed border-slate-200">
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                Read only
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}