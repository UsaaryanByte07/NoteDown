const fs = require("fs");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

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

  let parser;
  try {
    parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
    const textResult = await parser.getText();
    const doc = await parser.load();
    const pageCount = doc.numPages;
    const extractedText = textResult.text;
    const avgCharsPerPage = extractedText.length / pageCount;

    if (avgCharsPerPage < 50) {
      return {
        text: null,
        pageCount: pageCount,
        isHandwritten: true,
      };
    }

    return {
      text: extractedText,
      pageCount: pageCount,
      isHandwritten: false,
    };
  } catch (err) {
    console.error("pdf-parse failed (treating as handwritten):", err.message);
    return {
      text: null,
      pageCount: 0,
      isHandwritten: true,
    };
  } finally {
    if (parser) {
      try { await parser.destroy(); } catch (_) {}
    }
  }
};

module.exports = {
    extractTextFromTxt,
    extractTextFromDocx,
    analyzeDigitalPdf,
};
