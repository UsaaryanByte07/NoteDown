const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  fileUrl: { type: String, required: true },
  fileKey: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  reviewedAt: { type: Date, default: null },
  rejectionReason: {
    type: String,
    default: "",
  },
  scanAnalysisId: {
    type: String,
    default: null,
  },
  quarantinePath: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["scanning","pending", "approved", "rejected"],
    default: "scanning",
  },
}, {
    timestamps: true,
    // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("Note", noteSchema);
