require("dotenv").config();

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

if (API_KEYS.length === 0) {
  console.error(
    "[GeminiConfig] CRITICAL: No Gemini API keys configured. " +
      "Set GEMINI_API_KEY_1 (and optionally _2, _3, _4) in your .env file.",
  );
}

let currentKeyIndex = 0;

const isRetryableError = (err) => {
  const msg = err?.message || "";
  const isSafetyOrContent =
    msg.includes("SAFETY") ||
    msg.includes("RECITATION") ||
    msg.includes("blocked");
  return !isSafetyOrContent;
};

let _chatModel = null;
let _embeddingModel = null;

const buildChatModel = async (apiKey) => {
  const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
  const { HarmCategory, HarmBlockThreshold } =
    await import("@google/generative-ai");

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey,
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
};

const buildEmbeddingModel = async (apiKey) => {
  const { GoogleGenerativeAIEmbeddings } =
    await import("@langchain/google-genai");
  return new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey,
  });
};

const callWithFailover = async (buildFn, invokeFn) => {
  if (API_KEYS.length === 0) {
    throw new Error("No Gemini API keys are configured.");
  }

  let lastError;
  const startIndex = currentKeyIndex;

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const keyIndex = (startIndex + attempt) % API_KEYS.length;
    const key = API_KEYS[keyIndex];

    try {
      const model = await buildFn(key);
      const result = await invokeFn(model);
      currentKeyIndex = keyIndex;
      if (attempt > 0) {
        console.log(
          `[GeminiConfig] Key #${keyIndex + 1} succeeded after ${attempt} failure(s).`,
        );
      }
      return result;
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err)) {
        throw err;
      }
      console.warn(
        `[GeminiConfig] Key #${keyIndex + 1} failed: ${err.message}. ` +
          (attempt + 1 < API_KEYS.length
            ? `Trying key #${((keyIndex + 1) % API_KEYS.length) + 1}.`
            : "All keys exhausted."),
      );
      currentKeyIndex = (keyIndex + 1) % API_KEYS.length;
    }
  }

  throw lastError;
};

const invokeChatModel = async (promptOrMessages) => {
  return callWithFailover(buildChatModel, (model) =>
    model.invoke(promptOrMessages),
  );
};

const invokeEmbeddingModel = async (texts) => {
  return callWithFailover(buildEmbeddingModel, (model) =>
    model.embedDocuments(texts),
  );
};

const getTextSplitter = async (chunkSize = 500, chunkOverlap = 50) => {
  const { RecursiveCharacterTextSplitter } =
    await import("@langchain/textsplitters");
  return new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
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
  invokeChatModel,
  invokeEmbeddingModel,
  getTextSplitter,
  getPromptTemplate,
  getDocument,
};
