"use client";

import { useState, useEffect, use, useRef, useMemo, useCallback } from "react"; 
import OfferModal from "./components/OfferModal";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Tooltip } from "@components/Tooltip";

// Components
import ProjectTimeline from "@/app/project_tracking/[id]/components/ProjectTimeline";
import ProjectFinance from "@/app/project_tracking/[id]/components/ProjectFinance";
import ProjectMedia from "@/app/project_tracking/[id]/components/ProjectMedia";
import ProjectOffers from "@/app/project_tracking/[id]/components/ProjectOffers";
import ProjectInfoModal from "@/app/project_tracking/[id]/components/ProjectInfoModal";
import CompanyInfoModal from "@/app/_components/CompanyInfoModal";
import ReviewsModal from "@/app/find_service/components/reviewsModal";

import { 
  FileText, ImageIcon, Loader2, ArrowLeft, CheckCircle2, 
  AlertTriangle, HardHat, Calendar, MessageSquare, X, Check,
  Wallet, Receipt, ChevronDown, ChevronUp, Info, Star, Smartphone, Tag, User, Menu
} from "lucide-react";

type TabType = 'timeline' | 'costs' | 'images' | 'documents' | 'chat' | 'offers';

function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="bg-slate-900 h-[180px] lg:h-[240px] w-full" />
      <main className="max-w-[1440px] mx-auto px-6 -mt-10">
        <div className="h-[600px]" />
      </main>
    </div>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const [job, setJob] = useState<any>(null);
  const [contractorPrice, setContractorPrice] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ url: string, type: 'docs' | 'images' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [isMiniHeader, setIsMiniHeader] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  // State za custom void payment modal
  const [paymentToVoid, setPaymentToVoid] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);

  const docInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChat = useCallback(() => {
    router.push(`/dashboard/messages/${projectId}`);
  }, [router, projectId]);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company_profiles (*),
        client_profiles (full_name, email, phone),
        payments (
          id, 
          amount, 
          payment_date, 
          description, 
          is_avans, 
          created_at,
          status
        ),
        project_items (*),
        estimates (*)
      `)
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error("Error fetching project:", error.message);
    } else if (data) {
      setJob(data);
      
      const isUserAdmin = currentUser && data.contractor_id === currentUser.id;
      setIsAdmin(!!isUserAdmin);

      const acceptedEstimate = data.estimates?.find((e: any) => e.status === 'accepted');
      
      if (acceptedEstimate) {
        setContractorPrice(acceptedEstimate.price);
      } else if (isUserAdmin && currentUser) {
        const { data: estimateData } = await supabase
          .from('estimates')
          .select('price')
          .eq('job_id', projectId)
          .eq('contractor_id', currentUser.id)
          .eq('status', 'accepted')
          .maybeSingle();
        
        if (estimateData) setContractorPrice(estimateData.price);
      }
    }
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (!projectId || !user?.id) return;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('job_messages')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', projectId)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      if (!error) setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel(`unread_count_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_messages',
          filter: `job_id=eq.${projectId}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user?.id, supabase]);

  const getBackUrl = () => {
    if (!job) return '/dashboard/tracker';
    const view = job.status === 'completed' ? 'completed' : 'active';
    return `/dashboard/tracker?view=${view}`;
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const fileName = parts[parts.length - 1];
      return fileName.includes('_') ? fileName.split('_').slice(1).join('_') : fileName;
    } catch { return "Document"; }
  };
const handleAddPayment = async (paymentData: any) => {
  try {
    const { error } = await supabase
      .from('payments')
      .insert([{
        job_id: projectId,
        amount: Number(paymentData.amount),
        payment_date: paymentData.payment_date,
        description: paymentData.description,
        is_avans: paymentData.is_avans,
        status: 'active'
      }]);

    if (error) throw error;
    
    // 1. Refresh the project data to update balances
    await fetchProject();

    // 2. Trigger the Success Toast
    setDeleteSuccess("Payment added successfully!"); 
    
    // 3. Auto-hide the message after 3 seconds
    setTimeout(() => setDeleteSuccess(null), 3000);

  } catch (err: any) {
    console.error("Payment Error:", err);
    
    // Trigger the Error Toast
    setUploadError(err.message || "Failed to record payment. Please try again.");
    setTimeout(() => setUploadError(null), 3000);
  }
};
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'docs' | 'images') => {
    const files = e.target.files;
    if (!files || files.length === 0 || !job) return;
    const file = files[0];
    const isDoc = type === 'docs';
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const column = isDoc ? 'documentation_urls' : 'project_images';
    const fileExists = (job[column] || []).some((url: string) => getFileNameFromUrl(url).toLowerCase() === cleanName.toLowerCase());

    if (fileExists) {
      setUploadError(`File "${cleanName}" already exists.`);
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setIsUploading(true);
    try {
      const path = `${job.id}/${Date.now()}_${cleanName}`;
      const bucket = isDoc ? 'documents_client' : 'photos_client';
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      const updatedUrls = [...(job[column] || []), publicUrl];
      const { error: dbErr } = await supabase.from('jobs').update({ [column]: updatedUrls }).eq('id', job.id);
      if (dbErr) throw dbErr;
      setJob({ ...job, [column]: updatedUrls });
    } catch (err) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm || !job) return;
    setIsDeleting(true);
    const { url, type } = deleteConfirm;
    const isDoc = type === 'docs';
    const column = isDoc ? 'documentation_urls' : 'project_images';
    const bucket = isDoc ? 'documents_client' : 'photos_client';
    const updatedUrls = (job[column] || []).filter((u: string) => u !== url);
    try {
      const { error: dbErr } = await supabase.from('jobs').update({ [column]: updatedUrls }).eq('id', job.id);
      if (dbErr) throw dbErr;
      const path = url.split(`${bucket}/`)[1];
      if (path) await supabase.storage.from(bucket).remove([path]);
      setJob({ ...job, [column]: updatedUrls });
      setDeleteSuccess(`${isDoc ? 'Document' : 'Photo'} deleted`);
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) { console.error(err); } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const totalWorkValue = job?.project_items?.reduce((acc: number, item: any) => acc + (Number(item.price) || 0), 0) || 0;
  const paidSoFar = Number(job?.paid_so_far) || 0;
  const estimatedPrice = Number(job?.estimated_price) || 0;
  const remainingToPay = totalWorkValue - paidSoFar;

  const tabs = [
    { id: 'timeline', label: 'Work Log', icon: Calendar },
    { id: 'costs', label: 'Costs & Payments', icon: Wallet },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'offers', label: 'Your offer', icon: Receipt }
  ];

  const currentTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Work Log';

  return (
    <div className="min-h-[calc(100dvh-128px)] overflow-y-auto bg-slate-50 pb-20 text-slate-900 scroll-smooth">
      <input type="file" ref={docInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'docs')} accept=".pdf,.doc,.docx" />
      <input type="file" ref={imgInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'images')} accept="image/*" />

      {uploadError && <Toast message={uploadError} type="error" onClose={() => setUploadError(null)} />}
      {deleteSuccess && <Toast message={deleteSuccess} type="success" onClose={() => setDeleteSuccess(null)} />}
      {isInfoOpen && <ProjectInfoModal job={job} onClose={() => setIsInfoOpen(false)} onViewReviews={() => setIsReviewsOpen(true)} />}
      {isCompanyOpen && job?.company_profiles && <CompanyInfoModal isOpen={isCompanyOpen} company={job.company_profiles} onClose={() => setIsCompanyOpen(false)} />}
      {isReviewsOpen && <ReviewsModal isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} contractorName={job?.company_profiles?.company_name || "Contractor"} contractorId={job?.contractor_id} supabase={supabase} />}
      {isOfferModalOpen && <OfferModal jobId={projectId} onClose={() => setIsOfferModalOpen(false)} />}

      {isClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-md shadow-2xl border border-slate-200 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 p-6">
              <button 
                onClick={() => setIsClientModalOpen(false)} 
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-yellow-400 rounded-[24px] flex items-center justify-center mb-6 shadow-xl shadow-yellow-400/20 transform hover:scale-110 transition-transform duration-300">
                <User size={40} className="text-slate-900" />
              </div>
              <h3 className="text-2xl font-black uppercase italic text-slate-900 mb-1 tracking-tight">Client Information</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Contact details for this project</p>
              <div className="w-full space-y-4">
                <div className="bg-slate-100 p-6 rounded-3xl border border-transparent text-left transform hover:scale-[1.02] hover:bg-white hover:border-yellow-400 transition-all duration-300 shadow-sm hover:shadow-md">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Name</span>
                  <p className="text-sm font-black text-slate-900 uppercase italic">{job?.client_profiles?.full_name || "N/A"}</p>
                </div>
                <div className="bg-slate-100 p-6 rounded-3xl border border-transparent text-left transform hover:scale-[1.02] hover:bg-white hover:border-yellow-400 transition-all duration-300 shadow-sm hover:shadow-md">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</span>
                  <a href={`mailto:${job?.client_profiles?.email}`} className="text-sm font-black text-slate-900 hover:text-yellow-600 transition-colors italic break-all">{job?.client_profiles?.email || "No Email"}</a>
                </div>
                <div className="bg-slate-100 p-6 rounded-3xl border border-transparent text-left transform hover:scale-[1.02] hover:bg-white hover:border-yellow-400 transition-all duration-300 shadow-sm hover:shadow-md">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phone Number</span>
                  <a href={`tel:${job?.client_profiles?.phone}`} className="text-sm font-black text-slate-900 hover:text-yellow-600 transition-colors uppercase italic">{job?.client_profiles?.phone || "No Phone"}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Void Payment Modal */}
  {paymentToVoid && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border-2 border-red-50 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-red-600" />
            
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <AlertTriangle size={40} />
            </div>
            
            <h3 className="text-xl font-black uppercase italic text-slate-900 mb-3 tracking-tight">
              Void Payment?
            </h3>
            
            <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mb-8 tracking-wider">
              This will remove the amount from the total balance and mark the transaction as voided.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                  const id = paymentToVoid;
                  setPaymentToVoid(null);
                  try {
                    const { error } = await supabase
                      .from('payments')
                      .update({ status: 'voided' })
                      .eq('id', id);

                    if (error) throw error;
                    await fetchProject();
                  } catch (err) {
                    console.error(err);
                    alert("Error voiding payment");
                  }
                }}
                className="w-full py-4 bg-red-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 hover:bg-red-700 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Confirm Void
              </button>
              
              <button 
                onClick={() => setPaymentToVoid(null)}
                className="w-full py-4 bg-slate-300 text-slate-600 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
            <h3 className="text-lg font-black uppercase text-slate-900 mb-2 italic tracking-tight">Confirm Deletion</h3>
            <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed mb-8">This action cannot be undone. Permanent removal from cloud storage.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={`bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl transition-all duration-300`}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className={`flex items-center gap-4 lg:gap-6 transition-all duration-300 ${isMiniHeader ? 'py-4' : 'py-6'}`}>
            <button 
              onClick={() => router.push(getBackUrl())}
              className="hidden lg:flex items-center justify-center w-12 h-12 bg-white/5 text-white rounded-2xl hover:bg-yellow-400 hover:text-slate-900 transition-all border border-white/5 shrink-0 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between min-w-0 gap-4">
              <div className="min-w-0 flex-1 flex items-center gap-2 md:gap-4">
                <button 
                  onClick={() => router.push(getBackUrl())}
                  className="lg:hidden flex items-center justify-center w-9 h-9 bg-white/5 text-white rounded-lg border border-white/10 shrink-0 active:scale-90"
                >
                  <ArrowLeft size={18} />
                </button>
                <h1 className="text-base md:text-xl lg:text-2xl font-black text-white uppercase italic leading-none tracking-tighter truncate max-w-[260px] sm:max-w-[350px] md:max-w-none">
                  {job?.title || job?.project_type}
                </h1>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsInfoOpen(true)} className="p-2 md:p-2.5 bg-white/10 text-yellow-400 rounded-lg md:rounded-xl hover:bg-yellow-400 hover:text-slate-900 transition-all">
                    <Info size={16} className="md:size-5" />
                  </button>
                  <button onClick={() => setIsMiniHeader(!isMiniHeader)} className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition-all hidden lg:block">
                    {isMiniHeader ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </button>
                </div>
              </div>

              <div className="lg:hidden flex items-center gap-2 w-full">
                <div className="relative flex-[0.65] min-w-0">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center justify-between w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-yellow-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Menu size={14} className="shrink-0" />
                      <span className="truncate">{currentTabLabel}</span>
                      {unreadCount > 0 && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    </div>
                    <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            if (tab.id === 'chat') handleOpenChat();
                            else if (tab.id === 'offers') setIsOfferModalOpen(true);
                            else setActiveTab(tab.id as TabType);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-white/5 last:border-0 ${activeTab === tab.id ? "bg-yellow-400 text-slate-900" : "text-white hover:bg-white/5"}`}
                        >
                          <tab.icon size={14} />
                          <span className="flex-1 text-left">{tab.label}</span>
                          {tab.id === 'chat' && unreadCount > 0 && (
                            <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setIsClientModalOpen(true)} className="flex-[0.35] flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white active:scale-95 transition-all">
                  <User size={14} className="text-yellow-400" />
                  <span className="text-[9px] font-black uppercase italic tracking-tighter">Client Info</span>
                </button>
              </div>

              {!isMiniHeader && (
                <div className="hidden lg:flex items-center gap-4 lg:gap-8 shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-start lg:border-l lg:border-white/10 lg:pl-8">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Your Price</span>
                    <div className="flex items-center gap-2 text-yellow-400 font-black text-xl italic leading-none">
                      <Tag size={18} className="text-yellow-400/50" />
                      {contractorPrice ? `${Number(contractorPrice).toLocaleString()} €` : "— €"}
                    </div>
                  </div>
                  <div className="flex flex-col items-start border-l border-white/10 pl-8">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Client Profile</span>
                    <button onClick={() => setIsClientModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase italic tracking-wider transition-all">
                      <User size={14} className="text-yellow-400" /> Client Info
                    </button>
                  </div>
                  <div className="flex flex-col items-start border-l border-white/10 pl-8">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Start Date</span>
                    <div className="flex items-center gap-2 text-white font-black text-sm italic">
                      <Calendar size={16} className="text-yellow-400" />
                      {job?.started_at ? new Date(job.started_at).toLocaleDateString('en-GB') : (job?.status === 'pending' ? "PENDING" : new Date(job?.created_at).toLocaleDateString('en-GB'))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isMiniHeader && (
            <div className="hidden lg:flex border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'chat') handleOpenChat();
                    else if (tab.id === 'offers') setIsOfferModalOpen(true);
                    else setActiveTab(tab.id as TabType);
                  }}
                  className={`flex-1 flex items-center justify-center gap-3 py-5 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 group relative ${activeTab === tab.id && tab.id !== 'chat' && tab.id !== 'offers' ? "border-yellow-400 text-yellow-400 bg-white/5" : "border-transparent text-slate-500 hover:text-slate-200"}`}
                >
                  <tab.icon size={16} className="group-hover:scale-125 transition-transform" />
                  {tab.label}
                  {tab.id === 'chat' && unreadCount > 0 && (
                    <span className="absolute top-3 right-[15%] flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-in zoom-in duration-300">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6 md:py-10">
        <div className="min-h-[500px] md:min-h-[600px]">
          {activeTab === 'timeline' && <ProjectTimeline job={job} isAdmin={isAdmin} onUpdate={fetchProject} />}
          {activeTab === 'offers' && <ProjectOffers jobId={projectId} />}
          {activeTab === 'costs' && (
  <ProjectFinance 
    jobId={projectId}
    companyIban={job?.company_profiles?.iban || "IBAN not available"}
    originalQuote={job?.estimates?.[0]?.price || 0}
    estimatedPrice={estimatedPrice}
    totalWorkValue={totalWorkValue}
    paidSoFar={paidSoFar}
    remainingToPay={remainingToPay}
    payments={job?.payments || []}
    isAdmin={isAdmin} 
    onAddPayment={handleAddPayment} 
    onVoidPayment={(paymentId) => {
      setPaymentToVoid(paymentId);
    }}
  />
)}
          {(activeTab === 'images' || activeTab === 'documents') && (
            <ProjectMedia 
              activeTab={activeTab}
              job={job}
              isUploading={isUploading}
              imgInputRef={imgInputRef}
              docInputRef={docInputRef}
              setDeleteConfirm={setDeleteConfirm}
              getFileNameFromUrl={getFileNameFromUrl}
            />
          )}
          {activeTab === 'chat' && <ChatPlaceholder onOpen={handleOpenChat} status={job?.status} />}
        </div>
      </main>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
  const Icon = type === 'success' ? Check : AlertTriangle;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-10 duration-500 w-[90%] md:w-auto">
      <div className={`${bg} text-white px-6 md:px-8 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-md`}>
        <div className="bg-white/20 p-2 rounded-xl shrink-0"><Icon size={20} /></div>
        <span className="text-[10px] md:text-[11px] font-black uppercase italic tracking-widest flex-1">{message}</span>
        <button onClick={onClose} className="hover:rotate-90 transition-transform shrink-0"><X size={18} /></button>
      </div>
    </div>
  );
}

function ChatPlaceholder({ onOpen, status }: { onOpen: () => void, status: string }) {
  const isComp = status === 'completed';
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-12 bg-white rounded-[40px] border-2 border-slate-100 shadow-xl group hover:border-yellow-400 transition-all">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 md:mb-8 shadow-sm group-hover:scale-110 transition-transform">
        <MessageSquare size={40} className={isComp ? "text-slate-300" : "text-yellow-400"} />
      </div>
      <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 mb-4">{isComp ? "Archive" : "Project Chat"}</h2>
      <p className="max-w-md text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-loose mb-8 md:mb-10">
        {isComp ? "This project is archived. View the history of coordination." : "Direct communication line with your contractor for this specific project."}
      </p>
      <button 
        onClick={onOpen}
        className="px-10 md:px-12 py-4 md:py-5 bg-slate-900 text-yellow-400 rounded-2xl text-[10px] md:text-xs font-black uppercase italic hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
      >
        {isComp ? "Open Archive" : "Start Conversation"}
      </button>
    </div>
  );
}