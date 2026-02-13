"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// Components
import ProjectTimeline from "./components/ProjectTimeline";
import ProjectFinance from "./components/ProjectFinance";
import ProjectMedia from "./components/ProjectMedia";
import ProjectOffers from "./components/ProjectOffers";
import ChatModal from "../components/modals/ChatModal";
import ProjectInfoModal from "./components/ProjectInfoModal";
import CompanyInfoModal from "../../_components/CompanyInfoModal";
import ReviewsModal from "./components/ReviewsModal";

import { 
  FileText, ImageIcon, Loader2, ArrowLeft, CheckCircle2, 
  AlertTriangle, HardHat, Calendar, MessageSquare, X, Check,
  Wallet, Receipt, ChevronDown, Info, Star
} from "lucide-react";

type TabType = 'timeline' | 'costs' | 'images' | 'documents' | 'chat' | 'offers';

function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="bg-slate-900 h-[200px] w-full" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-[32px] h-[400px] border-2 border-slate-100" />
          </div>
          <div className="bg-white rounded-[32px] h-[300px] border-2 border-slate-100" />
        </div>
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ url: string, type: 'docs' | 'images' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // Funkcija za dohvaćanje podataka umotana u useCallback radi stabilnosti
  const fetchProject = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company_profiles (*),
        payments (id, amount, payment_date, description, created_at),
        project_items (*)
      `)
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error("Error fetching project:", error.message);
    } else if (data) {
      setJob(data);
      if (user && data.contractor_id === user.id) {
        setIsAdmin(true);
      }
    }
    setLoading(false);
  }, [projectId, supabase]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const getBackUrl = () => {
    if (!job) return '/project_tracking';
    if (job.status === 'pending') return '/project_tracking?tab=estimates';
    if (job.status === 'completed') return '/project_tracking?tab=completed';
    return '/project_tracking?tab=active';
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const fileName = parts[parts.length - 1];
      return fileName.includes('_') ? fileName.split('_').slice(1).join('_') : fileName;
    } catch { return "Document"; }
  };

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
      if (e.target) e.target.value = '';
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
      console.error(err);
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
      setDeleteSuccess(`${isDoc ? 'Document' : 'Photo'} deleted successfully`);
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
    <div className="h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto bg-slate-50 pb-20 text-slate-900">
      <input type="file" ref={docInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'docs')} accept=".pdf,.doc,.docx" />
      <input type="file" ref={imgInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'images')} accept="image/*" />

      {/* Obavijesti i Modali ostaju isti... */}

      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="py-4 lg:py-6 flex items-center gap-4 lg:gap-6">
            <button onClick={() => router.push(getBackUrl())} className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-white/5 text-white rounded-xl lg:rounded-2xl hover:bg-yellow-400 hover:text-slate-900 transition-all shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between min-w-0 gap-1 lg:gap-4">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <h1 className="text-lg md:text-4xl font-black text-white uppercase italic tracking-tighter truncate">
                  {job?.title || job?.project_type}
                </h1>
                <button onClick={() => setIsInfoOpen(true)} className="p-2 bg-white/10 text-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-slate-900 transition-all">
                  <Info size={18} className="lg:w-8 lg:h-8" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex border-t border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.id === 'chat' ? setIsChatOpen(true) : setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id && tab.id !== 'chat' ? "border-yellow-400 text-yellow-400 bg-white/5" : "border-transparent text-slate-500"
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {activeTab === 'timeline' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* OVDJE ĆE TI JAVITI GREŠKU ZA onUpdate AKO INTERFACE NIJE SPREMAN */}
            <ProjectTimeline job={job} isAdmin={isAdmin} onUpdate={fetchProject} />
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* OVDJE ĆE TI JAVITI GREŠKU ZA jobId i onPaymentAdded AKO INTERFACE NIJE SPREMAN */}
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

        {activeTab === 'offers' && <ProjectOffers jobId={projectId} />}
        
        {(activeTab === 'images' || activeTab === 'documents') && (
          <ProjectMedia 
            activeTab={activeTab} job={job} isUploading={isUploading}
            imgInputRef={imgInputRef} docInputRef={docInputRef}
            setDeleteConfirm={setDeleteConfirm} getFileNameFromUrl={getFileNameFromUrl}
          />
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-[40px] border-2 p-16 text-center border-dashed border-slate-200">
            <MessageSquare size={40} className="text-slate-300 mx-auto mb-6" />
            <button onClick={() => setIsChatOpen(true)} className="px-8 py-4 bg-slate-900 text-yellow-400 rounded-2xl text-[12px] font-black uppercase">
              Open Chat
            </button>
          </div>
        )}
      </main>
    </div>
  );
}