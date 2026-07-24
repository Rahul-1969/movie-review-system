import { Pencil, Trash2, Loader2 } from 'lucide-react';

export default function MovieTable({ movies, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left">
            <th className="pb-3 pr-4 text-slate-400 font-medium">Movie</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Year</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Rating</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Reviews</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Status</th>
            <th className="pb-3 text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {movies?.map((m) => (
            <tr key={m._id} className="hover:bg-white/2 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {m.poster?.url ? (
                    <img src={m.poster.url} className="w-10 h-14 rounded object-cover" alt={m.title} />
                  ) : (
                    <div className="w-10 h-14 rounded bg-dark-800 flex items-center justify-center text-xl">🎬</div>
                  )}
                  <div>
                    <p className="font-medium text-white max-w-[160px] truncate">{m.title}</p>
                    <p className="text-xs text-slate-500">{m.language}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-slate-400">{m.releaseYear || '—'}</td>
              <td className="py-3 pr-4">
                <span className="text-yellow-400 font-semibold">
                  ⭐ {m.averageRating?.toFixed(1) || '—'}
                </span>
              </td>
              <td className="py-3 pr-4 text-slate-400">{m.totalReviews || 0}</td>
              <td className="py-3 pr-4">
                <span className={`badge ${m.isPublished ? 'badge-success' : 'badge-warning'}`}>
                  {m.isPublished ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <button
                    id={`edit-movie-${m._id}`}
                    onClick={() => onEdit(m)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    id={`delete-movie-${m._id}`}
                    onClick={() => {
                      if (confirm(`Delete "${m.title}"?`)) onDelete(m._id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!movies?.length && (
        <div className="text-center py-8 text-slate-400">No movies found</div>
      )}
    </div>
  );
}
