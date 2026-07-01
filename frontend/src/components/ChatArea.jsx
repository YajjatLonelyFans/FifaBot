import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ChatArea.css';

export default function ChatArea({ messages }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages or content updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-area" id="chat-area">
      <div className="chat-area__inner">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
