import Spinner from "../Spinner";

const NoteCard = ({
  note,
  showStatus = false,
  showActions = false,
  showUploader = false,
  showDelete = false,
  onDelete,
  deleteLoading = false,
  onApprove,
  onReject,
  actionLoading = false,
}) => {
  const getFileIcon = (mimeType) => {
    if (mimeType === "application/pdf") return "📕";
    if (mimeType?.includes("word")) return "📘";
    return "📄";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scanning":
        return (
          <span className="text-xs px-2 py-1 bg-info-light text-info-text rounded-full">
            🔍 Scanning
          </span>
        );
      case "pending":
        return (
          <span className="text-xs px-2 py-1 bg-warning-light text-warning-text rounded-full">
            ⏳ Pending
          </span>
        );
      case "approved":
        return (
          <span className="text-xs px-2 py-1 bg-success-light text-success-text rounded-full">
            ✅ Approved
          </span>
        );
      case "rejected":
        return (
          <span className="text-xs px-2 py-1 bg-danger-light text-danger-text rounded-full">
            ❌ Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-bg border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{getFileIcon(note.mimeType)}</span>
        {showStatus && getStatusBadge(note.status)}
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-1">
        {note.title}
      </h3>

      {note.description && (
        <p className="text-text-secondary text-sm mb-2 line-clamp-2">
          {note.description}
        </p>
      )}

      <p className="text-text-secondary text-xs mb-3">
        {note.fileName} • {(note.fileSize / (1024 * 1024)).toFixed(2)} MB
      </p>

      {(showUploader || note.uploader?.firstName) && note.uploader && (
        <p className="text-text-secondary text-xs mb-3">
          By {note.uploader.firstName} {note.uploader.lastName}
          {showUploader && note.uploader.email && <> ({note.uploader.email})</>}
        </p>
      )}

      {showActions && note.fileUrl && (
        <a
          href={note.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-sm hover:underline mb-3 inline-block"
        >
          Preview file ↗
        </a>
      )}

      {!showActions && note.status === "approved" && (
        <a
          href={note.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          View / Download
        </a>
      )}

      {showDelete && (
        <button
          onClick={() => {
            const confirmed = window.confirm(
              `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
            );
            if (confirmed) onDelete?.(note._id);
          }}
          disabled={deleteLoading || note.status === "scanning"}
          className="mt-3 px-4 py-2 text-sm font-medium text-danger border border-danger rounded-lg hover:bg-danger-light disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {deleteLoading ? (
            <>
              <Spinner size="sm" /> Deleting...
            </>
          ) : (
            "🗑️ Delete"
          )}
        </button>
      )}

      {note.status === "rejected" && note.rejectionReason && (
        <p className="text-danger text-xs mt-2">
          Reason: {note.rejectionReason}
        </p>
      )}

      {showActions && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onApprove?.(note._id)}
            disabled={actionLoading}
            className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {actionLoading ? <Spinner size="sm" /> : "✅ Approve"}
          </button>
          <button
            onClick={() => onReject?.(note._id)}
            disabled={actionLoading}
            className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {actionLoading ? <Spinner size="sm" /> : "❌ Reject"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
