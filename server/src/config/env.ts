import dotenv from 'dotenv';
import path from 'path';

// Load .env file from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CLIENT_URL: string;
  OPENAI_API_KEY: string | undefined;
  OPENAI_MODEL: string;
  DATABASE_URL: string;
}

function validateEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    console.warn(`[Config] Invalid PORT specified (${process.env.PORT}). Defaulting to 5000.`);
  }

  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const openaiApiKey = process.env.OPENAI_API_KEY || undefined;
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

  if (!openaiApiKey && nodeEnv !== 'test') {
    console.warn('[Config] Notice: OPENAI_API_KEY is not set in environment. AI features will require a valid API key.');
  }

  return {
    PORT: isNaN(port) ? 5000 : port,
    NODE_ENV: nodeEnv,
    CLIENT_URL: clientUrl,
    OPENAI_API_KEY: openaiApiKey,
    OPENAI_MODEL: openaiModel,
    DATABASE_URL: databaseUrl,
  };
}

export const env = validateEnv();
