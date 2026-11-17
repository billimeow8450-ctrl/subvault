import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-slate-900 text-emerald-200 shadow-2xl backdrop-blur-md text-xs font-medium">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-0.5 ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

