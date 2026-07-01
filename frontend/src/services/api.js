const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Send a chat message and stream the response via SSE.
 * @param {string} message - The user's message
 * @param {(chunk: object) => void} onChunk - Called for each SSE event
 * @param {() => void} onDone - Called when the stream ends
 * @param {(error: Error) => void} onError - Called on error
 * @returns {AbortController} - Use to cancel the request
 */
export function sendMessage(message, onChunk, onDone, onError) {
  const controller = new AbortController();

  fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);
            onChunk(data);
          } catch {
            // Non-JSON line, skip
          }
        }
      }

      onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    });

  return controller;
}

/**
 * Upload files to the backend for RAG ingestion.
 * @param {FileList|File[]} files
 * @returns {Promise<object>} - Upload result
 */
export async function uploadFiles(files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Health check
 * @returns {Promise<object>}
 */
export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  return res.json();
}
