import React from 'react';
import { ShieldBan, ShieldCheck, Loader2 } from 'lucide-react';
import { formatDate } from '../../lib/utils/formatDate';
import { User } from '../../types';

export interface UserTableProps {
  users: User[];
  onToggleBan: (id: string) => void;
  loading: boolean;
  actionPendingId?: string | null;
}

export default function UserTable({
  users,
  onToggleBan,
  loading,
  actionPendingId,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
        <span className="text-xs text-slate-400">Loading user catalog...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left">
            <th className="pb-3 pr-4 text-slate-400 font-medium">User</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Role</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Joined</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Status</th>
            <th className="pb-3 text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users?.map((u) => {
            const userId = u._id || u.id || '';
            const isPending = actionPendingId === userId;

            return (
              <tr key={userId} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {u.avatar?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.avatar.url}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                        alt={u.name}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`badge ${
                      u.role === 'admin'
                        ? 'badge-primary'
                        : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-400">
                  {formatDate(u.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="py-3 pr-4">
                  <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="py-3">
                  {u.role !== 'admin' && (
                    <button
                      id={`ban-user-${userId}`}
                      onClick={() => onToggleBan(userId)}
                      disabled={isPending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                        u.isActive
                          ? 'text-red-400 hover:bg-red-500/10 border border-red-500/20'
                          : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'
                      }`}
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : u.isActive ? (
                        <ShieldBan className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      <span>{u.isActive ? 'Suspend' : 'Activate'}</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!users?.length && (
        <div className="text-center py-10 text-slate-400 text-sm">No users found</div>
      )}
    </div>
  );
}
