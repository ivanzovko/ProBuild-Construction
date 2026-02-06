"use client";

import { Trash2, Clock, ShieldCheck, FileUp, FileText, Info } from "lucide-react";

interface Step4Props {
  workingHours: any[];
  setWorkingHours: (hours: any[]) => void;
  uploadedFiles: File[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  fileToDelete: number | null;
  setFileToDelete: (index: number | null) => void;
  confirmDelete: () => void;
  errors: any;
}

export default function Step4Verification({
  workingHours,
  setWorkingHours,
  uploadedFiles,
  fileInputRef,
  handleFileChange,
  removeFile,
  fileToDelete,
  setFileToDelete,
  confirmDelete,
  errors
}: Step4Props) {
  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {fileToDelete !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl border border-slate-100 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic">Remove File?</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed truncate px-4">
                {uploadedFiles[fileToDelete]?.name}
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setFileToDelete(null)} className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-start">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div className="p-1.5 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-600" size={14} />
            </div>
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Business Hours</h3>
          </div>
          
          <div className="bg-slate-50/50 rounded-[20px] md:rounded-[24px] p-1 md:p-1.5 border border-slate-100 space-y-1">
            {workingHours.map((schedule, idx) => (
              <div key={schedule.day} className="flex items-center gap-2 md:gap-3 p-1 md:p-1.5 rounded-lg md:rounded-xl hover:bg-white transition-all group">
                <div className="w-9 md:w-10 flex flex-col">
                  <span className="text-[11px] md:text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 transition-colors">
                    {schedule.day.substring(0, 3)}
                  </span>
                  {idx === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const firstDay = workingHours[0];
                        const updatedHours = workingHours.map(h => ({
                          ...h, open: firstDay.open, close: firstDay.close, closed: firstDay.closed
                        }));
                        setWorkingHours(updatedHours);
                      }}
                      className="hidden md:block text-[7px] font-black uppercase text-blue-500 hover:text-blue-700 text-left mt-0.5"
                    >
                      Copy
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-lg md:rounded-xl border border-slate-200 shadow-sm group-hover:border-yellow-500 transition-colors">
                  <input 
                    type="time" 
                    step="900"
                    disabled={schedule.closed}
                    value={schedule.open}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    onChange={(e) => {
                      const newHours = [...workingHours];
                      newHours[idx].open = e.target.value;
                      setWorkingHours(newHours);
                    }}
                    className="bg-transparent text-[11px] font-black text-slate-900 outline-none w-[75px] md:w-[70px] disabled:opacity-20 cursor-pointer text-center"
                  />
                  <span className="text-slate-300 font-bold text-[9px]">—</span>
                  <input 
                    type="time" 
                    step="900"
                    disabled={schedule.closed}
                    value={schedule.close}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                    onChange={(e) => {
                      const newHours = [...workingHours];
                      newHours[idx].close = e.target.value;
                      setWorkingHours(newHours);
                    }}
                    className="bg-transparent text-[11px] font-black text-slate-900 outline-none w-[75px] md:w-[70px] disabled:opacity-20 cursor-pointer text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newHours = [...workingHours];
                    newHours[idx].closed = !newHours[idx].closed;
                    setWorkingHours(newHours);
                  }}
                  className={`flex-1 max-w-[45px] md:max-w-none py-1 md:py-2 rounded-lg text-[10px] md:text-[9px] font-black uppercase tracking-tighter transition-all ${
                    schedule.closed 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                    : 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500'
                  }`}
                >
                  {schedule.closed ? 'Off' : 'On'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <ShieldCheck className="text-blue-600" size={16} />
              </div>
              <h2 className="text-[12px] md:text-sm font-black text-slate-900 uppercase tracking-tight">Verification</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl md:rounded-[24px] p-4 md:p-6 cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <FileUp className="text-blue-600 group-hover:scale-110 transition-transform" size={20} />
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Tap to upload</span>
                <span className="hidden md:block text-[8px] text-slate-400 font-bold uppercase">PDF, PNG, JPG</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5 max-h-[140px] md:max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 md:p-3.5 bg-white border border-slate-100 rounded-lg md:rounded-xl shadow-sm hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="text-blue-600 shrink-0" size={20} />
                      <p className="text-[10px] md:text-[11px] font-bold text-slate-900 truncate max-w-[200px] md:max-w-[220px]">{file.name}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)} 
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.files && <p className="text-[8px] md:text-[9px] text-red-500 font-bold uppercase ml-1">{errors.files}</p>}
          </div>

          <div className="hidden md:flex p-3 bg-blue-50/50 rounded-xl md:rounded-2xl border border-blue-100 gap-2">
            <Info className="text-blue-600 shrink-0" size={14} />
            <p className="text-[9px] md:text-[10px] text-blue-800 font-medium leading-tight md:leading-relaxed italic">
              Verified businesses get a <span className="font-black text-blue-900 uppercase">Pro Badge</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}