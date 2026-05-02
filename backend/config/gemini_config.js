request("dotenv").config();

let _chatModel = null;
let _embeddingModel = null;

//Chat Model
const getChatModel = async () => {
  if (_chatModel) return _chatModel;

  const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
  const { HarmCategory, HarmBlockThreshold } =
    await import("@google/generative-ai");

  _chatModel = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    maxOutputTokens: 1024,
    temperature: 0.4,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });

  return _chatModel;
};

//Embedding Model
const getEmbeddingModel = async () => {
  if (_embeddingModel) return _embeddingModel;

  const { GoogleGenerativeAIEmbeddings } =
    await import("@langchain/google-genai");

  _embeddingModel = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
    // Reduces Atlas storage costs while retaining strong retrieval quality.
    dimensions: 768,
  });
  return _embeddingModel;
};

//Langchain Utility Loaders

const getTextSplitter = async (chunkSize = 500, chunkOverlap = 50) => {
  const { RecursiveCharacterTextSplitter } =
    await import("@langchain/textsplitters");

  return new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
};

const getPromptTemplate = async () => {
  const { ChatPromptTemplate } = await import("@langchain/core/prompts");
  return ChatPromptTemplate;
};

const getDocument = async () => {
  const { Document } = await import("@langchain/core/documents");
  return Document;
};

module.exports = {
  getChatModel,
  getEmbeddingModel,
  getTextSplitter,
  getPromptTemplate,
  getDocument,
};
