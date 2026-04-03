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
} = require("../controllers/notes/adminNoteController");
const {getSystemStats} = require('../controllers/notes/superuserNoteController')
const { requireSuperuser } = require("../middlewares/superuserMiddleware");
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
noteRoutes.get("/system-stats", requireSuperuser, getSystemStats);
noteRoutes.get("/pending", requireAdmin, getPendingNotes);
noteRoutes.patch("/:id/approve", requireAdmin, patchApprovedNote);
noteRoutes.patch("/:id/reject", requireAdmin, patchRejectedNote);
noteRoutes.get("/my-storage", requireUser, getMyStorage);
noteRoutes.delete("/my-notes/:id", requireUser, deleteMyNote);

module.exports = { noteRoutes };
