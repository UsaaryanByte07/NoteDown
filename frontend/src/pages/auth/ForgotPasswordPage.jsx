import { useState } from "react";
import { Link } from "react-router-dom";
import useApi from "../../hooks/useApi";
import useCooldownTimer from "../../hooks/useCooldownTimer";
import Spinner from "../../components/Spinner";

const ForgotPasswordPage = () => {
  const { executeRequest, loading, error } = useApi();
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { isCoolingDown, formatTime, startCooldown, checking } =
    useCooldownTimer(email, "reset");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    const result = await executeRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (result.success) {
      setSuccessMessage(
        result.data.message || "Reset link sent! Check your email.",
      );
      startCooldown(result.data.cooldownRemaining || 300);
    } else if (result.data?.cooldownRemaining) {
      // 429 — backend says cooldown is still active.
      // Sync the timer and reveal the timer block by setting successMessage.
      startCooldown(result.data.cooldownRemaining);
      setSuccessMessage("A reset link was already sent. Please check your email.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-bg-subtle">
      <div className="bg-bg border border-border shadow-md rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <span className="text-3xl mb-3 block">🔑</span>
          <h1 className="text-2xl font-bold text-text-primary">
            Forgot your password?
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">
              Email address
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {error && (
            <p className="text-danger-text bg-danger-light border border-danger px-4 py-2 rounded-lg text-sm">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-success-text bg-success-light border border-success px-4 py-2 rounded-lg text-sm">
              {successMessage}
            </p>
          )}

          {/* Timer — decoupled from successMessage so it shows on any active cooldown,
              including the 429 case on a fresh page load with no prior success state. */}
          {checking ? (
            <div className="flex justify-center"><Spinner size="sm" /></div>
          ) : isCoolingDown ? (
            <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              Resend link in{" "}
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>
                {formatTime()}
              </span>
            </p>
          ) : (
            successMessage && (
              <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                Didn't receive it?{" "}
                <button
                  onClick={handleSubmit}
                  style={{ color: "var(--primary)", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Resend
                </button>
              </p>
            )
          )}

          <button
            type="submit"
            disabled={loading || isCoolingDown}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60 transition-all font-semibold text-sm mt-1 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 flex justify-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            ← Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
