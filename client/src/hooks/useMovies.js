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

export const useInfiniteMovies = (params, options = {}) => {
  const { enabled, ...restOptions } = options;
  return useInfiniteQuery({
    queryKey: ['movies', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => moviesApi.getAll({ ...(params || {}), page: pageParam }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage?.pagination || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    enabled: enabled !== undefined ? Boolean(enabled) : Boolean(params),
    ...restOptions,
  });
};

export const useMovie = (id, isTyping = false) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.getById(id).then((r) => r.data),
    enabled: !!id,
    // Lightweight polling: refreshes movie data (reviews, comments, likes)
    // every 60 seconds while the page is open, or immediately on tab focus.
    // Interval is paused while the user is actively typing in a form so
    // a background refetch doesn't cause any jarring UI behaviour.
    refetchInterval: isTyping ? false : 60000,
    refetchOnWindowFocus: true,
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

// Helper for robust ID comparison across string, ObjectId, and populated objects
const matchesMovieId = (item, targetId) => {
  if (!item || !targetId) return false;
  const targetStr = String(targetId?._id || targetId?.id || targetId);
  if (typeof item === 'string') return item === targetStr;
  const itemId = item._id || item.id || item;
  return String(itemId) === targetStr;
};

export const useToggleWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => usersApi.toggleWatchlist(id),
    onMutate: async (id) => {
      let previousMovie;
      let previousWatchlist;

      try {
        await queryClient.cancelQueries({ queryKey: ['movie', id] });
        await queryClient.cancelQueries({ queryKey: ['watchlist'] });

        previousMovie = queryClient.getQueryData(['movie', id]);
        previousWatchlist = queryClient.getQueryData(['watchlist']);

        // Resolve movie metadata from cache if available for rich optimistic rendering
        const movieObj = (previousMovie && typeof previousMovie === 'object' && 'data' in previousMovie)
          ? previousMovie.data
          : previousMovie;
        const movieDetails = (movieObj && matchesMovieId(movieObj, id))
          ? { ...movieObj, _id: movieObj._id || id, id: movieObj.id || id }
          : { _id: id, id };

        // Optimistically update watchlist query (handles initialized and uninitialized cache)
        queryClient.setQueryData(['watchlist'], (old) => {
          if (!old) {
            return { success: true, data: [movieDetails] };
          }
          const isEnvelope = Boolean(old && typeof old === 'object' && Array.isArray(old.data));
          const isDirectArray = Array.isArray(old);

          // Preserve unrecognized cache structures and log a warning
          if (!isEnvelope && !isDirectArray) {
            console.warn('Unexpected watchlist cache structure encountered; preserving existing cache:', old);
            return old;
          }

          const list = isEnvelope ? old.data : old;
          const validList = list.filter(Boolean);
          const exists = validList.some((m) => matchesMovieId(m, id));

          let updatedList;
          if (exists) {
            updatedList = validList.filter((m) => !matchesMovieId(m, id));
          } else {
            updatedList = [...validList, movieDetails];
          }

          return isEnvelope ? { ...old, data: updatedList } : updatedList;
        });
      } catch (mutateErr) {
        console.warn('Optimistic watchlist update failed, proceeding with server mutation:', mutateErr);
      }

      return { previousMovie, previousWatchlist };
    },
    onSuccess: (res) => {
      if (res?.data?.message) {
        toast.success(res.data.message);
      }
    },
    onError: (err, id, context) => {
      if (context && 'previousMovie' in context) {
        if (context.previousMovie !== undefined) {
          queryClient.setQueryData(['movie', id], context.previousMovie);
        } else {
          queryClient.removeQueries({ queryKey: ['movie', id] });
        }
      }
      if (context && 'previousWatchlist' in context) {
        if (context.previousWatchlist !== undefined) {
          queryClient.setQueryData(['watchlist'], context.previousWatchlist);
        } else {
          queryClient.removeQueries({ queryKey: ['watchlist'] });
        }
      }
      toast.error(err?.response?.data?.message || 'Failed to update watchlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
};
