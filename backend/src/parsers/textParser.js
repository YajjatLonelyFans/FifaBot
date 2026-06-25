import fs from "fs/promises";

export async function parseText(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return data;
  } catch (error) {
    console.error(`Error parsing TXT ${filePath}:`, error);
    throw new Error(`Failed to parse TXT: ${error.message}`);
  }
}
