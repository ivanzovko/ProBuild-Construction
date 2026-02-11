export default function InfoField({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">{icon}</div>
      <div className="flex-1 overflow-hidden">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="text-sm font-bold text-slate-900 truncate">{value || "Not set"}</div>
      </div>
    </div>
  );
}