import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import useApi from "../../hooks/useApi";
import useCooldownTimer from "../../hooks/useCooldownTimer";
import RateLimitBanner from "../../components/auth/RateLimitBanner";
import Spinner from "../../components/Spinner";

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const { executeRequest, loading, error, statusCode } = useApi();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const navigate = useNavigate();

  // If we arrived from the "Verify existing account" flow on SignupPage,
  // router state contains cooldownRemaining so we don't need a server round-trip.
  const initialCooldown = location.state?.cooldownRemaining ?? null;

  const { isCoolingDown, formatTime, startCooldown, checking } =
    useCooldownTimer(email, "otp", initialCooldown);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await executeRequest("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (result.success) navigate("/login");
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    setIsRateLimited(false);

    const result = await executeRequest("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (result.success) {
      // Backend returns cooldownRemaining: 300; start timer from that value
      startCooldown(result.data?.cooldownRemaining || 300);
      setResendMessage("OTP resent! Check your email.");
    } else if (statusCode === 429) {
      setIsRateLimited(true);
      setRateLimitMsg(
        result.data?.message ||
          "Too many OTP requests. Please try again later.",
      );
    } else if (result.data?.cooldownRemaining) {
      // If backend says we're still in cooldown, sync the timer to correct value
      startCooldown(result.data.cooldownRemaining);
    }
    setResendLoading(false);
  };

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    padding: "1.5rem",
    backgroundColor: "var(--bg-subtle)",
  };
  const boxStyle = {
    backgroundColor: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "1rem",
    padding: "2rem",
    maxWidth: "28rem",
    width: "100%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    textAlign: "center",
  };

  return (
    <div style={cardStyle}>
      <div style={boxStyle}>
        <h1
          style={{
            color: "var(--text-primary)",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Verify Your Email
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.75rem",
              textAlign: "center",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              fontSize: "1.25rem",
              fontFamily: "monospace",
              letterSpacing: "0.3em",
            }}
          />
          {error && (
            <p style={{ color: "var(--danger)", fontSize: "0.875rem" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {loading ? <Spinner size="sm" /> : "Verify OTP"}
          </button>
        </form>

        {isRateLimited && (
          <RateLimitBanner message={rateLimitMsg} retryAfter="15 minutes" />
        )}
        {/* Resend OTP section */}
        <div style={{ marginTop: "1.5rem" }}>
          {checking ? (
            // Checking server cooldown status on page load
            <Spinner size="sm" />
          ) : isCoolingDown ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Resend OTP in{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                {formatTime()}
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0 auto",
              }}
            >
              {resendLoading ? (
                <>
                  <Spinner size="sm" /> Sending...
                </>
              ) : (
                "Resend OTP"
              )}
            </button>
          )}
          {resendMessage && (
            <p
              style={{
                color: "var(--success-text)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              {resendMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
