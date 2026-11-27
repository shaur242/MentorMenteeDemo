import React from 'react';
import { Loader2 } from 'lucide-react';

const base =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm focus:ring-brand-500',
  navy: 'bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white shadow-sm focus:ring-navy-600',
  secondary: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm focus:ring-brand-500',
  ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 focus:ring-slate-400',
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus:ring-rose-500',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
};

const sizes = {
  xs: 'text-xs px-2.5 py-1.5 gap-1',
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2.5',
  icon: 'p-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}
