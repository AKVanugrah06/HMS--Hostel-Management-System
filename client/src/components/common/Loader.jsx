import { Loader2 } from 'lucide-react';

export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-slate-500">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-indigo-600`} />
      {text && <span className="text-sm font-medium tracking-wide">{text}</span>}
    </div>
  );
}
