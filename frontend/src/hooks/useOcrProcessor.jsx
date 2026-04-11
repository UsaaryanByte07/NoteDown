import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import useApi from "./useApi";

// Set the worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const useOcrProcessor = () => {
  const [ocrStatus, setOcrStatus] = useState(null);
  const [ocrProgress, setOcrProgress] = useState("");
  const [ocrError, setOcrError] = useState(null);
  const { executeRequest } = useApi();

  const renderPageToCanvas = async (pdf, pgNum, scale = 2.0) => {
    const page = await pdf.getPage(pgNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas;
  };

  const processOcr = useCallback(
    async (file, ocrToken) => {
      setOcrStatus("loading");
      setOcrProgress("Loading PDF...");
      setOcrError(null);

      let pdf = null;
      let tesseractWorker = null;

      try {
        //Loading the PDF with pdfjs-dist
        const arrayBuffer = await file.arrayBuffer();
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalNumPgs = pdf.numPages;

        //Initialize Tesseract worker
        setOcrProgress("Initializing OCR engine...");
        tesseractWorker = await createWorker("eng");

        setOcrStatus("processing");
        let fullText = "";

        for (let pgNum = 1; pgNum <= totalNumPgs; pgNum++) {
          setOcrProgress(`Processing page ${pgNum} of ${totalNumPgs}...`);

          //render the current page to a canvas
          const canvas = await renderPageToCanvas(pdf, pgNum);

          // Run OCR on the canvas
          const {
            data: { text },
          } = await tesseractWorker.recognize(canvas);
          fullText += text;

          //Add page break after each page's text
          if (pgNum < totalNumPgs) {
            fullText += "\n\n--- Page " + (pgNum + 1) + " ---\n\n";
          }
        }

        setOcrStatus("sending");
        setOcrProgress("Sending extracted text to server...");

        const result = await executeRequest("/api/notes/ocr-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ocrToken,
            extractedText: fullText,
          }),
        });

        if (result.success) {
          setOcrStatus("complete");
          setOcrProgress("OCR processing complete!");
        } else {
          setOcrStatus("error");
          setOcrError(result.error || "Failed to send OCR data to server");
        }
      } catch (err) {
        console.error("OCR processing error:", err);
        setOcrStatus("error");
        setOcrError(
          err.message ||
            "An error occurred during text extraction. The note has been uploaded but text extraction failed.",
        );
      } finally {
        if (tesseractWorker) {
          try {
            await tesseractWorker.terminate();
          } catch (err) {
            console.error("Error terminating Tesseract worker:", err);
          }
        }
        if (pdf) {
          try {
            pdf.destroy();
          } catch (err) {
            console.error("Error destroying PDF document:", err);
          }
        }
      }
    },
    [executeRequest],
  );

  return { ocrStatus, ocrProgress, ocrError, processOcr };
};

export default useOcrProcessor;
