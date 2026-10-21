import { Router } from 'express';
import { streamChat } from '../controllers/chat.controller';

const router = Router();

/**
 * @route POST /api/chat
 * @desc Stream AI response via Server-Sent Events (SSE)
 */
router.post('/', streamChat);

export default router;
