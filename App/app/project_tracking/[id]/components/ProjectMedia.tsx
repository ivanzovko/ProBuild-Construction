"use client";

import { Plus, Loader2, ExternalLink, Trash2, FileText, Download } from "lucide-react";

interface ProjectMediaProps {
  activeTab: 'images' | 'documents';
  job: any;
  isUploading: boolean;
  imgInputRef: React.RefObject<HTMLInputElement | null>;
  docInputRef: React.RefObject<HTMLInputElement | null>;
  setDeleteConfirm: (data: { url: string, type: 'docs' | 'images' } | null) => void;
  getFileNameFromUrl: (url: string) => string;
  loading?: boolean;
}

function MediaSkeleton({ type }: { type: 'images' | 'documents' }) {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-[24px] border border-slate-100">
        <div className="h-4 w-24 bg-slate-100 rounded" />
        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
      </div>

      {type === 'images' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square rounded-[24px] bg-slate-100 border-2 border-white" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-slate-100 rounded-[24px] p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectMedia({
  activeTab,
  job,
  isUploading,
  imgInputRef,
  docInputRef,
  setDeleteConfirm,
  getFileNameFromUrl,
  loading = false
}: ProjectMediaProps) {
  if (loading) {
    return <MediaSkeleton type={activeTab} />;
  }

  return (
    <>
      {activeTab === 'images' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-center mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-[24px] border border-slate-200">
            <h2 className="text-[12px] md:text-[14px] font-black uppercase text-slate-900 tracking-widest italic">All Photos</h2>
            <button 
              onClick={() => imgInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 md:px-6 md:py-3 bg-slate-900 text-yellow-400 rounded-xl text-[10px] md:text-[11px] font-black uppercase flex items-center gap-2 md:gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
              <span>Add Photo</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {job?.project_images?.map((url: string, i: number) => (
              <div key={i} className="group relative aspect-square rounded-[24px] overflow-hidden border-2 border-white bg-white shadow-md md:hover:scale-105 transition-all duration-300">
                <img src={url} alt="Progress" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 md:bg-slate-900/70 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[1px] md:backdrop-blur-[2px]">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 md:p-2.5 bg-white rounded-xl text-slate-900 hover:scale-110 transition-transform">
                      <ExternalLink size={18} />
                    </a>
                    <button onClick={() => setDeleteConfirm({ url, type: 'images' })} className="p-2 md:p-2.5 bg-red-500 rounded-xl text-white hover:scale-110 transition-transform">
                      <Trash2 size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-center mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-[24px] border border-slate-200">
            <h2 className="text-[12px] md:text-[14px] font-black uppercase text-slate-900 tracking-widest italic">Documentation</h2>
            <button 
              onClick={() => docInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 md:px-6 md:py-3 bg-slate-900 text-yellow-400 rounded-xl text-[10px] md:text-[11px] font-black uppercase flex items-center gap-2 md:gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
              <span className="hidden md:inline">Add Document</span>
              <span className="md:hidden">Add</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {job?.documentation_urls?.map((url: string, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 md:p-6 bg-white border border-slate-200 rounded-[24px] group md:hover:border-yellow-400 md:hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="p-2 md:p-3 bg-slate-900 rounded-xl shadow-lg shrink-0">
                    <FileText size={20} className="text-yellow-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] md:text-[12px] font-black uppercase text-slate-900 truncate tracking-tight">
                      {getFileNameFromUrl(url)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 md:p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                    <Download size={18} />
                  </a>
                  <button onClick={() => setDeleteConfirm({ url, type: 'docs' })} className="p-2 md:p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}