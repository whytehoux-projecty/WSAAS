import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // Don't crash the app if Redis is down, just log errors
    // We set it to true to buffer commands if Redis is temporarily down/connecting
    enableOfflineQueue: true,
});

redis.on('connect', () => {
    logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

export const CACHE_TTL = {
    SHORT: 60 * 5, // 5 minutes
    MEDIUM: 60 * 30, // 30 minutes
    LONG: 60 * 60 * 24, // 1 day
};
