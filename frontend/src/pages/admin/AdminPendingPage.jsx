import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useApi from '../../hooks/useApi';
import NoteCard from '../../components/notes/NoteCard';
import Spinner from '../../components/Spinner';

const AdminPendingPage = () => {
    const { data, loading, error, refetch } = useFetch('/api/notes/pending');
    const { executeRequest } = useApi();
    const [actionLoading, setActionLoading] = useState(null);

    const handleApprove = async (noteId) => {
        setActionLoading(noteId);
        await executeRequest(`/api/notes/${noteId}/approve`, { method: 'PATCH' });
        refetch();
        setActionLoading(null);
    };

    const handleReject = async (noteId) => {
        const reason = prompt('Reason for rejection (optional):');
        setActionLoading(noteId);
        await executeRequest(`/api/notes/${noteId}/reject`, {
            method: 'PATCH',
            body: JSON.stringify({ reason: reason || 'No reason provided.' }),
        });
        refetch();
        setActionLoading(null);
    };

    return (
        <div className="min-h-[80vh] bg-bg-subtle py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Pending Approvals</h1>
                <p className="text-text-secondary mb-8">
                    Review and approve or reject uploaded notes.
                </p>

                {loading && <Spinner size="lg" />}
                {error && <p className="text-danger">{error}</p>}

                {data?.notes?.length === 0 && (
                    <p className="text-text-secondary">No notes pending review. 🎉</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.notes?.map((note) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            showStatus={true}
                            showActions={true}
                            showUploader={true}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            actionLoading={actionLoading === note._id}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPendingPage;