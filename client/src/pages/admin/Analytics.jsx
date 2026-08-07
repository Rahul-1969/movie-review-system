import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api.js';
import AdminSidebar from '../../components/admin/AdminSidebar.jsx';
import PageTransition from '../../components/common/PageTransition.jsx';
import { monthName } from '../../utils/formatDate.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-white/10 rounded-lg shadow-xl px-3 py-2 text-xs">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          <AdminSidebar />
          <div className="flex-1 space-y-8 animate-pulse">
            <div>
              <div className="h-10 bg-white/5 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-white/5 rounded w-1/3"></div>
            </div>
            <div className="card p-6 h-[300px] bg-white/5"></div>
            <div className="card p-6 h-[300px] bg-white/5"></div>
            <div className="card p-6 h-[300px] bg-white/5"></div>
          </div>
        </div>
      </div>
      </PageTransition>
    );
  }

  const analytics = data?.data;

  // Transform MongoDB aggregation output for recharts
  const reviewsChart = analytics?.monthlyReviews?.map((d) => ({
    month: `${monthName(d._id.month)} ${d._id.year}`,
    Reviews: d.count,
  })) || [];

  const usersChart = analytics?.monthlyUsers?.map((d) => ({
    month: `${monthName(d._id.month)} ${d._id.year}`,
    Users: d.count,
  })) || [];

  const topMovies = analytics?.topMovies || [];

  return (
    <PageTransition>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-8">
        <AdminSidebar />
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
            <p className="text-slate-400 mt-1">Last 6 months of activity</p>
          </div>

          {/* Reviews Per Month */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white mb-6">Reviews Per Month</h2>
            {reviewsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={reviewsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Reviews" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-12">Not enough data yet</p>
            )}
          </div>

          {/* New Users Per Month */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white mb-6">New Users Per Month</h2>
            {usersChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={usersChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                  <Line type="monotone" dataKey="Users" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-12">Not enough data yet</p>
            )}
          </div>

          {/* Top 5 Movies Table */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white mb-6">Top 5 Most Reviewed Movies</h2>
            {topMovies.length > 0 ? (
              <div className="space-y-3">
                {topMovies.map((m, i) => (
                  <div key={m._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-colors">
                    <span className="text-slate-500 font-bold text-sm w-5 text-center">{i + 1}</span>
                    {m.poster?.url && (
                      <img src={m.poster.url} alt={m.title} className="w-8 h-12 rounded object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.totalReviews} reviews</p>
                    </div>
                    <div className="text-yellow-400 font-bold text-sm">
                      ⭐ {m.averageRating?.toFixed(1)}
                    </div>
                    {/* Rating bar */}
                    <div className="w-24 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full"
                        style={{ width: `${(m.averageRating / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-12">Not enough data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
