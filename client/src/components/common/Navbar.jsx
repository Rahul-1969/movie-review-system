import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Menu, X, User, LogOut, LayoutDashboard, Heart, Star, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropRef.current && !dropRef.current.contains(e.target)) {
      setDropOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  return (
    <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center group-hover:bg-primary-400 transition-colors">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">MovieReview</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              Browse
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/watchlist" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                  Watchlist
                </Link>
                <Link to="/my-reviews" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                  My Reviews
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" className="px-4 py-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-all text-sm font-medium">
                Admin
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
                <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} />
              </div>
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-200">{user?.name}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass shadow-xl shadow-black/20 animate-fade-in">
                    <div className="p-1">
                      <Link to="/profile" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/watchlist" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 transition-colors">
                        <Heart className="w-4 h-4" /> Watchlist
                      </Link>
                      <Link to="/my-reviews" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 transition-colors">
                        <Star className="w-4 h-4" /> My Reviews
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-primary-400 hover:bg-primary-500/10 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      )}
                      <div className="h-px bg-white/10 my-1" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-2 px-4">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/5 space-y-1 animate-fade-in">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Browse</Link>
            {isAuthenticated && (
              <>
                <Link to="/watchlist" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Watchlist</Link>
                <Link to="/my-reviews" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">My Reviews</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Profile</Link>
                {isAdmin && <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-colors">Admin</Link>}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">Logout</button>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
                <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-500 transform ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} />
              </div>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-ghost text-sm flex-1 text-center">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 text-center">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
