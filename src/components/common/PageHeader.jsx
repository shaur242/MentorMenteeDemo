import React from 'react';

export default function PageHeader({ title, subtitle, children, breadcrumbs = [] }) {
  return (
    <div className="mb-6">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-2 text-xs text-slate-400">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'text-slate-600 font-medium' : ''}>{crumb}</span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
}
