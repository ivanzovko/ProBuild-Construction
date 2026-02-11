"use client";

import { Clock } from "lucide-react";

export default function DetailsTab({ isEditing, formData, setFormData, company }: any) {
  
  const handleCopyHours = () => {
    if (!formData?.working_hours || formData.working_hours.length === 0) return;

    const firstDay = formData.working_hours[0];
    const updatedHours = formData.working_hours.map((day: any) => ({
      ...day,
      open: firstDay.open,
      close: firstDay.close,
      closed: firstDay.closed,
    }));

    setFormData({
      ...formData,
      working_hours: updatedHours,
    });
  };

  const formatDay = (day: string) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return day.substring(0, 3);
    }
    return day;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Business Hours Card */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-yellow-600" size={16} />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Business Hours</h3>
          </div>
          {isEditing && (
            <button 
              type="button" 
              onClick={handleCopyHours} 
              className="text-[8px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors"
            >
              Copy First Day
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {(isEditing ? formData.working_hours : company.working_hours)?.map((schedule: any, idx: number) => (
            <div key={schedule.day} className="flex items-center gap-2 md:gap-4 group transition-transform duration-200 hover:translate-x-1">
              <span className="w-10 md:w-24 text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
                {formatDay(schedule.day)}
              </span>

              <div className={`flex items-center gap-1 md:gap-2 bg-slate-50 p-2 rounded-xl border transition-all flex-1 justify-center min-w-0 ${isEditing ? 'group-hover:border-yellow-500 group-hover:bg-white border-slate-200 shadow-sm' : 'border-transparent'}`}>
                {isEditing ? (
                  <>
                    <input 
                      type="time" 
                      disabled={schedule.closed} 
                      value={schedule.open} 
                      onChange={(e) => {
                        const newHours = [...formData.working_hours];
                        newHours[idx].open = e.target.value;
                        setFormData({ ...formData, working_hours: newHours });
                      }} 
                      className="bg-transparent text-[11px] md:text-[13px] font-black text-slate-900 outline-none w-full max-w-[65px] md:max-w-[85px] px-1 disabled:opacity-20 cursor-pointer text-center [&::-webkit-calendar-picker-indicator]:hidden" 
                    />
                    <span className="text-slate-300 font-bold text-[10px]">—</span>
                    <input 
                      type="time" 
                      disabled={schedule.closed} 
                      value={schedule.close} 
                      onChange={(e) => {
                        const newHours = [...formData.working_hours];
                        newHours[idx].close = e.target.value;
                        setFormData({ ...formData, working_hours: newHours });
                      }} 
                      className="bg-transparent text-[11px] md:text-[13px] font-black text-slate-900 outline-none w-full max-w-[65px] md:max-w-[85px] px-1 disabled:opacity-20 cursor-pointer text-center [&::-webkit-calendar-picker-indicator]:hidden" 
                    />
                  </>
                ) : (
                  <span className={`text-[11px] md:text-[13px] font-black tracking-wider whitespace-nowrap ${schedule.closed ? 'text-slate-300' : 'text-slate-900'}`}>
                    {schedule.closed ? 'CLOSED' : `${schedule.open} — ${schedule.close}`}
                  </span>
                )}
              </div>

              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => {
                    const newHours = [...formData.working_hours];
                    newHours[idx].closed = !newHours[idx].closed;
                    setFormData({ ...formData, working_hours: newHours });
                  }} 
                  className={`w-10 md:w-14 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-tighter transition-all shrink-0 ${schedule.closed ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-yellow-400 text-slate-900 shadow-sm border border-yellow-500'}`}
                >
                  {schedule.closed ? 'Off' : 'On'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* About Company Card */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm h-fit transition-all duration-300 hover:shadow-md">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">About Company</h3>
        
        {isEditing ? (
          <textarea 
            className="w-full min-h-[150px] max-h-[400px] bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs font-bold focus:outline-yellow-400 focus:bg-white transition-all resize-none leading-relaxed overflow-y-auto" 
            value={formData?.company_description || ""} 
            onChange={(e) => setFormData({ ...formData, company_description: e.target.value })} 
            placeholder="Write something about your company..." 
          />
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-slate-500 font-bold text-[11px] md:text-xs italic leading-relaxed whitespace-pre-wrap">
              "{company?.company_description || "No description provided."}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}