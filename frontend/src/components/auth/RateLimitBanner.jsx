const RateLimitBanner = ({ message, retryAfter }) => {
    return (
        <div
            role="alert"
            style={{
                backgroundColor: 'var(--warning-light, #fffbeb)',
                border: '1px solid var(--warning, #f59e0b)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
            }}
        >
            <p style={{
                color: 'var(--warning-text, #92400e)',
                fontWeight: 700,
                fontSize: '0.875rem',
                margin: 0,
            }}>
                ⏱ Slow down!
            </p>
            <p style={{
                color: 'var(--warning-text, #92400e)',
                fontSize: '0.875rem',
                margin: 0,
            }}>
                {message}
            </p>
            {retryAfter && (
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8125rem',
                    margin: 0,
                }}>
                    Please wait <strong>{retryAfter}</strong> before trying again.
                </p>
            )}
        </div>
    );
};

export default RateLimitBanner;