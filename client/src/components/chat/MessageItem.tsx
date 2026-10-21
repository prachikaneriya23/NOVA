import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Message } from '../../types/chat';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  onEditMessage,
}) => {
  const isUser = message.role === 'user';
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync content if message changes externally
  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 260)}px`;
    }
  };

  useEffect(() => {
    if (isEditing) {
      adjustHeight();
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSave = () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    setIsEditing(false);
    onEditMessage?.(message.id, trimmed);
  };

  if (isUser) {
    if (isEditing) {
      return (
        <div className="w-full flex justify-end py-2">
          <div className="w-full max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-2.5">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                adjustHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancel();
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Edit your prompt..."
              rows={1}
              className="w-full bg-transparent resize-none outline-none text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-sans leading-relaxed min-h-[44px]"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]/50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!editContent.trim()}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-[var(--accent-color)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Save &amp; Submit
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex justify-end py-2 group">
        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end gap-1">
          <div className="rounded-2xl px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-base leading-relaxed break-words shadow-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          {onEditMessage && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
              <button
                type="button"
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(true);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                title="Edit prompt"
                aria-label="Edit prompt"
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start py-3">
      <div className="max-w-[100%] sm:max-w-[90%] text-[var(--text-primary)] text-sm sm:text-base leading-relaxed break-words">
        <div className="font-sans whitespace-pre-wrap text-[var(--text-primary)] inline">
          {message.content}
        </div>
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-[var(--accent-color)] animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};
