import { embedText, embedBatch, describeImage } from "../config/gemini.js";


export async function getEmbedding(text) {
  return await embedText(text);
}

export async function getEmbeddingsBatch(texts) {
  return await embedBatch(texts);
}

export async function embedImageDescription(base64Data, mimeType) {
  const description = await describeImage(base64Data, mimeType);
  const embedding = await embedText(description);
  return { description, embedding };
}
