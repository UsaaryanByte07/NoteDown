const NoteCard = ({ note, showStatus = false }) => {
    const getFileIcon = (mimeType) => {
        if (mimeType === 'application/pdf') return '📕';
        if (mimeType?.includes('word')) return '📘';
        return '📄';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">⏳ Pending</span>;
            case 'approved': return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">✅ Approved</span>;
            case 'rejected': return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">❌ Rejected</span>;
            default: return null;
        }
    };

    return (
        <div className="bg-bg border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{getFileIcon(note.mimeType)}</span>
                {showStatus && getStatusBadge(note.status)}
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1">{note.title}</h3>
            {note.description && (
                <p className="text-text-secondary text-sm mb-2 line-clamp-2">{note.description}</p>
            )}
            <p className="text-text-secondary text-xs mb-3">
                {note.fileName} • {(note.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
            {note.uploader?.firstName && (
                <p className="text-text-secondary text-xs mb-3">
                    By {note.uploader.firstName} {note.uploader.lastName}
                </p>
            )}
            {note.status === 'approved' && (
                <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                    View / Download
                </a>
            )}
            {note.status === 'rejected' && note.rejectionReason && (
                <p className="text-red-600 text-xs mt-2">Reason: {note.rejectionReason}</p>
            )}
        </div>
    );
};

export default NoteCard;