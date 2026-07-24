import { Film } from 'lucide-react';

export default function Loader({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`relative ${sizes[size]}`}>
        <div className={`${sizes[size]} rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin`} />
        <Film className="w-4 h-4 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      {text && <p className="text-slate-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size="lg" text="Loading..." />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[2/3] shimmer-bg" />
      <div className="p-4 space-y-2">
        <div className="h-4 shimmer-bg rounded w-3/4" />
        <div className="h-3 shimmer-bg rounded w-1/2" />
        <div className="h-3 shimmer-bg rounded w-1/3" />
      </div>
    </div>
  );
}
