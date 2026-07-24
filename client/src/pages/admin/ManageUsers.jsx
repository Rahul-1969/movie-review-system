import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api.js';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import UserTable from '../../components/admin/UserTable.jsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.getUsers({ page, limit: 12, search }).then((r) => r.data),
    keepPreviousData: true,
  });

  const banMutation = useMutation({
    mutationFn: adminApi.toggleBan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">Manage Users</h1>
              <p className="text-slate-400 mt-1">{pagination?.total || 0} registered users</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="user-search"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-11"
            />
          </div>

          <div className="card p-6">
            <UserTable users={users} loading={isLoading} onToggleBan={(id) => banMutation.mutate(id)} />
          </div>

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-400 text-sm">Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-ghost disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
