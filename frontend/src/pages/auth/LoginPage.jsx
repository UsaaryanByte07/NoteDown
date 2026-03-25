import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/auth/authContext';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/Spinner';

const LoginPage = () => {
  const { dispatch } = useAuth();
  const { executeRequest, loading, error } = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await executeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (result.success) {
      dispatch({ type: 'LOGIN', payload: { user: result.data.user } });
      navigate('/');
    } else if (result.data?.redirectTo) {
      navigate(result.data.redirectTo);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-3xl mb-3 block">📝</span>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">Sign in to your NoteDown account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <input
              name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <input
              name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {error && (
            <p className="text-danger bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm mt-1 flex justify-center items-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link to="/signup" className="text-primary hover:underline">Don't have an account? Sign up</Link>
          <Link to="/forgot-password" className="text-text-secondary hover:text-text-primary transition-colors">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;