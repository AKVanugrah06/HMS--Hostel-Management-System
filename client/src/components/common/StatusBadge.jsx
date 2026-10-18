export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  const styles = {
    // Pending
    pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    
    // In progress / submitted
    submitted: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
    
    // Success states
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    
    // Danger / error states
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    full: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    maintenance: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
    vacated: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',
  };

  const dots = {
    pending: 'bg-amber-500',
    submitted: 'bg-blue-500',
    in_progress: 'bg-indigo-500',
    verified: 'bg-emerald-500',
    approved: 'bg-emerald-500',
    resolved: 'bg-emerald-500',
    available: 'bg-emerald-500',
    rejected: 'bg-rose-500',
    full: 'bg-rose-500',
    maintenance: 'bg-purple-500',
    vacated: 'bg-slate-400',
  };

  const styleClass = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-200';
  const dotClass = dots[normalized] || 'bg-slate-400';

  const label = normalized.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ring-1 ${styleClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`} />
      {label}
    </span>
  );
}
