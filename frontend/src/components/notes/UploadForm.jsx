import { useState, useRef } from "react";
import useApi from "../../hooks/useApi";

const UploadForm = () => {
  const { error, loading, executeRequest } = useApi();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  // uploadStatus: null | 'scanning' | 'uploading' | 'success' | 'error'

  const [statusMessage, setStatusMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(null);
      setStatusMessage("");
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
    if (selectedFile.size > 25 * 1024 * 1024) {
      setUploadStatus("error");
      setStatusMessage("File is too large. Maximum file size is 25 MB.");
      return;
    }

    // Valid file types
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setUploadStatus("error");
      setStatusMessage(
        "Invalid file type. Only PDF, Word, and text files are accepted.",
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
    setStatusMessage("Scanning file for viruses...");

    // Step 2: Send to backend
    const result = await executeRequest("/api/notes/upload", {
      method: "POST",
      body: formData,
    });

    if (result.success) {
      setUploadStatus("success");
      setStatusMessage(
        result.data.message || "File uploaded! Pending admin approval.",
      );
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setUploadStatus("error");
      // Use the specific error message from the backend
      setStatusMessage(result.message || "Upload failed. Please try again.");
    }
  };

  const getStatusStyles = () => {
    switch (uploadStatus) {
      case "scanning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "uploading":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "";
    }
  };

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
          disabled={loading}
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
          disabled={loading}
        />
      </div>

      {/* File Input */}
      <div className="mb-6">
        <label
          htmlFor="note-file"
          className="block text-sm font-medium text-text-primary mb-1"
        >
          File * (PDF, Word, or Text — max 25 MB)
        </label>
        <input
          id="note-file"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-border file:text-sm file:font-medium file:bg-bg-subtle file:text-text-primary hover:file:bg-bg"
          disabled={loading}
        />
        {selectedFile && (
          <p className="text-xs text-text-secondary mt-1">
            Selected: {selectedFile.name} (
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Status Feedback */}
      {uploadStatus && (
        <div
          className={`mb-4 p-3 border rounded-lg text-sm ${getStatusStyles()}`}
        >
          {uploadStatus === "scanning" && "🔍 "}
          {uploadStatus === "uploading" && "📤 "}
          {uploadStatus === "success" && "✅ "}
          {uploadStatus === "error" && "❌ "}
          {statusMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !selectedFile || !title.trim()}
        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Upload Notes"}
      </button>
    </form>
  );
};

export default UploadForm;
