"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2 } from "lucide-react";
import { ChatSidebar } from "./components/ChatSidebar";
import { StartChatModal } from "./components/StartChatModal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const isChatOpen = segments.length > 2 && lastSegment !== "messages";
  const selectedJobId = isChatOpen ? lastSegment : null;

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // Funkcija definirana prije useEffecta
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchChats();
      }
    };
    getUser();

    const globalChannel = supabase
      .channel('table-db-changes-layout')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'job_messages' 
      }, () => { 
        fetchChats(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, [supabase]);

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
        if (timeB !== timeA) return timeB - timeA;
        const aCompleted = a.status === 'completed', bCompleted = b.status === 'completed';
        if (!aCompleted && bCompleted) return -1;
        if (aCompleted && !bCompleted) return 1;
        return 0;
      });
  }, [chats, searchQuery, pinnedIds]);

  const activeChatsOnly = useMemo(() => {
    return sortedAndSearchedChats.filter(chat => chat.job_messages && chat.job_messages.length > 0);
  }, [sortedAndSearchedChats]);

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

  const navigateWithFilters = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    router.push(`/dashboard/messages/${id}${queryString ? `?${queryString}` : ''}`);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-white h-screen"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>;

  return (
    <div className="flex h-[calc(100vh-128px)] lg:h-[calc(100vh-64px)] bg-white overflow-hidden w-full relative">
      <StartChatModal 
        isOpen={isStartChatOpen} 
        onClose={() => setIsStartChatOpen(false)} 
        projects={sortedAndSearchedChats} 
        onSelectProject={(id) => { 
          navigateWithFilters(id); 
          setIsStartChatOpen(false); 
        }}
      />

      <aside className={`${isChatOpen ? "hidden lg:flex" : "flex"} w-full lg:w-[380px] border-r border-gray-100 flex-shrink-0 flex-col`}>
        <ChatSidebar 
          loading={loading} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          filteredChats={activeChatsOnly} 
          selectedJobId={selectedJobId} 
          setSelectedJobId={(id) => navigateWithFilters(id as string)}
          highlightText={highlightText} 
          formatLastMessageTime={formatLastMessageTime} 
          pinnedIds={pinnedIds} 
          togglePin={togglePin} 
          onStartNewChat={() => setIsStartChatOpen(true)}
        />
      </aside>

      <main className={`${!isChatOpen ? "hidden lg:flex" : "flex"} flex-1 flex-col min-w-0 bg-white relative h-full`}>
        <div className="flex-1 w-full h-full relative overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}