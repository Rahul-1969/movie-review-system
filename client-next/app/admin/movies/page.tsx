'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { moviesApi } from '../../../lib/api/movies.api';
import MovieTable from '../../../components/admin/MovieTable';
import { Movie } from '../../../types';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
}

function MovieModal({ movie, onClose, onSave }: MovieModalProps) {
  const [form, setForm] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    releaseYear: movie?.releaseYear ? String(movie.releaseYear) : '',
    language: movie?.language || 'English',
    director: movie?.director || '',
    trailer: movie?.trailer || '',
    isPublished: (movie as { isPublished?: boolean })?.isPublished ?? true,
  });
  const [poster, setPoster] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (poster) {
        fd.append('poster', poster);
      }
      await onSave(fd);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to save movie.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl glass p-6 rounded-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">
            {movie ? 'Edit Movie' : 'Add Movie'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-xs">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="input text-sm"
              placeholder="Movie title"
            />
          </div>

          <div>
            <label className="label text-xs">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={3}
              className="textarea text-sm resize-none"
              placeholder="Movie description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Release Year</label>
              <input
                type="number"
                min="1888"
                max={new Date().getFullYear() + 2}
                value={form.releaseYear}
                onChange={(e) => setForm((f) => ({ ...f, releaseYear: e.target.value }))}
                className="input text-sm"
                placeholder="2024"
              />
            </div>
            <div>
              <label className="label text-xs">Language</label>
              <input
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="input text-sm"
                placeholder="English"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs">Director</label>
            <input
              value={form.director}
              onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
              className="input text-sm"
              placeholder="Director name"
            />
          </div>

          <div>
            <label className="label text-xs">Trailer URL (YouTube)</label>
            <input
              value={form.trailer}
              onChange={(e) => setForm((f) => ({ ...f, trailer: e.target.value }))}
              className="input text-sm"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="label text-xs">Poster Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPoster(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary-500"
            />
            <span className="text-sm text-slate-300">Published to catalog</span>
          </label>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 text-sm py-2.5 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Saving...' : movie ? 'Update Movie' : 'Create Movie'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-ghost flex-1 text-sm py-2.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageMoviesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | Movie | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies', page, search],
    queryFn: async () => {
      const res = await moviesApi.getAll({ page, limit: 10, search: search.trim() || undefined });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => moviesApi.create(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setFeedback({ type: 'success', message: 'Movie created successfully!' });
      setModal(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({ type: 'error', message: axiosErr.response?.data?.message || 'Failed to create movie.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => moviesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setFeedback({ type: 'success', message: 'Movie updated successfully!' });
      setModal(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({ type: 'error', message: axiosErr.response?.data?.message || 'Failed to update movie.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => moviesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setFeedback({ type: 'success', message: 'Movie deleted successfully.' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({ type: 'error', message: axiosErr.response?.data?.message || 'Failed to delete movie.' });
    },
  });

  const movies = data?.data || [];
  const pagination = data?.pagination;

  const handleSave = async (fd: FormData) => {
    if (typeof modal === 'object' && modal !== null) {
      const movieId = modal._id || modal.id || '';
      await updateMutation.mutateAsync({ id: movieId, data: fd });
    } else {
      await createMutation.mutateAsync(fd);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Manage Movies</h1>
          <p className="text-slate-400 mt-1">{pagination?.total || 0} movies in database</p>
        </div>
        <button
          id="add-movie-btn"
          onClick={() => setModal('create')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Movie</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="movie-admin-search"
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input pl-11 text-sm"
        />
      </div>

      {/* Table */}
      <div className="card p-6">
        <MovieTable
          movies={movies}
          loading={isLoading}
          onEdit={(m) => setModal(m)}
          onDelete={(id) => deleteMutation.mutate(id)}
          actionPendingId={deleteMutation.isPending ? (deleteMutation.variables as string) : null}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-ghost disabled:opacity-40 cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-400 text-sm">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost disabled:opacity-40 cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {modal && (
        <MovieModal
          movie={typeof modal === 'object' ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
