'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Star, Calendar, MessageSquare, AlertCircle, Film } from 'lucide-react';
import { usersApi } from '../../../lib/api/users.api';
import { useAuth } from '../../../context/AuthContext';
import StarRating from '../../../components/movies/StarRating';
import { PublicUserProfile } from '../../../types';

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const { user: currentUser } = useAuth();

  const {
    data,
    isLoading,
    isError,
  } = useQuery<PublicUserProfile | null>({
    queryKey: ['publicProfile', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await usersApi.getPublicProfile(id);
      return res.data?.data ?? null;
    },
    enabled: Boolean(id),
    retry: false,
  });

  const isOwnProfile = Boolean(currentUser?._id && id && currentUser._id.toString() === id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-white/10 mb-6" />
          <div className="w-48 h-8 bg-white/10 rounded-xl mb-4" />
          <div className="w-64 h-5 bg-white/10 rounded-lg mb-8" />
          <div className="flex gap-12">
            <div className="w-20 h-12 bg-white/10 rounded-xl" />
            <div className="w-20 h-12 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">User not found</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          This user profile does not exist, may have been removed, or the link is invalid.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex text-sm py-2 px-5">
          Go Home
        </Link>
      </div>
    );
  }

  const joinDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  const recentReviews = data.recentReviews || [];

  return (
    <div className="min-h-screen pb-20">
      {/* ── Banner / Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-primary-900/20 via-transparent to-transparent pt-16 pb-12 px-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center relative">
          {isOwnProfile && (
            <div className="sm:absolute sm:top-0 sm:right-0 mb-6 sm:mb-0 inline-flex items-center gap-3 bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-2 text-xs">
              <span className="text-slate-300">This is your public profile.</span>
              <Link
                href="/profile"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          )}

          {data.avatar?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatar.url}
              alt={data.name}
              className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-500/20 mx-auto mb-6 shadow-2xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6 shadow-2xl">
              {data.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}

          <h1 className="text-3xl font-display font-bold text-white mb-2">{data.name}</h1>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-8">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Member since {joinDate}</span>
          </div>

          <div className="flex items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white mb-1">
                {data.totalReviews ?? 0}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-primary-400" /> Reviews
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white mb-1">
                {data.averageRatingGiven ? Number(data.averageRatingGiven).toFixed(1) : '0.0'}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-medium">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Avg. Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Reviews Section ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">
          Recent Reviews
        </h2>

        {recentReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentReviews.map((review) => {
              const movieId = review.movie?._id || review.movie?.id;
              const posterUrl = review.movie?.poster?.url;

              return (
                <div
                  key={review._id || review.id}
                  className="card p-5 flex gap-4 hover:border-primary-500/30 transition-all hover:-translate-y-0.5"
                >
                  {movieId ? (
                    <Link href={`/movies/${movieId}`} className="shrink-0 group">
                      {posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={posterUrl}
                          alt={review.movie.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform bg-dark-800"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-dark-800 rounded-lg shadow-md flex items-center justify-center text-slate-600">
                          <Film className="w-6 h-6" />
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="w-16 h-24 bg-dark-800 rounded-lg shadow-md flex items-center justify-center text-slate-600 shrink-0">
                      <Film className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {movieId ? (
                      <Link href={`/movies/${movieId}`} className="block">
                        <h3 className="font-semibold text-white truncate hover:text-primary-400 transition-colors text-base">
                          {review.movie?.title || 'Unknown Movie'}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-white truncate text-base">
                        {review.movie?.title || 'Unknown Movie'}
                      </h3>
                    )}

                    <div className="flex items-center gap-3 mt-2 mb-2">
                      <StarRating rating={review.rating} readonly size="sm" />
                      <span className="text-xs text-slate-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-dark-900/50 rounded-2xl border border-white/5">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
