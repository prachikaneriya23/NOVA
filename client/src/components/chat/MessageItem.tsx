import React from 'react';
import { Message } from '../../types/chat';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
}) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="w-full flex justify-end py-2">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-base leading-relaxed break-words shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
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
