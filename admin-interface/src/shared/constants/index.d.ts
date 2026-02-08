export declare const API_CONFIG: {
    readonly VERSION: "1.0.0";
    readonly BASE_PATH: "/api/v1";
    readonly TIMEOUT: 30000;
    readonly MAX_REQUEST_SIZE: "10mb";
    readonly CORS_ORIGINS: readonly ["http://localhost:3000", "http://localhost:3002", "https://aurumvault.com", "https://admin.aurumvault.com"];
};
export declare const DATABASE_CONFIG: {
    readonly CONNECTION_TIMEOUT: 10000;
    readonly QUERY_TIMEOUT: 30000;
    readonly MAX_CONNECTIONS: 100;
    readonly IDLE_TIMEOUT: 30000;
};
export declare const AUTH_CONFIG: {
    readonly JWT_EXPIRES_IN: "15m";
    readonly REFRESH_TOKEN_EXPIRES_IN: "7d";
    readonly BCRYPT_ROUNDS: 12;
    readonly MAX_LOGIN_ATTEMPTS: 5;
    readonly LOCKOUT_DURATION: number;
    readonly SESSION_TIMEOUT: number;
};
export declare const RATE_LIMIT_CONFIG: {
    readonly WINDOW_MS: number;
    readonly MAX_REQUESTS: 100;
    readonly SKIP_SUCCESSFUL_REQUESTS: false;
    readonly SKIP_FAILED_REQUESTS: false;
};
export declare const UPLOAD_CONFIG: {
    readonly MAX_FILE_SIZE: number;
    readonly ALLOWED_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    readonly UPLOAD_PATH: "./uploads";
    readonly TEMP_PATH: "./temp";
};
export declare const TRANSACTION_LIMITS: {
    readonly MIN_AMOUNT: 0.01;
    readonly MAX_AMOUNT: 1000000;
    readonly DAILY_LIMIT: {
        readonly CHECKING: 10000;
        readonly SAVINGS: 5000;
        readonly INVESTMENT: 50000;
        readonly CREDIT: 25000;
    };
    readonly MONTHLY_LIMIT: {
        readonly CHECKING: 100000;
        readonly SAVINGS: 50000;
        readonly INVESTMENT: 500000;
        readonly CREDIT: 250000;
    };
};
export declare const ACCOUNT_CONFIG: {
    readonly ACCOUNT_NUMBER_PREFIX: "AV";
    readonly ACCOUNT_NUMBER_LENGTH: 16;
    readonly MIN_BALANCE: {
        readonly CHECKING: 0;
        readonly SAVINGS: 100;
        readonly INVESTMENT: 1000;
        readonly CREDIT: 0;
    };
    readonly INTEREST_RATES: {
        readonly SAVINGS: 0.025;
        readonly INVESTMENT: 0.045;
    };
};
export declare const WIRE_TRANSFER_CONFIG: {
    readonly MIN_AMOUNT: 100;
    readonly MAX_AMOUNT: 500000;
    readonly DOMESTIC_FEE: 25;
    readonly INTERNATIONAL_FEE: 45;
    readonly PROCESSING_TIME: {
        readonly DOMESTIC: 1;
        readonly INTERNATIONAL: 3;
    };
    readonly CUT_OFF_TIME: "15:00";
};
export declare const KYC_CONFIG: {
    readonly REQUIRED_DOCUMENTS: readonly ["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"];
    readonly PROOF_OF_ADDRESS_DOCUMENTS: readonly ["UTILITY_BILL", "BANK_STATEMENT"];
    readonly DOCUMENT_EXPIRY_DAYS: 90;
    readonly MAX_UPLOAD_SIZE: number;
    readonly REVIEW_TIMEOUT_DAYS: 7;
};
export declare const SECURITY_CONFIG: {
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly PASSWORD_REQUIRE_UPPERCASE: true;
    readonly PASSWORD_REQUIRE_LOWERCASE: true;
    readonly PASSWORD_REQUIRE_NUMBERS: true;
    readonly PASSWORD_REQUIRE_SYMBOLS: true;
    readonly PASSWORD_HISTORY_COUNT: 5;
    readonly TWO_FACTOR_ENABLED: false;
    readonly SESSION_SECURITY: {
        readonly SECURE_COOKIES: true;
        readonly HTTP_ONLY: true;
        readonly SAME_SITE: "strict";
    };
};
export declare const NOTIFICATION_CONFIG: {
    readonly EMAIL_ENABLED: true;
    readonly SMS_ENABLED: false;
    readonly PUSH_ENABLED: false;
    readonly BATCH_SIZE: 100;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 5000;
};
export declare const LOGGING_CONFIG: {
    readonly LEVEL: "info";
    readonly MAX_FILES: 10;
    readonly MAX_SIZE: "10m";
    readonly DATE_PATTERN: "YYYY-MM-DD";
    readonly AUDIT_RETENTION_DAYS: 365;
    readonly ERROR_RETENTION_DAYS: 90;
};
export declare const CACHE_CONFIG: {
    readonly TTL: 3600;
    readonly MAX_KEYS: 10000;
    readonly CHECK_PERIOD: 600;
    readonly PREFIXES: {
        readonly USER: "user:";
        readonly ACCOUNT: "account:";
        readonly TRANSACTION: "transaction:";
        readonly SESSION: "session:";
        readonly RATE_LIMIT: "rate_limit:";
    };
};
export declare const EXTERNAL_SERVICES: {
    readonly PLAID: {
        readonly ENVIRONMENT: "sandbox";
        readonly PRODUCTS: readonly ["transactions", "accounts", "identity"];
        readonly COUNTRY_CODES: readonly ["US", "CA"];
    };
    readonly DWOLLA: {
        readonly ENVIRONMENT: "sandbox";
        readonly WEBHOOK_SECRET: string | undefined;
    };
    readonly SENDGRID: {
        readonly FROM_EMAIL: "noreply@aurumvault.com";
        readonly FROM_NAME: "Aurum Vault";
    };
};
export declare const BUSINESS_RULES: {
    readonly MIN_AGE: 18;
    readonly MAX_ACCOUNTS_PER_USER: 10;
    readonly ACCOUNT_CLOSURE_GRACE_PERIOD: 30;
    readonly INACTIVE_ACCOUNT_THRESHOLD: 365;
    readonly FRAUD_DETECTION: {
        readonly MAX_DAILY_TRANSACTIONS: 50;
        readonly LARGE_TRANSACTION_THRESHOLD: 10000;
        readonly VELOCITY_CHECK_WINDOW: 3600;
        readonly MAX_FAILED_ATTEMPTS: 3;
    };
};
export declare const ERROR_CODES: {
    readonly INVALID_CREDENTIALS: "AUTH_001";
    readonly TOKEN_EXPIRED: "AUTH_002";
    readonly TOKEN_INVALID: "AUTH_003";
    readonly ACCOUNT_LOCKED: "AUTH_004";
    readonly ACCOUNT_SUSPENDED: "AUTH_005";
    readonly VALIDATION_FAILED: "VAL_001";
    readonly REQUIRED_FIELD_MISSING: "VAL_002";
    readonly INVALID_FORMAT: "VAL_003";
    readonly VALUE_OUT_OF_RANGE: "VAL_004";
    readonly INSUFFICIENT_FUNDS: "BIZ_001";
    readonly DAILY_LIMIT_EXCEEDED: "BIZ_002";
    readonly MONTHLY_LIMIT_EXCEEDED: "BIZ_003";
    readonly ACCOUNT_NOT_FOUND: "BIZ_004";
    readonly TRANSACTION_FAILED: "BIZ_005";
    readonly DUPLICATE_TRANSACTION: "BIZ_006";
    readonly DATABASE_ERROR: "SYS_001";
    readonly EXTERNAL_SERVICE_ERROR: "SYS_002";
    readonly INTERNAL_SERVER_ERROR: "SYS_003";
    readonly SERVICE_UNAVAILABLE: "SYS_004";
    readonly FILE_TOO_LARGE: "FILE_001";
    readonly INVALID_FILE_TYPE: "FILE_002";
    readonly UPLOAD_FAILED: "FILE_003";
    readonly DOCUMENT_REQUIRED: "KYC_001";
    readonly DOCUMENT_EXPIRED: "KYC_002";
    readonly VERIFICATION_FAILED: "KYC_003";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const REGEX_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PHONE: RegExp;
    readonly ACCOUNT_NUMBER: RegExp;
    readonly SWIFT_CODE: RegExp;
    readonly IBAN: RegExp;
    readonly PASSWORD: RegExp;
};
export declare const SUPPORTED_CURRENCIES: readonly ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "SEK", "NZD"];
export declare const SUPPORTED_COUNTRIES: readonly ["US", "CA", "GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "NO", "DK", "FI"];
export declare const SUPPORTED_TIMEZONES: readonly ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney"];
export declare const countryOptions: readonly [{
    readonly value: "US";
    readonly label: "United States";
}, {
    readonly value: "CA";
    readonly label: "Canada";
}, {
    readonly value: "GB";
    readonly label: "United Kingdom";
}, {
    readonly value: "AU";
    readonly label: "Australia";
}, {
    readonly value: "DE";
    readonly label: "Germany";
}, {
    readonly value: "FR";
    readonly label: "France";
}, {
    readonly value: "IT";
    readonly label: "Italy";
}, {
    readonly value: "ES";
    readonly label: "Spain";
}, {
    readonly value: "NL";
    readonly label: "Netherlands";
}, {
    readonly value: "BE";
    readonly label: "Belgium";
}, {
    readonly value: "AT";
    readonly label: "Austria";
}, {
    readonly value: "CH";
    readonly label: "Switzerland";
}, {
    readonly value: "SE";
    readonly label: "Sweden";
}, {
    readonly value: "NO";
    readonly label: "Norway";
}, {
    readonly value: "DK";
    readonly label: "Denmark";
}, {
    readonly value: "FI";
    readonly label: "Finland";
}];
export declare const dwollaEnvironment: string;
export declare const ADDITIONAL_ERROR_CODES: {
    readonly USER_ALREADY_EXISTS: "USER_001";
    readonly USER_NOT_FOUND: "USER_002";
    readonly ACCOUNT_INACTIVE: "USER_003";
    readonly KYC_REQUIRED: "USER_004";
    readonly INSUFFICIENT_PERMISSIONS: "USER_005";
    readonly RATE_LIMIT_EXCEEDED: "USER_006";
};
//# sourceMappingURL=index.d.ts.map