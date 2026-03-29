const express = require("express");
const {
  postUploadNote,
  getApprovedNotes,
  getMyNotes,
  getPendingNotes,
  patchApprovedNote,
  patchRejectedNote,
} = require("../controllers/notes/noteController");
const {
  requireUser,
  requireAdmin,
  requireLogin,
} = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/uploadMiddleware");
const noteRoutes = express.Router();

noteRoutes.post(
  "/upload",
  requireUser,
  upload.single("noteFile"),
  postUploadNote,
);

noteRoutes.get('/', requireLogin, getApprovedNotes);

noteRoutes.get('/my-notes', requireUser, getMyNotes);

noteRoutes.get('/pending', requireAdmin, getPendingNotes);
noteRoutes.patch('/:id/approve', requireAdmin, patchApprovedNote);
noteRoutes.patch('/:id/reject', requireAdmin, patchRejectedNote);

module.exports = { noteRoutes };
