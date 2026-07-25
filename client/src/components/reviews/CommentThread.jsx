import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, MoreHorizontal, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatDate.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useDeleteComment, useToggleCommentLike } from '../../hooks/useComments.js';
import CommentForm from './CommentForm.jsx';

export default function CommentThread({ comment, reviewId, level = 0 }) {
  const { user, isAdmin } = useAuth();
  const deleteComment = useDeleteComment();
  const toggleLike = useToggleCommentLike();
  
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { _id, text, user: author, likes, isDeleted, createdAt, updatedAt, replies } = comment;
  
  const isOwner = user?._id === author?._id;
  const isLiked = likes?.some?.((id) => id?.toString?.() === user?._id?.toString?.());
  const wasEdited = updatedAt && createdAt && (new Date(updatedAt) - new Date(createdAt)) > 5000;
  
  // Cap visual nesting at level 2 (0, 1, 2 = 3 levels deep visual indentation max)
  const isMaxLevel = level >= 2;

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      deleteComment.mutate({ id: _id, reviewId });
      setShowMenu(false);
    }
  };

  return (
    <div className={`mt-4 ${level > 0 ? 'pl-4 border-l border-white/5' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isDeleted || !author ? (
            <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-slate-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
          ) : (
            <Link to={`/users/${author._id}`}>
              {author.avatar?.url ? (
                <img src={author.avatar.url} alt={author.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
                  {author.name?.[0]?.toUpperCase()}
                </div>
              )}
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isDeleted || !author ? (
                <span className="text-sm font-semibold text-slate-500">[deleted]</span>
              ) : (
                <Link to={`/users/${author._id}`} className="text-sm font-semibold text-white hover:text-primary-400 transition-colors">
                  {author.name}
                </Link>
              )}
              <span className="text-xs text-slate-500">{formatRelativeTime(createdAt)}</span>
              {wasEdited && !isDeleted && (
                <span className="text-xs text-slate-600 italic">(edited)</span>
              )}
            </div>

            {/* Actions Menu */}
            {!isDeleted && (isOwner || isAdmin) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 glass z-10 shadow-xl overflow-hidden py-1 animate-fade-in">
                    {isOwner && (
                      <button
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <CommentForm
              reviewId={reviewId}
              isEdit
              commentId={_id}
              initialText={text}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <p className={`text-sm mt-1 break-words ${isDeleted ? 'text-slate-500 italic' : 'text-slate-300'}`}>
              {text}
            </p>
          )}

          {/* Interaction Bar */}
          {!isDeleted && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => toggleLike.mutate({ id: _id, reviewId, userId: user?._id })}
                disabled={!user}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  isLiked ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                {likes?.length || 0}
              </button>
              
              <button
                onClick={() => setIsReplying(!isReplying)}
                disabled={!user}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-2">
              <CommentForm
                reviewId={reviewId}
                parentCommentId={_id}
                onCancel={() => setIsReplying(false)}
                onSuccess={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* Render Replies */}
          {replies && replies.length > 0 && (
            <div className="mt-2">
              {replies.map((reply) => (
                <CommentThread
                  key={reply._id}
                  comment={reply}
                  reviewId={reviewId}
                  level={isMaxLevel ? level : level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
