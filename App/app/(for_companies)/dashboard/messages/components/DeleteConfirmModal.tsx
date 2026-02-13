import { AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "@components/Tooltip";

interface DeleteConfirmModalProps {
  onCancel: () => void;
  onConfirm: (id: string) => void;
  id: string;
}

export const DeleteConfirmModal = ({ onCancel, onConfirm, id }: DeleteConfirmModalProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleConfirm = async () => {
    try {
      setStatus('loading');
      await onConfirm(id);
      setStatus('success');
      
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {(status === 'idle' || status === 'loading') && (
          <>
            <div className="flex items-center gap-3 mb-4 text-red-500">
              {status === 'loading' ? (
                <Loader2 size={24} className="animate-spin text-slate-400" />
              ) : (
                <AlertCircle size={24} className="animate-pulse" />
              )}
              <h3 className="font-black text-sm uppercase tracking-tighter text-slate-900">
                {status === 'loading' ? 'Deleting...' : 'Delete Message?'}
              </h3>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 font-medium">
              {status === 'loading' 
                ? 'Please wait while we remove the message from the database.' 
                : 'This action cannot be undone. Are you sure you want to remove this message?'}
            </p>

            <div className="flex gap-3">
              <div className="flex-1">
                <Tooltip content="Keep message" side="bottom">
                  <button 
                    disabled={status === 'loading'}
                    onClick={onCancel} 
                    className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 bg-gray-100 transition-all hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Cancel
                  </button>
                </Tooltip>
              </div>

              <div className="flex-1">
                <Tooltip content="Confirm delete" side="bottom">
                  <button 
                    disabled={status === 'loading'}
                    onClick={handleConfirm} 
                    className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white bg-red-500 shadow-lg shadow-red-200 transition-all hover:bg-red-600 hover:scale-105 hover:shadow-red-300 active:scale-95 disabled:bg-slate-400 disabled:shadow-none disabled:hover:scale-100"
                  >
                    {status === 'loading' ? 'Wait...' : 'Delete'}
                  </button>
                </Tooltip>
              </div>
            </div>
          </>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-tighter text-slate-900">Deleted Successfully</h3>
            <p className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-widest text-center px-4">
              The message has been removed from the database
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-4 animate-in shake duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <XCircle size={32} />
            </div>
            <h3 className="font-black text-sm uppercase tracking-tighter text-slate-900">Action Failed</h3>
            <p className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-widest text-center px-4">
              Could not delete message. Check your connection.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};