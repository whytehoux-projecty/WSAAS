import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { redis } from '../../config/redis';
import { AppError } from './errorHandler.middleware';

/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 3600; // 1 hour in seconds

/**
 * Generate a random CSRF token
 */
function generateCsrfToken(): string {
    return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware to generate and attach CSRF token to response
 * This should be applied to routes that render forms or return data for forms
 */
export const csrfTokenGenerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip CSRF if Redis is not available
        if (!redis) {
            return next();
        }

        // Generate new token
        const token = generateCsrfToken();

        // Store token in Redis with user session or IP as key
        const userId = (req as any).user?.id || req.ip;
        const redisKey = `csrf:${userId}:${token}`;

        await redis.setex(redisKey, CSRF_TOKEN_EXPIRY, '1');

        // Set token in cookie (httpOnly, secure in production)
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false, // Must be readable by JavaScript for SPA
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: CSRF_TOKEN_EXPIRY * 1000
        });

        // Also attach to response for API clients
        res.locals.csrfToken = token;

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to verify CSRF token on state-changing requests
 * Apply this to POST, PUT, DELETE, PATCH routes
 */
export const csrfProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip CSRF if Redis is not available
        if (!redis) {
            return next();
        }

        // Skip CSRF check for safe methods
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }

        // Get token from header or body
        const token = req.headers['x-csrf-token'] ||
            req.headers['x-xsrf-token'] ||
            req.body?._csrf;

        if (!token || typeof token !== 'string') {
            throw new AppError('CSRF token missing', 403);
        }

        // Verify token exists in Redis
        const userId = (req as any).user?.id || req.ip;
        const redisKey = `csrf:${userId}:${token}`;

        const exists = await redis.exists(redisKey);

        if (!exists) {
            throw new AppError('Invalid or expired CSRF token', 403);
        }

        // Token is valid, allow request to proceed
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('CSRF token validation failed', 403));
        }
    }
};

/**
 * Middleware to clean up expired CSRF tokens
 * Run this periodically or on user logout
 */
export const cleanupCsrfTokens = async (userId: string) => {
    if (!redis) {
        return;
    }

    try {
        const pattern = `csrf:${userId}:*`;
        const keys = await redis.keys(pattern);

        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error('Error cleaning up CSRF tokens:', error);
    }
};

/**
 * Express route to get CSRF token
 * GET /api/v1/csrf-token
 */
export const getCsrfToken = async (req: Request, res: Response) => {
    if (!redis) {
        return res.status(503).json({
            success: false,
            error: 'CSRF protection not available'
        });
    }

    const token = generateCsrfToken();
    const userId = (req as any).user?.id || req.ip;
    const redisKey = `csrf:${userId}:${token}`;

    await redis.setex(redisKey, CSRF_TOKEN_EXPIRY, '1');

    res.cookie('XSRF-TOKEN', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CSRF_TOKEN_EXPIRY * 1000
    });

    res.json({
        success: true,
        csrfToken: token
    });
};
