import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
// Fallback to .env if .env.test doesn't exist
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { prisma } from '../src/config/database';
import { redis } from '../src/config/redis';

// Mock Sentry to avoid real reporting during tests
jest.mock('../src/config/sentry', () => ({
    initSentry: jest.fn(),
}));

// Mock Logger to reduce noise but keep errors visible
jest.mock('../src/config/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn((msg, meta) => console.error('[TEST ERROR]', msg, meta)),
        warn: jest.fn(),
        debug: jest.fn(),
    },
    morganStream: {
        write: jest.fn(),
    },
    logRequest: jest.fn(),
}));

// Mock Email Service to prevent real emails
jest.mock('../src/shared/utils/email', () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendPasswordChangedEmail: jest.fn().mockResolvedValue(true),
    sendTwoFactorTokenEmail: jest.fn().mockResolvedValue(true),
}));

// Mock Nodemailer to prevent sending real emails, but allow spying
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-email-id' }),
        verify: jest.fn().mockResolvedValue(true),
    }),
}));

// Ensure JWT Secret is set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only_123';
process.env.NODE_ENV = 'test';

// Global setup/teardown
beforeAll(async () => {
    // Connect to database
    await prisma.$connect();

    // Clear Redis cache (important for rate limiting tests)
    if (redis.status === 'ready') {
        await redis.flushall();
    }
});

afterAll(async () => {
    // console.log('Finished Test Suite.');
});

// We do NOT mock Prisma or Redis here. We want REAL integrations.
