import React from 'react';

const sizeMap = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = user?.avatarColor || 'bg-navy-700';

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none ${className}`}
      title={user?.name}
    >
      {user?.initials || user?.name?.slice(0, 2).toUpperCase() || 'U'}
    </div>
  );
}
