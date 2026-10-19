'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, CheckCheck, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../lib/api/notifications.api';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../lib/utils/formatDate';
import { Notification, Movie, Review, Comment, User, NotificationsResponse } from '../../types';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Query notifications only when authenticated
  const {
    data: notifData,
    isLoading,
    isError,
    refetch,
  } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsApi.getAll();
      return res.data;
    },
    enabled: Boolean(isAuthenticated),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationsResponse>(['notifications']);

      queryClient.setQueryData<NotificationsResponse>(['notifications'], (old) => {
        if (!old) return old;
        const list = old.data || [];
        const target = list.find((n) => n._id === id);
        const wasUnread = target && !target.isRead;
        const updated = list.map((n) => (n._id === id ? { ...n, isRead: true } : n));
        return {
          ...old,
          data: updated,
          unreadCount: wasUnread ? Math.max(0, (old.unreadCount || 0) - 1) : old.unreadCount,
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationsResponse>(['notifications']);

      queryClient.setQueryData<NotificationsResponse>(['notifications'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: (old.data || []).map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete single notification
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationsResponse>(['notifications']);

      queryClient.setQueryData<NotificationsResponse>(['notifications'], (old) => {
        if (!old) return old;
        const list = old.data || [];
        const target = list.find((n) => n._id === id);
        const wasUnread = target && !target.isRead;
        return {
          ...old,
          data: list.filter((n) => n._id !== id),
          unreadCount: wasUnread ? Math.max(0, (old.unreadCount || 0) - 1) : old.unreadCount,
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete all read notifications
  const deleteAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationsResponse>(['notifications']);

      queryClient.setQueryData<NotificationsResponse>(['notifications'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: (old.data || []).filter((n) => !n.isRead),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const notifications = notifData?.data || [];
  const unreadCount = notifData?.unreadCount ?? 0;
  const hasRead = notifications.some((n) => n.isRead);

  const buildDeepLink = (n: Notification) => {
    const movieObj = typeof n.movie === 'object' && n.movie !== null ? (n.movie as Movie) : null;
    const movieId = movieObj?._id || movieObj?.id || (typeof n.movie === 'string' ? n.movie : null);
    if (!movieId) return null;

    const reviewObj = typeof n.review === 'object' && n.review !== null ? (n.review as Review) : null;
    const reviewId = reviewObj?._id || reviewObj?.id || (typeof n.review === 'string' ? n.review : null);

    const commentObj = typeof n.comment === 'object' && n.comment !== null ? (n.comment as Comment) : null;
    const commentId = commentObj?._id || commentObj?.id || (typeof n.comment === 'string' ? n.comment : null);

    switch (n.type) {
      case 'review_like':
        return { url: `/movies/${movieId}`, hash: reviewId ? `review-${reviewId}` : null };
      case 'comment':
      case 'comment_like':
        return { url: `/movies/${movieId}`, hash: commentId ? `comment-${commentId}` : reviewId ? `review-${reviewId}` : null };
      default:
        return { url: `/movies/${movieId}`, hash: null };
    }
  };

  const dispatchNavEvent = (targetId: string, delay = 100) => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('notification-nav', { detail: { targetId } }));
      }, delay);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    setOpen(false);

    const link = buildDeepLink(notification);
    if (!link) return;

    const movieObj = typeof notification.movie === 'object' && notification.movie !== null ? (notification.movie as Movie) : null;
    const movieId = movieObj?._id || movieObj?.id || (typeof notification.movie === 'string' ? notification.movie : null);
    if (movieId) {
      queryClient.invalidateQueries({ queryKey: ['movie', movieId] });
    }

    const reviewObj = typeof notification.review === 'object' && notification.review !== null ? (notification.review as Review) : null;
    const reviewId = reviewObj?._id || reviewObj?.id || (typeof notification.review === 'string' ? notification.review : null);
    if (reviewId) {
      queryClient.invalidateQueries({ queryKey: ['comments', reviewId] });
    }

    const targetId = link.hash;
    const alreadyOnPage = pathname === link.url;

    if (alreadyOnPage) {
      if (targetId) dispatchNavEvent(targetId, 50);
    } else {
      router.push(link.hash ? `${link.url}#${link.hash}` : link.url);
      if (targetId) dispatchNavEvent(targetId, 600);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const getNotificationText = (n: Notification) => {
    const actorObj = typeof n.actor === 'object' && n.actor !== null ? (n.actor as User) : null;
    const actorName = actorObj?.name || 'Someone';
    switch (n.type) {
      case 'review_like':
        return `${actorName} liked your review`;
      case 'comment_like':
        return `${actorName} liked your comment`;
      case 'comment':
        return `${actorName} commented on your review`;
      case 'new_movie':
        return `New movie added to catalog`;
      default:
        return `${actorName} interacted with your content`;
    }
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            id="notification-unread-badge"
            className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notification-dropdown"
          role="dialog"
          aria-label="Notifications list"
          className="absolute right-0 mt-2 w-80 sm:w-96 glass shadow-2xl shadow-black/40 rounded-2xl overflow-hidden z-50 border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-dark-900/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  id="notification-mark-all-read-btn"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {hasRead && (
                <button
                  id="notification-clear-read-btn"
                  onClick={() => deleteAllReadMutation.mutate()}
                  disabled={deleteAllReadMutation.isPending}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  title="Clear read notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear read</span>
                </button>
              )}
            </div>
          </div>

          {/* Body / List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : isError ? (
              <div className="p-6 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                <p className="text-xs text-red-400">Failed to load notifications.</p>
                <button
                  onClick={() => refetch()}
                  className="btn-ghost text-xs py-1 px-3 mt-1 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  You will be notified when people interact with your reviews.
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => {
                const actorObj = typeof n.actor === 'object' && n.actor !== null ? (n.actor as User) : null;
                const movieObj = typeof n.movie === 'object' && n.movie !== null ? (n.movie as Movie) : null;
                const isHovered = hoveredId === n._id;

                return (
                  <div
                    key={n._id}
                    id={`notification-item-${n._id}`}
                    className="flex items-stretch group hover:bg-white/5 transition-colors"
                    onMouseEnter={() => setHoveredId(n._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Main Clickable Area */}
                    <button
                      onClick={() => handleNotificationClick(n)}
                      className={`flex-1 min-w-0 text-left px-3.5 py-3 flex items-start gap-3 transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-primary-500/5' : ''
                      }`}
                    >
                      {/* Actor Avatar */}
                      <div className="relative shrink-0">
                        {actorObj?.avatar?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={actorObj.avatar.url}
                            alt={actorObj.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-400">
                            {actorObj?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        {!n.isRead && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-dark-900" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs leading-snug ${
                            !n.isRead ? 'text-white font-medium' : 'text-slate-300'
                          }`}
                        >
                          {getNotificationText(n)}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>

                      {/* Movie Thumbnail */}
                      {movieObj?.poster?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={movieObj.poster.url}
                          alt={movieObj.title}
                          className="w-7 h-10 rounded object-cover shrink-0 self-center bg-dark-800"
                        />
                      )}
                    </button>

                    {/* Delete button */}
                    <div className="flex items-center pr-1.5 shrink-0">
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        disabled={deleteMutation.isPending}
                        title="Delete notification"
                        aria-label="Delete notification"
                        className={`p-2 rounded-lg transition-all duration-150 text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer ${
                          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
