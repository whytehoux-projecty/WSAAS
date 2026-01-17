// API Configuration
export const API_CONFIG = {
  VERSION: "1.0.0",
  BASE_PATH: "/api/v1",
  TIMEOUT: 30000,
  MAX_REQUEST_SIZE: "10mb",
  CORS_ORIGINS: [
    "http://localhost:3000",
    "http://localhost:3002",
    "https://aurumvault.com",
    "https://admin.aurumvault.com",
  ],
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 10000,
  QUERY_TIMEOUT: 30000,
  MAX_CONNECTIONS: 100,
  IDLE_TIMEOUT: 30000,
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  JWT_EXPIRES_IN: "15m",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false,
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  UPLOAD_PATH: "./uploads",
  TEMP_PATH: "./temp",
} as const;

// Transaction Limits
export const TRANSACTION_LIMITS = {
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
} as const;

// Account Configuration
export const ACCOUNT_CONFIG = {
  ACCOUNT_NUMBER_PREFIX: "AV",
  ACCOUNT_NUMBER_LENGTH: 16,
  MIN_BALANCE: {
    CHECKING: 0,
    SAVINGS: 100,
    INVESTMENT: 1000,
    CREDIT: 0,
  },
  INTEREST_RATES: {
    SAVINGS: 0.025, // 2.5%
    INVESTMENT: 0.045, // 4.5%
  },
  PREMIUM_INTEREST_RATE: 0.055, // 5.5% for premium accounts
  CHECKING_INTEREST_RATE: 0.001, // 0.1% for checking accounts
  SAVINGS_INTEREST_RATE: 0.025, // 2.5% for savings accounts
  OVERDRAFT_LIMIT: -500, // $500 overdraft limit
} as const;

// Transaction Configuration
export const TRANSACTION_CONFIG = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000,
  DEFAULT_CURRENCY: "USD",
  PROCESSING_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  BATCH_SIZE: 100,
  DAILY_LIMIT: 10000, // Default daily limit
  MONTHLY_LIMIT: 100000, // Default monthly limit
} as const;

// Wire Transfer Configuration
export const WIRE_TRANSFER_CONFIG = {
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 500000,
  DAILY_LIMIT: 100000,
  BASE_FEE: 15,
  PERCENTAGE_FEE: 0.001, // 0.1%
  DOMESTIC_FEE: 25,
  INTERNATIONAL_FEE: 45,
  FOREIGN_CURRENCY_FEE: 15,
  MAX_FEE: 100,
  DOMESTIC_PROCESSING_DAYS: 1,
  INTERNATIONAL_PROCESSING_DAYS: 3,
  PROCESSING_TIME: {
    DOMESTIC: 1, // business days
    INTERNATIONAL: 3, // business days
  },
  CUT_OFF_TIME: "15:00", // 3 PM
} as const;

// KYC Configuration
export const KYC_CONFIG = {
  REQUIRED_DOCUMENTS: ["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"],
  PROOF_OF_ADDRESS_DOCUMENTS: ["UTILITY_BILL", "BANK_STATEMENT"],
  DOCUMENT_EXPIRY_DAYS: 90,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  REVIEW_TIMEOUT_DAYS: 7,
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
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
    SAME_SITE: "strict",
  },
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  EMAIL_ENABLED: true,
  SMS_ENABLED: false,
  PUSH_ENABLED: false,
  BATCH_SIZE: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
} as const;

// Logging Configuration
export const LOGGING_CONFIG = {
  LEVEL: "info",
  MAX_FILES: 10,
  MAX_SIZE: "10m",
  DATE_PATTERN: "YYYY-MM-DD",
  AUDIT_RETENTION_DAYS: 365,
  ERROR_RETENTION_DAYS: 90,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 3600, // 1 hour
  MAX_KEYS: 10000,
  CHECK_PERIOD: 600, // 10 minutes
  PREFIXES: {
    USER: "user:",
    ACCOUNT: "account:",
    TRANSACTION: "transaction:",
    SESSION: "session:",
    RATE_LIMIT: "rate_limit:",
  },
} as const;

// External Services Configuration
export const EXTERNAL_SERVICES = {
  PLAID: {
    ENVIRONMENT: "sandbox",
    PRODUCTS: ["transactions", "accounts", "identity"],
    COUNTRY_CODES: ["US", "CA"],
  },
  DWOLLA: {
    ENVIRONMENT: "sandbox",
    WEBHOOK_SECRET: process.env["DWOLLA_WEBHOOK_SECRET"],
  },
  SENDGRID: {
    FROM_EMAIL: "noreply@aurumvault.com",
    FROM_NAME: "Aurum Vault",
  },
} as const;

// Business Rules
export const BUSINESS_RULES = {
  MIN_AGE: 18,
  MAX_ACCOUNTS_PER_USER: 10,
  ACCOUNT_CLOSURE_GRACE_PERIOD: 30, // days
  INACTIVE_ACCOUNT_THRESHOLD: 365, // days
  FRAUD_DETECTION: {
    MAX_DAILY_TRANSACTIONS: 50,
    LARGE_TRANSACTION_THRESHOLD: 10000,
    SUSPICIOUS_AMOUNT_THRESHOLD: 50000,
    VELOCITY_CHECK_WINDOW: 3600, // 1 hour
    MAX_FAILED_ATTEMPTS: 3,
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication Errors
  INVALID_CREDENTIALS: "AUTH_001",
  TOKEN_EXPIRED: "AUTH_002",
  TOKEN_INVALID: "AUTH_003",
  ACCOUNT_LOCKED: "AUTH_004",
  ACCOUNT_SUSPENDED: "AUTH_005",

  // Validation Errors
  VALIDATION_FAILED: "VAL_001",
  REQUIRED_FIELD_MISSING: "VAL_002",
  INVALID_FORMAT: "VAL_003",
  VALUE_OUT_OF_RANGE: "VAL_004",

  // Business Logic Errors
  INSUFFICIENT_FUNDS: "BIZ_001",
  DAILY_LIMIT_EXCEEDED: "BIZ_002",
  MONTHLY_LIMIT_EXCEEDED: "BIZ_003",
  ACCOUNT_NOT_FOUND: "BIZ_004",
  TRANSACTION_FAILED: "BIZ_005",
  DUPLICATE_TRANSACTION: "BIZ_006",
  TRANSACTION_NOT_FOUND: "BIZ_007",
  WIRE_TRANSFER_NOT_FOUND: "BIZ_008",

  // System Errors
  DATABASE_ERROR: "SYS_001",
  EXTERNAL_SERVICE_ERROR: "SYS_002",
  INTERNAL_SERVER_ERROR: "SYS_003",
  SERVICE_UNAVAILABLE: "SYS_004",
  RESOURCE_NOT_FOUND: "SYS_005",
  OPERATION_NOT_ALLOWED: "SYS_006",

  // File Upload Errors
  FILE_TOO_LARGE: "FILE_001",
  INVALID_FILE_TYPE: "FILE_002",
  UPLOAD_FAILED: "FILE_003",

  // KYC Errors
  DOCUMENT_REQUIRED: "KYC_001",
  DOCUMENT_EXPIRED: "KYC_002",
  VERIFICATION_FAILED: "KYC_003",

  // User Management Errors
  USER_ALREADY_EXISTS: "USER_001",
  USER_NOT_FOUND: "USER_002",
  ACCOUNT_INACTIVE: "USER_003",
  KYC_REQUIRED: "USER_004",
  INSUFFICIENT_PERMISSIONS: "USER_005",
  RATE_LIMIT_EXCEEDED: "USER_006",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
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
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  ACCOUNT_NUMBER: /^AV\d{14}$/,
  SWIFT_CODE: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  IBAN: /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Currency Codes
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "SEK",
  "NZD",
] as const;

// Country Codes
export const SUPPORTED_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "AT",
  "CH",
  "SE",
  "NO",
  "DK",
  "FI",
] as const;

// Time Zones
export const SUPPORTED_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
] as const;

// Country Options for frontend compatibility
export const countryOptions = [
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
] as const;

// External Service Environment Configuration
export const dwollaEnvironment: string = process.env["DWOLLA_ENV"] || "sandbox";

// Additional Error Codes
export const ADDITIONAL_ERROR_CODES = {
  // User Management
  USER_ALREADY_EXISTS: "USER_001",
  USER_NOT_FOUND: "USER_002",
  ACCOUNT_INACTIVE: "USER_003",
  KYC_REQUIRED: "USER_004",
  INSUFFICIENT_PERMISSIONS: "USER_005",
  RATE_LIMIT_EXCEEDED: "USER_006",
} as const;
