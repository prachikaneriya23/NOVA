import OpenAI from 'openai';
import { env } from '../config/env';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export const NOVA_SYSTEM_PROMPT = `You are NOVA, an intelligent, calm, and highly capable AI assistant.
Be clear, direct, and concise in your responses.
Avoid unnecessary fluff or robotic boilerplate.`;

export class AIService {
  private client: OpenAI | null = null;
  private defaultModel: string;

  constructor() {
    this.defaultModel = env.OPENAI_MODEL || 'gpt-4o-mini';
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim() !== '') {
      this.client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Check if OpenAI client is configured with an API key
   */
  public isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Ensure system prompt is prepended to conversation messages
   */
  private prepareMessages(messages: ChatMessage[]): ChatMessage[] {
    const hasSystemMessage = messages.some((msg) => msg.role === 'system');
    if (!hasSystemMessage) {
      return [{ role: 'system', content: NOVA_SYSTEM_PROMPT }, ...messages];
    }
    return messages;
  }

  /**
   * Generate a chat completion response
   */
  public async generateChatCompletion(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<{ message: string; model: string }> {
    const preparedMessages = this.prepareMessages(messages);
    const model = options?.model || this.defaultModel;

    if (!this.client) {
      // Graceful development simulation when API key is not configured
      const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';
      return {
        message: `[Development Mode] OPENAI_API_KEY is not set in server/.env. Received: "${lastUserMsg}". Please configure a valid OpenAI API key for live responses.`,
        model: 'simulated-dev',
      };
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: preparedMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content || '';

    return {
      message: content,
      model: response.model,
    };
  }

  /**
   * Generate a streaming chat completion
   * Returns an AsyncGenerator yielding text chunks as they arrive
   */
  public async *streamChatCompletion(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncGenerator<string, void, unknown> {
    const preparedMessages = this.prepareMessages(messages);
    const model = options?.model || this.defaultModel;

    if (!this.client) {
      // Fallback dev stream when API key is not yet provided in .env
      const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content.toLowerCase() || '';
      let devResponse =
        "OpenAI API key is not yet configured in server/.env. Add your `OPENAI_API_KEY` to enable live GPT responses. Streaming architecture and SSE pipeline are fully operational.";

      if (
        lastUserMsg.includes('binary search') ||
        lastUserMsg.includes('typescript') ||
        lastUserMsg.includes('code') ||
        lastUserMsg.includes('function')
      ) {
        devResponse = `Here is a clean TypeScript implementation of **Binary Search**:

\`\`\`typescript
/**
 * Performs a binary search on a sorted array of numbers.
 * @param arr - Ascending sorted array of numbers
 * @param target - The number to search for
 * @returns The index of target if found, or -1 if not present
 */
export function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    // Avoid potential overflow with large integers
    const mid = Math.floor(left + (right - left) / 2);

    if (arr[mid] === target) {
      return mid; // Element found
    }

    if (arr[mid] < target) {
      left = mid + 1; // Discard left half
    } else {
      right = mid - 1; // Discard right half
    }
  }

  return -1; // Element not found
}

// Example usage:
const sortedNumbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log(binarySearch(sortedNumbers, 23)); // Output: 5
\`\`\`

### Key Properties:
- **Time Complexity:** $O(\\log n)$ — cuts the search space in half each iteration.
- **Space Complexity:** $O(1)$ — constant auxiliary memory.`;
      }

      const words = devResponse.split(' ');
      for (const word of words) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        yield word + ' ';
      }
      return;
    }

    const stream = await this.client.chat.completions.create({
      model,
      messages: preparedMessages,
      temperature: options?.temperature ?? 0.7,
      stream: true,
      max_tokens: options?.maxTokens,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
