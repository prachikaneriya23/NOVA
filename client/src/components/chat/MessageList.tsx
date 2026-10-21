import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  isStreaming = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isStreaming]);

  // If loading and the last assistant message is empty, show the loading indicator
  const lastMessage = messages[messages.length - 1];
  const showInitialLoadingDots =
    isLoading && (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.content === '');

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isCurrentlyStreaming = isLast && isStreaming && message.role === 'assistant';

          // Skip rendering an empty assistant placeholder while loading dots are shown
          if (isLast && message.role === 'assistant' && message.content === '' && isLoading) {
            return null;
          }

          return (
            <MessageItem
              key={message.id}
              message={message}
              isStreaming={isCurrentlyStreaming}
            />
          );
        })}

        {showInitialLoadingDots && (
          <div className="w-full flex justify-start py-3">
            <div className="flex items-center space-x-1.5 py-1 text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)]/50 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)]/50 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)]/50 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
};
