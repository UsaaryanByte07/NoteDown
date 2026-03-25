import { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/Spinner';

const ForgotPasswordPage = () => {
  const { executeRequest, loading, error } = useApi();
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const result = await executeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (result.success) {
      setSuccessMessage(result.data.message || 'Password reset email sent. Check your inbox!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <span className="text-3xl mb-3 block">🔑</span>
          <h1 className="text-2xl font-bold text-text-primary">Forgot your password?</h1>
          <p className="text-text-secondary text-sm mt-1">Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Email address</label>
            <input
              name="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {error && (
            <p className="text-danger bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm">{error}</p>
          )}
          {successMessage && (
            <p className="text-success bg-green-50 border border-green-200 px-4 py-2 rounded-lg text-sm">{successMessage}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm mt-1 flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 flex justify-center text-sm">
          <Link to="/login" className="text-primary hover:underline">← Back to Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
