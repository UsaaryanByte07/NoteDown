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

      {note.status === "rejected" && (note.rejectionReason || note.scanResult) && (
        <p className="text-danger text-xs mt-2 font-medium">
          Reason: {note.rejectionReason || note.scanResult}
        </p>
      )}

      {showActions && (onApprove || onReject) && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          {onApprove && (
            <button
              onClick={() => onApprove(note._id)}
              disabled={actionLoading}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
              }}
            >
              {actionLoading ? <Spinner size="sm" /> : "✅ Approve"}
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(note._id)}
              disabled={actionLoading}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: "var(--danger-light)",
                color: "var(--danger-text)",
                border: "1px solid var(--danger)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
              }}
            >
              {actionLoading ? <Spinner size="sm" /> : "❌ Reject"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
