import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lock, Globe, Film, Pencil, Trash2, X, ChevronRight } from 'lucide-react';
import { useMyLists, useCreateList, useDeleteList, useUpdateList } from '../hooks/useLists.js';
import { ListCardSkeleton } from '../components/common/Skeleton.jsx';
import PageTransition from '../components/common/PageTransition.jsx';

function PosterCollage({ movies = [] }) {
  const posters = movies.slice(0, 4);
  if (posters.length === 0) {
    return (
      <div className="w-full aspect-video bg-dark-800 flex items-center justify-center rounded-t-xl">
        <Film className="w-10 h-10 text-slate-600" />
      </div>
    );
  }
  if (posters.length === 1) {
    return (
      <div className="w-full aspect-video rounded-t-xl overflow-hidden">
        <img src={posters[0].poster?.url} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 aspect-video rounded-t-xl overflow-hidden gap-0.5 bg-dark-900">
      {[0, 1, 2, 3].map((i) =>
        posters[i] ? (
          <img key={i} src={posters[i].poster?.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div key={i} className="bg-dark-800" />
        )
      )}
    </div>
  );
}

function ListFormModal({ onClose, onSubmit, initialValues = {}, title = 'Create New List', isPending }) {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [isPublic, setIsPublic] = useState(initialValues.isPublic ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), isPublic });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">List Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Marvel Collection"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Optional description..."
              className="textarea resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
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
            <span className="text-xs text-slate-500">{isPublic ? 'Visible to everyone' : 'Only you can see this'}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">Cancel</button>
            <button type="submit" disabled={isPending || !name.trim()} className="btn-primary flex-1 text-sm">
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyLists() {
  const { data, isLoading } = useMyLists();
  const createList = useCreateList();
  const deleteList = useDeleteList();
  const updateList = useUpdateList();

  const [showCreate, setShowCreate] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const lists = data?.data || [];

  const handleCreate = (formData) => {
    createList.mutate(formData, { onSuccess: () => setShowCreate(false) });
  };

  const handleUpdate = (formData) => {
    updateList.mutate({ id: editingList._id, data: formData }, { onSuccess: () => setEditingList(null) });
  };

  const handleDelete = (list) => {
    deleteList.mutate(list._id, { onSuccess: () => setConfirmDelete(null) });
  };

  if (isLoading) return (
    <PageTransition>
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-32 shimmer-bg rounded-xl" />
            <div className="h-4 w-20 shimmer-bg rounded-lg" />
          </div>
          <div className="h-10 w-28 shimmer-bg rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ListCardSkeleton key={i} />)}
        </div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Lists</h1>
          <p className="text-slate-400 text-sm mt-1">{lists.length} {lists.length === 1 ? 'list' : 'lists'}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New List
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No lists yet</h2>
          <p className="text-slate-500 mb-6 text-sm">Create your first list to organize movies you love.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary gap-2 inline-flex items-center">
            <Plus className="w-4 h-4" /> Create a List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {lists.map((list) => (
            <div key={list._id} className="group card overflow-hidden hover:ring-1 hover:ring-primary-500/30 transition-all">
              <Link to={`/lists/${list._id}`}>
                <PosterCollage movies={list.movies} />
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/lists/${list._id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">{list.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{list.movies?.length ?? 0} movies</p>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    {list.isPublic
                      ? <Globe className="w-3.5 h-3.5 text-primary-400" />
                      : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                  </div>
                </div>
                {list.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{list.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setEditingList(list)}
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
                  <Link to={`/lists/${list._id}`} className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-primary-400 transition-colors">
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <ListFormModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          isPending={createList.isPending}
        />
      )}

      {/* Edit Modal */}
      {editingList && (
        <ListFormModal
          title="Edit List"
          initialValues={editingList}
          onClose={() => setEditingList(null)}
          onSubmit={handleUpdate}
          isPending={updateList.isPending}
        />
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Delete "{confirmDelete.name}"?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost flex-1 text-sm">Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
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
    </PageTransition>
  );
}
