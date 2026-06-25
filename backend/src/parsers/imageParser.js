import fs from "fs/promises";

export async function parseImage(filePath, mimeType) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const base64Data = dataBuffer.toString("base64");
    
    return {
      base64Data,
      mimeType
    };
  } catch (error) {
    console.error(`Error processing image ${filePath}:`, error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}
