import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import Spinner from "../Spinner";

const ChatWindow = ({ session, messages, onSendMessage, onBack, loading }) => {
  const messagesEndRef = useRef(null);
  const [sendError, setSendError] = useState(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message) => {
    setSendError(null);
    const res = await onSendMessage(message);
    if (!res.success) {
      setSendError(res.data?.message || "Failed to send message.");
    }
  };

  return (
    <div className="flex-1 bg-bg rounded-2xl border border-border flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {session.title}
          </h3>
          <p className="text-xs text-text-muted">
            {session.noteIds?.length} note
            {session.noteIds?.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      </div>

      {/* ── Terminated Warning ───────────────────────────── */}
      {session.isTerminated && (
        <div className="mx-4 mt-3 px-4 py-3 bg-danger-light text-danger-text text-sm rounded-lg border border-danger">
          <p className="font-semibold">⚠️ Session Terminated</p>
          <p className="text-xs mt-1">
            {session.terminationReason ||
              "One of the notes used as context here was deleted by its owner. This chat session has been terminated."}
          </p>
        </div>
      )}

      {/* ── Messages Area ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-messages">
        {messages.length === 0 && !session.isTerminated && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-secondary">
              <p className="text-3xl mb-2">🤖</p>
              <p className="text-sm">
                Ask me anything about your selected notes!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))}

        {/* Loading indicator while waiting for AI */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-bg-subtle border border-border px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Spinner size="sm" />
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {sendError && (
          <div className="flex justify-center mb-4">
            <p className="text-sm text-danger bg-danger-light px-4 py-2 rounded-lg">
              {sendError}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── AI Disclaimer ───────────────────────────────── */}
      <div className="px-4 py-2 bg-bg-subtle border-t border-border">
        <p className="text-xs text-text-muted text-center">
          ⚠️ This is an AI assistant — it can make mistakes. Always verify
          important information from other trusted sources.
        </p>
      </div>

      {/* ── Message Input ───────────────────────────────── */}
      <ChatInput
        onSend={handleSend}
        loading={loading}
        disabled={session.isTerminated}
      />
    </div>
  );
};

export default ChatWindow;