import { FileText, Download } from "lucide-react";
import { Tooltip } from "@components/Tooltip";

interface MessageContentProps {
  text: string;
  messageSearchQuery: string;
  highlightText: (text: string, query: string) => React.ReactNode;
  forceDownload: (url: string, fileName: string) => void;
}

export const MessageContent = ({ text, messageSearchQuery, highlightText, forceDownload }: MessageContentProps) => {
  const isUrl = (t: string) => t.startsWith('http');
  const isImageFile = (url: string) => /\.(jpg|jpeg|png|webp|gif|avif)/i.test(url);

  if (isUrl(text)) {
    const displayName = text.split('/').pop()?.replace(/^\d+_/, '') || "Dokument";

    if (isImageFile(text)) {
      return (
        <div className="relative">
          <Tooltip content="View image" side="top">
            <div 
              className="relative group cursor-pointer hover:opacity-95 transition-all hover:scale-[1.01] active:scale-[0.98] w-full max-w-[150px] lg:max-w-[240px]" 
              onClick={() => window.open(text, '_blank')}
            >
              <img 
                src={text} 
                alt="Attachment" 
                className="rounded-2xl w-full h-auto max-h-[300px] object-cover border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl" />
            </div>
          </Tooltip>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-white rounded-xl border border-gray-100 shadow-sm group/file w-full max-w-[240px] lg:max-w-[400px] transition-all hover:scale-[1.02] hover:border-yellow-200">
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-yellow-500 text-black rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/file:rotate-3 shadow-sm">
          <FileText size={18} className="lg:hidden" />
          <FileText size={20} className="hidden lg:block" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-tight truncate leading-tight text-slate-900">{displayName}</p>
        </div>
        <div>
          <Tooltip content="Download file" side="top">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                forceDownload(text, displayName);
              }} 
              className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-all text-slate-400 hover:text-black hover:scale-110 active:scale-90"
            >
              <Download size={14} className="lg:hidden" />
              <Download size={16} className="hidden lg:block" />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pr-1 break-words text-[13px] lg:text-sm">
      {highlightText(text, messageSearchQuery)}
    </div>
  );
};