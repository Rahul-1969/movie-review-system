'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Users, Film, MessageSquare, Star, ArrowRight, AlertCircle, BarChart3 } from 'lucide-react';
import { adminApi } from '../../../lib/api/admin.api';
import StatsCard from '../../../components/admin/StatsCard';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminApi.getStats();
      return res.data?.data;
    },
  });

  const stats = data;

  const cards = [
    { title: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'primary' as const },
    { title: 'Total Movies', value: stats?.totalMovies, icon: Film, color: 'emerald' as const },
    { title: 'Total Reviews', value: stats?.totalReviews, icon: MessageSquare, color: 'amber' as const },
    {
      title: 'Avg Rating',
      value: stats?.avgRating ? `${stats.avgRating}/10` : '—',
      icon: Star,
      color: 'violet' as const,
    },
  ];

  const quickLinks = [
    { href: '/admin/movies', label: 'Manage Movies', icon: Film, desc: 'Add, edit, or remove movies' },
    { href: '/admin/users', label: 'Manage Users', icon: Users, desc: 'View users and manage bans' },
    { href: '/admin/reviews', label: 'Flagged Reviews', icon: MessageSquare, desc: 'Review flagged content' },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, desc: 'Charts and platform insights' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview and management</p>
      </div>

      {isError ? (
        <div className="card p-6 text-center space-y-2 border border-red-500/20 bg-red-500/5">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
          <p className="text-sm text-red-400">Failed to load platform statistics.</p>
          <button
            onClick={() => refetch()}
            className="btn-primary text-xs py-1.5 px-4 cursor-pointer mt-2"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="h-4 w-24 bg-dark-800 rounded" />
              <div className="h-8 w-16 bg-dark-800 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <StatsCard key={card.title} {...card} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="card p-5 hover:border-primary-500/30 transition-all hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
