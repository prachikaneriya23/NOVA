import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * GET /api/conversations
 * Fetch all conversations sorted by most recently updated
 */
export const getConversations = async (_req: Request, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const formatted = conversations.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt.getTime(),
      updatedAt: c.updatedAt.getTime(),
      messages: c.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.createdAt,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[ConversationController] getConversations error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
};

/**
 * GET /api/conversations/:id
 * Retrieve a single conversation with all its messages
 */
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt.getTime(),
      updatedAt: conversation.updatedAt.getTime(),
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('[ConversationController] getConversationById error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
};

/**
 * POST /api/conversations
 * Create a new conversation and optional initial messages
 */
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { id, title, messages } = req.body;

    const newConversation = await prisma.conversation.create({
      data: {
        ...(id ? { id } : {}),
        title: title || 'New Chat',
        messages: messages && Array.isArray(messages) && messages.length > 0
          ? {
              create: messages.map((m: { id?: string; role: string; content: string }) => ({
                ...(m.id ? { id: m.id } : {}),
                role: m.role,
                content: m.content,
              })),
            }
          : undefined,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.status(201).json({
      id: newConversation.id,
      title: newConversation.title,
      createdAt: newConversation.createdAt.getTime(),
      updatedAt: newConversation.updatedAt.getTime(),
      messages: newConversation.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('[ConversationController] createConversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

/**
 * PUT /api/conversations/:id
 * Update conversation title and/or sync messages
 */
export const updateConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, messages } = req.body;

    // Check if conversation exists
    const existing = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!existing) {
      // If it doesn't exist, create it (upsert behavior)
      const created = await prisma.conversation.create({
        data: {
          id,
          title: title || 'New Chat',
          messages: messages && Array.isArray(messages)
            ? {
                create: messages.map((m: { id?: string; role: string; content: string }) => ({
                  ...(m.id ? { id: m.id } : {}),
                  role: m.role,
                  content: m.content,
                })),
              }
            : undefined,
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      return res.json({
        id: created.id,
        title: created.title,
        createdAt: created.createdAt.getTime(),
        updatedAt: created.updatedAt.getTime(),
        messages: created.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
          timestamp: m.createdAt,
        })),
      });
    }

    // If messages provided, sync by replacing or updating
    if (messages && Array.isArray(messages)) {
      // Run transaction to replace messages cleanly
      const updated = await prisma.$transaction(async (tx) => {
        await tx.message.deleteMany({
          where: { conversationId: id },
        });

        if (messages.length > 0) {
          await tx.message.createMany({
            data: messages.map((m: { id?: string; role: string; content: string }) => ({
              ...(m.id ? { id: m.id } : {}),
              conversationId: id,
              role: m.role,
              content: m.content,
            })),
          });
        }

        return tx.conversation.update({
          where: { id },
          data: {
            ...(title ? { title } : {}),
            updatedAt: new Date(),
          },
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
          },
        });
      });

      return res.json({
        id: updated.id,
        title: updated.title,
        createdAt: updated.createdAt.getTime(),
        updatedAt: updated.updatedAt.getTime(),
        messages: updated.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
          timestamp: m.createdAt,
        })),
      });
    }

    // Only updating title
    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        updatedAt: new Date(),
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    res.json({
      id: updated.id,
      title: updated.title,
      createdAt: updated.createdAt.getTime(),
      updatedAt: updated.updatedAt.getTime(),
      messages: updated.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('[ConversationController] updateConversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
};

/**
 * POST /api/conversations/:id/messages
 * Append a single message to a conversation
 */
export const addMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { id: messageId, role, content } = req.body;

    if (!role || content === undefined) {
      return res.status(400).json({ error: 'role and content are required' });
    }

    const message = await prisma.message.create({
      data: {
        ...(messageId ? { id: messageId } : {}),
        conversationId: id,
        role,
        content,
      },
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      id: message.id,
      role: message.role as 'user' | 'assistant' | 'system',
      content: message.content,
      timestamp: message.createdAt,
    });
  } catch (error) {
    console.error('[ConversationController] addMessage error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

/**
 * DELETE /api/conversations/:id
 * Remove a conversation and cascade-delete its messages
 */
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.conversation.delete({
      where: { id },
    });

    res.json({ success: true, id });
  } catch (error) {
    console.error('[ConversationController] deleteConversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
