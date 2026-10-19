'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Lock,
  Globe,
  Film,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Eye,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listsApi } from '../../lib/api/lists.api';
import { List, Movie } from '../../types';

// ── Inline toast-style feedback ────────────────────────────────────────────────
type FeedbackState = { type: 'success' | 'error'; message: string } | null;

function Feedback({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null;
  const isSuccess = feedback.type === 'success';
  return (
    <div
      className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border animate-fade-in ${
        isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      <span>{feedback.message}</span>
    </div>
  );
}

// ── Poster Collage Component ───────────────────────────────────────────────────
function PosterCollage({ movies = [] }: { movies?: (string | Movie)[] }) {
  // Extract up to 4 movie poster URLs
  const posters = movies
    .slice(0, 4)
    .map((m) => (typeof m === 'object' && m !== null ? m.poster?.url : undefined))
    .filter((url): url is string => Boolean(url));

  if (posters.length === 0) {
    return (
      <div className="w-full aspect-video bg-dark-800 flex items-center justify-center rounded-t-xl border-b border-white/5">
        <Film className="w-10 h-10 text-slate-600" />
      </div>
    );
  }

  if (posters.length === 1) {
    return (
      <div className="w-full aspect-video rounded-t-xl overflow-hidden bg-dark-900 border-b border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posters[0]}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 aspect-video rounded-t-xl overflow-hidden gap-0.5 bg-dark-950 border-b border-white/5">
      {[0, 1, 2, 3].map((i) =>
        posters[i] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={posters[i]}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div key={i} className="bg-dark-800/80 flex items-center justify-center">
            <Film className="w-4 h-4 text-slate-700" />
          </div>
        )
      )}
    </div>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────
function ListCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="w-full aspect-video shimmer-bg rounded-none" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 shimmer-bg rounded-lg" />
        <div className="h-3 w-1/3 shimmer-bg rounded-lg" />
        <div className="h-3 w-full shimmer-bg rounded-lg mt-1" />
        <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
          <div className="h-6 w-12 shimmer-bg rounded-lg" />
          <div className="h-6 w-16 shimmer-bg rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Modal Form for Create / Edit ───────────────────────────────────────────────
interface ListFormModalProps {
  onClose: () => void;
  onSubmit: (formData: { name: string; description: string; isPublic: boolean }) => void;
  initialValues?: { name?: string; description?: string; isPublic?: boolean };
  title?: string;
  isPending: boolean;
  error?: string | null;
}

function ListFormModal({
  onClose,
  onSubmit,
  initialValues = {},
  title = 'Create New List',
  isPending,
  error,
}: ListFormModalProps) {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [isPublic, setIsPublic] = useState(initialValues.isPublic ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), isPublic });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-md rounded-2xl shadow-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">List Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Favorite Sci-Fi"
              className="input"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Optional description of this collection..."
              className="textarea resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                isPublic
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isPublic ? 'Public' : 'Private'}
            </button>
            <span className="text-xs text-slate-400">
              {isPublic ? 'Visible to everyone' : 'Only you can see this list'}
            </span>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn-ghost flex-1 text-sm py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="btn-primary flex-1 text-sm py-2"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── View Movies Modal ──────────────────────────────────────────────────────────
interface ViewMoviesModalProps {
  list: List;
  onClose: () => void;
  onRemoveMovie: (listId: string, movieId: string) => void;
  isRemoving: boolean;
}

function ViewMoviesModal({ list, onClose, onRemoveMovie, isRemoving }: ViewMoviesModalProps) {
  const movies = (list.movies || []).filter(
    (m): m is Movie => typeof m === 'object' && m !== null && Boolean(m._id || m.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-display font-bold text-white">{list.name}</h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  list.isPublic
                    ? 'bg-primary-500/10 border-primary-500/20 text-primary-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {list.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {list.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            {list.description && (
              <p className="text-sm text-slate-400 mt-1 max-w-xl">{list.description}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {movies.length} movie{movies.length !== 1 ? 's' : ''} in this list
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Movies List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {movies.length === 0 ? (
            <div className="text-center py-12">
              <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No movies in this list yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Explore movies and add them to this list.
              </p>
              <Link href="/" onClick={onClose} className="btn-primary mt-4 inline-block text-xs py-2 px-4">
                Browse Movies
              </Link>
            </div>
          ) : (
            movies.map((movie) => {
              const movieId = movie._id || movie.id;
              const posterUrl =
                movie.poster?.url ||
                'https://placehold.co/100x150/1e293b/ffffff?text=No+Poster';

              return (
                <div
                  key={movieId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <Link href={`/movies/${movieId}`} onClick={onClose} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-12 h-16 rounded-lg object-cover bg-dark-800"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/movies/${movieId}`}
                      onClick={onClose}
                      className="font-medium text-white hover:text-primary-400 transition-colors truncate block"
                    >
                      {movie.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      {movie.releaseYear && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {movie.releaseYear}
                        </span>
                      )}
                      {movie.averageRating > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400 font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          {movie.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/movies/${movieId}`}
                      onClick={onClose}
                      className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1"
                    >
                      Details <ChevronRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => onRemoveMovie(list._id, movieId!)}
                      disabled={isRemoving}
                      title="Remove from list"
                      className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn-ghost text-sm py-2 px-4">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function MyListsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<List | null>(null);
  const [viewingListId, setViewingListId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch user's lists
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-lists'],
    queryFn: () => listsApi.getMyLists().then((r) => r.data),
    enabled: !loading && isAuthenticated,
  });

  const lists = Array.isArray(data?.data) ? data.data : [];
  const viewingList = viewingListId ? lists.find((l) => l._id === viewingListId) || null : null;

  // Mutations
  const createList = useMutation({
    mutationFn: (formData: { name: string; description: string; isPublic: boolean }) =>
      listsApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      setShowCreate(false);
      setModalError(null);
      setFeedback({ type: 'success', message: 'List created successfully!' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setModalError(axiosErr.response?.data?.message || 'Failed to create list');
    },
  });

  const updateList = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description: string; isPublic: boolean };
    }) => listsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      setEditingList(null);
      setModalError(null);
      setFeedback({ type: 'success', message: 'List updated successfully!' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setModalError(axiosErr.response?.data?.message || 'Failed to update list');
    },
  });

  const deleteList = useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      setConfirmDelete(null);
      if (viewingListId && confirmDelete && viewingListId === confirmDelete._id) {
        setViewingListId(null);
      }
      setFeedback({ type: 'success', message: 'List deleted' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        message: axiosErr.response?.data?.message || 'Failed to delete list',
      });
      setConfirmDelete(null);
    },
  });

  const removeMovie = useMutation({
    mutationFn: ({ listId, movieId }: { listId: string; movieId: string }) =>
      listsApi.removeMovie(listId, movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      setFeedback({ type: 'success', message: 'Movie removed from list' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        message: axiosErr.response?.data?.message || 'Failed to remove movie',
      });
    },
  });

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-36 shimmer-bg rounded-xl" />
            <div className="h-4 w-20 shimmer-bg rounded-lg" />
          </div>
          <div className="h-10 w-28 shimmer-bg rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Auth redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card p-12 text-center max-w-lg mx-auto space-y-4 border border-red-500/20 bg-red-500/5">
          <p className="text-red-400 font-medium">Failed to load your lists.</p>
          <button onClick={() => refetch()} className="btn-primary text-sm py-2 px-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast feedback */}
      <Feedback feedback={feedback} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Lists</h1>
          <p className="text-slate-400 text-sm mt-1">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'}
          </p>
        </div>
        <button
          onClick={() => {
            setModalError(null);
            setShowCreate(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New List
        </button>
      </div>

      {/* Lists Content */}
      {lists.length === 0 ? (
        <div className="card p-16 text-center max-w-md mx-auto">
          <Film className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No lists yet</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Create your first list to organize movies you love.
          </p>
          <button
            onClick={() => {
              setModalError(null);
              setShowCreate(true);
            }}
            className="btn-primary gap-2 inline-flex items-center"
          >
            <Plus className="w-4 h-4" /> Create a List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {lists.map((list) => (
            <div
              key={list._id}
              className="group card overflow-hidden hover:border-primary-500/30 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Collage — clickable to view movies */}
              <div
                onClick={() => setViewingListId(list._id)}
                className="cursor-pointer"
                title="View movies in this list"
              >
                <PosterCollage movies={list.movies} />
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => setViewingListId(list._id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                        {list.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {list.movies?.length ?? 0} {list.movies?.length === 1 ? 'movie' : 'movies'}
                      </p>
                    </button>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {list.isPublic ? (
                        <span title="Public list">
                          <Globe className="w-3.5 h-3.5 text-primary-400" />
                        </span>
                      ) : (
                        <span title="Private list">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        </span>
                      )}
                    </div>
                  </div>

                  {list.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{list.description}</p>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      setModalError(null);
                      setEditingList(list);
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(list)}
                    className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <button
                    onClick={() => setViewingListId(list._id)}
                    className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <ListFormModal
          title="Create New List"
          onClose={() => {
            setShowCreate(false);
            setModalError(null);
          }}
          onSubmit={(formData) => createList.mutate(formData)}
          isPending={createList.isPending}
          error={modalError}
        />
      )}

      {/* Edit Modal */}
      {editingList && (
        <ListFormModal
          title="Edit List"
          initialValues={editingList}
          onClose={() => {
            setEditingList(null);
            setModalError(null);
          }}
          onSubmit={(formData) =>
            updateList.mutate({ id: editingList._id, data: formData })
          }
          isPending={updateList.isPending}
          error={modalError}
        />
      )}

      {/* View Movies Modal */}
      {viewingList && (
        <ViewMoviesModal
          list={viewingList}
          onClose={() => setViewingListId(null)}
          onRemoveMovie={(listId, movieId) =>
            removeMovie.mutate({ listId, movieId })
          }
          isRemoving={removeMovie.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center border border-white/10">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">
              Delete &quot;{confirmDelete.name}&quot;?
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              This action cannot be undone and will delete the list permanently.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="btn-ghost flex-1 text-sm py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteList.mutate(confirmDelete._id)}
                disabled={deleteList.isPending}
                className="flex-1 text-sm px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-all"
              >
                {deleteList.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
