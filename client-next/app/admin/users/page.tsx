'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../../../lib/api/admin.api';
import UserTable from '../../../components/admin/UserTable';

export default function ManageUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const res = await adminApi.getUsers({
        page,
        limit: 12,
        search: search.trim() || undefined,
      });
      return res.data;
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleBan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setFeedback({ type: 'success', message: 'User status updated successfully.' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        message: axiosErr.response?.data?.message || 'Failed to update user status.',
      });
    },
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Manage Users</h1>
          <p className="text-slate-400 mt-1">
            {pagination?.total ?? 0} registered user{pagination?.total === 1 ? '' : 's'}
          </p>
        </div>
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

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="user-search"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input pl-11 text-sm"
        />
      </div>

      {/* User Table Card */}
      <div className="card p-6">
        <UserTable
          users={users}
          loading={isLoading}
          onToggleBan={(id) => banMutation.mutate(id)}
          actionPendingId={banMutation.isPending ? (banMutation.variables as string) : null}
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
    </div>
  );
}
