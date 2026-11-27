import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, isOpen, onClose, title, description, children, size = 'md' }) {
  const overlayRef = useRef(null);
  const isVisible = open !== undefined ? open : isOpen;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isVisible) {
      window.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity" />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeMap[size] || sizeMap.md} max-h-[92vh] flex flex-col my-auto z-10 animate-modal`}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="min-w-0 pr-2">
            {title && <h2 className="text-base sm:text-lg font-bold text-navy-900 truncate">{title}</h2>}
            {description && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body with vertical scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
