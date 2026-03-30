const express = require("express");
const {
  postUploadNote,
  getApprovedNotes,
  getMyNotes,
  getPendingNotes,
  patchApprovedNote,
  patchRejectedNote,
  getMyStorage,
  getSystemStats,
} = require("../controllers/notes/noteController");
const {requireSuperuser} = require('../middlewares/superuserMiddleware');
const {
  requireUser,
  requireAdmin,
  requireLogin,
} = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/uploadMiddleware");
const { uploadRateLimiter } = require('../middlewares/rateLimitMiddleware');
const noteRoutes = express.Router();

noteRoutes.post(
  "/upload",
  requireUser,
  uploadRateLimiter,
  upload.single("noteFile"),
  postUploadNote,
);

noteRoutes.get('/', requireLogin, getApprovedNotes);

noteRoutes.get('/my-notes', requireUser, getMyNotes);

noteRoutes.get('/system-stats', requireSuperuser, getSystemStats);
noteRoutes.get('/pending', requireAdmin, getPendingNotes);
noteRoutes.patch('/:id/approve', requireAdmin, patchApprovedNote);
noteRoutes.patch('/:id/reject', requireAdmin, patchRejectedNote);
noteRoutes.get('/my-storage', requireUser, getMyStorage);
module.exports = { noteRoutes };
