"use client";

import { ShieldCheck, ShieldAlert, Hash, FileText, Download } from "lucide-react";

export default function VerificationTab({ company, handleDownload, InfoField }: any) {
  const getFileName = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const fullFileName = parts[parts.length - 1];
      const nameWithoutTimestamp = fullFileName.split('-').slice(1).join('-');
      return nameWithoutTimestamp || fullFileName;
    } catch {
      return "Legal Document";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Status Card */}
      <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          
          <div className="flex items-center gap-4 md:contents">
            <div className={`w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-[30px] flex items-center justify-center shrink-0 shadow-inner transition-transform duration-500 hover:scale-110 ${company?.is_verified ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-300'}`}>
              {company?.is_verified ? (
                <ShieldCheck size={28} className="md:w-[48px] md:h-[48px]" />
              ) : (
                <ShieldAlert size={28} className="md:w-[48px] md:h-[48px]" />
              )}
            </div>
            
            <div className="flex-1 md:hidden text-left">
              <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight leading-tight">
                Status: <span className={company?.is_verified ? 'text-green-500' : 'text-slate-400'}>
                  {company?.is_verified ? 'Verified Professional' : 'Pending Verification'}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-left">
            <h3 className="hidden md:block text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight">
              Status: <span className={company?.is_verified ? 'text-green-500' : 'text-slate-400'}>
                {company?.is_verified ? 'Verified Professional' : 'Pending Verification'}
              </span>
            </h3>
            <p className="text-slate-500 text-[11px] md:text-sm font-medium max-w-xl">
              {company?.is_verified 
                ? "Your company is fully verified. This badge is visible to all customers, building trust."
                : "Your documents are currently being reviewed. Once verified, you will receive a badge."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Legal Identifiers Card */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-5 md:space-y-6 transition-all duration-300 hover:shadow-md">
          <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Legal Identifiers</h3>
          <div className="space-y-4">
            <div className="transition-all duration-200 hover:translate-x-1">
              <InfoField icon={<Hash size={18} />} label="PIN" value={<span className="font-mono text-sm md:text-base">{company?.oib}</span>} />
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Notice</p>
              <p className="text-[10px] text-slate-500 font-bold leading-tight italic">
                PIN cannot be changed manually. For updates, contact support.
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Card */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-5 md:space-y-6 transition-all duration-300 hover:shadow-md">
          <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Uploaded Documents</h3>
          <div className="grid grid-cols-1 gap-3">
            {company?.document_urls?.length > 0 ? (
              company.document_urls.map((url: string, idx: number) => {
                const fileName = getFileName(url);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-yellow-500 shadow-sm shrink-0">
                        <FileText size={16} className="md:w-[20px] md:h-[20px]" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] md:text-[12px] font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-yellow-600">
                          {fileName}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(url, fileName)} 
                      className="p-2 bg-white text-slate-400 hover:text-slate-900 active:scale-90 rounded-xl shadow-sm border border-slate-100 transition-all shrink-0 ml-2"
                    >
                      <Download size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 md:py-10 border-2 border-dashed border-slate-100 rounded-[24px] md:rounded-[32px]">
                <FileText size={28} className="text-slate-200 mb-2 md:w-[32px] md:h-[32px]" />
                <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase">No documents found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}