import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useApi from '../../hooks/useApi';
import NoteCard from '../../components/notes/NoteCard';
import Spinner from '../../components/Spinner';

const AdminNotesPage = () => {
    const { data, loading, error, refetch } = useFetch('/api/notes/admin/all');
    const { executeRequest } = useApi();
    // Track which note's action button is currently loading
    const [actionLoading, setActionLoading] = useState(null);

    const handleApprove = async (noteId) => {
        setActionLoading(noteId);
        await executeRequest(`/api/notes/${noteId}/approve`, { method: 'PATCH' });
        refetch();           // Re-fetch all sections so counts update
        setActionLoading(null);
    };

    const handleReject = async (noteId) => {
        // Using confirm and prompt here is a quick solution;
        if (!window.confirm("This action is irreversible and will permanently delete the file from AWS. Are you sure you want to reject this note?")) return;
        
        const reason = prompt('Reason for rejection (leave blank for "No reason provided"):');
        setActionLoading(noteId);
        await executeRequest(`/api/notes/${noteId}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: reason || 'No reason provided.' }),
        });
        refetch();
        setActionLoading(null);
    };

    if (loading) return <Spinner size="lg" />;
    if (error) return (
        <p style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '2.5rem' }}>{error}</p>
    );

    return (
        <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-subtle)', padding: '2.5rem 1rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Notes Management
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Review, approve, and reject uploaded notes.
                </p>

                {/* Pending — both Approve AND Reject buttons */}
                <NotesSection
                    title="⏳ Pending Notes"
                    notes={data?.pending || []}
                    emptyMessage="No notes pending review. 🎉"
                    actionLoading={actionLoading}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />

                {/* Approved — only Reject button (no onApprove passed) */}
                <NotesSection
                    title="✅ Approved Notes"
                    notes={data?.approved || []}
                    emptyMessage="No approved notes yet."
                    actionLoading={actionLoading}
                    onReject={handleReject}
                />

                {/* Rejected — No actions allowed (irreversible) */}
                <NotesSection
                    title="❌ Rejected Notes"
                    notes={data?.rejected || []}
                    emptyMessage="No rejected notes."
                    actionLoading={actionLoading}
                    onApprove={null}
                    onReject={null}
                />
            </div>
        </div>
    );
};

// Reusable section component — renders a heading, a responsive grid of NoteCards,
// or an empty message. Passing onApprove/onReject as null hides those buttons in NoteCard.
const NotesSection = ({ title, notes, emptyMessage, actionLoading, onApprove, onReject }) => (
    <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {title} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({notes.length})</span>
        </h2>

        {notes.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{emptyMessage}</p>
        ) : (
            // Responsive grid: 1 col on mobile, 2 on sm, 3 on lg
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
            }}>
                {notes.map((note) => (
                    <NoteCard
                        key={note._id}
                        note={note}
                        showStatus={true}
                        showUploader={true}
                        showActions={true}
                        onApprove={onApprove}   // null = hide Approve button
                        onReject={onReject}     // null = hide Reject button
                        actionLoading={actionLoading === note._id}
                    />
                ))}
            </div>
        )}
    </section>
);

export default AdminNotesPage;