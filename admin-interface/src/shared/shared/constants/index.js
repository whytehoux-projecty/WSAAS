"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDITIONAL_ERROR_CODES = exports.dwollaEnvironment = exports.countryOptions = exports.SUPPORTED_TIMEZONES = exports.SUPPORTED_COUNTRIES = exports.SUPPORTED_CURRENCIES = exports.REGEX_PATTERNS = exports.HTTP_STATUS = exports.ERROR_CODES = exports.BUSINESS_RULES = exports.EXTERNAL_SERVICES = exports.CACHE_CONFIG = exports.LOGGING_CONFIG = exports.NOTIFICATION_CONFIG = exports.SECURITY_CONFIG = exports.KYC_CONFIG = exports.WIRE_TRANSFER_CONFIG = exports.ACCOUNT_CONFIG = exports.TRANSACTION_LIMITS = exports.UPLOAD_CONFIG = exports.RATE_LIMIT_CONFIG = exports.AUTH_CONFIG = exports.DATABASE_CONFIG = exports.API_CONFIG = void 0;
exports.API_CONFIG = {
    VERSION: '1.0.0',
    BASE_PATH: '/api/v1',
    TIMEOUT: 30000,
    MAX_REQUEST_SIZE: '10mb',
    CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:3002', 'https://aurumvault.com', 'https://admin.aurumvault.com'],
};
exports.DATABASE_CONFIG = {
    CONNECTION_TIMEOUT: 10000,
    QUERY_TIMEOUT: 30000,
    MAX_CONNECTIONS: 100,
    IDLE_TIMEOUT: 30000,
};
exports.AUTH_CONFIG = {
    JWT_EXPIRES_IN: '15m',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    BCRYPT_ROUNDS: 12,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
};
exports.RATE_LIMIT_CONFIG = {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
    SKIP_SUCCESSFUL_REQUESTS: false,
    SKIP_FAILED_REQUESTS: false,
};
exports.UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    ALLOWED_MIME_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    UPLOAD_PATH: './uploads',
    TEMP_PATH: './temp',
};
exports.TRANSACTION_LIMITS = {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 1000000,
    DAILY_LIMIT: {
        CHECKING: 10000,
        SAVINGS: 5000,
        INVESTMENT: 50000,
        CREDIT: 25000,
    },
    MONTHLY_LIMIT: {
        CHECKING: 100000,
        SAVINGS: 50000,
        INVESTMENT: 500000,
        CREDIT: 250000,
    },
};
exports.ACCOUNT_CONFIG = {
    ACCOUNT_NUMBER_PREFIX: 'AV',
    ACCOUNT_NUMBER_LENGTH: 16,
    MIN_BALANCE: {
        CHECKING: 0,
        SAVINGS: 100,
        INVESTMENT: 1000,
        CREDIT: 0,
    },
    INTEREST_RATES: {
        SAVINGS: 0.025,
        INVESTMENT: 0.045,
    },
};
exports.WIRE_TRANSFER_CONFIG = {
    MIN_AMOUNT: 100,
    MAX_AMOUNT: 500000,
    DOMESTIC_FEE: 25,
    INTERNATIONAL_FEE: 45,
    PROCESSING_TIME: {
        DOMESTIC: 1,
        INTERNATIONAL: 3,
    },
    CUT_OFF_TIME: '15:00',
};
exports.KYC_CONFIG = {
    REQUIRED_DOCUMENTS: [
        'PASSPORT',
        'DRIVERS_LICENSE',
        'NATIONAL_ID',
    ],
    PROOF_OF_ADDRESS_DOCUMENTS: [
        'UTILITY_BILL',
        'BANK_STATEMENT',
    ],
    DOCUMENT_EXPIRY_DAYS: 90,
    MAX_UPLOAD_SIZE: 5 * 1024 * 1024,
    REVIEW_TIMEOUT_DAYS: 7,
};
exports.SECURITY_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_SYMBOLS: true,
    PASSWORD_HISTORY_COUNT: 5,
    TWO_FACTOR_ENABLED: false,
    SESSION_SECURITY: {
        SECURE_COOKIES: true,
        HTTP_ONLY: true,
        SAME_SITE: 'strict',
    },
};
exports.NOTIFICATION_CONFIG = {
    EMAIL_ENABLED: true,
    SMS_ENABLED: false,
    PUSH_ENABLED: false,
    BATCH_SIZE: 100,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 5000,
};
exports.LOGGING_CONFIG = {
    LEVEL: 'info',
    MAX_FILES: 10,
    MAX_SIZE: '10m',
    DATE_PATTERN: 'YYYY-MM-DD',
    AUDIT_RETENTION_DAYS: 365,
    ERROR_RETENTION_DAYS: 90,
};
exports.CACHE_CONFIG = {
    TTL: 3600,
    MAX_KEYS: 10000,
    CHECK_PERIOD: 600,
    PREFIXES: {
        USER: 'user:',
        ACCOUNT: 'account:',
        TRANSACTION: 'transaction:',
        SESSION: 'session:',
        RATE_LIMIT: 'rate_limit:',
    },
};
exports.EXTERNAL_SERVICES = {
    PLAID: {
        ENVIRONMENT: 'sandbox',
        PRODUCTS: ['transactions', 'accounts', 'identity'],
        COUNTRY_CODES: ['US', 'CA'],
    },
    DWOLLA: {
        ENVIRONMENT: 'sandbox',
        WEBHOOK_SECRET: process.env['DWOLLA_WEBHOOK_SECRET'],
    },
    SENDGRID: {
        FROM_EMAIL: 'noreply@aurumvault.com',
        FROM_NAME: 'Aurum Vault',
    },
};
exports.BUSINESS_RULES = {
    MIN_AGE: 18,
    MAX_ACCOUNTS_PER_USER: 10,
    ACCOUNT_CLOSURE_GRACE_PERIOD: 30,
    INACTIVE_ACCOUNT_THRESHOLD: 365,
    FRAUD_DETECTION: {
        MAX_DAILY_TRANSACTIONS: 50,
        LARGE_TRANSACTION_THRESHOLD: 10000,
        VELOCITY_CHECK_WINDOW: 3600,
        MAX_FAILED_ATTEMPTS: 3,
    },
};
exports.ERROR_CODES = {
    INVALID_CREDENTIALS: 'AUTH_001',
    TOKEN_EXPIRED: 'AUTH_002',
    TOKEN_INVALID: 'AUTH_003',
    ACCOUNT_LOCKED: 'AUTH_004',
    ACCOUNT_SUSPENDED: 'AUTH_005',
    VALIDATION_FAILED: 'VAL_001',
    REQUIRED_FIELD_MISSING: 'VAL_002',
    INVALID_FORMAT: 'VAL_003',
    VALUE_OUT_OF_RANGE: 'VAL_004',
    INSUFFICIENT_FUNDS: 'BIZ_001',
    DAILY_LIMIT_EXCEEDED: 'BIZ_002',
    MONTHLY_LIMIT_EXCEEDED: 'BIZ_003',
    ACCOUNT_NOT_FOUND: 'BIZ_004',
    TRANSACTION_FAILED: 'BIZ_005',
    DUPLICATE_TRANSACTION: 'BIZ_006',
    DATABASE_ERROR: 'SYS_001',
    EXTERNAL_SERVICE_ERROR: 'SYS_002',
    INTERNAL_SERVER_ERROR: 'SYS_003',
    SERVICE_UNAVAILABLE: 'SYS_004',
    FILE_TOO_LARGE: 'FILE_001',
    INVALID_FILE_TYPE: 'FILE_002',
    UPLOAD_FAILED: 'FILE_003',
    DOCUMENT_REQUIRED: 'KYC_001',
    DOCUMENT_EXPIRED: 'KYC_002',
    VERIFICATION_FAILED: 'KYC_003',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
exports.REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    ACCOUNT_NUMBER: /^AV\d{14}$/,
    SWIFT_CODE: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    IBAN: /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};
exports.SUPPORTED_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'
];
exports.SUPPORTED_COUNTRIES = [
    'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI'
];
exports.SUPPORTED_TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
];
exports.countryOptions = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "IT", label: "Italy" },
    { value: "ES", label: "Spain" },
    { value: "NL", label: "Netherlands" },
    { value: "BE", label: "Belgium" },
    { value: "AT", label: "Austria" },
    { value: "CH", label: "Switzerland" },
    { value: "SE", label: "Sweden" },
    { value: "NO", label: "Norway" },
    { value: "DK", label: "Denmark" },
    { value: "FI", label: "Finland" },
];
exports.dwollaEnvironment = process.env['DWOLLA_ENV'] || "sandbox";
exports.ADDITIONAL_ERROR_CODES = {
    USER_ALREADY_EXISTS: 'USER_001',
    USER_NOT_FOUND: 'USER_002',
    ACCOUNT_INACTIVE: 'USER_003',
    KYC_REQUIRED: 'USER_004',
    INSUFFICIENT_PERMISSIONS: 'USER_005',
    RATE_LIMIT_EXCEEDED: 'USER_006',
};
//# sourceMappingURL=index.js.map