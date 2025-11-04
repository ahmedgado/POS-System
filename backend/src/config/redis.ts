import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
});
