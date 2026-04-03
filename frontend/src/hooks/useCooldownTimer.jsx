import { useState, useEffect, useCallback } from 'react';

/**
 * useCooldownTimer
 *
 * Syncs the cooldown timer with the server on mount, then counts down locally.
 *
 * @param {string|null} email        - The user's email. Required for the server-sync call.
 * @param {string}      type         - 'otp' or 'reset'. Which expiry field the backend checks.
 * @param {number|null} initialValue - Optional pre-known cooldown (e.g. from router state).
 *                                     When provided the server-sync call is skipped entirely.
 */
const useCooldownTimer = (email, type = 'otp', initialValue = null) => {
    // Seed remaining from initialValue when provided (avoids a server round-trip)
    const [remaining, setRemaining] = useState(initialValue ?? 0);
    // If an initialValue was given we already know the state — no need to check server.
    const [checking, setChecking] = useState(initialValue === null);

    // On mount: ask the server how much cooldown time is left.
    // Skipped entirely if initialValue was supplied by the caller.
    useEffect(() => {
        // If caller already gave us the value, mark as done and skip
        if (initialValue !== null) {
            setChecking(false);
            return;
        }

        const checkCooldown = async () => {
            // Only make the request if we have an email to identify the user
            if (!email) {
                setChecking(false);
                return;
            }
            try {
                const BASE_URL = import.meta.env.VITE_API_URL || '';
                const res = await fetch(
                    `${BASE_URL}/api/auth/cooldown-status?email=${encodeURIComponent(email)}&type=${type}`,
                    { credentials: 'include' }
                );
                const data = await res.json();
                if (data.cooldownRemaining > 0) {
                    setRemaining(data.cooldownRemaining);
                }
            } catch (err) {
                console.error('Failed to check cooldown status:', err);
                // On failure, default to "no cooldown" — backend will catch it if wrong
            } finally {
                setChecking(false);
            }
        };

        checkCooldown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intentionally run once on mount; email/type are stable at mount time

    // Local countdown: ticks down once per second using setInterval.
    useEffect(() => {
        if (remaining <= 0) return;

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval); // Cleanup on re-render or unmount
    }, [remaining]);

    // Called after a successful resend — start a fresh 5-minute timer
    const startCooldown = useCallback((seconds = 300) => {
        setRemaining(seconds);
    }, []);

    const isCoolingDown = remaining > 0;

    // Format as M:SS for display (e.g., "4:37")
    const formatTime = () => {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return { remaining, isCoolingDown, formatTime, startCooldown, checking };
};

export default useCooldownTimer;