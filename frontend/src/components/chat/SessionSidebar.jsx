import { useState } from "react";
import Spinner from "../Spinner";

const SessionSidebar = ({
  sessions,
  activeSessionId,
  loading,
  onOpenSession,
  onNewChat,
  onDeleteSession,
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation(); // Prevent triggering onOpenSession
    const confirmed = window.confirm(
      "Are you sure you want to delete this chat session? All messages will be permanently lost.",
    );
    if (!confirmed) return;

    setDeletingId(sessionId);
    await onDeleteSession(sessionId);
    setDeletingId(null);
  };

  return (
    <div className="w-full md:w-72 flex-shrink-0 bg-bg rounded-2xl border border-border flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-text-primary text-sm">
          Chat Sessions
        </h2>
        <button
          onClick={onNewChat}
          className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
        >
          + New
        </button>
      </div>

      {/* ── Session List ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <p className="text-center text-text-muted text-sm py-8">
            No chat sessions yet.
            <br />
            Create one to get started!
          </p>
        )}

        {!loading &&
          sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => onOpenSession(session._id)}
              className={`group px-3 py-3 rounded-xl cursor-pointer mb-1 transition-colors ${
                activeSessionId === session._id
                  ? "bg-primary-light border border-primary"
                  : "hover:bg-bg-subtle border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      activeSessionId === session._id
                        ? "text-primary"
                        : "text-text-primary"
                    }`}
                  >
                    {session.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Terminated badge */}
                {session.isTerminated && (
                  <span className="text-xs px-1.5 py-0.5 bg-danger-light text-danger-text rounded-full flex-shrink-0">
                    Ended
                  </span>
                )}

                {/* Delete button — always visible for mobile/desktop accessibility */}
                <button
                  onClick={(e) => handleDelete(e, session._id)}
                  disabled={deletingId === session._id}
                  className="text-text-muted hover:text-danger transition-all flex-shrink-0 p-1"
                  title="Delete session"
                >
                  {deletingId === session._id ? (
                    <Spinner size="sm" />
                  ) : (
                    "🗑️"
                  )}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SessionSidebar;