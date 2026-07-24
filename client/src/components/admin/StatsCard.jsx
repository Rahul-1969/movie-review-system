export default function StatsCard({ title, value, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  };

  const c = colors[color] || colors.primary;

  return (
    <div className="card p-5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value ?? '—'}
          </p>
          {trend && (
            <p className="text-xs text-slate-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </div>
  );
}
