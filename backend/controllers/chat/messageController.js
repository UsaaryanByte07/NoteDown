const ChatSession = require("../../models/ChatSession");
const ChatMessage = require("../../models/ChatMessage");
const { generateRAGResponse } = require("../../utils/rag-query-util");

const MAX_HISTORY_MESSAGES = 4;

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found.",
      });
    }

    if (session.isTerminated) {
      return res.status(403).json({
        success: false,
        message:
          "This chat session has been terminated because one of the notes was deleted.",
      });
    }

    const userMessage = await ChatMessage.create({
      sessionId: session._id,
      role: "user",
      content: message.trim(),
    });

    const recentMessages = await ChatMessage.find({
      sessionId: session._id,
    })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY_MESSAGES + 1) // +1 to include the current user message
      .lean();

    const chatHistory = recentMessages
      .reverse()
      .slice(0, -1) // Remove the user's current message (it goes as the question)
      .map((msg) => ({ role: msg.role, content: msg.content }));

    const noteIds = session.noteIds.map((id) => id.toString());

    let aiResponseText;

    try {
      aiResponseText = await generateRAGResponse(
        message.trim(),
        noteIds,
        chatHistory,
      );
    } catch (err) {
      console.error("Gemini API error:", err.message);

      // Check if this is a safety violation
      const isSafetyViolation =
        err.message?.includes("SAFETY") ||
        err.message?.includes("blocked") ||
        err.message?.includes("RECITATION");

      if (isSafetyViolation) {
        return res.status(400).json({
          success: false,
          message:
            "Your prompt violates the website's terms and conditions. Please rephrase your question.",
          userMessage,
        });
      }

      return res.status(503).json({
        success: false,
        message:
          "Currently experiencing too much traffic on the website. Please try again later.",
        userMessage,
      });
    }

    const aiMessage = await ChatMessage.create({
      sessionId: session._id,
      role: "ai",
      content: aiResponseText,
    });

    // Update session's updatedAt timestamp
    session.updatedAt = new Date();
    await session.save();

    return res.status(200).json({
      success: true,
      userMessage,
      aiMessage,
    });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process your message. Please try again.",
    });
  }
};

module.exports = {
  sendMessage,
};
