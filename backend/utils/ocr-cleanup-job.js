const Note = require("../models/Note");
const fs = require("fs");

const OCR_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

const startOcrCleanupJob = () => {
  console.log("OCR cleanup job started (runs every 5 minutes)");

  setInterval(async () => {
    try {
      const cutoffTime = new Date(Date.now() - OCR_TIMEOUT_MS);

      const stuckNotes = await Note.find({
        ocrRequired: true,
        extractionComplete: false,
        createdAt: { $lt: cutoffTime },
      });

      for (const note of stuckNotes) {
        console.log(
          `OCR Cleanup: Rejecting note ${note._id} (stuck for 15+ minutes)`,
        );

        if (note.quarantinePath) {
          fs.unlink(note.quarantinePath, () => {});
        }

        await Note.findByIdAndDelete(note._id);

        console.log(
          `OCR Cleanup: Deleted note ${note._id} — reason: unable to process the file`,
        );
      }
    } catch (err) {
      console.error("OCR cleanup job error:", err);
    }
  }, CLEANUP_INTERVAL_MS);
};

module.exports = { startOcrCleanupJob };