import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is missing!"
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});


async function embedText(text) {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  });
  return result.embedding.values;
}


async function embedBatch(texts) {
  const result = await embeddingModel.batchEmbedContents({
    requests: texts.map((text) => ({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    })),
  });
  return result.embeddings.map((e) => e.values);
}

async function describeImage(base64Data, mimeType) {
  const result = await chatModel.generateContent([
    {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    },
    {
      text: "Describe this image in thorough detail for use in a search/retrieval system. Include all visible text, numbers, labels, colors, layouts, and any contextual information about what the image represents. If it contains a chart, table, or infographic, describe the data it presents.",
    },
  ]);
  return result.response.text();
}


async function streamChat(systemPrompt, userMessage) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    tools: [{ googleSearch: {} }],
  });

  const result = await model.generateContentStream(userMessage);
  return result.stream;
}

export { genAI, chatModel, embeddingModel, embedText, embedBatch, describeImage, streamChat };
