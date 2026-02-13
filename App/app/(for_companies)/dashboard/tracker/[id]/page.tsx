"use client";
// Dodaj useCallback ovdje:
import { useState, useEffect, use, useRef, useMemo, useCallback } from "react"; 

// ... ostali importi
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Tooltip } from "@components/Tooltip";

// Components (Pretpostavljam da postoje na ovim putanjama)
import ProjectTimeline from "@/app/project_tracking/[id]/components/ProjectTimeline";
import ProjectFinance from "@/app/project_tracking/[id]/components/ProjectFinance";
import ProjectMedia from "@/app/project_tracking/[id]/components/ProjectMedia";
import ProjectOffers from "@/app/project_tracking/[id]/components/ProjectOffers";
import ChatModal from "@/app/project_tracking/components/modals/ChatModal";
import ProjectInfoModal from "@/app/project_tracking/[id]/components/ProjectInfoModal";
import CompanyInfoModal from "@/app/_components/CompanyInfoModal";
import ReviewsModal from "@/app/find_service/components/reviewsModal";

import { 
  FileText, ImageIcon, Loader2, ArrowLeft, CheckCircle2, 
  AlertTriangle, HardHat, Calendar, MessageSquare, X, Check,
  Wallet, Receipt, ChevronDown, Info, Star, Smartphone
} from "lucide-react";

type TabType = 'timeline' | 'costs' | 'images' | 'documents' | 'chat' | 'offers';

// --- SKELETON: Prevencija Layout Shifta (Norman's Feedback) ---
function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="bg-slate-900 h-[180px] lg:h-[240px] w-full" />
      <main className="max-w-[1440px] mx-auto px-6 -mt-10">
        <div className="bg-white rounded-[40px] h-[600px] border-2 border-slate-100 shadow-xl" />
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

  // State Management
  const [job, setJob] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ url: string, type: 'docs' | 'images' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  
  // Modals State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // --- CRUD: Read (Ispravljeno za project_items i stabilnost) ---
  const fetchProject = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company_profiles (*),
        client_profiles (full_name, email, phone),
        payments (id, amount, payment_date, description, created_at),
        project_items (*)
      `)
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error("Error fetching project:", error.message);
    } else {
      setJob(data);
      if (currentUser && data.contractor_id === currentUser.id) {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // --- UX Helperi ---
  const getBackUrl = () => {
    if (!job) return '/dashboard/tracker';
    if (job.status === 'completed') return '/dashboard/tracker?tab=completed';
    return '/dashboard/tracker?tab=active';
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const fileName = parts[parts.length - 1];
      return fileName.includes('_') ? fileName.split('_').slice(1).join('_') : fileName;
    } catch { return "Document"; }
  };

  // --- CRUD: Update (File Upload) ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'docs' | 'images') => {
    const files = e.target.files;
    if (!files || files.length === 0 || !job) return;
    
    const file = files[0];
    const isDoc = type === 'docs';
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const column = isDoc ? 'documentation_urls' : 'project_images';
    
    const fileExists = (job[column] || []).some((url: string) => 
      getFileNameFromUrl(url).toLowerCase() === cleanName.toLowerCase()
    );

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

  // --- CRUD: Delete ---
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  if (loading) return <ProjectSkeleton />;

  const totalWorkValue = job?.project_items?.reduce((acc: number, item: any) => acc + (Number(item.price) || 0), 0) || 0;
  const paidSoFar = Number(job?.paid_so_far) || 0;
  const estimatedPrice = Number(job?.estimated_price) || 0;
  const remainingToPay = totalWorkValue - paidSoFar;

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'costs', label: 'Costs & Payments', icon: Wallet },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'offers', label: 'Offers', icon: Receipt }
  ];

  return (
    <div className="h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto bg-slate-50 pb-20 text-slate-900 scroll-smooth">
      {/* Hidden Inputs */}
      <input type="file" ref={docInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'docs')} accept=".pdf,.doc,.docx" />
      <input type="file" ref={imgInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'images')} accept="image/*" />

      {/* Notifications */}
      {uploadError && <Toast message={uploadError} type="error" onClose={() => setUploadError(null)} />}
      {deleteSuccess && <Toast message={deleteSuccess} type="success" onClose={() => setDeleteSuccess(null)} />}

      {/* Modals */}
      {isChatOpen && <ChatModal job={job} onClose={() => setIsChatOpen(false)} isReadOnly={job?.status === 'completed'} />}
      {isInfoOpen && <ProjectInfoModal job={job} onClose={() => setIsInfoOpen(false)} onViewReviews={() => setIsReviewsOpen(true)} />}
      {isCompanyOpen && job?.company_profiles && <CompanyInfoModal isOpen={isCompanyOpen} company={job.company_profiles} onClose={() => setIsCompanyOpen(false)} />}
      {isReviewsOpen && <ReviewsModal isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} contractorName={job?.company_profiles?.company_name || "Contractor"} contractorId={job?.contractor_id} supabase={supabase} />}

      {/* DELETE CONFIRMATION */}
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

      {/* HEADER SECTION */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="py-6 flex items-center gap-6">
            <button 
              onClick={() => router.push(getBackUrl())}
              className="flex items-center justify-center w-12 h-12 bg-white/5 text-white rounded-2xl hover:bg-yellow-400 hover:text-slate-900 transition-all border border-white/5 shrink-0 active:scale-90"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between min-w-0 gap-4">
              <div className="min-w-0 flex-1 flex items-center gap-4">
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic leading-none tracking-tighter break-words overflow-visible">
                  {job?.title || job?.project_type}
                </h1>
                <button 
                  onClick={() => setIsInfoOpen(true)}
                  className="p-2.5 bg-white/10 text-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-slate-900 transition-all"
                >
                  <Info size={20} />
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-8 shrink-0">
                <div className="flex flex-col items-start border-l border-white/10 pl-8">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Client</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black uppercase text-white leading-none">
                      {job?.client_profiles?.full_name || "N/A"}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <a href={`mailto:${job?.client_profiles?.email}`} className="text-[10px] font-bold text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1">
                        <span className="opacity-50">@</span> {job?.client_profiles?.email || "No Email"}
                      </a>
                      <a href={`tel:${job?.client_profiles?.phone}`} className="text-[10px] font-bold text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1">
                        <Smartphone size={10} className="text-yellow-400" /> {job?.client_profiles?.phone || "No Phone"}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start border-l border-white/10 pl-8">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Start Date</span>
                  <div className="flex items-center gap-2 text-white font-black text-sm italic">
                    <Calendar size={16} className="text-yellow-400" />
                    {job?.started_at 
                      ? new Date(job.started_at).toLocaleDateString('en-GB') 
                      : (job?.status === 'pending' ? "PENDING" : new Date(job?.created_at).toLocaleDateString('en-GB'))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex border-t border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.id === 'chat' ? setIsChatOpen(true) : setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-3 py-5 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 group ${
                  activeTab === tab.id && tab.id !== 'chat'
                  ? "border-yellow-400 text-yellow-400 bg-white/5" 
                  : "border-transparent text-slate-500 hover:text-slate-200"
                }`}
              >
                <tab.icon size={16} className="group-hover:scale-125 transition-transform" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1440px] mx-auto px-4 lg:px-10 py-10">
        <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-xl shadow-slate-200/50 p-6 lg:p-10 min-h-[600px]">
          {activeTab === 'timeline' && <ProjectTimeline job={job} isAdmin={isAdmin} onUpdate={fetchProject} />}
          {activeTab === 'offers' && <ProjectOffers jobId={projectId} />}
          {activeTab === 'costs' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProjectFinance 
                jobId={projectId}
                estimatedPrice={estimatedPrice}
                totalWorkValue={totalWorkValue}
                paidSoFar={paidSoFar}
                remainingToPay={remainingToPay}
                payments={job?.payments || []}
                canManage={isAdmin}
                onPaymentAdded={fetchProject}
              />
            </div>
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
          {activeTab === 'chat' && <ChatPlaceholder onOpen={() => setIsChatOpen(true)} status={job?.status} />}
        </div>
      </main>
    </div>
  );
}

// --- UX Components ---

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
  const Icon = type === 'success' ? Check : AlertTriangle;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-10 duration-500">
      <div className={`${bg} text-white px-8 py-4 rounded-[24px] shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-md`}>
        <div className="bg-white/20 p-2 rounded-xl"><Icon size={20} /></div>
        <span className="text-[11px] font-black uppercase italic tracking-widest">{message}</span>
        <button onClick={onClose} className="ml-4 hover:rotate-90 transition-transform"><X size={18} /></button>
      </div>
    </div>
  );
}

function ChatPlaceholder({ onOpen, status }: { onOpen: () => void, status: string }) {
  const isComp = status === 'completed';
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 group hover:border-yellow-400 transition-all">
      <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
        <MessageSquare size={48} className={isComp ? "text-slate-300" : "text-yellow-400"} />
      </div>
      <h2 className="text-3xl font-black uppercase italic text-slate-900 mb-4">{isComp ? "Archive" : "Project Chat"}</h2>
      <p className="max-w-md text-slate-400 text-xs font-bold uppercase tracking-widest leading-loose mb-10">
        {isComp ? "This project is archived. View the history of coordination." : "Direct communication line with your contractor for this specific project."}
      </p>
      <button 
        onClick={onOpen}
        className="px-12 py-5 bg-slate-900 text-yellow-400 rounded-2xl text-xs font-black uppercase italic hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
      >
        {isComp ? "Open Archive" : "Start Conversation"}
      </button>
    </div>
  );
}