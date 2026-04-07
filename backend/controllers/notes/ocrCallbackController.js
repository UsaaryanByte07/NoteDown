const Note = require("../../models/Note");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const postOcrCallback = async (req, res, next) => {
  try {
    const { ocrToken, extractedText } = req.body;

    if (!ocrToken || !extractedText) {
      return res.status(400).json({
        success: false,
        message: "OCR token and extracted text are required.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(ocrToken, process.env.JWT_SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "OCR session has expired. Please re-upload the file.",
          errorCode: "OCR_TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid OCR token.",
        errorCode: "OCR_TOKEN_INVALID",
      });
    }

    if (decoded.type !== "ocr_callback") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type.",
        errorCode: "OCR_TOKEN_WRONG_TYPE",
      });
    }

    const note = await Note.findById(decoded.noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    if (note.uploader.toString() !== decoded.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this note.",
      });
    }

    if (!note.ocrRequired) {
      return res.status(400).json({
        success: false,
        message: "This note does not require OCR.",
      });
    }

    if (note.extractionComplete) {
      return res.status(400).json({
        success: false,
        message: "OCR has already been completed for this note.",
      });
    }

    const updateData = {
      extractedTextDraft: extractedText,
      extractionComplete: true,
      ocrToken: null,
    };

    if (note.scanResult === "Clean" && note.fileUrl) {
      updateData.extractedText = extractedText;
      updateData.extractedTextDraft = null;
      updateData.status = "pending";
    }

    await Note.findByIdAndUpdate(decoded.noteId, updateData);

    console.log(
      `Note ${decoded.noteId}: OCR text received from frontend (${extractedText.length} chars)`,
    );

    return res.status(200).json({
      success: true,
      message: "OCR text saved successfully.",
    });
  } catch (err) {
    console.error("Error in OCR callback:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save OCR text.",
    });
  }
};

module.exports = {
  postOcrCallback,
};
