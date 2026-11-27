import React from 'react';
import { roleColors } from '../../config/navConfig';

const variantMap = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  navy: 'bg-navy-800 text-white border-navy-700',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const sizeMap = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export default function Badge({ children, variant = 'default', size = 'md', role, className = '' }) {
  let styles = variantMap[variant] || variantMap.default;
  if (role && roleColors[role]) {
    styles = roleColors[role].badge;
  }
  const sizeStyles = sizeMap[size] || sizeMap.md;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${styles} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
}
