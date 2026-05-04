const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-primary text-white rounded-br-md"
            : "bg-bg-subtle text-text-primary border border-border rounded-bl-md"
        }`}
      >
        {/* Role label */}
        <p
          className={`text-xs font-semibold mb-1 ${
            isUser ? "text-white/80" : "text-primary"
          }`}
        >
          {isUser ? "You" : "🤖 AI"}
        </p>

        {/* Message content */}
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser ? "text-white" : "text-text-primary"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isUser ? "text-white/60" : "text-text-muted"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;