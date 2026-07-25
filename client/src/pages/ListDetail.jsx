import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, Globe, ArrowLeft, Pencil, Trash2, X, Minus } from 'lucide-react';
import { useList, useUpdateList, useDeleteList, useRemoveFromList } from '../hooks/useLists.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/common/Loader.jsx';
import MovieCard from '../components/movies/MovieCard.jsx';
import { getRatingBgColor } from '../utils/ratingHelper.js';

function EditModal({ list, onClose, onSubmit, isPending }) {
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || '');
  const [isPublic, setIsPublic] = useState(list.isPublic);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Edit List</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, description, isPublic }); }} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="input" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} className="textarea resize-none" />
          </div>
          <button type="button" onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${isPublic ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
            {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isPublic ? 'Public' : 'Private'}
          </button>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 text-sm">{isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ListDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useList(id);
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const removeMovie = useRemoveFromList();

  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <PageLoader />;

  // Private list forbidden
  if (error?.response?.status === 403 || data?.message === 'This list is private') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Lock className="w-12 h-12 text-slate-500" />
        <h2 className="text-xl font-bold text-slate-300">This list is private</h2>
        <p className="text-slate-500 text-sm">Only the owner can view this list.</p>
        <Link to="/" className="btn-ghost text-sm mt-2">← Back to Browse</Link>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-slate-300">List not found</h2>
        <Link to="/" className="btn-ghost text-sm">← Back to Browse</Link>
      </div>
    );
  }

  const list = data.data;
  const isOwner = user && list.user?._id === user._id;
  const movies = list.movies ?? [];

  const handleUpdate = (formData) => {
    updateList.mutate({ id, data: formData }, { onSuccess: () => setShowEdit(false) });
  };

  const handleDelete = () => {
    deleteList.mutate(id, { onSuccess: () => navigate('/my-lists') });
  };

  const handleRemoveMovie = (movieId) => {
    removeMovie.mutate({ listId: id, movieId });
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link to="/my-lists" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8">
        <ArrowLeft className="w-4 h-4" /> My Lists
      </Link>

      {/* Header Card */}
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-5">
          {/* Owner */}
          {list.user && (
            <Link to={`/users/${list.user._id}`} className="shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity">
              {list.user.avatar?.url ? (
                <img src={list.user.avatar.url} alt={list.user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  {list.user.name?.[0]?.toUpperCase()}
                </div>
              )}
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">{list.name}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${list.isPublic ? 'bg-primary-500/10 border-primary-500/20 text-primary-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                {list.isPublic ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
              </span>
            </div>
            {list.user && (
              <Link to={`/users/${list.user._id}`} className="text-sm text-slate-400 hover:text-white transition-colors mt-1 block">
                by {list.user.name}
              </Link>
            )}
            {list.description && <p className="text-slate-400 text-sm mt-2 max-w-2xl">{list.description}</p>}
            <p className="text-xs text-slate-500 mt-2">{movies.length} {movies.length === 1 ? 'movie' : 'movies'}</p>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setShowEdit(true)} className="btn-ghost flex items-center gap-1.5 text-sm py-2 px-3">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm py-2 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      {movies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">No movies in this list yet.</p>
          {isOwner && <p className="text-slate-600 text-xs mt-2">Open a movie page and click "Add to List".</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <div key={movie._id} className="relative group">
              <MovieCard movie={movie} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveMovie(movie._id)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Remove from list"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <EditModal list={list} onClose={() => setShowEdit(false)} onSubmit={handleUpdate} isPending={updateList.isPending} />
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-2xl p-6 text-center animate-fade-in">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Delete this list?</h3>
            <p className="text-sm text-slate-400 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleteList.isPending}
                className="flex-1 text-sm px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-all">
                {deleteList.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
