import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { moviesApi } from '../api/movies.api.js';
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
