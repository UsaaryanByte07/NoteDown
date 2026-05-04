const Note = require("../models/Note");

const { getChatModel } = require("../config/gemini_config");

const generateSummary = async (noteId) => {
  try {
    const note = await Note.findById(noteId);
    if (!note || !note.extractedText) {
      console.warn(
        `Summary skipped for note ${noteId}: no extracted text found.`,
      );
      await Note.findByIdAndUpdate(noteId, { summaryStatus: "failed" });
      return;
    }

    await Note.findByIdAndUpdate(noteId, { summaryStatus: "generating" });

    const prompt = `You are a helpful academic assistant. Below is text extracted from a study note. 
The text may contain OCR artifacts, formatting issues, or minor inaccuracies from the extraction process.

Your task: Write a clear, concise summary of the note's content in 2-3 sentences. 
Focus on the key topics, concepts, or information covered. 
Do NOT mention the extraction quality or formatting issues in your summary.

--- START OF NOTE TEXT ---
${note.extractedText.substring(0, 8000)}
--- END OF NOTE TEXT ---

Summary:`;

    const chatModel = await getChatModel();
    const response = await chatModel.invoke(prompt);

    const summary =
      typeof response.content === "string"
        ? response.content.trim()
        : response.content.toString().trim();

    if (!summary) {
      throw new Error("Gemini returned an empty summary.");
    }

    await Note.findByIdAndUpdate(noteId, {
      aiSummary: summary,
      summaryStatus: "completed",
    });

    console.log(`Summary generated for note ${noteId}`);
  } catch (err) {
    console.error(`Summary generation failed for note ${noteId}:`, err.message);

    const isSafetyBlock =
      err.message?.includes("SAFETY") ||
      err.message?.includes("blocked") ||
      err.message?.includes("RECITATION");

    await Note.findByIdAndUpdate(noteId, {
      summaryStatus: "failed",
      ...(isSafetyBlock && {
        aiSummary: "Summary unavailable for this content.",
      }),
    });
  }
};

module.exports = {
  generateSummary,
};
