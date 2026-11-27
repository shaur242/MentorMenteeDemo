import React from 'react';
import { InboxIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon = InboxIcon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-navy-900 mb-1">{title || 'Nothing here yet'}</h3>
      {description && <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-5">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
