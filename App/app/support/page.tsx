"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Mail, 
  Phone, 
  ChevronDown, 
  User, 
  Zap, 
  CreditCard, 
  ShieldAlert, 
  Send, 
  CheckCircle2,
  Lock,
  MessageCircle,
  X,
  AlertCircle
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
    answer: "We use industry-standard AES-256 encryption for all data at rest and TLS/SSL for data in transit. Your personal information and project details are strictly accessible only to authorized parties."
  },
  {
    category: 'security',
    question: "Who can see my project documents?",
    answer: "Only you and the company assigned to your project have access to uploaded documents. Our staff can only access them upon your explicit support request."
  }
];

export default function SupportPage() {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || "",
          email: session.user.email || ""
        }));
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isChatOpen, messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setFormStatus('sending');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("support_tickets")
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            message: formData.message, 
            user_id: session?.user?.id || null 
          }
        ]);

      if (error) throw error;
      setFormStatus('success');
      setFormData(prev => ({ ...prev, message: "" }));
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

  const filteredFaqs = FAQS.filter(faq => faq.category === activeCategory);

  return (
    <main className="min-h-screen bg-white pt-2 lg:pt-4 pb-20 px-4 md:px-6 relative text-slate-900">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-4 lg:mb-6">
          <div className="h-1.5 w-12 bg-yellow-400 mb-4 rounded-full" />
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-2">
            Support <span className="text-slate-500">Portal</span>
          </h1>
          <p className="text-slate-700 font-bold text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            Professional assistance & knowledge base
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          <aside className="lg:col-span-4 lg:sticky lg:top-4 order-1">
            <div className="bg-slate-900 rounded-[24px] sm:rounded-[40px] p-6 sm:p-8 text-white shadow-2xl border-t-4 border-yellow-400">
              <div className="mb-6 sm:mb-8 text-center lg:text-left">
                <h3 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter mb-1 sm:mb-2">
                  Open a <span className="text-yellow-400">Ticket</span>
                </h3>
                <p className="text-slate-400 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest">
                  Estimated response: 24h
                </p>
              </div>

              {formStatus === 'success' ? (
                <div className="py-8 sm:py-12 text-center animate-in fade-in zoom-in">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={24} className="text-black sm:w-8 sm:h-8" />
                  </div>
                  <h4 className="font-black text-white uppercase text-xs sm:text-sm italic">Request Received</h4>
                  <p className="text-slate-400 text-[8px] font-bold uppercase mt-2">Check your email soon</p>
                  <button 
                    onClick={() => setFormStatus('idle')}
                    className="mt-6 text-[8px] font-black text-yellow-400 uppercase tracking-widest border-b border-yellow-400"
                  >
                    Send another ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="space-y-3 sm:space-y-4">
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="FULL NAME" 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                  />
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="EMAIL ADDRESS" 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                  />
                  <textarea 
                    required
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="HOW CAN WE HELP?" 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-400 transition-all placeholder:text-white/20 resize-none"
                  ></textarea>
                  <button 
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="w-full bg-yellow-400 hover:bg-white text-black py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-400/10 active:scale-95 disabled:opacity-50"
                  >
                    {formStatus === 'sending' ? "Sending..." : <>Send Ticket <Send size={14} /></>}
                  </button>
                  
                  {formStatus === 'error' && (
                    <p className="text-red-400 text-[8px] font-black uppercase text-center mt-2">Error sending request.</p>
                  )}
                </form>
              )}
            </div>
          </aside>

          <div className="lg:col-span-8 order-2 space-y-8 sm:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all hover:border-slate-900 group">
                <div className="p-3 bg-white rounded-xl sm:rounded-2xl shadow-sm text-slate-900 group-hover:bg-yellow-400 transition-colors">
                  <Mail size={20} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Support</span>
                  <a href="mailto:support@probuild.hr" className="text-xs sm:text-sm font-black text-slate-900 uppercase hover:text-yellow-500 transition-colors truncate block">support@probuild.hr</a>
                </div>
              </div>

              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all hover:border-slate-900 group">
                <div className="p-3 bg-white rounded-xl sm:rounded-2xl shadow-sm text-slate-900 group-hover:bg-yellow-400 transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Call Center</span>
                  <a href="tel:+38591234567" className="text-xs sm:text-sm font-black text-slate-900 uppercase hover:text-yellow-500 transition-colors block">+385 91 234 567</a>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-wrap gap-2 border-b-2 border-slate-100 pb-5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenFaq(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all border-2 ${
                      activeCategory === cat.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10" 
                      : "bg-white border-slate-100 text-slate-600 hover:border-slate-900 hover:text-slate-900"
                    }`}
                  >
                    {cat.icon} <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:gap-4">
                {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => (
                  <div key={faq.question} className="bg-white rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all overflow-hidden shadow-sm hover:shadow-md">
                    <button 
                      onClick={() => setOpenFaq(openFaq === faq.question ? null : faq.question)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left group transition-colors hover:bg-slate-50"
                    >
                      <span className="font-extrabold text-slate-900 text-[11px] sm:text-sm uppercase tracking-tight pr-4 leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown className={`shrink-0 transition-transform duration-300 ${openFaq === faq.question ? "rotate-180 text-yellow-500" : "text-slate-400 group-hover:text-slate-900"}`} size={20} />
                    </button>
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        openFaq === faq.question ? "max-h-[500px] border-t-2 border-slate-50 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="p-5 sm:p-6 text-slate-600 text-[11px] sm:text-sm font-medium leading-relaxed bg-slate-50/50">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">No articles in this category yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 max-w-sm w-full shadow-2xl border-2 border-slate-100 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-slate-900" />
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-3">Ready to send?</h4>
            <p className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-10 leading-relaxed">
              Your inquiry will be processed by our team. You will receive an email confirmation shortly.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setIsModalOpen(false)} className="py-4 sm:py-5 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Back</button>
              <button onClick={() => { setIsModalOpen(false); handleSubmit(); }} className="py-4 sm:py-5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-xl shadow-slate-900/20">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Component */}
      <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end transition-all duration-500 ${isChatOpen ? 'w-[calc(100vw-2rem)] sm:w-[380px]' : 'w-auto'}`}>
        {isChatOpen ? (
          <div className="w-full bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
            <div className="bg-slate-900 p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
                    <MessageCircle size={20} className="text-black" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <p className="text-white font-black text-[10px] uppercase tracking-widest leading-none">Live Support</p>
                  <p className="text-green-400 text-[8px] font-bold uppercase mt-1.5">Online</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="h-80 sm:h-96 bg-slate-50 p-5 overflow-y-auto flex flex-col gap-4">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 max-w-[85%] shadow-sm">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Hi {formData.name.split(' ')[0] || 'there'}! 👋 How can we help you today?
                </p>
              </div>
              {messages.map((msg, i) => (
                <div key={i} className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium ${msg.role === 'assistant' ? "bg-white border border-slate-100 self-start rounded-tl-none shadow-sm text-slate-700" : "bg-slate-900 text-white self-end rounded-tr-none shadow-lg"}`}>
                  <p>{msg.content}</p>
                </div>
              ))}
              {isTyping && <div className="bg-white border border-slate-100 self-start p-3 rounded-2xl rounded-tl-none animate-pulse text-[8px] text-slate-400 font-black uppercase">AI is typing...</div>}
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleAiChat} className="relative flex items-center">
                <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type a message..." className="w-full bg-slate-50 border-none rounded-xl py-4 px-5 text-xs focus:ring-2 focus:ring-yellow-400 outline-none transition-all text-slate-900" />
                <button type="submit" className="absolute right-3 p-2 bg-slate-900 text-white rounded-lg hover:bg-yellow-400 hover:text-black transition-all"><Send size={14} /></button>
              </form>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsChatOpen(true)} className="group bg-yellow-400 hover:bg-slate-900 p-3 sm:p-4 rounded-[20px] sm:rounded-[24px] shadow-xl shadow-yellow-400/20 transition-all duration-300 flex items-center gap-4 hover:-translate-y-1">
            <span className="text-black group-hover:text-white font-black text-[10px] uppercase tracking-widest pl-3">Live Chat</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black group-hover:bg-yellow-400 rounded-2xl flex items-center justify-center transition-colors">
              <MessageCircle className="text-yellow-400 group-hover:text-black w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </button>
        )}
      </div>
    </main>
  );
}