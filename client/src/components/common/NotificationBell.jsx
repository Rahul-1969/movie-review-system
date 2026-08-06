import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useDeleteAllRead } from '../../hooks/useNotifications.js';
import { formatRelativeTime } from '../../utils/formatDate.js';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const dropRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAllRead = useDeleteAllRead();

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;
  const hasRead = notifications.some((n) => n.isRead);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buildDeepLink = (n) => {
    const movieId = n.movie?._id || n.movie;
    if (!movieId) return null;

    const reviewId = n.review?._id || n.review;
    const commentId = n.comment?._id || n.comment;

    switch (n.type) {
      case 'review_like':
      case 'review_comment':
        return { url: `/movies/${movieId}`, hash: reviewId ? `review-${reviewId}` : null };
      case 'comment_like':
      case 'comment_reply':
        return { url: `/movies/${movieId}`, hash: commentId ? `comment-${commentId}` : null };
      default:
        return { url: `/movies/${movieId}`, hash: null };
    }
  };

  const dispatchNavEvent = (targetId, delay = 100) => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('notification-nav', { detail: { targetId } }));
    }, delay);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    setOpen(false);

    const link = buildDeepLink(notification);
    if (!link) return;

    const targetId = link.hash;
    const alreadyOnPage = location.pathname === link.url;

    if (alreadyOnPage) {
      // Already on this movie page — just dispatch the scroll event directly,
      // no navigation needed (and hash wouldn't change anyway).
      if (targetId) dispatchNavEvent(targetId, 50);
    } else {
      // Navigate first, then dispatch after page + reviews have loaded.
      navigate(link.hash ? `${link.url}#${link.hash}` : link.url);
      if (targetId) dispatchNavEvent(targetId, 600);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const getNotificationText = (n) => {
    const actorName = n.actor?.name || 'Someone';
    switch (n.type) {
      case 'review_like':     return `${actorName} liked your review`;
      case 'comment_like':    return `${actorName} liked your comment`;
      case 'comment_reply':   return `${actorName} replied to your comment`;
      case 'review_comment':  return `${actorName} commented on your review`;
      default:                return `${actorName} interacted with your content`;
    }
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse-slow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass shadow-2xl shadow-black/40 rounded-2xl overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
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
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors disabled:opacity-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {hasRead && (
                <button
                  onClick={() => deleteAllRead.mutate()}
                  disabled={deleteAllRead.isPending}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 font-medium transition-colors disabled:opacity-50"
                  title="Clear read notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear read</span>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  className="flex items-stretch group"
                  onMouseEnter={() => setHoveredId(n._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Main clickable row */}
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className={`flex-1 min-w-0 text-left px-3.5 py-3 flex items-start gap-3 transition-colors hover:bg-white/5 ${
                      !n.isRead ? 'bg-primary-500/5' : ''
                    }`}
                  >
                    {/* Actor Avatar */}
                    <div className="relative flex-shrink-0">
                      {n.actor?.avatar?.url ? (
                        <img
                          src={n.actor.avatar.url}
                          alt={n.actor.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-xs font-bold text-primary-400">
                          {n.actor?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      {!n.isRead && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-dark-900" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${!n.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {getNotificationText(n)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>

                    {/* Movie Thumbnail */}
                    {n.movie?.poster?.url && (
                      <img
                        src={n.movie.poster.url}
                        alt={n.movie.title}
                        className="w-7 h-10 rounded object-cover flex-shrink-0 self-center"
                      />
                    )}
                  </button>

                  {/* Delete button — dedicated column, no overlap */}
                  <div className="flex items-center pr-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      disabled={deleteNotification.isPending}
                      title="Delete notification"
                      className={`p-2 rounded-lg transition-all duration-150 text-slate-500 hover:text-red-400 hover:bg-red-500/10 ${
                        hoveredId === n._id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
