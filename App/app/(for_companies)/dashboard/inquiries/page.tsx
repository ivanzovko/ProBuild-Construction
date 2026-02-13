"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { 
  Search,
  ChevronDown,
  Filter,
  Check,
  SortAsc,
  SortDesc,
  Trash2,
  Loader2,
  ArrowUp,
  X
} from "lucide-react";

import { InquiryList } from "./components/InquiryList";
import { InquiryModal } from "./components/InquiryModal";
import { Tooltip } from "@components/Tooltip";

type SortOption = 'date' | 'answered_date' | 'name' | 'status';

const InquirySkeleton = () => (
  <div className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-sm animate-pulse">
    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
      <div className="flex-1 space-y-4 w-full">
        <div className="flex items-center gap-3">
          <div className="h-4 w-6 bg-slate-200 rounded" />
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-5 w-16 bg-slate-100 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-12 bg-slate-50 rounded-2xl border border-slate-100" />
          <div className="h-12 bg-slate-50 rounded-2xl border border-slate-100" />
          <div className="h-12 bg-slate-50 rounded-2xl border border-slate-100" />
        </div>
      </div>
      <div className="h-14 w-full lg:w-48 bg-slate-200 rounded-2xl" />
    </div>
  </div>
);

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('unanswered');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  const pageTopRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setShowScrollTop(!entry.isIntersecting), { threshold: 0 });
    if (pageTopRef.current) observer.observe(pageTopRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => pageTopRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInquiries = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase.from("inquiries").select("*").eq("company_id", session.user.id);
      if (!error) setInquiries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, [supabase]);

  const getCleanFileName = (url: string) => {
    try {
      if (!url || typeof url !== 'string') return "Document";
      const decoded = decodeURIComponent(url);
      const fileName = decoded.split('/').pop() || "";
      return fileName.includes('_') ? fileName.substring(fileName.indexOf('_') + 1) : fileName;
    } catch { return "Document"; }
  };

  const removeReplyFile = (index: number) => {
    setReplyFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0 && fileInputRef.current) fileInputRef.current.value = "";
      return newFiles;
    });
  };

  const togglePin = async (e: React.MouseEvent, inquiryId: string, currentPinnedStatus: boolean) => {
    e.stopPropagation();
    const { error } = await supabase.from("inquiries").update({ is_pinned: !currentPinnedStatus }).eq("id", inquiryId);
    if (!error) setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, is_pinned: !currentPinnedStatus } : i));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const { error } = await supabase.from("inquiries").delete().eq("id", deleteId);
    if (!error) {
      setInquiries(prev => prev.filter(i => i.id !== deleteId));
      setDeleteId(null);
    }
    setIsDeleting(false);
  };

  const handleViewDetails = async (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage(null);
    setReplyFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!inquiry.is_read) {
      const { error } = await supabase.from("inquiries").update({ is_read: true }).eq("id", inquiry.id);
      if (!error) setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, is_read: true } : i));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setReplyFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const initiateSendReply = () => {
    if (!replyMessage.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleSendReply = async () => {
    if (!selectedInquiry) return;
    setIsSending(true);
    setErrorMessage(null);
    setShowConfirmModal(false);

    try {
      const uploadedAttachments: { url: string; originalName: string }[] = [];
      const urlsForDb: string[] = [];
      
      if (replyFiles.length > 0) {
        for (const file of replyFiles) {
          const timestamp = Date.now();
          const cleanName = file.name.replace(/\s+/g, '_'); 
          const filePath = `replies/${selectedInquiry.id}/${timestamp}/${cleanName}`;
          const { error: uploadError } = await supabase.storage.from("inquiry-attachments").upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from("inquiry-attachments").getPublicUrl(filePath);
          uploadedAttachments.push({ url: publicUrl, originalName: file.name });
          urlsForDb.push(publicUrl);
        }
      }

      const emailRes = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedInquiry.sender_email,
          subject: "Response to your inquiry - Pro Build Construction",
          message: replyMessage,
          attachments: uploadedAttachments 
        })
      });

      if (!emailRes.ok) throw new Error("Failed to send email");

      const { error: updateError } = await supabase
        .from("inquiries")
        .update({ is_answered: true, is_read: true, reply_message: replyMessage, answered_at: new Date().toISOString(), reply_attachments: urlsForDb })
        .eq("id", selectedInquiry.id);

      if (updateError) throw updateError;

      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { ...i, is_answered: true, reply_message: replyMessage, reply_attachments: urlsForDb, answered_at: new Date().toISOString() } : i));
      setShowSuccess(true);
      setReplyMessage("");
      setReplyFiles([]);
      setTimeout(() => { setSelectedInquiry(null); setShowSuccess(false); }, 2000);
    } catch (err: any) { setErrorMessage(err.message || "Failed to send reply"); } 
    finally { setIsSending(false); }
  };

  const filteredAndSortedInquiries = useMemo(() => {
    let result = inquiries.filter(i => {
      const matchesTab = activeTab === 'unanswered' ? !i.is_answered : i.is_answered;
      
      const search = searchQuery.toLowerCase().trim();
      if (!search) return matchesTab;

      const matchesSearch = 
        (i.sender_name && i.sender_name.toLowerCase().includes(search)) || 
        (i.title && i.title.toLowerCase().includes(search));

      return matchesTab && matchesSearch;
    });

    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      let comparison = 0;
      if (sortBy === 'status') comparison = Number(a.is_read) - Number(b.is_read);
      else if (sortBy === 'name') comparison = (a.sender_name || "").localeCompare(b.sender_name || "");
      else if (sortBy === 'date') comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortBy === 'answered_date') comparison = (a.answered_at ? new Date(a.answered_at).getTime() : 0) - (b.answered_at ? new Date(b.answered_at).getTime() : 0);
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    return result;
  }, [inquiries, activeTab, searchQuery, sortBy, sortOrder]);

  const sortOptions = useMemo(() => {
    const options = [{ id: 'date', label: 'Received Date' }, { id: 'name', label: 'Name' }, { id: 'status', label: 'Status' }];
    if (activeTab === 'answered') options.push({ id: 'answered_date', label: 'Answered Date' });
    return options;
  }, [activeTab]);

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#FBFBFC] min-h-[calc(100vh-64px)] text-slate-900 relative">
      <div ref={pageTopRef} className="absolute top-0 left-0 w-full h-px pointer-events-none" />

      {deleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
            onClick={() => setDeleteId(null)} 
          />
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-[32px] p-6 md:p-8 max-w-[380px] w-full relative z-10 shadow-2xl border-4 border-slate-950/5 text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mb-6 mx-auto">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <Trash2 className="text-red-600" size={28} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-950 uppercase italic mb-2 tracking-tight">
              Delete Inquiry?
            </h3>
            <p className="text-slate-600 text-[13px] font-bold mb-8 uppercase tracking-wide px-2">
              This action is <span className="text-red-600 underline underline-offset-4">permanent</span>.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete} 
                disabled={isDeleting} 
                className="w-full px-6 py-4 rounded-2xl bg-red-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-200 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Confirm Delete <Trash2 size={14} /></>
                )}
              </button>
              
              <button 
                onClick={() => setDeleteId(null)} 
                className="w-full px-6 py-4 rounded-2xl bg-white text-slate-950 border-2 border-slate-200 font-black text-[11px] uppercase tracking-widest hover:bg-slate-950 hover:text-white hover:border-slate-950 active:scale-95 transition-all shadow-sm"
              >
                Cancel / Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      <InquiryModal 
        selectedInquiry={selectedInquiry}
        setSelectedInquiry={setSelectedInquiry}
        searchQuery={searchQuery}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        isSending={isSending}
        showSuccess={showSuccess}
        showError={showError}
        errorMessage={errorMessage}
        replyFiles={replyFiles}
        handleFileChange={handleFileChange}
        removeReplyFile={removeReplyFile}
        initiateSendReply={initiateSendReply}
        getCleanFileName={getCleanFileName}
        fileInputRef={fileInputRef}
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        handleSendReply={handleSendReply}
      />

   <header className="mb-6 md:mb-10">
  <div className="flex items-center justify-between gap-3 h-10 md:h-12 relative">
    
    <h1 className="hidden md:block text-lg sm:text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tight whitespace-nowrap">
      Direct <span className="text-yellow-500">Inquiries</span>
    </h1>

    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 h-full">
      
      <div 
        className="relative flex-1 md:w-64 transition-all duration-300"
      >
        <Tooltip content="Filter by name or service" side="bottom">
          <div 
            className="flex items-center bg-white border border-slate-200 rounded-xl md:rounded-2xl h-10 md:h-12 overflow-hidden shadow-sm px-4 ring-2 ring-yellow-400/5 focus-within:ring-yellow-400/20 transition-all"
          >
            <Search className="text-slate-400 shrink-0 mr-3" size={16} />
            <input 
              type="text" 
              placeholder="Search by title or sender..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="bg-transparent text-[11px] font-bold uppercase text-slate-900 focus:outline-none w-full block" 
            />
            {searchQuery !== "" && (
              <X 
                size={16} 
                className="text-slate-400 cursor-pointer hover:text-slate-600 ml-2" 
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={dropdownRef}>
          <Tooltip content="Change sorting criteria" side="bottom">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)} 
              className="flex items-center justify-center gap-2 bg-slate-950 text-white h-10 md:h-12 w-10 md:w-auto md:px-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-lg"
            >
              <Filter size={16} className="text-yellow-400 shrink-0 md:w-[18px]" /> 
              <span className="hidden md:block">Sort: {sortOptions.find(o => o.id === sortBy)?.label}</span>
              <ChevronDown size={14} className={`hidden md:block transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
          </Tooltip>
          
          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-2xl z-50 p-2 overflow-hidden">
              {sortOptions.map((option) => (
                <button 
                  key={option.id} 
                  onClick={() => { setSortBy(option.id as SortOption); setIsSortOpen(false); }} 
                  className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all text-left"
                >
                  {option.label} {sortBy === option.id && <Check size={14} className="text-yellow-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Tooltip content={sortOrder === 'asc' ? 'Ascending order' : 'Descending order'} side="bottom">
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
              className="flex items-center justify-center h-10 md:h-12 w-10 bg-slate-950 text-white rounded-xl md:rounded-2xl hover:bg-slate-800 shadow-lg transition-all"
            >
              {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>

  <div className="flex mt-6">
    <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit">
      <button 
        onClick={() => setActiveTab('unanswered')} 
        className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'unanswered' ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
      >
        Unanswered ({inquiries.filter(i => !i.is_answered).length})
      </button>
      <button 
        onClick={() => setActiveTab('answered')} 
        className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'answered' ? 'bg-yellow-400 text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
      >
        Answered ({inquiries.filter(i => i.is_answered).length})
      </button>
    </div>
  </div>
</header>

      {loading ? (
        <div className="grid gap-4 md:gap-6">{Array.from({ length: 4 }).map((_, i) => <InquirySkeleton key={i} />)}</div>
      ) : (
        <InquiryList 
          inquiries={filteredAndSortedInquiries} 
          activeTab={activeTab} 
          togglePin={togglePin} 
          setDeleteId={setDeleteId} 
          handleViewDetails={handleViewDetails} 
          searchQuery={searchQuery} 
        />
      )}

      <div className="fixed bottom-10 right-10 z-[999] flex flex-col items-center">
        {showScrollTop && (
          <Tooltip content="Back to top" side="top">
            <button 
              onClick={scrollToTop} 
              className="p-4 bg-slate-950 text-white rounded-2xl shadow-2xl transition-all duration-500 hover:bg-yellow-400 hover:text-slate-950 opacity-100"
            >
              <ArrowUp size={24} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}