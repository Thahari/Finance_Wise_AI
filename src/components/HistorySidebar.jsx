import React from 'react';
import { History, X, Trash2, MessageSquare } from 'lucide-react';

const HistorySidebar = ({ show, onClose, sessions, currentSessionId, onLoadSession, onDeleteSession, onStartNew }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-sm h-full bg-[#111] border-l border-[#222] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Past Comparisons History"
      >
        <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
          <h2 className="text-lg font-medium text-[#ececec] flex items-center gap-2">
            <History className="w-5 h-5 text-[#888]" aria-hidden="true" /> History
          </h2>
          <button 
            role="button"
            tabIndex={0}
            onClick={onClose} 
            className="text-[#888] hover:text-white transition-colors"
            aria-label="Close history sidebar"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3" role="list" aria-label="List of past sessions">
          {sessions.length === 0 ? (
             <p className="text-[#666] text-center mt-10">No past comparisons yet.</p>
          ) : (
            sessions.map(s => (
              <div 
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={`Load comparison: ${s.title}`}
                onClick={() => onLoadSession(s)}
                onKeyDown={(e) => e.key === 'Enter' && onLoadSession(s)}
                className={`group p-3 rounded-xl cursor-pointer border transition-all ${s.id === currentSessionId ? 'bg-[#222] border-[#444]' : 'bg-[#151515] border-[#222] hover:bg-[#1f1f1f] hover:border-[#333]'}`}
              >
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-medium text-[14px] text-[#ececec] line-clamp-2 leading-tight">
                     {s.title}
                   </h3>
                   <button
                     role="button"
                     tabIndex={0}
                     onClick={(e) => onDeleteSession(e, s.id)}
                     onKeyDown={(e) => e.key === 'Enter' && onDeleteSession(e, s.id)}
                     className="text-[#555] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2 flex-shrink-0"
                     aria-label={`Delete comparison: ${s.title}`}
                     title="Delete"
                   >
                     <Trash2 className="w-4 h-4" aria-hidden="true" />
                   </button>
                 </div>
                 <div className="flex items-center text-xs text-[#666] gap-1">
                   <MessageSquare className="w-3 h-3" aria-hidden="true" /> 
                   {new Date(parseInt(s.timestamp)).toLocaleDateString()}
                 </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-[#222] bg-[#111]">
           <button 
             role="button"
             tabIndex={0}
             onClick={() => { onStartNew(); onClose(); }}
             className="w-full py-2.5 rounded-lg bg-[#222] hover:bg-[#333] text-[#ececec] font-medium transition-colors text-sm"
             aria-label="Start a new comparison"
           >
             + New Comparison
           </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HistorySidebar);
