import { useMemo } from 'react';
import './MessageBubble.css';


function formatMarkdown(text) {
  if (!text) return '';
  let html = text

    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
  return html;
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  const formattedContent = useMemo(() => {
    if (isUser) return null;
    return formatMarkdown(message.content);
  }, [message.content, isUser]);

  return (
    <div
      className={`message ${isUser ? 'message--user' : 'message--assistant'} animate-fade-up`}
      id={`msg-${message.id}`}
    >
      {/* Role Label */}
      <div className="message__role text-role-label">
        {isUser ? 'USER' : 'FIFA BOT'}
      </div>

      {/* Content */}
      <div className={`message__content text-body-md ${isUser ? 'message__content--user' : ''}`}>
        {isUser ? (
          message.content
        ) : (
          <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )}
        {message.isStreaming && (
          <span className="message__cursor" aria-label="Typing">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        )}
      </div>

      {/* Sources (assistant only) */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="message__sources">
          {message.sources.map((src, i) => (
            <div key={i} className="source-chip">
              <span className="material-symbols-outlined source-chip__icon">description</span>
              [{i + 1}] {src}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
