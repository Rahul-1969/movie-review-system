'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Users,
  MessageSquare,
  BarChart3,
  Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/movies', icon: Film, label: 'Movies' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 card p-4 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-3 border-b border-white/5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-white block">Admin Panel</span>
            <span className="text-[11px] text-slate-400">Management &amp; Controls</span>
          </div>
        </div>

        {/* Mobile horizontal scroll / desktop vertical list */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 lg:shrink ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
