const express = require("express");
const {
  getMyStorage,
  getMyNotes,
  postUploadNote,
  getApprovedNotes,
  deleteMyNote,
} = require("../controllers/notes/userNoteController");
const {
  getPendingNotes,
  patchApprovedNote,
  patchRejectedNote,
  getAllNotesForAdmin,
  patchRetrySummary,
} = require("../controllers/notes/adminNoteController");
const { postOcrCallback } = require("../controllers/notes/ocrCallbackController");

const {
  requireUser,
  requireAdmin,
  requireLogin,
} = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/uploadMiddleware");
const { uploadRateLimiter } = require("../middlewares/rateLimitMiddleware");
const noteRoutes = express.Router();

noteRoutes.post(
  "/upload",
  requireUser,
  uploadRateLimiter,
  upload.single("noteFile"),
  postUploadNote,
);

noteRoutes.get("/", requireLogin, getApprovedNotes);

noteRoutes.get("/my-notes", requireUser, getMyNotes);

noteRoutes.get('/admin/all', requireAdmin, getAllNotesForAdmin);
noteRoutes.get("/pending", requireAdmin, getPendingNotes);
noteRoutes.patch("/:id/approve", requireAdmin, patchApprovedNote);
noteRoutes.patch("/:id/reject", requireAdmin, patchRejectedNote);
noteRoutes.get("/my-storage", requireUser, getMyStorage);
noteRoutes.delete("/my-notes/:id", requireUser, deleteMyNote);
noteRoutes.post("/ocr-callback", requireUser, postOcrCallback);
noteRoutes.patch("/:id/retry-summary", requireLogin, patchRetrySummary);
module.exports = { noteRoutes };
