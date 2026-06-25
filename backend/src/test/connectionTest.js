import { embedText, chatModel } from "../config/gemini.js";
import { pinecone, ensureIndex, PINECONE_INDEX_NAME } from "../config/pinecone.js";

const DIVIDER = "-".repeat(50);

async function testGeminiChat() {
  console.log("\nTest 1: Gemini Chat (gemini-2.5-flash)");
  console.log(DIVIDER);
  try {
    const result = await chatModel.generateContent(
      "In one sentence, who won the FIFA World Cup 2022?"
    );
    const text = result.response.text();
    console.log(`PASS | Response: ${text.trim()}`);
    return true;
  } catch (error) {
    console.error(`FAIL | Gemini Chat: ${error.message}`);
    return false;
  }
}

async function testGeminiEmbedding() {
  console.log("\nTest 2: Gemini Embeddings (gemini-embedding-001)");
  console.log(DIVIDER);
  try {
    const vector = await embedText("FIFA World Cup 2026 will be held in USA, Canada, and Mexico");
    console.log(`PASS | Dimensions: ${vector.length}`);
    console.log(`     | First 5 values: [${vector.slice(0, 5).map((v) => v.toFixed(6)).join(", ")}]`);
    return true;
  } catch (error) {
    console.error(`FAIL | Gemini Embedding: ${error.message}`);
    return false;
  }
}

async function testPinecone() {
  console.log("\nTest 3: Pinecone Connection");
  console.log(DIVIDER);
  try {
    await ensureIndex();
    const description = await pinecone.describeIndex(PINECONE_INDEX_NAME);
    console.log(`PASS | Index: ${description.name}`);
    console.log(`     | Dimension: ${description.dimension}`);
    console.log(`     | Metric: ${description.metric}`);
    console.log(`     | Status: ${description.status?.ready ? "Ready" : "Initializing"}`);
    return true;
  } catch (error) {
    console.error(`FAIL | Pinecone: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log("\nFIFA Bot - Connection Test Suite");
  console.log("=".repeat(50));

  const results = {
    geminiChat: await testGeminiChat(),
    geminiEmbedding: await testGeminiEmbedding(),
    pinecone: await testPinecone(),
  };

  console.log("\n" + "=".repeat(50));
  console.log("Results:");
  console.log(DIVIDER);
  console.log(`  Gemini Chat:      ${results.geminiChat ? "PASS" : "FAIL"}`);
  console.log(`  Gemini Embedding: ${results.geminiEmbedding ? "PASS" : "FAIL"}`);
  console.log(`  Pinecone:         ${results.pinecone ? "PASS" : "FAIL"}`);
  console.log(DIVIDER);

  const allPassed = Object.values(results).every(Boolean);
  if (allPassed) {
    console.log("\nAll tests passed. Phase 1 setup is complete.\n");
  } else {
    console.log("\nSome tests failed. Check your .env file and API keys.\n");
    process.exit(1);
  }
}

runAllTests();
