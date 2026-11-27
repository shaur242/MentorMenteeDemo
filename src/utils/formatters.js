export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeString) {
  if (!timeString) return '';
  return timeString;
}

export function getRoleBadgeColor(role) {
  switch (role) {
    case 'HOD':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Coordinator':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Mentor':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Mentee':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Admin':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
