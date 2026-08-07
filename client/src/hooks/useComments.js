import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api/comments.api.js';
import toast from 'react-hot-toast';

export const useComments = (reviewId) => {
  return useQuery({
    queryKey: ['comments', reviewId],
    queryFn: () => commentsApi.getByReviewId(reviewId).then((res) => res.data.data),
    enabled: !!reviewId,
  });
};

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => commentsApi.create(data),
    onSuccess: (_, { reviewId }) => {
      qc.invalidateQueries({ queryKey: ['comments', reviewId] });
      // We don't strictly *have* to update the reviews cache here, but 
      // the review component relies on commentCount. We can invalidate reviews too, 
      // or just assume the server handles it and refetch when needed.
      qc.invalidateQueries({ queryKey: ['reviews'] }); 
      qc.invalidateQueries({ queryKey: ['movie'] }); // In case review count is shown there
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    },
  });
};

export const useUpdateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }) => commentsApi.update(id, { text }),
    onSuccess: (data, { reviewId }) => {
      qc.invalidateQueries({ queryKey: ['comments', reviewId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update comment');
    },
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => commentsApi.delete(id),
    onSuccess: (_, { reviewId }) => {
      qc.invalidateQueries({ queryKey: ['comments', reviewId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    },
  });
};

export const useToggleCommentLike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => commentsApi.toggleLike(id),
    onMutate: async ({ id, reviewId, userId }) => {
      await qc.cancelQueries({ queryKey: ['comments', reviewId] });

      const prev = qc.getQueryData(['comments', reviewId]);

      // Recursive function to optimistic update the nested tree
      const updateTree = (nodes) => {
        return nodes.map(node => {
          if (node._id === id) {
            const isLiked = node.likes.includes(userId);
            return {
              ...node,
              likes: isLiked ? node.likes.filter(uid => uid !== userId) : [...node.likes, userId]
            };
          }
          if (node.replies && node.replies.length > 0) {
            return { ...node, replies: updateTree(node.replies) };
          }
          return node;
        });
      };

      qc.setQueryData(['comments', reviewId], (old) => {
        if (!Array.isArray(old)) return old;
        return updateTree(old);
      });

      return { prev };
    },
    onError: (err, { reviewId }, context) => {
      qc.setQueryData(['comments', reviewId], context.prev);
      console.error('[useToggleCommentLike] Failed to toggle comment like:', err);
      toast.error(err.response?.data?.message || 'Failed to toggle like');
    },
    onSettled: (_, __, { reviewId }) => {
      qc.invalidateQueries({ queryKey: ['comments', reviewId] });
    },
  });
};
