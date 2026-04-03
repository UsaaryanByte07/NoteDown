import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/auth/authContext";
import useApi from "../../hooks/useApi";
import Spinner from "../../components/Spinner";
import RateLimitBanner from "../../components/auth/RateLimitBanner";

const LoginPage = () => {
  const { dispatch } = useAuth();
  const { executeRequest, loading, error, statusCode } = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  // ── Rate limiting ────────────────────────────────────────────────────────────
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");

  // ── Account lockout ──────────────────────────────────────────────────────────
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [lockUntil, setLockUntil] = useState(null); // Used for auto-clear timer + countdown

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked || isRateLimited) return;
    setIsRateLimited(false);

    const result = await executeRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (result.success) {
      dispatch({ type: "LOGIN", payload: { user: result.data.user } });
      navigate("/");
    } else if (statusCode === 429) {
      // IP-level rate limit hit
      setIsRateLimited(true);
      setRateLimitMsg(
        result.data?.message || "Too many login attempts. Please try again later."
      );
    } else if (result.data?.locked) {
      // Account lockout (423)
      setIsLocked(true);
      setLockMessage(result.data.message || "Account is locked.");
      setAttemptsRemaining(0);
      if (result.data.lockUntil) {
        setLockUntil(new Date(result.data.lockUntil));
      }
    } else if (result.data?.redirectTo) {
      // Unverified email → redirect to OTP verification
      navigate(result.data.redirectTo);
    } else if (result.data?.attemptsRemaining !== undefined) {
      // Failed attempt before lockout — show remaining count
      setAttemptsRemaining(result.data.attemptsRemaining);
    }
  };

  // Auto-clear lockout UI exactly when lockUntil elapses (if user stays on page)
  useEffect(() => {
    if (!isLocked || !lockUntil) return;
    const remaining = new Date(lockUntil) - Date.now();
    if (remaining <= 0) {
      setIsLocked(false);
      setLockMessage("");
      setAttemptsRemaining(null);
      return;
    }
    const timeout = setTimeout(() => {
      setIsLocked(false);
      setLockMessage("");
      setAttemptsRemaining(null);
    }, remaining);
    return () => clearTimeout(timeout);
  }, [isLocked, lockUntil]);

  // Format remaining lockout time for display
  const formatLockDuration = () => {
    if (!lockUntil) return "";
    const remaining = new Date(lockUntil) - Date.now();
    if (remaining <= 0) return "Your lock has expired. Try again.";
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} minute(s)`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-3xl mb-3 block">📝</span>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">
            Sign in to your NoteDown account
          </p>
        </div>

        {/* Rate limit banner (IP-level) */}
        {isRateLimited && (
          <RateLimitBanner message={rateLimitMsg} retryAfter="15 minutes" />
        )}

        {/* Account lockout banner */}
        {isLocked && (
          <div
            className="rounded-lg border px-4 py-3 mb-4"
            style={{
              backgroundColor: "var(--danger-light)",
              borderColor: "var(--danger)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--danger-text)" }}>
              🔒 {lockMessage}
            </p>
            {lockUntil && (
              <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
                Time remaining: <strong>{formatLockDuration()}</strong>
              </p>
            )}
            <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
              You can still{" "}
              <Link to="/forgot-password" style={{ color: "var(--primary)" }}>
                reset your password
              </Link>{" "}
              to unlock your account.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isLocked}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              disabled={isLocked}
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm disabled:opacity-60"
            />
          </div>

          {/* Error + attempts warning */}
          {error && !isLocked && !isRateLimited && (
            <div
              className="rounded-lg border px-4 py-3"
              style={{ backgroundColor: "var(--danger-light)", borderColor: "var(--danger)" }}
            >
              <p className="text-sm" style={{ color: "var(--danger-text)" }}>{error}</p>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-xs font-semibold mt-1" style={{ color: "var(--danger-text)" }}>
                  ⚠️ {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining before lockout
                  {attemptsRemaining === 1 && " — your account will be locked for 24 hours"}
                </p>
              )}
            </div>
          )}

          {/* Dot indicator — only shown when ≤3 attempts remain */}
          {attemptsRemaining !== null && attemptsRemaining > 0 && attemptsRemaining <= 3 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "0.625rem",
                    height: "0.625rem",
                    borderRadius: "50%",
                    backgroundColor:
                      i < 5 - attemptsRemaining
                        ? "var(--danger)"
                        : "var(--border)",
                    transition: "background-color 0.2s",
                  }}
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked || isRateLimited}
            className="w-full py-2.5 rounded-lg font-semibold text-sm mt-1 flex justify-center items-center gap-2 transition-all"
            style={{
              backgroundColor: isLocked ? "var(--bg-subtle)" : "var(--primary)",
              color: isLocked ? "var(--text-muted)" : "#fff",
              border: isLocked ? "1px solid var(--border)" : "none",
              cursor: isLocked ? "not-allowed" : "pointer",
              opacity: isRateLimited ? 0.6 : 1,
            }}
          >
            {loading ? (
              <Spinner size="sm" />
            ) : isLocked ? (
              "🔒 Account Locked"
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link to="/signup" className="text-primary hover:underline">
            Don't have an account? Sign up
          </Link>
          {/* Always accessible — even when locked, so user can reset password */}
          <Link
            to="/forgot-password"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
