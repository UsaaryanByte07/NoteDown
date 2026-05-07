import { useState } from "react";
import Spinner from "../Spinner";

const NoteSelector = ({ notes, onCreateSession, onCancel, loading }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  // Task 1: user defines the chat session title themselves
  const [sessionTitle, setSessionTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  const toggleNote = (noteId) => {
    setSelectedIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId],
    );
  };

  const handleStart = async () => {
    if (selectedIds.length === 0) return;

    const trimmedTitle = sessionTitle.trim();
    if (!trimmedTitle) {
      setTitleError("Please enter a title for this chat session.");
      return;
    }
    setTitleError("");

    const res = await onCreateSession(selectedIds, trimmedTitle);

    // Task 8: handle duplicate title error from backend
    if (!res.success && res.data?.errorCode === "DUPLICATE_SESSION_TITLE") {
      setTitleError(
        res.data.message ||
          "A chat session with this title already exists. Please choose a different name.",
      );
    }
  };

  return (
    <div className="flex-1 bg-bg rounded-2xl border border-border flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-text-primary">
          New Chat Session
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Give your session a title and choose one or more notes as context.
        </p>

        {/* ── Session Title Input ── Task 1 ──────────────── */}
        <div className="mt-3">
          <label
            htmlFor="session-title-input"
            className="text-xs font-semibold text-text-secondary block mb-1"
          >
            Session Title <span className="text-danger">*</span>
          </label>
          <input
            id="session-title-input"
            type="text"
            value={sessionTitle}
            onChange={(e) => {
              setSessionTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            placeholder="e.g. Study session — Chapter 3"
            maxLength={80}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {titleError && (
            <p className="text-xs text-danger mt-1">{titleError}</p>
          )}
        </div>

        {/* ── Important Notice ────────────────────────────── */}
        <div className="mt-3 px-3 py-2 bg-warning-light text-warning-text text-xs rounded-lg border border-warning">
          ⚠️ <strong>Important:</strong> Once you start chatting, you cannot add
          more notes to this session. You&apos;ll need to create a new session if
          you want different notes.
        </div>
      </div>

      {/* ── Notes Grid ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-text-secondary mb-3">
          Select notes for context
        </p>
        {notes.length === 0 && (
          <p className="text-center text-text-muted py-8">
            No approved notes available yet.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notes.map((note) => {
            const isSelected = selectedIds.includes(note._id);
            return (
              <div
                key={note._id}
                onClick={() => toggleNote(note._id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary-light"
                    : "border-border hover:border-primary/50 bg-bg"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox indicator */}
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {note.title}
                    </p>
                    {note.description && (
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {note.description}
                      </p>
                    )}
                    <p className="text-xs text-text-muted mt-1">
                      {note.fileName} •{" "}
                      {(note.fileSize / (1024 * 1024)).toFixed(2)} MB
                      {note.uploader?.firstName &&
                        ` • By ${note.uploader.firstName}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer Actions ──────────────────────────────── */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          ← Cancel
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {selectedIds.length} note{selectedIds.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <button
            onClick={handleStart}
            disabled={selectedIds.length === 0 || loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" /> Creating...
              </>
            ) : (
              "Start Chat →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteSelector;