import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/health.routes';
import chatRoutes from './routes/chat.routes';
import conversationRoutes from './routes/conversation.routes';

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'NOVA AI Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      conversations: '/api/conversations',
    },
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 NOVA Server is running on http://localhost:${env.PORT}`);
  console.log(`📊 Health check available at http://localhost:${env.PORT}/api/health`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
});

export default app;
export { server };
