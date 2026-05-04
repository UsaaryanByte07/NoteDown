import { useState } from "react";
import Spinner from "../Spinner";

const NoteSelector = ({ notes, onCreateSession, onCancel, loading }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleNote = (noteId) => {
    setSelectedIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId],
    );
  };

  const handleStart = async () => {
    if (selectedIds.length === 0) return;
    await onCreateSession(selectedIds);
  };

  return (
    <div className="flex-1 bg-bg rounded-2xl border border-border flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-text-primary">
          Select Notes for Chat
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Choose one or more notes as context for your AI chat session.
        </p>

        {/* ── Important Notice ────────────────────────────── */}
        <div className="mt-3 px-3 py-2 bg-warning-light text-warning-text text-xs rounded-lg border border-warning">
          ⚠️ <strong>Important:</strong> Once you start chatting, you cannot add
          more notes to this session. You'll need to create a new session if you
          want different notes.
        </div>
      </div>

      {/* ── Notes Grid ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
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