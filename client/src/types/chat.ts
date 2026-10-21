export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date | string;
}

export interface ConversationHistoryItem {
  id: string;
  title: string;
  group: 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older';
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}
