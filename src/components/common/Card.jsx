import React from 'react';

export default function Card({ children, className = '', title, subtitle, headerAction, noPad = false }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-navy-900 truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
