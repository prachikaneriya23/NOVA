import { Conversation } from '../types/chat';

const API_BASE = '/api/conversations';
const STORAGE_KEY = 'nova_conversations';
const ACTIVE_CONVERSATION_KEY = 'nova_active_chat_id';

/**
 * Read from localStorage (used for instant hydration & offline fallback)
 */
export const getLocalConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

/**
 * Save to localStorage cache
 */
const saveToLocal = (conversation: Conversation): void => {
  try {
    const conversations = getLocalConversations();
    const index = conversations.findIndex((c) => c.id === conversation.id);
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('[StorageService] Error saving to localStorage:', err);
  }
};

/**
 * Delete from localStorage cache
 */
const deleteFromLocal = (id: string): void => {
  try {
    const conversations = getLocalConversations();
    const filtered = conversations.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[StorageService] Error deleting from localStorage:', err);
  }
};

/**
 * Fetch all conversations from Express Prisma backend API
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      // Sync local cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return getLocalConversations();
  } catch (error) {
    console.warn('[StorageService] Backend API unavailable, using local cache:', error);
    return getLocalConversations();
  }
};

/**
 * Save/update conversation in Express Prisma backend API and sync local cache
 */
export const saveConversation = async (conversation: Conversation): Promise<void> => {
  // Update local cache immediately
  saveToLocal(conversation);

  try {
    await fetch(`${API_BASE}/${conversation.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
      }),
    });
  } catch (error) {
    console.error('[StorageService] Error saving to backend API:', error);
  }
};

/**
 * Delete conversation from Express Prisma backend API and local cache
 */
export const deleteConversation = async (id: string): Promise<void> => {
  deleteFromLocal(id);

  try {
    await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('[StorageService] Error deleting from backend API:', error);
  }
};

/**
 * Auto-generates a concise title from the initial user message.
 * Truncates to ~35 characters without breaking words cleanly.
 */
export const generateTitle = (firstMessageContent: string): string => {
  if (!firstMessageContent) return 'New Chat';

  const clean = firstMessageContent.replace(/\s+/g, ' ').trim();
  if (clean.length <= 35) {
    return clean;
  }

  const slice = clean.slice(0, 35);
  const lastSpace = slice.lastIndexOf(' ');

  if (lastSpace > 15) {
    return slice.slice(0, lastSpace).trim() + '...';
  }

  return slice.trim() + '...';
};

/**
 * Retrieves the currently active conversation ID from localStorage.
 */
export const getActiveConversationId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  } catch {
    return null;
  }
};

/**
 * Persists or clears the active conversation ID in localStorage.
 */
export const setActiveConversationId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error('[StorageService] Error setting active conversation ID:', error);
  }
};

export const storageService = {
  getConversations,
  getLocalConversations,
  saveConversation,
  deleteConversation,
  generateTitle,
  getActiveConversationId,
  setActiveConversationId,
};
