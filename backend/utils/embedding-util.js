const mongoose = require("mongoose");
const Note = require("../models/Note");
const {
  getDocument,
  getTextSplitter,
  getEmbeddingModel,
} = require("../config/gemini_config");

// Name of the MongoDB collection where embeddings are stored
const EMBEDDINGS_COLLECTION = "note_embeddings";
// Name of the Atlas Vector Search index (must match what you created in Atlas)
const VECTOR_INDEX_NAME = "vector_index";

/**
 * Get the native MongoDB collection for embeddings.
 * @langchain/mongodb requires a native Collection, not a Mongoose model.
 */
const getEmbeddingsCollection = () => {
  return mongoose.connection.db.collection(EMBEDDINGS_COLLECTION);
};

/**
 * Embed the extracted text of a note and store in Atlas Vector Search.
 * Called as fire-and-forget after admin approval.
 *
 * @param {string} noteId - The MongoDB ObjectId of the note
 */
const embedNoteContent = async (noteId) => {
  try {
    // 1. Fetch the note
    const note = await Note.findById(noteId);
    if (!note || !note.extractedText) {
      console.warn(`Embedding skipped for note ${noteId}: no extracted text.`);
      return;
    }

    const text = note.extractedText;

    // 2. Split the text into chunks
    const splitter = await getTextSplitter(500, 50);
    const Document = await getDocument();

    // Wrap in a Document with noteId metadata BEFORE splitting.
    // splitDocuments() propagates metadata to every chunk automatically.
    // NOTE: LangChain's addDocuments() flattens Document.metadata to the
    // top level of each stored MongoDB document — so noteId is stored as a
    // top-level field, not nested under "metadata". The Atlas Vector Search
    // index filter path must use "noteId", not "metadata.noteId".
    const doc = new Document({
      pageContent: text,
      metadata: { noteId: noteId.toString() },
    });

    const chunks = await splitter.splitDocuments([doc]);

    if (chunks.length === 0) {
      console.warn(`No chunks produced for note ${noteId}. Skipping embedding.`);
      return;
    }

    console.log(
      `Note ${noteId}: Split into ${chunks.length} chunks. Generating embeddings...`,
    );

    // 3. Initialize the vector store
    const { MongoDBAtlasVectorSearch } = await import("@langchain/mongodb");
    const embeddingModel = await getEmbeddingModel();
    const collection = getEmbeddingsCollection();

    const vectorSearch = new MongoDBAtlasVectorSearch(embeddingModel, {
      collection,
      indexName: VECTOR_INDEX_NAME,
      textKey: "text",
      embeddingKey: "embedding",
    });

    // 4. Add documents — this generates embeddings AND stores them
    await vectorSearch.addDocuments(chunks);

    console.log(
      `Note ${noteId}: ${chunks.length} embeddings stored in Atlas Vector Search.`,
    );
  } catch (err) {
    console.error(`Embedding pipeline failed for note ${noteId}:`, err.message);
    // Embedding failure is non-fatal — the note is still approved.
    // Chat will gracefully handle missing embeddings by returning
    // "no relevant context found" responses.
  }
};

/**
 * Delete all embedded chunks for a specific note.
 * Called when a note is deleted by its owner or rejected by admin.
 *
 * NOTE: LangChain stores metadata fields at the top level of each document,
 * so we query the top-level "noteId" field, not "metadata.noteId".
 *
 * @param {string} noteId - The MongoDB ObjectId of the note
 */
const deleteNoteEmbeddings = async (noteId) => {
  try {
    const collection = getEmbeddingsCollection();

    const result = await collection.deleteMany({
      noteId: noteId.toString(),
    });

    console.log(
      `Deleted ${result.deletedCount} embedding chunks for note ${noteId}.`,
    );
  } catch (err) {
    console.error(
      `Failed to delete embeddings for note ${noteId}:`,
      err.message,
    );
  }
};

module.exports = {
  embedNoteContent,
  deleteNoteEmbeddings,
  getEmbeddingsCollection,
  EMBEDDINGS_COLLECTION,
  VECTOR_INDEX_NAME,
};
