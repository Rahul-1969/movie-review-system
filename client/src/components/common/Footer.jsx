import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-950/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">MovieReview</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Your go-to platform for honest film criticism. Discover, review, and share your thoughts on the latest and greatest films.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Explore</h3>
            <ul className="space-y-2">
              {[
                { label: 'Browse Movies', to: '/' },
                { label: 'Top Rated', to: '/?sort=-averageRating' },
                { label: 'My Watchlist', to: '/watchlist' },
                { label: 'My Reviews', to: '/my-reviews' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Account</h3>
            <ul className="space-y-2">
              {[
                { label: 'Sign In', to: '/login' },
                { label: 'Create Account', to: '/register' },
                { label: 'Profile', to: '/profile' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} MovieReview. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <span>Built with</span>
            <span className="text-primary-400 font-medium px-1">MERN Stack</span>
            <span>+ Redis + BullMQ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
