import { chunkText } from "../utils/chunker.js";
import { getEmbedding, getEmbeddingsBatch, embedImageDescription } from "./embeddingService.js";
import { upsertVectors, queryVectors } from "./pineconeService.js";
import { streamChat } from "../config/gemini.js";


export async function ingestFile(sourceName, type, content) {
  const vectors = [];
  if (type === "text") {
    const chunks = chunkText(content, sourceName);
    if (chunks.length === 0) return 0;
    const chunkTexts = chunks.map(c => c.text);

    const embeddings = await getEmbeddingsBatch(chunkTexts);

    for (let i = 0; i < chunks.length; i++) {
      vectors.push({
        id: `${sourceName}-chunk-${i}-${Date.now()}`,
        values: embeddings[i],
        metadata: {
          source: sourceName,
          text: chunks[i].text,
          chunkIndex: i,
          type: "text",
        }
      });
    }

  } else if (type === "image") {

    const { description, embedding } = await embedImageDescription(content.base64Data, content.mimeType);
  
    vectors.push({
      id: `${sourceName}-img-${Date.now()}`,
      values: embedding,
      metadata: {
        source: sourceName,
        text: `[Image Description of ${sourceName}]: ${description}`,
        type: "image",
      }
    });
  }

  if (vectors.length > 0) {
    await upsertVectors(vectors);
  }

  return vectors.length;
}

export async function queryRAGStream(userQuestion, res) {
  const questionEmbedding = await getEmbedding(userQuestion);
  const matches = await queryVectors(questionEmbedding, 5);
  let contextText = "";
  const sources = [];

  matches.forEach((match) => {
    if (match.metadata && match.metadata.text) {
      contextText += `\n--- Source: ${match.metadata.source} ---\n${match.metadata.text}\n`;
      sources.push({
        source: match.metadata.source,
        text: match.metadata.text,
        score: match.score,
      });
    }
  });

  const systemPrompt = `You are an expert AI assistant specializing in the FIFA World Cup 2026.
You are provided with contextual information retrieved from a knowledge base.
Your job is to answer the user's question accurately based strictly on the provided context.
If the answer cannot be found in the context, say "I don't have enough information to answer that based on the provided documents."

CONTEXT:
${contextText}
`;

  try {
    const stream = await streamChat(systemPrompt, userQuestion);
    
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done', sources })}\n\n`);
    res.end();

  } catch (error) {
    console.error("RAG Stream Error:", error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: "Failed to generate response." })}\n\n`);
    res.end();
  }
}
