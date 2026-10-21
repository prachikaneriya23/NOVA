import { Request, Response } from 'express';
import { aiService, ChatMessage } from '../services/ai.service';

/**
 * Validates chat messages payload
 */
function validateMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false;
  }

  return messages.every(
    (msg) =>
      typeof msg === 'object' &&
      msg !== null &&
      ['system', 'user', 'assistant'].includes(msg.role) &&
      typeof msg.content === 'string' &&
      msg.content.trim().length > 0
  );
}

/**
 * Controller for streaming chat completions via Server-Sent Events (SSE)
 * POST /api/chat
 */
export async function streamChat(req: Request, res: Response): Promise<void> {
  const { messages, options } = req.body;

  // Validate input
  if (!validateMessages(messages)) {
    res.status(400).json({
      error: 'Invalid request body. "messages" must be a non-empty array of valid message objects.',
    });
    return;
  }

  // Configure SSE Response Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Flush headers immediately
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  let isAborted = false;

  // Listen to response close to detect premature client disconnection / abort
  res.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
  });

  try {
    const stream = aiService.streamChatCompletion(messages, options);

    for await (const chunk of stream) {
      if (isAborted || res.writableEnded) {
        break;
      }
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    if (!isAborted && !res.writableEnded) {
      res.write('data: [DONE]\n\n');
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while streaming response';
    console.error('[ChatController Error]:', errorMessage);

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
}
