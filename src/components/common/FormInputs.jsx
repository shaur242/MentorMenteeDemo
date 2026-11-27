import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, hint, className = '', icon: Icon, ...props }, ref) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-slate-700">
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm text-slate-800 bg-white border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors
            placeholder:text-slate-400
            ${error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'}`}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select({ label, error, hint, className = '', children, ...props }, ref) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-slate-700">
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors
          ${error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, className = '', ...props }, ref) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-slate-700">
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={`w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg shadow-sm resize-y
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors
          placeholder:text-slate-400
          ${error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
});
