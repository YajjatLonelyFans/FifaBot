import { getIndex } from "../config/pinecone.js";


export async function upsertVectors(vectors) {
  const index = getIndex();
  
  // Pinecone recommends upserting in batches of ~100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }
}

export async function queryVectors(queryEmbedding, topK = 5) {
  const index = getIndex();
  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK: topK,
    includeMetadata: true,
  });
  
  return queryResponse.matches || [];
}

export async function deleteBySource(sourceFileName) {
  const index = getIndex();
  console.log(`[Pinecone] Delete by source called for: ${sourceFileName} - implement metadata filter deletion if needed.`);
}
