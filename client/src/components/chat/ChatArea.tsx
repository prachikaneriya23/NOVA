import React from 'react';
import { Message } from '../../types/chat';
import { EmptyState } from './EmptyState';
import { MessageList } from './MessageList';

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading = false,
  isStreaming = false,
}) => {
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <MessageList
      messages={messages}
      isLoading={isLoading}
      isStreaming={isStreaming}
    />
  );
};
