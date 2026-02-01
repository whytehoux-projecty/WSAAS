/**
 * UHI Staff Portal - Real Environment Test Configuration
 * 
 * This configuration ensures ALL tests run against real services:
 * - Real PostgreSQL database
 * - Real Redis cache
 * - Real backend API
 * - Real frontend applications
 * - Real authentication flows
 * 
 * NO MOCKING ALLOWED
 */

export const TEST_CONFIG = {
    // Environment
    environment: 'test',

    // Real Database Configuration
    database: {
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
        database: process.env.TEST_DB_NAME || 'uhi_staff_portal_test',
        user: process.env.TEST_DB_USER || 'uhi_test_user',
        password: process.env.TEST_DB_PASSWORD || 'test_password',
        ssl: false,
        connectionString: process.env.TEST_DATABASE_URL ||
            'postgresql://uhi_test_user:test_password@localhost:5432/uhi_staff_portal_test',
    },

    // Real Redis Configuration
    redis: {
        host: process.env.TEST_REDIS_HOST || 'localhost',
        port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
        password: process.env.TEST_REDIS_PASSWORD || '',
        db: parseInt(process.env.TEST_REDIS_DB || '1'), // Use separate DB for tests
        url: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1',
    },

    // Real Backend API
    api: {
        baseUrl: process.env.TEST_API_URL || 'http://localhost:3000',
        timeout: 30000, // 30 seconds for real operations
        retries: 3,
    },

    // Real Frontend Applications
    frontend: {
        staffPortalUrl: process.env.TEST_STAFF_PORTAL_URL || 'http://localhost:3001',
        adminInterfaceUrl: process.env.TEST_ADMIN_INTERFACE_URL || 'http://localhost:3002',
    },

    // Real Authentication
    auth: {
        useRealAuth: true,
        skipMocks: true,
        testUsers: {
            admin: {
                email: 'admin.test@uhi.org',
                password: 'TestAdmin123!',
                role: 'ADMIN',
            },
            staff: {
                email: 'staff.test@uhi.org',
                password: 'TestStaff123!',
                role: 'STAFF',
            },
            manager: {
                email: 'manager.test@uhi.org',
                password: 'TestManager123!',
                role: 'MANAGER',
            },
        },
    },

    // Real File Storage
    storage: {
        uploadDir: './test-uploads',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    },

    // Real Email Service (use test SMTP)
    email: {
        host: process.env.TEST_SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.TEST_SMTP_PORT || '2525'),
        user: process.env.TEST_SMTP_USER || '',
        password: process.env.TEST_SMTP_PASSWORD || '',
        from: 'test@uhi.org',
    },

    // Performance Testing
    performance: {
        minConcurrentUsers: 50,
        maxConcurrentUsers: 500,
        rampUpTime: 60, // seconds
        testDuration: 300, // seconds
        acceptableResponseTime: 500, // ms
        maxErrorRate: 0.01, // 1%
    },

    // Load Testing
    load: {
        scenarios: {
            smoke: { vus: 1, duration: '1m' },
            load: { vus: 100, duration: '5m' },
            stress: { vus: 200, duration: '10m' },
            spike: {
                stages: [
                    { duration: '1m', target: 10 },
                    { duration: '1m', target: 100 },
                    { duration: '1m', target: 10 },
                ]
            },
        },
    },

    // Security Testing
    security: {
        enablePenetrationTests: true,
        testSqlInjection: true,
        testXss: true,
        testCsrf: true,
        testRateLimiting: true,
    },

    // Test Data Configuration
    testData: {
        useRealData: true,
        skipMocks: true,
        minRecordsPerTable: 1000,
        seedFromProduction: false, // Set to true to use anonymized production data
        cleanupAfterTests: true,
    },

    // Browser Testing (Playwright/Cypress)
    browser: {
        headless: process.env.CI === 'true',
        browsers: ['chromium', 'firefox', 'webkit'],
        viewport: { width: 1920, height: 1080 },
        slowMo: 0, // No artificial delays
        timeout: 30000,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },

    // Network Conditions
    network: {
        conditions: {
            fast3g: { downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 40 },
            slow3g: { downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 400 },
            offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 },
        },
    },

    // Logging
    logging: {
        level: process.env.TEST_LOG_LEVEL || 'info',
        captureNetworkLogs: true,
        captureConsoleLogs: true,
        saveFailureLogs: true,
    },
};

// Validation
export function validateTestConfig(): void {
    const required = [
        'database.connectionString',
        'redis.url',
        'api.baseUrl',
    ];

    const missing: string[] = [];

    required.forEach(path => {
        const value = path.split('.').reduce((obj: any, key) => obj?.[key], TEST_CONFIG);
        if (!value) {
            missing.push(path);
        }
    });

    if (missing.length > 0) {
        throw new Error(`Missing required test configuration: ${missing.join(', ')}`);
    }

    console.log('✅ Test configuration validated');
    console.log('📊 Test Environment:');
    console.log(`   Database: ${TEST_CONFIG.database.host}:${TEST_CONFIG.database.port}/${TEST_CONFIG.database.database}`);
    console.log(`   Redis: ${TEST_CONFIG.redis.host}:${TEST_CONFIG.redis.port}`);
    console.log(`   API: ${TEST_CONFIG.api.baseUrl}`);
    console.log(`   Staff Portal: ${TEST_CONFIG.frontend.staffPortalUrl}`);
    console.log(`   Admin Interface: ${TEST_CONFIG.frontend.adminInterfaceUrl}`);
    console.log(`   Real Auth: ${TEST_CONFIG.auth.useRealAuth}`);
    console.log(`   Real Data: ${TEST_CONFIG.testData.useRealData}`);
    console.log(`   Mocking: DISABLED`);
}

export default TEST_CONFIG;
