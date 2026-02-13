import { X, Briefcase, ChevronRight, Search, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Tooltip } from "@components/Tooltip";

interface StartChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  onSelectProject: (id: string) => void;
}

export const StartChatModal = ({ isOpen, onClose, projects, onSelectProject }: StartChatModalProps) => {
  const [modalSearch, setModalSearch] = useState("");

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-400 text-black px-0.5 rounded-sm">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => 
        project.title?.toLowerCase().includes(modalSearch.toLowerCase()) || 
        project.client?.full_name?.toLowerCase().includes(modalSearch.toLowerCase()) ||
        project.project_type?.toLowerCase().includes(modalSearch.toLowerCase())
      )
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return (a.title || "").localeCompare(b.title || "");
      });
  }, [projects, modalSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Start Conversation</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select a project to message</p>
          </div>
          <div>
            <Tooltip content="Close window" side="bottom">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 hover:scale-110 active:scale-90 rounded-full transition-all">
                <X size={20} className="text-slate-400 hover:text-red-500 transition-colors" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="p-4 bg-white border-b border-gray-50">
          <div className="relative group/modal-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/modal-search:text-yellow-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="SEARCH PROJECTS OR CLIENTS..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-100 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-yellow-500 transition-all hover:bg-gray-200 hover:scale-[1.01]"
            />
            {modalSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Tooltip content="Clear search" side="top">
                  <button 
                    onClick={() => setModalSearch("")}
                    className="text-gray-400 hover:text-red-500 hover:scale-110 active:scale-90 transition-all"
                  >
                    <X size={16} />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 bg-gray-50/50">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const isCompleted = project.status === 'completed';
              return (
                <div key={project.id}>
                  <Tooltip content={isCompleted ? "" : "Send message"} side="top" disabled={isCompleted}>
                    <button
                      disabled={isCompleted}
                      onClick={() => {
                        onSelectProject(project.id);
                        setModalSearch("");
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group shadow-sm border border-gray-100 
                        ${isCompleted 
                          ? "bg-gray-50 opacity-60 cursor-not-allowed" 
                          : "bg-white hover:bg-slate-950 hover:text-white hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all
                        ${isCompleted ? "bg-gray-200 text-gray-400" : "bg-yellow-400 text-black group-hover:scale-90 group-hover:bg-yellow-500"}`}>
                        <Briefcase size={18} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm truncate uppercase tracking-tight">
                              {highlightText(project.title || "", modalSearch)}
                            </h4>
                            {isCompleted && (
                              <span className="bg-green-100 text-green-700 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 uppercase tracking-tighter">
                                <CheckCircle2 size={12} /> COMPLETED
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold truncate ${isCompleted ? "text-slate-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                            Client: {highlightText(project.client?.full_name || "Unknown", modalSearch)}
                          </span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isCompleted ? "text-slate-400" : "text-yellow-600 group-hover:text-yellow-400"}`}>
                          {highlightText(project.project_type || "", modalSearch)}
                        </p>
                      </div>
                      {!isCompleted && <ChevronRight size={16} className="text-gray-300 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />}
                    </button>
                  </Tooltip>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching projects found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};