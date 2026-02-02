import { Request, Response, NextFunction } from 'express';
import { redis, CACHE_TTL } from '../../config/redis';
import { logger } from '../../config/logger';

export { CACHE_TTL };


// Helper to generating a unique key for the request
const generateKey = (req: Request) => {
    // Key format: method:url:query
    // We might want to include user ID for user-specific data
    const userId = (req as any).user?.id || 'public';
    return `cache:${userId}:${req.method}:${req.originalUrl}`;
};

export const cacheMiddleware = (duration: number = CACHE_TTL.SHORT) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Skip caching if Redis is not available
        if (!redis) {
            return next();
        }

        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = generateKey(req);

        try {
            const cachedResponse = await redis.get(key);

            if (cachedResponse) {
                logger.debug('Cache hit', { key });
                return res.json(JSON.parse(cachedResponse));
            }

            logger.debug('Cache miss', { key });

            // Intercept res.json to cache the response
            const originalJson = res.json;

            res.json = (body: any): Response => {
                // Restore original method
                res.json = originalJson;

                // Cache the response asynchronously (don't block the response)
                // We only cache successful responses
                if (redis && res.statusCode >= 200 && res.statusCode < 300) {
                    redis.set(key, JSON.stringify(body), 'EX', duration)
                        .catch(err => logger.error('Redis cache set error', err));
                }

                return originalJson.call(res, body);
            };

            next();
        } catch (error) {
            // If Redis fails, just proceed without caching
            logger.error('Redis middleware error', error);
            next();
        }
    };
};

export const clearCache = async (pattern: string) => {
    if (!redis) {
        logger.warn('Redis not available, cannot clear cache');
        return;
    }

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            logger.info('Cache cleared', { pattern, count: keys.length });
        }
    } catch (error) {
        logger.error('Clear cache error', error);
    }
};
