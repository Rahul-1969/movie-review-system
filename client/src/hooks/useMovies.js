import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { moviesApi } from '../api/movies.api.js';
import { usersApi } from '../api/users.api.js';
import toast from 'react-hot-toast';

export const useMovies = (params) => {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => moviesApi.getAll(params).then((r) => r.data),
    keepPreviousData: true,
  });
};

export const useInfiniteMovies = (params) => {
  return useInfiniteQuery({
    queryKey: ['movies', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => moviesApi.getAll({ ...params, page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
  });
};

export const useMovie = (id) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
};

export const useTopRated = () => {
  return useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => moviesApi.getTopRated().then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });
};

export const useTrending = () => {
  return useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => moviesApi.getTrending().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecommendations = (isAuthenticated) => {
  return useQuery({
    queryKey: ['movies', 'recommendations'],
    queryFn: () => moviesApi.getRecommendations().then((r) => r.data),
    enabled: !!isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moviesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie created successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create movie'),
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => moviesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
      toast.success('Movie updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update movie'),
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moviesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete movie'),
  });
};

export const useToggleWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => usersApi.toggleWatchlist(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['movie', id] });
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });

      const previousMovie = queryClient.getQueryData(['movie', id]);
      const previousWatchlist = queryClient.getQueryData(['watchlist']);

      // Optimistically update watchlist query
      if (previousWatchlist) {
        queryClient.setQueryData(['watchlist'], (old) => {
          if (!old) return old;
          const exists = old.some(m => m._id === id);
          if (exists) {
            return old.filter(m => m._id !== id);
          } else {
            // Ideally we'd have the full movie object, but we only have ID. 
            // The UI usually only checks if it exists, so adding a minimal object works for the includes/some check.
            return [...old, { _id: id }];
          }
        });
      }

      return { previousMovie, previousWatchlist };
    },
    onError: (err, id, context) => {
      if (context?.previousMovie) {
        queryClient.setQueryData(['movie', id], context.previousMovie);
      }
      if (context?.previousWatchlist) {
        queryClient.setQueryData(['watchlist'], context.previousWatchlist);
      }
      toast.error(err.response?.data?.message || 'Failed to update watchlist');
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};
