import React from 'react';
import { Pencil, Trash2, Loader2, Film } from 'lucide-react';
import { Movie } from '../../types';

export interface MovieTableProps {
  movies: Movie[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  actionPendingId?: string | null;
}

export default function MovieTable({
  movies,
  onEdit,
  onDelete,
  loading,
  actionPendingId,
}: MovieTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
        <span className="text-xs text-slate-400">Loading movies...</span>
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
          {movies?.map((m) => {
            const movieId = m._id || m.id || '';
            const isPending = actionPendingId === movieId;
            // Check published flag if present on model
            const isPublished = (m as { isPublished?: boolean }).isPublished !== false;

            return (
              <tr key={movieId} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {m.poster?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.poster.url}
                        className="w-10 h-14 rounded object-cover bg-dark-800"
                        alt={m.title}
                      />
                    ) : (
                      <div className="w-10 h-14 rounded bg-dark-800 flex items-center justify-center text-slate-500">
                        <Film className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white max-w-[180px] sm:max-w-xs truncate">
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-500">{m.language || 'English'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-400">{m.releaseYear || '—'}</td>
                <td className="py-3 pr-4">
                  <span className="text-yellow-400 font-semibold">
                    ⭐ {m.averageRating > 0 ? m.averageRating.toFixed(1) : '—'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-400">{m.totalReviews || 0}</td>
                <td className="py-3 pr-4">
                  <span className={`badge ${isPublished ? 'badge-success' : 'badge-warning'}`}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button
                      id={`edit-movie-${movieId}`}
                      onClick={() => onEdit(m)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors cursor-pointer"
                      title="Edit movie"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-movie-${movieId}`}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${m.title}"?`)) {
                          onDelete(movieId);
                        }
                      }}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete movie"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!movies?.length && (
        <div className="text-center py-10 text-slate-400 text-sm">No movies found</div>
      )}
    </div>
  );
}
