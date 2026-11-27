import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input, Select } from './FormInputs';
import Button from './Button';

export default function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],  // [{label, key, options: [{label, value}]}]
  filterValues = {},
  onFilterChange,
  onReset,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors placeholder:text-slate-400"
        />
      </div>
      {filters.map((f) => (
        <select
          key={f.key}
          value={filterValues[f.key] ?? ''}
          onChange={(e) => onFilterChange?.(f.key, e.target.value)}
          className="px-3 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
      {onReset && (
        <Button variant="secondary" size="sm" icon={SlidersHorizontal} onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
