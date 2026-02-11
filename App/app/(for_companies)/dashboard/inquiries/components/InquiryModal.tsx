// File: InquiryModal.tsx
// Folder: app/dashboard/inquiries/components/

"use client";

import { X, FileText, Download, Upload, Check, AlertCircle, Loader2, CheckCircle2, ArrowRight, Mail, Phone } from "lucide-react";

interface InquiryModalProps {
  selectedInquiry: any;
  setSelectedInquiry: (val: any) => void;
  searchQuery: string;
  replyMessage: string;
  setReplyMessage: (val: string) => void;
  isSending: boolean;
  showSuccess: boolean;
  showError: boolean;
  errorMessage: string | null;
  replyFiles: File[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeReplyFile: (index: number) => void;
  initiateSendReply: () => void;
  getCleanFileName: (url: string) => string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  showConfirmModal: boolean;
  setShowConfirmModal: (val: boolean) => void;
  handleSendReply: () => void;
}

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => (
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-400/30 text-yellow-700 rounded-sm px-0.5 transition-colors">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </>
  );
};

export const InquiryModal = ({
  selectedInquiry,
  setSelectedInquiry,
  searchQuery,
  replyMessage,
  setReplyMessage,
  isSending,
  showSuccess,
  showError,
  errorMessage,
  replyFiles,
  handleFileChange,
  removeReplyFile,
  initiateSendReply,
  getCleanFileName,
  fileInputRef,
  showConfirmModal,
  setShowConfirmModal,
  handleSendReply
}: InquiryModalProps) => {
  if (!selectedInquiry) return null;

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)} />
      
      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] p-6 max-w-sm w-full relative z-10 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Mail className="text-yellow-600" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">Send Reply?</h3>
            <p className="text-slate-700 text-[11px] font-bold mb-6 leading-relaxed px-2 uppercase">Confirm that you want to send this response to the client.</p>
            <div className="flex flex-col gap-2">
              <button onClick={handleSendReply} className="w-full px-6 py-3.5 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 hover:text-slate-950 transition-all shadow-xl">Yes, Send Now</button>
              <button onClick={() => setShowConfirmModal(false)} className="w-full px-6 py-3.5 rounded-2xl bg-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-[40px] md:rounded-[40px] w-full max-w-2xl relative z-10 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">
        
        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600 mb-0.5 block">Message Center</span>
            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-none">Inquiry Detail</h3>
          </div>
          <button onClick={() => setSelectedInquiry(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 border border-slate-100 transition-colors">
            <X size={18} className="text-slate-900" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6 flex flex-col gap-4 custom-scrollbar bg-white">
          <div className="grid grid-cols-1 gap-3 shrink-0">
            <div className="bg-slate-50 p-4 md:p-5 rounded-3xl border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Inquiry Title</p>
                  <p className="text-[12px] md:text-[13px] font-black text-slate-900 uppercase italic leading-tight">
                    {selectedInquiry.title || "New Project Inquiry"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Client Name</p>
                  <p className="text-[12px] md:text-[13px] font-black text-slate-900 uppercase italic leading-tight">
                    <HighlightedText text={selectedInquiry.sender_name} highlight={searchQuery} />
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-5 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-600 truncate">{selectedInquiry.sender_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-600">{selectedInquiry.sender_phone}</span>
                </div>
              </div>
            </div>

            <div className="px-1 flex flex-col gap-2">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest italic">Original Message</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 leading-relaxed italic text-[12px]">
                "{selectedInquiry.message || "No message content."}"
              </div>

              {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedInquiry.attachments.map((file: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => handleDownload(file, getCleanFileName(file))}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors group"
                      >
                        <FileText size={12} className="text-slate-500" />
                        <span className="text-[9px] font-black uppercase text-slate-600">
                          {getCleanFileName(file)}
                        </span>
                        <Download size={10} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-1 mb-4 md:mb-0">
            {!selectedInquiry.is_answered ? (
              <div className="bg-slate-950 rounded-[28px] p-4 md:p-5 shadow-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Quick Response</p>
                  {(showError || errorMessage) && (
                    <span className="text-[9px] font-black uppercase text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} /> {errorMessage || "Required"}
                    </span>
                  )}
                </div>

                <textarea 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)} 
                  placeholder="Type message..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none resize-none text-white text-[12px] min-h-[44px] focus:border-yellow-400/50 transition-all custom-scrollbar placeholder:text-slate-600" 
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />

                {replyFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {replyFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <span className="text-[9px] font-bold text-slate-300 truncate max-w-[100px]">{file.name}</span>
                        <button onClick={() => removeReplyFile(index)} className="text-slate-500 hover:text-red-400"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <input type="file" id="reply-upload" multiple onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                  <label htmlFor="reply-upload" className="flex items-center justify-center p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:text-white cursor-pointer transition-colors text-slate-400">
                    <Upload size={16} />
                  </label>
                  
                  <button 
                    onClick={initiateSendReply} 
                    disabled={isSending || showSuccess} 
                    className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${showSuccess ? 'bg-green-500 text-white' : 'bg-yellow-400 text-slate-950 hover:bg-white'}`}
                  >
                    {isSending ? <Loader2 className="animate-spin" size={14} /> : showSuccess ? "Sent" : <>Send Reply <ArrowRight size={14} /></>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-[32px] p-6 border border-green-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                  <CheckCircle2 size={80} className="text-green-600" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500 p-1.5 rounded-full shadow-lg shadow-green-200">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-green-600">Response Sent</span>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-green-100 flex flex-col gap-3">
                    <p className="text-slate-900 text-[13px] font-medium leading-relaxed italic">
                      "{selectedInquiry.reply_message}"
                    </p>

                    {/* NOVO: Prikaz poslanih privitaka u odgovoru */}
                    {selectedInquiry.reply_attachments && selectedInquiry.reply_attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-green-100/50">
                        {selectedInquiry.reply_attachments.map((file: string, idx: number) => (
                          <button 
                            key={idx}
                            onClick={() => handleDownload(file, getCleanFileName(file))}
                            className="flex items-center gap-2 bg-green-100/50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition-colors group/file"
                          >
                            <FileText size={12} className="text-green-600" />
                            <span className="text-[9px] font-black uppercase text-green-700">
                              {getCleanFileName(file)}
                            </span>
                            <Download size={10} className="text-green-500 group-hover/file:translate-y-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 opacity-50">
                    <div className="h-[1px] flex-1 bg-green-200"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-green-700">Official Reply Record</span>
                    <div className="h-[1px] flex-1 bg-green-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};