"use client";

import { X, FileText, Download, Upload, Check, AlertCircle, Loader2, CheckCircle2, ArrowRight, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@components/Tooltip";

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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
        onClick={() => setSelectedInquiry(null)} 
      />
      
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md" 
              onClick={() => setShowConfirmModal(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} 
              className="bg-white rounded-[32px] p-6 max-w-sm w-full relative z-10 shadow-2xl border border-slate-200 text-center"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Mail className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">Send Reply?</h3>
              <p className="text-slate-700 text-[11px] font-bold mb-6 leading-relaxed px-2 uppercase">Confirm that you want to send this response to the client.</p>
              <div className="flex flex-col gap-2">
                <button onClick={handleSendReply} className="w-full px-6 py-3.5 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500 hover:text-slate-950 transition-all shadow-xl active:scale-95">Yes, Send Now</button>
                <button onClick={() => setShowConfirmModal(false)} className="w-full px-6 py-3.5 rounded-2xl bg-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 transition-all active:scale-95">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-t-[40px] md:rounded-[40px] w-full max-w-2xl relative z-10 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]"
      >
        
        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600 mb-0.5 block">Message Center</span>
            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-none">Inquiry Detail</h3>
          </div>
          <Tooltip content="Close details" side="left">
            <button onClick={() => setSelectedInquiry(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 border border-slate-100 transition-all active:scale-90">
              <X size={18} />
            </button>
          </Tooltip>
        </div>

        <div className="overflow-y-auto p-4 md:p-6 flex flex-col gap-4 custom-scrollbar bg-white">
          <div className="grid grid-cols-1 gap-3 shrink-0">
            <div className="bg-slate-50 p-4 md:p-5 rounded-3xl border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Inquiry Title</p>
                  <p className="text-[12px] md:text-[13px] font-black text-slate-950 uppercase italic leading-tight">
                    {selectedInquiry.title || "New Project Inquiry"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest">Client Name</p>
                  <p className="text-[12px] md:text-[13px] font-black text-slate-950 uppercase italic leading-tight">
                    <HighlightedText text={selectedInquiry.sender_name} highlight={searchQuery} />
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-5 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2 group/info cursor-pointer">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-100 group-hover:border-yellow-400 transition-colors">
                    <Mail size={12} className="text-yellow-500" />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 truncate">{selectedInquiry.sender_email}</span>
                </div>
                <div className="flex items-center gap-2 group/info cursor-pointer">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-100 group-hover:border-yellow-400 transition-colors">
                    <Phone size={12} className="text-yellow-500" />
                  </div>
                  <span className="text-[11px] font-black text-slate-700">{selectedInquiry.sender_phone}</span>
                </div>
              </div>
            </div>

            <div className="px-1 flex flex-col gap-2">
              <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-widest italic">Original Message</p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed italic text-[12px] relative">
                <div className="absolute top-3 right-3 opacity-20 italic font-black text-[20px] text-slate-300">"</div>
                "{selectedInquiry.message || "No message content."}"
              </div>

              {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedInquiry.attachments.map((file: string, idx: number) => (
                      <Tooltip key={idx} content="Download attachment" side="top">
                        <button 
                          onClick={() => handleDownload(file, getCleanFileName(file))}
                          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all group active:scale-95 shadow-sm"
                        >
                          <FileText size={14} className="text-slate-400 group-hover:text-yellow-500" />
                          <span className="text-[9px] font-black uppercase text-slate-600">
                            {getCleanFileName(file)}
                          </span>
                          <Download size={12} className="text-slate-300 group-hover:translate-y-0.5 transition-transform" />
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-1 mb-4 md:mb-0">
            {!selectedInquiry.is_answered ? (
              <div className="bg-slate-950 rounded-[32px] p-4 md:p-6 shadow-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Quick Response</p>
                  <AnimatePresence>
                    {(showError || errorMessage) && (
                      <motion.span 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[9px] font-black uppercase text-red-400 flex items-center gap-1"
                      >
                        <AlertCircle size={12} /> {errorMessage || "Required"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <textarea 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)} 
                  placeholder="Type your response here..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 outline-none resize-none text-white text-[13px] min-h-[100px] focus:border-yellow-400 transition-all custom-scrollbar placeholder:text-slate-600" 
                  rows={3}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.max(100, target.scrollHeight)}px`;
                  }}
                />

                {replyFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {replyFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-xl">
                        <FileText size={12} className="text-yellow-500" />
                        <span className="text-[9px] font-bold text-slate-300 truncate max-w-[120px]">{file.name}</span>
                        <button onClick={() => removeReplyFile(index)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-5">
                  <input type="file" id="reply-upload" multiple onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                  <Tooltip content="Attach files" side="top">
                    <label htmlFor="reply-upload" className="flex items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:text-white hover:border-slate-600 cursor-pointer transition-all text-slate-400 active:scale-95">
                      <Upload size={18} />
                    </label>
                  </Tooltip>
                  
                  <Tooltip content="Review and send response" side="top">
                    <button 
                      onClick={initiateSendReply} 
                      disabled={isSending || showSuccess} 
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                        showSuccess 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-400 text-slate-950 hover:bg-white hover:shadow-yellow-400/20'
                      }`}
                    >
                      {isSending ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : showSuccess ? (
                        <Check size={16} strokeWidth={3} />
                      ) : (
                        <>Send Reply <ArrowRight size={16} /></>
                      )}
                    </button>
                  </Tooltip>
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
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-green-100 flex flex-col gap-4">
                    <p className="text-slate-900 text-[13px] font-medium leading-relaxed italic">
                      "{selectedInquiry.reply_message}"
                    </p>

                    {selectedInquiry.reply_attachments && selectedInquiry.reply_attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-green-100/50">
                        {selectedInquiry.reply_attachments.map((file: string, idx: number) => (
                          <Tooltip key={idx} content="Download sent attachment" side="top">
                            <button 
                              onClick={() => handleDownload(file, getCleanFileName(file))}
                              className="flex items-center gap-2 bg-green-100/50 hover:bg-green-100 border border-green-200 px-3 py-2 rounded-xl transition-all group/file active:scale-95"
                            >
                              <FileText size={14} className="text-green-600" />
                              <span className="text-[9px] font-black uppercase text-green-700">
                                {getCleanFileName(file)}
                              </span>
                              <Download size={12} className="text-green-500 group-hover/file:translate-y-0.5 transition-transform" />
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-5 flex items-center gap-2 opacity-50">
                    <div className="h-[1px] flex-1 bg-green-200"></div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-green-700">Official Reply Record</span>
                    <div className="h-[1px] flex-1 bg-green-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};