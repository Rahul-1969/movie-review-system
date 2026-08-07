import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api.js';
import { reviewsApi } from '../../api/reviews.api.js';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import { Flag, Trash2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate.js';
import { getRatingBgColor } from '../../utils/ratingHelper.js';
import toast from 'react-hot-toast';
import PageTransition from '../../components/common/PageTransition.jsx';

export default function ManageReviews() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['flagged-reviews', page],
    queryFn: () => adminApi.getFlaggedReviews({ page, limit: 10 }).then((r) => r.data),
  });

  const unflagMutation = useMutation({
    mutationFn: reviewsApi.flag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      toast.success('Review unflagged');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      toast.success('Review deleted');
    },
  });

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  return (
    <PageTransition>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Flagged Reviews</h1>
            <p className="text-slate-400 mt-1">{pagination?.total || 0} flagged reviews</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" /></div>
          ) : reviews.length === 0 ? (
            <div className="card p-16 text-center">
              <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No flagged reviews</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="card p-5 border-red-500/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {r.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{r.user?.name}</p>
                        <p className="text-xs text-slate-500">{r.user?.email} · {formatRelativeTime(r.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge border text-xs font-bold ${getRatingBgColor(r.rating)}`}>{r.rating}/10</span>
                      <span className="badge-danger text-xs">Flagged</span>
                    </div>
                  </div>

                  {r.movie && (
                    <p className="text-xs text-slate-500 mt-2 font-medium">on: {r.movie.title}</p>
                  )}

                  <p className="text-slate-300 text-sm mt-2">{r.comment}</p>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <button onClick={() => unflagMutation.mutate(r._id)}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors">
                      <Flag className="w-3.5 h-3.5" /> Unflag
                    </button>
                    <button onClick={() => { if (confirm('Delete review?')) deleteMutation.mutate(r._id); }}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination?.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-slate-400 text-sm">Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-ghost disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
