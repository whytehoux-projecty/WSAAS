import rateLimit from 'express-rate-limit';

// General rate limit for most routes to prevent abuse
// 100 requests per 15 minutes per IP
// General rate limit for most routes to prevent abuse
// 100 requests per 15 minutes per IP
// In test env, allow more
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 10000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again after 15 minutes'
        }
    }
});

// Stricter rate limit for login/auth routes to prevent brute force
// 5 attempts per 15 minutes
// In test env, allow more
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 10000 : 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts, please try again after 15 minutes'
        }
    }
});
