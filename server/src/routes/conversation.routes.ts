import { Router } from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  addMessage,
  deleteConversation,
} from '../controllers/conversation.controller';

const router = Router();

/**
 * @route GET /api/conversations
 * @desc Get all conversations with their messages
 */
router.get('/', getConversations);

/**
 * @route GET /api/conversations/:id
 * @desc Get a single conversation by ID
 */
router.get('/:id', getConversationById);

/**
 * @route POST /api/conversations
 * @desc Create a new conversation
 */
router.post('/', createConversation);

/**
 * @route PUT /api/conversations/:id
 * @desc Update conversation title or sync messages
 */
router.put('/:id', updateConversation);

/**
 * @route POST /api/conversations/:id/messages
 * @desc Append a message to an existing conversation
 */
router.post('/:id/messages', addMessage);

/**
 * @route DELETE /api/conversations/:id
 * @desc Delete a conversation and its messages
 */
router.delete('/:id', deleteConversation);

export default router;
