const mongoose = require("mongoose");
const Note = require("../models/Note");
const {
  getDocument,
  getTextSplitter,
  getEmbeddingModel,
} = require("../config/gemini_config");

const EMBEDDINGS_COLLECTION = "note_embeddings";
const VECTOR_INDEX_NAME = "vector_index";

const getEmbeddingsCollection = () => {
  return mongoose.connection.db.collection(EMBEDDINGS_COLLECTION);
};

const embedNoteContent = async (noteId) => {
  try {
    const note = await Note.findById(noteId);
    if (!note || !note.extractedText) {
      console.warn(`Embedding skipped for note ${noteId}: no extracted text.`);
      return;
    }

    const text = note.extractedText;

    const splitter = await getTextSplitter(500, 50);
    const Document = await getDocument();

    const doc = new Document({
      pageContent: text,
      metadata: { noteId: noteId.toString() },
    });

    const chunks = await splitter.splitDocuments([doc]);

    if (chunks.length === 0) {
      console.warn(`No chunks created for note ${noteId}. Skipping embedding.`);
      return;
    }

    console.log(
      `Note ${noteId}: Split into ${chunks.length} chunks. Generating embeddings...`,
    );

    const { MongoDBAtlasVectorSearch } = await import("@langchain/mongodb");
    const embeddingModel = await getEmbeddingModel();
    const collection = getEmbeddingsCollection();

    const vectorSearch = new MongoDBAtlasVectorSearch(embeddingModel, {
      collection,
      indexName: VECTOR_INDEX_NAME,
      textKey: "text",
      embeddingKey: "embedding",
    });

    await vectorStore.addDocuments(chunks);

    console.log(
      `Note ${noteId}: ${chunks.length} embeddings stored in Atlas Vector Search.`,
    );

  } catch (err) {
    console.error(`Embedding pipeline failed for note ${noteId}:`, err.message);
  }
};

const deleteNoteEmbeddings = async (noteId) => {
  try {
    const collection = getEmbeddingsCollection();

    const result = await collection.deleteMany({
      "metadata.noteId": noteId.toString(),
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
