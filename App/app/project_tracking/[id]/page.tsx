"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import ProjectTimeline from "./components/ProjectTimeline";
import ProjectFinance from "./components/ProjectFinance";
import ProjectMedia from "./components/ProjectMedia";
import ProjectOffers from "./components/ProjectOffers";
import ChatModal from "../components/modals/ChatModal";
import { 
  FileText, ImageIcon, Loader2, ArrowLeft, CheckCircle2, 
  AlertTriangle, HardHat, Calendar, MessageSquare, X, Check,
  Wallet, Receipt, ChevronDown
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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ url: string, type: 'docs' | 'images' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company_profiles (company_name),
          payments (id, amount, payment_date, description, created_at)
        `)
        .eq('id', projectId)
        .single();
      
      if (error) console.error("Error fetching project:", error.message);
      if (data) setJob(data);
      setLoading(false);
    };
    fetchProject();
  }, [projectId, supabase]);

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

      {uploadError && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-8 zoom-in-95 duration-300 ease-out">
          <div className="bg-red-600 text-white px-8 py-4 rounded-[20px] shadow-[0_20px_50px_rgba(220,38,38,0.3)] flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="bg-white/20 p-2 rounded-lg"><AlertTriangle size={20} className="text-white" /></div>
            <span className="text-[12px] font-black uppercase tracking-wider">{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-8 zoom-in-95 duration-300 ease-out">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-[20px] shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="bg-white/20 p-2 rounded-lg"><Check size={20} className="text-white" /></div>
            <span className="text-[12px] font-black uppercase tracking-wider">{deleteSuccess}</span>
            <button onClick={() => setDeleteSuccess(null)} className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
          </div>
        </div>
      )}

      {isChatOpen && (
        <ChatModal 
          job={job} 
          onClose={() => setIsChatOpen(false)} 
          isReadOnly={job?.status === 'completed'} 
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-sm font-black uppercase text-slate-900 mb-2 italic">Confirm Deletion</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed mb-6">This action is permanent.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-transform">Cancel</button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center hover:scale-105 transition-transform">
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="py-4 lg:py-6 flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => router.push('/project_tracking')}
              className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-white/5 text-white rounded-xl lg:rounded-2xl hover:bg-yellow-400 hover:text-slate-900 transition-all border border-white/5 shrink-0 hover:scale-110"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between min-w-0 gap-1 lg:gap-4">
             <div className="min-w-0 flex-1">
  <h1 className="text-lg md:text-4xl font-black text-white uppercase italic leading-tight tracking-tighter lg:mb-0">
    {job?.title || job?.project_type}
  </h1>
  
  <div className="flex lg:hidden items-center gap-x-3 mt-1 flex-wrap">
    <div className="flex items-center gap-1 min-w-0">
      <HardHat size={10} className="text-yellow-400 shrink-0" />
      <span className="text-[9px] font-black uppercase text-slate-400 truncate">
        {job?.company_profiles?.company_name || "N/A"}
      </span>
    </div>
    <div className="flex items-center gap-1 shrink-0 border-l border-white/10 pl-3">
      <Calendar size={10} className="text-yellow-400 shrink-0" />
      <span className="text-[9px] font-black uppercase text-slate-400">
        {job?.created_at ? new Date(job.created_at).toLocaleDateString('en-GB') : "N/A"}
      </span>
    </div>
  </div>
</div>

              {job?.status === 'completed' && (
                <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full shrink-0">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Completed Project</span>
                </div>
              )}

              <div className="hidden lg:flex items-center gap-6 shrink-0">
                <div className="flex flex-col items-end border-l border-white/10 pl-6 first:border-none first:pl-0">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Contractor</span>
                  <div className="flex items-center gap-2">
                    <HardHat size={16} className="text-yellow-400" />
                    <span className="text-[14px] font-black uppercase text-white truncate max-w-[150px]">
                      {job?.company_profiles?.company_name || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end border-l border-white/10 pl-6">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Started on</span>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-yellow-400" />
                    <span className="text-[14px] font-black uppercase text-white">
                      {job?.created_at ? new Date(job.created_at).toLocaleDateString('en-GB') : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILNI DROPDOWN IZBORNIK */}
          <div className="lg:hidden pb-4">
            <div className="relative">
              <select 
                value={activeTab}
                onChange={(e) => {
                  const val = e.target.value as TabType;
                  if (val === 'chat') {
                    setIsChatOpen(true);
                  } else {
                    setActiveTab(val);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-yellow-400/50"
              >
                {tabs.map(tab => (
                  <option key={tab.id} value={tab.id} className="bg-slate-900 text-white">
                    {tab.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 pointer-events-none" />
            </div>
          </div>

          {/* DESKTOP TABOVI - NETAKNUTI */}
          <div className="hidden lg:flex border-t border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.id === 'chat' ? setIsChatOpen(true) : setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-wider transition-all border-b-2 group hover:bg-white/5 ${
                  activeTab === tab.id && tab.id !== 'chat'
                  ? "border-yellow-400 text-yellow-400 bg-white/5" 
                  : "border-transparent text-slate-500 hover:text-slate-200"
                }`}
              >
                <tab.icon size={14} className="group-hover:scale-110 transition-transform" />
                <span className="group-hover:scale-110 group-hover:ml-1 transition-all duration-200">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {activeTab === 'timeline' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProjectTimeline job={job} />
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProjectOffers jobId={projectId} />
          </div>
        )}

        {activeTab === 'costs' && (
          <ProjectFinance 
            estimatedPrice={estimatedPrice}
            totalWorkValue={totalWorkValue}
            paidSoFar={paidSoFar}
            remainingToPay={remainingToPay}
            payments={job?.payments || []}
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

        {activeTab === 'chat' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={`bg-white rounded-[40px] border-2 p-16 text-center border-dashed transition-all group ${
              job?.status === 'completed' 
                ? "border-slate-200 hover:border-slate-400 hover:bg-slate-50" 
                : "border-slate-200 hover:border-yellow-400 hover:bg-yellow-50/30"
            }`}>
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all">
                {job?.status === 'completed' ? (
                  <FileText size={40} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                ) : (
                  <MessageSquare size={40} className="text-slate-300 group-hover:text-yellow-400 transition-colors" />
                )}
              </div>
              <h2 className="text-xl font-black uppercase italic text-slate-900">
                {job?.status === 'completed' ? "Chat History" : "Project Chat"}
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 mb-6">
                {job?.status === 'completed' 
                  ? "This project is archived. You can view all past messages." 
                  : "Real-time coordination with your contractor"}
              </p>
              <button 
                onClick={() => setIsChatOpen(true)}
                className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase hover:scale-110 active:scale-95 transition-all shadow-xl ${
                  job?.status === 'completed' ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-slate-900 text-yellow-400"
                }`}
              >
                {job?.status === 'completed' ? "View Chat Archive" : "Open Chat"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}