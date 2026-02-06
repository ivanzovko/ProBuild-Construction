"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { X, Send, Paperclip, Loader2, CheckCircle2, AlertCircle, Trash2, HelpCircle, Mail } from "lucide-react";

interface InquiryModalProps {
  company: any;
  onClose: () => void;
}

export default function InquiryModal({ company, onClose }: InquiryModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const isFieldValid = (name: string) => {
    const val = formData[name as keyof typeof formData];
    if (!val) return false;
    switch (name) {
      case 'name': return val.length >= 3;
      case 'email': return /^\S+@\S+\.\S+$/.test(val);
      case 'phone': return val.length >= 6;
      case 'message': return val.length >= 10;
      default: return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+]/g, "");
    setFormData(prev => ({ ...prev, phone: value }));
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const validateForm = (data: typeof formData) => {
    const newErrors: Record<string, string> = {};
    if (!isFieldValid('name')) newErrors.name = "Short";
    if (!isFieldValid('email')) newErrors.email = "Invalid";
    if (!isFieldValid('phone')) newErrors.phone = "Required";
    if (!isFieldValid('message')) newErrors.message = "Short";
    return newErrors;
  };

  const triggerConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setShowConfirm(true);
  };

  const handleInquirySubmit = async () => {
    setShowConfirm(false);
    setIsSending(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('inquiry-attachments').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('inquiry-attachments').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      const { error: insertError } = await supabase.from("inquiries").insert({
        company_id: company.id,
        sender_name: formData.name,
        sender_email: formData.email,
        sender_phone: formData.phone,
        message: formData.message,
        attachments: uploadedUrls 
      });

      if (insertError) throw insertError;
      setIsSuccess(true);
      setTimeout(() => onClose(), 3000);
    } catch (error: any) {
      setErrors({ form: "Error sending." });
      setShowConfirm(false);
    } finally {
      setIsSending(false);
    }
  };

  const inputClasses = (name: string) => {
    const valid = isFieldValid(name);
    const hasError = !!errors[name];
    
    return `
      w-full px-3 py-2 sm:px-4 sm:py-2.5
      bg-white border-[1.5px] transition-all duration-200
      ${hasError ? 'border-red-500 ring-2 ring-red-500/10' : valid ? 'border-green-500 ring-2 ring-green-500/5' : 'border-slate-800'} 
      focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 
      rounded-lg sm:rounded-xl outline-none font-bold text-[11px] sm:text-[13px] text-slate-900
      placeholder:text-slate-400
    `;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-500 pt-[10px] sm:pt-[60px]">
      <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-[98%] sm:w-full ${isSuccess || showConfirm ? 'max-w-md' : 'max-w-4xl'} bg-[#1a1c20] rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[95vh] sm:max-h-[calc(100vh-100px)] border border-white/5 transition-all duration-300`}>
        
        {isSuccess && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-3xl flex items-center justify-center animate-bounce shadow-lg shadow-green-500/20">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-white uppercase italic text-xl sm:text-2xl">Sent Successfully!</h3>
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Mail size={14} />
                <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-widest">Check your email soon</p>
              </div>
            </div>
          </div>
        )}

        {showConfirm && !isSuccess && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl">
              <HelpCircle size={24} className="text-black" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-white uppercase italic text-sm sm:text-xl">Ready to send?</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">To: <span className="text-white">{company.company_name}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase border border-white/10 text-white order-2 sm:order-1 hover:bg-white/5 transition-colors">Back</button>
              <button onClick={handleInquirySubmit} className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 order-1 sm:order-2">Confirm</button>
            </div>
          </div>
        )}

        <div className={(showConfirm || isSuccess) ? "hidden" : "contents"}>
          <div className="px-5 py-3 sm:px-8 sm:py-5 flex items-center justify-between bg-[#1a1c20] border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-lg sm:rounded-xl flex items-center justify-center rotate-3">
                <Send size={14} className="text-black" />
              </div>
              <div>
                <h2 className="font-black uppercase text-[10px] sm:text-sm italic text-white leading-none">Send <span className="text-yellow-400">Inquiry</span></h2>
                <p className="text-[8px] font-bold uppercase text-slate-500 mt-1 truncate max-w-[120px] sm:max-w-none">To: {company.company_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={16} className="text-slate-500" /></button>
          </div>

          <form ref={formRef} onSubmit={triggerConfirm} className="p-4 sm:p-8 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] sm:text-[11px] font-black uppercase text-slate-400 ml-1">Full Name *</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Your name" maxLength={70} className={inputClasses('name')} />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[11px] font-black uppercase text-slate-400 ml-1">Phone *</label>
                    <input name="phone" value={formData.phone} type="tel" placeholder="+385..." maxLength={20} onChange={handlePhoneInput} className={inputClasses('phone')} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] sm:text-[11px] font-black uppercase text-slate-400 ml-1">Email *</label>
                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="your@email.com" maxLength={100} className={inputClasses('email')} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] sm:text-[11px] font-black uppercase text-slate-400 ml-1">Message *</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} placeholder="Describe needs..." className={inputClasses('message') + " resize-none min-h-[80px] sm:min-h-[120px]"} />
                </div>
              </div>

              <div className="flex flex-col h-full mt-1 sm:mt-0">
                <div className="flex flex-col gap-0.5 mb-2 ml-1">
                  <label className="text-[9px] sm:text-[11px] font-black uppercase text-yellow-400/80">Attachments</label>
                </div>
                
                <input type="file" multiple onChange={(e) => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} className="hidden" id="file-upload" />
                
                <label 
                  htmlFor="file-upload" 
                  className={`flex flex-col items-center justify-center gap-2 w-full border-[1.5px] border-dashed border-slate-700 rounded-xl sm:rounded-[24px] hover:border-yellow-400/50 hover:bg-white/5 transition-all duration-300 cursor-pointer bg-white/[0.01] group
                    ${files.length > 0 ? 'h-10 sm:h-auto sm:flex-1' : 'h-16 sm:h-auto sm:flex-1'}`}
                >
                  <Paperclip size={files.length > 0 ? 14 : 18} className="text-slate-500 group-hover:text-yellow-400 transition-all" />
                  {files.length === 0 && <span className="text-[9px] font-black uppercase text-slate-400">Attach files</span>}
                </label>

                {files.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 max-h-[120px] sm:max-h-none overflow-y-auto no-scrollbar animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[8px] font-black text-slate-500 uppercase ml-1">Added Files ({files.length})</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-900 shadow-sm animate-in zoom-in-95">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="min-w-[4px] h-4 bg-yellow-400 rounded-full" />
                            <span className="text-[10px] font-bold truncate">{file.name}</span>
                          </div>
                          <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="p-1 hover:bg-red-50 rounded-md transition-colors text-red-500">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>

          <div className="px-5 py-4 sm:px-8 sm:py-6 bg-[#1a1c20] border-t border-white/5">
            <button 
              disabled={isSending}
              type="submit" 
              onClick={() => formRef.current?.requestSubmit()}
              className="w-full bg-white text-black py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <>Send Inquiry <Send size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}