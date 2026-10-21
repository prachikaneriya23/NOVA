import { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ChatArea } from './components/chat/ChatArea';
import { ChatInput } from './components/input/ChatInput';
import { Message, Conversation } from './types/chat';
import { streamChat } from './services/chat.service';
import {
  getConversations,
  getLocalConversations,
  saveConversation,
  deleteConversation,
  generateTitle,
  getActiveConversationId,
  setActiveConversationId,
} from './services/storage.service';

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

function ChatApplication() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getLocalConversations()
  );

  const [activeConversationId, setActiveConversationIdState] = useState<
    string | null
  >(() => {
    const savedActiveId = getActiveConversationId();
    const stored = getLocalConversations();
    if (savedActiveId && stored.some((c) => c.id === savedActiveId)) {
      return savedActiveId;
    }
    return null;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const savedActiveId = getActiveConversationId();
    const stored = getLocalConversations();
    if (savedActiveId) {
      const active = stored.find((c) => c.id === savedActiveId);
      if (active) return active.messages;
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  const activeConversationIdRef = useRef<string | null>(activeConversationId);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Load conversations from backend REST API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        const remote = await getConversations();
        if (!isMounted) return;
        if (remote && Array.isArray(remote)) {
          setConversations(remote);
          const savedActiveId = getActiveConversationId();
          if (savedActiveId) {
            const active = remote.find((c) => c.id === savedActiveId);
            if (active) {
              setMessages(active.messages);
            }
          }
        }
      } catch (err) {
        console.error('[ChatApplication] Failed to fetch remote conversations:', err);
      }
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, []);

  const syncConversationState = (
    convId: string,
    updatedMessages: Message[]
  ) => {
    setConversations((prev) => {
      const target = prev.find((c) => c.id === convId);
      if (!target) return prev;

      const updatedConv: Conversation = {
        ...target,
        updatedAt: Date.now(),
        messages: updatedMessages,
      };

      // Persist to backend & local cache
      saveConversation(updatedConv);

      return prev.map((c) => (c.id === convId ? updatedConv : c));
    });
  };

  const handleSendMessage = async (content: string) => {
    setErrorBanner(null);

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantPlaceholderId = generateMessageId();
    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    const historyToSend = [...messages, userMessage];
    let currentStreamedMessages = [...historyToSend, assistantPlaceholder];

    let targetConvId: string;
    const currentActiveId = activeConversationIdRef.current;

    if (!currentActiveId) {
      const newId = generateId();
      targetConvId = newId;
      const title = generateTitle(content);

      const newConv: Conversation = {
        id: newId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: currentStreamedMessages,
      };

      setActiveConversationIdState(newId);
      setActiveConversationId(newId);
      setConversations((prev) => [newConv, ...prev]);
      saveConversation(newConv);
    } else {
      targetConvId = currentActiveId;
      syncConversationState(targetConvId, currentStreamedMessages);
    }

    setMessages(currentStreamedMessages);
    setIsLoading(true);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let lastSaveTime = Date.now();

    await streamChat(
      historyToSend,
      {
        onChunk: (chunk: string) => {
          setIsLoading(false);
          currentStreamedMessages = currentStreamedMessages.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: msg.content + chunk }
              : msg
          );

          setMessages(currentStreamedMessages);

          const now = Date.now();
          if (now - lastSaveTime > 300) {
            lastSaveTime = now;
            syncConversationState(targetConvId, currentStreamedMessages);
          }
        },
        onDone: () => {
          setIsLoading(false);
          setIsStreaming(false);
          abortControllerRef.current = null;
          syncConversationState(targetConvId, currentStreamedMessages);
        },
        onError: (err: Error) => {
          setIsLoading(false);
          setIsStreaming(false);
          abortControllerRef.current = null;
          console.error('[Stream Error]', err);

          const placeholderMsg = currentStreamedMessages.find(
            (m) => m.id === assistantPlaceholderId
          );
          const hasExistingText =
            placeholderMsg && placeholderMsg.content.trim().length > 0;

          currentStreamedMessages = currentStreamedMessages.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  content: hasExistingText
                    ? msg.content + `\n\n[Stream interrupted: ${err.message}]`
                    : `Unable to receive response: ${err.message}`,
                }
              : msg
          );

          setMessages(currentStreamedMessages);
          syncConversationState(targetConvId, currentStreamedMessages);
        },
      },
      abortController.signal
    );
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsStreaming(false);

    const currentActiveId = activeConversationIdRef.current;
    if (currentActiveId) {
      syncConversationState(currentActiveId, messagesRef.current);
    }
  };

  const handleNewChat = () => {
    handleStop();
    setActiveConversationIdState(null);
    setActiveConversationId(null);
    setMessages([]);
    setErrorBanner(null);
  };

  const handleSelectConversation = (id: string) => {
    if (activeConversationId === id) return;

    handleStop();
    const target =
      conversations.find((c) => c.id === id) ||
      getLocalConversations().find((c) => c.id === id);

    if (target) {
      setActiveConversationIdState(id);
      setActiveConversationId(id);
      setMessages(target.messages);
      setErrorBanner(null);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));

    if (activeConversationId === id) {
      handleStop();
      setActiveConversationIdState(null);
      setActiveConversationId(null);
      setMessages([]);
      setErrorBanner(null);
    }
  };

  return (
    <AppLayout
      conversations={conversations}
      activeId={activeConversationId}
      onSelectConversation={handleSelectConversation}
      onDeleteConversation={handleDeleteConversation}
      onNewChat={handleNewChat}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {errorBanner && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs px-4 py-2 text-center">
            {errorBanner}
          </div>
        )}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          onStop={handleStop}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
      </div>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ChatApplication />
    </ThemeProvider>
  );
}
