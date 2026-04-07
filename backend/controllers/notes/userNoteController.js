const Note = require("../../models/Note");
const User = require("../../models/User");
const SystemStats = require("../../models/SystemStats");
const {
  extractTextFromDocx,
  analyzeDigitalPdf,
  extractTextFromTxt,
} = require("../../utils/text-extraction-util");
const { getPageCount } = require("../../utils/page-count-util");
const {
  submitFileForVirusScan,
  getAnalysisResults,
} = require("../../config/virustotal_config");
const { uploadS3, deleteS3 } = require("../../utils/s3-util");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const MAX_USER_STORAGE = 100 * 1024 * 1024; // 100 MB
const MAX_GLOBAL_STORAGE = 4 * 1024 * 1024 * 1024; // 4 GB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PAGE_COUNT = 15; // Max 15 pages

const getMyStorage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      storage: {
        used: user.totalStorageUsed,
        usedMB: (user.totalStorageUsed / (1024 * 1024)).toFixed(2),
        limitMB: "100.00",
        remainingMB: (
          (MAX_USER_STORAGE - user.totalStorageUsed) /
          (1024 * 1024)
        ).toFixed(2),
        percentage: ((user.totalStorageUsed / MAX_USER_STORAGE) * 100).toFixed(
          2,
        ),
      },
    });
  } catch (err) {
    console.error("Error fetching user storage:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch storage information.",
    });
  }
};

const getMyNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ uploader: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      notes,
    });
  } catch (err) {
    console.error("Error fetching user notes:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your notes.",
    });
  }
};

const postUploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        errorCode: "NO_FILE",
      });
    }

    const { title, description } = req.body;
    if (!title || title.trim() === "") {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: "Title is required",
        errorCode: "NO_TITLE",
      });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: "File size exceeds the maximum allowed size of 10 MB.",
        errorCode: "FILE_TOO_LARGE",
      });
    }

    let pageCount;
    try {
      pageCount = await getPageCount(req.file.path, req.file.mimetype);
    } catch (err) {
      console.error("Page count check failed:", err);
      pageCount = 0;
    }

    if (pageCount > MAX_PAGE_COUNT) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: `File exceeds the ${MAX_PAGE_COUNT}-page limit. Your file has ${pageCount} pages.`,
        errorCode: "TOO_MANY_PAGES",
      });
    }

    const stats = await SystemStats.getStats();
    if (
      !stats.isUploadEnabled ||
      stats.globalStorageUsed >= MAX_GLOBAL_STORAGE
    ) {
      fs.unlink(req.file.path, () => {});
      return res.status(503).json({
        success: false,
        message:
          "Uploads are temporarily disabled due to high storage usage. Please try again later.",
        errorCode: "GLOBAL_STORAGE_EXCEEDED",
      });
    }

    const user = await User.findById(req.user._id);
    if (user.totalStorageUsed + req.file.size >= MAX_USER_STORAGE) {
      fs.unlink(req.file.path, () => {});
      const remainingMB = (
        (MAX_USER_STORAGE - user.totalStorageUsed) /
        (1024 * 1024)
      ).toFixed(2);
      return res.status(400).json({
        success: false,
        message: `You have exceeded your 100 MB storage limit. You have ${remainingMB} MB remaining.`,
        errorCode: "USER_STORAGE_EXCEEDED",
      });
    }

    let analysisId;
    try {
      analysisId = await submitFileForVirusScan(req.file.path);
    } catch (err) {
      console.error("Error submitting file for virus scan:", err);
      fs.unlink(req.file.path, () => {});
      return res.status(500).json({
        success: false,
        message:
          "Error submitting file for virus scan. Please try again later.",
        errorCode: "SCAN_SERVICE_UNAVAILABLE",
      });
    }

    let extractedTextDraft = null;
    let ocrRequired = false;
    let extractionComplete = false;
    let ocrToken = null;

    try {
      const mime = req.file.mimetype;

      if (mime === "text/plain") {
        extractedTextDraft = extractTextFromTxt(req.file.path);
        extractionComplete = true;
      } else if (
        mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        extractedTextDraft = await extractTextFromDocx(req.file.path);
        extractionComplete = true;
      } else if (mime === "application/pdf") {
        const analysis = await analyzeDigitalPdf(req.file.path);

        if (analysis.isHandwritten) {
          ocrRequired = true;
          extractionComplete = false;
        } else {
          extractedTextDraft = analysis.text;
          extractionComplete = true;
        }
      }
    } catch (err) {
      console.error("Text extraction failed:", err);
      extractionComplete = true;
      extractedTextDraft = null;
    }

    const s3Key = `notes/${req.user._id}/${Date.now()}-${req.file.originalname}`;
    const note = new Note({
      title: title.trim(),
      description: description ? description.trim() : "",
      fileKey: s3Key,
      scanAnalysisId: analysisId,
      uploader: req.user._id,
      fileSize: req.file.size,
      fileName: req.file.originalname,
      status: "scanning",
      mimeType: req.file.mimetype,
      quarantinePath: req.file.path,
      extractedTextDraft,
      ocrRequired,
      extractionComplete,
    });
    await note.save();

    if (ocrRequired) {
      ocrToken = jwt.sign(
        {
          noteId: note._id.toString(),
          userId: req.user._id.toString(),
          type: "ocr_callback",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" },
      );

      await Note.findByIdAndUpdate(note._id, { ocrToken });
    }

    res.status(202).json({
      success: true,
      message: ocrRequired
        ? "File received. This appears to be a scanned/handwritten PDF. Please wait while we process it..."
        : "File received and is being scanned with 70+ antivirus engines. You will be notified when complete.",
      note: {
        id: note._id,
        title: note.title,
        fileName: note.fileName,
        status: "scanning",
      },
      ...(ocrRequired && {
        ocrRequired: true,
        ocrToken,
      }),
    });

    startScanPolling(
      note._id,
      analysisId,
      req.file.path,
      s3Key,
      req.file.mimetype,
      req.file.size,
      req.user._id,
    );
  } catch (err) {
    console.error("Error in postUploadNote:", err);

    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred while uploading the note. Please try again.",
      errorCode: "INTERNAL_ERROR",
    });
  }
};

const getApprovedNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ status: "approved" })
      .populate("uploader", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notes,
    });
  } catch (err) {
    console.error("Error fetching approved notes:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes.",
    });
  }
};

const startScanPolling = (
  noteId,
  analysisId,
  quarantinePath,
  s3Key,
  mimeType,
  fileSize,
  userId,
) => {
  let attempts = 0;
  const maxAttempts = 10; // 10 × 30s = 5 minutes

  const intervalId = setInterval(
    async () => {
      attempts++;
      try {
        const result = await getAnalysisResults(analysisId);

        if (result.status === "completed") {
          clearInterval(intervalId);

          const { malicious, suspicious } = result.stats;

          if (malicious > 0 || suspicious > 0) {
            await Note.findByIdAndUpdate(noteId, {
              status: "rejected",
              scanResult: `Malicious: ${malicious}, Suspicious: ${suspicious}`,
              rejectionReason:
                "File flagged as potentially malicious by virus scan.",
              extractedTextDraft: null,
              extractionComplete: true,
            });
            fs.unlink(quarantinePath, () => {});
            console.log(
              `Note ${noteId}: REJECTED (malicious: ${malicious}, suspicious: ${suspicious})`,
            );
          } else {
            try {
              const uploadResult = await uploadS3(
                quarantinePath,
                s3Key,
                mimeType,
              );

              const currentNote = await Note.findById(noteId);
              const bothComplete = currentNote.extractionComplete && true;

              const updateData = {
                fileUrl: uploadResult.url,
                scanResult: "Clean",
              };

              if (bothComplete) {
                updateData.status = "pending";
                updateData.extractedText = currentNote.extractedTextDraft;
                updateData.extractedTextDraft = null;
              }

              await Note.findByIdAndUpdate(noteId, updateData);

              await User.findByIdAndUpdate(userId, {
                $inc: { totalStorageUsed: fileSize },
              });

              await SystemStats.findOneAndUpdate(
                {},
                {
                  $inc: { globalStorageUsed: fileSize, totalNotesUploaded: 1 },
                },
              );

              const updatedStats = await SystemStats.getStats();
              if (updatedStats.globalStorageUsed >= MAX_GLOBAL_STORAGE) {
                await SystemStats.findOneAndUpdate(
                  {},
                  { isUploadEnabled: false },
                );
              }

              console.log(
                `Note ${noteId}: CLEAN — uploaded to S3${bothComplete ? " — status: pending" : " — awaiting OCR"}`,
              );
            } catch (err) {
              console.error(`Note ${noteId}: S3 upload failed:`, err);
              await Note.findByIdAndUpdate(noteId, {
                status: "rejected",
                scanResult: "S3 upload failed after clean scan",
              });
            }

            // Always clean up the quarantined file
            fs.unlink(quarantinePath, () => {});
          }
        } else if (attempts >= maxAttempts) {
          // TIMEOUT — auto-reject after 5 minutes
          clearInterval(intervalId);
          await Note.findByIdAndUpdate(noteId, {
            status: "rejected",
            scanResult: "Unable to process the file",
            rejectionReason: "Unable to process the file",
          });
          fs.unlink(quarantinePath, () => {});
          console.log(
            `Note ${noteId}: TIMEOUT — auto-rejected after 5 minutes`,
          );
        }
        // else: still scanning, wait for next interval
      } catch (err) {
        console.error(`Error polling scan results for note ${noteId}:`, err);
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          await Note.findByIdAndUpdate(noteId, {
            status: "rejected",
            scanResult: "Unable to process the file",
            rejectionReason: "Unable to process the file",
          });
          fs.unlink(quarantinePath, () => {});
          console.log(
            `Note ${noteId}: TIMEOUT (with errors) — auto-rejected after 5 minutes`,
          );
        }
      }
    },
    30000, // 30 seconds
  );
};

const deleteMyNote = async (req, res, next) => {
  try {
    noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    if (note.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this note",
      });
    }

    //Prevent deletion if note is still scanning
    if (note.status === "scanning") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a note that is still being scanned",
      });
    }

    if (note.fileUrl && note.fileKey) {
      try {
        await deleteS3(note.fileKey);
      } catch (err) {
        console.error("Error deleting S3 file:", err);
        // Continue with deletion even if S3 delete fails
      }

      // Update storage counters
      await User.findByIdAndUpdate(note.uploader, {
        $inc: { totalStorageUsed: -note.fileSize },
      });
      await SystemStats.findOneAndUpdate(
        {},
        {
          $inc: { globalStorageUsed: -note.fileSize },
        },
      );

      // Re-enable uploads if under limit
      const stats = await SystemStats.getStats();
      if (
        !stats.isUploadEnabled &&
        stats.globalStorageUsed < MAX_GLOBAL_STORAGE
      ) {
        await SystemStats.findOneAndUpdate({}, { isUploadEnabled: true });
      }
    }

    // If file is still quarantined locally
    if (note.quarantinePath) {
      fs.unlink(note.quarantinePath, () => {});
    }

    // Delete the note document
    await Note.findByIdAndDelete(note._id);

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting note:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete note",
    });
  }
};

module.exports = {
  getMyStorage,
  getMyNotes,
  postUploadNote,
  getApprovedNotes,
  deleteMyNote,
};
