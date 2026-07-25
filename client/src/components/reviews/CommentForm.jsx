import { useState } from 'react';
import { useCreateComment, useUpdateComment } from '../../hooks/useComments.js';

export default function CommentForm({ reviewId, parentCommentId = null, initialText = '', onCancel, onSuccess, isEdit = false, commentId = null }) {
  const [text, setText] = useState(initialText);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();

  const isPending = createComment.isPending || updateComment.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || text.length > 500) return;

    if (isEdit) {
      updateComment.mutate(
        { id: commentId, text, reviewId },
        { onSuccess: () => {
          setText('');
          if (onSuccess) onSuccess();
        }}
      );
    } else {
      createComment.mutate(
        { reviewId, parentCommentId, text },
        { onSuccess: () => {
          setText('');
          if (onSuccess) onSuccess();
        }}
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={parentCommentId ? "Write a reply..." : "Write a comment..."}
          className="textarea resize-none pr-16"
          rows={Math.max(2, Math.min(5, text.split('\n').length))}
          maxLength={500}
          required
        />
        <div className="absolute bottom-2 right-3 flex items-center gap-2">
          <span className="text-xs text-slate-500">{text.length}/500</span>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost text-xs py-1.5 px-3">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!text.trim() || text.length > 500 || isPending}
          className="btn-primary text-xs py-1.5 px-4"
        >
          {isPending ? 'Posting...' : (isEdit ? 'Save' : 'Post')}
        </button>
      </div>
    </form>
  );
}
