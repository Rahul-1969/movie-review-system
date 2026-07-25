import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Loader2 } from 'lucide-react';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions.js';

export default function SearchAutocomplete({ onSearchChange }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const { data, isLoading } = useSearchSuggestions(query);
  const suggestions = data?.data || [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]._id);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (id) => {
    navigate(`/movies/${id}`);
    setIsOpen(false);
    setQuery('');
    onSearchChange?.('');
  };

  const highlightMatch = (text, q) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <span key={i} className="font-bold text-white">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="relative w-full max-w-xl mx-auto text-left" ref={wrapperRef}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          onSearchChange?.(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm shadow-xl"
      />
      {isLoading && query.length >= 2 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
        </div>
      )}

      {isOpen && query.length >= 2 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 glass shadow-xl shadow-black/20 rounded-xl overflow-hidden z-50 animate-fade-in">
          {suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((movie, index) => (
                <li
                  key={movie._id}
                  onClick={() => handleSelect(movie._id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={movie.poster?.url || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=100&h=150&fit=crop&q=80'}
                    alt={movie.title}
                    className="w-10 h-[60px] object-cover rounded shadow-sm bg-dark-700"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-slate-200 truncate">
                      {highlightMatch(movie.title, query)}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {movie.releaseYear}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-dark-900/50 px-2 py-1 rounded text-xs text-yellow-400 font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'N/A'}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
