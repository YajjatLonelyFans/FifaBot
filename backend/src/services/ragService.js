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
    try {
      console.log(`[Ingest] Processing image: ${sourceName}, mimeType: ${content.mimeType}, base64 length: ${content.base64Data?.length || 0}`);
      const { description, embedding } = await embedImageDescription(content.base64Data, content.mimeType);
      console.log(`[Ingest] Image described. Description length: ${description?.length || 0}, Embedding length: ${embedding?.length || 0}`);
    
      if (embedding && embedding.length > 0) {
        vectors.push({
          id: `${sourceName}-img-${Date.now()}`,
          values: embedding,
          metadata: {
            source: sourceName,
            text: `[Image Description of ${sourceName}]: ${description}`,
            type: "image",
          }
        });
      } else {
        console.warn(`[Ingest] No embedding returned for image: ${sourceName}`);
      }
    } catch (imgError) {
      console.error(`[Ingest] Failed to process image ${sourceName}:`, imgError.message);
      throw new Error(`Image processing failed: ${imgError.message}`);
    }
  }

  console.log(`[Ingest] Total vectors to upsert: ${vectors.length}`);

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

  // Only include matches with a reasonable relevance score
  matches.forEach((match) => {
    if (match.metadata && match.metadata.text && match.score > 0.5) {
      contextText += `\n--- Source: ${match.metadata.source} ---\n${match.metadata.text}\n`;
      sources.push({
        source: match.metadata.source,
        text: match.metadata.text,
        score: match.score,
      });
    }
  });

  const hasContext = contextText.trim().length > 0;
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const systemPrompt = hasContext
    ? `You are an expert AI assistant specializing in the FIFA World Cup 2026.
Today's date is ${currentDate}. The FIFA World Cup 2026 is being hosted by the United States, Mexico, and Canada, and the tournament kicked off on June 11, 2026.
You have access to contextual information retrieved from the user's uploaded knowledge base, Google Search for live/real-time data, and your own general knowledge about FIFA and football.

**Instructions:**
- PRIORITIZE the provided context when answering. If the context contains relevant information, base your answer on it and cite the sources.
- For live scores, standings, match results, or any current tournament data, USE Google Search to get the latest information. Do NOT say you don't have access to live data.
- If the context does NOT contain the answer but the question is about FIFA, football, or the World Cup, use Google Search or your own general knowledge to answer.
- If the question is completely unrelated to FIFA or football, politely redirect the user.
- The tournament is CURRENTLY UNDERWAY. Never say it hasn't started or that you can't access live data.

CONTEXT FROM UPLOADED DOCUMENTS:
${contextText}
`
    : `You are an expert AI assistant specializing in the FIFA World Cup 2026.
Today's date is ${currentDate}. The FIFA World Cup 2026 is being hosted by the United States, Mexico, and Canada, and the tournament kicked off on June 11, 2026.
You have access to Google Search for live/real-time data and your own general knowledge. The user has not uploaded any documents yet, or no relevant documents were found for this query.

**Instructions:**
- For live scores, standings, match results, or any current tournament data, USE Google Search to get the latest information. Do NOT say you don't have access to live data.
- Answer questions about FIFA, football, the World Cup, players, teams, tournaments, and related topics enthusiastically.
- Be conversational, helpful, and enthusiastic about football.
- The tournament is CURRENTLY UNDERWAY. Never say it hasn't started or that you can't access live data.
- If the user asks something completely unrelated to FIFA or football, politely let them know you specialize in FIFA and football topics.
- If the user asks about specific uploaded documents and none are available, let them know they can upload documents using the upload button for more specific answers.
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
