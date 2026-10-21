import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @route GET /api/health
 * @desc Returns service health status and timestamp
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
