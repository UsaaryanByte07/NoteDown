import { useState } from 'react';
import useApi from '../../hooks/useApi';
import Spinner from '../Spinner';

const EditProfileModal = ({ profile, onClose, onSaved }) => {
    const { executeRequest, loading, error } = useApi();
    const [form, setForm] = useState({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
    });

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await executeRequest('/api/auth/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (result.success) {
            onSaved(result.data.user);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.625rem 0.75rem', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)',
        border: '1px solid var(--border)', borderRadius: '0.5rem',
        fontSize: '0.875rem',
    };
    const labelStyle = { display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            padding: '1rem',
        }}>

            <div style={{
                backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '1rem', padding: '1.5rem',
                width: '100%', maxWidth: '28rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}>
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>
                    Edit Profile
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>First Name</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange}
                            required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Last Name</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange}
                            required style={inputStyle} />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={loading} style={{
                            flex: 1, padding: '0.625rem',
                            backgroundColor: 'var(--primary)', color: '#fff',
                            border: 'none', borderRadius: '0.5rem',
                            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}>
                            {loading ? <Spinner size="sm" /> : 'Save Changes'}
                        </button>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '0.625rem',
                            backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                            border: '1px solid var(--border)', borderRadius: '0.5rem',
                            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;