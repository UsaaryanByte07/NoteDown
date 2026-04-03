import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/auth/authContext';
import Spinner from '../../components/Spinner';
import StorageBar from '../../components/notes/StorageBar';
import ProfileInfo from '../../components/profile/ProfileInfo';
import EditProfileModal from '../../components/profile/EditProfileModal';
import ResetPasswordSection from '../../components/profile/ResetPasswordSection';

const ProfilePage = () => {
    const { user, dispatch } = useAuth();
    const { data, loading, error, refetch } = useFetch('/api/auth/profile');
    const [showEditModal, setShowEditModal] = useState(false);

    const handleProfileUpdated = (updatedUser) => {
        // Update the auth context so the navbar shows the new name immediately.
        // The backend already set a new JWT cookie (see 24-profile-page-backend.md),
        // so dispatching LOGIN with the fresh user payload keeps the frontend in sync.
        dispatch({ type: 'LOGIN', payload: { user: updatedUser } });
        refetch();              // Reload profile data from server
        setShowEditModal(false);
    };

    if (loading) return <Spinner size="lg" />;
    if (error) return <p style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '2.5rem' }}>{error}</p>;

    const profile = data?.profile;

    return (
        <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-subtle)', padding: '2.5rem 1rem' }}>
            <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Profile
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Manage your account settings
                </p>

                <ProfileInfo
                    profile={profile}
                    onEdit={() => setShowEditModal(true)}
                />

                {/* admins don't have a storage quota */}
                {profile?.storage && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <StorageBar storage={profile.storage} />
                    </div>
                )}

                <div style={{ marginTop: '2rem' }}>
                    <ResetPasswordSection />
                </div>

                {showEditModal && (
                    <EditProfileModal
                        profile={profile}
                        onClose={() => setShowEditModal(false)}
                        onSaved={handleProfileUpdated}
                    />
                )}
            </div>
        </div>
    );
};

export default ProfilePage;