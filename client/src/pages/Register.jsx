import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to MovieReview 🎬');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (() => {
    const pw = form.password;
    if (!pw) return { label: '', color: '' };
    if (pw.length < 6) return { label: 'Too short', color: 'text-red-400' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw)) return { label: 'Weak', color: 'text-orange-400' };
    if (pw.length >= 10) return { label: 'Strong', color: 'text-emerald-400' };
    return { label: 'Good', color: 'text-yellow-400' };
  })();

  return (
    <PageTransition>
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Create an account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join the community of film lovers</p>
        </div>

        <div className="glass p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters with uppercase + number"
                  className="input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <p className={`text-xs mt-1.5 font-medium ${pwStrength.color}`}>
                  Password strength: {pwStrength.label}
                </p>
              )}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
