import { useState } from 'react';
import useApi from '../../hooks/useApi';
import useCooldownTimer from '../../hooks/useCooldownTimer';
import { useAuth } from '../../context/auth/authContext';
import Spinner from '../Spinner';

const ResetPasswordSection = () => {
    const { user } = useAuth();
    const { executeRequest, loading, error } = useApi();
    // Pass the logged-in user's email so the hook can server-sync the cooldown on page load.
    // Type 'otp' matches what getCooldownStatus uses for otpExpiry.
    const { isCoolingDown, formatTime, startCooldown, checking } = useCooldownTimer(user?.email, 'otp');

    // step: 1 = initial request button, 2 = OTP + new password form
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ otp: '', password: '', confirmPassword: '' });
    const [successMsg, setSuccessMsg] = useState('');
    const [done, setDone] = useState(false); // true after a successful password reset

    const handleRequestOtp = async () => {
        const result = await executeRequest('/api/auth/profile/request-password-reset', {
            method: 'POST',
        });
        if (result.success) {
            startCooldown(300); // 5-minute cooldown
            setStep(2);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        const result = await executeRequest('/api/auth/profile/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (result.success) {
            setSuccessMsg('Password reset successfully!');
            // Hide the OTP form and the timer; show only the success message
            setDone(true);
            setStep(1);
            setForm({ otp: '', password: '', confirmPassword: '' });
        }
    };

    const cardStyle = {
        backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: '1rem', padding: '1.5rem',
    };
    const inputStyle = {
        width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)',
        border: '1px solid var(--border)', borderRadius: '0.5rem',
        fontSize: '0.875rem', marginTop: '0.25rem',
    };
    const btnStyle = {
        padding: '0.625rem 1.25rem',
        backgroundColor: 'var(--primary)', color: '#fff',
        border: 'none', borderRadius: '0.5rem',
        fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        minWidth: '8rem',
    };

    return (
        <div style={cardStyle}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>
                Reset Password
            </h3>

            {/* Success message — shown after a completed reset; hides everything else */}
            {done && (
                <p style={{ color: 'var(--success-text)', fontSize: '0.875rem' }}>
                    ✅ {successMsg}
                </p>
            )}

            {/* Step 1 — initial state: show request button or cooldown timer */}
            {!done && step === 1 && (
                <>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        We'll send a one-time password to your email address.
                    </p>
                    {checking ? (
                        // Checking if cooldown is active on page load
                        <Spinner size="sm" />
                    ) : isCoolingDown ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Resend OTP in{' '}
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                                {formatTime()}
                            </span>
                        </p>
                    ) : (
                        <button onClick={handleRequestOtp} disabled={loading} style={btnStyle}>
                            {loading ? <Spinner size="sm" /> : 'Request OTP'}
                        </button>
                    )}
                </>
            )}

            {/* Step 2 — OTP + new password form */}
            {!done && step === 2 && (
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>OTP (from your email)</label>
                        <input type="text" value={form.otp} onChange={e => setForm(p => ({ ...p, otp: e.target.value }))}
                            required maxLength={6} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>New Password</label>
                        <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            required style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Confirm Password</label>
                        <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                            required style={inputStyle} />
                    </div>
                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}
                    <button type="submit" disabled={loading} style={btnStyle}>
                        {loading ? <Spinner size="sm" /> : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ResetPasswordSection;