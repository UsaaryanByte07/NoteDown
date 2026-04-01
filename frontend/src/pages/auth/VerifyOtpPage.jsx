import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/Spinner';

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const { executeRequest, loading, error } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await executeRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (result.success) navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-md w-full text-center">
        <span className="text-3xl mb-3 block">✉️</span>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Verify your email</h1>
        <p className="text-text-secondary text-sm mb-6">
          Enter the 6-digit OTP sent to <strong className="text-text-primary">{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <input
            type="text" maxLength={6} value={otp}
            onChange={e => setOtp(e.target.value)} placeholder="000000" required
            className="w-full px-4 py-3 text-center tracking-[0.5em] font-bold text-2xl bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all uppercase"
          />
          {error && (
            <p className="text-danger-text bg-danger-light border border-danger px-4 py-2 rounded-lg text-sm">{error}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;