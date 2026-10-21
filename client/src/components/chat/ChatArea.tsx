import React from 'react';
import { Message } from '../../types/chat';
import { EmptyState } from './EmptyState';
import { MessageList } from './MessageList';

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading = false,
  isStreaming = false,
  onEditMessage,
}) => {
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <MessageList
      messages={messages}
      isLoading={isLoading}
      isStreaming={isStreaming}
      onEditMessage={onEditMessage}
    />
  );
};
