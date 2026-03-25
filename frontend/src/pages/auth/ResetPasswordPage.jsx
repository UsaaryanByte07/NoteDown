import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/Spinner';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const { executeRequest, loading, error } = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState([]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const result = await executeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, ...form }),
    });

    if (result.success) {
      navigate('/login');
    } else if (result.data?.errors) {
      setErrors(result.data.errors);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
        <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-md w-full text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h1 className="text-xl font-bold text-danger mb-3">Invalid Reset Link</h1>
          <p className="text-text-secondary mb-6 text-sm">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password"
            className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all font-semibold text-sm">
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <span className="text-3xl mb-3 block">🔒</span>
          <h1 className="text-2xl font-bold text-text-primary">Set new password</h1>
          <p className="text-text-secondary text-sm mt-1">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">New Password</label>
            <input
              name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Confirm New Password</label>
            <input
              name="confirmPassword" type="password" placeholder="••••••••"
              value={form.confirmPassword} onChange={handleChange} required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {error && (
            <p className="text-danger bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm">{error}</p>
          )}
          {errors.map((err, i) => (
            <p key={i} className="text-danger bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm">{err.msg}</p>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm mt-1 flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 flex justify-center text-sm">
          <Link to="/login" className="text-primary hover:underline">← Back to Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
