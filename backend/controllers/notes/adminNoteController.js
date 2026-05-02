const Note = require("../../models/Note");
const User = require("../../models/User");
const SystemStats = require("../../models/SystemStats");
const { generateSummary } = require("../../utils/summary-util");
const { embedNoteContent } = require("../../utils/embedding-util");
const { deleteS3 } = require("../../utils/s3-util");

const MAX_GLOBAL_STORAGE = 4 * 1024 * 1024 * 1024; // 4 GB

const getPendingNotes = async (req, res, next) => {
  try {
    const pendingNotes = await Note.find({ status: "pending" })
      .select("-extractedText -extractedTextDraft -ocrToken")
      .populate("uploader", "firstName lastName email")
      .sort({ createdAt: -1 }); // Newest first

    return res.status(200).json({
      success: true,
      notes: pendingNotes,
    });
  } catch (err) {
    console.error("Error fetching pending notes:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending notes.",
    });
  }
};

const patchApprovedNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }
    if (note.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This note has already been ${note.status}.`,
      });
    }

    note.status = "approved";
    note.reviewedBy = req.user._id;
    note.reviewedAt = new Date();
    note.rejectionReason = "";
    note.summaryStatus = 'generating';
    await note.save();

    return res.status(200).json({
      success: true,
      message: "Note approved successfully. It is now visible to all users.",
      note,
    });

    // Both run in parallel, independently. Errors are logged
    // but do NOT affect the admin's response or each other.
    generateSummary(note._id.toString()).catch((err) => {
      console.error("Background summary generation error:", err.message);
    });

    embedNoteContent(note._id.toString()).catch((err) => {
      console.error("Background embedding generation error:", err.message);
    });
  } catch (err) {
    console.error("Error in patchApprovedNote:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while approving the note. Please try again.",
    });
  }
};

const patchRejectedNote = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }
    if (note.status !== "pending" && note.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a note with status "${note.status}".`,
      });
    }

    // Adjust storage counters and delete the file from AWS S3
    if (note.fileUrl && note.fileSize) {
      // Delete file from S3 so rejection is irreversible
      if (note.fileKey) {
        await deleteS3(note.fileKey);
        note.fileUrl = "";
        note.fileKey = "";
      }

      await User.findByIdAndUpdate(note.uploader, {
        $inc: { totalStorageUsed: -note.fileSize },
      });
      await SystemStats.findOneAndUpdate(
        {},
        {
          $inc: { globalStorageUsed: -note.fileSize },
        },
      );

      // If global storage was over limit and rejecting this note frees enough space, re-enable uploads
      const stats = await SystemStats.getStats();
      if (
        !stats.isUploadEnabled &&
        stats.globalStorageUsed < MAX_GLOBAL_STORAGE
      ) {
        await SystemStats.findOneAndUpdate({}, { isUploadEnabled: true });
      }
    }

    note.status = "rejected";
    note.reviewedBy = req.user._id;
    note.reviewedAt = new Date();
    note.rejectionReason = reason || "No reason provided";
    await note.save();

    return res.status(200).json({
      success: true,
      message: "Note rejected and file permanently deleted.",
    });
  } catch (err) {
    console.error("Error in patchRejectedNote:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while rejecting the note. Please try again.",
    });
  }
};

const getAllNotesForAdmin = async (req, res, next) => {
  try {
    // Run all three queries in parallel with Promise.all — faster than sequential await
    const [pending, approved, rejected] = await Promise.all([
      Note.find({ status: "pending" })
        .select("-extractedText -extractedTextDraft -ocrToken")
        .populate("uploader", "firstName lastName email")
        .sort({ createdAt: -1 }),
      Note.find({ status: "approved" })
        .select("-extractedText -extractedTextDraft -ocrToken")
        .populate("uploader", "firstName lastName email")
        .sort({ createdAt: -1 }),
      Note.find({ status: "rejected" })
        .select("-extractedText -extractedTextDraft -ocrToken")
        .populate("uploader", "firstName lastName email")
        .sort({ createdAt: -1 }),
    ]);

    // Return each group separately so the frontend can render three sections
    return res.status(200).json({
      success: true,
      pending,
      approved,
      rejected,
    });
  } catch (err) {
    console.error("Error fetching admin notes:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes.",
    });
  }
};

module.exports = {
  getPendingNotes,
  patchApprovedNote,
  patchRejectedNote,
  getAllNotesForAdmin,
};
