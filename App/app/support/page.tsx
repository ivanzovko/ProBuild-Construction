"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  ChevronDown, 
  User, 
  Zap, 
  CreditCard, 
  ShieldAlert, 
  Send, 
  CheckCircle2,
  MessageCircle,
  X,
  AlertCircle,
  Clock,
  History,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronUp
} from "lucide-react";

const CATEGORIES = [
  { id: 'general', icon: <User size={16} />, label: "Account" },
  { id: 'tracking', icon: <Zap size={16} />, label: "Tracking" },
  { id: 'billing', icon: <CreditCard size={16} />, label: "Billing" },
  { id: 'security', icon: <ShieldAlert size={16} />, label: "Security" },
];

const FAQS = [
  {
    category: 'general',
    question: "How do I request an inquiry from a company?",
    answer: "Navigate to the 'Services' page, choose a provider, and click the 'Inquiry' button. The company will receive your request and respond via email or phone."
  },
  {
    category: 'billing',
    question: "Is there a fee for using the platform?",
    answer: "For clients looking for services, the platform is 100% free. Companies pay a subscription fee to list their services."
  },
  {
    category: 'tracking',
    question: "How does project tracking work?",
    answer: "Once a company starts your project, you will receive a unique tracking ID. Enter it in the 'Live Tracking' section to see real-time updates."
  },
  {
    category: 'security',
    question: "How is my data protected?",
    answer: "We use industry-standard AES-256 encryption for all data at rest and TLS/SSL for data in transit."
  }
];

const TicketSkeleton = () => (
  <div className="bg-slate-50 border-2 border-slate-100 rounded-[28px] p-6 animate-pulse flex flex-col h-[180px]">
    <div className="flex justify-between items-start mb-4">
      <div className="h-5 w-16 bg-slate-200 rounded-lg" />
      <div className="h-4 w-20 bg-slate-200 rounded-md" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 w-full bg-slate-200 rounded-md" />
      <div className="h-4 w-2/3 bg-slate-200 rounded-md" />
    </div>
    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
      <div className="h-3 w-3 bg-slate-200 rounded-full" />
      <div className="h-3 w-24 bg-slate-200 rounded-md" />
    </div>
  </div>
);

export default function SupportPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [showTickets, setShowTickets] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const fetchUserTickets = async (uid: string) => {
    setIsLoadingTickets(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUserTickets(data);
    }
    setIsLoadingTickets(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || "",
          email: session.user.email || ""
        }));
        fetchUserTickets(session.user.id);
      } else {
        setUserId(null);
        setUserTickets([]);
        setFormData({ name: "", email: "", message: "" });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isChatOpen, messages, isTyping]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredTickets = useMemo(() => {
    if (ticketFilter === 'all') return userTickets;
    return userTickets.filter(t => t.status?.toLowerCase() === ticketFilter);
  }, [userTickets, ticketFilter]);

  const handleSubmit = async () => {
    setShowConfirm(false);
    setFormStatus('sending');

    try {
      const { error } = await supabase
        .from("support_tickets")
        .insert([{ 
          name: formData.name, 
          email: formData.email, 
          message: formData.message, 
          user_id: userId 
        }]);

      if (error) throw error;
      setFormStatus('success');
      setFormData(prev => ({ ...prev, message: "" }));
      if (userId) fetchUserTickets(userId);
    } catch (err) {
      console.error(err);
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isTyping) return;

    const userMsg = { role: 'user', content: chatMessage };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Trenutno nisam u mogućnosti odgovoriti." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-amber-400 text-black';
      case 'closed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-blue-500 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const filteredFaqs = FAQS.filter(faq => faq.category === activeCategory);

  return (
    <main className="min-h-screen bg-white pb-20 px-4 md:px-6 relative text-slate-900 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl pt-4 md:pt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          <div className="lg:col-span-7 space-y-12">
            <header>
              <div className="h-1.5 w-12 bg-yellow-400 mb-4 rounded-full" />
              
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-6">
                <button 
                  onClick={() => router.back()}
                  className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all shrink-0"
                >
                  <div className="p-2 bg-slate-200 group-hover:bg-yellow-400 rounded-xl transition-all">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Back</span>
                </button>

                <h1 className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.9]">
                  How can we <span className="text-slate-400">help you?</span>
                </h1>
              </div>
            </header>

            <section>
              <div className="flex items-end justify-between mb-8 border-b-2 border-slate-50 pb-4">
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
                  <span className="md:hidden">FAQ</span>
                  <span className="hidden md:block">Frequently Asked Questions</span>
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">
                  {filteredFaqs.length} Articles
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => { setActiveCategory(cat.id); setOpenFaq(null); }} 
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                      activeCategory === cat.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-900"
                    }`}
                  >
                    <span className={activeCategory === cat.id ? "text-yellow-400" : ""}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <div key={faq.question} className="bg-white rounded-[24px] border-2 border-slate-100 hover:border-slate-200 transition-all overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === faq.question ? null : faq.question)} className="w-full flex items-center justify-between p-5 md:p-6 text-left">
                      <span className="font-extrabold text-slate-900 text-sm md:text-base uppercase tracking-tight pr-6">{faq.question}</span>
                      <div className={`p-2 rounded-xl transition-all ${openFaq === faq.question ? "bg-yellow-400 text-black rotate-180" : "bg-slate-50 text-slate-400"}`}>
                        <ChevronDown size={18} />
                      </div>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === faq.question ? "max-h-[500px] border-t border-slate-50" : "max-h-0"}`}>
                      <div className="p-6 md:p-8 text-slate-600 text-sm font-medium leading-relaxed bg-slate-50/30">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
            <div className={`bg-slate-900 rounded-[30px] md:rounded-[40px] p-6 md:p-10 text-white shadow-2xl border-t-8 border-yellow-400 relative overflow-hidden transition-all duration-500 ${!showMobileForm ? 'max-md:h-[120px]' : 'max-md:h-auto'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                <MessageCircle size={150} />
              </div>

              {/* Mobile Toggle Button */}
              <button 
                onClick={() => setShowMobileForm(!showMobileForm)}
                className="md:hidden absolute top-6 right-6 z-20 p-2 bg-white/10 rounded-xl text-yellow-400"
              >
                {showMobileForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              <div className="relative z-10">
                <h3 className={`text-xl font-black uppercase italic tracking-tighter transition-all ${!showMobileForm ? 'mb-2' : 'mb-6'}`}>
                  Open a support ticket
                </h3>
                
                {!showMobileForm && (
                  <button 
                    onClick={() => setShowMobileForm(true)}
                    className="md:hidden text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 flex items-center gap-2"
                  >
                    Click to fill form <Send size={12} />
                  </button>
                )}
              </div>

              <div className={`transition-all duration-500 md:opacity-100 md:block ${showMobileForm ? 'opacity-100 mt-6' : 'opacity-0 hidden'}`}>
                {formStatus === 'success' ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl">
                      <CheckCircle2 size={32} className="text-black" />
                    </div>
                    <h4 className="font-black text-white uppercase text-lg md:text-xl italic tracking-tighter">Sent Successfully!</h4>
                    <button onClick={() => setFormStatus('idle')} className="mt-8 bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">New message</button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-4">
                    <div className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-4 top-4 text-white/20" size={14} />
                        <input 
                          required 
                          type="text" 
                          value={formData.name} 
                          onChange={(e) => setFormData({...formData, name: e.target.value})} 
                          placeholder="FULL NAME" 
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-10 pr-4 py-4 text-white text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20" 
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 text-white/20" size={14} />
                        <input 
                          required 
                          type="email" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          placeholder="EMAIL ADDRESS" 
                          className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-10 pr-4 py-4 text-white text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20" 
                        />
                      </div>
                      <textarea 
                        required 
                        rows={4} 
                        value={formData.message} 
                        onChange={(e) => setFormData({...formData, message: e.target.value})} 
                        placeholder="DESCRIBE YOUR ISSUE..." 
                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-white text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20 resize-none"
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={formStatus === 'sending'} 
                      className="w-full bg-yellow-400 hover:bg-white text-black py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {formStatus === 'sending' ? "Transmitting..." : <>Submit Ticket <Send size={14} /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Emergency Contact</h4>
              <a href="mailto:pro.build.construction123@gmail.com" className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 flex items-center gap-4 group hover:border-slate-900 transition-all">
                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-900 group-hover:bg-yellow-400 transition-colors">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</span>
                  <span className="text-[12px] font-black text-slate-900 lowercase truncate block">pro.build.construction123@gmail.com</span>
                </div>
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-20 bg-slate-50 rounded-[30px] md:rounded-[40px] p-6 md:p-12 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 text-yellow-400 rounded-2xl shadow-lg">
                <History size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase italic text-2xl md:text-3xl tracking-tighter">My Tickets</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  {userId ? `${userTickets.length} Request(s) found` : 'Login to see history'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowTickets(!showTickets)}
              className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border-2 border-slate-200 font-black text-[10px] uppercase tracking-widest hover:border-slate-900 transition-all shadow-sm"
            >
              {showTickets ? <><EyeOff size={16} /> Hide History</> : <><Eye size={16} /> Show History</>}
            </button>
          </div>

          {showTickets && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/50 w-fit mb-8 overflow-x-auto">
                {['all', 'open', 'closed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTicketFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      ticketFilter === f ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingTickets ? (
                  [...Array(3)].map((_, i) => <TicketSkeleton key={i} />)
                ) : userId && filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white border-2 border-slate-100 rounded-[28px] p-6 hover:border-slate-900 transition-all group shadow-sm flex flex-col h-auto min-h-[160px]">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                          {ticket.status || 'Received'}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          {new Date(ticket.created_at).toLocaleDateString('hr-HR')}
                        </span>
                      </div>
                      <p className="text-[14px] font-extrabold text-slate-800 leading-snug uppercase italic mb-4">
                        "{ticket.message}"
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4 mt-auto">
                        {ticket.status?.toLowerCase() === 'closed' ? <CheckCircle2 size={12} className="text-green-600" /> : <Clock size={12} className="text-amber-500" />}
                        <span>{ticket.status?.toLowerCase() === 'closed' ? 'Resolved' : 'Active Request'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center border-4 border-dashed border-slate-200 rounded-[40px]">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">No tickets history</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border-b-8 border-yellow-400 animate-in zoom-in-95 text-center">
            <div className="w-20 h-20 bg-slate-900 text-yellow-400 rounded-[30px] flex items-center justify-center mx-auto mb-8 rotate-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">Are you sure?</h3>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em] mb-10 leading-relaxed">This will send your request directly to our support engineers.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-xl">Send Now</button>
            </div>
          </div>
        </div>
      )}

    
 {/* CHAT I SCROLL TOP */}
      <div className="fixed bottom-6 right-4 md:right-6 z-[300] flex flex-col items-end gap-4">
        {showScrollTop && (
          <button onClick={scrollToTop} className="bg-white border-2 border-slate-900 p-3.5 rounded-2xl shadow-xl hover:bg-yellow-400 transition-all group">
            <ChevronDown size={22} className="text-slate-900 rotate-180 group-hover:-translate-y-1 transition-transform" />
          </button>
        )}
        
        <div className={`flex flex-col items-end transition-all duration-500 ${isChatOpen ? 'w-[calc(100vw-2rem)] sm:w-[420px]' : 'w-auto'}`}>
          {isChatOpen ? (
            <div className="w-full bg-white rounded-[30px] md:rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 h-[80vh] md:h-auto">
              <div className="bg-slate-900 p-5 md:p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-[15px] md:rounded-[18px] flex items-center justify-center rotate-3">
                      <MessageCircle size={18} className="text-black" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <p className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest leading-none">AI Support</p>
                    <p className="text-green-400 text-[8px] md:text-[9px] font-bold uppercase mt-1.5 md:mt-2 tracking-widest">Active Now</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div ref={scrollRef} className="flex-1 md:h-[450px] bg-slate-50/50 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                <div className="bg-white p-5 rounded-[24px] rounded-tl-none border border-slate-100 max-w-[90%] shadow-sm text-slate-700 text-sm font-medium">
                  Hi {formData.name.split(' ')[0] || 'there'}! 👋 <br />How can I help you?
                </div>
                {messages.map((msg, i) => (
                  <div key={i} className={`max-w-[90%] p-5 rounded-[24px] text-sm font-medium shadow-sm leading-relaxed ${msg.role === 'assistant' ? "bg-white border border-slate-100 self-start rounded-tl-none text-slate-700" : "bg-slate-900 text-white self-end rounded-tr-none"}`}>
                    <p>{msg.content}</p>
                  </div>
                ))}
                {isTyping && <div className="bg-white border border-slate-100 self-start p-4 rounded-2xl rounded-tl-none animate-pulse text-[8px] text-slate-400 font-black uppercase tracking-widest">Typing...</div>}
              </div>

              <div className="p-4 md:p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleAiChat} className="relative flex items-center">
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type a message..." className="w-full bg-slate-100 border-none rounded-2xl py-4 md:py-5 px-5 md:px-6 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all" />
                  <button type="submit" className="absolute right-2.5 p-2 bg-slate-900 text-white rounded-xl hover:bg-yellow-400 hover:text-black transition-all shadow-md">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="group transition-all duration-300 flex items-center justify-center bg-white/80 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-lg hover:bg-yellow-400 active:bg-yellow-400 md:bg-yellow-400 md:hover:bg-slate-900 md:p-4 md:rounded-[24px] md:shadow-2xl md:gap-5 hover:-translate-y-1"
            >
              <span className="hidden md:block text-black group-hover:text-white font-black text-[11px] uppercase tracking-[0.2em] pl-4">
                Live Assistant
              </span>
              
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-500 md:bg-black md:rounded-2xl md:group-hover:bg-yellow-400">
                <MessageCircle 
                  className="w-6 h-6 md:w-6 md:h-6 text-slate-900 md:text-yellow-400 md:group-hover:text-black stroke-[1.8]" 
                />
              </div>
            </button>
          )}
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}