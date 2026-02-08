/**
 * Prometheus Metrics Middleware for Backend API
 * Collects and exposes metrics for monitoring
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, Memory, etc.)
client.collectDefaultMetrics({ register });

// Custom Metrics
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register],
});

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});

const activeSessionsGauge = new client.Gauge({
    name: 'active_sessions_total',
    help: 'Number of active user sessions',
    registers: [register],
});

const transactionCounter = new client.Counter({
    name: 'transaction_total',
    help: 'Total number of transactions',
    labelNames: ['type', 'status'],
    registers: [register],
});

const transactionFailures = new client.Counter({
    name: 'transaction_failures_total',
    help: 'Total number of failed transactions',
    labelNames: ['type', 'reason'],
    registers: [register],
});

const authLoginAttempts = new client.Counter({
    name: 'auth_login_attempts_total',
    help: 'Total number of login attempts',
    labelNames: ['status'],
    registers: [register],
});

const authLoginFailures = new client.Counter({
    name: 'auth_login_failures_total',
    help: 'Total number of failed login attempts',
    labelNames: ['reason'],
    registers: [register],
});

const databaseQueryDuration = new client.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
    registers: [register],
});

const cacheHitCounter = new client.Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type'],
    registers: [register],
});

const cacheMissCounter = new client.Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type'],
    registers: [register],
});

// Metrics Middleware
export const metricsMiddleware = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const start = Date.now();

    // Track request
    reply.addHook('onResponse', async (req, res) => {
        const duration = (Date.now() - start) / 1000;
        const route = req.routerPath || req.url;
        const method = req.method;
        const status = res.statusCode.toString();

        // Record metrics
        httpRequestDuration.observe({ method, route, status }, duration);
        httpRequestsTotal.inc({ method, route, status });
    });
};

// Metrics Endpoint
export const metricsEndpoint = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    reply.header('Content-Type', register.contentType);
    return register.metrics();
};

// Helper functions to record custom metrics
export const metrics = {
    // Record transaction
    recordTransaction: (type: string, status: string) => {
        transactionCounter.inc({ type, status });
        if (status === 'FAILED') {
            transactionFailures.inc({ type, reason: 'unknown' });
        }
    },

    // Record transaction failure
    recordTransactionFailure: (type: string, reason: string) => {
        transactionFailures.inc({ type, reason });
    },

    // Record login attempt
    recordLoginAttempt: (status: 'success' | 'failure') => {
        authLoginAttempts.inc({ status });
        if (status === 'failure') {
            authLoginFailures.inc({ reason: 'invalid_credentials' });
        }
    },

    // Record login failure
    recordLoginFailure: (reason: string) => {
        authLoginFailures.inc({ reason });
    },

    // Update active sessions
    setActiveSessions: (count: number) => {
        activeSessionsGauge.set(count);
    },

    // Record database query
    recordDatabaseQuery: (operation: string, table: string, duration: number) => {
        databaseQueryDuration.observe({ operation, table }, duration);
    },

    // Record cache hit
    recordCacheHit: (cacheType: string = 'redis') => {
        cacheHitCounter.inc({ cache_type: cacheType });
    },

    // Record cache miss
    recordCacheMiss: (cacheType: string = 'redis') => {
        cacheMissCounter.inc({ cache_type: cacheType });
    },
};

// Register metrics route
export const registerMetricsRoute = (fastify: FastifyInstance) => {
    fastify.get('/metrics', metricsEndpoint);
};

export default {
    metricsMiddleware,
    metricsEndpoint,
    registerMetricsRoute,
    metrics,
    register,
};
