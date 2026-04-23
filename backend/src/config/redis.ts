import { createClient } from 'redis';
import { logger } from '../utils/logger';

/**
 * Redis Configuration for Caching
 * Optional - used for session management and caching
 */
const redisEnabled = process.env.REDIS_ENABLED === 'true';

let redisClient: ReturnType<typeof createClient> | null = null;

if (redisEnabled) {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  // Connect to Redis
  (async () => {
    try {
      await redisClient?.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
    }
  })();
}

export { redisClient, redisEnabled };
