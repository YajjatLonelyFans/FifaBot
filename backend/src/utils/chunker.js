
export function chunkText(text, sourceName, chunkSize = 2000, overlap = 200) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanText = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  
  let i = 0;
  while (i < cleanText.length) {
    
    let end = i + chunkSize;
    
    if (end < cleanText.length) {
      const breakPointChars = ['. ', '? ', '! '];
      let bestBreak = -1;
      
      const lookbackLimit = Math.max(i + chunkSize - 200, i);
      
      for (const char of breakPointChars) {
        const idx = cleanText.lastIndexOf(char, end);
        if (idx > lookbackLimit && idx > bestBreak) {
          bestBreak = idx + 1; // Include the punctuation
        }
      }
      
      if (bestBreak !== -1) {
        end = bestBreak;
      }
    } else {
      end = cleanText.length;
    }

    const chunkContent = cleanText.slice(i, end).trim();
    if (chunkContent.length > 0) {
      chunks.push(chunkContent);
    }
    
    i = end - overlap;
    
  
    if (i <= i - (end - i)) {
      i = end; 
    }
  }


  return chunks.map((chunk, index) => ({
    text: chunk,
    metadata: {
      source: sourceName,
      chunkIndex: index,
      totalChunks: chunks.length
    }
  }));
}
