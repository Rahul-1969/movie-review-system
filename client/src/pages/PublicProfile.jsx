import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api.js';
import { Star, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import StarRating from '../components/movies/StarRating.jsx';

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => usersApi.getPublicProfile(id).then((r) => r.data),
    retry: false,
  });

  const isOwnProfile = currentUser?._id === id;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-white/10 mb-6" />
          <div className="w-48 h-8 bg-white/10 rounded mb-4" />
          <div className="w-64 h-6 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">User not found</h2>
        <p className="text-slate-400">This user may have been deleted or the link is incorrect.</p>
        <Link to="/" className="btn btn-primary mt-8 inline-flex">Go Home</Link>
      </div>
    );
  }

  const joinDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Banner / Header */}
      <div className="bg-gradient-to-b from-primary-900/20 to-transparent pt-20 pb-12 px-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center relative">
          
          {isOwnProfile && (
            <div className="absolute top-0 right-0 bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 text-sm flex items-center gap-4">
              <span className="text-slate-300">This is your public profile.</span>
              <Link to="/profile" className="text-primary-400 hover:text-primary-300 font-medium">Edit Profile</Link>
            </div>
          )}

          {data.avatar?.url ? (
            <img 
              src={data.avatar.url} 
              alt={data.name} 
              className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-500/20 mx-auto mb-6"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6">
              {data.name?.[0]?.toUpperCase()}
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-white mb-2">{data.name}</h1>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-8">
            <Calendar className="w-4 h-4" />
            <span>Member since {joinDate}</span>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white mb-1">{data.totalReviews}</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-400">
                <MessageSquare className="w-4 h-4" /> Reviews
              </div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white mb-1">{data.averageRatingGiven}</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-400">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Avg. Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="max-w-5xl mx-auto px-4 pt-12">
        <h2 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-4">Recent Reviews</h2>
        
        {data.recentReviews?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.recentReviews.map((review) => (
              <div key={review._id} className="card p-5 flex gap-4 hover:border-primary-500/30 transition-colors">
                <Link to={`/movies/${review.movie._id}`} className="flex-shrink-0 group">
                  {review.movie.poster?.url ? (
                    <img 
                      src={review.movie.poster.url} 
                      alt={review.movie.title}
                      className="w-16 h-24 object-cover rounded shadow-lg group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-dark-800 rounded shadow-lg flex items-center justify-center" />
                  )}
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/movies/${review.movie._id}`} className="block">
                    <h3 className="font-bold text-white truncate hover:text-primary-400 transition-colors">
                      {review.movie.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-2 mb-3">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-dark-900/50 rounded-xl border border-white/5">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
