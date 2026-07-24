import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api.js';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import StatsCard from '../../components/admin/StatsCard.jsx';
import { PageLoader } from '../../components/common/Loader.jsx';
import { Users, Film, MessageSquare, Star, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data),
  });

  if (isLoading) return <PageLoader />;

  const stats = data?.data;

  const cards = [
    { title: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'primary' },
    { title: 'Total Movies', value: stats?.totalMovies, icon: Film, color: 'emerald' },
    { title: 'Total Reviews', value: stats?.totalReviews, icon: MessageSquare, color: 'amber' },
    { title: 'Avg Rating', value: stats?.avgRating ? `${stats.avgRating}/10` : '—', icon: Star, color: 'violet' },
  ];

  const quickLinks = [
    { to: '/admin/movies', label: 'Manage Movies', icon: Film, desc: 'Add, edit, or remove movies' },
    { to: '/admin/users', label: 'Manage Users', icon: Users, desc: 'View users and manage bans' },
    { to: '/admin/reviews', label: 'Flagged Reviews', icon: MessageSquare, desc: 'Review flagged content' },
    { to: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard, desc: 'Charts and insights' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        <AdminSidebar />
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">Platform overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
              <StatsCard key={card.title} {...card} />
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-display font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map(({ to, label, icon: Icon, desc }) => (
                <Link key={to} to={to}
                  className="card p-5 hover:border-primary-500/30 transition-all hover:-translate-y-0.5 group">
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
      </div>
    </div>
  );
}
