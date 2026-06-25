import fs from "fs";
import pdfParse from "pdf-parse";

export async function parsePdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}
