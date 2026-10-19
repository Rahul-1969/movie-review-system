'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Lock,
  Globe,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
  Minus,
  Film,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { listsApi } from '../../../lib/api/lists.api';
import MovieCard from '../../../components/movies/MovieCard';
import { Movie, User } from '../../../types';

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
      {isSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span>{feedback.message}</span>
    </div>
  );
}

function ListDetailSkeleton() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-4 w-24 shimmer-bg rounded mb-8" />
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 shimmer-bg rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 shimmer-bg rounded-xl" />
            <div className="h-4 w-32 shimmer-bg rounded" />
            <div className="h-3 w-full max-w-md shimmer-bg rounded" />
            <div className="h-3 w-16 shimmer-bg rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="w-full aspect-[2/3] shimmer-bg rounded-none" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 w-3/4 shimmer-bg rounded" />
              <div className="h-3 w-1/2 shimmer-bg rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ListDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['lists', id],
    queryFn: () => listsApi.getById(id).then((r) => r.data),
    enabled: Boolean(id),
    retry: false,
  });

  const updateList = useMutation({
    mutationFn: (formData: { name: string; description: string; isPublic: boolean }) =>
      listsApi.update(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', id] });
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      setShowEdit(false);
      setFeedback({ type: 'success', message: 'List updated!' });
    },
    onError: () => setFeedback({ type: 'error', message: 'Failed to update list' }),
  });

  const deleteList = useMutation({
    mutationFn: () => listsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      router.push('/my-lists');
    },
    onError: () => setFeedback({ type: 'error', message: 'Failed to delete list' }),
  });

  const removeMovie = useMutation({
    mutationFn: (movieId: string) => listsApi.removeMovie(id, movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', id] });
      queryClient.invalidateQueries({ queryKey: ['my-lists'] });
      setFeedback({ type: 'success', message: 'Movie removed from list' });
    },
    onError: () => setFeedback({ type: 'error', message: 'Failed to remove movie' }),
  });

  if (isLoading) {
    return <ListDetailSkeleton />;
  }

  const axiosErr = error as { response?: { status?: number; data?: { message?: string } } };
  const isForbidden =
    axiosErr?.response?.status === 403 ||
    axiosErr?.response?.data?.message === 'This list is private';

  if (isForbidden) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Lock className="w-12 h-12 text-slate-500" />
        <h2 className="text-xl font-bold text-slate-300">This list is private</h2>
        <p className="text-slate-500 text-sm">Only the owner can view this list.</p>
        <Link href="/" className="btn-ghost text-sm mt-2">
          &larr; Back to Browse
        </Link>
      </div>
    );
  }

  const list = data?.data;
  if (!list) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <Film className="w-12 h-12 text-slate-500" />
        <h2 className="text-xl font-bold text-slate-300">List not found</h2>
        <Link href="/my-lists" className="btn-ghost text-sm mt-2">
          &larr; Back to My Lists
        </Link>
      </div>
    );
  }

  const listOwner = typeof list.user === 'object' && list.user !== null ? (list.user as User) : null;
  const ownerId = listOwner ? listOwner._id || listOwner.id : list.user;
  const isOwner = Boolean(user?._id && ownerId && user._id.toString() === ownerId.toString());

  const movies = (list.movies || []).filter(
    (m): m is Movie => typeof m === 'object' && m !== null && Boolean(m._id || m.id)
  );

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Feedback feedback={feedback} />

      {/* Back button */}
      <Link
        href="/my-lists"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Lists
      </Link>

      {/* Header Card */}
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-5">
          {listOwner && (
            <Link
              href={`/users/${ownerId}`}
              className="shrink-0 flex items-center gap-3 hover:opacity-85 transition-opacity"
            >
              {listOwner.avatar?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listOwner.avatar.url}
                  alt={listOwner.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  {listOwner.name?.[0]?.toUpperCase()}
                </div>
              )}
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                {list.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  list.isPublic
                    ? 'bg-primary-500/10 border-primary-500/20 text-primary-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {list.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {list.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            {listOwner && (
              <Link
                href={`/users/${ownerId}`}
                className="text-sm text-slate-400 hover:text-white transition-colors mt-1 inline-block"
              >
                by {listOwner.name}
              </Link>
            )}

            {list.description && (
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">{list.description}</p>
            )}

            <p className="text-xs text-slate-500 mt-2">
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
            </p>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-3"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm py-2 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      {movies.length === 0 ? (
        <div className="card p-16 text-center max-w-md mx-auto">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No movies in this list yet</p>
          <p className="text-slate-500 text-sm mt-1">Browse and add movies you love!</p>
          <Link href="/" className="btn-primary mt-4 inline-block text-xs py-2 px-4">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => {
            const movieId = movie._id || movie.id;
            return (
              <div key={movieId} className="relative group">
                <MovieCard movie={movie} />
                {isOwner && movieId && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeMovie.mutate(movieId);
                    }}
                    disabled={removeMovie.isPending}
                    title="Remove from list"
                    className="absolute top-2 left-2 z-10 p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-slate-300 hover:text-white transition-all shadow-md backdrop-blur-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl shadow-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-white">Edit List</h2>
              <button
                onClick={() => setShowEdit(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('listName') as HTMLInputElement).value;
                const description = (form.elements.namedItem('listDesc') as HTMLTextAreaElement).value;
                const isPublic = (form.elements.namedItem('listPublic') as HTMLInputElement).checked;
                updateList.mutate({ name, description, isPublic });
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">Name *</label>
                <input
                  name="listName"
                  defaultValue={list.name}
                  maxLength={100}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  name="listDesc"
                  defaultValue={list.description || ''}
                  maxLength={500}
                  rows={3}
                  className="textarea resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="listPublic"
                  defaultChecked={list.isPublic}
                  className="w-4 h-4 rounded accent-primary-500"
                />
                <span className="text-sm text-slate-300">Public list (visible to everyone)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="btn-ghost flex-1 text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateList.isPending}
                  className="btn-primary flex-1 text-sm py-2"
                >
                  {updateList.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center border border-white/10">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Delete &quot;{list.name}&quot;?</h3>
            <p className="text-sm text-slate-400 mb-6">
              This action cannot be undone and will delete the list permanently.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="btn-ghost flex-1 text-sm py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteList.mutate()}
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
