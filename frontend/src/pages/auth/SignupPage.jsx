import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/Spinner';

const SignupPage = () => {
  const { executeRequest, loading, error } = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', terms: false,
  });
  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const result = await executeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ ...form, terms: form.terms ? 'on' : '' }),
    });

    if (result.success) {
      navigate(result.data.redirectTo);
    } else if (result.data?.errors) {
      setErrors(result.data.errors);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-3xl mb-3 block">📝</span>
          <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
          <p className="text-text-secondary text-sm mt-1">Start managing your notes with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-secondary">First Name</label>
              <input name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-secondary">Last Name</label>
              <input name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-secondary">Confirm Password</label>
              <input name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-1">
            <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer" />
            <span className="text-sm text-text-secondary select-none">
              I agree to the <span className="text-primary hover:underline cursor-pointer">Terms &amp; Conditions</span>
            </span>
          </label>

          {error && (
            <p className="text-danger-text bg-danger-light border border-danger px-4 py-2 rounded-lg text-sm">{error}</p>
          )}
          {errors.map((err, i) => (
            <p key={i} className="text-danger-text bg-danger-light border border-danger px-4 py-2 rounded-lg text-sm">{err.msg}</p>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm mt-1 flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm flex flex-col gap-3">
          <Link to="/login" className="text-primary hover:underline">Already have an account? Sign in</Link>
          <VerifyExistingAccount />
        </div>
      </div>
    </div>
  );
};

/* ─── Verify Existing Unverified Account ────────────────────────────────── */
const VerifyExistingAccount = () => {
  const { executeRequest, loading } = useApi();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'error', msg: string }

  const handleCheck = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const result = await executeRequest('/api/auth/check-and-resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (result.success) {
      // Backend redirects to verify-otp regardless of whether a new OTP was sent.
      // We pass cooldownRemaining via router state so VerifyOtpPage can start
      // the correct timer without a separate server round-trip.
      navigate(result.data.redirectTo, {
        state: { cooldownRemaining: result.data.cooldownRemaining },
      });
    } else {
      setFeedback({ type: 'error', msg: result.data?.message || 'Something went wrong.' });
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-text-secondary hover:text-primary transition-colors text-sm"
      >
        Already signed up but not verified?
      </button>
    );
  }

  return (
    <div className="mt-1 p-4 bg-bg-subtle border border-border rounded-xl text-left flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-primary">Verify your existing account</p>
      <p className="text-xs text-text-secondary">
        Enter the email you signed up with. We'll send a verification code, or redirect
        you directly if one was recently sent.
      </p>
      <form onSubmit={handleCheck} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
        {feedback && (
          <p className="text-xs px-3 py-2 rounded-lg border text-danger-text bg-danger-light border-danger">
            {feedback.msg}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : 'Continue to Verify'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setFeedback(null); setEmail(''); }}
            className="px-3 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;