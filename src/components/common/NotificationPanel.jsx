import React, { useRef, useEffect } from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NotificationPanel({ open, onClose }) {
  const { notifications } = useApp();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-navy-900">Notifications</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 flex items-start gap-3 ${!n.read ? 'bg-brand-50/50' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-brand-500' : 'bg-slate-200'}`} />
              <div className="min-w-0">
                <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100">
        <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">Mark all as read</button>
      </div>
    </div>
  );
}
