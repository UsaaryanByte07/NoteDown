import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useApi from '../../hooks/useApi';

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

                {loading && <p className="text-text-secondary">Loading pending notes...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {data?.notes?.length === 0 && (
                    <p className="text-text-secondary">No notes pending review. 🎉</p>
                )}

                <div className="space-y-4">
                    {data?.notes?.map((note) => (
                        <div key={note._id} className="bg-bg border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-text-primary">{note.title}</h3>
                                <p className="text-text-secondary text-sm">
                                    {note.fileName} • {(note.fileSize / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-text-secondary text-xs">
                                    By {note.uploader?.firstName} {note.uploader?.lastName} ({note.uploader?.email})
                                </p>
                                <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-primary text-sm hover:underline">
                                    Preview file ↗
                                </a>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(note._id)}
                                    disabled={actionLoading === note._id}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    ✅ Approve
                                </button>
                                <button
                                    onClick={() => handleReject(note._id)}
                                    disabled={actionLoading === note._id}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPendingPage;