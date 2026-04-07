const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const ESTIMATED_CHARS_PER_PAGE = 3000; 

const getPageCount = async (filePath, mimeType) => {
     if (mimeType === "application/pdf") {
    const pdfBuffer = fs.readFileSync(filePath);
    try {
      const data = await pdfParse(pdfBuffer);
      return data.numpages;
    } catch (err) {
      console.error("pdf-parse page count failed:", err.message);
      // If can't count pages, return 0 and let the extraction step handle it
      return 0;
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return Math.ceil(result.value.length / ESTIMATED_CHARS_PER_PAGE) || 1;
    } catch (err) {
      console.error("mammoth page count failed:", err.message);
      return 1; // Assuming 1 page if we can't determine
    }
  }

  if (mimeType === "text/plain") {
    const content = fs.readFileSync(filePath, "utf-8");
    return Math.ceil(content.length / ESTIMATED_CHARS_PER_PAGE) || 1;
  }

  return 1; // Unknown type — assume 1 page
}

module.exports = {
    getPageCount,
};