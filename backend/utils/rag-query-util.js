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

  const results = await vectorStore.similaritySearch(query, topK, {
    preFilter: {
      "metadata.noteId": {
        $in: noteIds,
      },
    },
  });

  if (results.length === 0) {
    return "";
  }

  return results.map((doc) => doc.pageContent).join("\n\n---\n\n");
};

const generateRAGResponse = async (userMessage, noteIds, chatHistory) => {
  const context = await retrieveContext(userMessage, noteIds);

  const ChatPromtTemplate = await getPromptTemplate();

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

  const chatModel = await getChatModel();
  const chain = prompt.pipe(chatModel);

  const response = await chain.invoke({
    context: context || "No relevant context found.",
    history: historyText || "No previous messages.",
    question: userMessage,
  });

  return typeof response.content === "string"
    ? response.content.trim()
    : response.content.toString().trim();
};

module.exports = {
  generateRAGResponse,
  retrieveContext,
};