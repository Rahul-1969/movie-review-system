import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Users,
  MessageSquare,
  BarChart3,
  Film as FilmIcon,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/movies', icon: Film, label: 'Movies' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 card p-4 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <FilmIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">Admin Panel</span>
        </div>

        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
