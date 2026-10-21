import { Message } from '../types/chat';

export interface StreamChatPayload {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

export interface StreamChatCallbacks {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

/**
 * Streams chat completion chunks from the backend /api/chat SSE endpoint
 */
export async function streamChat(
  messages: Message[],
  callbacks: StreamChatCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const payload: StreamChatPayload = {
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  };

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Server returned HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // Fallback to HTTP status text if JSON parse fails
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error('Response body is null, cannot read stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') {
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.content) {
            callbacks.onChunk(parsed.content);
          }
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
            // If it's a real parse error on an invalid data payload
            console.warn('[SSE Parse Warning]', parseError.message);
          }
        }
      }
    }

    callbacks.onDone();
  } catch (error: unknown) {
    if (signal?.aborted) {
      // Stream aborted by user
      callbacks.onDone();
      return;
    }

    const err = error instanceof Error ? error : new Error('An unknown stream error occurred');
    callbacks.onError(err);
  }
}
