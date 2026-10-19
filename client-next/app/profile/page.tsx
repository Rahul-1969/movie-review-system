'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../lib/api/users.api';

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`shimmer-bg rounded-lg ${className ?? ''}`} />;
}

// ── Inline toast-style feedback (no react-hot-toast dependency) ───────────────
type FeedbackState = { type: 'success' | 'error'; message: string } | null;

function Feedback({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null;
  const isSuccess = feedback.type === 'success';
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border
        ${isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}
    >
      {isSuccess
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />
      }
      {feedback.message}
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────
function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { isAuthenticated, loading, updateUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  // Auth guard — redirect to /login if not authenticated once auth resolves
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Auto-clear feedback after 4 seconds
  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(id);
  }, [feedback]);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile().then((r) => r.data),
    enabled: !loading && isAuthenticated,
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => usersApi.updateProfile(formData),
    onSuccess: (res) => {
      updateUser(res.data.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setPreview(null);
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        message: axiosErr.response?.data?.message || 'Update failed. Please try again.',
      });
    },
  });

  // While auth is resolving or about to redirect, show nothing
  if (loading || !isAuthenticated) {
    return null;
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-9 w-36 mb-8" />
        <div className="card p-8 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-3 w-40 mx-auto" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const profile = data?.data;
  const avatarUrl = preview || profile?.avatar?.url;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData();
    fd.append('name', (form.elements.namedItem('name') as HTMLInputElement).value);
    if (fileRef.current?.files?.[0]) {
      fd.append('avatar', fileRef.current.files[0]);
    }
    mutation.mutate(fd);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold text-white mb-8">My Profile</h1>

      <div className="card p-8 space-y-8">
        {/* ── Avatar section ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-500/20">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={profile?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center transition-colors shadow-lg"
              aria-label="Change avatar"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-white font-semibold">{profile?.name}</p>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <p className="text-slate-500 text-xs mt-1">
              Member since {formatMemberSince(profile?.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Feedback banner ──────────────────────────────────────────────── */}
        <Feedback feedback={feedback} />

        {/* ── Edit form ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Display name */}
          <div>
            <label htmlFor="profile-name" className="label">
              Display Name
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              defaultValue={profile?.name}
              required
              className="input"
            />
          </div>

          {/* Email — read-only */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              readOnly
              className="input opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Role badge */}
          <div>
            <label className="label">Role</label>
            <span
              className={`badge text-sm ${
                profile?.role === 'admin'
                  ? 'badge-primary'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
              }`}
            >
              {profile?.role}
            </span>
          </div>

          {/* Save button */}
          <button
            type="submit"
            id="save-profile-btn"
            disabled={mutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
