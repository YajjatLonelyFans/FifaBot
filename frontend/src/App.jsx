import { useState, useCallback, useRef } from 'react';
import ShaderBackground from './components/ShaderBackground';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import ChatArea from './components/ChatArea';
import Composer from './components/Composer';
import { sendMessage, uploadFiles } from './services/api';
import './App.css';

let nextId = 1;

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);

  const handleSend = useCallback((text) => {
    if (!text || isLoading) return;

    // Add user message
    const userMsg = { id: nextId++, role: 'user', content: text };
    const assistantId = nextId++;
    const assistantMsg = { id: assistantId, role: 'assistant', content: '', isStreaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    const controller = sendMessage(
      text,
      // onChunk
      (chunk) => {
        if (chunk.type === 'text' || chunk.text) {
          const token = chunk.text || chunk.content || '';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + token }
                : m
            )
          );
        }
        if (chunk.type === 'sources' && chunk.sources) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, sources: chunk.sources }
                : m
            )
          );
        }
      },
      // onDone
      () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, isStreaming: false }
              : m
          )
        );
        setIsLoading(false);
        abortRef.current = null;
      },
      // onError
      (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content || `Sorry, something went wrong: ${err.message}`,
                  isStreaming: false,
                }
              : m
          )
        );
        setIsLoading(false);
        abortRef.current = null;
      }
    );

    abortRef.current = controller;
  }, [isLoading]);

  const handleFileUpload = useCallback(async (files) => {
    try {
      const result = await uploadFiles(files);
      // Show upload success as a system-like assistant message
      const filenames = result.results?.map((r) => r.filename).join(', ') || 'files';
      const sysMsg = {
        id: nextId++,
        role: 'assistant',
        content: `✅ Successfully uploaded and processed: **${filenames}**. You can now ask questions about the content.`,
        isStreaming: false,
      };
      setMessages((prev) => [...prev, sysMsg]);
    } catch (err) {
      const errMsg = {
        id: nextId++,
        role: 'assistant',
        content: `❌ Upload failed: ${err.message}`,
        isStreaming: false,
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    handleSend(suggestion);
  }, [handleSend]);

  const hasMessages = messages.length > 0;

  return (
    <div className="app">
      <ShaderBackground />
      <Header />

      <main className="app__main">
        {hasMessages ? (
          <ChatArea messages={messages} />
        ) : (
          <div className="app__empty">
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          </div>
        )}
      </main>

      <Composer
        onSend={handleSend}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
