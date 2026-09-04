import React, { useEffect } from 'react';
import { Sparkles, AlertCircle, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const isError = toast.type === 'error';

  // Auto-dismiss after 3.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast?.id, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 border-3 border-black shadow-brutal-md rounded-2xl ${
          isError ? 'bg-red-400 text-black' : 'bg-yestalgia-lime text-black font-semibold'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-black" />
        ) : (
          <Sparkles className="w-5 h-5 flex-shrink-0 text-black" />
        )}
        <span className="font-heading font-black text-xs uppercase tracking-wide">
          {toast.message}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          className="ml-2 p-1 bg-black/10 hover:bg-black/20 rounded-lg transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
