import { useState, useRef, useEffect } from 'react';
import './Composer.css';

export default function Composer({ onSend, onFileUpload, isLoading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const canSend = text.trim().length > 0 && !isLoading;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [text]);

  function handleSend() {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
    // Reset so the same file can be uploaded again
    e.target.value = '';
  }

  return (
    <div className="composer-wrapper" id="composer">
      <div className="composer-container">
        <div className={`composer ${isLoading ? 'composer--loading' : ''}`}>
          <textarea
            ref={textareaRef}
            className="composer__input text-body-md"
            placeholder="Message FIFA BOT..."
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <div className="composer__actions">
            <div className="composer__actions-left">
              <button
                type="button"
                className="composer__btn"
                onClick={handleFileClick}
                title="Attach file"
                aria-label="Attach file"
              >
                <span className="material-symbols-outlined composer__btn-icon">attach_file</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </div>

            <div className="composer__actions-right">
              <button
                type="button"
                className={`composer__send ${canSend ? 'composer__send--active' : ''}`}
                onClick={handleSend}
                disabled={!canSend}
              >
                <span className="material-symbols-outlined composer__send-icon">send</span>
                Send
              </button>
            </div>
          </div>
        </div>

        <p className="composer__disclaimer text-label-sm">
          FIFA BOT can make mistakes. Verify important tournament details.
        </p>
      </div>
    </div>
  );
}
