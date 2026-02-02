import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import * as Sentry from '@sentry/node';

// Configuration
import { swaggerSpec } from './config/swagger';
import { morganStream } from './config/logger';
import { initSentry } from './config/sentry';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import staffRoutes from './modules/staff/staff.routes';
import financeRoutes from './modules/finance/finance.routes';
import applicationRoutes from './modules/applications/application.routes';
import adminRoutes from './modules/admin/admin.routes';
import cmsRoutes from './modules/cms/cms.routes';
import webhookRoutes from './modules/webhook/webhook.routes';

// Middleware
import { errorHandler } from './shared/middleware/errorHandler.middleware';
import { generalLimiter, authLimiter } from './shared/middleware/rateLimit.middleware';
import { loggingMiddleware, errorLoggingMiddleware } from './shared/middleware/logging.middleware';
import { metricsMiddleware } from './shared/middleware/metrics.middleware';
import { csrfProtection, getCsrfToken } from './shared/middleware/csrf.middleware';
import { redis } from './config/redis';

// Initialize Sentry
initSentry();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token'],
    credentials: true // Allow cookies for CSRF tokens
}));

// Performance Metrics
app.use(metricsMiddleware);

// Structured Logging
app.use(morgan('combined', { stream: morganStream }));
app.use(loggingMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply general rate limiter
app.use(generalLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static files (Legacy/Fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CSRF Token endpoint (must be before CSRF protection)
app.get('/api/v1/csrf-token', getCsrfToken);

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Health Check
app.get('/health', async (req: Request, res: Response) => {
    const health = {
        status: 'UP',
        timestamp: new Date(),
        redis: 'UNKNOWN',
        services: {
            database: 'UP', // Prisma usually handles its own connection pool
            redis: 'DOWN'
        }
    };

    try {
        if (redis) {
            await redis.ping();
            health.redis = 'UP';
            health.services.redis = 'UP';
        } else {
            health.redis = 'NOT_CONFIGURED';
            health.services.redis = 'NOT_CONFIGURED';
        }
    } catch (e) {
        health.redis = 'DOWN';
    }

    res.status(200).json(health);
});

// Sentry Error Handler (must be before other error handlers)
Sentry.setupExpressErrorHandler(app);

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
});

// App Error Logging
app.use(errorLoggingMiddleware);

// Global Error Handler
app.use(errorHandler);

export default app;
