import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api.js';
import { useAuth } from '../hooks/useAuth.js';
import { PageLoader } from '../components/common/Loader.jsx';
import { Camera, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatDate.js';

export default function Profile() {
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile().then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (formData) => usersApi.updateProfile(formData),
    onSuccess: (res) => {
      updateUser(res.data.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
      setPreview(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  if (isLoading) return <PageLoader />;

  const profile = data?.data;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData();
    fd.append('name', form.name.value);
    if (fileRef.current.files[0]) {
      fd.append('avatar', fileRef.current.files[0]);
    }
    mutation.mutate(fd);
  };

  const avatarUrl = preview || profile?.avatar?.url;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold text-white mb-8">My Profile</h1>

      <div className="card p-8 space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-500/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">{profile?.name}</p>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <p className="text-slate-500 text-xs mt-1">Member since {formatDate(profile?.createdAt, { year: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />

          <div>
            <label htmlFor="profile-name" className="label">Display Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              defaultValue={profile?.name}
              required
              className="input"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={profile?.email}
              disabled
              className="input opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">Role</label>
            <span className={`badge ${profile?.role === 'admin' ? 'badge-primary' : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'} text-sm`}>
              {profile?.role}
            </span>
          </div>

          <button
            type="submit"
            id="save-profile-btn"
            disabled={mutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
