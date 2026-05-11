import { useEffect, useState } from "react";

const MaintenancePage = ({ message, endsAt }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  // Countdown timer — recalculates every second
  useEffect(() => {
    if (!endsAt) return;

    const endTime = new Date(endsAt).getTime();

    const tick = () => {
      const now = Date.now();
      const remaining = endTime - now;
      if (remaining <= 0) {
        setTimeLeft(null);
        // Auto-reload — maintenance may have ended
        window.location.reload();
        return;
      }
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  // Auto-reload every 60 seconds to detect if maintenance has ended
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-subtle)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛠️</div>

        {/* Title */}
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
          }}
        >
          We&apos;ll be right back
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          {message ||
            "NoteDown is currently undergoing scheduled maintenance. Please check back soon."}
        </p>

        {/* Countdown timer */}
        {endsAt && timeLeft !== null && (
          <div
            style={{
              backgroundColor: "var(--info-light)",
              border: "1px solid var(--info)",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--info-text)",
                marginBottom: "0.4rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Estimated time remaining
            </p>
            <p
              style={{
                fontSize: "2.25rem",
                fontWeight: 800,
                color: "var(--info-text)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              {formatTime(timeLeft)}
            </p>
          </div>
        )}

        {/* No end time — show generic note */}
        {!endsAt && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            No estimated end time. This page refreshes automatically.
          </p>
        )}

        {/* Branding */}
        <p
          style={{
            marginTop: "2rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          NoteDown • Automated refresh every 60 seconds
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
