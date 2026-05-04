import { useState } from "react";
import Spinner from "../Spinner";

const ChatInput = ({ onSend, loading, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading || disabled) return;

    const text = message.trim();
    setMessage(""); // Clear immediately for responsiveness
    await onSend(text);
  };

  // Allow Shift+Enter for new lines, Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 py-3 border-t border-border bg-bg"
    >
      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "This chat session has been terminated."
              : "Ask a question about your notes..."
          }
          disabled={disabled || loading}
          rows={1}
          className="flex-1 resize-none px-4 py-3 rounded-xl border border-border bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ maxHeight: "120px", minHeight: "44px" }}
          onInput={(e) => {
            // Auto-resize textarea
            e.target.style.height = "44px";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || loading || disabled}
          className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center gap-2"
        >
          {loading ? <Spinner size="sm" /> : "Send"}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;