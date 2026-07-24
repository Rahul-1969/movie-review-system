import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api.js';
import toast from 'react-hot-toast';

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
  return useMutation({
    mutationFn: reviewsApi.toggleLike,
    onSuccess: () => {
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
