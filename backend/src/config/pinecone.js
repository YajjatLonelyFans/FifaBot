import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.PINECONE_API_KEY) {
  throw new Error(
    "PINECONE_API_KEY is missing!"
  );
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "fifabot";

const EMBEDDING_DIMENSION = 768;

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});


async function ensureIndex() {
  const indexList = await pinecone.listIndexes();
  const exists = indexList.indexes?.some((idx) => idx.name === PINECONE_INDEX_NAME);

  if (!exists) {
    console.log(` Creating Pinecone index "${PINECONE_INDEX_NAME}"...`);
    await pinecone.createIndex({
      name: PINECONE_INDEX_NAME,
      dimension: EMBEDDING_DIMENSION,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    console.log(`Index "${PINECONE_INDEX_NAME}" created successfully.`);

    // Wait for the index to be ready
    console.log(" Waiting for index to initialize...");
    await waitForIndexReady(PINECONE_INDEX_NAME);
    console.log(" Index is ready!");
  } else {
    console.log(` Pinecone index "${PINECONE_INDEX_NAME}" already exists.`);
  }
}


async function waitForIndexReady(indexName, maxWaitMs = 60000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const description = await pinecone.describeIndex(indexName);
    if (description.status?.ready) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Index "${indexName}" did not become ready within ${maxWaitMs / 1000}s`);
}


function getIndex() {
  return pinecone.index(PINECONE_INDEX_NAME);
}

export { pinecone, ensureIndex, getIndex, PINECONE_INDEX_NAME, EMBEDDING_DIMENSION };
