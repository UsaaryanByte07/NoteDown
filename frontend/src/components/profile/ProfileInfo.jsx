const ProfileInfo = ({ profile, onEdit }) => {
    const initial = profile?.firstName?.[0]?.toUpperCase() || '?';

    return (
        <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                    width: '4rem', height: '4rem', borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                    fontWeight: 700, fontSize: '1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {initial}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {profile?.firstName} {profile?.lastName}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                        {profile?.email}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Account Type</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>
                    {profile?.userType}
                </p>
            </div>

            <button
                onClick={onEdit}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--primary)', color: '#fff',
                    border: 'none', borderRadius: '0.5rem',
                    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                }}
                onMouseOver={e => e.target.style.backgroundColor = 'var(--primary-hover)'}
                onMouseOut={e => e.target.style.backgroundColor = 'var(--primary)'}
            >
                Edit Profile
            </button>
        </div>
    );
};

export default ProfileInfo;