"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Plus, 
  Loader2, 
  Trash2, 
  FileText, 
  Download, 
  ArrowUpDown, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  MoreVertical
} from "lucide-react";

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

const Skeleton = () => (
  <div className="animate-pulse bg-slate-200 rounded-[24px] w-full h-full" />
);

const MediaSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="aspect-square">
        <Skeleton />
      </div>
    ))}
  </div>
);

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
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const touchStart = useRef<number | null>(null);

  const sortMedia = useCallback((items: string[] | undefined) => {
    if (!items) return [];
    const sorted = [...items];
    return sortOrder === 'newest' ? sorted.reverse() : sorted;
  }, [sortOrder]);

  const sortedImages = sortMedia(job?.project_images);
  const sortedDocs = sortMedia(job?.documentation_urls);

  const handleImageLoad = (url: string) => {
    setLoadedImages(prev => ({ ...prev, [url]: true }));
  };

  const handleDownload = useCallback(async (url: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowMobileMenu(false);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getFileNameFromUrl(url);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  }, [getFileNameFromUrl]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % sortedImages.length);
      setShowMobileMenu(false);
    }
  }, [lightboxIndex, sortedImages.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + sortedImages.length) % sortedImages.length);
      setShowMobileMenu(false);
    }
  }, [lightboxIndex, sortedImages.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStart.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  if (loading) return <MediaSkeleton />;

  return (
    <>
      <div className="flex flex-row items-center justify-between mb-6 md:mb-8 md:bg-white md:p-6 md:rounded-[24px] md:border md:border-slate-200 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <h2 className="text-[12px] md:text-[14px] font-black uppercase text-slate-900 tracking-widest italic whitespace-nowrap">
            {activeTab === 'images' ? 'All Photos' : 'Documentation'}
          </h2>
          <button 
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 px-2.5 py-1.5 md:px-3 md:py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors shrink-0"
          >
            <ArrowUpDown size={12} className="text-slate-500" />
            <span className="text-[9px] font-black uppercase text-slate-500 hidden md:inline">
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </span>
            <span className="text-[9px] font-black uppercase text-slate-500 md:hidden">
              {sortOrder === 'newest' ? 'New' : 'Old'}
            </span>
          </button>
        </div>

        <button 
          onClick={() => activeTab === 'images' ? imgInputRef.current?.click() : docInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 md:px-6 md:py-3 bg-slate-900 text-yellow-400 rounded-xl md:rounded-xl text-[10px] md:text-[11px] font-black uppercase flex items-center justify-center gap-2 md:gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />} 
          <span className="hidden md:block">{activeTab === 'images' ? 'Add Photo' : 'Add Document'}</span>
        </button>
      </div>

      {activeTab === 'images' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2">
          {sortedImages.map((url: string, i: number) => (
            <div 
              key={i} 
              className="group relative aspect-square rounded-[24px] overflow-hidden border-2 border-white bg-white shadow-md cursor-pointer"
              onClick={() => setLightboxIndex(i)}
            >
              {!loadedImages[url] && <Skeleton />}
              <img 
                src={url} 
                alt="Progress" 
                onLoad={() => handleImageLoad(url)}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loadedImages[url] ? 'opacity-100' : 'opacity-0'}`} 
              />
              <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-[1px]">
                <Maximize2 size={24} className="text-white mb-2 scale-75 group-hover:scale-100 transition-transform" />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">View Photo</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 select-none touch-none"
          onClick={() => {
            setLightboxIndex(null);
            setShowMobileMenu(false);
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute top-6 right-6 flex items-center gap-3 z-[110]">
            <div className="relative">
              <button 
                className="md:hidden p-3 bg-white/10 text-white rounded-full active:scale-90 transition-transform"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowMobileMenu(!showMobileMenu); 
                }}
              >
                <MoreVertical size={20} />
              </button>

              {showMobileMenu && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={(e) => { e.stopPropagation(); setShowMobileMenu(false); }} />
                  <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-2xl py-2 w-48 animate-in zoom-in-95 md:hidden overflow-hidden" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => handleDownload(sortedImages[lightboxIndex], e)} className="w-full px-5 py-4 flex items-center gap-4 text-slate-700 active:bg-slate-100 transition-colors">
                      <Download size={20} className="text-slate-500" /> 
                      <span className="text-[11px] font-black uppercase tracking-tight">Download Photo</span>
                    </button>
                    <div className="h-[1px] bg-slate-100 mx-4" />
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ url: sortedImages[lightboxIndex], type: 'images' }); setLightboxIndex(null); setShowMobileMenu(false); }} className="w-full px-5 py-4 flex items-center gap-4 text-red-500 active:bg-red-50 transition-colors">
                      <Trash2 size={20} /> 
                      <span className="text-[11px] font-black uppercase tracking-tight">Delete Photo</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="hidden md:flex flex-col gap-4">
              <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full" onClick={() => setLightboxIndex(null)}><X size={24} /></button>
              <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full" onClick={(e) => handleDownload(sortedImages[lightboxIndex], e)}><Download size={24} /></button>
              <button className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full" onClick={() => { setDeleteConfirm({ url: sortedImages[lightboxIndex], type: 'images' }); setLightboxIndex(null); }}><Trash2 size={24} /></button>
            </div>
            <button className="md:hidden p-3 bg-white/10 text-white rounded-full" onClick={() => setLightboxIndex(null)}><X size={20} /></button>
          </div>

          <button className="absolute left-8 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full hidden md:block" onClick={handlePrev}><ChevronLeft size={32} /></button>
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={sortedImages[lightboxIndex]} 
              className="max-w-full max-h-[75vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-none animate-in fade-in duration-300"
              alt="Preview"
            />
          </div>
          <button className="absolute right-8 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full hidden md:block" onClick={handleNext}><ChevronRight size={32} /></button>

          <div className="absolute bottom-10 flex flex-col items-center gap-6">
             <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                <span className="text-white text-lg font-black tracking-[0.2em]">
                  {lightboxIndex + 1} <span className="text-white/30 mx-1">/</span> {sortedImages.length}
                </span>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2">
          {sortedDocs.map((url: string, i: number) => (
            <div key={i} className="flex items-center justify-between p-4 md:p-6 bg-white border border-slate-200 rounded-[24px] group transition-all hover:border-slate-300 shadow-sm">
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <div className="p-2 md:p-3 bg-slate-900 rounded-xl shrink-0">
                  <FileText size={20} className="text-yellow-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] md:text-[12px] font-black uppercase text-slate-900 tracking-tight leading-snug line-clamp-2 break-all">
                    {getFileNameFromUrl(url)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={(e) => handleDownload(url, e)} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"><Download size={18} /></button>
                <button onClick={() => setDeleteConfirm({ url, type: 'docs' })} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}