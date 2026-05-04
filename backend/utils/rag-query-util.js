const mongoose = require("mongoose");
const {
  getChatModel,
  getEmbeddingModel,
  getPromptTemplate,
} = require("../config/gemini_config");
const {
  getEmbeddingsCollection,
  VECTOR_INDEX_NAME,
} = require("./embedding-util");

/**
 * Search for relevant text chunks from the given notes.
 *
 * @param {string} query - The user's question
 * @param {string[]} noteIds - Array of noteId strings to filter by
 * @param {number} topK - Number of chunks to retrieve (default: 5)
 * @returns {string} - Concatenated relevant text chunks
 */
const retrieveContext = async (query, noteIds, topK = 5) => {
  const { MongoDBAtlasVectorSearch } = await import("@langchain/mongodb");
  const embeddingModel = await getEmbeddingModel();
  const collection = getEmbeddingsCollection();

  const vectorStore = new MongoDBAtlasVectorSearch(embeddingModel, {
    collection,
    indexName: VECTOR_INDEX_NAME,
    textKey: "text",
    embeddingKey: "embedding",
  });

  // Atlas Vector Search preFilter does NOT support $in.
  // It only supports: $eq, $ne, $lt, $lte, $gt, $gte, $or, $and.
  // NOTE: LangChain's addDocuments() flattens Document.metadata to the top
  // level of each stored document — so the field is "noteId", NOT "metadata.noteId".
  // The Atlas index filter field must also use path: "noteId".
  const preFilter =
    noteIds.length === 1
      ? { noteId: { $eq: noteIds[0] } }
      : { $or: noteIds.map((id) => ({ noteId: { $eq: id } })) };

  const results = await vectorStore.similaritySearch(query, topK, {
    preFilter,
  });

  if (results.length === 0) {
    return "";
  }

  // Concatenate the retrieved chunks into a single context string
  return results.map((doc) => doc.pageContent).join("\n\n---\n\n");
};

const generateRAGResponse = async (userMessage, noteIds, chatHistory) => {
  // 1. Retrieve relevant context from vector store
  const context = await retrieveContext(userMessage, noteIds);

  // 2. Build conversation history string
  const historyText = chatHistory
    .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");

  // 3. Build the strict prompt using ChatPromptTemplate
  const ChatPromptTemplate = await getPromptTemplate();

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful study assistant for the NoteDown platform.
You help students understand their study notes.

STRICT RULES:
1. Answer the user's question using ONLY the provided context below.
2. If the answer is not contained in the context, do not try to guess or use outside knowledge.
   Simply reply: "Please ask questions related to the selected notes."
3. Be concise, clear, and educational in your responses.
4. If the context is empty or irrelevant, reply: "Please ask questions related to the selected notes."
5. Format your response with proper markdown when helpful (bullet points, bold, etc.)

CONTEXT FROM SELECTED NOTES:
{context}

RECENT CONVERSATION:
{history}`,
    ],
    ["human", "{question}"],
  ]);

  // 4. Invoke the chain with the resolved values
  const chatModel = await getChatModel();
  const chain = prompt.pipe(chatModel);

  const response = await chain.invoke({
    context: context || "No relevant context found.",
    history: historyText || "No previous messages.",
    question: userMessage,
  });

  // 5. Extract text from the AIMessage
  return typeof response.content === "string"
    ? response.content.trim()
    : response.content.toString().trim();
};

module.exports = { retrieveContext, generateRAGResponse };