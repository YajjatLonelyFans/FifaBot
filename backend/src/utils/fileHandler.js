import { parsePdf } from "../parsers/pdfParser.js";
import { parseDocx } from "../parsers/docxParser.js";
import { parseText } from "../parsers/textParser.js";
import { parseImage } from "../parsers/imageParser.js";

export async function processFile(file) {
  const { path: filePath, mimetype } = file;

  let content;
  let type = 'text';

  switch (mimetype) {
    case "application/pdf":
      content = await parsePdf(filePath);
      break;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      content = await parseDocx(filePath);
      break;
    case "text/plain":
      content = await parseText(filePath);
      break;
    case "image/jpeg":
    case "image/png":
      content = await parseImage(filePath, mimetype);
      type = 'image';
      break;
    default:
      throw new Error(`Unsupported MIME type: ${mimetype}`);
  }

  return { type, content };
}
