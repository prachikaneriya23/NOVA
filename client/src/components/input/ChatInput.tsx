import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStop,
  isLoading = false,
  isStreaming = false,
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scrollHeight properly
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 200);
    textarea.style.height = `${newHeight}px`;
  }, [content]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || isLoading || isStreaming) return;

    onSendMessage(trimmed);
    setContent('');

    // Reset textarea height to default single row
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isBusy = isLoading || isStreaming;
  const isSendDisabled = !content.trim() || isBusy;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-4 sm:pb-6 flex-shrink-0">
      <div className="relative flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] transition-all focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)]/20 shadow-sm">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message NOVA..."
          rows={1}
          disabled={isBusy}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-10 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none leading-relaxed disabled:opacity-75"
          style={{ minHeight: '44px', maxHeight: '200px' }}
        />

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {isStreaming && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="p-1.5 rounded-lg text-white bg-[var(--text-primary)] hover:opacity-80 transition-all flex items-center justify-center shadow-sm"
              title="Stop generating"
              aria-label="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSendDisabled}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                isSendDisabled
                  ? 'text-[var(--text-secondary)]/40 bg-transparent cursor-not-allowed'
                  : 'text-white bg-[var(--accent-color)] hover:opacity-90 shadow-sm'
              }`}
              title="Send message"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-[11px] text-[var(--text-secondary)]">
          NOVA can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};
