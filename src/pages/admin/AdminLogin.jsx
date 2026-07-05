import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';
import { useToasts, ToastContainer } from './components/Toast.jsx';


export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToasts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Logged in successfully.');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 w-full max-w-sm space-y-5">
        <div>
          <h1 className="font-display font-bold text-2xl">
            <span className="text-ink">&lt;</span>
            <span className="gradient-text">Admin</span>
            <span className="text-ink">/&gt;</span>
          </h1>
          <p className="text-ink/50 text-sm mt-1">Sign in to manage your portfolio</p>
        </div>

        <div>
          <label className="block font-mono text-xs text-ink/50 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full bg-transparent border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-mint"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label className="block font-mono text-xs text-ink/50 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full bg-transparent border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-mint"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 rounded-full bg-accent-violet text-white font-mono text-sm font-medium hover:bg-accent-violet/90 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
