import mammoth from "mammoth";


export async function parseDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`Error parsing DOCX ${filePath}:`, error);
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}
