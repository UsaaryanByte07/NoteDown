const ChatSession = require("../../models/ChatSession");
const ChatMessage = require("../../models/ChatMessage");
const Note = require("../../models/Note");

const createSession = async (req, res) => {
  try {
    const { noteIds, title } = req.body;

    // ── Validate user-provided title (Task 1) ───────────────────────
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a title for your chat session.",
      });
    }

    const trimmedTitle = title.trim().slice(0, 80); // max 80 chars

    // ── Unique title per user (Task 8) ──────────────────────────────
    const existing = await ChatSession.findOne({
      userId: req.user._id,
      title: trimmedTitle,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        errorCode: "DUPLICATE_SESSION_TITLE",
        message:
          "A chat session with this title already exists. Please choose a different name.",
      });
    }

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one note to start a chat.",
      });
    }

    const notes = await Note.find({
      _id: { $in: noteIds },
      status: "approved",
    }).select("title");

    if (notes.length !== noteIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected notes are unavailable or not yet approved.",
      });
    }

    const session = await ChatSession.create({
      userId: req.user._id,
      noteIds,
      title: trimmedTitle,
    });

    return res.status(201).json({
      success: true,
      message: "Chat session created successfully.",
      session,
    });
  } catch (err) {
    console.error("Error creating chat session:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create chat session.",
    });
  }
};

const getMySessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("title noteIds isTerminated createdAt updatedAt");

    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch (err) {
    console.error("Error fetching chat sessions:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat sessions.",
    });
  }
};

const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user._id,
    }).populate("noteIds", "title fileName");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found.",
      });
    }

    const messages = await ChatMessage.find({
      sessionId: session._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      session,
      messages,
    });
  } catch (err) {
    console.error("Error fetching chat session:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat session.",
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found.",
      });
    }

    await ChatMessage.deleteMany({ sessionId: session._id });

    await ChatSession.findByIdAndDelete(session._id);

    return res.status(200).json({
      success: true,
      message: "Chat session deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting chat session:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete chat session.",
    });
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSession,
  deleteSession,
};
