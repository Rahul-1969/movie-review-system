'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, Loader2, X, Film, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '../../lib/api/movies.api';
import { Movie } from '../../types';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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

function SuggestionPoster({ url, title }: { url?: string; title: string }) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="w-10 h-[60px] rounded-lg shadow-sm bg-dark-800 shrink-0 flex items-center justify-center border border-white/5 text-slate-500">
        <Film className="w-5 h-5 text-slate-400" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={title}
      onError={() => setError(true)}
      className="w-10 h-[60px] object-cover rounded-lg shadow-sm bg-dark-700 shrink-0"
    />
  );
}

export interface SearchAutocompleteProps {
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  onClear?: () => void;
  initialQuery?: string;
  placeholder?: string;
}

export default function SearchAutocomplete({
  onSearchChange,
  onSearchSubmit,
  onClear,
  initialQuery = '',
  placeholder = 'Search by movie title, director, or keywords...',
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query.trim(), 300);

  const {
    data: suggestionsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['movies', 'search-suggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await moviesApi.getSearchSuggestions(debouncedQuery);
      return res.data?.data ?? [];
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 1000 * 60 * 2,
  });

  const suggestions: Movie[] = suggestionsData ?? [];

  // Keep internal query in sync if initialQuery changes from outside
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(-1);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setIsOpen(false);
    router.push(`/movies/${id}`);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    onSearchChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
        return;
      }
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      if (!isOpen) return;
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        const id = selected._id || selected.id;
        if (id) {
          handleSelect(id);
        }
      } else {
        setIsOpen(false);
        const trimmed = query.trim();
        if (trimmed) {
          onSearchSubmit?.(trimmed);
        } else {
          handleClear();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const trimmed = query.trim();
    if (trimmed) {
      onSearchSubmit?.(trimmed);
    } else {
      handleClear();
    }
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q || !text) return text || '';
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <span key={i} className="font-bold text-primary-400">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const hasQuery = query.trim().length >= 1;

  return (
    <form
      onSubmit={handleFormSubmit}
      className="relative w-full max-w-2xl mx-auto text-left"
      ref={wrapperRef}
    >
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          id="hero-movie-search-input"
          role="combobox"
          aria-expanded={isOpen && hasQuery}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="hero-movie-search-listbox"
          aria-label="Search movies by title, director, or keywords"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            onSearchChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (hasQuery) setIsOpen(true);
          }}
          className="w-full bg-dark-800/90 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-32 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm sm:text-base shadow-2xl"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && hasQuery && (
            <Loader2 className="w-4 h-4 text-primary-400 animate-spin mr-1" />
          )}

          {query && (
            <button
              type="button"
              id="hero-search-clear-btn"
              onClick={handleClear}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            id="hero-search-submit-btn"
            className="btn-primary !py-2 !px-4 text-xs sm:text-sm font-medium flex items-center gap-1.5 shrink-0"
          >
            <span>Search</span>
          </button>
        </div>
      </div>

      {isOpen && hasQuery && !isLoading && (
        <div
          id="hero-movie-search-listbox"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 glass shadow-2xl shadow-black/40 border border-white/10 rounded-xl overflow-hidden z-[100] max-h-96 overflow-y-auto"
        >
          {isError ? (
            <div className="p-4 text-center text-sm text-red-400 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to fetch suggestions. Press Enter for full search.</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2 divide-y divide-white/5">
              {suggestions.map((movie, index) => {
                const movieId = movie._id || movie.id;
                if (!movieId) return null;
                const isSelected = selectedIndex === index;

                return (
                  <li
                    key={movieId}
                    id={`search-suggestion-${movieId}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(movieId)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary-500/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <SuggestionPoster url={movie.poster?.url} title={movie.title} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-200 truncate">
                        {highlightMatch(movie.title, query)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {movie.releaseYear || 'Unknown year'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-dark-900/60 px-2.5 py-1 rounded-lg border border-white/5 text-xs text-yellow-400 font-semibold shrink-0">
                      <Star className="w-3 h-3 fill-current" />
                      {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'N/A'}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-400">
              No quick suggestions for &quot;{query}&quot;. Press Enter or click Search for full results.
            </div>
          )}
        </div>
      )}
    </form>
  );
}
