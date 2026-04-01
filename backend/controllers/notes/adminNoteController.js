const Note = require("../../models/Note");
const User = require("../../models/User");
const SystemStats = require("../../models/SystemStats");
const { deleteS3 } = require("../../utils/s3-util");

const MAX_GLOBAL_STORAGE = 4 * 1024 * 1024 * 1024; // 4 GB

const getPendingNotes = async (req, res, next) => {
    try {
        const pendingNotes = await Note.find({ status: 'pending' })
            .populate('uploader', 'firstName lastName email')
            .sort({ createdAt: -1 });  // Newest first

        return res.status(200).json({
            success: true,
            notes: pendingNotes,
        });
    } catch (err) {
        console.error('Error fetching pending notes:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pending notes.',
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
    await note.save();

    return res.status(200).json({
      success: true,
      message: "Note approved successfully. It is now visible to all users.",
      note,
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
    try{
        const { reason } = req.body;
        const note = await Note.findById(req.params.id);
        if(!note){
            return res.status(404).json({success: false, message: "Note not found"});
        }
        if (note.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This note has already been ${note.status}.`,
            });
        }

        try{
            await deleteS3(note.fileKey);
        } catch (err) {
            console.error("Error deleting S3 file:", err);
        }

        await User.findByIdAndUpdate(note.uploader, {
            $inc: { totalStorageUsed: -note.fileSize },
        });
        await SystemStats.findOneAndUpdate({}, {
            $inc: { globalStorageUsed: -note.fileSize },
        });

        // Re-enable uploads if they were disabled and we're now under the limit
        const stats = await SystemStats.getStats();
        if (!stats.isUploadEnabled && stats.globalStorageUsed < MAX_GLOBAL_STORAGE) {
            await SystemStats.findOneAndUpdate({}, { isUploadEnabled: true });
        }

        // Update note status and add rejection reason
        note.status = 'rejected';
        note.reviewedBy = req.user._id;
        note.reviewedAt = new Date();
        note.rejectionReason = reason || "No reason provided";
        await note.save();

        return res.status(200).json({
            success: true,
            message: 'Note rejected and file deleted.',
        });
    }catch(err){
        console.error("Error in patchRejectedNote:", err);
        return res.status(500).json({
          success: false,
          message: "An error occurred while rejecting the note. Please try again.",
        });
    }
};


module.exports = {
    getPendingNotes,
    patchApprovedNote,
    patchRejectedNote,
};