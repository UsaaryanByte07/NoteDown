const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const extractTextFromTxt = (filePath) => {
  return fs.readFileSync(filePath, "utf-8");
};

const extractTextFromDocx = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  console.log("Message from mammoth:", result.messages);
  return result.value;
};

const analyzeDigitalPdf = async (filePath) => {
  const pdfBuffer = fs.readFileSync(filePath);

  let data;
  try {
    data = await pdfParse(pdfBuffer);
  } catch (err) {
    console.error("pdf-parse failed (treating as handwritten):", err.message);
    return {
      text: null,
      pageCount: 0,
      isHandwritten: true,
    };
  }

  const pageCount = data.numpages;
  const extractedText = data.text;
  const avgCharsPerPage = extractedText.length / pageCount;

  if (avgCharsPerPage < 50) {
    return {
      text: extractedText,
      pageCount: pageCount,
      isHandwritten: true,
    };
  }

  return {
    text: extractedText,
    pageCount: pageCount,
    isHandwritten: false,
  }
};

module.exports = {
    extractTextFromTxt,
    extractTextFromDocx,
    analyzeDigitalPdf,
};
