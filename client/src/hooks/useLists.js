import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '../api/lists.api.js';
import toast from 'react-hot-toast';

export const useMyLists = () =>
  useQuery({
    queryKey: ['lists', 'my-lists'],
    queryFn: () => listsApi.getMyLists().then((r) => r.data),
  });

export const useList = (id) =>
  useQuery({
    queryKey: ['lists', id],
    queryFn: () => listsApi.getById(id).then((r) => r.data),
    enabled: !!id,
    retry: false,
  });

export const useCreateList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => listsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lists', 'my-lists'] });
      toast.success('List created!');
    },
    onError: () => toast.error('Failed to create list'),
  });
};

export const useUpdateList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => listsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['lists', 'my-lists'] });
      qc.invalidateQueries({ queryKey: ['lists', id] });
      toast.success('List updated!');
    },
    onError: () => toast.error('Failed to update list'),
  });
};

export const useDeleteList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => listsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lists', 'my-lists'] });
      toast.success('List deleted');
    },
    onError: () => toast.error('Failed to delete list'),
  });
};

export const useAddToList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, movieId }) => listsApi.addMovie(listId, movieId),
    onMutate: async ({ listId, movieId }) => {
      await qc.cancelQueries({ queryKey: ['lists', listId] });
      const prev = qc.getQueryData(['lists', listId]);
      qc.setQueryData(['lists', listId], (old) => {
        if (!old?.data?.movies) return old;
        return { ...old, data: { ...old.data, movies: [...old.data.movies, { _id: movieId }] } };
      });
      return { prev };
    },
    onError: (_, { listId }, ctx) => {
      qc.setQueryData(['lists', listId], ctx?.prev);
      toast.error('Failed to add movie');
    },
    onSettled: (_, __, { listId }) => {
      qc.invalidateQueries({ queryKey: ['lists', listId] });
      qc.invalidateQueries({ queryKey: ['lists', 'my-lists'] });
    },
  });
};

export const useRemoveFromList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, movieId }) => listsApi.removeMovie(listId, movieId),
    onMutate: async ({ listId, movieId }) => {
      await qc.cancelQueries({ queryKey: ['lists', listId] });
      const prev = qc.getQueryData(['lists', listId]);
      qc.setQueryData(['lists', listId], (old) => {
        if (!old?.data?.movies) return old;
        return { ...old, data: { ...old.data, movies: old.data.movies.filter(m => (m._id || m) !== movieId) } };
      });
      return { prev };
    },
    onError: (_, { listId }, ctx) => {
      qc.setQueryData(['lists', listId], ctx?.prev);
      toast.error('Failed to remove movie');
    },
    onSettled: (_, __, { listId }) => {
      qc.invalidateQueries({ queryKey: ['lists', listId] });
      qc.invalidateQueries({ queryKey: ['lists', 'my-lists'] });
    },
  });
};
