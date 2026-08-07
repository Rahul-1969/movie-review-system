import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '../../api/movies.api.js';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import MovieTable from '../../components/admin/MovieTable.jsx';
import { Plus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../../components/common/PageTransition.jsx';

function MovieModal({ movie, onClose, onSave }) {
  const [form, setForm] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    releaseYear: movie?.releaseYear || '',
    language: movie?.language || '',
    director: movie?.director || '',
    trailer: movie?.trailer || '',
    isPublished: movie?.isPublished ?? true,
  });
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (poster) fd.append('poster', poster);
    await onSave(fd);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl glass p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">
            {movie ? 'Edit Movie' : 'Add Movie'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required className="input" placeholder="Movie title" />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} className="input resize-none" placeholder="Movie description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Release Year</label>
              <input type="number" value={form.releaseYear} onChange={(e) => setForm(f => ({ ...f, releaseYear: e.target.value }))} className="input" placeholder="2024" />
            </div>
            <div>
              <label className="label">Language</label>
              <input value={form.language} onChange={(e) => setForm(f => ({ ...f, language: e.target.value }))} className="input" placeholder="English" />
            </div>
          </div>
          <div>
            <label className="label">Director</label>
            <input value={form.director} onChange={(e) => setForm(f => ({ ...f, director: e.target.value }))} className="input" placeholder="Director name" />
          </div>
          <div>
            <label className="label">Trailer URL (YouTube)</label>
            <input value={form.trailer} onChange={(e) => setForm(f => ({ ...f, trailer: e.target.value }))} className="input" placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className="label">Poster Image</label>
            <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded accent-primary-500" />
            <span className="text-sm text-slate-300">Published</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : movie ? 'Update Movie' : 'Create Movie'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageMovies() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | movie-object
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies', page, search],
    queryFn: () => moviesApi.getAll({ page, limit: 10, search }).then((r) => r.data),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: moviesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie created!');
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => moviesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie updated!');
      setModal(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: moviesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const movies = data?.data || [];
  const pagination = data?.pagination;

  const handleSave = async (fd) => {
    if (typeof modal === 'object' && modal !== null) {
      await updateMutation.mutateAsync({ id: modal._id, data: fd });
    } else {
      await createMutation.mutateAsync(fd);
    }
  };

  return (
    <PageTransition>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">Manage Movies</h1>
              <p className="text-slate-400 mt-1">{pagination?.total || 0} movies in database</p>
            </div>
            <button id="add-movie-btn" onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Movie
            </button>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input id="movie-admin-search" type="text" placeholder="Search movies..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-11" />
          </div>

          <div className="card p-6">
            <MovieTable movies={movies} loading={isLoading}
              onEdit={(m) => setModal(m)}
              onDelete={(id) => deleteMutation.mutate(id)} />
          </div>

          {pagination?.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-slate-400 text-sm">Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-ghost disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <MovieModal
          movie={typeof modal === 'object' ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
    </PageTransition>
  );
}
