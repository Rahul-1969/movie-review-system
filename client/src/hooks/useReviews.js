import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api.js';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth.js';

export const useMyReviews = (params) => {
  return useQuery({
    queryKey: ['my-reviews', params],
    queryFn: () => reviewsApi.getMyReviews(params).then((r) => r.data),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['movie', variables.movieId] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      toast.success('Review submitted!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review'),
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => reviewsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      toast.success('Review updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update review'),
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      toast.success('Review deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete review'),
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: reviewsApi.toggleLike,
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ['movie'] });
      
      const previousMovies = queryClient.getQueriesData({ queryKey: ['movie'] });

      queryClient.setQueriesData({ queryKey: ['movie'] }, (old) => {
        if (!old || !old.data || !old.data.reviews) return old;
        
        const newReviews = old.data.reviews.map(review => {
          if (review._id === reviewId) {
            const userId = user?._id;
            const isLiked = review.likes?.includes(userId);
            return {
              ...review,
              likes: isLiked 
                ? review.likes.filter(id => id !== userId)
                : [...(review.likes || []), userId]
            };
          }
          return review;
        });

        return {
          ...old,
          data: {
            ...old.data,
            reviews: newReviews
          }
        };
      });

      return { previousMovies };
    },
    onError: (err, reviewId, context) => {
      if (context?.previousMovies) {
        context.previousMovies.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('[useToggleLike] Failed to toggle review like:', err);
      toast.error(err.response?.data?.message || 'Failed to toggle like');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['movie'] });
    },
  });
};

export const useFlagReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.flag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      toast.success('Review flag status updated');
    },
  });
};
