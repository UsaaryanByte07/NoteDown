import { useState } from "react";
import Spinner from "../Spinner";

const NoteCard = ({
  note,
  showStatus = false,
  showActions = false,
  showUploader = false,
  showDelete = false,
  isAdminView = false,  // NEW: hides AI summary block for admin
  onDelete,
  deleteLoading = false,
  onApprove,
  onReject,
  actionLoading = false,
  onRetrySummary,  // NEW: callback for retrying AI summary generation
}) => {
  // NEW: tracks whether the full AI summary is expanded or collapsed
  const [summaryExpanded, setSummaryExpanded] = useState(false);

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

      {/* ── AI Summary block — hidden for admin view ── */}
      {!isAdminView && (
        <>
          {note.summaryStatus === "generating" && (
            <div className="flex items-center gap-2 text-xs text-info-text bg-info-light px-3 py-2 rounded-lg mb-2">
              <Spinner size="sm" />
              <span>Generating AI summary...</span>
            </div>
          )}

          {note.summaryStatus === "completed" && note.aiSummary && (
            <div className="text-sm text-text-secondary bg-bg-subtle px-3 py-2 rounded-lg mb-2 border-l-4 border-primary">
              <p className="text-xs font-semibold text-primary mb-1">✨ AI Summary</p>
              {/* CSS line-clamp-1 visually truncates to 1 rendered line when collapsed.
                  This works regardless of whether the string contains literal \n characters. */}
              <p
                className="leading-relaxed"
                style={summaryExpanded ? {} : {
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {note.aiSummary}
              </p>
              <button
                onClick={() => setSummaryExpanded((prev) => !prev)}
                className="text-xs text-primary hover:underline mt-1 font-medium"
              >
                {summaryExpanded ? "See less ↑" : "...see more"}
              </button>
            </div>
          )}

          {note.summaryStatus === "failed" && (
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-text-muted italic">
                AI summary unavailable for this note.
              </p>
              {onRetrySummary && (
                <button
                  onClick={() => onRetrySummary(note._id)}
                  className="text-xs text-primary hover:underline font-medium flex-shrink-0"
                >
                  Retry ↻
                </button>
              )}
            </div>
          )}
        </>
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

      {/* ── Admin approve / reject actions ── */}
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
                cursor: actionLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              {/* Only Approve shows spinner while loading */}
              {actionLoading ? <Spinner size="sm" /> : "✅ Approve"}
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(note._id)}
              // Reject is DISABLED (not loading) while action is in progress
              disabled={actionLoading}
              style={{
                flex: 1,
                padding: "0.5rem",
                // Visually muted when disabled to communicate it's locked, not loading
                backgroundColor: actionLoading
                  ? "var(--bg-subtle)"
                  : "var(--danger-light)",
                color: actionLoading
                  ? "var(--text-muted)"
                  : "var(--danger-text)",
                border: `1px solid ${actionLoading ? "var(--border)" : "var(--danger)"}`,
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: actionLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
                opacity: actionLoading ? 0.5 : 1,
                transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
              }}
            >
              ❌ Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
