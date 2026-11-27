import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, change, trend, icon: Icon, iconColor = 'text-brand-600', iconBg = 'bg-brand-50' }) {
  const trendIcon = trend === 'up'
    ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
    : trend === 'down'
    ? <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
    : <Minus className="w-3.5 h-3.5 text-slate-400" />;

  const trendText = trend === 'up'
    ? 'text-emerald-700'
    : trend === 'down'
    ? 'text-rose-700'
    : 'text-slate-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-navy-900 mt-1 leading-tight">{value}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs ${trendText}`}>
          {trendIcon}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}
