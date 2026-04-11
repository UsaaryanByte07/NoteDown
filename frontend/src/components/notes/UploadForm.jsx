import { useState, useRef } from "react";
import useApi from "../../hooks/useApi";
import useOcrProcessor from "../../hooks/useOcrProcessor";
import Spinner from "../Spinner";

const UploadForm = () => {
  const { error, loading, executeRequest } = useApi();
  const { processOcr, ocrProgress, ocrStatus, ocrError } = useOcrProcessor();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  // uploadStatus: null | 'scanning' | 'uploading' | 'success' | 'error' | 'ocr'

  const [statusMessage, setStatusMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(null);
      setStatusMessage("");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pre-validation (instant feedback, no API call needed)
    if (!selectedFile) {
      setUploadStatus("error");
      setStatusMessage("Please select a file to upload.");
      return;
    }
    if (!title.trim()) {
      setUploadStatus("error");
      setStatusMessage("Please enter a title for your notes.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setStatusMessage("File is too large. Maximum file size is 10 MB.");
      return;
    }

    // Valid file types
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setUploadStatus("error");
      setStatusMessage(
        "Invalid file type. Only PDF, DOCX, and text files are accepted.",
      );
      return;
    }

    // Build FormData (your useApi hook already handles this!)
    const formData = new FormData();
    formData.append("noteFile", selectedFile);
    formData.append("title", title.trim());
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    // Step 1: Show scanning status
    setUploadStatus("scanning");
    setStatusMessage("Uploading and Scanning file for viruses...");

    // Step 2: Send to backend
    const result = await executeRequest("/api/notes/upload", {
      method: "POST",
      body: formData,
    });

    if (result.success) {
      // if OCR is needed
      if (result.data?.ocrRequired && result.data?.ocrToken) {
        setUploadStatus("ocr");
        setStatusMessage(
          "Scanned/handwritten PDF detected. Starting text extraction...",
        );

        // selectedFile in state — processOcr needs it!
        processOcr(selectedFile, result.data.ocrToken);
      } else {
        // Normal upload — text extracted on backend, no OCR needed
        setUploadStatus("success");
        setStatusMessage(
          result.data.message || "File uploaded! Pending admin approval.",
        );
        resetForm();
      }
    } else {
      setUploadStatus("error");
      setStatusMessage(result.message || "Upload failed. Please try again.");
    }
  };

  const getStatusStyles = () => {
    if (uploadStatus === "ocr") {
      switch (ocrStatus) {
        case "loading":
        case "processing":
        case "sending":
          return "bg-warning-light border-warning text-warning-text";
        case "complete":
          return "bg-success-light border-success text-success-text";
        case "error":
          return "bg-danger-light border-danger text-danger-text";
        default:
          return "bg-warning-light border-warning text-warning-text";
      }
    }

    switch (uploadStatus) {
      case "scanning":
        return "bg-warning-light border-warning text-warning-text";
      case "uploading":
        return "bg-info-light border-info text-info-text";
      case "success":
        return "bg-success-light border-success text-success-text";
      case "error":
        return "bg-danger-light border-danger text-danger-text";
      default:
        return "";
    }
  };

  const getStatusIcon = () => {
    if (uploadStatus === "ocr") {
      if (ocrStatus === "complete") return "✅ ";
      if (ocrStatus === "error") return "❌ ";
      return "🔍 ";
    }
    switch (uploadStatus) {
      case "scanning":
        return "🔍 ";
      case "uploading":
        return "📤 ";
      case "success":
        return "✅ ";
      case "error":
        return "❌ ";
      default:
        return "";
    }
  };

  const getDisplayMessage = () => {
    if (uploadStatus === "ocr") {
      if (ocrStatus === "error") return ocrError || "OCR processing failed.";
      if (ocrStatus === "complete") {
        if (selectedFile) {
          setTimeout(() => resetForm(), 100);
        }
        return "Text extraction complete! File uploaded and pending admin approval.";
      }
      return ocrProgress || statusMessage;
    }
    return statusMessage;
  };

  const isBusy =
    loading ||
    (uploadStatus === "ocr" &&
      ocrStatus !== "complete" &&
      ocrStatus !== "error");

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bg border border-border rounded-2xl p-6 shadow-sm"
    >
      {/* Title Input */}
      <div className="mb-4">
        <label
          htmlFor="note-title"
          className="block text-sm font-medium text-text-primary mb-1"
        >
          Title *
        </label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Physics Chapter 1 Notes"
          className="w-full px-4 py-2 border border-border rounded-lg bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isBusy}
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label
          htmlFor="note-description"
          className="block text-sm font-medium text-text-primary mb-1"
        >
          Description (optional)
        </label>
        <textarea
          id="note-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the notes..."
          rows={3}
          className="w-full px-4 py-2 border border-border rounded-lg bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          disabled={isBusy}
        />
      </div>

      {/* File Input */}
      <div className="mb-6">
        <label
          htmlFor="note-file"
          className="block text-sm font-medium text-text-primary mb-1"
        >
          File * (PDF, DOCX, or Text — max 10 MB, max 15 pages)
        </label>
        <input
          id="note-file"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
          className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-border file:text-sm file:font-medium file:bg-bg-subtle file:text-text-primary hover:file:bg-bg"
          disabled={isBusy}
        />
        {selectedFile && (
          <p className="text-xs text-text-secondary mt-1">
            Selected: {selectedFile.name} (
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Status Feedback */}
      {(uploadStatus || (uploadStatus === "ocr" && ocrStatus)) && (
        <div
          className={`mb-4 p-3 border rounded-lg text-sm ${getStatusStyles()}`}
        >
          {getStatusIcon()}
          {getDisplayMessage()}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isBusy || !selectedFile || !title.trim()}
        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isBusy ? (
          <>
            <Spinner size="sm" />
            {uploadStatus === "ocr" ? "Extracting Text..." : "Processing..."}
          </>
        ) : (
          "Upload Notes"
        )}
      </button>
    </form>
  );
};

export default UploadForm;
