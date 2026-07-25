import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { moviesApi } from '../api/movies.api.js';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useSearchSuggestions = (query) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['movies', 'search-suggestions', debouncedQuery],
    queryFn: () => moviesApi.getSearchSuggestions(debouncedQuery).then((r) => r.data),
    enabled: debouncedQuery.length >= 1,
    staleTime: 0,
  });
};
