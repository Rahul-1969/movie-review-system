'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Film,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../../lib/api/admin.api';
import { monthName } from '../../../lib/utils/formatDate';

interface ChartPoint {
  label: string;
  value: number;
}

export default function AnalyticsPage() {
  const [hoveredReviewIdx, setHoveredReviewIdx] = useState<number | null>(null);
  const [hoveredUserIdx, setHoveredUserIdx] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await adminApi.getAnalytics();
      return res.data?.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const analytics = data;

  // Process data for charts
  const reviewsData: ChartPoint[] =
    analytics?.monthlyReviews?.map((d) => ({
      label: `${monthName(d._id.month)} ${d._id.year}`,
      value: d.count,
    })) || [];

  const usersData: ChartPoint[] =
    analytics?.monthlyUsers?.map((d) => ({
      label: `${monthName(d._id.month)} ${d._id.year}`,
      value: d.count,
    })) || [];

  const topMovies = analytics?.topMovies || [];

  // Aggregated summary metrics
  const totalRecentReviews = reviewsData.reduce((acc, d) => acc + d.value, 0);
  const totalRecentUsers = usersData.reduce((acc, d) => acc + d.value, 0);

  // SVG Chart Dimensions
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Max value calculation for Bar Chart (Reviews)
  const maxReviews = Math.max(...reviewsData.map((d) => d.value), 5);
  // Max value calculation for Line Chart (Users)
  const maxUsers = Math.max(...usersData.map((d) => d.value), 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Platform activity and trends over the last 6 months</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-ghost flex items-center gap-2 self-start sm:self-auto text-xs py-2 px-3 border border-white/10 hover:border-white/20 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {isError ? (
        <div className="card p-8 text-center space-y-3 border border-red-500/20 bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">Failed to load analytics</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            An error occurred while fetching analytical metrics from the server.
          </p>
          <button onClick={() => refetch()} className="btn-primary text-xs py-2 px-4 mt-2">
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5 h-24 bg-white/5 rounded-2xl" />
            <div className="card p-5 h-24 bg-white/5 rounded-2xl" />
          </div>
          <div className="card p-6 h-[320px] bg-white/5 rounded-2xl" />
          <div className="card p-6 h-[320px] bg-white/5 rounded-2xl" />
          <div className="card p-6 h-[320px] bg-white/5 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5 border border-primary-500/20 bg-gradient-to-br from-primary-500/10 via-dark-900 to-dark-950 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                  6-Month Reviews
                </p>
                <h3 className="text-3xl font-bold text-white mt-1 font-display">
                  {totalRecentReviews}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Total reviews submitted</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>

            <div className="card p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-dark-900 to-dark-950 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  6-Month Registrations
                </p>
                <h3 className="text-3xl font-bold text-white mt-1 font-display">
                  {totalRecentUsers}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">New user accounts created</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Reviews Per Month Bar Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  <span>Reviews Per Month</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Review activity grouped by month</p>
              </div>
            </div>

            {reviewsData.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[500px]">
                  <svg
                    viewBox={`0 0 600 ${chartHeight}`}
                    className="w-full h-64 overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {/* Background Grid Lines & Y-Axis Labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const y = paddingY + (chartHeight - paddingY * 2) * (1 - ratio);
                      const value = Math.round(maxReviews * ratio);
                      return (
                        <g key={ratio}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={600 - paddingX}
                            y2={y}
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={paddingX - 10}
                            y={y + 4}
                            fill="#64748b"
                            fontSize="10"
                            textAnchor="end"
                          >
                            {value}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars */}
                    {reviewsData.map((d, i) => {
                      const availableWidth = 600 - paddingX * 2;
                      const colWidth = availableWidth / reviewsData.length;
                      const barWidth = Math.min(36, colWidth * 0.55);
                      const barX = paddingX + i * colWidth + (colWidth - barWidth) / 2;
                      const barHeight =
                        ((d.value / maxReviews) * (chartHeight - paddingY * 2)) || 4;
                      const barY = chartHeight - paddingY - barHeight;
                      const isHovered = hoveredReviewIdx === i;

                      return (
                        <g
                          key={d.label}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredReviewIdx(i)}
                          onMouseLeave={() => setHoveredReviewIdx(null)}
                        >
                          {/* Hover Backdrop Glow */}
                          {isHovered && (
                            <rect
                              x={barX - 4}
                              y={paddingY}
                              width={barWidth + 8}
                              height={chartHeight - paddingY * 2}
                              fill="rgba(99, 102, 241, 0.08)"
                              rx="6"
                            />
                          )}

                          {/* The Bar */}
                          <defs>
                            <linearGradient id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#4f46e5" />
                            </linearGradient>
                          </defs>
                          <rect
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={barHeight}
                            fill={`url(#bar-grad-${i})`}
                            rx="4"
                            className="transition-all duration-300"
                            filter={isHovered ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))' : undefined}
                          />

                          {/* Hover value label above bar */}
                          {isHovered && (
                            <g>
                              <rect
                                x={barX + barWidth / 2 - 22}
                                y={Math.max(4, barY - 26)}
                                width="44"
                                height="20"
                                rx="4"
                                fill="#1e293b"
                                stroke="rgba(255,255,255,0.15)"
                              />
                              <text
                                x={barX + barWidth / 2}
                                y={Math.max(4, barY - 26) + 14}
                                fill="#ffffff"
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {d.value}
                              </text>
                            </g>
                          )}

                          {/* X-Axis Label */}
                          <text
                            x={barX + barWidth / 2}
                            y={chartHeight - paddingY + 18}
                            fill={isHovered ? '#ffffff' : '#94a3b8'}
                            fontSize="11"
                            textAnchor="middle"
                            fontWeight={isHovered ? '600' : 'normal'}
                          >
                            {d.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Not enough review data recorded in the last 6 months
              </div>
            )}
          </div>

          {/* New Users Per Month Area/Line Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-white text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>New Users Per Month</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Account registrations trend</p>
              </div>
            </div>

            {usersData.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[500px]">
                  <svg
                    viewBox={`0 0 600 ${chartHeight}`}
                    className="w-full h-64 overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="user-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const y = paddingY + (chartHeight - paddingY * 2) * (1 - ratio);
                      const value = Math.round(maxUsers * ratio);
                      return (
                        <g key={ratio}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={600 - paddingX}
                            y2={y}
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={paddingX - 10}
                            y={y + 4}
                            fill="#64748b"
                            fontSize="10"
                            textAnchor="end"
                          >
                            {value}
                          </text>
                        </g>
                      );
                    })}

                    {/* Line path computation */}
                    {(() => {
                      const availableWidth = 600 - paddingX * 2;
                      const colWidth =
                        usersData.length > 1
                          ? availableWidth / (usersData.length - 1)
                          : availableWidth;

                      const points = usersData.map((d, i) => {
                        const x =
                          usersData.length > 1
                            ? paddingX + i * colWidth
                            : paddingX + availableWidth / 2;
                        const y =
                          chartHeight -
                          paddingY -
                          (d.value / maxUsers) * (chartHeight - paddingY * 2);
                        return { x, y, ...d };
                      });

                      const pathD = points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                        .join(' ');

                      const firstPoint = points[0];
                      const lastPoint = points[points.length - 1];
                      const areaD = `${pathD} L ${lastPoint.x} ${
                        chartHeight - paddingY
                      } L ${firstPoint.x} ${chartHeight - paddingY} Z`;

                      return (
                        <>
                          {/* Gradient Fill */}
                          <path d={areaD} fill="url(#user-area-grad)" />

                          {/* Line */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Data Points */}
                          {points.map((p, i) => {
                            const isHovered = hoveredUserIdx === i;
                            return (
                              <g
                                key={p.label}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredUserIdx(i)}
                                onMouseLeave={() => setHoveredUserIdx(null)}
                              >
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={isHovered ? '6' : '4'}
                                  fill="#10b981"
                                  stroke="#0f172a"
                                  strokeWidth="2"
                                  className="transition-all duration-200"
                                />

                                {isHovered && (
                                  <g>
                                    <rect
                                      x={p.x - 22}
                                      y={Math.max(4, p.y - 28)}
                                      width="44"
                                      height="20"
                                      rx="4"
                                      fill="#1e293b"
                                      stroke="rgba(255,255,255,0.15)"
                                    />
                                    <text
                                      x={p.x}
                                      y={Math.max(4, p.y - 28) + 14}
                                      fill="#ffffff"
                                      fontSize="11"
                                      fontWeight="bold"
                                      textAnchor="middle"
                                    >
                                      {p.value}
                                    </text>
                                  </g>
                                )}

                                <text
                                  x={p.x}
                                  y={chartHeight - paddingY + 18}
                                  fill={isHovered ? '#ffffff' : '#94a3b8'}
                                  fontSize="11"
                                  textAnchor="middle"
                                  fontWeight={isHovered ? '600' : 'normal'}
                                >
                                  {p.label}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Not enough user registration data recorded in the last 6 months
              </div>
            )}
          </div>

          {/* Top 5 Most Reviewed Movies */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-white text-lg flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-400" />
                  <span>Top 5 Most Reviewed Movies</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked by overall review volume and community reception
                </p>
              </div>
            </div>

            {topMovies.length > 0 ? (
              <div className="space-y-3">
                {topMovies.map((m, i) => {
                  const movieId = m._id || (m as { id?: string }).id;
                  const ratingPercent = Math.min(100, Math.max(0, (m.averageRating / 10) * 100));

                  return (
                    <div
                      key={m._id}
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-dark-900/60 hover:bg-white/[0.03] border border-white/5 transition-all group"
                    >
                      <div className="w-6 text-center font-bold font-display text-sm">
                        {i === 0 ? (
                          <span className="text-amber-400">1</span>
                        ) : i === 1 ? (
                          <span className="text-slate-300">2</span>
                        ) : i === 2 ? (
                          <span className="text-amber-600">3</span>
                        ) : (
                          <span className="text-slate-500">{i + 1}</span>
                        )}
                      </div>

                      {m.poster?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.poster.url}
                          alt={m.title}
                          className="w-10 h-14 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded-lg bg-dark-800 border border-white/10 flex items-center justify-center text-slate-600 shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {movieId ? (
                          <Link
                            href={`/movies/${movieId}`}
                            className="font-medium text-white text-sm hover:text-primary-400 transition-colors truncate block"
                          >
                            {m.title}
                          </Link>
                        ) : (
                          <p className="font-medium text-white text-sm truncate">{m.title}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {m.totalReviews ?? m.reviewCount ?? 0} review{(m.totalReviews ?? m.reviewCount ?? 0) === 1 ? '' : 's'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm shrink-0">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{m.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>

                      {/* Rating Progress Bar */}
                      <div className="w-24 sm:w-32 h-2 bg-dark-800 rounded-full overflow-hidden shrink-0 border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${ratingPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No movie activity recorded yet
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
