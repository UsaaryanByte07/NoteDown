const express = require('express');

const chatRoutes = express.Router();

const {requireUser} = require('../middlewares/authMiddleware')
const {
  createSession,
  getMySessions,
  getSession,
  deleteSession,
} = require("../controllers/chat/sessionController");
const { sendMessage } = require("../controllers/chat/messageController");

chatRoutes.use(requireUser);

// Session
chatRoutes.post("/sessions", createSession);
chatRoutes.get("/sessions", getMySessions);
chatRoutes.get("/sessions/:sessionId", getSession);
chatRoutes.delete("/sessions/:sessionId", deleteSession);

// Messaging
chatRoutes.post("/sessions/:sessionId/messages", sendMessage);

module.exports = { chatRoutes };